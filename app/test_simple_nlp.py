#!/usr/bin/env python3
import sys
import os
import json
from datetime import datetime

# Add the parent directory to the path to access modules
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

# Import the NLP extraction function
from nlp.nlp import extract_entities

def process_text(text):
    """Process a single text input and display the extracted information."""
    print(f"\nProcessing: '{text}'")
    
    # Extract entities using NLP
    extracted = extract_entities(text)
    
    # Print the results in a user-friendly format
    print("\n=== Extracted Information ===")
    print(f"🔹 Task: {extracted['task']}")
    
    if extracted['participants']:
        print(f"👥 People: {', '.join(extracted['participants'])}")
    else:
        print("👥 People: None detected")
    
    if extracted['date']:
        print(f"📅 Date: {extracted['date']}")
    else:
        print("📅 Date: None detected")
    
    if extracted['time']:
        print(f"🕒 Start time: {extracted['time']}")
    else:
        print("🕒 Start time: None detected")
        
    if extracted['end_time']:
        print(f"🕓 End time: {extracted['end_time']}")
    else:
        print("🕓 End time: None detected")
        
    if extracted['locations']:
        print(f"📍 Location: {', '.join(extracted['locations'])}")
    else:
        print("📍 Location: None detected")
        
    # Return the extracted data
    return extracted

def main():
    """Interactive tool for testing NLP task processing"""
    print("=== NLP Task Processor ===")
    print("This tool extracts information from natural language task descriptions.")
    print("It does NOT require Google Calendar credentials.")
    
    # Add examples that specifically test our fixes
    print("\nYou can enter descriptions like:")
    print("1. Meeting with John tomorrow at 2pm")
    print("2. Dentist appointment on Friday at 3:30pm")
    print("3. Call mom on Sunday evening")
    print("4. Drive to Chicago with Ashley from 10AM to 4PM")
    print("5. Coffee with Sarah at Starbucks on Wednesday morning")
    print("6. Meet John and Ashley at the conference room at 3PM")
    print("7. Lunch with Tim and Sarah at Cafe Nero at noon")
    
    # Add a case that specifically tests our time range issue
    print("\nTime Range Testing:")
    print("T1. Drive to Chicago with Ashley from 10AM to 4PM")
    print("T2. Meeting from 2pm to 5pm")
    print("T3. Call with team between 9am and 10:30am")
    
    # Interactive processing
    while True:
        print("\n" + "-" * 50)
        text = input("\nEnter a task description (or 'q' to quit): ")
        
        if text.lower() == 'q':
            break
            
        # Allow selecting examples by number
        if text.strip() in ["1", "2", "3", "4", "5", "6", "7"]:
            examples = [
                "Meeting with John tomorrow at 2pm",
                "Dentist appointment on Friday at 3:30pm",
                "Call mom on Sunday evening",
                "Drive to Chicago with Ashley from 10AM to 4PM",
                "Coffee with Sarah at Starbucks on Wednesday morning",
                "Meet John and Ashley at the conference room at 3PM",
                "Lunch with Tim and Sarah at Cafe Nero at noon"
            ]
            text = examples[int(text) - 1]
            print(f"Selected example: '{text}'")
            
        # Handle time range test cases
        elif text.strip() in ["T1", "t1", "T2", "t2", "T3", "t3"]:
            time_tests = [
                "Drive to Chicago with Ashley from 10AM to 4PM",
                "Meeting from 2pm to 5pm",
                "Call with team between 9am and 10:30am"
            ]
            index = int(text.strip().lower().replace("t", "")) - 1
            text = time_tests[index]
            print(f"Selected test: '{text}'")
        
        if not text.strip():
            print("Please enter some text to process.")
            continue
            
        # Process the text
        extracted = process_text(text)
        
        # Show the raw JSON data if requested
        show_json = input("\nShow raw JSON data? (y/n): ")
        if show_json.lower() == 'y':
            print("\nRaw JSON data:")
            print(json.dumps(extracted, indent=4))

if __name__ == "__main__":
    main() 