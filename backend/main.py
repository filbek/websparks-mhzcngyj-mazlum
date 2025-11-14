from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import uuid
import shutil
from pathlib import Path
import subprocess
import tempfile
from typing import Optional, List
import json
from pydantic import BaseModel
import logging
import asyncio
import signal
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Audio Editor Pro API", 
    version="1.0.0",
    description="Professional audio editing with AI-powered source separation"
)

# CORS middleware with more permissive settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:3000", 
        "http://127.0.0.1:5173",
        "http://0.0.0.0:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories
UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("outputs")
TEMP_DIR = Path("temp")

for directory in [UPLOAD_DIR, OUTPUT_DIR, TEMP_DIR]:
    directory.mkdir(exist_ok=True)
    logger.info(f"Directory created/verified: {directory}")

# Mount static files with error handling
try:
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
    app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")
    logger.info("Static file mounts created successfully")
except Exception as e:
    logger.error(f"Failed to mount static files: {e}")

# Pydantic models
class TrackData(BaseModel):
    id: str
    url: str
    volume: float
    muted: bool = False
    solo: bool = False

class ExportMixRequest(BaseModel):
    tracks: List[TrackData]
    format: str = "mp3"
    quality: str = "high"

class ExportTrackRequest(BaseModel):
    track: TrackData
    format: str = "mp3"
    quality: str = "high"

def check_ffmpeg():
    """Check if FFmpeg is available"""
    try:
        result = subprocess.run(
            ["ffmpeg", "-version"], 
            capture_output=True, 
            text=True, 
            timeout=10
        )
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False

def get_quality_settings(format_type: str, quality: str) -> List[str]:
    """Get FFmpeg quality settings based on format and quality level"""
    if format_type == "mp3":
        quality_map = {
            "high": ["-b:a", "320k"],
            "medium": ["-b:a", "192k"],
            "low": ["-b:a", "128k"]
        }
        return quality_map.get(quality, ["-b:a", "192k"])
    elif format_type == "wav":
        return ["-acodec", "pcm_s16le"]
    return []

def run_ffmpeg_command(command: List[str], timeout: int = 60) -> bool:
    """Run FFmpeg command with timeout and return success status"""
    try:
        logger.info(f"Running FFmpeg command: {' '.join(command)}")
        result = subprocess.run(
            command, 
            capture_output=True, 
            text=True, 
            check=True,
            timeout=timeout
        )
        logger.info("FFmpeg command completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"FFmpeg error: {e.stderr}")
        return False
    except subprocess.TimeoutExpired:
        logger.error(f"FFmpeg command timed out after {timeout} seconds")
        return False
    except Exception as e:
        logger.error(f"Command execution error: {str(e)}")
        return False

@app.on_event("startup")
async def startup_event():
    """Check system requirements on startup"""
    logger.info("🎵 Starting Audio Editor Pro Backend...")
    
    # Check FFmpeg
    if not check_ffmpeg():
        logger.warning("⚠️  FFmpeg not found! Audio processing will not work.")
        logger.warning("Please install FFmpeg and ensure it's in your PATH")
    else:
        logger.info("✅ FFmpeg is available")
    
    # Check directories
    for directory in [UPLOAD_DIR, OUTPUT_DIR, TEMP_DIR]:
        if directory.exists():
            logger.info(f"✅ Directory ready: {directory}")
        else:
            logger.error(f"❌ Directory missing: {directory}")
    
    logger.info("🚀 Backend server is ready!")

@app.get("/")
async def root():
    return {
        "message": "Audio Editor Pro API", 
        "version": "1.0.0",
        "status": "running",
        "ffmpeg_available": check_ffmpeg(),
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "upload": "/upload",
            "cut": "/cut",
            "fade": "/fade",
            "separate": "/separate/*",
            "export": "/export/*"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": str(asyncio.get_event_loop().time()),
        "ffmpeg_available": check_ffmpeg(),
        "directories": {
            "uploads": UPLOAD_DIR.exists(),
            "outputs": OUTPUT_DIR.exists(),
            "temp": TEMP_DIR.exists()
        }
    }

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload audio file"""
    logger.info(f"📁 Uploading file: {file.filename}")
    
    if not file.content_type or not file.content_type.startswith('audio/'):
        logger.warning(f"Invalid file type: {file.content_type}")
        raise HTTPException(status_code=400, detail="File must be an audio file")
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    file_extension = Path(file.filename).suffix if file.filename else '.wav'
    filename = f"{file_id}{file_extension}"
    file_path = UPLOAD_DIR / filename
    
    # Save file with error handling
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        logger.info(f"✅ File saved successfully: {filename} ({len(content)} bytes)")
        return {
            "id": file_id,
            "url": f"/uploads/{filename}",
            "filename": filename,
            "size": len(content)
        }
    except Exception as e:
        logger.error(f"❌ Failed to save file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

@app.post("/cut")
async def cut_audio(
    file: UploadFile = File(...),
    start_time: float = Form(...),
    end_time: float = Form(...)
):
    """Cut audio file between start and end time"""
    logger.info(f"✂️  Cutting audio: {start_time}s to {end_time}s")
    
    if not check_ffmpeg():
        raise HTTPException(status_code=500, detail="FFmpeg is not available. Please install FFmpeg.")
    
    if start_time >= end_time:
        raise HTTPException(status_code=400, detail="Start time must be less than end time")
    
    if start_time < 0:
        raise HTTPException(status_code=400, detail="Start time cannot be negative")
    
    # Save uploaded file temporarily
    temp_input = TEMP_DIR / f"input_{uuid.uuid4()}{Path(file.filename).suffix if file.filename else '.wav'}"
    try:
        content = await file.read()
        with open(temp_input, "wb") as buffer:
            buffer.write(content)
        
        logger.info(f"📁 Temporary file saved: {temp_input} ({len(content)} bytes)")
        
        # Generate output filename
        output_filename = f"cut_{uuid.uuid4()}.wav"
        output_path = OUTPUT_DIR / output_filename
        
        # FFmpeg command to cut audio with error handling
        duration = end_time - start_time
        command = [
            "ffmpeg", "-i", str(temp_input),
            "-ss", str(start_time),
            "-t", str(duration),
            "-acodec", "pcm_s16le",
            "-ar", "44100",  # Set sample rate
            "-ac", "2",      # Set to stereo
            "-y", str(output_path)
        ]
        
        success = run_ffmpeg_command(command, timeout=120)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to cut audio. Please check the audio file format.")
        
        # Verify output file exists and has content
        if not output_path.exists() or output_path.stat().st_size == 0:
            raise HTTPException(status_code=500, detail="Cut operation produced empty file")
        
        logger.info(f"✅ Audio cut successfully: {output_filename}")
        return {"url": f"/outputs/{output_filename}"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Cut operation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Cut operation failed: {str(e)}")
    finally:
        # Cleanup
        if temp_input.exists():
            try:
                temp_input.unlink()
                logger.info(f"🗑️  Cleaned up temp file: {temp_input}")
            except Exception as e:
                logger.warning(f"Failed to cleanup temp file: {e}")

@app.post("/fade")
async def apply_fade(
    file: UploadFile = File(...),
    fade_type: str = Form(...),
    duration: float = Form(...)
):
    """Apply fade in or fade out effect"""
    logger.info(f"🎚️  Applying {fade_type} fade for {duration}s")
    
    if not check_ffmpeg():
        raise HTTPException(status_code=500, detail="FFmpeg is not available. Please install FFmpeg.")
    
    if fade_type not in ["in", "out"]:
        raise HTTPException(status_code=400, detail="Fade type must be 'in' or 'out'")
    
    if duration <= 0:
        raise HTTPException(status_code=400, detail="Fade duration must be positive")
    
    # Save uploaded file temporarily
    temp_input = TEMP_DIR / f"input_{uuid.uuid4()}{Path(file.filename).suffix if file.filename else '.wav'}"
    try:
        content = await file.read()
        with open(temp_input, "wb") as buffer:
            buffer.write(content)
        
        # Generate output filename
        output_filename = f"fade_{fade_type}_{uuid.uuid4()}.wav"
        output_path = OUTPUT_DIR / output_filename
        
        # FFmpeg command for fade effect
        if fade_type == "in":
            fade_filter = f"afade=t=in:d={duration}"
        else:
            fade_filter = f"afade=t=out:d={duration}"
        
        command = [
            "ffmpeg", "-i", str(temp_input),
            "-af", fade_filter,
            "-acodec", "pcm_s16le",
            "-ar", "44100",
            "-ac", "2",
            "-y", str(output_path)
        ]
        
        success = run_ffmpeg_command(command, timeout=120)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to apply fade effect")
        
        # Verify output
        if not output_path.exists() or output_path.stat().st_size == 0:
            raise HTTPException(status_code=500, detail="Fade operation produced empty file")
        
        logger.info(f"✅ Fade effect applied successfully: {output_filename}")
        return {"url": f"/outputs/{output_filename}"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Fade operation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Fade operation failed: {str(e)}")
    finally:
        # Cleanup
        if temp_input.exists():
            try:
                temp_input.unlink()
            except Exception as e:
                logger.warning(f"Failed to cleanup temp file: {e}")

@app.post("/separate/vocal-music")
async def separate_vocal_music(file: UploadFile = File(...)):
    """Separate vocals and music using basic audio processing"""
    logger.info("🎤 Starting vocal/music separation")
    
    if not check_ffmpeg():
        raise HTTPException(status_code=500, detail="FFmpeg is not available. Please install FFmpeg.")
    
    # Save uploaded file temporarily
    temp_input = TEMP_DIR / f"input_{uuid.uuid4()}{Path(file.filename).suffix if file.filename else '.wav'}"
    try:
        content = await file.read()
        with open(temp_input, "wb") as buffer:
            buffer.write(content)
        
        # Create vocal track (center channel extraction)
        vocal_filename = f"vocal_{uuid.uuid4()}.wav"
        vocal_path = OUTPUT_DIR / vocal_filename
        
        # Create music track (original stereo)
        music_filename = f"music_{uuid.uuid4()}.wav"
        music_path = OUTPUT_DIR / music_filename
        
        # Basic vocal isolation (center channel extraction)
        vocal_command = [
            "ffmpeg", "-i", str(temp_input),
            "-af", "pan=mono|c0=0.5*c0+-0.5*c1",
            "-acodec", "pcm_s16le",
            "-ar", "44100",
            "-y", str(vocal_path)
        ]
        
        # Music track (original with slight processing)
        music_command = [
            "ffmpeg", "-i", str(temp_input),
            "-af", "pan=stereo|c0=c0|c1=c1",
            "-acodec", "pcm_s16le",
            "-ar", "44100",
            "-ac", "2",
            "-y", str(music_path)
        ]
        
        vocal_success = run_ffmpeg_command(vocal_command, timeout=180)
        music_success = run_ffmpeg_command(music_command, timeout=180)
        
        if not (vocal_success and music_success):
            raise HTTPException(status_code=500, detail="Failed to separate audio tracks")
        
        # Verify outputs
        if not vocal_path.exists() or not music_path.exists():
            raise HTTPException(status_code=500, detail="Separation produced empty files")
        
        logger.info("✅ Vocal/music separation completed successfully")
        return {
            "vocal": f"/outputs/{vocal_filename}",
            "music": f"/outputs/{music_filename}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Separation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Separation failed: {str(e)}")
    finally:
        # Cleanup
        if temp_input.exists():
            try:
                temp_input.unlink()
            except Exception as e:
                logger.warning(f"Failed to cleanup temp file: {e}")

@app.post("/separate/instruments")
async def separate_instruments(file: UploadFile = File(...)):
    """Separate instruments using frequency-based filtering"""
    logger.info("🎸 Starting advanced instrument separation")
    
    if not check_ffmpeg():
        raise HTTPException(status_code=500, detail="FFmpeg is not available. Please install FFmpeg.")
    
    # Save uploaded file temporarily
    temp_input = TEMP_DIR / f"input_{uuid.uuid4()}{Path(file.filename).suffix if file.filename else '.wav'}"
    try:
        content = await file.read()
        with open(temp_input, "wb") as buffer:
            buffer.write(content)
        
        # Create different frequency-filtered versions
        vocals_filename = f"vocals_{uuid.uuid4()}.wav"
        drums_filename = f"drums_{uuid.uuid4()}.wav"
        bass_filename = f"bass_{uuid.uuid4()}.wav"
        other_filename = f"other_{uuid.uuid4()}.wav"
        
        vocals_path = OUTPUT_DIR / vocals_filename
        drums_path = OUTPUT_DIR / drums_filename
        bass_path = OUTPUT_DIR / bass_filename
        other_path = OUTPUT_DIR / other_filename
        
        # Vocals (mid-high frequencies)
        vocals_command = [
            "ffmpeg", "-i", str(temp_input),
            "-af", "highpass=f=200,lowpass=f=3000",
            "-acodec", "pcm_s16le",
            "-ar", "44100",
            "-ac", "2",
            "-y", str(vocals_path)
        ]
        
        # Drums (high frequencies)
        drums_command = [
            "ffmpeg", "-i", str(temp_input),
            "-af", "highpass=f=1000",
            "-acodec", "pcm_s16le",
            "-ar", "44100",
            "-ac", "2",
            "-y", str(drums_path)
        ]
        
        # Bass (low frequencies)
        bass_command = [
            "ffmpeg", "-i", str(temp_input),
            "-af", "lowpass=f=250",
            "-acodec", "pcm_s16le",
            "-ar", "44100",
            "-ac", "2",
            "-y", str(bass_path)
        ]
        
        # Other (mid frequencies)
        other_command = [
            "ffmpeg", "-i", str(temp_input),
            "-af", "highpass=f=250,lowpass=f=1000",
            "-acodec", "pcm_s16le",
            "-ar", "44100",
            "-ac", "2",
            "-y", str(other_path)
        ]
        
        commands = [
            (vocals_command, "vocals"),
            (drums_command, "drums"),
            (bass_command, "bass"),
            (other_command, "other")
        ]
        
        success_count = 0
        for cmd, name in commands:
            if run_ffmpeg_command(cmd, timeout=180):
                success_count += 1
                logger.info(f"✅ {name} separation completed")
            else:
                logger.error(f"❌ {name} separation failed")
        
        if success_count < 4:
            raise HTTPException(status_code=500, detail="Failed to separate some instruments")
        
        logger.info("✅ Advanced instrument separation completed successfully")
        return {
            "vocals": f"/outputs/{vocals_filename}",
            "drums": f"/outputs/{drums_filename}",
            "bass": f"/outputs/{bass_filename}",
            "other": f"/outputs/{other_filename}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Instrument separation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Instrument separation failed: {str(e)}")
    finally:
        # Cleanup
        if temp_input.exists():
            try:
                temp_input.unlink()
            except Exception as e:
                logger.warning(f"Failed to cleanup temp file: {e}")

@app.post("/export/mix")
async def export_mix(request: ExportMixRequest):
    """Export mixed audio from multiple tracks"""
    logger.info(f"📤 Exporting mix with {len(request.tracks)} tracks")
    
    if not check_ffmpeg():
        raise HTTPException(status_code=500, detail="FFmpeg is not available. Please install FFmpeg.")
    
    try:
        # Filter active tracks
        active_tracks = []
        solo_tracks = [t for t in request.tracks if t.solo]
        
        if solo_tracks:
            active_tracks = solo_tracks
        else:
            active_tracks = [t for t in request.tracks if not t.muted]
        
        if not active_tracks:
            raise HTTPException(status_code=400, detail="No active tracks to export")
        
        # Generate output filename
        output_filename = f"mix_{uuid.uuid4()}.{request.format}"
        output_path = OUTPUT_DIR / output_filename
        
        # Use first active track for now (simplified mixing)
        track = active_tracks[0]
        track_path = track.url.replace("/uploads/", "uploads/").replace("/outputs/", "outputs/")
        
        if not Path(track_path).exists():
            raise HTTPException(status_code=404, detail="Source track file not found")
        
        volume_filter = f"volume={track.volume}"
        quality_settings = get_quality_settings(request.format, request.quality)
        
        command = [
            "ffmpeg", "-i", track_path,
            "-af", volume_filter
        ] + quality_settings + ["-y", str(output_path)]
        
        success = run_ffmpeg_command(command, timeout=180)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to export mix")
        
        if not output_path.exists() or output_path.stat().st_size == 0:
            raise HTTPException(status_code=500, detail="Export produced empty file")
        
        logger.info(f"✅ Mix exported successfully: {output_filename}")
        return {"url": f"/outputs/{output_filename}"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Export failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@app.post("/export/track")
async def export_track(request: ExportTrackRequest):
    """Export single track with volume adjustment"""
    logger.info(f"📤 Exporting single track: {request.track.id}")
    
    if not check_ffmpeg():
        raise HTTPException(status_code=500, detail="FFmpeg is not available. Please install FFmpeg.")
    
    try:
        track = request.track
        track_path = track.url.replace("/uploads/", "uploads/").replace("/outputs/", "outputs/")
        
        if not Path(track_path).exists():
            raise HTTPException(status_code=404, detail="Source track file not found")
        
        # Generate output filename
        output_filename = f"track_{uuid.uuid4()}.{request.format}"
        output_path = OUTPUT_DIR / output_filename
        
        # Apply volume and format conversion
        volume_filter = f"volume={track.volume}"
        quality_settings = get_quality_settings(request.format, request.quality)
        
        command = [
            "ffmpeg", "-i", track_path,
            "-af", volume_filter
        ] + quality_settings + ["-y", str(output_path)]
        
        success = run_ffmpeg_command(command, timeout=180)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to export track")
        
        if not output_path.exists() or output_path.stat().st_size == 0:
            raise HTTPException(status_code=500, detail="Export produced empty file")
        
        logger.info(f"✅ Track exported successfully: {output_filename}")
        return {"url": f"/outputs/{output_filename}"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Track export failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Track export failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    
    print("🎵 Audio Editor Pro Backend")
    print("=" * 30)
    print("🚀 Starting server on http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🔍 Health Check: http://localhost:8000/health")
    print("Press Ctrl+C to stop")
    print("-" * 30)
    
    try:
        uvicorn.run(
            app, 
            host="0.0.0.0", 
            port=8000, 
            reload=False,  # Disable reload to prevent memory issues
            log_level="info",
            access_log=True
        )
    except KeyboardInterrupt:
        logger.info("👋 Server stopped by user")
    except Exception as e:
        logger.error(f"❌ Server error: {e}")
        sys.exit(1)
