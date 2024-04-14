/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import axios from "../axios";
import Cookies from "js-cookie";
import "./testcases.css";
import TestCasesAccordionWrapper from './testcasesaccordianwrapper'
import ClipLoader from "react-spinners/ClipLoader";
import { useNavigate } from 'react-router-dom';
interface TestCasesProps { }

const TestCases: React.FC<TestCasesProps> = () => {
  const navigate = useNavigate();
  const [inputMode, setInputMode] = useState<string>(""); // '' | 'confirm' | 'prompt'
  const [inputValue, setInputValue] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLodding, setLoading] = useState<boolean>(false);

  const handleButtonClick = (mode: "confirm" | "prompt") => {
    setInputMode(mode);
  };

  const handleBack = () => {
    setInputMode("")
  }

  // inputValue is nothing but XRay Test Set
  const handleAdd = async () => {
    console.log("Adding:", inputValue);
    if (!Cookies.get("xray"))
      console.error("XRay is not authorized!")
    setIsSubmitting(true);
    setLoading(true);
    try {
      const response = await axios.post(
        "/post_test_cases",
        {
          "xray_test_sets": inputValue,
          "testcase_data": localStorage.getItem("testcases"),
          "jira_issue_id": localStorage.getItem("jira_issue_id")
        },
        { headers: { Authorization: `Bearer ${Cookies.get("xray")}` } }
      );
      console.log("Added successfully:", response.data);
      localStorage.setItem("xray_test_keys", response.data)
      navigate('/add-fields');
    } catch (error) {
      console.error("Operation failed:", error);
    } finally {
      setIsSubmitting(false);
      setInputMode("");
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    let formData
    if (userPrompt == "") {
      formData = { "issue_id": [localStorage.getItem("jira_issue_id")] }
    } else {
      formData = { user_prompt: userPrompt, "issue_id": [localStorage.getItem("jira_issue_id")] }
    }
    setIsSubmitting(true);
    setLoading(true);
    try {
      const response = await axios.post(
        "/get_test_cases",
        formData, // Using the last user prompt if available
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("jiraOpenAi")}`
          }
        }
      );
      console.log("Regenerated successfully:", response.data);
      localStorage.setItem('testcases', JSON.stringify(response.data, null, 2));
      setUserPrompt(""); // Clear input after use
    } catch (error) {
      console.error("Regeneration failed:", error);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  // const testJson = { test: "test", id: "SCS-66" };
  const jiraIssueId = localStorage.getItem("jira_issue_id")

  const BackButton: React.FC = () => {
    return (
      <>
        {(inputMode.length > 1) && <i className="fa-solid fa-arrow-left" onClick={handleBack} style={{}}> Back</i>}
        
      </>
    )
  }

  return (
    <div>
      <h4>Test Cases for {jiraIssueId} {isLodding && <ClipLoader color="#36d7b7" size={20} />} </h4>
      {/* <DisplayJsonComponent jsonData={parsedJSON} /> */}
      <TestCasesAccordionWrapper />
      <div className="button-container pt-3">
        {inputMode === "" && (
          <>
            <Button
              className="button"
              type="button"
              disabled={isSubmitting}
              onClick={handleRegenerate}
            >
              Regenerate
            </Button>

            <Button
              className="button"
              type="button"
              disabled={isSubmitting}
              onClick={() => handleButtonClick("confirm")}
            >
              Confirm
            </Button>

            <Button
              className="button"
              type="button"
              disabled={isSubmitting}
              onClick={() => handleButtonClick("prompt")}
            >
              Add to User Prompt
            </Button>
          </>
        )}
        {inputMode === "confirm" && (
          <div className="form-group">
            <Form.Control
              className="form-control"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter XRAY Test Sets"
            />
            <Button
              className="button"
              onClick={handleAdd}
              type="button"
              disabled={isSubmitting}
            >
              Post to Jira
            </Button>
          </div>
        )}

        {inputMode === "prompt" && (
          <div className="form-group">
            <Form.Control
              className="form-control"
              type="text"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Enter your prompt"
            />
            <Button
              className="button"
              onClick={handleRegenerate}
              type="button"
              disabled={isSubmitting}
            >
              Regenerate
            </Button>

          </div>

        )}
      </div>
      <BackButton />
    </div>
  );
};

export default TestCases;
