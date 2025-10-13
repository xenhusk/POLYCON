import traceback
from flask import Blueprint, request, jsonify
from models import Period, Booking, ConsultationSession
from extensions import db
from flask_cors import cross_origin
import logging

period_bp = Blueprint('period', __name__, url_prefix='/periods')

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@period_bp.route('/get_periods', methods=['GET'])
@cross_origin()
def get_periods():
    """Get all periods"""
    logger.debug("GET /get_periods")
    try:
        periods = Period.query.all()
        
        result = []
        for period in periods:
            result.append({
                'id': period.id,
                'name': period.name,
                'is_active': period.is_active,
                'created_at': period.created_at.isoformat() if period.created_at else None,
                'updated_at': period.updated_at.isoformat() if period.updated_at else None
            })
        
        logger.debug(f"Response: {result}")
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@period_bp.route('/get_active_period', methods=['GET'])
@cross_origin()
def get_active_period():
    """Get the currently active period"""
    logger.debug("GET /get_active_period")
    try:
        active_period = Period.query.filter_by(is_active=True).first()
        
        if not active_period:
            return jsonify({'error': 'No active period found'}), 404
        
        result = {
            'id': active_period.id,
            'name': active_period.name,
            'is_active': active_period.is_active,
            'created_at': active_period.created_at.isoformat() if active_period.created_at else None,
            'updated_at': active_period.updated_at.isoformat() if active_period.updated_at else None
        }
        
        logger.debug(f"Response: {result}")
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@period_bp.route('/add_period', methods=['POST'])
@cross_origin()
def add_period():
    """Add a new period (admin only)"""
    logger.debug("POST /add_period")
    try:
        data = request.json
        name = data.get('name')
        
        logger.debug(f"Request data: {data}")
        
        if not name:
            logger.warning("Period name is required")
            return jsonify({'error': 'Period name is required'}), 400
        
        # Check for duplicate period name
        existing_period = Period.query.filter_by(name=name).first()
        if existing_period:
            logger.warning("Period with this name already exists")
            return jsonify({'error': 'Period with this name already exists'}), 400
        
        new_period = Period(name=name, is_active=False)
        
        db.session.add(new_period)
        db.session.commit()
        
        logger.info(f"Period added successfully with id {new_period.id}")
        return jsonify({
            'message': 'Period added successfully', 
            'id': new_period.id,
            'period': {
                'id': new_period.id,
                'name': new_period.name,
                'is_active': new_period.is_active,
                'created_at': new_period.created_at.isoformat() if new_period.created_at else None,
                'updated_at': new_period.updated_at.isoformat() if new_period.updated_at else None
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@period_bp.route('/edit_period/<int:period_id>', methods=['PUT'])
@cross_origin()
def edit_period(period_id):
    """Edit an existing period (admin only)"""
    logger.debug(f"PUT /edit_period/{period_id}")
    try:
        period = Period.query.get(period_id)
        if not period:
            logger.warning(f"Period with ID {period_id} not found")
            return jsonify({'error': 'Period not found'}), 404
        
        data = request.json
        name = data.get('name')
        
        logger.debug(f"Request data: {data}")
        
        if name is not None:
            # Check for duplicate period name
            existing_period = Period.query.filter(
                Period.name == name,
                Period.id != period_id
            ).first()
            if existing_period:
                logger.warning("Period with this name already exists")
                return jsonify({'error': 'Period with this name already exists'}), 400
            period.name = name
        
        db.session.commit()
        
        logger.info(f"Period {period_id} updated successfully")
        return jsonify({
            'message': 'Period updated successfully',
            'period': {
                'id': period.id,
                'name': period.name,
                'is_active': period.is_active,
                'created_at': period.created_at.isoformat() if period.created_at else None,
                'updated_at': period.updated_at.isoformat() if period.updated_at else None
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@period_bp.route('/delete_period/<int:period_id>', methods=['DELETE'])
@cross_origin()
def delete_period(period_id):
    """Delete a period (admin only)"""
    logger.debug(f"DELETE /delete_period/{period_id}")
    try:
        period = Period.query.get(period_id)
        if not period:
            logger.warning(f"Period with ID {period_id} not found")
            return jsonify({'error': 'Period not found'}), 404
        
        # Check if period is being used in any bookings or consultation sessions
        booking_count = Booking.query.filter_by(period_id=period_id).count()
        session_count = ConsultationSession.query.filter_by(period_id=period_id).count()
        
        if booking_count > 0 or session_count > 0:
            logger.warning(f"Cannot delete period {period_id} - it is being used in {booking_count} bookings and {session_count} sessions")
            return jsonify({
                'error': f'Cannot delete period. It is being used in {booking_count} bookings and {session_count} consultation sessions.'
            }), 400
        
        db.session.delete(period)
        db.session.commit()
        
        logger.info(f"Period {period_id} deleted successfully")
        return jsonify({'message': 'Period deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@period_bp.route('/set_active_period/<int:period_id>', methods=['PUT'])
@cross_origin()
def set_active_period(period_id):
    """Set a period as active (only one period can be active at a time)"""
    logger.debug(f"PUT /set_active_period/{period_id}")
    try:
        period = Period.query.get(period_id)
        if not period:
            logger.warning(f"Period with ID {period_id} not found")
            return jsonify({'error': 'Period not found'}), 404
        
        # Deactivate all other periods
        Period.query.update({'is_active': False})
        
        # Activate the selected period
        period.is_active = True
        
        db.session.commit()
        
        logger.info(f"Period {period_id} set as active")
        return jsonify({
            'message': 'Period set as active successfully',
            'period': {
                'id': period.id,
                'name': period.name,
                'is_active': period.is_active,
                'created_at': period.created_at.isoformat() if period.created_at else None,
                'updated_at': period.updated_at.isoformat() if period.updated_at else None
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@period_bp.route('/create_default_periods', methods=['POST'])
@cross_origin()
def create_default_periods():
    """Create default periods (prelims, midterm, prefinals, finals)"""
    logger.debug("POST /create_default_periods")
    try:
        default_periods = ['Prelims', 'Midterm', 'Pre-finals', 'Finals']
        created_periods = []
        
        for period_name in default_periods:
            # Check if period already exists
            existing_period = Period.query.filter_by(name=period_name).first()
            if not existing_period:
                new_period = Period(name=period_name, is_active=False)
                db.session.add(new_period)
                created_periods.append(period_name)
        
        # Set the first period (Prelims) as active by default
        if created_periods:
            first_period = Period.query.filter_by(name='Prelims').first()
            if first_period:
                first_period.is_active = True
        
        db.session.commit()
        
        logger.info(f"Default periods created: {created_periods}")
        return jsonify({
            'message': f'Default periods created successfully: {created_periods}',
            'created_periods': created_periods
        }), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500
