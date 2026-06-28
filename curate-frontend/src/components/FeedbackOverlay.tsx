import type { FeedbackItem } from '../types'

const ARROW: Record<NonNullable<FeedbackItem['arrow']>, string> = {
  left: '←',
  right: '→',
  up: '↑',
  down: '↓',
  in: '⤢',
}

/**
 * Draws coaching tips directly on top of the frame, anchored to the exact
 * spot that needs work (normalized x/y from the coach). Also paints a subtle
 * rule-of-thirds grid so framing tips have context.
 */
export default function FeedbackOverlay({
  items,
  showGrid = true,
}: {
  items: FeedbackItem[]
  showGrid?: boolean
}) {
  return (
    <div className="overlay" aria-live="polite">
      {showGrid && (
        <div className="overlay-grid" aria-hidden="true">
          <span className="v" style={{ left: '33.33%' }} />
          <span className="v" style={{ left: '66.66%' }} />
          <span className="h" style={{ top: '33.33%' }} />
          <span className="h" style={{ top: '66.66%' }} />
        </div>
      )}

      {items.map((item) => {
        const flip = item.x > 0.62 // open callouts toward the frame center
        return (
          <div
            key={item.id}
            className={`marker ${item.kind} ${flip ? 'flip' : ''}`}
            style={{ left: `${item.x * 100}%`, top: `${item.y * 100}%` }}
          >
            <span className="pin" aria-hidden="true">
              {item.arrow ? ARROW[item.arrow] : dot(item.kind)}
            </span>
            <span className="bubble">{item.text}</span>
          </div>
        )
      })}
    </div>
  )
}

function dot(kind: FeedbackItem['kind']) {
  if (kind === 'good') return '✓'
  if (kind === 'fix') return '!'
  return '○'
}
