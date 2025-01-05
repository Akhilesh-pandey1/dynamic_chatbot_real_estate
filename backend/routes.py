from flask import Blueprint, jsonify, request
from flask_cors import CORS
from database import mongo
from services.auth_service import authenticate_user, verify_token, admin_required
from services.user_service import create_user, delete_user_by_name, get_all_users, get_user_names, delete_all_users
from services.embedding_service import save_user_embeddings, modify_user_embeddings, get_all_organizations_embedding_stats
from services.chatbot_service import get_user_chat_response
from functools import wraps
from services.save_static_question import question_answering_on_static_question, get_question_answer_on_static_question
from try_catch_decorator_new import handle_route_exceptions, CustomException
from config.organizations import ORGANIZATIONS

main_bp = Blueprint('main', __name__)
CORS(main_bp, supports_credentials=True)


@handle_route_exceptions
@main_bp.route('/ping', methods=['GET', 'POST'])
def ping():
    return jsonify({
        "status": "ok"
    }), 200


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401

        token = token.split(' ')[1]
        organization = request.args.get(
            'organization') or request.get_json().get('organization')
        user, error = verify_token(token, organization)
        if error:
            return jsonify({'error': error[0]}), error[1]

        return f(user, *args, **kwargs)
    return decorated


@main_bp.route('/api/login', methods=['POST'])
@handle_route_exceptions
def login():
    data = request.get_json()
    response, status_code = authenticate_user(
        data.get('name'), 
        data.get('password')
    )
    return jsonify(response), status_code


@main_bp.route('/api/admin/create-user', methods=['POST'])
@handle_route_exceptions
def create_new_user():
    data = request.get_json()
    name = data.get('name')
    password = data.get('password')
    text = data.get('text')
    organization = data.get('organization')
    name = create_user(name, password, text, organization)

    if isinstance(name, tuple) and isinstance(name[0], dict):
        return jsonify(name[0]), name[1]

    response, status_code = save_user_embeddings(name, text, organization)
    question_answering_on_static_question(name, organization)
    return jsonify(response), status_code


@main_bp.route('/api/admin/delete-user/<name>', methods=['DELETE'])
@handle_route_exceptions
def delete_user(name):
    organization = request.args.get('organization')
    response, status_code = delete_user_by_name(name, organization)
    return jsonify(response), status_code


@main_bp.route('/api/admin/modify-user-embeddings/<name>', methods=['PUT'])
@handle_route_exceptions
def modify_user_embeddings_route(name):
    data = request.get_json()
    
    org_map = {
        'rs_': 'real_estate',
        'mf_': 'manufacturing',
        'fn_': 'finance',
        'gn_': 'general'
    }
    prefix = name[:3]
    determined_org = org_map.get(prefix)
    
    if not determined_org:
        raise CustomException("Invalid username format")
    
    if not mongo.get_db(determined_org).users.find_one({"name": name}):
        raise CustomException("User not found")
        
    response, status_code = modify_user_embeddings(
        name, data.get('text'), determined_org)
    return jsonify(response), status_code


@main_bp.route('/api/admin/users', methods=['GET'])
@handle_route_exceptions
def get_users():
    organization = request.args.get('organization')
    response, status_code = get_all_users(organization)
    return jsonify(response), status_code


@main_bp.route('/api/chat/<name>', methods=['POST'])
@handle_route_exceptions
def chat_with_user(name):
    data = request.get_json()
    organization = data.get('organization')
    chat_history = data.get('chat_history', [])
    if not chat_history:
        raise CustomException("Chat history is required")
    response, status_code = get_user_chat_response(
        name, chat_history, organization)
    return jsonify(response), status_code


@main_bp.route('/api/users/names', methods=['GET'])
@handle_route_exceptions
def get_user_names_route():
    organization = request.args.get('organization')
    response, status_code = get_user_names(organization)
    return jsonify(response), status_code


@main_bp.route('/api/embedding-stats', methods=['GET'])
@handle_route_exceptions
def get_embedding_stats():
    stats, status_code = get_all_organizations_embedding_stats()
    return jsonify(stats), status_code


@main_bp.route('/api/admin/static-questions/<name>', methods=['GET'])
@handle_route_exceptions
def get_static_questions(name):
    organization = request.args.get('organization')
    result = get_question_answer_on_static_question(name, organization)
    return jsonify(result), 200


@main_bp.route('/api/admin/delete-all-users', methods=['DELETE'])
@handle_route_exceptions
def delete_all_users_route():
    organization = request.args.get('organization')
    response, status_code = delete_all_users(organization)
    return jsonify(response), status_code


@main_bp.route('/api/organizations', methods=['GET'])
@handle_route_exceptions
def get_organizations():
    orgs = list(ORGANIZATIONS.keys())
    return jsonify({
        "organizations": orgs
    }), 200
