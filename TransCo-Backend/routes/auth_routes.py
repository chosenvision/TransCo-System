from flask import Blueprint, request, jsonify
from firebase_admin import auth
from utils.response_helper import success_response, error_response
from utils.validation import validate_email, validate_password
import logging

auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate input
        if not data:
            return error_response("No data provided", 400)
        
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('fullName')
        
        # Validation
        if not email or not validate_email(email):
            return error_response("Valid email is required", 400)
        
        if not password or not validate_password(password):
            return error_response("Password must be at least 6 characters", 400)
        
        if not full_name:
            return error_response("Full name is required", 400)
        
        # Create user in Firebase Auth
        user = auth.create_user(
            email=email,
            password=password,
            display_name=full_name,
            email_verified=False
        )
        
        # Set custom claims (optional)
        auth.set_custom_user_claims(user.uid, {
            'role': 'user',
            'created_at': str(user.user_metadata.creation_timestamp)
        })
        
        logger.info(f"User registered successfully: {email}")
        
        return success_response(
            message="User registered successfully",
            data={
                "uid": user.uid,
                "email": user.email,
                "displayName": user.display_name
            }
        )
        
    except auth.EmailAlreadyExistsError:
        return error_response("Email already exists", 409)
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return error_response("Registration failed", 500)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user (verify ID token)"""
    try:
        data = request.get_json()
        
        if not data or 'idToken' not in data:
            return error_response("ID token is required", 400)
        
        id_token = data['idToken']
        
        # Verify the ID token
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        
        # Get user info
        user = auth.get_user(uid)
        
        logger.info(f"User logged in successfully: {user.email}")
        
        return success_response(
            message="Login successful",
            data={
                "uid": user.uid,
                "email": user.email,
                "displayName": user.display_name,
                "emailVerified": user.email_verified,
                "customClaims": decoded_token.get('role', 'user')
            }
        )
        
    except auth.InvalidIdTokenError:
        return error_response("Invalid ID token", 401)
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return error_response("Login failed", 500)

@auth_bp.route('/verify-token', methods=['POST'])
def verify_token():
    """Verify ID token"""
    try:
        data = request.get_json()
        
        if not data or 'idToken' not in data:
            return error_response("ID token is required", 400)
        
        id_token = data['idToken']
        
        # Verify the ID token
        decoded_token = auth.verify_id_token(id_token)
        
        return success_response(
            message="Token is valid",
            data={
                "uid": decoded_token['uid'],
                "email": decoded_token.get('email'),
                "emailVerified": decoded_token.get('email_verified', False)
            }
        )
        
    except auth.InvalidIdTokenError:
        return error_response("Invalid or expired token", 401)
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        return error_response("Token verification failed", 500)

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout user (revoke refresh tokens)"""
    try:
        data = request.get_json()
        
        if not data or 'uid' not in data:
            return error_response("User ID is required", 400)
        
        uid = data['uid']
        
        # Revoke refresh tokens
        auth.revoke_refresh_tokens(uid)
        
        logger.info(f"User logged out successfully: {uid}")
        
        return success_response(message="Logout successful")
        
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return error_response("Logout failed", 500)

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Send password reset email"""
    try:
        data = request.get_json()
        
        if not data or 'email' not in data:
            return error_response("Email is required", 400)
        
        email = data['email']
        
        if not validate_email(email):
            return error_response("Valid email is required", 400)
        
        # Generate password reset link
        link = auth.generate_password_reset_link(email)
        
        logger.info(f"Password reset link generated for: {email}")
        
        return success_response(
            message="Password reset email sent",
            data={"resetLink": link}  # In production, send via email instead
        )
        
    except auth.UserNotFoundError:
        return error_response("User not found", 404)
    except Exception as e:
        logger.error(f"Password reset error: {str(e)}")
        return error_response("Password reset failed", 500)
