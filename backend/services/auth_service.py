import jwt
from datetime import datetime, timedelta
import os
from database import mongo
from try_catch_decorator import exception_handler
from gridfs import GridFS


@exception_handler
def create_user(name, password, is_admin=False):
    if not name or not password:
        raise ValueError("Name and password are required")

    if mongo.db.users.find_one({"name": name}):
        raise ValueError("Name already exists")

    mongo.db.users.insert_one({"name": name, "password": password})
    return {"message": "User created successfully"}, 201


@exception_handler
def authenticate_user(name, password):
    if not name or not password:
        raise ValueError("Name and password are required")

    user = mongo.db.users.find_one({"name": name})
    if not user or user['password'] != password:
        raise ValueError("Invalid credentials")

    token = jwt.encode({'name': name, 'is_admin': user.get('is_admin', False),
                       'exp': datetime.utcnow() + timedelta(hours=24)}, os.getenv('SECRET_KEY'))

    return {"token": token, "is_admin": user.get('is_admin', False)}, 200


@exception_handler
def verify_token(token):
    data = jwt.decode(token, os.getenv('SECRET_KEY'), algorithms=['HS256'])
    current_user = mongo.db.users.find_one({'name': data['name']})
    return current_user, None


@exception_handler
def admin_required(user):
    if not user or not user.get('is_admin'):
        return False
    return True


