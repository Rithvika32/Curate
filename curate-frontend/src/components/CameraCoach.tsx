import { useCallback, useEffect, useRef, useState } from 'react'
import { analyzeScene, checkBackend } from '../lib/api'
import { coach, estimateSceneFromCanvas } from '../lib/coach'
import type { FeedbackItem } from '../types'
import FeedbackOverlay from './FeedbackOverlay'

const ANALYZE_EVERY_MS = 1200

export default function CameraCoach({ goal }: { goal: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const goalRef = useRef(goal)
  goalRef.current = goal

  const [active, setActive] = useState(false)
  const [facing, setFacing] = useState<'user' | 'environment'>('user')
  const [error, setError] = useState<string | null>(null)
  const [usingBackend, setUsingBackend] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [score, setScore] = useState(0)
  const [shot, setShot] = useState<string | null>(null)

  const stopStream = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream | null
    stream?.getTracks().forEach((t) => t.stop())
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  const start = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 } },
        audio: false,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setActive(true)
      setUsingBackend(await checkBackend())
    } catch {
      setError(
        'Camera access was blocked. Allow camera permissions and try again.',
      )
    }
  }, [facing])

  // restart stream when the camera is flipped while active
  useEffect(() => {
    if (active) {
      stopStream()
      start()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facing])

  useEffect(() => () => stopStream(), [stopStream])

  // analysis loop
  useEffect(() => {
    if (!active) return
    let cancelled = false
    let busy = false

    const tick = async () => {
      if (cancelled || busy) return
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.videoWidth === 0) return
      busy = true

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)

      let scene = estimateSceneFromCanvas(canvas)

      if (usingBackend) {
        const blob = await new Promise<Blob | null>((res) =>
          canvas.toBlob((b) => res(b), 'image/jpeg', 0.7),
        )
        if (blob) {
          const real = await analyzeScene(blob)
          if (real) scene = real
        }
      }

      if (!cancelled) {
        const result = coach(scene, goalRef.current)
        setItems(result.items)
        setScore(result.score)
      }
      busy = false
    }

    const id = setInterval(tick, ANALYZE_EVERY_MS)
    tick()
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [active, usingBackend])

  const capture = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    setShot(canvas.toDataURL('image/jpeg', 0.92))
  }, [])

  return (
    <div className="coach">
      <div className="stage">
        <video
          ref={videoRef}
          className={`feed ${facing === 'user' ? 'mirror' : ''}`}
          playsInline
          muted
        />
        <canvas ref={canvasRef} hidden />

        {active && <FeedbackOverlay items={items} showGrid={showGrid} />}

        {active && (
          <div className="score-ring" data-score={scoreBand(score)}>
            <span className="score-n">{score}</span>
            <span className="score-l">match</span>
          </div>
        )}

        {!active && (
          <div className="stage-empty">
            <span className="stage-emoji">📷</span>
            <p>
              {error ?? 'Turn on your camera to start live coaching.'}
            </p>
            <button type="button" className="btn btn-primary" onClick={start}>
              {error ? 'Try again' : 'Enable camera'}
            </button>
          </div>
        )}
      </div>

      {active && (
        <div className="coach-bar">
          <button
            type="button"
            className="ctrl"
            onClick={() =>
              setFacing((f) => (f === 'user' ? 'environment' : 'user'))
            }
            title="Flip camera"
          >
            🔄 Flip
          </button>
          <button
            type="button"
            className={`ctrl ${showGrid ? 'on' : ''}`}
            onClick={() => setShowGrid((g) => !g)}
            title="Toggle rule-of-thirds grid"
          >
            # Grid
          </button>
          <button type="button" className="ctrl shutter" onClick={capture}>
            ◎ Capture
          </button>
          <button
            type="button"
            className="ctrl"
            onClick={() => {
              stopStream()
              setActive(false)
              setItems([])
            }}
          >
            ✕ Stop
          </button>
          <span className={`status ${usingBackend ? 'live' : 'demo'}`}>
            {usingBackend ? '● AI analysis live' : '○ demo mode'}
          </span>
        </div>
      )}

      {shot && (
        <div
          className="shot-modal"
          role="dialog"
          aria-label="Captured photo"
          onClick={() => setShot(null)}
        >
          <div className="shot-card" onClick={(e) => e.stopPropagation()}>
            <img src={shot} alt="Your captured shot" />
            <div className="shot-actions">
              <a className="btn btn-primary" href={shot} download="curate-shot.jpg">
                Save photo
              </a>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShot(null)}
              >
                Keep shooting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function scoreBand(score: number): 'low' | 'mid' | 'high' {
  if (score >= 75) return 'high'
  if (score >= 45) return 'mid'
  return 'low'
}
