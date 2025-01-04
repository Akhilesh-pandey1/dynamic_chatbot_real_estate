from database import mongo
from gridfs import GridFS
from datetime import datetime
from try_catch_decorator_new import handle_exceptions, CustomException

@handle_exceptions
def create_user(name, password, text, organization):
    if not name or not password or not organization:
        raise CustomException("Name, password and organization are required")

    if not text:
        raise CustomException("Initial text is required")

    db = mongo.get_db(organization)
    if db.users.find_one({"name": name}):
        raise ValueError("Name already exists")

    created_at = datetime.utcnow()
    db.users.insert_one({
        "name": name, 
        "password": password, 
        "created_at": created_at
    })
    return name


@handle_exceptions
def delete_user_by_name(name, organization):
    if not name:
        raise ValueError("Name is required")

    db = mongo.get_db(organization)
    result = db.users.find_one_and_delete({"name": name})

    if not result:
        raise ValueError("User not found")

    fs = GridFS(db)
    embedding_file = fs.find_one({"filename": f"{name}_embeddings"})
    if embedding_file:
        fs.delete(embedding_file._id)

    return {"message": f"User {name} deleted successfully"}, 200


@handle_exceptions
def get_all_users(organization=None):
    db = mongo.get_db(organization)
    users = list(db.users.find(
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


@handle_exceptions
def get_user_names(organization=None):
    db = mongo.get_db(organization)
    users = list(db.users.find(
        {},
        {
            "_id": 0,
            "name": 1
        }
    ))
    user_names = [user['name'] for user in users]
    return {"names": user_names}, 200


@handle_exceptions
def delete_all_users(organization=None):
    db = mongo.get_db(organization)
    fs = GridFS(db)
    for grid_file in fs.find({"filename": {"$regex": "_embeddings$"}}):
        fs.delete(grid_file._id)

    result = db.users.delete_many({})

    return {
        "message": f"Successfully deleted {result.deleted_count} users and their embeddings",
        "users_deleted": result.deleted_count
    }, 200
