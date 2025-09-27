import firebase_admin
from firebase_admin import credentials, firestore

# The absolute path is now /tmp/firebase-key.json
cred = credentials.Certificate("/tmp/firebase-key.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

class FirestoreUserService:
    def add_weight_log(self, user_id: str, weight: float, date: str, bmi: float = None, bmr: float = None, tdee: float = None):
        doc_ref = db.collection('users').document(user_id)
        doc = doc_ref.get()
        if doc.exists:
            logs = doc.to_dict().get('weight_logs', [])
            logs.append({'weight': weight, 'date': date, 'bmi': bmi, 'bmr': bmr, 'tdee': tdee})
            doc_ref.update({'weight_logs': logs})
            return True
        return False

    def get_weight_logs(self, user_id: str):
        doc = db.collection('users').document(user_id).get()
        if doc.exists:
            return doc.to_dict().get('weight_logs', [])
        return []
    def get_user(self, user_id: str):
        doc = db.collection('users').document(user_id).get()
        return doc.to_dict() if doc.exists else None

    def create_user(self, user_id: str, user_data: dict):
        from datetime import datetime
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