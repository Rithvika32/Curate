import { useState } from 'react'
import CameraCoach from './CameraCoach'
import InspoPanel from './InspoPanel'

type Tab = 'camera' | 'inspo' | 'describe'

const PRESETS = [
  'cozy golden-hour portrait',
  'minimal flat-lay with coffee',
  'cottagecore with plants + flowers',
  'street style, full body, centered',
  'sunny picnic with a dog',
]

export default function Studio({ onHome }: { onHome: () => void }) {
  const [tab, setTab] = useState<Tab>('describe')
  const [goal, setGoal] = useState('')

  const goCamera = (g: string) => {
    setGoal(g)
    setTab('camera')
  }

  return (
    <div className="studio">
      <nav className="topbar">
        <button className="brand" onClick={onHome} type="button">
          <span className="wordmark brand-word">
            <span className="cap">C</span>urate
          </span>
        </button>
        <span className="brand-tag">picture helper</span>
      </nav>

      <div className="goal-banner">
        <span className="goal-label">🎯 Your vibe</span>
        <span className="goal-value">
          {goal || 'not set yet — describe it or upload an inspo pic'}
        </span>
      </div>

      <div className="tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'describe'}
          className={`tab ${tab === 'describe' ? 'active' : ''}`}
          onClick={() => setTab('describe')}
        >
          ✍️ Describe
        </button>
        <button
          role="tab"
          aria-selected={tab === 'inspo'}
          className={`tab ${tab === 'inspo' ? 'active' : ''}`}
          onClick={() => setTab('inspo')}
        >
          🖼️ Inspo photo
        </button>
        <button
          role="tab"
          aria-selected={tab === 'camera'}
          className={`tab ${tab === 'camera' ? 'active' : ''}`}
          onClick={() => setTab('camera')}
        >
          📸 Live camera
        </button>
      </div>

      <div className="panel">
        {tab === 'describe' && (
          <div className="describe">
            <label className="field-label" htmlFor="goal">
              Describe the photo you want
            </label>
            <textarea
              id="goal"
              className="goal-input"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. cozy golden-hour portrait with plants, centered subject…"
              rows={3}
            />
            <div className="preset-row">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  className="preset"
                  onClick={() => setGoal(p)}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!goal.trim()}
              onClick={() => setTab('camera')}
            >
              Open camera with this goal →
            </button>
          </div>
        )}

        {tab === 'inspo' && <InspoPanel onUseGoal={goCamera} />}

        {tab === 'camera' && <CameraCoach goal={goal} />}
      </div>
    </div>
  )
}
