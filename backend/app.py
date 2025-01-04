from flask import Flask
from routes import main_bp
from database import mongo
from dotenv import load_dotenv
import os
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)

mongo.init_app(app)

app.register_blueprint(main_bp)

if __name__ == '__main__':
    app.run(host='0.0.0.0') 