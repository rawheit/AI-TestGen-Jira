import React, { useState } from "react";
import axios from "../axios";
import { Button, Form } from "react-bootstrap";
import Cookies from 'js-cookie';
import ClipLoader from "react-spinners/ClipLoader";
import { useNavigate } from 'react-router-dom';

interface Props {
  // text: string; // Define the prop type as string
}

const Home: React.FC<Props> = () => {
  const navigate = useNavigate();
  interface FormData {
    jira_issue_id: string;
  }



  const [formData, setFormData] = useState<FormData>({
    jira_issue_id: "",
  });
  const [isLoading, setLoading] = useState<boolean>(false)
  // State for response from the backend (optional)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const [response, setResponse] = useState<any>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("handleSubmit called!");
    setLoading(true)
    try {
      console.log(formData);
      const response = await axios.post<unknown>(
        "/get_test_cases",
        {
          "issue_id": [formData.jira_issue_id]
        }, {
        headers: {
          'Authorization': `Bearer ${Cookies.get("jira")}`
        }
      }
      );

      console.log("Success! Response:", response.data); 
      localStorage.setItem('testcases', response.data as string);
      localStorage.setItem('jira_issue_id', formData.jira_issue_id);

      navigate('/testcases');
    } catch (error) {
      console.error("Error:", error);
      // Handle errors appropriately (e.g., display error message to the user)
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
        <Form.Label>Enter Jira Issue ID {isLoading ? <ClipLoader size={20} color="#36d7b7" /> : null} </Form.Label>
        <Form.Control
          type="text"
          placeholder="key-id"
          name="jira_issue_id"
          value={formData.jira_issue_id}
          onChange={handleInputChange}
        />
      </Form.Group>

      <Button className="ml-5 mr-5" type="submit" disabled={isLoading}>
        Get Test Cases
      </Button>

    </Form>
  );
};

export default Home;
