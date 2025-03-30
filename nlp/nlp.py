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
        
        # Extract entities (dates, people, locations)
        self._extract_entities(doc, extracted)
        
        # Extract task information in a general manner
        self._extract_task(doc, text, extracted)
        
        # Simplify the task description (cleanup and capitalize)
        self._simplify_task(doc, text, extracted)

        # Clean task from extracted entities and connecting words
        self._clean_task_from_entities(doc, extracted)
        
        return extracted
    
    def _extract_entities(self, doc, extracted):
        """Extract named entities and other structured information."""
        location_labels = {"FAC", "GPE", "LOC", "ORG"}
        
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                person_name = ent.text
                extracted["participants"].append(person_name)
                
            elif ent.label_ == "DATE":
                dt = date_parse(ent.text)
                if dt:
                    extracted["date"] = dt.strftime("%Y-%m-%d")

            elif ent.label_ == "TIME":
                dt = date_parse(ent.text)
                if dt:
                    extracted["time"] = dt.strftime("%H:%M")
                    
            elif ent.label_ in location_labels:
                extracted["locations"].append(ent.text)

        # Additional extraction using regex patterns
        self._extract_date_time(doc.text, extracted)
        self._extract_locations(doc, extracted)
    
    def _extract_date_time(self, text, extracted):
        """Extract dates and times using regex patterns."""
        date_patterns = [
            r'\b(?:next|this)\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b',
            r'\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b',
            r'\btomorrow\b',
            r'\btoday\b',
            r'\bnext week\b',
            r'\bnext month\b'
        ]
        
        time_patterns = [
            r'\b\d{1,2}\s*(?::\s*\d{2})?\s*(?:am|pm)\b',
            r'\b\d{1,2}\s*(?::\s*\d{2})?\s*(?:a\.m\.|p\.m\.)\b',
            r'\b\d{1,2}\s*(?::\s*\d{2})?\s*(?:AM|PM)\b',
            r'\b\d{1,2}\s*(?::\s*\d{2})?\s*(?:A\.M\.|P\.M\.)\b',
            r'\b\d{1,2}\s*(?::\s*\d{2})?\s*(?:hrs|hour|hours)\b'
        ]
        
        end_time_markers = [
            r'\buntil\s+(\d{1,2}\s*(?::\s*\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.|AM|PM|A\.M\.|P\.M\.|hrs|hour|hours))',
            r'\bto\s+(\d{1,2}\s*(?::\s*\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.|AM|PM|A\.M\.|P\.M\.|hrs|hour|hours))',
            r'\bending\s+(?:at|by)?\s+(\d{1,2}\s*(?::\s*\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.|AM|PM|A\.M\.|P\.M\.|hrs|hour|hours))',
            r'\bend(?:s|ing)?\s+(?:at|by)?\s+(\d{1,2}\s*(?::\s*\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.|AM|PM|A\.M\.|P\.M\.|hrs|hour|hours))',
            r'\b(?:from|starting|begins|beginning).*\s+(?:to|until|til|till)\s+(\d{1,2}\s*(?::\s*\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.|AM|PM|A\.M\.|P\.M\.|hrs|hour|hours))'
        ]
        
        if not extracted["date"]:
            for pattern in date_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    dt = date_parse(match.group(0))
                    if dt:
                        extracted["date"] = dt.strftime("%Y-%m-%d")
                        break
        
        if not extracted["time"]:
            for pattern in time_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    dt = date_parse(match.group(0))
                    if dt:
                        extracted["time"] = dt.strftime("%H:%M")
                        break
        
        # Extract end time if present
        if not extracted["end_time"]:
            for pattern in end_time_markers:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    # The captured group contains the time
                    end_time_text = match.group(1)
                    dt = date_parse(end_time_text)
                    if dt:
                        extracted["end_time"] = dt.strftime("%H:%M")
                        break
            
            # If we have time but no end_time, look for duration patterns
            if extracted["time"] and not extracted["end_time"]:
                duration_patterns = [
                    r'\bfor\s+(\d+)\s+(?:hour|hr)s?\b',
                    r'\b(\d+)\s+(?:hour|hr)s?\s+(?:long|duration)',
                    r'\b(\d+\.?\d*)\s+(?:hour|hr)s?\b'
                ]
                
                for pattern in duration_patterns:
                    match = re.search(pattern, text, re.IGNORECASE)
                    if match:
                        try:
                            hours = float(match.group(1))
                            if extracted["time"]:
                                start_time = datetime.strptime(extracted["time"], "%H:%M")
                                end_time = start_time + timedelta(hours=hours)
                                extracted["end_time"] = end_time.strftime("%H:%M")
                                break
                        except:
                            pass
    
    def _extract_locations(self, doc, extracted):
        """Extract locations based on prepositions and context."""
        for token in doc:
            if token.text.lower() in {"at", "to", "in"} and token.i < len(doc) - 1:
                if token.text.lower() == "to" and doc[token.i+1].pos_ == "VERB":
                    continue
                if doc[token.i+1].ent_type_ in {"TIME", "DATE"}:
                    continue
                if doc[token.i+1].pos_ == "VERB":
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

                if candidate and any(tok.pos_ == "VERB" for tok in nlp(candidate)):
                    continue
                    
                if candidate:
                    should_add = True
                    for loc in extracted["locations"]:
                        if candidate in loc or loc in candidate:
                            should_add = False
                            break
                    if should_add:
                        extracted["locations"].append(candidate)

        extracted["locations"] = list(set(extracted["locations"]))
        common_verbs = ["plan", "schedule", "attend", "visit", "go", "meet", "call", "submit"]
        extracted["locations"] = [loc for loc in extracted["locations"] 
                                  if not any(loc.lower().startswith(verb) for verb in common_verbs)]
    
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
        
        for participant in extracted["participants"]:
            words_to_remove.update(participant.lower().split())
            
        for location in extracted["locations"]:
            words_to_remove.update(location.lower().split())
            
        if extracted["date"]:
            date_doc = nlp(doc.text)
            for ent in date_doc.ents:
                if ent.label_ == "DATE":
                    words_to_remove.update(ent.text.lower().split())
                    
        if extracted["time"]:
            time_doc = nlp(doc.text)
            for ent in time_doc.ents:
                if ent.label_ == "TIME":
                    words_to_remove.update(ent.text.lower().split())
        
        connecting_words = {"at", "on", "with", "to", "for", "by", "from", "about", "as", "for", "in", "into", "like", "of", "off", "onto", "out", "over", "past", "so", "than", "that", "to", "up", "via"}
        
        # Split task into words and filter out entities and connecting words
        task_words = []
        for word in task_text.split():
            if (word.lower() not in words_to_remove and 
                word.lower() not in connecting_words):
                task_words.append(word)
        
        cleaned_task = " ".join(task_words)
        
        # Capitalize first letter if the task is not empty
        if cleaned_task:
            cleaned_task = cleaned_task[0].upper() + cleaned_task[1:]
        else:
            for token in doc:
                if token.pos_ == "VERB" and not token.is_stop:
                    cleaned_task = token.lemma_.capitalize()
                    break
            
            if not cleaned_task:
                cleaned_task = "Task"
        
        extracted["task"] = cleaned_task


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
