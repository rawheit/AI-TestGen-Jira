import React, { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import { Button, Form } from "react-bootstrap";
import axios from "../axios";
import { isAxiosError } from 'axios';

// Types definition
interface FormData {
  xrayClientId: string;
  xrayClientSecret: string;
}

interface AuthenticateResponse {
  token: string;
}

interface AuthenticatePayload {
  client_id: string;
  client_secret: string;
}

interface APIErrorResponse {
  error: string;
}

interface XRayAuth {
  attempted: boolean;  // Indicates if an authentication attempt was made
  authed: boolean;     // Indicates if the authentication was successful
}

export const XrayForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ xrayClientId: "", xrayClientSecret: "" });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [xRayAuth, setXRayAuth] = useState<XRayAuth>({ attempted: false, authed: false });
  const [cookiePresent, setCookiePresent] = useState<boolean>(false);

  useEffect(() => {
    // Check if the cookie is present on page load
    const cookieValue = Cookies.get('xray');
    setCookiePresent(!!cookieValue);  // Using !! to convert truthy/falsy to boolean
  }, [cookiePresent]);

  // Handle form field changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    Cookies.remove("xray")
    setCookiePresent(false)
    
    event.preventDefault();
    setIsSubmitting(true);
    const payload: AuthenticatePayload = {
      client_id: formData.xrayClientId,
      client_secret: formData.xrayClientSecret
    };

    try {
      const response = await axios.post<AuthenticateResponse>(
        "/authenticate-xray",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200 && response.data.token) {
        Cookies.set("xray", response.data.token, { expires: 7 }); // setting cookie for 7 days
        setXRayAuth({ attempted: true, authed: true });
        setCookiePresent(true)
      } else {
        setXRayAuth({ attempted: true, authed: false });
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error:any) {
      setXRayAuth({ attempted: true, authed: false });
      if (isAxiosError(error) && error.response) {
        const serverError = error.response.data as APIErrorResponse;
        console.error("API Error:", serverError.error);
      } else {
        console.error("Error:", error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h3 className="mb-4 form-heading">XRay Auth Data</h3>
      {cookiePresent && <h6 className="datapresent-text">Authenticated</h6>}
      {!xRayAuth.authed && xRayAuth.attempted && <h6 style={{color: "red"}}>Wrong Creds</h6>}
      <Form.Group className="mb-3" controlId="xrayClientId">
        <Form.Control
          type="text"
          placeholder="Client ID"
          name="xrayClientId"
          value={formData.xrayClientId}
          onChange={handleInputChange}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="xrayClientSecret">
        <Form.Control
          type="password"
          placeholder="Client Secret"
          name="xrayClientSecret"
          value={formData.xrayClientSecret}
          onChange={handleInputChange}
        />
      </Form.Group>
      <Button className="ml-5" type="submit" disabled={isSubmitting}>
        Authenticate
      </Button>
    </Form>
  );
};
