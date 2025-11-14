export interface AudioFile {
  id: string
  name: string
  size: number
  duration: number
  url: string
  file: File
}

export interface AudioTrack {
  id: string
  name: string
  url: string
  type: 'original' | 'vocal' | 'music' | 'drums' | 'bass' | 'piano' | 'other'
  volume: number
  muted: boolean
  solo: boolean
}

export interface AudioRegion {
  start: number
  end: number
}

export interface FadeOptions {
  type: 'in' | 'out'
  duration: number
}

export interface SeparationProgress {
  stage: string
  progress: number
  message: string
}
