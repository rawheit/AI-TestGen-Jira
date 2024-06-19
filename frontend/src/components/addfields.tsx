import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import Cookies from "js-cookie";
import axios from "../axios";
import { useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";

interface FormData {
  component: string;
  label: Array<string>;
}

const XRayFields: React.FC = () => {
  const navigate = useNavigate();
  const xrayTestKeys: string[] =
    localStorage.getItem("xray_test_keys")?.split(",") ?? [];

  const [formData, setFormData] = useState<FormData>({
    component: "",
    label: [],
  });
  const [isLoading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!Cookies.get("jira")) {
      console.error("OpenAI or Jira Data is not present!");
      return; // Exit early if the cookie is not present
    }

    setLoading(true);

    // Prepare all fetch promises
    const promises = xrayTestKeys.map((key) => {
      return axios.post(
        "/add_fields",
        { key, label: formData.label, component: formData.component },
        { headers: { Authorization: `Bearer ${Cookies.get("jira")}` } }
      );
    });

    try {
      const responses = await Promise.all(promises); // Wait for all requests to finish
      responses.forEach((response) => {
        console.log("Added successfully:", response.data);
      });
      navigate("/success");
    } catch (error) {
      console.error("Operation failed:", error);
    } finally {
      setFormData({ component: "", label: [] });
      setLoading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div>
      <h3>Successfully created test cases in Jira {isLoading ? <ClipLoader color="#36d7b7" /> : null}</h3>
      <ul>
        {xrayTestKeys.map((key, index) => (
          <li key={index}>{key}</li>
        ))}
      </ul>
      <div>
        Add your component and label (only existing component will work)
      </div>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" >
          <Form.Control
            type="text"
            placeholder="Component"
            name="component"
            value={formData.component}
            onChange={handleInputChange}
          />
        </Form.Group>
        <Form.Group className="mb-3" >
          <Form.Control
            type="text"
            placeholder="Label"
            name="label"
            value={formData.label}
            onChange={handleInputChange}
          />
        </Form.Group>

        <Button className="ml-5" type="submit" disabled={isLoading}>
          Add
        </Button>
        
      </Form>
    </div>
  );
};

export default XRayFields;
