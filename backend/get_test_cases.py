import os
import csv
import json
from jira import JIRA

import os
from dotenv import load_dotenv
load_dotenv()

from backend.openai_service import OpenAIService

class JiraService :

    def __init__(self, jira_email, jira_token, api_key):
        self.server = os.getenv('JIRA_ENDPOINT')
        self.email = jira_email
        self.token = jira_token
        self.openai_api_key = api_key

    def start_generating(self, user_story_list, system_prompt, user_prompt):
        jiraOptions = {'server': self.server}
        user_email = self.email
        jira_token = self.token
        jira = JIRA(options=jiraOptions, basic_auth=(user_email, jira_token))

        for x, i in enumerate(user_story_list):
            singleIssue = jira.issue(i)
            story_data = {
                'id': singleIssue.id,
                'key': singleIssue.key,
                'summary': singleIssue.fields.summary,
                'description': singleIssue.fields.description,
                'workflow': singleIssue.fields.description,
                'ac': singleIssue.fields.customfield_10060
            }

            print(f"{x+1} Generating test cases for story..{i}")
            base_prompt = '''
                The objective is to cover the following acceptance criteria: {{ac}} and validate the functionality of {{summary}}.
                Refer to the workflow : {{workflow}} to add more details or preconditions to the test case if necessary.
                Please write the test cases (the number of test cases should be atleast 3) using the following valid json format and only provide data if required, otherwise omit the data key.:
                [
                        {
                            "summary": "This will be test name for test case 1",
                            "steps": [
                                {
                                    "action": "some action related to test case 1 for step 1",
                                    "data": "data related to test case 1 for step 1",
                                    "result": "expected result 1."
                                },
                                {
                                    "action": "some action related to test case 1 for step 2",
                                    "data": "data related to test case 1 for step 2",
                                    "result": "expected result 2"
                                },
                                {
                                    "action": "some action related to test case 1 for step 3",
                                    "data": "data related to test case 1 for step 3",
                                    "result": "expected result 3"
                                }
                            ]
                        },
                        {
                            "summary": "This will be test name for test case 2",
                            "steps": [
                                {
                                    "action": "some action related to test case 2 for step 1",
                                    "data": "data related to test case 2 for step 1",
                                    "result": "expected result 1."
                                },
                                {
                                    "action": "some action related to test case 2 for step 2",
                                    "data": "data related to test case 2 for step 3",
                                    "result": "expected result 2"
                                },
                                {
                                    "action": "some action related to test case 2 for step 3",
                                    "data": "data related to test case 2 for step 3",
                                    "result": "expected result 3"
                                }
                            ]
                        }
                ]

            '''

            for key in ['summary', 'workflow', 'ac']:
                base_prompt = base_prompt.replace('{{' + key + '}}', story_data[key])

            result = OpenAIService(self.openai_api_key).get_completion(system_prompt, user_prompt + '\n' + base_prompt)

            # with open("result.json", "w") as f:
            #         f.write(result)

            return result
