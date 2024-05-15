import React from "react";
import { Navbar, Nav, OverlayTrigger, Tooltip } from "react-bootstrap";
import Cookies from "js-cookie";
import "./blank.css";

interface BlankLayoutProps {
  children: React.ReactNode;
}
const getTooltipMessage = () => {
  const xrayExists = Cookies.get("xray");
  const jiraOpenAiExists = Cookies.get("jiraOpenAi");

  if (xrayExists && jiraOpenAiExists) {
    return "All Authenticated";
  } else if (xrayExists) {
    return "Jira & OpenAI data unavailable";
  } else if (jiraOpenAiExists) {
    return "XRay unauthorized";
  } else {
    return "No authentication yet";
  }
};

const BlankLayout: React.FC<BlankLayoutProps> = ({ children }) => {

  return (
    <div className="blank-layout">
      <Navbar bg="white" expand="lg" className="custom-navbar">
        {/* Logo on the left */}
        <Navbar.Brand href="/">
          <img src="/logo.webp" alt="Logo for Litera" className="navbar-logo" />
        </Navbar.Brand>

        {/* Center - navbar icons */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto mr-auto">
            <Nav.Link href="/">
              <i className="fa-solid fa-house"></i>
            </Nav.Link>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="tooltip-settings">{getTooltipMessage()}</Tooltip>}
            >
              <Nav.Link href="/settings">
                <i
                  className={`fas fa-cog ${
                    Cookies.get("xray") || Cookies.get("jiraOpenAi") ? "green-icon" : ""
                  }`}
                ></i>
              </Nav.Link>
            </OverlayTrigger>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      {/* Main content area */}
      <div className="main-content">{children}</div>
    </div>
  );
};

export default BlankLayout;
