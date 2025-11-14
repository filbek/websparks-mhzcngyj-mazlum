import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AudioRegion } from '../types/audio'

interface WaveformVisualizationProps {
  audioUrl: string
  currentTime: number
  duration: number
  onSeek: (time: number) => void
  onRegionSelect: (region: AudioRegion) => void
  selectedRegion: AudioRegion | null
}

const WaveformVisualization: React.FC<WaveformVisualizationProps> = ({
  audioUrl,
  currentTime,
  duration,
  onSeek,
  onRegionSelect,
  selectedRegion
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [waveformData, setWaveformData] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<number | null>(null)

  useEffect(() => {
    loadWaveform()
  }, [audioUrl])

  useEffect(() => {
    drawWaveform()
  }, [waveformData, currentTime, selectedRegion])

  const loadWaveform = async () => {
    setIsLoading(true)
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const response = await fetch(audioUrl)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      
      const samples = audioBuffer.getChannelData(0)
      const blockSize = Math.floor(samples.length / 1000) // 1000 data points
      const waveData: number[] = []
      
      for (let i = 0; i < 1000; i++) {
        const start = i * blockSize
        const end = start + blockSize
        let sum = 0
        
        for (let j = start; j < end && j < samples.length; j++) {
          sum += Math.abs(samples[j])
        }
        
        waveData.push(sum / blockSize)
      }
      
      setWaveformData(waveData)
    } catch (error) {
      console.error('Error loading waveform:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const drawWaveform = () => {
    const canvas = canvasRef.current
    if (!canvas || waveformData.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)

    const barWidth = width / waveformData.length
    const maxAmplitude = Math.max(...waveformData)

    // Draw waveform bars
    waveformData.forEach((amplitude, index) => {
      const barHeight = (amplitude / maxAmplitude) * height * 0.8
      const x = index * barWidth
      const y = (height - barHeight) / 2

      // Determine bar color
      let color = '#64748b' // default gray
      
      if (selectedRegion) {
        const timePosition = (index / waveformData.length) * duration
        if (timePosition >= selectedRegion.start && timePosition <= selectedRegion.end) {
          color = '#f59e0b' // accent color for selected region
        }
      }

      // Current time indicator
      const currentPosition = (currentTime / duration) * width
      if (x <= currentPosition && x + barWidth > currentPosition) {
        color = '#0ea5e9' // primary color for current position
      }

      ctx.fillStyle = color
      ctx.fillRect(x, y, Math.max(barWidth - 1, 1), barHeight)
    })

    // Draw current time line
    const currentX = (currentTime / duration) * width
    ctx.strokeStyle = '#0ea5e9'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(currentX, 0)
    ctx.lineTo(currentX, height)
    ctx.stroke()

    // Draw selected region overlay
    if (selectedRegion) {
      const startX = (selectedRegion.start / duration) * width
      const endX = (selectedRegion.end / duration) * width
      
      ctx.fillStyle = 'rgba(245, 158, 11, 0.2)'
      ctx.fillRect(startX, 0, endX - startX, height)
      
      // Draw region boundaries
      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(startX, 0)
      ctx.lineTo(startX, height)
      ctx.moveTo(endX, 0)
      ctx.lineTo(endX, height)
      ctx.stroke()
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const time = (x / canvas.width) * duration

    setIsDragging(true)
    setDragStart(time)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || dragStart === null) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const time = (x / canvas.width) * duration

    const start = Math.min(dragStart, time)
    const end = Math.max(dragStart, time)

    onRegionSelect({ start, end })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragStart(null)
  }

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const time = (x / canvas.width) * duration

    onSeek(time)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <motion.div 
      className="bg-dark-800 rounded-xl p-6 border border-dark-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <i className="bi bi-waveform text-primary-500"></i>
          <span>Waveform</span>
        </h3>
        
        {selectedRegion && (
          <div className="flex items-center space-x-4 text-sm text-dark-300">
            <span>Selection: {formatTime(selectedRegion.start)} - {formatTime(selectedRegion.end)}</span>
            <button
              onClick={() => onRegionSelect({ start: 0, end: 0 })}
              className="text-accent-500 hover:text-accent-400 transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div 
        ref={containerRef}
        className="relative bg-dark-900 rounded-lg overflow-hidden"
        style={{ height: '200px' }}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center space-x-3 text-dark-400">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading waveform...</span>
            </div>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={800}
            height={200}
            className="w-full h-full cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleClick}
          />
        )}
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-dark-400">
        <span>0:00</span>
        <span className="text-primary-400">{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </motion.div>
  )
}

export default WaveformVisualization
