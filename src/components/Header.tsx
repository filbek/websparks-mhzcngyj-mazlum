import React from 'react'

const Header: React.FC = () => {
  return (
    <header className="bg-dark-800 border-b border-dark-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <i className="bi bi-music-note-beamed text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                Audio Editor Pro
              </h1>
              <p className="text-dark-400 text-sm">Advanced Audio Processing & Source Separation</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-6 text-sm text-dark-300">
              <span className="flex items-center space-x-2">
                <i className="bi bi-check-circle text-primary-500"></i>
                <span>AI-Powered Separation</span>
              </span>
              <span className="flex items-center space-x-2">
                <i className="bi bi-waveform text-accent-500"></i>
                <span>Professional Editing</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
