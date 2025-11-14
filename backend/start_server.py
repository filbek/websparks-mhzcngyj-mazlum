#!/usr/bin/env python3
"""
Start script for Audio Editor Pro Backend
"""
import uvicorn
import sys
import os
from pathlib import Path

def create_directories():
    """Create necessary directories"""
    directories = ["uploads", "outputs", "temp"]
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✅ Directory ready: {directory}")

def main():
    print("🎵 Starting Audio Editor Pro Backend Server")
    print("=" * 45)
    
    # Create directories
    create_directories()
    
    print("\n🚀 Starting server on http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🔄 Server will auto-reload on code changes")
    print("\nPress Ctrl+C to stop the server")
    print("-" * 45)
    
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Server error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
