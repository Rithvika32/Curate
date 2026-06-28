import { useRef, useState } from 'react'
import { analyzeInspo } from '../lib/api'
import type { InspoAnalysis } from '../types'

/**
 * Upload a Pinterest-style inspo photo. If the backend is up it runs the
 * Gemini analyzer; either way it lets the user lock the vibe in as the goal.
 */
export default function InspoPanel({
  onUseGoal,
}: {
  onUseGoal: (goal: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<InspoAnalysis | null>(null)
  const [note, setNote] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setNote(null)
    setLoading(true)
    const analysis = await analyzeInspo(file)
    setLoading(false)
    if (analysis) {
      setResult(analysis)
    } else {
      setNote(
        'Run the Curate backend to auto-analyze inspo. For now, jot the vibe in Describe.',
      )
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const goalFromResult = (r: InspoAnalysis) =>
    [r.mood, r.composition, ...r.objects.slice(0, 3)]
      .filter(Boolean)
      .join(', ')

  return (
    <div className="inspo">
      <div
        className="dropzone"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Your inspiration" className="inspo-preview" />
        ) : (
          <div className="dropzone-empty">
            <span className="stage-emoji">🖼️</span>
            <p>
              <strong>Drop a Pinterest pic</strong> or click to browse
            </p>
            <span className="muted">PNG · JPG · up to ~10MB</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
      </div>

      {loading && <p className="muted center">Reading the vibe…</p>}
      {note && <p className="muted center">{note}</p>}

      {result && (
        <div className="inspo-result">
          <div className="tag-row">
            <span className="tag tag-mood">{result.mood}</span>
            <span className="tag">{result.lighting}</span>
            <span className="tag">{result.composition}</span>
          </div>

          {result.colors.length > 0 && (
            <div className="swatches">
              {result.colors.map((c, i) => (
                <span
                  key={i}
                  className="swatch"
                  style={{ background: toCss(c) }}
                  title={c}
                />
              ))}
            </div>
          )}

          {result.style_tags.length > 0 && (
            <div className="tag-row">
              {result.style_tags.map((t, i) => (
                <span key={i} className="tag tag-soft">
                  #{t}
                </span>
              ))}
            </div>
          )}

          {result.camera_suggestions.length > 0 && (
            <ul className="suggestions">
              {result.camera_suggestions.map((s, i) => (
                <li key={i}>💡 {s}</li>
              ))}
            </ul>
          )}

          <button
            type="button"
            className="btn btn-primary full"
            onClick={() => onUseGoal(goalFromResult(result))}
          >
            Use this as my goal →
          </button>
        </div>
      )}
    </div>
  )
}

/** Accept hex or a named color from the model. */
function toCss(c: string): string {
  const t = c.trim()
  return /^#?[0-9a-f]{3,8}$/i.test(t) ? (t.startsWith('#') ? t : `#${t}`) : t
}
