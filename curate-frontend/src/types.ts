export type FeedbackKind = 'good' | 'fix' | 'tip'

export interface FeedbackItem {
  id: string
  text: string
  kind: FeedbackKind
  /** normalized position on the frame, 0..1 (where the issue lives) */
  x: number
  y: number
  /** optional directional hint for arrow markers */
  arrow?: 'left' | 'right' | 'up' | 'down' | 'in'
}

/** mirrors scene_analyzer.analyze_scene() */
export interface SceneAnalysis {
  objects: string[]
  object_count: number
  brightness: number
  person: { center_x: number; center_y: number; size: number } | null
  frame: { width: number; height: number }
}

/** mirrors inspo_analyzer.analyze_inspo() */
export interface InspoAnalysis {
  mood: string
  lighting: string
  composition: string
  objects: string[]
  colors: string[]
  style_tags: string[]
  camera_suggestions: string[]
}
