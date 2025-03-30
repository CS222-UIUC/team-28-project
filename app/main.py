import sys
import os
import signal
import psutil
import argparse
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from routers.nlp_events import router as nlp_router, direct_process
from routers.login_router import login_router
from services.calendar_service import get_calendar_service
from datetime import datetime, timedelta
import pytz
from pydantic import BaseModel
from typing import List, Optional

class TaskEvent(BaseModel):
    """Model for a task to be converted to a calendar event"""
    task: str
    date: Optional[str] = None
    time: Optional[str] = None
    end_time: Optional[str] = None
    participants: List[str] = []
    locations: List[str] = []

class EventResponse(BaseModel):
    """Model for calendar event response"""
    event_id: str
    html_link: str
    summary: str
    start: dict
    end: dict
    status: str

def kill_process_on_port(port):
    """Kill any process that is currently using the specified port."""
    try:
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                if 'python' in proc.info['name'] and any('app/main.py' in cmd for cmd in proc.info['cmdline'] if cmd):
                    if proc.pid != os.getpid():  # Don't kill ourselves
                        print(f"Killing previous instance of the application (PID: {proc.pid})")
                        os.kill(proc.pid, signal.SIGTERM)
                        # Wait a moment for the process to terminate
                        try:
                            proc.wait(timeout=2)
                        except psutil.TimeoutExpired:
                            # If it doesn't terminate gracefully, force kill
                            os.kill(proc.pid, signal.SIGKILL)
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                continue
    except Exception as e:
        print(f"Error while attempting to kill process on port {port}: {e}")

def start_server(port=8000):
    """Start the FastAPI server"""
    import uvicorn
    
    print(f"Starting server on http://127.0.0.1:{port}")
    
    kill_process_on_port(port)
    
    uvicorn.run(app, host="127.0.0.1", port=port)

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

app.include_router(nlp_router, prefix="/nlp")
app.include_router(login_router, prefix="/api/login")
@app.get("/")
async def root():
    """Root endpoint to verify the API is running."""
    return {"message": "NLP Task Calendar API is running"} 

@app.get("/process_input_file")
async def redirect_to_process_file():
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/nlp/process_file")

# Calendar integration endpoints
@app.post("/calendar/create_event", response_model=EventResponse)
async def create_calendar_event(task_event: TaskEvent):
    """Create a Google Calendar event from extracted task data"""
    try:
        # Get Google Calendar service
        service = get_calendar_service()
        
        # Extract date and time information, or use defaults
        start_date = task_event.date if task_event.date else datetime.now().strftime("%Y-%m-%d")
        start_time = task_event.time if task_event.time else "09:00"
        
        # Get system timezone automatically - this uses the server/device timezone
        try:
            system_tz = datetime.now().astimezone().tzinfo
        except:
            system_tz = pytz.UTC
        
        # Parse start datetime and apply system timezone
        start_datetime = datetime.strptime(f"{start_date} {start_time}", "%Y-%m-%d %H:%M")
        start_datetime = start_datetime.replace(tzinfo=system_tz)
        
        # Set end time based on end_time field if available, otherwise default to 1 hour later
        if task_event.end_time:
            end_datetime = datetime.strptime(f"{start_date} {task_event.end_time}", "%Y-%m-%d %H:%M")
            end_datetime = end_datetime.replace(tzinfo=system_tz)
            
            if end_datetime <= start_datetime:
                end_datetime = end_datetime + timedelta(days=1)
        else:
            end_datetime = start_datetime + timedelta(hours=1)
        
        description = task_event.task
        
        if task_event.participants:
            description += "\n\nParticipants: " + ", ".join(task_event.participants)
            
        location = ", ".join(task_event.locations) if task_event.locations else ""
        
        event = {
            'summary': task_event.task,
            'location': location,
            'description': description,
            'start': {
                'dateTime': start_datetime.isoformat(),
                'timeZone': str(system_tz)
            },
            'end': {
                'dateTime': end_datetime.isoformat(),
                'timeZone': str(system_tz)
            },
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'email', 'minutes': 24 * 60},
                    {'method': 'popup', 'minutes': 30},
                ],
            },
        }
        
        if task_event.participants:
            event['attendees'] = [{'email': f"{participant.lower().replace(' ', '.')}@example.com"} 
                                 for participant in task_event.participants]
        
        # Call the Calendar API
        event = service.events().insert(calendarId='primary', body=event).execute()
        
        return EventResponse(
            event_id=event['id'],
            html_link=event['htmlLink'],
            summary=event['summary'],
            start=event['start'],
            end=event['end'],
            status=event['status']
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create calendar event: {str(e)}")

@app.get("/calendar/events")
async def list_calendar_events(max_results: int = 10):
    """List upcoming calendar events"""
    try:
        service = get_calendar_service()
        
        # Get the current time in ISO format
        now = datetime.utcnow().isoformat() + 'Z' 
        
        # Call the Calendar API
        events_result = service.events().list(
            calendarId='primary',
            timeMin=now,
            maxResults=max_results,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        events = events_result.get('items', [])
        
        if not events:
            return {"message": "No upcoming events found."}
            
        return {"events": events}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list calendar events: {str(e)}")

@app.get("/calendar/event/{event_id}")
async def get_calendar_event(event_id: str):
    """Get a specific calendar event by ID"""
    try:
        service = get_calendar_service()
        
        event = service.events().get(calendarId='primary', eventId=event_id).execute()
        
        return event
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get calendar event: {str(e)}")

@app.delete("/calendar/event/{event_id}")
async def delete_calendar_event(event_id: str):
    """Delete a calendar event by ID"""
    try:
        service = get_calendar_service()
        
        service.events().delete(calendarId='primary', eventId=event_id).execute()
        
        return {"message": f"Event {event_id} deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete calendar event: {str(e)}")

@app.post("/calendar/create_from_nlp")
async def create_from_nlp(text: str):
    """Process natural language text and create a calendar event from it"""
    try:
        # Extract task information using NLP
        from nlp.nlp import extract_entities
        extracted = extract_entities(text)
        
        # Create a TaskEvent from the extracted information
        task_event = TaskEvent(
            task=extracted["task"],
            date=extracted["date"],
            time=extracted["time"],
            end_time=extracted["end_time"],
            participants=extracted["participants"],
            locations=extracted["locations"]
        )
        
        # Create calendar event
        return await create_calendar_event(task_event)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create event from text: {str(e)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="NLP Task Calendar")
    parser.add_argument("--server", action="store_true", help="Start the API server")
    parser.add_argument("--process", action="store_true", help="Process input.json file")
    parser.add_argument("--text", type=str, help="Process text and add to calendar")
    args = parser.parse_args()
    
    if args.text:
        import asyncio
        result = asyncio.run(create_from_nlp(args.text))
        print(f"Event created: {result.html_link}")
    elif args.process:
        print("Processing input.json file...")
        direct_process()
    elif args.server:
        start_server()
    else:
        # Default behavior
        print("Starting the application...")
        direct_process() 