from functools import wraps
from flask import request, jsonify
from firebase_admin import auth
from utils.response_helper import error_response
import logging

logger = logging.getLogger(__name__)

def verify_token(f):
    """Middleware to verify Firebase ID token"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            # Get token from Authorization header
            auth_header = request.headers.get('Authorization')
            
            if not auth_header:
                return error_response("Authorization header is required", 401)
            
            # Extract token (format: "Bearer <token>")
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return error_response("Invalid authorization header format", 401)
            
            # Verify the ID token
            decoded_token = auth.verify_id_token(token)
            
            # Add user info to request context
            current_user = {
                'uid': decoded_token['uid'],
                'email': decoded_token.get('email'),
                'email_verified': decoded_token.get('email_verified', False),
                'role': decoded_token.get('role', 'user')
            }
            
            # Pass current_user to the decorated function
            return f(current_user, *args, **kwargs)
            
        except auth.InvalidIdTokenError:
            return error_response("Invalid or expired token", 401)
        except auth.ExpiredIdTokenError:
            return error_response("Token has expired", 401)
        except Exception as e:
            logger.error(f"Token verification error: {str(e)}")
            return error_response("Authentication failed", 401)
    
    return decorated_function

def admin_required(f):
    """Middleware to require admin role"""
    @wraps(f)
    def decorated_function(current_user, *args, **kwargs):
        if current_user.get('role') != 'admin':
            return error_response("Admin access required", 403)
        
        return f(current_user, *args, **kwargs)
    
    return decorated_function
