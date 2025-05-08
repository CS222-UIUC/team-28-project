# NLP Task Manager

A modern task management application that uses natural language processing to help users organize their tasks and events.

## Project Structure

```
team-28-project/
├── backend/
│   ├── api/              # Node.js API server (main backend)
│   │   ├── server.cjs
│   │   └── ...           # Other API files
│   ├── nlp/              # Python NLP logic
│   │   ├── nlp.py
│   │   └── ...
│   ├── routers/          # FastAPI routers
│   │   ├── nlp_events.py
│   │   └── ...
│   ├── models/           # Python models
│   ├── services/         # Python services
│   ├── utils/            # Python utilities
│   ├── main.py           # FastAPI app entrypoint
│   ├── test_api_client.py # API test client
│   ├── test_simple_nlp.py # NLP test suite
│   ├── package.json      # Node.js dependencies for backend
│   ├── package-lock.json
│   └── .env              # Backend environment variables (not committed)
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── api/
│   │   ├── utils/
│   │   └── ...
│   ├── assets/           # Images, fonts, etc.
│   ├── App.js            # Expo entrypoint
│   ├── app.json          # Expo config
│   ├── package.json      # Frontend dependencies
│   ├── package-lock.json
│   └── .env              # Frontend environment variables (not committed)
├── app/                  # Additional application code
├── venv/                 # Python virtual environment
├── .expo/                # Expo configuration
├── README.md
├── requirements.txt      # Root Python dependencies
├── .gitignore
├── input.json           # Test input data
└── output.json          # Test output data
```

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Python 3.8 or higher
- pip
- Expo CLI (`npm install -g expo-cli`)

## Setup

### 1. Clone the repository
```bash
git clone [repository-url]
cd team-28-project
```

### 2. Install backend dependencies
```bash
cd backend
npm install # For Node.js API
cd ../frontend
npm install # For frontend
cd ../backend
pip install -r requirements.txt # For FastAPI NLP (if requirements.txt exists)
# Or manually install:
pip install fastapi uvicorn spacy dateparser
python -m spacy download en_core_web_sm
```

### 3. Environment Variables
Create a `.env` file in the `backend` directory with the following content:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
```

## Running the Application

You need to run **three servers** in separate terminal windows:

### 1. Start the FastAPI NLP Server
```bash
cd backend
uvicorn main:app --reload --port 8080
```
- This will start the FastAPI NLP service on port 8080.
- Test it: [http://localhost:8080](http://localhost:8080)

### 2. Start the Node.js API Server
```bash
cd backend/api
node server.cjs
```
- This will start the Node.js backend on port 3000.
- Test it: [http://localhost:3000](http://localhost:3000)

### 3. Start the Frontend (Expo)
```bash
cd frontend
npm start
```
- This will start the Expo development server.
- You can then:
  - Press `i` to open in iOS simulator
  - Press `a` to open in Android emulator
  - Press `w` to open in web browser

## Testing the Integration
- Use the chat UI in the frontend to enter a natural language task (e.g., "meeting with Tom at 2pm Sunday").
- The frontend will send the request to the Node.js backend, which will call the FastAPI NLP service and return extracted task details.

## Troubleshooting
- If you get a 500 error from `/tasks/nlp`, make sure both the Node.js and FastAPI servers are running.
- If you see Python import errors, check that you are in the correct directory and all dependencies are installed.
- If you see CORS errors, make sure CORS is enabled in both backend servers.
- **To kill any processes running on ports 3000, 8080, 8081, or 5432:**
  ```bash
  lsof -ti:3000,8080,8081,5432 | xargs kill -9
  ```

## License
MIT

## Testing

The project includes comprehensive test suites:

### API Tests
```bash
cd backend
python test_api_client.py
```

### NLP Tests
```bash
cd backend
python test_simple_nlp.py
```
