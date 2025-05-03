from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import argparse
from routers.nlp_events import router as nlp_router

app = FastAPI(
    title="NLP Task Manager",
    description="API for processing natural language tasks and managing them",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(nlp_router, prefix="/nlp")

@app.get("/")
async def root():
    return {"message": "NLP Task Manager API is running"}

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="NLP Task Manager")
    parser.add_argument("--server", action="store_true", help="Run as server")
    parser.add_argument("--port", type=int, default=8080, help="Port to run server on")
    args = parser.parse_args()

    if args.server:
        uvicorn.run(app, host="127.0.0.1", port=args.port) 