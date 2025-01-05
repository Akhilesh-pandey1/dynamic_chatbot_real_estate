import jwt
from datetime import datetime, timedelta
import os
from database import mongo
from try_catch_decorator_new import handle_exceptions


@handle_exceptions
def authenticate_user(name, password, organization=None):
    if not name or not password:
        raise ValueError("Name and password are required")

    db = mongo.get_db(organization)
    user = db.users.find_one({"name": name})
    if not user or user['password'] != password:
        raise ValueError("Invalid credentials")

    token = jwt.encode({'name': name, 'is_admin': user.get('is_admin', False),
                       'exp': datetime.utcnow() + timedelta(hours=24)}, os.getenv('SECRET_KEY'))

    return {"token": token, "is_admin": user.get('is_admin', False)}, 200


@handle_exceptions
def verify_token(token, organization=None):
    data = jwt.decode(token, os.getenv('SECRET_KEY'), algorithms=['HS256'])
    db = mongo.get_db(organization)
    current_user = db.users.find_one({'name': data['name']})
    return current_user, None


@handle_exceptions
def admin_required(user):
    if not user or not user.get('is_admin'):
        return False
    return True
