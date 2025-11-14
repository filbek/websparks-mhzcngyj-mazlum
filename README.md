# Audio Editor Pro

A professional web-based audio editor with AI-powered source separation capabilities. Built with React (TypeScript) frontend and FastAPI Python backend.

## Features

### 🎵 Core Audio Editing
- **File Upload**: Support for MP3, WAV, M4A, AAC, OGG, FLAC formats
- **Waveform Visualization**: Interactive waveform display with precise timeline
- **Audio Cutting**: Sample-accurate cutting and trimming with visual selection
- **Fade Effects**: Professional fade in/out with customizable duration
- **Real-time Playback**: Integrated audio player with seek functionality

### 🤖 AI-Powered Source Separation
- **Vocal/Music Separation**: Extract vocals and background music into separate tracks
- **Advanced Instrument Separation**: Isolate vocals, drums, bass, and other instruments
- **Multi-track Management**: Independent volume, mute, and solo controls for each track
- **Professional Processing**: Uses Spleeter AI models with FFmpeg fallback

### 📤 Export & Download
- **Multiple Formats**: Export as MP3 or WAV
- **Quality Options**: High (320kbps), Medium (192kbps), Low (128kbps)
- **Full Mix Export**: Combine all tracks into single file
- **Individual Track Export**: Download separated stems independently

### 🎨 Modern UI/UX
- **Dark Theme**: Professional dark interface optimized for audio work
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Feedback**: Progress indicators and status updates
- **Intuitive Controls**: Drag-and-drop upload, visual waveform editing

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Wavesurfer.js** for waveform visualization
- **React Dropzone** for file uploads
- **Axios** for API communication

### Backend
- **FastAPI** (Python) for REST API
- **FFmpeg** for audio processing
- **Spleeter** for AI source separation
- **TensorFlow** for machine learning models
- **Librosa** for audio analysis

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- FFmpeg installed on your system

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd audio-editor-pro
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Setup Backend**
   ```bash
   cd backend
   python -m venv venv
   
   # Activate virtual environment
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

4. **Install FFmpeg**
   ```bash
   # Ubuntu/Debian
   sudo apt install ffmpeg
   
   # macOS (Homebrew)
   brew install ffmpeg
   
   # Windows: Download from https://ffmpeg.org/
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   python main.py
   ```
   Backend will run on `http://localhost:8000`

2. **Start the Frontend Development Server**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## Usage Guide

### 1. Upload Audio File
- Drag and drop an audio file or click to browse
- Supported formats: MP3, WAV, M4A, AAC, OGG, FLAC
- Maximum file size: 100MB

### 2. Edit Audio
- **Play/Pause**: Use the playback controls
- **Select Region**: Click and drag on the waveform to select a time range
- **Cut Audio**: Select a region and click "Cut Selection"
- **Apply Fade**: Choose fade in/out and duration, then click "Apply"

### 3. AI Source Separation
- **Vocal/Music**: Click "Vocal/Music" to separate vocals from background music
- **Advanced**: Click "Advanced" to separate into vocals, drums, bass, and other instruments
- Processing may take several minutes depending on file size

### 4. Multi-track Management
- **Volume**: Adjust individual track volumes with sliders
- **Mute/Solo**: Mute tracks or solo specific tracks
- **Track Types**: Each separated track has its own controls

### 5. Export Audio
- **Format**: Choose MP3 or WAV
- **Quality**: Select quality level (High/Medium/Low)
- **Export Options**:
  - Full Mix: Combines all active tracks
  - Individual Tracks: Download separated stems

## API Documentation

The backend provides a RESTful API with the following endpoints:

- `POST /upload` - Upload audio file
- `POST /cut` - Cut audio between specified times
- `POST /fade` - Apply fade effects
- `POST /separate/vocal-music` - 2-stem separation
- `POST /separate/instruments` - 4-stem separation
- `POST /export/mix` - Export mixed audio
- `POST /export/track` - Export single track

Full API documentation available at `http://localhost:8000/docs` when running the backend.

## Project Structure

```
audio-editor-pro/
├── src/                          # Frontend source code
│   ├── components/              # React components
│   │   ├── AudioEditor.tsx     # Main editor interface
│   │   ├── WaveformVisualization.tsx
│   │   ├── AudioControls.tsx
│   │   ├── TrackManager.tsx
│   │   └── ExportPanel.tsx
│   ├── services/               # API services
│   ├── types/                  # TypeScript type definitions
│   └── App.tsx                 # Main application component
├── backend/                     # Python backend
│   ├── main.py                 # FastAPI application
│   ├── requirements.txt        # Python dependencies
│   └── README.md              # Backend documentation
├── public/                     # Static assets
└── package.json               # Frontend dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Spleeter** by Deezer for AI source separation
- **FFmpeg** for audio processing
- **Wavesurfer.js** for waveform visualization
- **React** and **FastAPI** communities

## Support

For support, please open an issue on GitHub or contact the development team.

---

**Powered by Websparks AI** - Professional audio editing made simple.
