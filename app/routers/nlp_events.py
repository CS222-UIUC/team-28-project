from fastapi import APIRouter, Request
from nlp.nlp import extract_entities
import json

router = APIRouter()

@router.get('/get_data')
async def get_data(request:Request):
    try: 
        data = await request.json()
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
        return {"message": "Data processed successfully"}
    except Exception as e:
        return {"message": f"Error: {e}"}
