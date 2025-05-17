# backend-python/app.py

# MUST BE AT THE VERY TOP before any other standard library or Flask/SocketIO imports
import eventlet
eventlet.monkey_patch(all=True, socket=True, select=True, thread=True, os=True)

import os
import datetime
from flask import Flask, request, jsonify # Keep this import early
from flask_cors import CORS
import logging
import atexit
import threading # For scheduler health check if you re-enable it
import time # For scheduler health check if you re-enable it

# Import your blueprints - these should come AFTER monkey_patching
from routes.consultation_routes import consultation_bp
from routes.booking_routes import booking_bp
from routes.account_management import acc_management_bp
from routes.course_routes import course_bp
from routes.grade_routes import grade_bp
from routes.profile_routes import profile_bp
from routes.user_routes import user_bp
from routes.hometeacher_routes import hometeacher_routes_bp
from routes.program_routes import program_bp
from routes.search_routes import search_bp
from routes.notification_routes import notification_bp
from routes.migration import migration_bp
from routes.homeadmin_routes import homeadmin_routes_bp
from routes.department_routes import department_bp
from routes.semester_routes import semester_routes
from routes.enrollment_routes import enrollment_bp
from routes.homestudent_routes import homestudent_routes_bp
from routes.reminder_routes import reminder_bp
from routes.comparative_analysis_routes import comparative_bp
from routes.polycon_analysis_routes import polycon_analysis_bp

# Import services - these should also come AFTER monkey_patching
from services.socket_service import init_socket, socketio # Import both init_socket and the socketio instance
from services.scheduler_service import initialize_scheduler
# Removed check_appointments_1h from top-level import as it's managed by the scheduler

# Global variable for the scheduler instance
scheduler_instance_global = None

def create_app():
    """
    Creates and configures the Flask application.
    """
    global scheduler_instance_global

    current_app = Flask(__name__)
    CORS(current_app, resources={
        r"/*": {
            "origins": "*",
            "allow_headers": ["Content-Type", "Authorization"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        }
    })

    init_socket(current_app)

    # Register blueprints
    current_app.register_blueprint(user_bp, url_prefix='/user')
    current_app.register_blueprint(booking_bp, url_prefix='/bookings')
    current_app.register_blueprint(search_bp, url_prefix='/search')
    current_app.register_blueprint(reminder_bp, url_prefix='/reminder')
    current_app.register_blueprint(consultation_bp, url_prefix='/consultation')
    current_app.register_blueprint(acc_management_bp, url_prefix='/account')
    current_app.register_blueprint(course_bp, url_prefix='/course')
    current_app.register_blueprint(grade_bp, url_prefix='/grade')
    current_app.register_blueprint(profile_bp, url_prefix='/profile')
    current_app.register_blueprint(hometeacher_routes_bp, url_prefix='/hometeacher')
    current_app.register_blueprint(program_bp, url_prefix='/program')
    current_app.register_blueprint(migration_bp, url_prefix='/migration')
    current_app.register_blueprint(department_bp, url_prefix='/department')
    current_app.register_blueprint(homeadmin_routes_bp, url_prefix='/homeadmin')
    current_app.register_blueprint(semester_routes, url_prefix='/semester')
    current_app.register_blueprint(enrollment_bp, url_prefix='/enrollment')
    current_app.register_blueprint(homestudent_routes_bp, url_prefix='/homestudent')
    current_app.register_blueprint(comparative_bp, url_prefix='/comparative')
    current_app.register_blueprint(polycon_analysis_bp, url_prefix='/polycon-analysis')
    current_app.register_blueprint(notification_bp, url_prefix='/notifications')

    @current_app.route('/')
    def home():
        return jsonify({"message": "POLYCON Python Backend is Running with Eventlet"})

    # Configure application logging
    logging.basicConfig(level=logging.INFO,
                       format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
                       datefmt='%Y-%m-%d %H:%M:%S',
                       force=True)
    logger = logging.getLogger(__name__)
    current_app.logger.handlers.clear()
    current_app.logger.addHandler(logging.StreamHandler())
    current_app.logger.setLevel(logging.INFO)
    current_app.logger.propagate = False

    # Initialize the APScheduler
    if not current_app.config.get('TESTING', False):
        if os.environ.get('WERKZEUG_RUN_MAIN') != 'true':
            try:
                logger.info("Initializing appointment reminder scheduler...")
                temp_scheduler = initialize_scheduler()
                if temp_scheduler:
                    scheduler_instance_global = temp_scheduler
                    if scheduler_instance_global.running:
                        logger.info("Scheduler initialized and running successfully.")
                        atexit.register(lambda: scheduler_instance_global.shutdown(wait=False))
                    else:
                        logger.warning("Scheduler initialized but NOT running. Attempting to start.")
                        try:
                            scheduler_instance_global.start(paused=False)
                            logger.info("Scheduler started successfully via explicit start call.")
                            atexit.register(lambda: scheduler_instance_global.shutdown(wait=False))
                        except Exception as start_err:
                            logger.error(f"Failed to explicitly start scheduler: {start_err}", exc_info=True)

                else:
                    logger.error("Failed to get scheduler instance from initialize_scheduler.")
            except Exception as e:
                logger.error(f"Error during scheduler initialization: {str(e)}", exc_info=True)
        else:
             logger.info("Scheduler initialization skipped by WERKZEUG_RUN_MAIN check.")

    @current_app.route('/scheduler/status', methods=['GET'])
    def scheduler_status_route(): # Renamed to avoid conflict
        global scheduler_instance_global
        if not scheduler_instance_global:
            return jsonify({'error': 'Scheduler instance is not available.'}), 503
        try:
            is_running = scheduler_instance_global.running
            jobs_list = scheduler_instance_global.get_jobs()
            job_info = []
            for job in jobs_list:
                trigger_info = "Unknown Trigger"
                if hasattr(job.trigger, 'interval'):
                    trigger_info = f"Interval: {job.trigger.interval.total_seconds()}s"
                elif hasattr(job.trigger, 'run_date'):
                     trigger_info = f"Run Date: {str(job.trigger.run_date)}"
                job_info.append({
                    'id': job.id,
                    'name': job.name,
                    'next_run_time': str(job.next_run_time) if job.next_run_time else 'N/A',
                    'func_ref': str(job.func_ref),
                    'trigger': trigger_info
                })
            return jsonify({
                'status': 'running' if is_running else 'stopped',
                'job_count': len(job_info),
                'jobs': job_info,
                'current_server_time': datetime.datetime.now().isoformat()
            }), 200
        except Exception as e:
            current_app.logger.error(f"Error retrieving scheduler status: {str(e)}", exc_info=True)
            return jsonify({'error': f"An error occurred while checking scheduler status: {str(e)}"}), 500

    return current_app

# Create the Flask app instance using the factory
app = create_app()

# Define SocketIO event handlers using the imported 'socketio' instance
@socketio.on('connect')
def handle_connect():
    logger = app.logger if app and hasattr(app, 'logger') else logging.getLogger(__name__)
    logger.info(f'Client connected: {request.sid}')

@socketio.on('disconnect')
def handle_disconnect():
    logger = app.logger if app and hasattr(app, 'logger') else logging.getLogger(__name__)
    logger.info(f'Client disconnected: {request.sid}')

# This block will execute when you run `python app.py`
if __name__ == '__main__':
    main_logger = app.logger if app and hasattr(app, 'logger') else logging.getLogger(__name__)
    main_logger.info("--- Starting POLYCON Flask-SocketIO server with Eventlet (Direct Run) ---")
    try:
        # use_reloader=False is important for stability with eventlet on Windows
        socketio.run(app, host='0.0.0.0', port=5001, debug=True, use_reloader=False)
    except Exception as e:
        main_logger.critical(f"Failed to start the server: {e}", exc_info=True)
    finally:
        main_logger.info("--- POLYCON Flask-SocketIO server stopped ---")
