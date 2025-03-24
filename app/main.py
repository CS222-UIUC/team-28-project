import sys
import os
# Add the project root directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import nlp_events

app = FastAPI(
    title="Calendar API",
    description="API for managing Google Calendar events",
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
app.include_router(nlp_events.router)

@app.get("/")
async def root():
    """Root endpoint to verify the API is running."""
    return {"message": "Calendar API is running"} 

# Run the application when main.py is executed directly
if __name__ == "__main__":
    import uvicorn
    print("Starting the application...")
    uvicorn.run(app, host="127.0.0.1", port=8000) 