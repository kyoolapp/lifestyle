import os
from dotenv import load_dotenv

load_dotenv()

FIREBASE_KEY_PATH = os.getenv('FIREBASE_KEY_PATH', 'path/to/serviceAccountKey.json')
