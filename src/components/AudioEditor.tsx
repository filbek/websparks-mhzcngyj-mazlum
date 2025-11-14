import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import WaveformVisualization from './WaveformVisualization'
import AudioControls from './AudioControls'
import TrackManager from './TrackManager'
import ExportPanel from './ExportPanel'
import { AudioFile, AudioTrack, AudioRegion, FadeOptions } from '../types/audio'
import { audioService } from '../services/audioService'

interface AudioEditorProps {
  audioFile: AudioFile
  onFileRemove: () => void
}

const AudioEditor: React.FC<AudioEditorProps> = ({ audioFile, onFileRemove }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [selectedRegion, setSelectedRegion] = useState<AudioRegion | null>(null)
  const [tracks, setTracks] = useState<AudioTrack[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingMessage, setProcessingMessage] = useState('')
  
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    // Initialize with original track
    const originalTrack: AudioTrack = {
      id: 'original',
      name: 'Original',
      url: audioFile.url,
      type: 'original',
      volume: 1,
      muted: false,
      solo: false
    }
    setTracks([originalTrack])
  }, [audioFile])

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleRegionSelect = (region: AudioRegion) => {
    setSelectedRegion(region)
  }

  const handleCutAudio = async () => {
    if (!selectedRegion) {
      toast.error('Please select a region to cut')
      return
    }

    setIsProcessing(true)
    setProcessingMessage('Cutting audio...')

    try {
      const result = await audioService.cutAudio(audioFile.file, selectedRegion.start, selectedRegion.end)
      
      // Update the original track with the cut audio
      const updatedTracks = tracks.map(track => 
        track.id === 'original' 
          ? { ...track, url: result.url }
          : track
      )
      setTracks(updatedTracks)
      
      toast.success('Audio cut successfully!')
      setSelectedRegion(null)
    } catch (error) {
      toast.error('Failed to cut audio')
      console.error('Cut error:', error)
    } finally {
      setIsProcessing(false)
      setProcessingMessage('')
    }
  }

  const handleApplyFade = async (fadeOptions: FadeOptions) => {
    setIsProcessing(true)
    setProcessingMessage(`Applying fade ${fadeOptions.type}...`)

    try {
      const result = await audioService.applyFade(audioFile.file, fadeOptions)
      
      const updatedTracks = tracks.map(track => 
        track.id === 'original' 
          ? { ...track, url: result.url }
          : track
      )
      setTracks(updatedTracks)
      
      toast.success(`Fade ${fadeOptions.type} applied successfully!`)
    } catch (error) {
      toast.error(`Failed to apply fade ${fadeOptions.type}`)
      console.error('Fade error:', error)
    } finally {
      setIsProcessing(false)
      setProcessingMessage('')
    }
  }

  const handleSeparateVocalMusic = async () => {
    setIsProcessing(true)
    setProcessingMessage('Separating vocals and music... This may take a few minutes.')

    try {
      const result = await audioService.separateVocalMusic(audioFile.file)
      
      const newTracks: AudioTrack[] = [
        ...tracks,
        {
          id: 'vocal',
          name: 'Vocals',
          url: result.vocal,
          type: 'vocal',
          volume: 1,
          muted: false,
          solo: false
        },
        {
          id: 'music',
          name: 'Music',
          url: result.music,
          type: 'music',
          volume: 1,
          muted: false,
          solo: false
        }
      ]
      
      setTracks(newTracks)
      toast.success('Vocal and music separation completed!')
    } catch (error) {
      toast.error('Failed to separate vocals and music')
      console.error('Separation error:', error)
    } finally {
      setIsProcessing(false)
      setProcessingMessage('')
    }
  }

  const handleAdvancedSeparation = async () => {
    setIsProcessing(true)
    setProcessingMessage('Performing advanced instrument separation... This may take several minutes.')

    try {
      const result = await audioService.separateInstruments(audioFile.file)
      
      const newTracks: AudioTrack[] = [
        ...tracks,
        {
          id: 'vocals-adv',
          name: 'Vocals',
          url: result.vocals,
          type: 'vocal',
          volume: 1,
          muted: false,
          solo: false
        },
        {
          id: 'drums',
          name: 'Drums',
          url: result.drums,
          type: 'drums',
          volume: 1,
          muted: false,
          solo: false
        },
        {
          id: 'bass',
          name: 'Bass',
          url: result.bass,
          type: 'bass',
          volume: 1,
          muted: false,
          solo: false
        },
        {
          id: 'other',
          name: 'Other',
          url: result.other,
          type: 'other',
          volume: 1,
          muted: false,
          solo: false
        }
      ]
      
      setTracks(newTracks)
      toast.success('Advanced instrument separation completed!')
    } catch (error) {
      toast.error('Failed to perform advanced separation')
      console.error('Advanced separation error:', error)
    } finally {
      setIsProcessing(false)
      setProcessingMessage('')
    }
  }

  const handleTrackUpdate = (trackId: string, updates: Partial<AudioTrack>) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, ...updates } : track
    ))
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      {/* File Info Header */}
      <motion.div 
        className="bg-dark-800 rounded-xl p-6 border border-dark-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <i className="bi bi-file-earmark-music text-white text-xl"></i>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{audioFile.name}</h2>
              <div className="flex items-center space-x-4 text-sm text-dark-400">
                <span>{formatTime(audioFile.duration)}</span>
                <span>•</span>
                <span>{formatFileSize(audioFile.size)}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onFileRemove}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <i className="bi bi-trash"></i>
            <span>Remove File</span>
          </button>
        </div>
      </motion.div>

      {/* Processing Overlay */}
      {isProcessing && (
        <motion.div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="bg-dark-800 rounded-xl p-8 max-w-md w-full mx-4 text-center border border-dark-700">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
              <i className="bi bi-gear text-white text-2xl animate-spin"></i>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Processing Audio</h3>
            <p className="text-dark-400">{processingMessage}</p>
            <div className="mt-4 w-full bg-dark-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Waveform Visualization */}
      <WaveformVisualization
        audioUrl={audioFile.url}
        currentTime={currentTime}
        duration={audioFile.duration}
        onSeek={handleSeek}
        onRegionSelect={handleRegionSelect}
        selectedRegion={selectedRegion}
      />

      {/* Audio Controls */}
      <AudioControls
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onCut={handleCutAudio}
        onFade={handleApplyFade}
        onSeparateVocalMusic={handleSeparateVocalMusic}
        onAdvancedSeparation={handleAdvancedSeparation}
        selectedRegion={selectedRegion}
        disabled={isProcessing}
      />

      {/* Track Manager */}
      {tracks.length > 1 && (
        <TrackManager
          tracks={tracks}
          onTrackUpdate={handleTrackUpdate}
        />
      )}

      {/* Export Panel */}
      <ExportPanel
        tracks={tracks}
        audioFile={audioFile}
        disabled={isProcessing}
      />

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audioFile.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />
    </div>
  )
}

export default AudioEditor
