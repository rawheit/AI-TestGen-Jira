import os
from jira import JIRA

class AddFields:
    def __init__(self, jira_email, jira_token):
        self.server = os.getenv('JIRA_ENDPOINT')
        self.email = jira_email
        self.token = jira_token

    def add_fields(self, issue_key, component, labels):

        labelsArray = labels.split(", ")

        print(f"Updating JIRA issue {issue_key} with component '{component}' and labels '{labels}'...")
        jiraOptions = {'server': self.server}
        user_email = self.email
        jira_token = self.token
        jira = JIRA(options=jiraOptions, basic_auth=(user_email, jira_token))

        new_components = [{'name': component}]

        issue = jira.issue(issue_key)

        issue.update(fields={'components': new_components})
        issue.update(fields={"labels": labelsArray})

        print(f"JIRA issue {issue_key} setting to In Progress...")
        jira.transition_issue(issue_key, 51)
        print(f"JIRA issue {issue_key} updated.")

        return 