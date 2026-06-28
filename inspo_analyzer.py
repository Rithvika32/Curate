import os
import time
import json
import base64
import requests
from dotenv import load_dotenv

# -----------------------------
# Setup
# -----------------------------
load_dotenv()
API_KEY = os.environ["GEMINI_API_KEY"]

url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

headers = {
    "Content-Type": "application/json",
    "X-goog-api-key": API_KEY
}

# -----------------------------
# Helpers
# -----------------------------
def encode_image(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def parse_gemini_response(response_json):
    try:
        text = response_json["candidates"][0]["content"]["parts"][0]["text"]
        return json.loads(text)
    except Exception as e:
        print("Failed to parse JSON. Raw output:")
        print(response_json)
        return None


def call_gemini(payload, retries=5):
    for i in range(retries):
        response = requests.post(url, headers=headers, json=payload)

        if response.status_code == 200:
            return response.json()

        print(f"Gemini attempt {i+1} failed:", response.status_code)

        if response.status_code == 503:
            time.sleep(2 ** i)
        else:
            print(response.text)
            return response.json()

    return {"error": "Gemini failed after retries"}


# -----------------------------
# Core Function
# -----------------------------
def analyze_inspo(image_path):
    image_base64 = encode_image(image_path)

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": """
You are a photography coaching AI.

Analyze this image and return ONLY valid JSON.

No explanation. No markdown. No extra text.

Return format:
{
  "mood": "",
  "lighting": "",
  "composition": "",
  "objects": [],
  "colors": [],
  "style_tags": [],
  "camera_suggestions": []
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

    response = call_gemini(payload)
    return parse_gemini_response(response)


# -----------------------------
# Run Test
# -----------------------------
if __name__ == "__main__":
    image_path = input("Enter image filename: ")

    result = analyze_inspo(image_path)

    print("\nGemini Output:\n")
    print(json.dumps(result, indent=2))