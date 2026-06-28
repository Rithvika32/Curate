import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

/** thin radiating line-burst, like the sparkle doodles in the mockup */
function Sparkle({ lines = 12, r1 = 4, r2 = 16 }: { lines?: number; r1?: number; r2?: number }) {
  return (
    <svg viewBox="-20 -20 40 40" className="spk">
      {Array.from({ length: lines }).map((_, i) => {
        const a = (i / lines) * Math.PI * 2
        return (
          <line
            key={i}
            x1={Math.cos(a) * r1}
            y1={Math.sin(a) * r1}
            x2={Math.cos(a) * r2}
            y2={Math.sin(a) * r2}
          />
        )
      })}
    </svg>
  )
}

/** the big pink radiating sun, like the graphic on the right of the mockup */
function Sunburst() {
  return (
    <svg viewBox="-100 -100 200 200" className="sun">
      <g className="sun-rays">
        {Array.from({ length: 28 }).map((_, i) => {
          const a = (i / 28) * Math.PI * 2
          return (
            <line
              key={i}
              x1={Math.cos(a) * 62}
              y1={Math.sin(a) * 62}
              x2={Math.cos(a) * 92}
              y2={Math.sin(a) * 92}
            />
          )
        })}
      </g>
      <circle cx="0" cy="0" r="56" className="sun-core" />
      {/* little sun face in the center */}
      <g className="sun-face">
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2
          return (
            <line
              key={i}
              x1={Math.cos(a) * 10}
              y1={Math.sin(a) * 10}
              x2={Math.cos(a) * 17}
              y2={Math.sin(a) * 17}
            />
          )
        })}
        <circle cx="0" cy="0" r="7" />
      </g>
    </svg>
  )
}

export default function Hero({ onStart }: { onStart: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  // gentle parallax that follows the cursor — keeps it fun + interactive
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      setTilt({
        x: ((e.clientX - r.left) / r.width - 0.5) * 2,
        y: ((e.clientY - r.top) / r.height - 0.5) * 2,
      })
    }
    el.addEventListener('pointermove', onMove)
    return () => el.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <header
      className="hero"
      ref={ref}
      style={{ '--tx': tilt.x, '--ty': tilt.y } as CSSProperties}
    >
      {/* decorations, positioned like the mockup */}
      <div className="hero-deco" aria-hidden="true">
        <span className="deco sun-right">
          <Sunburst />
        </span>
        <span className="deco sun-small">
          <Sunburst />
        </span>
        <span className="deco spk-1">
          <Sparkle />
        </span>
        <span className="deco spk-2">
          <Sparkle lines={10} r2={13} />
        </span>
        <span className="deco spk-3">
          <Sparkle lines={14} />
        </span>
        <span className="deco spk-4">
          <Sparkle lines={9} r2={12} />
        </span>
        <span className="deco ring-1" />
        <span className="deco ring-2" />
      </div>

      <div className="hero-stage">
        <h1 className="cur-word">
          <span className="cur-c">C</span>
          <span className="cur-rest">URATE</span>
        </h1>

        <p className="cur-tag">
          <span className="t-pixel">A PINTREST</span>
          <span className="t-script">picture</span>
          <span className="t-pixel">HELPER</span>
        </p>

        <button type="button" className="learn-btn" onClick={onStart}>
          LEARN MORE
        </button>
      </div>

      <button
        type="button"
        className="scroll-cue"
        onClick={() =>
          document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })
        }
      >
        how it works ↓
      </button>

      <section id="how" className="how">
        <h2 className="how-title">three little steps</h2>
        <div className="how-grid">
          {[
            {
              n: '01',
              t: 'Set your vibe',
              d: 'Upload a Pinterest pic or describe the shot you want.',
            },
            {
              n: '02',
              t: 'Open the camera',
              d: 'Curate reads your frame — lighting, framing, subject.',
            },
            {
              n: '03',
              t: 'Follow the tips',
              d: 'Hints pop up on the image, right where to fix things.',
            },
          ].map((s) => (
            <article key={s.n} className="how-card">
              <span className="how-num">{s.n}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </article>
          ))}
        </div>
        <button type="button" className="learn-btn small" onClick={onStart}>
          start curating →
        </button>
      </section>
    </header>
  )
}
