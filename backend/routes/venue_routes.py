import traceback
from flask import Blueprint, request, jsonify
from models import Venue, Department
from extensions import db
from flask_cors import cross_origin
import logging

venue_bp = Blueprint('venue', __name__, url_prefix='/venues')

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@venue_bp.route('/get_venues', methods=['GET'])
@cross_origin()
def get_venues():
    """Get all venues with optional department filter"""
    logger.debug("GET /get_venues")
    try:
        department_id = request.args.get('department_id')
        
        query = Venue.query.join(Department)
        
        if department_id:
            query = query.filter(Venue.department_id == department_id)
        
        venues = query.all()
        
        result = []
        for venue in venues:
            result.append({
                'id': venue.id,
                'name': venue.name,
                'department_id': venue.department_id,
                'department_name': venue.department.name if venue.department else None,
                'is_available': venue.is_available
            })
        
        logger.debug(f"Response: {result}")
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@venue_bp.route('/get_venues_by_department/<int:department_id>', methods=['GET'])
@cross_origin()
def get_venues_by_department(department_id):
    """Get venues for a specific department"""
    logger.debug(f"GET /get_venues_by_department/{department_id}")
    try:
        venues = Venue.query.filter_by(department_id=department_id).join(Department).all()
        
        result = []
        for venue in venues:
            result.append({
                'id': venue.id,
                'name': venue.name,
                'department_id': venue.department_id,
                'department_name': venue.department.name if venue.department else None,
                'is_available': venue.is_available
            })
        
        logger.debug(f"Response: {result}")
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@venue_bp.route('/add_venue', methods=['POST'])
@cross_origin()
def add_venue():
    """Add a new venue (admin only)"""
    logger.debug("POST /add_venue")
    try:
        data = request.json
        name = data.get('name')
        department_id = data.get('department_id')
        is_available = data.get('is_available', True)
        
        logger.debug(f"Request data: {data}")
        
        if not name:
            logger.warning("Venue name is required")
            return jsonify({'error': 'Venue name is required'}), 400
            
        if not department_id:
            logger.warning("Department ID is required")
            return jsonify({'error': 'Department ID is required'}), 400
        
        # Check if department exists
        department = Department.query.get(department_id)
        if not department:
            logger.warning(f"Department with ID {department_id} not found")
            return jsonify({'error': 'Department not found'}), 400
        
        # Check for duplicate venue name in the same department
        existing_venue = Venue.query.filter_by(name=name, department_id=department_id).first()
        if existing_venue:
            logger.warning("Venue with this name already exists in this department")
            return jsonify({'error': 'Venue with this name already exists in this department'}), 400
        
        new_venue = Venue(
            name=name,
            department_id=department_id,
            is_available=is_available
        )
        
        db.session.add(new_venue)
        db.session.commit()
        
        logger.info(f"Venue added successfully with id {new_venue.id}")
        return jsonify({
            'message': 'Venue added successfully', 
            'id': new_venue.id,
            'venue': {
                'id': new_venue.id,
                'name': new_venue.name,
                'department_id': new_venue.department_id,
                'department_name': new_venue.department.name,
                'is_available': new_venue.is_available
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@venue_bp.route('/edit_venue/<int:venue_id>', methods=['PUT'])
@cross_origin()
def edit_venue(venue_id):
    """Edit an existing venue (admin only)"""
    logger.debug(f"PUT /edit_venue/{venue_id}")
    try:
        venue = Venue.query.get(venue_id)
        if not venue:
            logger.warning(f"Venue with ID {venue_id} not found")
            return jsonify({'error': 'Venue not found'}), 404
        
        data = request.json
        name = data.get('name')
        department_id = data.get('department_id')
        is_available = data.get('is_available')
        
        logger.debug(f"Request data: {data}")
        
        if name is not None:
            # Check for duplicate venue name in the same department
            if department_id is None:
                department_id = venue.department_id
                
            existing_venue = Venue.query.filter(
                Venue.name == name, 
                Venue.department_id == department_id,
                Venue.id != venue_id
            ).first()
            if existing_venue:
                logger.warning("Venue with this name already exists in this department")
                return jsonify({'error': 'Venue with this name already exists in this department'}), 400
            venue.name = name
        
        if department_id is not None:
            # Check if department exists
            department = Department.query.get(department_id)
            if not department:
                logger.warning(f"Department with ID {department_id} not found")
                return jsonify({'error': 'Department not found'}), 400
            venue.department_id = department_id
        
        if is_available is not None:
            venue.is_available = is_available
        
        db.session.commit()
        
        logger.info(f"Venue {venue_id} updated successfully")
        return jsonify({
            'message': 'Venue updated successfully',
            'venue': {
                'id': venue.id,
                'name': venue.name,
                'department_id': venue.department_id,
                'department_name': venue.department.name,
                'is_available': venue.is_available
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@venue_bp.route('/delete_venue/<int:venue_id>', methods=['DELETE'])
@cross_origin()
def delete_venue(venue_id):
    """Delete a venue (admin only)"""
    logger.debug(f"DELETE /delete_venue/{venue_id}")
    try:
        venue = Venue.query.get(venue_id)
        if not venue:
            logger.warning(f"Venue with ID {venue_id} not found")
            return jsonify({'error': 'Venue not found'}), 404
        
        # Check if venue is being used in any bookings or consultation sessions
        from models import Booking, ConsultationSession
        
        booking_count = Booking.query.filter_by(venue_id=venue_id).count()
        session_count = ConsultationSession.query.filter_by(venue_id=venue_id).count()
        
        if booking_count > 0 or session_count > 0:
            logger.warning(f"Cannot delete venue {venue_id} - it is being used in {booking_count} bookings and {session_count} sessions")
            return jsonify({
                'error': f'Cannot delete venue. It is being used in {booking_count} bookings and {session_count} consultation sessions.'
            }), 400
        
        db.session.delete(venue)
        db.session.commit()
        
        logger.info(f"Venue {venue_id} deleted successfully")
        return jsonify({'message': 'Venue deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@venue_bp.route('/toggle_availability/<int:venue_id>', methods=['PUT'])
@cross_origin()
def toggle_venue_availability(venue_id):
    """Toggle venue availability status"""
    logger.debug(f"PUT /toggle_availability/{venue_id}")
    try:
        venue = Venue.query.get(venue_id)
        if not venue:
            logger.warning(f"Venue with ID {venue_id} not found")
            return jsonify({'error': 'Venue not found'}), 404
        
        venue.is_available = not venue.is_available
        db.session.commit()
        
        logger.info(f"Venue {venue_id} availability toggled to {venue.is_available}")
        return jsonify({
            'message': 'Venue availability updated successfully',
            'venue': {
                'id': venue.id,
                'name': venue.name,
                'department_id': venue.department_id,
                'department_name': venue.department.name,
                'is_available': venue.is_available
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500
