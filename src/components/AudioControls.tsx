import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { AudioRegion, FadeOptions } from '../types/audio'

interface AudioControlsProps {
  isPlaying: boolean
  onPlayPause: () => void
  onCut: () => void
  onFade: (options: FadeOptions) => void
  onSeparateVocalMusic: () => void
  onAdvancedSeparation: () => void
  selectedRegion: AudioRegion | null
  disabled: boolean
}

const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  onPlayPause,
  onCut,
  onFade,
  onSeparateVocalMusic,
  onAdvancedSeparation,
  selectedRegion,
  disabled
}) => {
  const [fadeType, setFadeType] = useState<'in' | 'out'>('in')
  const [fadeDuration, setFadeDuration] = useState(2)

  const handleFadeClick = () => {
    onFade({ type: fadeType, duration: fadeDuration })
  }

  return (
    <motion.div 
      className="bg-dark-800 rounded-xl p-6 border border-dark-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Playback Controls */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
            <i className="bi bi-play-circle text-primary-500"></i>
            <span>Playback</span>
          </h4>
          
          <button
            onClick={onPlayPause}
            disabled={disabled}
            className={`
              w-full py-3 px-6 rounded-lg font-medium transition-all duration-200
              flex items-center justify-center space-x-2
              ${disabled 
                ? 'bg-dark-700 text-dark-500 cursor-not-allowed' 
                : 'bg-primary-600 hover:bg-primary-700 text-white hover:scale-105'
              }
            `}
          >
            <i className={`bi ${isPlaying ? 'bi-pause-fill' : 'bi-play-fill'} text-xl`}></i>
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
        </div>

        {/* Edit Controls */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
            <i className="bi bi-scissors text-accent-500"></i>
            <span>Edit</span>
          </h4>
          
          <div className="space-y-3">
            <button
              onClick={onCut}
              disabled={disabled || !selectedRegion}
              className={`
                w-full py-2 px-4 rounded-lg font-medium transition-all duration-200
                flex items-center justify-center space-x-2
                ${disabled || !selectedRegion
                  ? 'bg-dark-700 text-dark-500 cursor-not-allowed' 
                  : 'bg-accent-600 hover:bg-accent-700 text-white hover:scale-105'
                }
              `}
            >
              <i className="bi bi-scissors"></i>
              <span>Cut Selection</span>
            </button>

            <div className="flex items-center space-x-2">
              <select
                value={fadeType}
                onChange={(e) => setFadeType(e.target.value as 'in' | 'out')}
                disabled={disabled}
                className="flex-1 bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
              >
                <option value="in">Fade In</option>
                <option value="out">Fade Out</option>
              </select>
              
              <input
                type="number"
                min="0.5"
                max="10"
                step="0.5"
                value={fadeDuration}
                onChange={(e) => setFadeDuration(parseFloat(e.target.value))}
                disabled={disabled}
                className="w-20 bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
              />
              
              <button
                onClick={handleFadeClick}
                disabled={disabled}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all duration-200
                  flex items-center space-x-1
                  ${disabled 
                    ? 'bg-dark-700 text-dark-500 cursor-not-allowed' 
                    : 'bg-secondary-600 hover:bg-secondary-700 text-white hover:scale-105'
                  }
                `}
              >
                <i className="bi bi-volume-up"></i>
                <span>Apply</span>
              </button>
            </div>
          </div>
        </div>

        {/* AI Separation Controls */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
            <i className="bi bi-layers text-primary-500"></i>
            <span>AI Separation</span>
          </h4>
          
          <div className="space-y-3">
            <button
              onClick={onSeparateVocalMusic}
              disabled={disabled}
              className={`
                w-full py-2 px-4 rounded-lg font-medium transition-all duration-200
                flex items-center justify-center space-x-2
                ${disabled 
                  ? 'bg-dark-700 text-dark-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white hover:scale-105'
                }
              `}
            >
              <i className="bi bi-music-note-beamed"></i>
              <span>Vocal/Music</span>
            </button>

            <button
              onClick={onAdvancedSeparation}
              disabled={disabled}
              className={`
                w-full py-2 px-4 rounded-lg font-medium transition-all duration-200
                flex items-center justify-center space-x-2
                ${disabled 
                  ? 'bg-dark-700 text-dark-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-accent-600 to-primary-600 hover:from-accent-700 hover:to-primary-700 text-white hover:scale-105'
                }
              `}
            >
              <i className="bi bi-diagram-3"></i>
              <span>Advanced</span>
            </button>
          </div>
        </div>
      </div>

      {selectedRegion && (
        <div className="mt-4 p-3 bg-dark-700 rounded-lg border border-accent-500/30">
          <div className="flex items-center space-x-2 text-sm text-accent-400">
            <i className="bi bi-info-circle"></i>
            <span>
              Selected region: {Math.floor(selectedRegion.start)}s - {Math.floor(selectedRegion.end)}s 
              ({Math.floor(selectedRegion.end - selectedRegion.start)}s duration)
            </span>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default AudioControls
