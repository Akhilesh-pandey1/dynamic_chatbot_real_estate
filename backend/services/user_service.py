from database import mongo
import os
import shutil
from datetime import datetime
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
    
    created_at = datetime.utcnow()
    
    mongo.db.users.insert_one({
        "name": name,
        "password": password,  
        "created_at": created_at,
    })
    return name
    

@exception_handler
def delete_user_by_name(name):
    if not name:
        return {"error": "Name is required"}, 400
        
    result = mongo.db.users.find_one_and_delete({"name": name})
    
    if not result:
        return {"error": "User not found"}, 404
    
    embedding_file = f"embeddings/{name}_embeddings.pkl"
    if os.path.exists(embedding_file):
        os.remove(embedding_file)
        
    return {"message": f"User {name} deleted successfully"}, 200

@exception_handler
def get_all_users():

    users = list(mongo.db.users.find(
        {},  
        {
            "_id": 0,  
            "name": 1,
            "password": 1,
            "created_at": 1,
            "modifications": 1  
        }
    ))
    
    for user in users:
        if 'created_at' in user:
            user['created_at'] = user['created_at'].isoformat()
        # Set modifications to 0 if not found
        if 'modifications' not in user:
            user['modifications'] = 0
            
    return {"users": users}, 200
  

@exception_handler
def get_user_names():
    try:
        users = list(mongo.db.users.find(
            {},  # empty query to get all users
            {
                "_id": 0,
                "name": 1  # only return the name field
            }
        ))
        
        # Extract just the names into a list
        user_names = [user['name'] for user in users]
        return {"names": user_names}, 200
    except Exception as e:
        return {"error": f"Failed to fetch user names: {str(e)}"}, 500