import sys
import os
import argparse
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.nlp_events import router as nlp_router
from routers.login_router import login_router
from routers.calendar_router import router as calendar_router
from utils.server import start_server

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
app.include_router(nlp_router, prefix="/nlp")
app.include_router(login_router, prefix="/api/login")
app.include_router(calendar_router, prefix="/calendar")

@app.get("/")
async def root():
    """Root endpoint to verify the API is running."""
    return {"message": "NLP Task Calendar API is running"} 

@app.get("/process_input_file")
async def redirect_to_process_file():
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/nlp/process_file")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run the NLP Task Calendar API server")
    parser.add_argument("--port", type=int, default=8000, help="Port to run the server on")
    args = parser.parse_args()
    
    start_server(app, port=args.port) 