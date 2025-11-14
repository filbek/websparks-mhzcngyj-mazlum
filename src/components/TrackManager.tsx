import React from 'react'
import { motion } from 'framer-motion'
import { AudioTrack } from '../types/audio'

interface TrackManagerProps {
  tracks: AudioTrack[]
  onTrackUpdate: (trackId: string, updates: Partial<AudioTrack>) => void
}

const TrackManager: React.FC<TrackManagerProps> = ({ tracks, onTrackUpdate }) => {
  const getTrackIcon = (type: AudioTrack['type']): string => {
    switch (type) {
      case 'original': return 'bi-file-earmark-music'
      case 'vocal': return 'bi-mic'
      case 'music': return 'bi-music-note-beamed'
      case 'drums': return 'bi-circle'
      case 'bass': return 'bi-soundwave'
      case 'piano': return 'bi-piano'
      default: return 'bi-music-note'
    }
  }

  const getTrackColor = (type: AudioTrack['type']): string => {
    switch (type) {
      case 'original': return 'from-primary-500 to-primary-600'
      case 'vocal': return 'from-accent-500 to-accent-600'
      case 'music': return 'from-secondary-500 to-secondary-600'
      case 'drums': return 'from-red-500 to-red-600'
      case 'bass': return 'from-purple-500 to-purple-600'
      case 'piano': return 'from-green-500 to-green-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <motion.div 
      className="bg-dark-800 rounded-xl p-6 border border-dark-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
        <i className="bi bi-layers text-primary-500"></i>
        <span>Track Manager</span>
      </h3>

      <div className="space-y-3">
        {tracks.map((track, index) => (
          <motion.div
            key={track.id}
            className="bg-dark-700 rounded-lg p-4 border border-dark-600"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center space-x-4">
              {/* Track Icon */}
              <div className={`w-10 h-10 bg-gradient-to-br ${getTrackColor(track.type)} rounded-lg flex items-center justify-center`}>
                <i className={`${getTrackIcon(track.type)} text-white`}></i>
              </div>

              {/* Track Name */}
              <div className="flex-1">
                <h4 className="text-white font-medium">{track.name}</h4>
                <p className="text-dark-400 text-sm capitalize">{track.type}</p>
              </div>

              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <i className="bi bi-volume-up text-dark-400"></i>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={track.volume}
                  onChange={(e) => onTrackUpdate(track.id, { volume: parseFloat(e.target.value) })}
                  className="w-20 accent-primary-500"
                />
                <span className="text-dark-400 text-sm w-8">{Math.round(track.volume * 100)}%</span>
              </div>

              {/* Mute Button */}
              <button
                onClick={() => onTrackUpdate(track.id, { muted: !track.muted })}
                className={`
                  p-2 rounded-lg transition-all duration-200
                  ${track.muted 
                    ? 'bg-red-600 text-white' 
                    : 'bg-dark-600 text-dark-400 hover:bg-dark-500 hover:text-white'
                  }
                `}
              >
                <i className={`bi ${track.muted ? 'bi-volume-mute' : 'bi-volume-up'}`}></i>
              </button>

              {/* Solo Button */}
              <button
                onClick={() => onTrackUpdate(track.id, { solo: !track.solo })}
                className={`
                  p-2 rounded-lg transition-all duration-200
                  ${track.solo 
                    ? 'bg-accent-600 text-white' 
                    : 'bg-dark-600 text-dark-400 hover:bg-dark-500 hover:text-white'
                  }
                `}
              >
                <i className="bi bi-headphones"></i>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default TrackManager
