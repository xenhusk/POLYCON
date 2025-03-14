import os
import datetime
if os.getenv("USE_EVENTLET", "false").lower() == "true":
    import eventlet
    eventlet.monkey_patch()

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from routes.consultation_routes import consultation_bp
from routes.booking_routes import booking_bp
from routes.account_management import acc_management_bp
from routes.course_routes import course_bp
from routes.grade_routes import grade_bp # Import account management blueprint
from routes.profile_routes import profile_bp  # added import for profile routes
from routes.user_routes import user_bp  # <-- new import
from routes.hometeacher_routes import hometeacher_routes_bp
from routes.program_routes import program_bp  # <-- new import
from routes.search_routes import search_bp  # NEW import for search routes
from services.socket_service import init_socket
from routes.notification_routes import notification_bp
from services.socket_service import socketio  # Ensure socket service is imported
from routes.migration import migration_bp  # NEW: import migration blueprint
from routes.homeadmin_routes import homeadmin_routes_bp  # <-- new import
from routes.department_routes import department_bp  # <-- new import
from routes.semester_routes import semester_routes  # new import for semester endpoints
from routes.enrollment_routes import enrollment_bp  # new import for enrollment endpoints
from routes.homestudent_routes import homestudent_routes_bp #
from services.scheduler_service import initialize_scheduler, check_appointments_1h, check_appointments_24h
from routes.reminder_routes import reminder_bp
from routes.comparative_analysis_routes import comparative_bp  
from routes.polycon_analysis_routes import polycon_analysis_bp # new import for comparative analysis
import logging
import atexit
import threading
import time

def create_app():
    app = Flask(__name__)
    CORS(app, resources={
        r"/*": {
            "origins": "*",
            "allow_headers": ["Content-Type"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        }
    })

    socketio = init_socket(app)  # Initialize socket with app

    # Register blueprints
    app.register_blueprint(user_bp, url_prefix='/user')  # <-- new registration
    app.register_blueprint(booking_bp, url_prefix='/bookings')  # Remove the /bookings prefix
    app.register_blueprint(search_bp, url_prefix='/search')  # NEW registration for search endpoints
    app.register_blueprint(reminder_bp, url_prefix='/reminder')  # Register reminder routes

    @app.route('/')
    def home():
        return jsonify({"message": "POLYCON Python Backend is Running"})  # Adding root route for health check
    

    # Register the consultation routes as a blueprint
    app.register_blueprint(consultation_bp, url_prefix='/consultation')

    # Register the account management routes as a blueprint
    app.register_blueprint(acc_management_bp, url_prefix='/account')

    app.register_blueprint(course_bp, url_prefix='/course')

    # Register the grade routes as a blueprint
    app.register_blueprint(grade_bp, url_prefix='/grade')

    # Register the profile routes as a blueprint
    app.register_blueprint(profile_bp, url_prefix='/profile')

    app.register_blueprint(hometeacher_routes_bp, url_prefix='/hometeacher')

    app.register_blueprint(program_bp, url_prefix='/program')

    app.register_blueprint(migration_bp, url_prefix='/migration')  # NEW: register migration endpoints
    app.register_blueprint(department_bp, url_prefix='/department')  # <-- new registrations
    app.register_blueprint(homeadmin_routes_bp, url_prefix='/homeadmin')
    app.register_blueprint(semester_routes, url_prefix='/semester')  # new registration for semester endpoints
    app.register_blueprint(enrollment_bp, url_prefix='/enrollment')  # This should match the frontend fetch URL
    app.register_blueprint(homestudent_routes_bp, url_prefix='/homestudent')  # <-- new registration
    app.register_blueprint(comparative_bp, url_prefix='/comparative')
    app.register_blueprint(polycon_analysis_bp, url_prefix='/polycon-analysis')# new blueprint registration

    # Configure root logger
    logging.basicConfig(level=logging.INFO, 
                       format='%(asctime)s [%(levelname)s] %(name)s: %(message)s')
    logger = logging.getLogger("app")

    try:
        # Initialize the scheduler
        logger.info("Initializing appointment reminder scheduler...")
        scheduler = initialize_scheduler()
        logger.info("Scheduler initialized successfully")
        
        # Register a function to stop the scheduler when the app exits
        atexit.register(lambda: scheduler.shutdown(wait=False))
        
        # Run an initial check to make sure everything is working
        logger.info("Running initial check for upcoming appointments...")
        threading.Thread(target=check_appointments_1h).start()
        
        # Add a health check thread to keep the scheduler alive
        def scheduler_health_check():
            while True:
                # Log scheduler status every 5 minutes
                time.sleep(300)  # 5 minutes
                if not scheduler.running:
                    logger.error("Scheduler stopped running! Attempting to restart...")
                    initialize_scheduler()
                else:
                    logger.info("Scheduler health check: Running normally")
                    
                # Check how many jobs are scheduled
                jobs = scheduler.get_jobs()
                logger.info(f"Active scheduled jobs: {len(jobs)}")
                for job in jobs:
                    logger.info(f"Job: {job.id}, Next run: {job.next_run_time}")
        
        # Start the health check thread
        health_check_thread = threading.Thread(target=scheduler_health_check, daemon=True)
        health_check_thread.start()
        logger.info("Scheduler health check thread started")
        
    except Exception as e:
        logger.error(f"Error initializing scheduler: {str(e)}")
        # Don't let scheduler issues prevent app from starting

    # Add a scheduler status endpoint
    @app.route('/scheduler/status', methods=['GET'])
    def scheduler_status():
        try:
            is_running = scheduler.running
            jobs = scheduler.get_jobs()
            job_info = []
            
            for job in jobs:
                job_info.append({
                    'id': job.id,
                    'next_run': str(job.next_run_time),
                    'function': job.func.__name__,
                    'interval': job.trigger.interval.total_seconds()
                })
                
            return jsonify({
                'running': is_running,
                'jobs': job_info,
                'server_time': datetime.datetime.now().isoformat()
            }), 200
        except Exception as e:
            return jsonify({
                'error': f"Error checking scheduler status: {str(e)}"
            }), 500

    # Initialize the scheduler for appointment reminders
    if not app.config.get('TESTING', False):
        initialize_scheduler()
        app.logger.info("Appointment reminder scheduler initialized")
    
    return app

app = create_app()

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    # Enable WebSocket support
    socketio.run(app, debug=True, port=5001, allow_unsafe_werkzeug=True)

