import sys
import os
import argparse
import json
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from routers.nlp_events import router as nlp_router
from routers.login_router import login_router
from routers.calendar_router import router as calendar_router
from utils.server import start_server

# Add a simplified router for direct NLP processing
from nlp.nlp import extract_entities
from app.models.models import TaskEvent
from datetime import datetime

app = FastAPI(
    title="NLP Task Calendar",
    description="API for processing natural language tasks and adding them to Google Calendar",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(calendar_router, prefix="/calendar")
app.include_router(login_router, prefix="/api/login")

@app.post("/process_text")
async def process_single_text(text: str = Body(..., embed=True)):
    """
    Process a single text input and return the extracted entities.
    This is a simplified endpoint for direct NLP processing.
    """
    try:
        extracted = extract_entities(text)
        return {"extracted_data": extracted}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing text: {str(e)}")

@app.get("/")
async def root():
    """Root endpoint to verify the API is running."""
    return {"message": "NLP Task Calendar API is running"}

def process_text_cli():
    """Process text directly from the command line without starting the server"""
    print("=== NLP Task Processing Tool ===")
    print("Enter text to extract task information using NLP.")
    
    while True:
        text = input("\nEnter text (or 'q' to quit): ")
        if text.lower() == 'q':
            break
            
        if not text.strip():
            continue
            
        # Process the text
        extracted = extract_entities(text)
        
        # Create a TaskEvent object
        task_event = TaskEvent(
            task=extracted["task"],
            date=extracted["date"],
            time=extracted["time"],
            end_time=extracted["end_time"],
            participants=extracted["participants"],
            locations=extracted["locations"]
        )
        
        # Get date info for display
        start_date = task_event.date if task_event.date else datetime.now().strftime("%Y-%m-%d")
        start_time = task_event.time if task_event.time else "09:00"
        
        # Print results
        print("\n=== Extracted Information ===")
        print(f"Task: {task_event.task}")
        print(f"Date: {start_date}")
        print(f"Time: {start_time}")
        if task_event.end_time:
            print(f"End Time: {task_event.end_time}")
        if task_event.participants:
            print(f"People: {', '.join(task_event.participants)}")
        if task_event.locations:
            print(f"Locations: {', '.join(task_event.locations)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="NLP Task Calendar")
    
    # Create a mutually exclusive group for the run modes
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--server", action="store_true", help="Start the API server")
    group.add_argument("--process", action="store_true", help="Run in text processing mode")
    
    # Port option for server mode
    parser.add_argument("--port", type=int, default=8000, help="Port to run the server on (when using --server)")
    
    args = parser.parse_args()
    
    if args.process:
        # Run in text processing mode
        process_text_cli()
    else:
        # Default to server mode
        print(f"Starting server on port {args.port}...")
        start_server(app, port=args.port) 