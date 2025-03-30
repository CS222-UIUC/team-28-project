from fastapi import APIRouter, Request, HTTPException
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from dotenv import load_dotenv
import requests
import os

load_dotenv()

login_router = APIRouter()

def convert_token(token:str) -> dict:
    token_data = token.get("token")

    if not token_data:
        raise ValueError("No token data found")
    

    code = token_data.get("code")
    if not code:
        raise ValueError("No code found")
    
    payload = {
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
        "redirect_uri": os.getenv("REDIRECT_URI"),
        "grant_type": "authorization_code",
        "code": code,
    }

    response = requests.post(os.getenv("TOKEN_URI"), data=payload)
    response.raise_for_status()
    token_data = response.json()
    
    return token_data

@login_router.get("/google")
async def google_login(request:Request):
    try: 
        data = await request.json()
        response = convert_token(data)
        try:
            id_info = id_token.verify_oauth2_token(response["id_token"], google_requests.Request(), os.getenv("GOOGLE_CLIENT_ID"))
        except ValueError as e:
            print(e)
            raise HTTPException(status_code=401, detail="Invalid token")
        
        print(id_info)

        return id_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


