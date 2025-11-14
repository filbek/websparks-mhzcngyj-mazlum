import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { AudioFile } from '../types/audio'

interface FileUploadProps {
  onFileUpload: (file: AudioFile) => void
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Create audio element to get duration
    const audio = new Audio()
    const url = URL.createObjectURL(file)
    
    audio.addEventListener('loadedmetadata', () => {
      const audioFile: AudioFile = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        duration: audio.duration,
        url: url,
        file: file
      }
      
      onFileUpload(audioFile)
      toast.success(`Audio file "${file.name}" loaded successfully!`)
    })

    audio.addEventListener('error', () => {
      toast.error('Error loading audio file. Please try a different file.')
      URL.revokeObjectURL(url)
    })

    audio.src = url
  }, [onFileUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac']
    },
    maxFiles: 1,
    onDropRejected: () => {
      toast.error('Please upload a valid audio file (MP3, WAV, M4A, AAC, OGG, FLAC)')
    }
  })

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
          Upload Your Audio File
        </h2>
        <p className="text-dark-300 text-lg">
          Start editing with professional-grade audio processing and AI-powered source separation
        </p>
      </div>

      <motion.div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-300 hover:scale-[1.02] group
          ${isDragActive 
            ? 'border-primary-500 bg-primary-500/10' 
            : 'border-dark-600 hover:border-primary-500 hover:bg-dark-800/50'
          }
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-6">
          <motion.div 
            className="mx-auto w-24 h-24 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
            animate={{ 
              rotate: isDragActive ? 360 : 0,
              scale: isDragActive ? 1.1 : 1 
            }}
            transition={{ duration: 0.5 }}
          >
            <i className="bi bi-cloud-upload text-white text-3xl"></i>
          </motion.div>
          
          <div>
            <h3 className="text-2xl font-semibold mb-2 text-white">
              {isDragActive ? 'Drop your audio file here' : 'Drag & drop your audio file'}
            </h3>
            <p className="text-dark-400 mb-4">
              or <span className="text-primary-400 font-medium">click to browse</span>
            </p>
            <p className="text-sm text-dark-500">
              Supports MP3, WAV, M4A, AAC, OGG, FLAC • Max file size: 100MB
            </p>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </motion.div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard
          icon="bi-scissors"
          title="Precise Cutting"
          description="Cut and trim audio with sample-accurate precision"
        />
        <FeatureCard
          icon="bi-volume-up"
          title="Fade Effects"
          description="Apply professional fade in/out effects"
        />
        <FeatureCard
          icon="bi-layers"
          title="Source Separation"
          description="AI-powered vocal and instrument isolation"
        />
      </div>
    </div>
  )
}

interface FeatureCardProps {
  icon: string
  title: string
  description: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <motion.div 
      className="bg-dark-800 rounded-xl p-6 border border-dark-700 hover:border-primary-500/50 transition-all duration-300"
      whileHover={{ y: -5 }}
    >
      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center mb-4">
        <i className={`${icon} text-white text-xl`}></i>
      </div>
      <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
      <p className="text-dark-400 text-sm">{description}</p>
    </motion.div>
  )
}

export default FileUpload
