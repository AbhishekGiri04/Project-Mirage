#!/usr/bin/env python3
"""
🎭 Project Mirage - Backend Server Runner
Based on original invisibility cloak algorithm
Run: python run.py
"""
import uvicorn
import os

print("""
🎭 Project Mirage - Invisibility Cloak Backend
============================================
Starting FastAPI server with original OpenCV algorithm...
Backend will run on: http://localhost:8000
WebSocket endpoint: ws://localhost:8000/ws
""")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info"
    )