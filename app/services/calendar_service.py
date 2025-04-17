from fastapi import HTTPException
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import os

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/calendar']

def get_calendar_service():
    """Get an authorized Google Calendar service instance."""
    creds = None
    
    # Check for credentials.json file first
    credentials_file = 'credentials.json'
    if not os.path.exists(credentials_file):
        # Try looking in common locations
        possible_locations = [
            'credentials.json',
            os.path.join(os.path.dirname(__file__), 'credentials.json'),
            os.path.join(os.path.dirname(os.path.dirname(__file__)), 'credentials.json'),
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'credentials.json'),
        ]
        
        for location in possible_locations:
            if os.path.exists(location):
                credentials_file = location
                break
        else:
            raise HTTPException(
                status_code=500, 
                detail=(
                    "Google Calendar credentials file (credentials.json) not found. "
                    "Please download the credentials file from Google Cloud Console "
                    "and place it in the project root directory."
                )
            )
    
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first time.
    token_file = os.path.join(os.path.dirname(credentials_file), 'token.json')
    if os.path.exists(token_file):
        creds = Credentials.from_authorized_user_file(token_file, SCOPES)
    
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            try:
                # Print information about what's happening
                print("=" * 50)
                print("Starting Google OAuth authentication flow...")
                print(f"Using credentials file: {os.path.abspath(credentials_file)}")
                
                # Create the flow with additional parameters for more control
                flow = InstalledAppFlow.from_client_secrets_file(
                    credentials_file, 
                    SCOPES,
                    redirect_uri='http://localhost')
                
                # Print the redirect URI being used
                print(f"Redirect URI being used: {flow.redirect_uri}")
                print("Make sure this URI is authorized in Google Cloud Console under:")
                print("APIs & Services > Credentials > OAuth 2.0 Client IDs > Authorized redirect URIs")
                print("=" * 50)
                
                # Run the local server
                print("Starting local server for OAuth flow...")
                creds = flow.run_local_server(port=0)
                print("Authentication successful!")
            except Exception as e:
                error_message = str(e)
                if "redirect_uri_mismatch" in error_message:
                    print("=" * 50)
                    print("ERROR: Redirect URI Mismatch")
                    print("The redirect URI in your OAuth flow doesn't match the authorized URIs in Google Cloud Console.")
                    print("\nTo fix this issue:")
                    print("1. Go to Google Cloud Console: https://console.cloud.google.com/")
                    print("2. Navigate to: APIs & Services > Credentials")
                    print("3. Edit your OAuth 2.0 Client ID")
                    print("4. Add these redirect URIs:")
                    print("   - http://localhost")
                    print("   - http://localhost:8080")
                    print("   - http://127.0.0.1:8080")
                    print("   - http://127.0.0.1")
                    print("5. Save your changes and try again")
                    print("=" * 50)
                
                raise HTTPException(
                    status_code=500,
                    detail=f"Error authenticating with Google Calendar: {str(e)}"
                )
                
        # Save the credentials for the next run
        with open(token_file, 'w') as token:
            token.write(creds.to_json())

    try:
        service = build('calendar', 'v3', credentials=creds)
        return service
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create calendar service: {str(e)}") 