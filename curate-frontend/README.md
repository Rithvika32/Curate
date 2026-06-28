# Curate — frontend

A Pinterest picture helper. Describe the shot you want (or upload an inspo
photo), then open your camera and get **live coaching drawn right on the
image** — telling you where to fix lighting, framing, and your subject.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

The UI works fully on its own in **demo mode** (real client-side brightness +
rule-of-thirds + framing guides). For full YOLO + Gemini analysis, run the
Python bridge in the repo root:

```bash
cd ..
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

Point the frontend at a different API host with `VITE_API_URL` if needed.

## How it's built

- `src/components/Hero.tsx` — fun, interactive landing (cursor parallax,
  floating doodles, the fashion-tech wordmark).
- `src/components/Studio.tsx` — workspace with three input modes:
  **Describe**, **Inspo photo**, **Live camera**.
- `src/components/CameraCoach.tsx` — webcam capture + analysis loop. Auto-
  adjusts to portrait on phones, landscape on desktop. Flip camera, grid
  toggle, capture/download.
- `src/components/FeedbackOverlay.tsx` — positions each tip on the frame at the
  exact spot it refers to, with a pulsing pin + callout.
- `src/lib/coach.ts` — the coaching brain (scene → positioned feedback + score).
- `src/lib/api.ts` — talks to `server.py`, falls back to demo mode on failure.

## Theme

Summer/spring palette — yellow `#fce08b`, pink `#efb7ce`, green `#d6de96` — on a
light-green striped background. Fonts: Orbitron (tech) + Sacramento (script) +
Poppins (body).
