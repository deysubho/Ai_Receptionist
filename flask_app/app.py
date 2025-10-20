# d:\AISupervisor\flask_app\app.py

import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import os
from flask import Flask, jsonify
from dotenv import load_dotenv
from flask_app.models import db

# Load environment variables from .env file
load_dotenv()

def create_app():
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'a_default_secret_key')
    
    # Configure the database
    db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'database.sqlite'))
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize extensions
    db.init_app(app)

    # Register blueprints
    from flask_app.routes import api
    app.register_blueprint(api)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5001) # Running on a different port to avoid conflict with Node app
