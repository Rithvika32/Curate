import type { InspoAnalysis, SceneAnalysis } from '../types'

/**
 * Thin client for the FastAPI bridge (server.py) that wraps the existing
 * Python analyzers. Every call returns `null` on failure so the UI can
 * gracefully fall back to a self-contained demo mode.
 */

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ??
  'http://localhost:8000'

let online: boolean | null = null

/** Has the bridge answered a health check this session? */
export async function checkBackend(): Promise<boolean> {
  if (online !== null) return online
  try {
    const res = await fetch(`${API_URL}/health`, { method: 'GET' })
    online = res.ok
  } catch {
    online = false
  }
  return online
}

/** Send a single webcam frame for YOLO scene analysis. */
export async function analyzeScene(frame: Blob): Promise<SceneAnalysis | null> {
  try {
    const form = new FormData()
    form.append('frame', frame, 'frame.jpg')
    const res = await fetch(`${API_URL}/analyze-scene`, {
      method: 'POST',
      body: form,
    })
    if (!res.ok) return null
    return (await res.json()) as SceneAnalysis
  } catch {
    return null
  }
}

/** Send an inspiration photo for Gemini analysis. */
export async function analyzeInspo(image: File): Promise<InspoAnalysis | null> {
  try {
    const form = new FormData()
    form.append('image', image, image.name)
    const res = await fetch(`${API_URL}/analyze-inspo`, {
      method: 'POST',
      body: form,
    })
    if (!res.ok) return null
    return (await res.json()) as InspoAnalysis
  } catch {
    return null
  }
}
