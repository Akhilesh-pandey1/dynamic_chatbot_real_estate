from flask import Blueprint, jsonify, request
from database import mongo
from services.auth_service import create_user, authenticate_user, verify_token, admin_required
from services.user_service import create_user, delete_user_by_name
from services.embedding_service import save_user_embeddings
from functools import wraps
import os

main_bp = Blueprint('main', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        token = token.split(' ')[1]
        user, error = verify_token(token)
        if error:
            return jsonify({'error': error[0]}), error[1]
        
        return f(user, *args, **kwargs)
    return decorated

def admin_token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        token = token.split(' ')[1]
        user, error = verify_token(token)
        if error:
            return jsonify({'error': error[0]}), error[1]
            
        if not admin_required(user):
            return jsonify({'error': 'Admin privileges required'}), 403
            
        return f(user, *args, **kwargs)
    return decorated

@main_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    response, status_code = authenticate_user(data.get('name'), data.get('password'))
    return jsonify(response), status_code


@main_bp.route('/api/admin/create-user', methods=['POST'])
@admin_token_required
def create_new_user(current_user):
    data = request.get_json()
    name = create_user(data.get('name'), data.get('password'))
    response, status_code = save_user_embeddings(name, data.get('text'))
    return jsonify(response), status_code


@main_bp.route('/api/admin/delete-user/<name>', methods=['DELETE'])
@admin_token_required
def delete_user(current_user, name):
    response, status_code = delete_user_by_name(name)
    return jsonify(response), status_code

@main_bp.route('/api/admin/modify-user-embeddings/<name>', methods=['PUT'])
@admin_token_required
def modify_user_embeddings_route(current_user, name):
    data = request.get_json()
    
    if not mongo.db.users.find_one({"name": name}):
        return jsonify({"error": "User not found"}), 404
    
    response, status_code = modify_user_embeddings(name, data.get('text'))
    return jsonify(response), status_code 