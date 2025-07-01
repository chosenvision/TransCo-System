import re
from typing import Optional

def validate_email(email: str) -> bool:
    """Validate email format"""
    if not email:
        return False
    
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password: str) -> bool:
    """Validate password strength"""
    if not password:
        return False
    
    # Minimum 6 characters
    if len(password) < 6:
        return False
    
    return True

def validate_required_fields(data: dict, required_fields: list) -> Optional[str]:
    """Validate that all required fields are present and not empty"""
    for field in required_fields:
        if field not in data or not data[field]:
            return f"{field} is required"
    
    return None

def sanitize_string(text: str, max_length: int = 255) -> str:
    """Sanitize and truncate string input"""
    if not text:
        return ""
    
    # Remove potentially harmful characters
    sanitized = re.sub(r'[<>"\']', '', str(text))
    
    # Truncate if too long
    return sanitized[:max_length]
