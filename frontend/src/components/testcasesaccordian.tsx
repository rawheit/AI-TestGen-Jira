import React, { useState, useEffect } from "react";
import { Accordion, Card, Table, Button } from "react-bootstrap";

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

const TestCasesAccordion: React.FC<TestCasesAccordionProps> = ({ testCases }) => {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [testCasesData, setTestCasesData] = useState<TestCase[]>(testCases);

  useEffect(() => {
    localStorage.setItem("uptc", JSON.stringify(testCasesData));
  }, [testCasesData]);

  const handleDelete = (index: number, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();  // This prevents the accordion from toggling when the delete button is clicked
    const filteredTestCases = testCasesData.filter((_item, idx) => idx !== index);
    setTestCasesData(filteredTestCases);
  }

  const handleUpdate = (index: number, stepIndex: number, field: keyof Step, value: string) => {
    const updatedTestCases = [...testCasesData];
    updatedTestCases[index].steps[stepIndex][field] = value;
    setTestCasesData(updatedTestCases);
  }

  return (
    <Accordion activeKey={activeKey} onSelect={(newKey) => setActiveKey(newKey)}>
      {testCasesData.map((testCase, index) => (
        <Card key={index}>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <Accordion.Header
              onClick={() => setActiveKey(activeKey === `${index}` ? null : `${index}`)}
              style={{ flex: 1, cursor: 'pointer' }}
            >
              {testCase.summary}
            </Accordion.Header>
            <Button variant="outline-danger" size="sm" onClick={(e) => handleDelete(index, e)}>
              <i className="fa-solid fa-trash"></i>
            </Button>
          </Card.Header>
          <Accordion.Collapse eventKey={`${index}`}>
            <Card.Body>
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
                      <td
                        contentEditable={true}
                        onBlur={(e) => handleUpdate(index, stepIndex, 'action', e.target.textContent || "")}
                      >
                        {step.action}
                      </td>
                      <td
                        contentEditable={true}
                        onBlur={(e) => handleUpdate(index, stepIndex, 'data', e.target.textContent || "")}
                      >
                        {step.data || "N/A"}
                      </td>
                      <td
                        contentEditable={true}
                        onBlur={(e) => handleUpdate(index, stepIndex, 'result', e.target.textContent || "")}
                      >
                        {step.result}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      ))}
    </Accordion>
  );
};

export default TestCasesAccordion;