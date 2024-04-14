import React, { useState, useEffect } from "react";
import { Accordion, Card, Table } from "react-bootstrap";

interface Step {
  action: string;
  data?: string;
  result: string;
}

interface TestCase {
  summary: string;
  steps: Step[];
}

interface TestCasesAccordionProps {
  testCases: TestCase[];
}

const TestCasesAccordion: React.FC<TestCasesAccordionProps> = ({
  testCases,
}) => {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    const content = document.querySelector(".main-content") as HTMLElement;
    if (content) {
      if (activeKey) {
        content.style.backgroundColor = "white";
      } else {
        content.style.backgroundColor = "";
      }
    }
  }, [activeKey]); // Effect runs on change of activeKey

  return (
    <Accordion
      defaultActiveKey="0"
      activeKey={activeKey}
      onSelect={(newKey) =>
        setActiveKey(
          // @ts-ignore: already verifying before
          newKey === activeKey || typeof newKey === "undefined" ? null : newKey
        )
      }
    >
      {testCases.map((testCase, index) => (
        <Card key={index}>
          <Accordion.Item eventKey={`${index}`}>
            <Accordion.Header>{testCase.summary}</Accordion.Header>
            <Accordion.Body>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Action</th>
                    <th>Data</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {testCase.steps.map((step, stepIndex) => (
                    <tr key={stepIndex}>
                      <td>{stepIndex + 1}</td>
                      <td>{step.action}</td>
                      <td>{step.data || "N/A"}</td>
                      <td>{step.result}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Accordion.Body>
          </Accordion.Item>
        </Card>
      ))}
    </Accordion>
  );
};

export default TestCasesAccordion;
