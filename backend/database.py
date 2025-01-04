from flask_pymongo import PyMongo
from pymongo.errors import ConnectionFailure, OperationFailure
from config.organizations import get_org_config, ORGANIZATIONS, DEFAULT_ORG
from try_catch_decorator_new import handle_exceptions


class MultiOrgMongo:
    def __init__(self):
        self.connections = {}
        self.default_connection = None

    @handle_exceptions
    def init_app(self, app):
        for org_name, config in ORGANIZATIONS.items():
            if not config['db_url']:
                raise ValueError(f"Database URL not found for organization: {org_name}")
            
            mongo_instance = PyMongo()
            app.config[f'MONGO_URI_{org_name}'] = config['db_url']
            mongo_instance.init_app(app, uri=config['db_url'])
            self.connections[org_name] = mongo_instance

        self.default_connection = self.connections[DEFAULT_ORG]
        return self

    @handle_exceptions
    def get_db(self, org_name=None):
        org_config = get_org_config(org_name)
        return self.connections.get(org_name, self.default_connection).db


mongo = MultiOrgMongo()
