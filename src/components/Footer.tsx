import React from 'react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-800 border-t border-dark-700 mt-16">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <i className="bi bi-music-note-beamed text-white"></i>
              </div>
              <h3 className="text-lg font-bold text-white">Audio Editor Pro</h3>
            </div>
            <p className="text-dark-400 text-sm">
              Professional audio editing with AI-powered source separation technology.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-3">Features</h4>
            <ul className="space-y-2 text-sm text-dark-400">
              <li>• Waveform visualization</li>
              <li>• Precise audio cutting</li>
              <li>• Fade in/out effects</li>
              <li>• AI source separation</li>
              <li>• Multi-track editing</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-3">Supported Formats</h4>
            <ul className="space-y-2 text-sm text-dark-400">
              <li>• MP3, WAV, M4A</li>
              <li>• AAC, OGG, FLAC</li>
              <li>• High-quality export</li>
              <li>• Multiple bitrates</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-dark-700 mt-8 pt-6 flex items-center justify-between">
          <p className="text-dark-500 text-sm">
            © 2024 Audio Editor Pro. All rights reserved.
          </p>
          <p className="text-dark-500 text-sm flex items-center space-x-2">
            <span>Powered by</span>
            <span className="text-primary-400 font-semibold">Websparks AI</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
