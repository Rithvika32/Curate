import os
import requests
import base64
from dotenv import load_dotenv

def encode_image(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

load_dotenv()
API_KEY = os.environ["GEMINI_API_KEY"]

url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

headers = {
    "Content-Type": "application/json",
    "X-goog-api-key": API_KEY
}

payload = {
    "contents": [
        {
            "parts": [
                {
                    "text": """
Analyze this image for a photography coaching app.

Return ONLY valid JSON:
{
  "mood": "",
  "lighting": "",
  "objects": [],
  "composition": "",
  "colors": [],
  "style_tags": []
}
"""
                },
                {
                    "inline_data": {
                        "mime_type": "image/jpeg",
                        "data": image_base64
                    }
                }
            ]
        }
    ]
} 


response = requests.post(url, headers=headers, json=payload)

print(response.status_code)
print(response.text)