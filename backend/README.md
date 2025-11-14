# Audio Editor Pro Backend

## Quick Start

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Install FFmpeg:**
   - **Windows:** Download from https://ffmpeg.org/download.html
   - **macOS:** `brew install ffmpeg`
   - **Ubuntu/Linux:** `sudo apt install ffmpeg`

3. **Start the server:**
   ```bash
   python main.py
   ```

4. **Test the server:**
   - Open http://localhost:8000
   - Check health: http://localhost:8000/health
   - API docs: http://localhost:8000/docs

## Features

- Audio file upload and processing
- Cut/trim audio with precise timing
- Fade in/out effects
- Basic vocal/music separation
- Frequency-based instrument separation
- Multi-format export (MP3, WAV)

## Requirements

- Python 3.8+
- FFmpeg (for audio processing)
- FastAPI and dependencies (see requirements.txt)

## Directory Structure

```
backend/
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
├── README.md           # This file
├── uploads/            # Uploaded files (auto-created)
├── outputs/            # Processed files (auto-created)
└── temp/              # Temporary files (auto-created)
```
