import os
import openai
from dotenv import load_dotenv
load_dotenv()


class OpenAIService:

    def __init__(self, api_key):
        self.API_TYPE = os.getenv('API_TYPE')
        self.API_VERSION = os.getenv('API_VERSION')
        self.API_BASE = os.getenv('API_BASE')
        self.api_key = api_key

    def get_completion(self, system_prompt, user_prompt):
        openai.api_type = self.API_TYPE
        openai.api_version = self.API_VERSION
        openai.api_base = self.API_BASE
        openai.api_key = self.api_key
        
        result = []
        try:
            res = openai.ChatCompletion.create(
                engine="Nebula-gpt-4",
                messages = [{"role":"system","content":system_prompt},{"role":"user", "content": user_prompt}],
                temperature=0.0,
                max_tokens= 1000,
                n=1,
                top_p=0.0,
                frequency_penalty = 0,
                presence_penalty = 0,
                stop=None,
            )
            if res and res.choices:
                result = res.choices[0].message.content
        except openai.error.RateLimitError:
            print("Invalid API Key!")
        except openai.error.APIConnectionError:
            print("Unable to fetch data from AI API!")
        except openai.error.RateLimitError:
            print("You have reached a limit to access AI API!")
        except Exception as e:
            print(f"openai error {e}")
        return result