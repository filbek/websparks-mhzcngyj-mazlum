import axios from 'axios'
import { AudioTrack, FadeOptions } from '../types/audio'

const API_BASE_URL = 'http://localhost:8000'

class AudioService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 300000, // 5 minutes for long operations
  })

  async uploadFile(file: File): Promise<{ id: string; url: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await this.api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  }

  async cutAudio(file: File, startTime: number, endTime: number): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('start_time', startTime.toString())
    formData.append('end_time', endTime.toString())

    const response = await this.api.post('/cut', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  }

  async applyFade(file: File, fadeOptions: FadeOptions): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('fade_type', fadeOptions.type)
    formData.append('duration', fadeOptions.duration.toString())

    const response = await this.api.post('/fade', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  }

  async separateVocalMusic(file: File): Promise<{ vocal: string; music: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await this.api.post('/separate/vocal-music', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  }

  async separateInstruments(file: File): Promise<{ 
    vocals: string; 
    drums: string; 
    bass: string; 
    other: string 
  }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await this.api.post('/separate/instruments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  }

  async exportMix(tracks: AudioTrack[], options: { format: string; quality: string }): Promise<{ url: string }> {
    const response = await this.api.post('/export/mix', {
      tracks: tracks.map(track => ({
        id: track.id,
        url: track.url,
        volume: track.volume,
        muted: track.muted,
        solo: track.solo
      })),
      format: options.format,
      quality: options.quality
    })

    return response.data
  }

  async exportTrack(track: AudioTrack, options: { format: string; quality: string }): Promise<{ url: string }> {
    const response = await this.api.post('/export/track', {
      track: {
        id: track.id,
        url: track.url,
        volume: track.volume
      },
      format: options.format,
      quality: options.quality
    })

    return response.data
  }
}

export const audioService = new AudioService()
