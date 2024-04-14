/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import axios from "../axios";
import { XrayForm } from "./xrayForm";
import "./settings.css";
import Cookies from 'js-cookie';

interface SettingsProps { }

const Settings: React.FC<SettingsProps> = () => {
    // Define the type of data to be submitted
    interface FormData {
        jira_email: string;
        jira_token: string;
        openai_api_key: string;
    }

    const [formData, setFormData] = useState<FormData>({
        jira_email: "",
        jira_token: "",
        openai_api_key: "",
    });
    const [cookiePresent, setCookiePresent] = useState(false);
    useEffect(() => {
        // Check if the cookie is present on page load
        const cookieValue = Cookies.get('jiraOpenAi');
        setCookiePresent(cookieValue !== undefined);
    }, [cookiePresent]);
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
        try {
            console.log(formData);
            const response = await axios.post<any>(
                "/authenticate",
                formData // Send the entire formData object
            );
            // setResponse(response.data); // Update response state (optional)
            console.log("Success! Response:", response.data); // Log response for debugging
            Cookies.set('jiraOpenAi', response.data.jwt, { expires: 1 });
            setCookiePresent(true)
        } catch (error) {
            console.error("Error:", error);
            // Handle errors appropriately (e.g., display error message to the user)
        }
    };

    return (
        <div className="settings">
            <Container>
                <Row>
                    <Col>
                        <Form onSubmit={handleSubmit}>
                            <h3>OpenAI & Jira Auth Data</h3>
                            {cookiePresent ? <h6 className="datapresent-text">Data Present</h6> : null}

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
                            <Form.Group
                                className="mb-3"
                                controlId="exampleForm.ControlInput1"
                            >
                                <Form.Control
                                    type="text"
                                    placeholder="OpenAI API Key"
                                    name="openai_api_key"
                                    value={formData.openai_api_key}
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
