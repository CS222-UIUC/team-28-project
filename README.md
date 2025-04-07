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
├── app/                    # Backend FastAPI application
│   ├── __init__.py
│   ├── main.py            # Main FastAPI application
│   ├── models/            # Data models
│   │   ├── __init__.py
│   │   └── models.py            # Pydantic models for data validation
│   ├── routers/           # API route definitions
│   │   ├── __init__.py
│   │   ├── calendar_router.py   # Calendar management endpoints
│   │   ├── login_router.py      # Authentication endpoints
│   │   └── nlp_events.py        # Natural language processing endpoints
│   ├── services/          # Service layer
│   │   ├── __init__.py
│   │   └── calendar_service.py  # Google Calendar integration
│   └── utils/             # Utility functions
│       ├── __init__.py
│       └── server.py            # Server configuration utilities
├── StudySync/             # Frontend React Native application
│   ├── app/               # Expo Router app directory
│   ├── backend/           # Authentication server
│   └── assets/            # Static assets
├── nlp/                   # NLP processing
│   └── nlp.py                   # Entity extraction and text processing
├── input.json                   # Sample input for testing
├── output.json                  # Output from processing
├── requirements.txt             # Python dependencies
└── .env                         # Environment variables
```

## Testing Instructions

### Prerequisites
- Node.js and npm installed
- Python 3.x and pip installed
- Virtual environment (recommended)

### Step 1: Kill Any Running Servers
Before starting, ensure no conflicting servers are running:
```bash
# Kill any processes running on our ports
pkill -f "node authServer.js"
lsof -ti:3000,8080,8081 | xargs kill -9
```

### Step 2: Start the Servers
You need to run three servers in separate terminal windows:

1. **Auth Server** (Terminal 1):
```bash
cd StudySync/backend
node authServer.js
```
You should see: `Auth API running at http://localhost:3000`

2. **FastAPI Backend** (Terminal 2):
```bash
cd app
python main.py --server --port 8080
```
You should see: 
```
Starting server on http://127.0.0.1:8080
INFO:     Started server process [xxxxx]
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8080 (Press CTRL+C to quit)
```

3. **Frontend Development Server** (Terminal 3):
```bash
cd StudySync
npm start
```

### Step 3: Launch the Application

After starting all servers, you have several options to run the application:

1. **Web Browser (Recommended for testing):**
   - When the Expo server starts, press `w` to open in web browser
   - The app will open at http://localhost:8081

2. **iOS Simulator:**
   - Press `i` to open iOS simulator options
   - Select your preferred device (e.g., "iPhone SE (3rd generation)")

3. **Android Emulator:**
   - Press `a` to open in Android emulator
   - Make sure you have an Android emulator running

### Step 4: Verify Everything is Running

1. **Check Auth Server:**
```bash
curl http://localhost:3000
```

2. **Check FastAPI Server:**
```bash
curl http://localhost:8080
```
Should return: `{"message":"NLP Task Calendar API is running"}`

3. **Check Frontend:**
- Open http://localhost:8081 in your browser
- You should see the login page

### Troubleshooting

If you encounter any issues:

1. **Port Conflicts:**
   - Follow Step 1 to kill all running servers
   - Restart the servers in order (auth → FastAPI → frontend)

2. **Authentication Issues:**
   - Clear your browser cache and local storage
   - Try logging out and logging back in

3. **Server Connection Issues:**
   - Verify all three servers are running in separate terminals
   - Check console logs for any error messages
   - Ensure you're using `localhost` not IP addresses

4. **Common Fixes:**
   - If the frontend doesn't load: try clearing npm cache (`npm cache clean --force`)
   - If backend fails: check Python virtual environment is activated
   - If auth fails: verify Google OAuth credentials are properly configured

### Development Testing

When making changes:
1. Kill all servers (Step 1)
2. Make your changes
3. Restart all servers in order (Step 2)
4. Test the application (Step 3)

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


