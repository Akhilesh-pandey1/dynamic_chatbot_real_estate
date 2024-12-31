from flask_pymongo import PyMongo
from pymongo.errors import ConnectionFailure, OperationFailure
from try_catch_decorator import handle_exceptions

mongo = PyMongo()

def init_db(app):
    try:
        mongo.init_app(app)
        mongo.db.command('ismaster')
        print("MongoDB connection successful")
        return mongo
    except (ConnectionFailure, OperationFailure) as e:
        print(f"Failed to connect to MongoDB: {str(e)}")
        raise 