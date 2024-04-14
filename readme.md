# Flask + React Application Setup

This guide provides instructions for setting up and running a combined Flask and React development environment on your local machine. The setup scripts are designed to simplify the process of installing dependencies, configuring the environment, and launching both servers.

## Prerequisites

Before you begin, ensure you have the following installed on your system:
- **Python 3.8+**
- **Node.js** and **npm**
- **Git** (optional, if cloning the repo)

## Project Structure

This project consists of two main directories:
- `backend/`: Contains the Flask application.
- `frontend/`: Contains the React application.

## Setup Instructions

### 1. Clone the Repository (Optional)

Clone the project repository using Git:

```bash
git clone https://github.com/GoldenGuts/testcase-generator
cd testcase-generator
```

### 2. Configuration

Before running the scripts, configure the environment variables and specify the ports used by the servers.

#### Environment Variables

Create a `.env` file in the `backend` directory with the following content:

```plaintext
SECRET_KEY=your_secret_key_here
JIRA_ENDPOINT=https://your-jira-instance.atlassian.net
API_TYPE=openai
API_VERSION=v1
API_BASE=https://api.openai.com
```

Replace `your_secret_key_here` and the JIRA endpoint URL with your actual data.

#### Editing Script Variables

Edit the script files (`run_app.bat` for Windows or `run_app.zsh` for macOS/Linux) to change the default ports:

For Windows (`run_app.bat`):

```bat
set REACT_PORT=3006
set FLASK_PORT=5006
```

For macOS/Linux (`run_app.zsh`):

```zsh
REACT_PORT=3006
FLASK_PORT=5006
```

### 3. Running the Application

#### Windows

Execute the batch file to set up the environment and start both servers:

```bash
./run_app.bat
```

#### macOS/Linux

Make the script executable and run it:

```bash
chmod +x run_app.zsh
./run_app.zsh
```

## Accessing the Application

Once both servers are up:
- The Flask API will be available at [http://localhost:5006](http://localhost:5006)
- The React frontend will be accessible at [http://localhost:3006](http://localhost:3006), and it should automatically open in your default web browser.

## Additional Information

- To add more environment variables, simply include them in the `.env` file or export them in the scripts before starting the servers.
- Ensure all paths and variable names are correctly set according to your local setup and environment configuration.
