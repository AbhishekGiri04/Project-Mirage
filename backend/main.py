from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import base64
import json
import time

app = FastAPI(title="🎭 Project Mirage - Invisibility Cloak API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InvisibilityProcessor:
    def __init__(self):
        self.background = None
        self.frame_count = 0
        
    def process_frame(self, frame):
        """Process frame using original invisibility cloak algorithm"""
        # Flip image horizontally (mirror effect)
        img = np.flip(frame, axis=1)
        
        # Capture background for first 30 frames
        if self.frame_count < 30:
            self.background = img.copy()
            self.frame_count += 1
            return img
            
        # Converting image to HSV color space
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # Gaussian blur for noise reduction
        value = (35, 35)
        blurred = cv2.GaussianBlur(hsv, value, 0)
        
        # Defining lower range for red color detection
        lower_red = np.array([0, 120, 70])
        upper_red = np.array([10, 255, 255])
        mask1 = cv2.inRange(hsv, lower_red, upper_red)
        
        # Defining upper range for red color detection
        lower_red = np.array([170, 120, 70])
        upper_red = np.array([180, 255, 255])
        mask2 = cv2.inRange(hsv, lower_red, upper_red)
        
        # Addition of the two masks to generate the final mask
        mask = mask1 + mask2
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
        
        # Replacing pixels corresponding to cloak with the background pixels
        if self.background is not None:
            img[np.where(mask == 255)] = self.background[np.where(mask == 255)]
        
        return img

processor = InvisibilityProcessor()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    try:
        while True:
            # Receive frame from React
            data = await websocket.receive_text()
            frame_data = json.loads(data)
            
            # Decode base64 image
            img_data = base64.b64decode(frame_data['image'].split(',')[1])
            nparr = np.frombuffer(img_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # Process frame
            processed_frame = processor.process_frame(frame)
            
            # Encode back to base64
            _, buffer = cv2.imencode('.jpg', processed_frame)
            img_base64 = base64.b64encode(buffer).decode('utf-8')
            
            # Send back to React
            await websocket.send_text(json.dumps({
                'processed_image': f'data:image/jpeg;base64,{img_base64}'
            }))
            
    except WebSocketDisconnect:
        pass

@app.get("/")
async def root():
    return {
        "message": "🎭 Project Mirage - Invisibility Cloak API is running!",
        "description": "Real-time invisibility effects using advanced OpenCV algorithms",
        "endpoints": {
            "websocket": "/ws",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "invisibility-cloak-api"}