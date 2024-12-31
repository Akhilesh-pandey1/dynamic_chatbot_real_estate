
from functools import wraps
from flask import jsonify


class CustomException(Exception):
    """Exception for errors that should be shown to users"""
    pass


def handle_exceptions(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            raise
    return wrapper


def handle_route_exceptions(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except CustomException as e:
            print(f"Custom Error: {str(e)}")
            return jsonify({
                "success": False,
                "error": str(e)
            }), 400
        except Exception as e:
            print(f"Interal Error: {str(e)}")
            return jsonify({
                "success": False,
                "error": "Server error occurred"
            }), 500
    return wrapper
