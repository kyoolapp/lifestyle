import firebase_admin
from firebase_admin import credentials, firestore
from app.core.config import FIREBASE_KEY_PATH

# Initialize Firebase app if not already initialized
if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_KEY_PATH)
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Example function to get recipes

def get_recipes():
    recipes_ref = db.collection('recipes')
    docs = recipes_ref.stream()
    return [doc.to_dict() for doc in docs]
