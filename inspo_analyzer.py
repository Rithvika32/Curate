import os
from google import genai
from PIL import Image
import json
from dotenv import load_dotenv


def parse_gemini_response(response):
    try:
        text = response["candidates"][0]["content"]["parts"][0]["text"]
        return json.loads(text)
    except:
        print("Raw response:", response)
        return None
    
# -----------------------------
# Gemini Setup
# -----------------------------

load_dotenv()
API_KEY = os.environ["GEMINI_API_KEY"]

client = genai.Client(api_key=API_KEY)

# -----------------------------
# Load Inspiration Image
# -----------------------------

image_path = input("Enter image filename: ")

image = Image.open(image_path)

# -----------------------------
# Prompt
# -----------------------------

prompt = """
You are a photography coaching system.

Analyze this image and return ONLY valid JSON.

No explanations. No markdown. No extra text.

Return ONLY valid JSON.

{
  "objects": [],
  "lighting": "",
  "mood": "",
  "composition": "",
  "colors": []
}

Focus on details useful for recreating the image.
Do not include explanations.
Do not use markdown.
Return JSON only.
"""

# -----------------------------
# Gemini Request
# -----------------------------

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=[
        prompt,
        image
    ]
)

# -----------------------------
# Output
# -----------------------------

print("\nGemini Output:")
print(response.text)

# Optional: Try parsing as JSON
try:
    scene_data = json.loads(response.text)

    print("\nParsed Successfully!")

    print(json.dumps(scene_data, indent=2))

except Exception as e:
    print("\nCould not parse JSON:")
    print(e)


def analyze_inspo(image_path):
    image_base64 = encode_image(image_path)

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": """
You are a photography coach AI.

Analyze this image and return ONLY valid JSON:

{
  "mood": "",
  "lighting": "",
  "composition": "",
  "objects": [],
  "colors": [],
  "style_tags": [],
  "camera_suggestions": []
}

Be specific and practical for recreating the photo.
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

result = analyze_inspo("inspo.jpg")
print(result)