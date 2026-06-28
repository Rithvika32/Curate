"""
Curate API bridge
------------------
Exposes the existing Python analyzers to the React frontend over HTTP.

    pip install -r requirements.txt
    uvicorn server:app --reload --port 8000

Endpoints:
    GET  /health         -> {"ok": true}
    POST /analyze-scene  (multipart 'frame') -> scene dict (see scene_analyzer)
    POST /analyze-inspo  (multipart 'image') -> inspo dict (see inspo_analyzer)
"""

import os
import tempfile

import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from scene_analyzer import analyze_scene
from inspo_analyzer import analyze_inspo

app = FastAPI(title="Curate API")

# allow the Vite dev server (and anything else, for hackathon convenience)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/analyze-scene")
async def analyze_scene_route(frame: UploadFile = File(...)):
    """Decode an uploaded webcam frame and run YOLO scene analysis."""
    raw = await frame.read()
    buffer = np.frombuffer(raw, dtype=np.uint8)
    image = cv2.imdecode(buffer, cv2.IMREAD_COLOR)
    if image is None:
        return {"error": "Could not decode frame"}
    return analyze_scene(image)


@app.post("/analyze-inspo")
async def analyze_inspo_route(image: UploadFile = File(...)):
    """Save the uploaded inspo image to a temp file and run Gemini analysis."""
    suffix = os.path.splitext(image.filename or "")[1] or ".jpg"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await image.read())
        tmp_path = tmp.name
    try:
        result = analyze_inspo(tmp_path)
    finally:
        os.unlink(tmp_path)

    if result is None:
        return {"error": "Gemini analysis failed"}
    return result
