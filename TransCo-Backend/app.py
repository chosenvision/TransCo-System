from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import logging

# Import our modules
from config.firebase_config import initialize_firebase
from routes.auth_routes import auth_bp
from routes.user_routes import user_bp
from routes.request_routes import request_bp
from middleware.auth_middleware import verify_token
from utils.response_helper import success_response, error_response

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

# Configure CORS
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, origins=cors_origins, supports_credentials=True)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Firebase
try:
    initialize_firebase()
    logger.info("✅ Firebase initialized successfully")
except Exception as e:
    logger.error(f"❌ Firebase initialization failed: {str(e)}")

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(user_bp, url_prefix='/api/users')
app.register_blueprint(request_bp, url_prefix='/api/requests')

@app.route('/')
def home():
    return success_response(
        message="TransCo Backend API is running!",
        data={
            "version": "1.0.0",
            "endpoints": {
                "auth": "/api/auth",
                "users": "/api/users", 
                "requests": "/api/requests"
            }
        }
    )

@app.route('/api/health')
def health_check():
    return success_response(
        message="API is healthy",
        data={"status": "ok", "timestamp": str(os.times())}
    )

@app.errorhandler(404)
def not_found(error):
    return error_response("Endpoint not found", 404)

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {str(error)}")
    return error_response("Internal server error", 500)

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    logger.info(f"🚀 Starting TransCo Backend on port {port}")
    logger.info(f"🔧 Debug mode: {debug}")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
