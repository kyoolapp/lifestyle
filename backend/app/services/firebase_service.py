import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("keys/lifestyle-health-kyool-firebase-adminsdk-fbsvc-08bd67c569.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

class FirestoreUserService:
    def get_user(self, user_id: str):
        doc = db.collection('users').document(user_id).get()
        return doc.to_dict() if doc.exists else None

    def create_user(self, user_id: str, user_data: dict):
        db.collection('users').document(user_id).set(user_data)
        return user_id

    def update_user(self, user_id: str, user_data: dict):
        db.collection('users').document(user_id).update(user_data)
        return True

    def delete_user(self, user_id: str):
        db.collection('users').document(user_id).delete()
        return True