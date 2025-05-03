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