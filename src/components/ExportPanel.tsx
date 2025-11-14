import React, { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { AudioTrack, AudioFile } from '../types/audio'
import { audioService } from '../services/audioService'

interface ExportPanelProps {
  tracks: AudioTrack[]
  audioFile: AudioFile
  disabled: boolean
}

const ExportPanel: React.FC<ExportPanelProps> = ({ tracks, audioFile, disabled }) => {
  const [exportFormat, setExportFormat] = useState<'mp3' | 'wav'>('mp3')
  const [exportQuality, setExportQuality] = useState<'high' | 'medium' | 'low'>('high')
  const [isExporting, setIsExporting] = useState(false)

  const handleExportMix = async () => {
    setIsExporting(true)
    try {
      const result = await audioService.exportMix(tracks, { format: exportFormat, quality: exportQuality })
      
      // Create download link
      const link = document.createElement('a')
      link.href = result.url
      link.download = `${audioFile.name.split('.')[0]}_mixed.${exportFormat}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Mix exported successfully!')
    } catch (error) {
      toast.error('Failed to export mix')
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportTrack = async (track: AudioTrack) => {
    setIsExporting(true)
    try {
      const result = await audioService.exportTrack(track, { format: exportFormat, quality: exportQuality })
      
      const link = document.createElement('a')
      link.href = result.url
      link.download = `${audioFile.name.split('.')[0]}_${track.name.toLowerCase()}.${exportFormat}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success(`${track.name} track exported successfully!`)
    } catch (error) {
      toast.error(`Failed to export ${track.name} track`)
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <motion.div 
      className="bg-dark-800 rounded-xl p-6 border border-dark-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
        <i className="bi bi-download text-primary-500"></i>
        <span>Export</span>
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Settings */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-white">Export Settings</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-dark-300 mb-2">Format</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'mp3' | 'wav')}
                disabled={disabled || isExporting}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
              >
                <option value="mp3">MP3 (Compressed)</option>
                <option value="wav">WAV (Uncompressed)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-dark-300 mb-2">Quality</label>
              <select
                value={exportQuality}
                onChange={(e) => setExportQuality(e.target.value as 'high' | 'medium' | 'low')}
                disabled={disabled || isExporting}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
              >
                <option value="high">High (320kbps)</option>
                <option value="medium">Medium (192kbps)</option>
                <option value="low">Low (128kbps)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Export Actions */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-white">Download</h4>
          
          <div className="space-y-3">
            {/* Export Full Mix */}
            <button
              onClick={handleExportMix}
              disabled={disabled || isExporting}
              className={`
                w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
                flex items-center justify-center space-x-2
                ${disabled || isExporting
                  ? 'bg-dark-700 text-dark-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white hover:scale-105'
                }
              `}
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-download"></i>
                  <span>Export Full Mix</span>
                </>
              )}
            </button>

            {/* Export Individual Tracks */}
            {tracks.length > 1 && (
              <div className="space-y-2">
                <p className="text-sm text-dark-400">Individual Tracks:</p>
                {tracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => handleExportTrack(track)}
                    disabled={disabled || isExporting}
                    className={`
                      w-full py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200
                      flex items-center justify-between
                      ${disabled || isExporting
                        ? 'bg-dark-700 text-dark-500 cursor-not-allowed' 
                        : 'bg-dark-600 hover:bg-dark-500 text-white hover:scale-[1.02]'
                      }
                    `}
                  >
                    <span className="flex items-center space-x-2">
                      <i className="bi bi-file-earmark-music"></i>
                      <span>{track.name}</span>
                    </span>
                    <i className="bi bi-download"></i>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Info */}
      <div className="mt-6 p-4 bg-dark-700 rounded-lg border border-dark-600">
        <div className="flex items-start space-x-3">
          <i className="bi bi-info-circle text-primary-500 mt-0.5"></i>
          <div className="text-sm text-dark-300">
            <p className="font-medium mb-1">Export Information:</p>
            <ul className="space-y-1 text-dark-400">
              <li>• Full mix combines all unmuted tracks</li>
              <li>• Individual tracks export with current volume settings</li>
              <li>• WAV format provides highest quality but larger file size</li>
              <li>• MP3 format is compressed and suitable for sharing</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ExportPanel
