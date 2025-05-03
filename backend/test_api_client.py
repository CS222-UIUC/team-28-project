#!/usr/bin/env python3
import requests
import json
import sys
import os

# Default API URL
API_URL = "http://localhost:8081"

def process_text(text):
    """Process a single text input using the API"""
    endpoint = f"{API_URL}/process_text"
    
    try:
        # Send the text as JSON data in the request body
        response = requests.post(endpoint, json={"text": text})
        response.raise_for_status()  # Raise an exception for 4XX/5XX responses
        return response.json()
    except requests.exceptions.HTTPError as e:
        print(f"Error: {e}")
        # Try to extract and display the error message from the API
        try:
            error_detail = e.response.json().get("detail", "No details provided")
            print(f"API Error details: {error_detail}")
        except:
            pass
        return None
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return None

# Add this function to check if the error is related to missing Google credentials
def is_credential_error(error_message):
    """Check if the error is related to missing Google credentials"""
    credential_error_signs = [
        "credentials.json",
        "No such file or directory",
        "Failed to create calendar service",
        "Error authenticating with Google"
    ]
    return any(sign in error_message for sign in credential_error_signs)

def create_calendar_event_from_text(text):
    """Process text and create a calendar event using the API"""
    endpoint = f"{API_URL}/calendar/create_from_nlp"
    
    try:
        # Send the text as JSON data in the request body instead of as a URL parameter
        response = requests.post(endpoint, json={"text": text})
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        print(f"Error: {e}")
        # Try to extract and display the error message from the API
        try:
            error_detail = e.response.json().get("detail", "No details provided")
            print(f"API Error details: {error_detail}")
            
            # If the error is related to missing Google credentials, show helpful instructions
            if is_credential_error(error_detail):
                print("\n⚠️ Google Calendar credentials issue detected!")
                print("\nTo use Google Calendar features, you need to set up credentials:")
                print("1. Create a project in Google Cloud Console (https://console.cloud.google.com/)")
                print("2. Enable the Google Calendar API")
                print("3. Create OAuth 2.0 credentials")
                print("4. Download the credentials as 'credentials.json'")
                print("5. Place the file in the project root directory")
                print("\nThen run: python app/fix_google_oauth.py to verify and fix your setup")
        except:
            pass
        return None
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return None

def main():
    """Interactive client for testing the NLP API"""
    print("=== NLP Task Calendar API Client ===")
    
    # Check if credentials.json exists and warn the user if not
    creds_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "credentials.json")
    if not os.path.exists(creds_file):
        print("\n⚠️ Warning: Google Calendar credentials not found.")
        print("Text processing will work, but calendar event creation will fail.")
        print("To set up Google Calendar integration, run: python app/fix_google_oauth.py")
    
    # Check if API is running
    try:
        response = requests.get(f"{API_URL}/")
        if response.status_code == 200:
            print(f"API is running: {response.json()['message']}")
        else:
            print(f"API returned status code {response.status_code}")
            return
    except requests.exceptions.ConnectionError:
        print(f"Error: Could not connect to the API at {API_URL}")
        print("Make sure the server is running (python main.py)")
        return
    
    print("\nThis tool helps you extract information from natural language task descriptions.")
    print("You can enter any task description, and the NLP system will try to identify:")
    print("  - The main task")
    print("  - Date and time information")
    print("  - People involved")
    print("  - Locations mentioned")
    
    print("\nExample task descriptions you could try:")
    print("  1. Meeting with John tomorrow at 2pm")
    print("  2. Dentist appointment on Friday at 3:30pm")
    print("  3. Call mom on Sunday evening")
    print("  4. Coffee with Sarah at Starbucks on Wednesday morning")
    print("  5. Drive to Chicago with Ashley from 10AM to 4PM tomorrow")
    
    print("\nYou can then choose to create a calendar event with that information.")
    
    # Interactive processing
    while True:
        print("\n" + "-" * 50)
        text = input("\nEnter a task description (or 'q' to quit): ")
        
        if text.lower() == 'q':
            break
            
        # Allow selecting examples by number
        if text.strip() in ["1", "2", "3", "4", "5"]:
            examples = [
                "Meeting with John tomorrow at 2pm",
                "Dentist appointment on Friday at 3:30pm",
                "Call mom on Sunday evening",
                "Coffee with Sarah at Starbucks on Wednesday morning",
                "Drive to Chicago with Ashley from 10AM to 4PM tomorrow"
            ]
            text = examples[int(text) - 1]
            print(f"Selected example: '{text}'")
        
        if not text.strip():
            print("Please enter some text to process.")
            continue
            
        print(f"\nProcessing: '{text}'")
        
        # First, just process the text without creating an event
        print("\n1. Extracting entities from text...")
        result = process_text(text)
        if result:
            print(json.dumps(result, indent=4))
        
            # Ask if the user wants to create a calendar event
            create_event = input("\nCreate a calendar event from this text? (y/n): ")
            if create_event.lower() == 'y':
                print("\n2. Creating calendar event...")
                event_result = create_calendar_event_from_text(text)
                if event_result:
                    print(json.dumps(event_result, indent=4))
                    print("\nCalendar event created successfully!")

if __name__ == "__main__":
    main() 