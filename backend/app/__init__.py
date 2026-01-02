from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from config import config

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

    # Debug middleware to log auth headers
    @app.before_request
    def log_request_info():
        from flask import request
        auth_header = request.headers.get('Authorization', 'NONE')
        if auth_header != 'NONE':
            token_preview = auth_header[:50] if len(auth_header) > 50 else auth_header
            segments = auth_header.replace('Bearer ', '').split('.') if auth_header.startswith('Bearer ') else []
            print(f"[AUTH DEBUG] Path: {request.path}, Auth header segments: {len(segments)}, Preview: {token_preview}")
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
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
