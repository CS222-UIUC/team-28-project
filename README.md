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

## Running the Application

### Server Mode

Start the API server:
```bash
python app/main.py --server --port 8000
```

The API will be accessible at `http://localhost:8000`.

### Direct Text Processing Mode

Process text directly from the command line without starting the server:
```bash
python app/main.py --process
```

## Testing Tools

The project includes several tools for testing and troubleshooting:

### 1. Simple NLP Testing

Test NLP functionality without Google Calendar integration:
```bash
python app/test_simple_nlp.py
```

### 2. Google OAuth Troubleshooter

Fix Google Calendar authentication issues, especially for the "redirect_uri_mismatch" error:
```bash
python app/fix_google_oauth.py
```
- Identify redirect URI issues
- Test authentication with different URIs
- Provides step-by-step guidance for fixing authentication problems

### 3. API Client

Test the full API with both text processing and calendar event creation:
```bash
python app/test_api_client.py
```
This requires the server to be running (`python app/main.py --server`).


