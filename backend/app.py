# Apply eventlet monkey patch BEFORE importing anything else
import eventlet
eventlet.monkey_patch()

from flask import Flask, jsonify, session as flask_session, request
from flask_cors import CORS # Import CORS
from flask_migrate import Migrate  # Add this import

from config import Config
from extensions import db, bcrypt, jwt # Import bcrypt and jwt
import os
from services.socket_service import socketio, init_app

# Import blueprints
from routes.health import health_bp
from routes.auth_routes import auth_bp # Import auth_bp
from routes.data_routes import data_bp # Import data_bp
from routes.semester_routes import semester_bp # Import semester_bp
from routes.user_routes import user_bp # Import user_bp
from routes.department_routes import department_bp # Import department_bp
from routes.program_routes import program_bp # Import program_bp
from routes.course_routes import course_bp # Add this import
from routes.booking_routes import booking_bp # Add this import
from routes.account_routes import account_bp # Add this import
from routes.enrollment_routes import enrollment_bp # Import enrollment_bp
from routes.grade_routes import grade_bp # Import grade_bp
from routes.homeadmin_routes import homeadmin_bp # Import homeadmin_bp
from routes.homestudent_routes import homestudent_bp # Import homestudent_bp
from routes.hometeacher_routes import hometeacher_bp # Import hometeacher_bp
from routes.search_routes import search_bp # Import search_bp
from routes.consultation_routes import consultation_bp
from routes.polycon_analysis_routes import polycon_analysis_bp # Add this import
from routes.comparative_routes import comparative_bp # Add this import
from routes.profile_routes import profile_bp
from routes.settings_routes import settings_bp
from routes.socket_test_routes import socket_test_bp # Import socket test routes
from routes.scheduler_routes import scheduler_bp # Import scheduler routes
from routes.notification_test_routes import notification_test_bp # Import notification test routes
from routes.debug_routes import debug_bp # Import debug routes
from routes.alternative_reminders import alt_reminders_bp # Import alternative reminders
from routes.teacher_schedule_routes import teacher_schedule_bp # Import teacher schedule routes
from routes.keep_alive import keep_alive_bp # Import keep-alive routes
from routes.prefetch_routes import prefetch_bp # Import prefetch routes
from routes.cache_warm_routes import cache_warm_bp # Import cache warming routes
from routes.websocket_health import websocket_health_bp # Import websocket health routes
import routes.socket_routes  # Register socket event handlers


def create_app():
    app = Flask(__name__)
    
    # Configure CORS settings
    cors_origins = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:3001')
    # Handle both single URL and comma-separated URLs
    if ',' in cors_origins:
        allowed_origins = cors_origins.split(',')
    else:
        allowed_origins = [cors_origins]
    
    # Add common localhost variants for development
    dev_origins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:5173',
    ]
    for origin in dev_origins:
        if origin not in allowed_origins:
            allowed_origins.append(origin)
    
    print(f"CORS allowed origins: {allowed_origins}")  # Debug log
    
    # Configure CORS with explicit settings
    CORS(app, 
         resources={
             r"/*": {
                 "origins": allowed_origins,
                 "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                 "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
                 "supports_credentials": True
             }
         }
    )

    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app) # Initialize bcrypt
    jwt.init_app(app)    # Initialize jwt
    init_app(app)  # Initialize SocketIO with Flask app
    migrate = Migrate(app, db)  # Add this line to initialize Flask-Migrate

    with app.app_context():
        db.create_all()
        # Ensure is_verified column exists for login
        from sqlalchemy import text
        db.session.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE"))
        db.session.commit()
        
        # Initialize appointment reminder scheduler based on environment
        flask_env = os.getenv('FLASK_ENV', 'development')
        is_production = flask_env == 'production'
        
        if is_production:
            # Use production-optimized scheduler for Render deployment
            # NOTE: Background threading is broken in Render production environment
            # This scheduler is kept for development/testing but doesn't work in production
            # ACTUAL PRODUCTION REMINDERS: Use /alternative-reminders/trigger endpoint 
            # triggered by external cron service (cron-job.org)
            from services.scheduler_service_production import initialize_production_scheduler
            initialize_production_scheduler(app, reminder_minutes=15)
            print("✅ Production scheduler initialized (NOTE: Background threads don't work - use alternative reminders)")
        else:
            # Use regular scheduler for development
            from services.scheduler_service import initialize_scheduler
            initialize_scheduler(app)
            print("✅ Development scheduler initialized")
        
        # Initialize concern analytics prefetch service
        try:
            from services.concern_analytics_prefetch import initialize_concern_analytics_prefetcher
            # Prefetch every 30 minutes to keep cache warm
            initialize_concern_analytics_prefetcher(app, prefetch_interval_minutes=30)
            print("✅ Concern analytics prefetch service initialized")
        except Exception as e:
            print(f"⚠️ Failed to initialize concern analytics prefetch service: {e}")

    # Register blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp) # Register auth_bp
    app.register_blueprint(data_bp) # Register data_bp
    app.register_blueprint(semester_bp) # Register semester_bp
    app.register_blueprint(user_bp) # Corrected: Removed url_prefix as it's defined in the blueprint
    app.register_blueprint(department_bp, url_prefix='/departments') # Register department_bp
    app.register_blueprint(program_bp)
    app.register_blueprint(course_bp, url_prefix='/course') # Add this line
    app.register_blueprint(booking_bp, url_prefix='/bookings') # Add this line
    app.register_blueprint(account_bp, url_prefix='/account') # This ensures /account/verify is the route
    app.register_blueprint(enrollment_bp) # Register enrollment_bp
    app.register_blueprint(grade_bp) # Register grade_bp
    app.register_blueprint(homeadmin_bp) # Register homeadmin_bp
    app.register_blueprint(homestudent_bp) # Register homestudent_bp
    app.register_blueprint(hometeacher_bp) # Register hometeacher_bp
    app.register_blueprint(search_bp) # Register search_bp
    # Consultation endpoints
    app.register_blueprint(consultation_bp)
    app.register_blueprint(polycon_analysis_bp, url_prefix='/polycon-analysis') # Add this line
    app.register_blueprint(comparative_bp, url_prefix='/comparative') # Add this line
    app.register_blueprint(profile_bp)
    app.register_blueprint(settings_bp) # Ensure this is present
    app.register_blueprint(socket_test_bp) # Register socket test routes
    app.register_blueprint(scheduler_bp, url_prefix='/scheduler') # Register scheduler routes with prefix
    app.register_blueprint(notification_test_bp, url_prefix='/notification-test') # Register notification test routes
    app.register_blueprint(debug_bp, url_prefix='/debug') # Register debug routes with prefix
    app.register_blueprint(alt_reminders_bp, url_prefix='/alternative-reminders') # Register alternative reminder routes
    app.register_blueprint(teacher_schedule_bp, url_prefix='/teacher_schedule') # Register teacher schedule routes
    app.register_blueprint(keep_alive_bp) # Register keep-alive routes (no prefix for simple /ping)
    app.register_blueprint(prefetch_bp, url_prefix='/prefetch') # Register prefetch routes
    app.register_blueprint(cache_warm_bp, url_prefix='/cache') # Register cache warming routes
    app.register_blueprint(websocket_health_bp, url_prefix='/websocket') # Register websocket health routes

    # Configure static folder for uploads
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    app.config['UPLOADS_FOLDER'] = UPLOAD_FOLDER
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 # 16MB max upload size

    # Static file serving for uploads
    from flask import send_from_directory
    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOADS_FOLDER'], filename)

    return app


app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5001))
    print("Starting Flask server with SocketIO on port", port)
    socketio.run(app, debug=True, host='0.0.0.0', port=port)