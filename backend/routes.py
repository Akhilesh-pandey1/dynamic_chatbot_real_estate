from flask import Blueprint, jsonify, request
from flask_cors import CORS
from database import mongo
from services.auth_service import create_user, authenticate_user, verify_token, admin_required
from services.user_service import create_user, delete_user_by_name, get_all_users, get_user_names, delete_all_users
from services.embedding_service import save_user_embeddings, modify_user_embeddings, get_embedding_statistics
from services.chatbot_service import get_user_chat_response
from functools import wraps
from services.save_static_question import question_answering_on_static_question, get_question_answer_on_static_question
from try_catch_decorator_new import handle_route_exceptions

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
        user, error = verify_token(token)
        if error:
            return jsonify({'error': error[0]}), error[1]

        return f(user, *args, **kwargs)
    return decorated


@handle_route_exceptions
@main_bp.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        response, status_code = authenticate_user(
            data.get('name'), data.get('password'))
        return jsonify(response), status_code
    except Exception as e:
        print(f"Error in login: {str(e)}")
        return jsonify({"error": str(e)}), 500


@handle_route_exceptions
@main_bp.route('/api/admin/create-user', methods=['POST'])
def create_new_user():
    try:
        data = request.get_json()
        name = create_user(data.get('name'), data.get(
            'password'), data.get('text'))
        if isinstance(name, tuple) and isinstance(name[0], dict):
            return jsonify(name[0]), name[1]
        response, status_code = save_user_embeddings(name, data.get('text'))
        question_answering_on_static_question(name)
        return jsonify(response), status_code
    except Exception as e:
        print(f"Error in create_new_user: {str(e)}")
        return jsonify({"error": str(e)}), 500


@handle_route_exceptions
@main_bp.route('/api/admin/delete-user/<name>', methods=['DELETE'])
def delete_user(name):
    try:
        response, status_code = delete_user_by_name(name)
        return jsonify(response), status_code
    except Exception as e:
        print(f"Error in delete_user: {str(e)}")
        return jsonify({"error": str(e)}), 500


@handle_route_exceptions
@main_bp.route('/api/admin/modify-user-embeddings/<name>', methods=['PUT'])
def modify_user_embeddings_route(name):
    try:
        data = request.get_json()
        if not mongo.db.users.find_one({"name": name}):
            return jsonify({"error": "User not found"}), 404
        response, status_code = modify_user_embeddings(name, data.get('text'))
        return jsonify(response), status_code
    except Exception as e:
        print(f"Error in modify_user_embeddings: {str(e)}")
        return jsonify({"error": str(e)}), 500


@handle_route_exceptions
@main_bp.route('/api/admin/users', methods=['GET'])
def get_users():
    try:
        response, status_code = get_all_users()
        return jsonify(response), status_code
    except Exception as e:
        print(f"Error in get_users: {str(e)}")
        return jsonify({"error": str(e)}), 500


@handle_route_exceptions
@main_bp.route('/api/chat/<name>', methods=['POST'])
def chat_with_user(name):
    try:
        data = request.get_json()
        chat_history = data.get('chat_history', [])
        if not chat_history:
            return jsonify({"error": "Chat history is required"}), 400
        response, status_code = get_user_chat_response(name, chat_history)
        print("DEBUG - Chat response:", response)
        return jsonify(response), status_code
    except Exception as e:
        print(f"Error in chat_with_user: {str(e)}")
        return jsonify({"error": str(e)}), 500


@handle_route_exceptions
@main_bp.route('/api/users/names', methods=['GET'])
def get_user_names_route():
    try:
        response, status_code = get_user_names()
        return jsonify(response), status_code
    except Exception as e:
        print(f"Error in get_user_names: {str(e)}")
        return jsonify({"error": str(e)}), 500


@handle_route_exceptions
@main_bp.route('/api/embedding-stats', methods=['GET'])
def get_embedding_stats():
    try:
        response, status_code = get_embedding_statistics()
        return jsonify(response), status_code
    except Exception as e:
        print(f"Error in get_embedding_stats: {str(e)}")
        return jsonify({"error": str(e)}), 500


@handle_route_exceptions
@main_bp.route('/api/admin/static-questions/<name>', methods=['GET'])
def get_static_questions(name):
    result = get_question_answer_on_static_question(name)
    return jsonify(result), 200


@handle_route_exceptions
@main_bp.route('/api/admin/delete-all-users', methods=['DELETE'])
def delete_all_users_route():
    try:
        response, status_code = delete_all_users()
        return jsonify(response), status_code
    except Exception as e:
        print(f"Error in delete_all_users: {str(e)}")
        return jsonify({"error": str(e)}), 500
