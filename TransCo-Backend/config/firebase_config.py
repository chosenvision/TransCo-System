import firebase_admin
from firebase_admin import credentials, auth, firestore
import os
import json
from dotenv import load_dotenv

load_dotenv()

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    
    # Check if Firebase is already initialized
    if firebase_admin._apps:
        return firebase_admin.get_app()
    
    try:
        # Create credentials from environment variables
        firebase_credentials = {
            "type": "service_account",
            "project_id": os.getenv('FIREBASE_PROJECT_ID'),
            "private_key_id": os.getenv('FIREBASE_PRIVATE_KEY_ID'),
            "private_key": os.getenv('FIREBASE_PRIVATE_KEY').replace('\\n', '\n'),
            "client_email": os.getenv('FIREBASE_CLIENT_EMAIL'),
            "client_id": os.getenv('FIREBASE_CLIENT_ID'),
            "auth_uri": os.getenv('FIREBASE_AUTH_URI'),
            "token_uri": os.getenv('FIREBASE_TOKEN_URI'),
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": os.getenv('FIREBASE_CLIENT_CERT_URL')
        }
        
        # Initialize Firebase Admin
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

# Test Firebase connection
def test_firebase_connection():
    """Test Firebase connection"""
    try:
        # Test Auth
        auth_client = get_auth_client()
        
        # Test Firestore
        db = get_firestore_client()
        
        # Try to access a collection (this will create it if it doesn't exist)
        test_ref = db.collection('test').document('connection_test')
        test_ref.set({'timestamp': firestore.SERVER_TIMESTAMP, 'status': 'connected'})
        
        print("✅ Firebase connection test successful")
        return True
        
    except Exception as e:
        print(f"❌ Firebase connection test failed: {str(e)}")
        return False
