import requests
import json
import time
import os
from dotenv import load_dotenv
from jira import JIRA

load_dotenv()

# Constants
BASE_URL = "https://xray.cloud.getxray.app/api/v1"
JSON_FILE_PATH = "result.json"
CLIENT_ID = os.getenv('xray_client_id')
CLIENT_SECRET = os.getenv('xray_client_secret')
COMPONENT_NAME = 'General'
LABEL_NAME = 'GenAi_testcase'
AUTH_TOKEN_FILE = "auth_token.json"

class XrayImport:
        
    # loading whatevere we got from openai
    def load_json_data(self, file_path):
        print("Loading test case data...")
        with open(file_path, 'r') as file:
            return json.load(file)

    def format_test_cases(self, json_data, jira_issue_id, xray_test_sets):
        print("Formatting test cases...")
        template = {
            "testtype": "Manual",
            "fields": {
                "project": {"key": "BP"}
            },
            "update": {
                "issuelinks": [
                    {
                        "add": {
                            "type": {"name": "Test"},
                            "outwardIssue": {"key": jira_issue_id}
                        }
                    }
                ]
            },
            "xray_test_sets": [xray_test_sets]
        }
        
        return [
            {**template, "fields": {**template["fields"], "summary": test_case["summary"]}, "steps": test_case["steps"]}
            for test_case in json_data
        ]

    # xray
    
    # will do in frontend
    
    def authenticate(self, client_id, secret):
        print("Authenticating with Xray...")
        payload = {"client_id": client_id, "client_secret": secret}
        headers = {"Content-Type": "application/json"}
        response = requests.post(f"{BASE_URL}/authenticate", json=payload, headers=headers)

        if response.status_code == 200:
            auth_token = response.json()  # Assuming the token is in the 'auth_token' field
            if auth_token:
                print("Auth token generated and saved.")
                return {"status": 200, "data": auth_token}
            else:
                print("Authentication succeeded but no token was returned.")
                return {"status": 200, "error": "Authentication succeeded but no token was returned."}
        else:
            print("Authentication failed with status:", response.status_code)
            return {"status": response.status_code, "error": "Authentication failed."}


    def post_test_cases(self, auth_token, test_cases):
        print("Posting test cases to Xray...")
        print(test_cases)
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {auth_token}"
        }
        response = requests.post(BASE_URL + "/import/test/bulk", json=test_cases, headers=headers)
        response.raise_for_status()
        
        print("Test cases posted successfully.")
        return response.json()["jobId"]

    def get_job_keys(self, auth_token, job_id):
        print("Polling for job completion...")
        headers = {"Authorization": f"Bearer {auth_token}"}
        while True:
            response = requests.get(BASE_URL + f"/import/test/bulk/{job_id}/status", headers=headers)
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'successful':
                    print("Job completed successfully.")
                    return [issue['key'] for issue in data['result']['issues']]
            time.sleep(5) 

    def add_fields(self, issue_key, component, labels):
        print(f"Updating JIRA issue {issue_key} with component '{component}' and label '{labels}'...")
        jiraOptions = {'server': self.server}
        user_email = self.email
        jira_token = self.token
        jira = JIRA(options=jiraOptions, basic_auth=(user_email, jira_token))

        new_components = [{'name': component}]
        
        issue = jira.issue(issue_key)

        issue.update(fields={'components': new_components})

        current_labels = issue.fields.labels
        for label in labels:
            if label not in current_labels:
                current_labels.append(label)
                issue.update(fields={"labels": current_labels})
        
        print(f"JIRA issue {issue_key} setting to In Progress...")
        jira.transition_issue(issue_key, 51)
        print(f"JIRA issue {issue_key} updated.")
        

    # if __name__ == '__main__':
    #     auth_token = authenticate()
    #     json_data = load_json_data(JSON_FILE_PATH)
    #     formatted_data = format_test_cases(json_data)
    #     job_id = post_test_cases(auth_token, formatted_data)
    #     keys = get_job_keys(auth_token, job_id)
    #     for key in keys:
    #         add_fields(key, COMPONENT_NAME, LABEL_NAME)
    #     add_fields("BP-3536", COMPONENT_NAME, LABEL_NAME)


# auth api for openai
# get for get test cases > jira issue id (prompt? maybe)
# auth api for xray
# to post test cases, add all the labels, components, set the jira status

# Input field to ask for the jira issue id > which is to be used for test case generation
# Output field to show the test cases generated
# Confirm or Regenerate button
# If Regenerate, then regenerate the test cases
# If Confirm, then ask for Component Name and Label
# Show the test cases keys
