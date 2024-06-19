/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row, Alert } from "react-bootstrap";
import axios from "../axios";
import { XrayForm } from "./xrayForm";
import "./settings.css";
import Cookies from "js-cookie";
import { isAxiosError } from "axios";

interface SettingsProps {}

const Settings: React.FC<SettingsProps> = () => {
  interface FormData {
    jira_email: string;
    jira_token: string;
  }

  const [formData, setFormData] = useState<FormData>({
    jira_email: "",
    jira_token: "",
  });
  const [cookiePresent, setCookiePresent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (localStorage.getItem("jira_user") !== null) {
      setDisplayName(localStorage.getItem("jira_user") as string);
    }
  }, []); 

  useEffect(() => {
    const cookieValue = Cookies.get("jira");
    setCookiePresent(cookieValue !== undefined);
  }, [cookiePresent]);


  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      console.log(formData);
      const response = await axios.post<any>(
        "/authenticate",
        formData // Send the entire formData object
      );
      // setResponse(response.data); // Update response state (optional)
      console.log("Success! Response:", response.data); // Log response for debugging
      Cookies.set("jira", response.data.jwt, { expires: 7 });
      localStorage.setItem("jira_user", response.data.user);
      setDisplayName(response.data.user);
      setCookiePresent(true);
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        setError("Authentication failed, wrong creds");
        setCookiePresent(false);
      } else {
        setError("An unknown error occurred");
        setCookiePresent(false);
      }
    }
  };

  return (
    <div className="settings">
      <Container>
        <Row>
          <Col>
            <Form onSubmit={handleSubmit}>
              <h3 className="mb-4 form-heading">Jira Auth Data</h3>
              {cookiePresent ? (
                <h6 className="datapresent-text">
                  Authenticated as: {displayName}
                </h6>
              ) : (
                <h6 style={{color:"red"}}>Not Authenticated</h6>
              )}
              {error && <Alert variant="danger">{error}</Alert>}

              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlInput1"
              >
                <Form.Control
                  type="text"
                  placeholder="JIRA Token"
                  name="jira_token"
                  value={formData.jira_token}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlInput1"
              >
                <Form.Control
                  type="email"
                  placeholder="JIRA Email"
                  name="jira_email"
                  value={formData.jira_email}
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Button className="ml-5" type="submit">
                Authenticate
              </Button>
            </Form>
          </Col>
          <Col>
            <XrayForm></XrayForm>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Settings;
