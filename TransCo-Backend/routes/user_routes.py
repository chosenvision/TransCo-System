from flask import Blueprint, request, jsonify
from firebase_admin import auth, firestore
from middleware.auth_middleware import verify_token
from utils.response_helper import success_response, error_response
import logging

user_bp = Blueprint('users', __name__)
logger = logging.getLogger(__name__)
db = firestore.client()

@user_bp.route('/profile', methods=['GET'])
@verify_token
def get_profile(current_user):
    """Get user profile"""
    try:
        uid = current_user['uid']
        
        # Get user from Firebase Auth
        user = auth.get_user(uid)
        
        # Get additional user data from Firestore
        user_doc = db.collection('users').document(uid).get()
        user_data = user_doc.to_dict() if user_doc.exists else {}
        
        profile_data = {
            "uid": user.uid,
            "email": user.email,
            "displayName": user.display_name,
            "emailVerified": user.email_verified,
            "photoURL": user.photo_url,
            "createdAt": user.user_metadata.creation_timestamp,
            "lastSignIn": user.user_metadata.last_sign_in_timestamp,
            **user_data  # Additional data from Firestore
        }
        
        return success_response(
            message="Profile retrieved successfully",
            data=profile_data
        )
        
    except Exception as e:
        logger.error(f"Get profile error: {str(e)}")
        return error_response("Failed to get profile", 500)

@user_bp.route('/profile', methods=['PUT'])
@verify_token
def update_profile(current_user):
    """Update user profile"""
    try:
        uid = current_user['uid']
        data = request.get_json()
        
        if not data:
            return error_response("No data provided", 400)
        
        # Update Firebase Auth user
        auth_updates = {}
        if 'displayName' in data:
            auth_updates['display_name'] = data['displayName']
        if 'photoURL' in data:
            auth_updates['photo_url'] = data['photoURL']
        
        if auth_updates:
            auth.update_user(uid, **auth_updates)
        
        # Update additional data in Firestore
        firestore_data = {k: v for k, v in data.items() 
                         if k not in ['displayName', 'photoURL', 'email']}
        
        if firestore_data:
            firestore_data['updatedAt'] = firestore.SERVER_TIMESTAMP
            db.collection('users').document(uid).set(firestore_data, merge=True)
        
        logger.info(f"Profile updated for user: {uid}")
        
        return success_response(message="Profile updated successfully")
        
    except Exception as e:
        logger.error(f"Update profile error: {str(e)}")
        return error_response("Failed to update profile", 500)

@user_bp.route('/change-password', methods=['POST'])
@verify_token
def change_password(current_user):
    """Change user password"""
    try:
        uid = current_user['uid']
        data = request.get_json()
        
        if not data or 'newPassword' not in data:
            return error_response("New password is required", 400)
        
        new_password = data['newPassword']
        
        if len(new_password) < 6:
            return error_response("Password must be at least 6 characters", 400)
        
        # Update password
        auth.update_user(uid, password=new_password)
        
        logger.info(f"Password changed for user: {uid}")
        
        return success_response(message="Password changed successfully")
        
    except Exception as e:
        logger.error(f"Change password error: {str(e)}")
        return error_response("Failed to change password", 500)

@user_bp.route('/delete-account', methods=['DELETE'])
@verify_token
def delete_account(current_user):
    """Delete user account"""
    try:
        uid = current_user['uid']
        
        # Delete user data from Firestore
        db.collection('users').document(uid).delete()
        
        # Delete user from Firebase Auth
        auth.delete_user(uid)
        
        logger.info(f"Account deleted for user: {uid}")
        
        return success_response(message="Account deleted successfully")
        
    except Exception as e:
        logger.error(f"Delete account error: {str(e)}")
        return error_response("Failed to delete account", 500)
