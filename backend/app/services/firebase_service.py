import firebase_admin
from firebase_admin import credentials, firestore
import os
import json
import re
from datetime import datetime, timedelta

#key_path = 'keys/lifestyle-health-kyool-firebase-adminsdk-fbsvc-08bd67c569.json'  # Default path if env var not set
# Use environment variable for service account key path, default to Cloud Run secret mount path
secret_keys = os.environ.get("FIREBASE_KEY_PATH")
#print(f"Using Firebase key path: {secret_keys}")
key_path= json.loads(secret_keys) 
#print(f"Decoded Firebase key path: {key_path}")

cred = credentials.Certificate(key_path)
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

class FirestoreUserService:
    #Adding Weight log functionality
    def add_weight_log(self, user_id: str, weight: float, date: str, bmi: float = None, bmr: float = None, tdee: float = None):
        doc_ref = db.collection('users').document(user_id)
        doc = doc_ref.get()
        if doc.exists:
            logs = doc.to_dict().get('weight_logs', [])
            logs.append({'weight': weight, 'date': date, 'bmi': bmi, 'bmr': bmr, 'tdee': tdee})
            doc_ref.update({'weight_logs': logs})
            return True
        return False
    
    #Retrieving Weight log functionality
    def get_weight_logs(self, user_id: str):
        doc = db.collection('users').document(user_id).get()
        if doc.exists:
            return doc.to_dict().get('weight_logs', [])
        return []
    
    #Getting user by ID
    def get_user(self, user_id: str):
        doc = db.collection('users').document(user_id).get()
        return doc.to_dict() if doc.exists else None
    
    #Creating user with initial weight log
    def create_user(self, user_id: str, user_data: dict):
        from datetime import datetime

        username = user_data.get('username')
        if self.is_username_taken(username):
            raise ValueError("Username already taken")

        if not self.is_valid_username(username):
            raise ValueError("Invalid username format")
        # Store initial weight log using values from frontend
        weight = user_data.get('weight')
        bmi = user_data.get('bmi')
        bmr = user_data.get('bmr')
        tdee = user_data.get('tdee')
        initial_log = {
            'weight': weight,
            'date': datetime.utcnow().isoformat(),
            'bmi': bmi,
            'bmr': bmr,
            'tdee': tdee
        } if weight else None
        user_data['weight_logs'] = [initial_log] if initial_log else []
        db.collection('users').document(user_id).set(user_data)
        return user_id

    def update_user(self, user_id: str, user_data: dict):
        username = user_data.get('username')
        if username:
            # Check if username is taken by another user
            users = db.collection('users').where('username', '==', username).stream()
            for user in users:
                if user.id != user_id:
                    raise ValueError("Username already taken")
        db.collection('users').document(user_id).update(user_data)
        return True

    def delete_user(self, user_id: str):
        db.collection('users').document(user_id).delete()
        return True
    
    def get_user_by_email(self, email: str):
        users = db.collection('users').where('email', '==', email).stream()
        for user in users:
            return user.to_dict()
        return None
    

    def is_valid_username(self, username:str):
        return re.match(r'^[a-zA-Z0-9_.]{6,20}$', username) is not None


    def is_username_taken(self, username: str) -> bool:
        if not username:
            return False
        users = db.collection('users').where('username', '==', username).stream()
        return any(users)
    
    def update_user_activity(self, user_id: str):
        """Update user's last_active timestamp to track online status"""
        try:
            user_ref = db.collection('users').document(user_id)
            user_ref.update({'last_active': datetime.utcnow().isoformat()})
            return True
        except Exception as e:
            print(f"Error updating user activity: {e}")
            return False
    
    def is_user_online(self, last_active_str: str) -> bool:
        """Check if user is online based on last_active timestamp"""
        if not last_active_str:
            return False
        try:
            last_active = datetime.fromisoformat(last_active_str.replace('Z', '+00:00'))
            now = datetime.utcnow()
            # Consider user online if last active within 5 minutes
            return (now - last_active.replace(tzinfo=None)) < timedelta(minutes=5)
        except Exception as e:
            print(f"Error checking online status: {e}")
            return False