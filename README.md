# NLP Task Calendar

A FastAPI application that processes natural language task descriptions, extracts relevant information (dates, times, participants, locations), and integrates with Google Calendar for event management.

## Features

- **Natural Language Processing**: Extract entities from text descriptions
- **Task Management**: Convert natural language text into structured task data
- **Calendar Integration**: Create, view, and manage events in Google Calendar
- **RESTful API**: Well-structured API endpoints for all functionality
- **Authentication**: Basic authentication for API access

## Project Structure

The project follows a modular approach for better maintainability:

```
team-28-project/
├── app/
│   ├── __init__.py
│   ├── main.py                  # Main FastAPI application
│   ├── models/                  # Data models
│   │   ├── __init__.py
│   │   └── models.py            # Pydantic models for data validation
│   ├── routers/                 # API route definitions
│   │   ├── __init__.py
│   │   ├── calendar_router.py   # Calendar management endpoints
│   │   ├── login_router.py      # Authentication endpoints
│   │   └── nlp_events.py        # Natural language processing endpoints
│   ├── services/                # Service layer
│   │   ├── __init__.py
│   │   └── calendar_service.py  # Google Calendar integration
│   └── utils/                   # Utility functions
│       ├── __init__.py
│       └── server.py            # Server configuration utilities
├── nlp/                         # NLP processing
│   └── nlp.py                   # Entity extraction and text processing
├── input.json                   # Sample input for testing
├── output.json                  # Output from processing
├── requirements.txt             # Project dependencies
└── .env                         # Environment variables
```


### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/team-28-project.git
cd team-28-project
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```


### Running the Application

Start the server:
```bash
cd app
python main.py --port 8000
```

The API will be accessible at `http://localhost:8000`.


### NLP Processing

- **POST /nlp/process**: Process text input and extract entities
- **GET /nlp/process_file**: Process input.json file and generate output.json

### Calendar Integration

- **POST /calendar/create_event**: Create a calendar event
- **GET /calendar/events**: List upcoming calendar events
- **GET /calendar/event/{event_id}**: Get event details
- **DELETE /calendar/event/{event_id}**: Delete an event
- **POST /calendar/create_from_nlp**: Process text and create a calendar event

### Authentication

- **POST /api/login**: User authentication endpoint

## Testing

Test NLP functionality with the provided test scripts:

```bash
cd app
python test_nlp.py        # Tests processing of input.json
python test_single_nlp.py # Tests processing individual text inputs
```


