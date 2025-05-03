from fastapi import APIRouter, HTTPException, Body
from app.models.models import TaskEvent, EventResponse
from app.services.calendar_service import get_calendar_service
from datetime import datetime, timedelta
import pytz

router = APIRouter()

@router.post("/create_event", response_model=EventResponse)
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

@router.get("/events")
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

@router.get("/event/{event_id}")
async def get_calendar_event(event_id: str):
    """Get a specific calendar event by ID"""
    try:
        service = get_calendar_service()
        
        event = service.events().get(calendarId='primary', eventId=event_id).execute()
        
        return event
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get calendar event: {str(e)}")

@router.delete("/event/{event_id}")
async def delete_calendar_event(event_id: str):
    """Delete a calendar event by ID"""
    try:
        service = get_calendar_service()
        
        service.events().delete(calendarId='primary', eventId=event_id).execute()
        
        return {"message": f"Event {event_id} deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete calendar event: {str(e)}")

@router.post("/create_from_nlp")
async def create_from_nlp(text: str = Body(..., embed=True)):
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
        event_response = await create_calendar_event(task_event)
        
        # Return both the extracted NLP data and the created event
        return {
            "extracted_data": extracted,
            "created_event": event_response
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create event from text: {str(e)}") 

###########################################################edit and save############################

# @router.post("/save_task")
# async def save_task(task: TaskEvent, user: User = Depends(get_current_user)):
#     """
#     Accept a TaskEvent JSON, verify user from token, and save task (e.g. to DB).
#     """
#     try:
#         # Mock behavior: just print for now
#         print("✅ Saving task for:", user.email)
#         print("📝 Task JSON:", task.dict())

#         # 👉 如果你有 DB，这里可以保存 task + user.id
#         # db.save_task(user_id=user.id, task_data=task.dict())

#         return {"message": "Task saved successfully"}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to save task: {str(e)}")