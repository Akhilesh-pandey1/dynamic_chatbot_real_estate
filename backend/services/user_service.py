from database import mongo
from gridfs import GridFS
from datetime import datetime
from try_catch_decorator import exception_handler

@exception_handler
def create_user(name, password, text):
    if not name or not password:
        raise ValueError("Name and password are required")
    
    if not text:
        raise ValueError("Initial text is required")
    
    if mongo.db.users.find_one({"name": name}):
        raise ValueError("Name already exists")
    
    created_at = datetime.utcnow()
    mongo.db.users.insert_one({"name": name, "password": password, "created_at": created_at})
    return name
    

@exception_handler
def delete_user_by_name(name):
    if not name:
        raise ValueError("Name is required")
        
    result = mongo.db.users.find_one_and_delete({"name": name})
    
    if not result:
        raise ValueError("User not found")
    
    fs = GridFS(mongo.db)
    embedding_file = fs.find_one({"filename": f"{name}_embeddings"})
    if embedding_file:
        fs.delete(embedding_file._id)
        
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
        if 'modifications' not in user:
            user['modifications'] = 0
            
    return {"users": users}, 200
  

@exception_handler
def get_user_names():
    users = list(mongo.db.users.find(
        {},  
        {
            "_id": 0,
            "name": 1  
        }
    ))
    user_names = [user['name'] for user in users]
    return {"names": user_names}, 200
   