# NLP Task Manager

A modern task management application that uses natural language processing to help users organize their tasks and events.

## Project Structure

```
team-28-project/
├── backend/
│   ├── auth/           # Authentication server
│   ├── database/       # Database server
│   └── api/           # API server
├── frontend/          # React Native frontend
└── app/              # FastAPI backend
```

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Python 3.8 or higher
- Expo CLI (`npm install -g expo-cli`)

## Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd team-28-project
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install --legacy-peer-deps
```

4. Create `.env` file in the backend directory with the following content:
```env
# Supabase Configuration
SUPABASE_URL=https://yqaxgrgxkwrmtukyyacs.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxYXhncmd4a3dybXR1a3l5YWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NTI5MjEsImV4cCI6MjA2MDQyODkyMX0.HmgFnGy2XrnCfy3lOIWx0krb_1Y-2OSboJfilp6_2To

# Server Ports
AUTH_PORT=3000
API_PORT=8080
DB_PORT=5432

# JWT Secret
JWT_SECRET=2SeaijQwTDidfocM2XTadiMIe2G63KR26jmB7/U9hoAPf485KO2sLJ7whf7nMFpfyAaTL2MP/RJv9TLX0VizRA==
```

## Running the Application

You'll need to run three servers in separate terminal windows:

1. Start the Auth Server:
```bash
cd backend
node auth/server.js
```
This will start the authentication server on port 3000.

2. Start the Database Server:
```bash
cd backend
node database/server.js
```
This will start the database server on port 5432.

3. Start the Frontend:
```bash
cd frontend
npm start
```
This will start the Expo development server. You can then:
- Press `i` to open in iOS simulator
- Press `a` to open in Android emulator
- Press `w` to open in web browser
- Scan the QR code with Expo Go app on your phone

## Features

- Natural Language Processing for task extraction
- Task Management
- User Authentication
- Database Integration with Supabase
- Modern UI with React Native

## Development

- Backend API runs on port 8080
- Auth server runs on port 3000
- Database server runs on port 5432
- Frontend development server runs on port 8081

## Troubleshooting

### Common Issues

1. **Port Conflicts**:
   ```bash
   # Kill any processes running on our ports
   lsof -ti:3000,8080,8081,5432 | xargs kill -9
   ```

2. **Database Connection Issues**:
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure the database server is running

3. **Authentication Issues**:
   - Clear browser cache and local storage
   - Verify JWT_SECRET in `.env`
   - Check auth service logs

4. **Frontend Issues**:
   - Clear npm cache: `npm cache clean --force`
   - Remove node_modules and reinstall
   - Check Expo logs for errors

## Development

When making changes:
1. Kill all running servers
2. Make your changes
3. Restart all servers in order (auth → api → db → frontend)
4. Test the application

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
