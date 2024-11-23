from database import mongo
from services.embedding_service import save_user_embeddings, modify_user_embeddings
from werkzeug.security import generate_password_hash
import os
import shutil
from try_catch_decorator import exception_handler

@exception_handler
def create_user(name, password, text):
    if not name or not password:
        return {"error": "Name and password are required"}, 400
    
    if not text:
        return {"error": "Initial text is required"}, 400
        
    if name == os.getenv('ADMIN_USERNAME'):
        return {"error": "Cannot create admin account"}, 403
        
    if mongo.db.users.find_one({"name": name}):
        return {"error": "Name already exists"}, 409
    
    hashed_password = generate_password_hash(password)
    mongo.db.users.insert_one({
        "name": name,
        "password": hashed_password
    })
    return name
    

@exception_handler
def delete_user_by_name(name):
    if not name:
        return {"error": "Name is required"}, 400
        
    result = mongo.db.users.find_one_and_delete({"name": name})
    
    if not result:
        return {"error": "User not found"}, 404
    
    directory = f"embeddings/{name}_embeddings"
    if os.path.exists(directory):
        shutil.rmtree(directory)
        
    return {"message": f"User {name} deleted successfully"}, 200