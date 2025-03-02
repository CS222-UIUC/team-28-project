import json
import spacy
from dateparser import parse as date_parse

nlp = spacy.load("en_core_web_sm")

def extract_entities(text):
    """
    Extract entities such as task, participants, date, time, priority, and description
    from a given text using spaCy and dateparser.
    """
    doc = nlp(text)

    extracted = {
        "task": None,
        "participants": [],
        "date": None,
        "time": None,
        "priority": None,
        "locations": [],
        "description": None
    }

    location_labels = {"FAC", "GPE", "LOC", "ORG"}

    for ent in doc.ents:
        if ent.label_ == "PERSON":
            extracted["participants"].append(ent.text)
            
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

    task_keywords = ["meeting", "call", "email", "reminder", "schedule"]
    priority_keywords = ["urgent", "high-priority", "low-priority"]

    for token in doc:
        if token.lemma_.lower() in task_keywords:
            extracted["task"] = token.lemma_.lower()

        if token.lemma_.lower() in priority_keywords:
            extracted["priority"] = token.lemma_.lower()

    if not extracted["priority"]:
        extracted["priority"] = "normal"

    for token in doc:
        if token.text.lower() in {"at", "to"} and token.i < len(doc) - 1:
            if token.text.lower() == "to" and doc[token.i+1].pos_ == "VERB":
                continue

            if doc[token.i+1].ent_type_ == "TIME":
                continue

            candidate = None

            for chunk in doc.noun_chunks:
                if chunk.start == token.i + 1:
                    candidate = chunk.text
                    break

            if not candidate:
                candidate = doc[token.i+1].text

            if candidate not in extracted["locations"]:
                extracted["locations"].append(candidate)

    extracted["description"] = text

    return extracted

def main():
    with open("input.json", "r") as infile:
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

    # Write the output to a new JSON file
    with open("output.json", "w") as outfile:
        json.dump({"results": output_results}, outfile, indent=4)

    print("Entity extraction complete. Check the output.json file.")

if __name__ == "__main__":
    main()
