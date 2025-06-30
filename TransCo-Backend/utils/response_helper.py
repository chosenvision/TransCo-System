from flask import jsonify

def success_response(message="Success", data=None, status_code=200):
    """Create a standardized success response"""
    response = {
        "success": True,
        "message": message,
        "data": data
    }
    return jsonify(response), status_code

def error_response(message="Error", status_code=400, error_code=None):
    """Create a standardized error response"""
    response = {
        "success": False,
        "message": message,
        "error_code": error_code
    }
    return jsonify(response), status_code

def paginated_response(data, page, per_page, total, message="Success"):
    """Create a paginated response"""
    response = {
        "success": True,
        "message": message,
        "data": data,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": (total + per_page - 1) // per_page
        }
    }
    return jsonify(response), 200
