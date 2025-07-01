import firebase_admin
from firebase_admin import credentials, firestore, auth
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

def initialize_firebase():
    """Initialize Firebase Admin SDK"""

    # Avoid initializing more than once
    if firebase_admin._apps:
        return firebase_admin.get_app()

    try:
        # ✅ Safely load and validate FIREBASE_PRIVATE_KEY
        private_key_raw = os.getenv('FIREBASE_PRIVATE_KEY')
        if not private_key_raw:
            raise ValueError("❌ FIREBASE_PRIVATE_KEY is missing in .env file")
        
        private_key = private_key_raw.replace('\\n', '\n')

        # Build credentials dictionary
        firebase_credentials = {
            "type": "service_account",
            "project_id": os.getenv('FIREBASE_PROJECT_ID'),
            "private_key_id": os.getenv('FIREBASE_PRIVATE_KEY_ID'),
            "private_key": private_key,
            "client_email": os.getenv('FIREBASE_CLIENT_EMAIL'),
            "client_id": os.getenv('FIREBASE_CLIENT_ID'),
            "auth_uri": os.getenv('FIREBASE_AUTH_URI'),
            "token_uri": os.getenv('FIREBASE_TOKEN_URI'),
            "auth_provider_x509_cert_url": os.getenv('FIREBASE_AUTH_PROVIDER_X509_CERT_URL'),
            "client_x509_cert_url": os.getenv('FIREBASE_CLIENT_CERT_URL')
        }

        # Initialize Firebase
        cred = credentials.Certificate(firebase_credentials)
        firebase_admin.initialize_app(cred)
        print("✅ Firebase Admin SDK initialized successfully")
        return firebase_admin.get_app()

    except Exception as e:
        print(f"❌ Error initializing Firebase: {str(e)}")
        raise e

def get_auth_client():
    """Get Firebase Auth client"""
    return auth

def get_firestore_client():
    """Get Firestore client"""
    return firestore.client()
