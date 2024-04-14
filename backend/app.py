from flask import Flask, request, jsonify, make_response
from backend.get_test_cases import JiraService
from backend.import_tests import XrayImport
from backend.add_fields import AddFields
import jwt, json, os
import datetime
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
# app.config['DEBUG'] = True

SECRET_KEY = os.getenv('SECRET_KEY')

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route('/post_example', methods=['POST'])
def post_example():
    # Retrieve data from the POST request
    data = request.json  # Assuming the request data is in JSON format
    
    # Process the data (e.g., perform some computation or database operation)
    processed_data = data['key']  # Assuming the JSON data has a key named 'key'
    
    # Return a response (e.g., send a JSON response)
    response = {'message': 'Received and processed data successfully', 'processed_data': processed_data}
    return jsonify(response), 200  # Return a JSON response with a 200 status code


# Header > JWT Auth Token with Jira Token, Email and OpenAI API Key
# Payload > Give Jira Issue Id which is to be used to generate test cases
@app.route("/get_test_cases", methods=["POST"])
def get_test_cases():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Authorization header missing or invalid"}), 401

    token = auth_header.split(' ')[1]  # Extract the token part of the header
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    print(f"Header Received: {payload}")

    api_key = payload["api_key"]
    jira_email = payload["email"]
    jira_token = payload["token"]

    data = request.get_json()
    print(f"Data Received: {data}")
    jira_issue_id = data.get("issue_id")
    system_prompt = data.get("system_prompt", "")
    user_prompt = data.get("user_prompt", "As a quality engineer, I need to create XRay test cases for a desktop application named Litera Secure Share.")
    
    response = JiraService(jira_email, jira_token, api_key).start_generating(jira_issue_id, system_prompt, user_prompt)
    return jsonify(response), 200

@app.route("/post_test_cases", methods=["POST"])
def post_test_cases():
    
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Authorization header missing or invalid"}), 401

    token = auth_header.split(' ')[1] 

    data = request.get_json()

    testcase_json = json.loads(json.loads(data.get('testcase_data')))
    xray_set = data.get('xray_test_sets')
    jira_issue_id = data.get('jira_issue_id')

    formatted_data = XrayImport().format_test_cases(testcase_json, jira_issue_id, xray_set)
    job_id = XrayImport().post_test_cases(token, formatted_data)
    keys = XrayImport().get_job_keys(token, job_id)
    return jsonify(keys), 200

@app.route("/add_fields", methods=["POST"])
def add_fields():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Authorization header missing or invalid"}), 401

    token = auth_header.split(' ')[1]  # Extract the token part of the header
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    jira_email = payload["email"]
    jira_token = payload["token"]
    
    data = request.json
    key = data["key"]
    label = data["label"]
    component = data["component"]
    
    print(label)
    
    AddFields(jira_email, jira_token).add_fields(key, component, label)
    
    response = {'message': 'Issue Updated Successfully'}
    return jsonify(response), 200

@app.route("/authenticate", methods=["POST"])
def authenticateJiraOpenAI():
    
    data = request.json

    jira_email = data["jira_email"]
    jira_token = data["jira_token"]
    openai_key = data["openai_api_key"]
    
    def create_jwt(user_data):
        expiration_time = datetime.datetime.utcnow() + datetime.timedelta(days=3)  # Expires in one day
        token = jwt.encode(user_data, SECRET_KEY, algorithm='HS256')
        return token

    user_credentials = {
        'email': jira_email,
        'token': jira_token,
        'api_key': openai_key
    }

    my_jwt = create_jwt(user_credentials)
    response = {'message': 'Successfully created JWT', 'jwt': my_jwt}
    return jsonify(response), 200

@app.route("/authenticate-xray", methods=["POST"])
def authenticate_xray():
    data = request.json
    client_id = data.get("client_id")
    client_secret = data.get("client_secret")

    if not client_id or not client_secret:
        print("Client ID or client secret not provided.")
        return make_response(jsonify({"error": "Client ID or Client Secret not provided"}), 400)

    try:
        print("Attempting to authenticate.")
        auth_response = XrayImport().authenticate(client_id, client_secret)
        
        print(f"Authentication status: {auth_response['status']}")

        if auth_response.get('status') == 200:
            print("Authentication successful.")
            return jsonify({"message": "Authentication successful", "token": auth_response['data']}), 200
        elif auth_response.get('status') == 401:
            return make_response(jsonify({"error": "Authentication failed"}), 401)
        else:
            print(f"Unexpected status: {auth_response.get('status')}")
            return make_response(jsonify({"error": "Unexpected status received", "status": auth_response.get('status')}), auth_response.get('status'))

    except Exception as e:
        print(f"An exception occurred: {e}")
        return make_response(jsonify({"error": "Internal Server Error", "message": str(e)}), 500)