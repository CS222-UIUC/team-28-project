#!/usr/bin/env python3
import os
import sys
import json
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
import webbrowser

# Add the parent directory to the path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

# Google Calendar API scope
SCOPES = ['https://www.googleapis.com/auth/calendar']

def find_credentials_file():
    """Find the credentials.json file in common locations"""
    possible_locations = [
        'credentials.json',
        os.path.join(os.path.dirname(__file__), 'credentials.json'),
        os.path.join(project_root, 'credentials.json'),
    ]
    
    for location in possible_locations:
        if os.path.exists(location):
            return os.path.abspath(location)
    
    return None

def test_oauth_flow(redirect_uri=None):
    """Test the OAuth flow with a specific redirect URI"""
    credentials_file = find_credentials_file()
    
    if not credentials_file:
        print("❌ credentials.json not found!")
        print("Please make sure you have a valid credentials.json file.")
        return False
    
    print(f"Using credentials file: {credentials_file}")
    
    # Try to parse the credentials file to extract client_id
    try:
        with open(credentials_file, 'r') as f:
            cred_data = json.load(f)
            
        # Extract client type (web or installed)
        client_type = next(iter(cred_data.keys()))
        client_id = cred_data[client_type]['client_id']
        
        print(f"Client ID: {client_id[:5]}...{client_id[-5:]}")  # Show only part of it for security
    except Exception as e:
        print(f"❌ Error reading credentials file: {e}")
        return False
    
    # Create flow with explicit redirect_uri if provided
    flow_kwargs = {'client_secrets_file': credentials_file, 'scopes': SCOPES}
    if redirect_uri:
        flow_kwargs['redirect_uri'] = redirect_uri
    
    try:
        # Create the flow
        flow = InstalledAppFlow(**flow_kwargs)
        
        print("\n" + "=" * 50)
        print(f"Redirect URI being used: {flow.redirect_uri}")
        print("=" * 50)
        
        # Ask user to check if this URI is authorized
        print("\nPlease verify this redirect URI is authorized in Google Cloud Console:")
        print("1. Go to: https://console.cloud.google.com/apis/credentials")
        print("2. Edit your OAuth 2.0 Client ID")
        print("3. Add the above redirect URI to the 'Authorized redirect URIs' list")
        print("4. Save your changes")
        
        # Wait for user confirmation
        input("\nPress Enter when you've added the redirect URI to continue...")
        
        # Open a web browser to see consent screen
        open_browser = input("Would you like to open your web browser to authenticate? (y/n): ")
        if open_browser.lower() == 'y':
            webbrowser.open(flow.authorization_url()[0])
            print("If your browser doesn't open automatically, copy the link above and open it manually.")
        
        # Run the flow
        print("\nRunning OAuth flow...")
        creds = flow.run_local_server(port=0)
        
        # Save the credentials
        token_file = os.path.join(os.path.dirname(credentials_file), 'token.json')
        with open(token_file, 'w') as token:
            token.write(creds.to_json())
        
        print("\n✅ Authentication successful!")
        print(f"Token saved to: {token_file}")
        return True
        
    except Exception as e:
        print(f"\n❌ Error during OAuth flow: {e}")
        
        if "redirect_uri_mismatch" in str(e):
            print("\nThis is a redirect URI mismatch error.")
            print("The redirect URI used by the application doesn't match any authorized URIs.")
            return False
        
        return False

def main():
    """Main function to fix Google OAuth issues"""
    print("=== Google OAuth Troubleshooter ===")
    print("This tool will help fix the 'redirect_uri_mismatch' error.")
    
    # First, try with default redirect URI
    print("\n[Step 1] Testing OAuth flow with default settings...")
    if test_oauth_flow():
        print("\nSuccess! The OAuth flow is working correctly.")
        return
    
    # If that fails, try with specific redirect URIs
    print("\n[Step 2] Testing with specific redirect URIs...")
    redirect_uris = [
        'http://localhost',
        'http://127.0.0.1:8080',
        'http://localhost:8080'
    ]
    
    for uri in redirect_uris:
        print(f"\nTrying with redirect URI: {uri}")
        if test_oauth_flow(redirect_uri=uri):
            print(f"\nSuccess! The OAuth flow works with redirect URI: {uri}")
            print("Please add this URI to your authorized redirect URIs in Google Cloud Console.")
            return
    
    # If all attempts fail, provide comprehensive instructions
    print("\n" + "=" * 50)
    print("❌ All OAuth flow attempts failed.")
    print("\nHere's how to fix the redirect URI issue:")
    print("1. Go to Google Cloud Console: https://console.cloud.google.com/")
    print("2. Select your project")
    print("3. Go to 'APIs & Services' > 'Credentials'")
    print("4. Edit your OAuth 2.0 Client ID")
    print("5. Add ALL of these redirect URIs:")
    print("   - http://localhost")
    print("   - http://localhost:8080")
    print("   - http://127.0.0.1:8080")
    print("   - http://127.0.0.1")
    print("6. Save your changes")
    print("7. Download the new credentials.json and replace your existing one")
    print("8. Run this script again")
    print("=" * 50)

if __name__ == "__main__":
    main() 