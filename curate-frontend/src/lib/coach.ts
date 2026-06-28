import type { FeedbackItem, SceneAnalysis } from '../types'

/**
 * The coaching brain. Turns a scene (from the backend, or a lightweight
 * client-side estimate) plus the user's goal into feedback items that are
 * *positioned on the frame* — so each tip can be drawn right where the
 * improvement needs to happen, instead of in a list on the side.
 */

export interface CoachResult {
  items: FeedbackItem[]
  score: number
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

export function coach(
  scene: SceneAnalysis,
  goal: string,
): CoachResult {
  const items: FeedbackItem[] = []
  let score = 40 // base for a working, well-exposed frame
  const g = goal.toLowerCase()

  // ---- Lighting ----------------------------------------------------------
  if (scene.brightness < 70) {
    items.push({
      id: 'light',
      kind: 'fix',
      text: 'Too dark — face a window or add light',
      x: 0.5,
      y: 0.22,
    })
  } else if (scene.brightness > 200) {
    items.push({
      id: 'light',
      kind: 'fix',
      text: 'Blown out — step out of direct sun',
      x: 0.5,
      y: 0.22,
    })
  } else {
    score += 18
    items.push({
      id: 'light',
      kind: 'good',
      text: 'Lighting looks lovely',
      x: 0.5,
      y: 0.12,
    })
  }

  // ---- Subject framing ---------------------------------------------------
  const p = scene.person
  if (p) {
    const x = clamp01(p.center_x)
    const y = clamp01(p.center_y)

    if (x < 0.35) {
      items.push({
        id: 'frame-x',
        kind: 'fix',
        text: 'Pan right to center them',
        x,
        y,
        arrow: 'right',
      })
    } else if (x > 0.65) {
      items.push({
        id: 'frame-x',
        kind: 'fix',
        text: 'Pan left to center them',
        x,
        y,
        arrow: 'left',
      })
    } else {
      score += 16
      items.push({
        id: 'frame-x',
        kind: 'good',
        text: 'Nicely centered',
        x,
        y: clamp01(y - 0.12),
      })
    }

    if (p.size < 0.1) {
      items.push({
        id: 'frame-z',
        kind: 'fix',
        text: 'Step closer — fill the frame',
        x,
        y: clamp01(y + 0.14),
        arrow: 'in',
      })
    } else if (p.size > 0.55) {
      items.push({
        id: 'frame-z',
        kind: 'tip',
        text: 'A touch tight — back up for breathing room',
        x,
        y: clamp01(y + 0.14),
      })
    } else {
      score += 14
    }
  } else {
    items.push({
      id: 'subject',
      kind: 'tip',
      text: 'No subject yet — step into frame',
      x: 0.5,
      y: 0.5,
    })
  }

  // ---- Goal matching -----------------------------------------------------
  const goalObjects = extractGoalObjects(g)
  const missing = goalObjects.filter(
    (want) => !scene.objects.some((have) => have.includes(want)),
  )
  if (goalObjects.length > 0) {
    if (missing.length === 0) {
      score += 12
      items.push({
        id: 'goal',
        kind: 'good',
        text: 'Matches your vibe ✓',
        x: 0.82,
        y: 0.88,
      })
    } else {
      items.push({
        id: 'goal',
        kind: 'tip',
        text: `Add ${missing.slice(0, 2).join(' + ')} to match your inspo`,
        x: 0.5,
        y: 0.86,
      })
    }
  }

  // ---- Clutter -----------------------------------------------------------
  if (scene.object_count > 6) {
    items.push({
      id: 'clutter',
      kind: 'tip',
      text: 'Busy background — simplify the scene',
      x: 0.18,
      y: 0.78,
    })
    score -= 6
  }

  return { items, score: Math.max(0, Math.min(100, Math.round(score))) }
}

/** Pull likely subjects out of a free-text goal ("cozy photo with a dog + plants"). */
function extractGoalObjects(goal: string): string[] {
  const vocab = [
    'person',
    'dog',
    'cat',
    'plant',
    'flower',
    'book',
    'cup',
    'coffee',
    'bag',
    'bike',
    'car',
    'chair',
    'laptop',
  ]
  return vocab.filter((word) => goal.includes(word))
}

/**
 * Client-side fallback scene estimate when the backend isn't running.
 * We can still measure real brightness from the canvas and fake a centered
 * subject so the on-image overlay system stays fully demonstrable.
 */
export function estimateSceneFromCanvas(
  canvas: HTMLCanvasElement,
): SceneAnalysis {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  let brightness = 130
  if (ctx && canvas.width > 0 && canvas.height > 0) {
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let sum = 0
    // sample every 40th pixel for speed
    for (let i = 0; i < data.length; i += 4 * 40) {
      sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    }
    brightness = sum / (data.length / (4 * 40))
  }
  return {
    objects: [],
    object_count: 0,
    brightness,
    person: null,
    frame: { width: canvas.width, height: canvas.height },
  }
}
