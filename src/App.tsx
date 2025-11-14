import React, { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import Header from './components/Header'
import FileUpload from './components/FileUpload'
import AudioEditor from './components/AudioEditor'
import Footer from './components/Footer'
import { AudioFile } from './types/audio'

function App() {
  const [currentFile, setCurrentFile] = useState<AudioFile | null>(null)

  const handleFileUpload = (file: AudioFile) => {
    setCurrentFile(file)
  }

  const handleFileRemove = () => {
    setCurrentFile(null)
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white font-primary">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155'
          }
        }}
      />
      
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {!currentFile ? (
          <div className="animate-fade-in">
            <FileUpload onFileUpload={handleFileUpload} />
          </div>
        ) : (
          <div className="animate-slide-up">
            <AudioEditor 
              audioFile={currentFile} 
              onFileRemove={handleFileRemove}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default App
