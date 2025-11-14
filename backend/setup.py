#!/usr/bin/env python3
"""
Setup script for Audio Editor Pro Backend
"""
import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def check_ffmpeg():
    """Check if FFmpeg is installed"""
    try:
        subprocess.run(["ffmpeg", "-version"], capture_output=True, check=True)
        print("✅ FFmpeg is installed")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ FFmpeg is not installed or not in PATH")
        print("Please install FFmpeg:")
        print("  - Windows: Download from https://ffmpeg.org/download.html")
        print("  - macOS: brew install ffmpeg")
        print("  - Ubuntu/Debian: sudo apt install ffmpeg")
        return False

def main():
    print("🎵 Audio Editor Pro Backend Setup")
    print("=" * 40)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    
    # Check FFmpeg
    if not check_ffmpeg():
        print("\n⚠️  FFmpeg is required but not found. Please install it first.")
        return
    
    # Create directories
    directories = ["uploads", "outputs", "temp"]
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✅ Created directory: {directory}")
    
    # Install Python dependencies
    if not run_command(f"{sys.executable} -m pip install --upgrade pip", "Upgrading pip"):
        return
    
    if not run_command(f"{sys.executable} -m pip install -r requirements.txt", "Installing Python dependencies"):
        return
    
    print("\n🎉 Backend setup completed successfully!")
    print("\nTo start the server, run:")
    print("  python main.py")
    print("\nOr:")
    print("  uvicorn main:app --reload --host 0.0.0.0 --port 8000")

if __name__ == "__main__":
    main()
