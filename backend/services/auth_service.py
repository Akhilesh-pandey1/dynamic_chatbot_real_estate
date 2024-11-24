from werkzeug.security import generate_password_hash
import jwt
from datetime import datetime, timedelta
import os
from database import mongo
from try_catch_decorator import exception_handler

@exception_handler
def create_user(name, password, is_admin=False):
    if not name or not password:
        return {"error": "Name and password are required"}, 400
    
    if name == os.getenv('ADMIN_USERNAME'):
        return {"error": "Cannot create admin account"}, 403
        
    if mongo.db.users.find_one({"name": name}):
        return {"error": "Name already exists"}, 409
    
    hashed_password = generate_password_hash(password)
    mongo.db.users.insert_one({
        "name": name,
        "password": hashed_password,
        "is_admin": is_admin
    })
    
    return {"message": "User created successfully"}, 201

@exception_handler
def authenticate_user(name, password):
    if not name or not password:
        return {"error": "Name and password are required"}, 400

    user = mongo.db.users.find_one({"name": name})
    if not user or  user['password'] != password:
        return {"error": "Invalid credentials"}, 401

    token = jwt.encode({
        'name': name,
        'is_admin': user.get('is_admin', False),
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, os.getenv('SECRET_KEY'))
    
    return {"token": token, "is_admin": user.get('is_admin', False)}, 200

@exception_handler
def verify_token(token):
    data = jwt.decode(token, os.getenv('SECRET_KEY'), algorithms=['HS256'])
    if data['name'] == os.getenv('ADMIN_USERNAME'):
        return {'name': data['name'], 'is_admin': True}, None
    
    current_user = mongo.db.users.find_one({'name': data['name']})
    return current_user, None

@exception_handler
def admin_required(user):
    if not user or not user.get('is_admin'):
        return False
    return True