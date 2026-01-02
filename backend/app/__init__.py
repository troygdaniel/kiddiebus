from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, decode_token
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from config import config
import os

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()


def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    app.url_map.strict_slashes = False

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)

    # JWT error handlers (must be after jwt.init_app)
    @jwt.invalid_token_loader
    def invalid_token_callback(error_string):
        print(f"[JWT ERROR] Invalid token: {error_string}")
        return {'error': f'Invalid token: {error_string}'}, 422

    @jwt.unauthorized_loader
    def unauthorized_callback(error_string):
        print(f"[JWT ERROR] Unauthorized: {error_string}")
        return {'error': f'Unauthorized: {error_string}'}, 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        print(f"[JWT ERROR] Token expired. Header: {jwt_header}, Payload: {jwt_payload}")
        return {'error': 'Token has expired'}, 401

    # Debug middleware to log auth headers and test token decoding
    @app.before_request
    def log_request_info():
        from flask import request
        auth_header = request.headers.get('Authorization', 'NONE')
        if auth_header != 'NONE':
            token_preview = auth_header[:50] if len(auth_header) > 50 else auth_header
            if auth_header.startswith('Bearer '):
                token = auth_header[7:]  # Remove 'Bearer ' prefix
                segments = token.split('.')
                print(f"[AUTH DEBUG] Path: {request.path}, Token segments: {len(segments)}")
                print(f"[AUTH DEBUG] Token length: {len(token)}, First 100 chars: {token[:100]}")
                print(f"[AUTH DEBUG] JWT_SECRET_KEY set: {bool(app.config.get('JWT_SECRET_KEY'))}")
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.buses import buses_bp
    from app.routes.routes import routes_bp
    from app.routes.students import students_bp
    from app.routes.notifications import notifications_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(buses_bp, url_prefix='/api/buses')
    app.register_blueprint(routes_bp, url_prefix='/api/routes')
    app.register_blueprint(students_bp, url_prefix='/api/students')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')

    # Health check route
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'message': 'Kiddie Bus API is running'}

    return app
