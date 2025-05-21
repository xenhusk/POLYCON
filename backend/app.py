from flask import Flask, jsonify, session as flask_session
from flask_cors import CORS # Import CORS
from flask_socketio import SocketIO

from config import Config
from extensions import db, bcrypt, jwt # Import bcrypt and jwt
import os

# Initialize SocketIO for real-time support (CORS allowed on all origins)
socketio = SocketIO(cors_allowed_origins="*")

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
from routes.consultation_routes import consultation_bp
from services.scheduler_service import initialize_scheduler
from routes.polycon_analysis_routes import polycon_analysis_bp # Add this import
from routes.comparative_routes import comparative_bp # Add this import
from routes.profile_routes import profile_bp
from routes.settings_routes import settings_bp


def create_app():
    app = Flask(__name__)
    CORS(app) # Enable CORS for all routes and origins by default
    # Initialize SocketIO with the Flask app
    socketio.init_app(app)

    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app) # Initialize bcrypt
    jwt.init_app(app)    # Initialize jwt

    with app.app_context():
        db.create_all()
        # Start the appointment reminder scheduler
        initialize_scheduler()

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
    app.register_blueprint(account_bp, url_prefix='/account') # Add this line
    app.register_blueprint(enrollment_bp) # Register enrollment_bp
    app.register_blueprint(grade_bp) # Register grade_bp
    app.register_blueprint(homeadmin_bp) # Register homeadmin_bp
    app.register_blueprint(homestudent_bp) # Register homestudent_bp
    app.register_blueprint(hometeacher_bp) # Register hometeacher_bp
    # Consultation endpoints
    app.register_blueprint(consultation_bp)
    app.register_blueprint(polycon_analysis_bp, url_prefix='/polycon-analysis') # Add this line
    app.register_blueprint(comparative_bp, url_prefix='/comparative') # Add this line
    app.register_blueprint(profile_bp)
    app.register_blueprint(settings_bp) # Ensure this is present

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
    # Run the application with Socket.IO support
    socketio.run(app, debug=True, host='0.0.0.0', port=port)
