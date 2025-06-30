from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from middleware.auth_middleware import verify_token
from utils.response_helper import success_response, error_response
import logging
from datetime import datetime

request_bp = Blueprint('requests', __name__)
logger = logging.getLogger(__name__)
db = firestore.client()

@request_bp.route('/', methods=['GET'])
@verify_token
def get_requests(current_user):
    """Get all requests for the current user"""
    try:
        uid = current_user['uid']
        
        # Get requests from Firestore
        requests_ref = db.collection('requests').where('userId', '==', uid)
        requests = requests_ref.stream()
        
        request_list = []
        for req in requests:
            req_data = req.to_dict()
            req_data['id'] = req.id
            request_list.append(req_data)
        
        return success_response(
            message="Requests retrieved successfully",
            data=request_list
        )
        
    except Exception as e:
        logger.error(f"Get requests error: {str(e)}")
        return error_response("Failed to get requests", 500)

@request_bp.route('/', methods=['POST'])
@verify_token
def create_request(current_user):
    """Create a new request"""
    try:
        uid = current_user['uid']
        data = request.get_json()
        
        if not data:
            return error_response("No data provided", 400)
        
        # Validate required fields
        required_fields = ['requestor', 'requestDate', 'requestTime', 'subject', 'details', 'category']
        for field in required_fields:
            if field not in data or not data[field]:
                return error_response(f"{field} is required", 400)
        
        # Prepare request data
        request_data = {
            'userId': uid,
            'requestor': data['requestor'],
            'costCenter': data.get('costCenter', f"CC{datetime.now().strftime('%Y%m%d%H%M%S')}"),
            'requestDate': data['requestDate'],
            'requestTime': data['requestTime'],
            'subject': data['subject'],
            'details': data['details'],
            'category': data['category'],
            'dateAcknowledge': data.get('dateAcknowledge', ''),
            'actionTaken': data.get('actionTaken', ''),
            'dateAcknowledge2': data.get('dateAcknowledge2', ''),
            'timeAcknowledge': data.get('timeAcknowledge', ''),
            'agent': data.get('agent', ''),
            'status': 'Pending',
            'supportDesk': 'IT Support' if 'Hardware' in data['category'] or 'Network' in data['category'] else 'IS Support',
            'dateClosed': '',
            'techSupport': data.get('agent', ''),
            'remarks': f"{data['subject']} - {data['details']}",
            'createdAt': firestore.SERVER_TIMESTAMP,
            'updatedAt': firestore.SERVER_TIMESTAMP
        }
        
        # Save to Firestore
        doc_ref = db.collection('requests').add(request_data)
        request_id = doc_ref[1].id
        
        logger.info(f"Request created successfully: {request_id}")
        
        return success_response(
            message="Request created successfully",
            data={"id": request_id, **request_data}
        )
        
    except Exception as e:
        logger.error(f"Create request error: {str(e)}")
        return error_response("Failed to create request", 500)

@request_bp.route('/<request_id>', methods=['GET'])
@verify_token
def get_request(current_user, request_id):
    """Get a specific request"""
    try:
        uid = current_user['uid']
        
        # Get request from Firestore
        req_ref = db.collection('requests').document(request_id)
        req_doc = req_ref.get()
        
        if not req_doc.exists:
            return error_response("Request not found", 404)
        
        req_data = req_doc.to_dict()
        
        # Check if user owns this request
        if req_data.get('userId') != uid:
            return error_response("Access denied", 403)
        
        req_data['id'] = request_id
        
        return success_response(
            message="Request retrieved successfully",
            data=req_data
        )
        
    except Exception as e:
        logger.error(f"Get request error: {str(e)}")
        return error_response("Failed to get request", 500)

@request_bp.route('/<request_id>', methods=['PUT'])
@verify_token
def update_request(current_user, request_id):
    """Update a request"""
    try:
        uid = current_user['uid']
        data = request.get_json()
        
        if not data:
            return error_response("No data provided", 400)
        
        # Get request from Firestore
        req_ref = db.collection('requests').document(request_id)
        req_doc = req_ref.get()
        
        if not req_doc.exists:
            return error_response("Request not found", 404)
        
        req_data = req_doc.to_dict()
        
        # Check if user owns this request
        if req_data.get('userId') != uid:
            return error_response("Access denied", 403)
        
        # Update data
        update_data = {k: v for k, v in data.items() if k != 'userId'}
        update_data['updatedAt'] = firestore.SERVER_TIMESTAMP
        
        req_ref.update(update_data)
        
        logger.info(f"Request updated successfully: {request_id}")
        
        return success_response(message="Request updated successfully")
        
    except Exception as e:
        logger.error(f"Update request error: {str(e)}")
        return error_response("Failed to update request", 500)

@request_bp.route('/<request_id>', methods=['DELETE'])
@verify_token
def delete_request(current_user, request_id):
    """Delete a request"""
    try:
        uid = current_user['uid']
        
        # Get request from Firestore
        req_ref = db.collection('requests').document(request_id)
        req_doc = req_ref.get()
        
        if not req_doc.exists:
            return error_response("Request not found", 404)
        
        req_data = req_doc.to_dict()
        
        # Check if user owns this request
        if req_data.get('userId') != uid:
            return error_response("Access denied", 403)
        
        # Delete request
        req_ref.delete()
        
        logger.info(f"Request deleted successfully: {request_id}")
        
        return success_response(message="Request deleted successfully")
        
    except Exception as e:
        logger.error(f"Delete request error: {str(e)}")
        return error_response("Failed to delete request", 500)

@request_bp.route('/all', methods=['GET'])
@verify_token
def get_all_requests(current_user):
    """Get all requests (admin only)"""
    try:
        # Check if user has admin role
        if current_user.get('role') != 'admin':
            return error_response("Access denied", 403)
        
        # Get all requests from Firestore
        requests_ref = db.collection('requests')
        requests = requests_ref.stream()
        
        request_list = []
        for req in requests:
            req_data = req.to_dict()
            req_data['id'] = req.id
            request_list.append(req_data)
        
        return success_response(
            message="All requests retrieved successfully",
            data=request_list
        )
        
    except Exception as e:
        logger.error(f"Get all requests error: {str(e)}")
        return error_response("Failed to get requests", 500)
