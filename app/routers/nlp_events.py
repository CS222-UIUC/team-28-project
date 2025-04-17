from fastapi import APIRouter, Request
from nlp.nlp import extract_entities, process_input_file
import json
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post('/process')
async def process_text(request: Request):
    """
    Process text from request body and extract task information
    """
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
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        output_file = os.path.join(project_root, "output.json")
        
        with open(output_file, "w") as outfile:
            json.dump({"results": output_results}, outfile, indent=4)
            
        logger.info(f"Results saved to {output_file}")
        return {"message": "Data processed successfully", "results": output_results}
    except Exception as e:
        logger.error(f"Error processing request: {e}")
        return {"message": f"Error: {e}"}

@router.get('/process_file')
async def process_input_file_endpoint():
    """
    Process tasks from input.json file and generate output.json
    """
    try:
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        input_file = os.path.join(project_root, "input.json")
        output_file = os.path.join(project_root, "output.json")
        
        success = process_input_file(input_file, output_file)
        
        if success:
            return {
                "message": "Data processed successfully from input.json",
                "file": "output.json"
            }
        else:
            return {"message": "Error processing input.json"}
    except Exception as e:
        logger.error(f"Error processing input.json: {e}")
        return {"message": f"Error processing input.json: {e}"}

def direct_process():
    """Process input.json using the process_input_file function from nlp.py"""
    try:
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        os.chdir(project_root)
        
        input_file = os.path.join(project_root, "input.json")
        output_file = os.path.join(project_root, "output.json")
        
        print("Processing input.json file...")
        
        success = process_input_file(input_file, output_file)
        
        if success:
            print("Processing complete! YAY.")
            return True
        else:
            print("Error processing input.json! BOO")
            return False
    except Exception as e:
        print(f"Error processing input.json: {e}")
        return False

if __name__ == "__main__":
    direct_process()
