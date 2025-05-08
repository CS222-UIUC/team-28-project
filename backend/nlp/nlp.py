import json
import spacy
import re
import os
import logging
from dateparser import parse as date_parse
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load spaCy model once when module is imported
nlp = spacy.load("en_core_web_sm")

class TaskExtractor:
    """
    A class to handle task extraction from natural language text.
    Designed to work with the FastAPI application in main.py.
    """
    
    def __init__(self):
        # Removed specific task patterns and keywords to generalize task processing
        pass
    
    def extract_from_text(self, text):
        """
        Extract structured task information from natural language text.
        Returns a dict with task, participants, date, time, locations.
        """
        extracted = {
            "task": None,
            "participants": [],
            "date": None,
            "time": None,
            "end_time": None,
            "locations": []
        }
        
        # Process the text with spaCy
        doc = nlp(text)
        
        # Step 1: Extract participants first - crucial to do this before locations
        self._extract_participants(doc, extracted)
        
        # Step 2: Extract dates and times
        self._extract_date_time(doc.text, extracted)
        
        # Step 3: Extract locations (avoiding words already classified)
        self._extract_locations(doc, extracted)
        
        # Final pass: Check for capitalized names after "with" - these are almost always people, not locations
        self._check_with_preposition(doc, extracted)
        
        # Extract task information in a general manner
        self._extract_task(doc, text, extracted)
        
        # Simplify the task description (cleanup and capitalize)
        self._simplify_task(doc, text, extracted)

        # Clean task from extracted entities and connecting words
        self._clean_task_from_entities(doc, extracted)
        
        return extracted
    
    def _extract_participants(self, doc, extracted):
        """Extract people names and potential participants based on context."""
        # First pass: Extract names specifically identified by spaCy as persons
        for ent in doc.ents:
            if ent.label_ == "PERSON" and ent.text not in extracted["participants"]:
                extracted["participants"].append(ent.text)
        
        # Second pass: Direct pattern matching for 'with [CapitalWord]' which are almost always people
        with_name_pattern = re.compile(r'\bwith\s+([A-Z][a-z]+)\b')
        matches = with_name_pattern.finditer(doc.text)
        for match in matches:
            name = match.group(1)
            if name not in extracted["participants"]:
                extracted["participants"].append(name)
        
        # Third pass: Look for names with strong participant indicators
        strong_indicators = ["with", "and", "meet", "call", "email", "contact", "talk to", "invite"]
        collective_nouns = ["team", "staff", "group", "committee", "family", "class", "crew"]
        
        for token in doc:
            if token.text.lower() in strong_indicators:
                # Look ahead for potential name tokens
                i = token.i + 1
                
                # Skip stop words and punctuation
                while i < len(doc) and (doc[i].is_stop or doc[i].pos_ in ["PUNCT", "DET"]):
                    i += 1
                
                # Handle collective nouns
                if i < len(doc) and doc[i].text.lower() in collective_nouns:
                    if doc[i].text not in extracted["participants"]:
                        extracted["participants"].append(doc[i].text)
                    continue
                
                # If we find a capitalized word or proper noun, consider it a name
                if i < len(doc) and (doc[i].text[0].isupper() or doc[i].pos_ == "PROPN"):
                    name_start = i
                    name_end = i
                    
                    # Find the end of the name (which may be multiple tokens)
                    while (name_end + 1 < len(doc) and 
                           (doc[name_end + 1].text[0].isupper() or doc[name_end + 1].pos_ == "PROPN") and 
                           doc[name_end + 1].text.lower() not in strong_indicators):
                        name_end += 1
                    
                    # Extract the full name
                    potential_name = doc[name_start:name_end + 1].text
                    
                    # Skip common non-person capitalized words
                    non_person_words = ["monday", "tuesday", "wednesday", "thursday", "friday", 
                                      "saturday", "sunday", "january", "february", "march", 
                                      "april", "may", "june", "july", "august", "september", 
                                      "october", "november", "december"]
                    
                    if (potential_name.lower() not in non_person_words and 
                        not any(ent.text == potential_name and ent.label_ in {"GPE", "LOC", "FAC", "ORG"} for ent in doc.ents) and
                        not re.search(r'\d+\s*(?:am|pm|AM|PM)', potential_name) and
                        potential_name not in extracted["participants"]):
                        
                        extracted["participants"].append(potential_name)
    
    def _extract_entities(self, doc, extracted):
        """Extract named entities and other structured information."""
        location_labels = {"FAC", "GPE", "LOC", "ORG"}
        
        for ent in doc.ents:
            if ent.label_ == "DATE":
                dt = date_parse(ent.text)
                if dt:
                    extracted["date"] = dt.strftime("%Y-%m-%d")

            elif ent.label_ == "TIME":
                dt = date_parse(ent.text)
                if dt:
                    extracted["time"] = dt.strftime("%H:%M")
                    
            elif ent.label_ in location_labels:
                # Don't add locations here - we'll do it in _extract_locations
                # after participants and times are extracted
                pass

    def _extract_date_time(self, text, extracted):
        """Extract dates and times using regex patterns."""
        # Simplified time pattern for direct matching
        simple_time_pattern = r'\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.|AM|PM|A\.M\.|P\.M\.)\b'
        
        # Extract date first
        if not extracted["date"]:
            date_patterns = [
                r'\b(?:next|this)\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b',
                r'\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b',
                r'\btomorrow\b', r'\btoday\b', r'\bnext week\b', r'\bnext month\b'
            ]
            
            for pattern in date_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    dt = date_parse(match.group(0))
                    if dt:
                        extracted["date"] = dt.strftime("%Y-%m-%d")
                        break
        
        # Check for time ranges first
        time_range_patterns = [
            r'from\s+(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))\s+to\s+(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))',
            r'(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))\s+to\s+(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))',
            r'between\s+(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))\s+and\s+(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))'
        ]
        
        for pattern in time_range_patterns:
            time_range_match = re.search(pattern, text, re.IGNORECASE)
            if time_range_match:
                start_time_text = time_range_match.group(1)
                end_time_text = time_range_match.group(2)
                
                # Parse start time
                start_match = re.search(simple_time_pattern, start_time_text, re.IGNORECASE)
                if start_match:
                    hour = int(start_match.group(1))
                    minute = 0
                    if start_match.group(2):
                        minute = int(start_match.group(2))
                    period = start_match.group(3).lower()
                    
                    # Adjust hour for PM
                    if 'pm' in period and hour < 12:
                        hour += 12
                    elif 'am' in period and hour == 12:
                        hour = 0
                        
                    extracted["time"] = f"{hour:02d}:{minute:02d}"
                
                # Parse end time
                end_match = re.search(simple_time_pattern, end_time_text, re.IGNORECASE)
                if end_match:
                    hour = int(end_match.group(1))
                    minute = 0
                    if end_match.group(2):
                        minute = int(end_match.group(2))
                    period = end_match.group(3).lower()
                    
                    # Adjust hour for PM
                    if 'pm' in period and hour < 12:
                        hour += 12
                    elif 'am' in period and hour == 12:
                        hour = 0
                        
                    extracted["end_time"] = f"{hour:02d}:{minute:02d}"
                
                # If we found a time range, exit
                if extracted["time"] and extracted["end_time"]:
                    break
        
        # Look for individual time if no range found
        if not extracted["time"]:
            time_patterns = [
                r'\b\d{1,2}\s*(?::\s*\d{2})?\s*(?:am|pm)\b',
                r'\b\d{1,2}\s*(?::\s*\d{2})?\s*(?:a\.m\.|p\.m\.)\b',
                r'\b\d{1,2}\s*(?::\s*\d{2})?\s*(?:AM|PM)\b',
                r'\b\d{1,2}\s*(?::\s*\d{2})?\s*(?:A\.M\.|P\.M\.)\b',
                r'\b\d{1,2}\s*(?::\s*\d{2})?\s*(?:hrs|hour|hours)\b',
                r'\bnoon\b', r'\bmidnight\b'
            ]
            
            for pattern in time_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    # Handle special cases
                    if match.group(0).lower() == 'noon':
                        extracted["time"] = "12:00"
                    elif match.group(0).lower() == 'midnight':
                        extracted["time"] = "00:00"
                    # Try direct time parsing
                    else:
                        time_match = re.search(simple_time_pattern, match.group(0), re.IGNORECASE)
                        if time_match:
                            hour = int(time_match.group(1))
                            minute = 0
                            if time_match.group(2):
                                minute = int(time_match.group(2))
                            period = ""
                            if time_match.group(3):
                                period = time_match.group(3).lower()
                            
                            # Adjust hour for AM/PM
                            if period and 'pm' in period and hour < 12:
                                hour += 12
                            elif period and 'am' in period and hour == 12:
                                hour = 0
                                
                            extracted["time"] = f"{hour:02d}:{minute:02d}"
                        # Fallback to dateparser
                        else:
                            dt = date_parse(match.group(0))
                            if dt:
                                extracted["time"] = dt.strftime("%H:%M")
                    
                    # Break after finding valid time
                    if extracted["time"]:
                        break
    
    def _extract_locations(self, doc, extracted):
        """Extract locations based on prepositions and context, avoiding known participants and times."""
        # Create a list of words that are already classified as participants or times
        classified_words = []
        excluded_patterns = []
        
        # Add participant names - these should never be considered locations
        for participant in extracted["participants"]:
            classified_words.extend(participant.lower().split())
        
        # Add time-related words and values
        if extracted["time"] or extracted["end_time"]:
            # Extract raw time values from the text
            time_values = re.findall(r'\b(\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.|AM|PM|A\.M\.|P\.M\.))\b', doc.text, re.IGNORECASE)
            for time_val in time_values:
                classified_words.append(time_val.lower().strip())
                excluded_patterns.append(time_val.lower().strip())
            
            # Also exclude time range expressions
            for phrase in ["from", "to", "between", "and"]:
                if phrase in doc.text.lower():
                    excluded_patterns.append(phrase.lower())
        
        # Common time indicators to exclude from locations
        time_words = ["am", "pm", "morning", "afternoon", "evening", "night", "noon", "midnight"]
        classified_words.extend(time_words)
        
        # Only consider strong location indicators
        location_prepositions = {"at", "in", "near", "around", "by"}
        
        # Track potential "with X" patterns to exclude from locations
        with_patterns = []
        for i, token in enumerate(doc):
            if token.text.lower() == "with" and i < len(doc) - 1:
                j = i + 1
                while j < len(doc) and (doc[j].is_stop or doc[j].pos_ in ["PUNCT", "DET"]):
                    j += 1
                if j < len(doc) and doc[j].text[0].isupper():
                    name_end = j
                    while name_end + 1 < len(doc) and doc[name_end + 1].text[0].isupper():
                        name_end += 1
                    with_patterns.append(doc[j:name_end+1].text)
        
        # Add these to classified words so they won't be picked up as locations
        for pattern in with_patterns:
            classified_words.extend(pattern.lower().split())
        
        # Look for locations with prepositions
        for token in doc:
            if token.text.lower() in location_prepositions and token.i < len(doc) - 1:
                # Skip verb constructions and time expressions
                if doc[token.i+1].pos_ == "VERB" or doc[token.i+1].ent_type_ in {"TIME", "DATE"}:
                    continue

                candidate = None

                # Try to get the full noun phrase
                for chunk in doc.noun_chunks:
                    if chunk.start == token.i + 1:
                        if doc[chunk.start].pos_ == "VERB":
                            continue
                        candidate = chunk.text
                        break

                if not candidate:
                    if token.i + 2 < len(doc) and (doc[token.i+1].pos_ in ["ADJ", "PROPN"] or doc[token.i+1].dep_ == "compound"):
                        if doc[token.i+1].pos_ != "VERB":
                            candidate = f"{doc[token.i+1].text} {doc[token.i+2].text}"
                    else:
                        if doc[token.i+1].pos_ != "VERB":
                            candidate = doc[token.i+1].text

                if candidate and candidate not in with_patterns and candidate not in extracted["locations"]:
                    candidate_lower = candidate.lower()
                    
                    # Skip if candidate has any disqualifying features
                    if (re.search(r'\b\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.|AM|PM)\b', candidate_lower, re.IGNORECASE) or
                        any(word in candidate_lower.split() for word in classified_words) or
                        any(pattern in candidate_lower for pattern in excluded_patterns) or
                        any(tok.pos_ == "VERB" for tok in nlp(candidate)) or
                        re.search(r'^\d+(?::\d+)?$', candidate_lower)):
                        continue
                    
                    # Add the location
                    extracted["locations"].append(candidate)
        
        # Add named locations identified by spaCy
        location_labels = {"FAC", "GPE", "LOC", "ORG"}
        for ent in doc.ents:
            if (ent.label_ in location_labels and
                ent.text not in extracted["participants"] and
                ent.text not in with_patterns and
                not re.search(r'\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b', ent.text.lower(), re.IGNORECASE) and
                ent.text not in extracted["locations"] and
                not any(word in ent.text.lower().split() for word in classified_words)):
                
                extracted["locations"].append(ent.text)
    
    def _extract_task(self, doc, text, extracted):
        """
        Extract the task from the text in a general way by finding the first
        non-stop verb and, if possible, its direct object.
        """
        for token in doc:
            if token.pos_ == "VERB" and not token.is_stop:
                task_action = token.lemma_
                task_object = None
                for child in token.children:
                    if child.dep_ in ["dobj", "attr", "prep"]:
                        task_object = child.text
                        break
                if task_object:
                    extracted["task"] = f"{task_action} {task_object}"
                else:
                    extracted["task"] = task_action
                return
        
        # Fallback: if no verb is found, use the entire text
        extracted["task"] = text.strip()
    
    def _simplify_task(self, doc, text, extracted):
        """Simplify the task by cleaning duplicate words and ensuring proper capitalization."""
        if not extracted["task"]:
            return
        task_text = extracted["task"]
        words = task_text.split()
        clean_words = []
        for i, word in enumerate(words):
            if i > 0 and word.lower() == words[i-1].lower():
                continue
            clean_words.append(word)
        task_text = ' '.join(clean_words)
        if task_text:
            task_text = task_text[0].upper() + task_text[1:]
        extracted["task"] = task_text
        
    def _clean_task_from_entities(self, doc, extracted):
        """Remove detected entities and connecting words from the task."""
        if not extracted["task"]:
            return
            
        task_text = extracted["task"]
        words_to_remove = set()
        
        # Collect all words to remove
        for participant in extracted["participants"]:
            words_to_remove.update(participant.lower().split())
            
        for location in extracted["locations"]:
            words_to_remove.update(location.lower().split())
            
        # Add date and time entities
        for ent in doc.ents:
            if ent.label_ in ["DATE", "TIME"]:
                words_to_remove.update(ent.text.lower().split())
        
        connecting_words = {"at", "on", "with", "to", "for", "by", "from", "about", 
                           "as", "in", "into", "like", "of", "off", "onto", "out", 
                           "over", "past", "so", "than", "that", "up", "via"}
        
        # Filter out entities and connecting words
        task_words = []
        for word in task_text.split():
            if (word.lower() not in words_to_remove and 
                word.lower() not in connecting_words):
                task_words.append(word)
        
        cleaned_task = " ".join(task_words)
        
        # Generate fallback task if empty
        if not cleaned_task:
            # Try to find a verb
            for token in doc:
                if token.pos_ == "VERB" and not token.is_stop:
                    cleaned_task = token.lemma_.capitalize()
                    break
            
            # Last resort
            if not cleaned_task:
                cleaned_task = "Task"
        # Capitalize first letter
        elif cleaned_task:
            cleaned_task = cleaned_task[0].upper() + cleaned_task[1:]
        
        # Remove any quotes from the task
        cleaned_task = cleaned_task.strip('"\'')
        extracted["task"] = cleaned_task

    def _check_with_preposition(self, doc, extracted):
        """Final check for 'with X' patterns that should be participants, moving them from locations if needed."""
        # Process "with X" patterns which strongly indicate people rather than places
        for i, token in enumerate(doc):
            if token.text.lower() == "with" and i < len(doc) - 1:
                # Look ahead for capitalized words or proper nouns
                j = i + 1
                while j < len(doc) and (doc[j].is_stop or doc[j].pos_ in ["PUNCT", "DET"]):
                    j += 1  # Skip stop words and punctuation
                
                if j < len(doc) and doc[j].text[0].isupper():
                    # This is likely a name after "with" - check if it's in locations
                    name_start = j
                    name_end = j
                    
                    # Get the full name (which may be multiple tokens)
                    while name_end + 1 < len(doc) and doc[name_end + 1].text[0].isupper():
                        name_end += 1
                    
                    potential_name = doc[name_start:name_end + 1].text
                    
                    # If this potential name is currently marked as a location, move it to participants
                    if potential_name in extracted["locations"]:
                        extracted["locations"].remove(potential_name)
                        if potential_name not in extracted["participants"]:
                            extracted["participants"].append(potential_name)


extractor = TaskExtractor()


def extract_entities(text):
    """
    Extract entities from text using the TaskExtractor.
    This function maintains compatibility with existing code.
    """
    return extractor.extract_from_text(text)


def process_input_file(input_file="input.json", output_file="output.json"):
    """
    Process tasks from an input JSON file and write results to an output JSON file.
    
    Args:
        input_file (str): Path to the input JSON file.
        output_file (str): Path to write the output JSON file.
        
    Returns:
        bool: True if processing was successful, False otherwise.
    """
    try:
        input_path = os.path.abspath(input_file)
        output_path = os.path.abspath(output_file)
                
        with open(input_path, "r") as infile:
            data = json.load(infile)

        tasks = data.get("tasks", [])
        output_results = []

        for entry in tasks:
            text = entry.get("text", "")
            if text:
                parsed = extract_entities(text)
                output_results.append({
                    "original_text": text,
                    "extracted_entities": parsed
                })

        with open(output_path, "w") as outfile:
            json.dump({"results": output_results}, outfile, indent=4)

        print(f"Entity extraction complete. Check the {output_file} file.")
        return True
    except Exception as e:
        logger.error(f"Error processing {input_file}: {e}")
        print(f"Error processing {input_file}: {e}")
        return False


def main():
    """
    Process the default input.json file and generate output.json with extracted entities.
    This maintains compatibility with existing code.
    """
    return process_input_file()


if __name__ == "__main__":
    main()

