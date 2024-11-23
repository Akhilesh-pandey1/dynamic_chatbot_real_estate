from flask import Flask
from routes import main_bp
from database import init_db
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
app.config['MONGO_URI'] = os.getenv('MONGO_URI')

app.register_blueprint(main_bp)
init_db(app)

if __name__ == '__main__':
    app.run(debug=os.getenv('FLASK_DEBUG', True)) 