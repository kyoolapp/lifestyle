from fastapi import Request, HTTPException, status
from firebase_admin import auth, credentials, initialize_app
import firebase_admin

# Initialize Firebase Admin SDK (should be called once)
if not firebase_admin._apps:
    cred = credentials.Certificate('path/to/serviceAccountKey.json')  # Update with your key path
    initialize_app(cred)

def verify_firebase_token(request: Request):
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing auth header")
    token = auth_header.split('Bearer ')[-1]
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
