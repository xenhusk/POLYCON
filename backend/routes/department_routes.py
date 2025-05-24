import traceback
from flask import Blueprint, request, jsonify
from models import Department
from extensions import db
from flask_cors import cross_origin
import logging

department_bp = Blueprint('department', __name__, url_prefix='/departments')

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@department_bp.route('/get_departments', methods=['GET'])
@cross_origin()
def get_departments():
    logger.debug("GET /get_departments")
    try:
        departments = Department.query.all()
        result = []
        for dept in departments:
            result.append({
                'id': dept.id,
                'name': dept.name
            })
        logger.debug(f"Response: {result}")
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        logger.error(traceback.format_exc())  # Log the traceback
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@department_bp.route('/add_department', methods=['POST'])
@cross_origin()
def add_department():
    logger.debug("POST /add_department")
    try:
        data = request.json
        # Changed key to 'name' (not 'departmentName')
        name = data.get('name')
        logger.debug(f"Request data: {data}")
        if not name:
            logger.warning("Department name is required")
            return jsonify({'error': 'Department name is required'}), 400
        # Check duplicate by name
        if Department.query.filter_by(name=name).first():
            logger.warning("Department already exists")
            return jsonify({'error': 'Department already exists'}), 400
        new_dept = Department(name=name)
        db.session.add(new_dept)
        db.session.commit()
        logger.info(f"Department added successfully with id {new_dept.id}")
        return jsonify({'message': 'Department added successfully', 'id': new_dept.id}), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@department_bp.route('/edit_department/<int:department_id>', methods=['PUT'])
@cross_origin()
def edit_department(department_id):
    logger.debug(f"PUT /edit_department/{department_id}")
    try:
        data = request.json
        # Changed key to 'name'
        name = data.get('name')
        logger.debug(f"Request data: {data}")
        if not name:
            logger.warning("Department name is required")
            return jsonify({'error': 'Department name is required'}), 400
        dept = Department.query.get(department_id)
        if not dept:
            logger.warning("Department not found")
            return jsonify({'error': 'Department not found'}), 404
        dept.name = name
        db.session.commit()
        logger.info(f"Department {department_id} updated successfully")
        return jsonify({'message': 'Department updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@department_bp.route('/delete_department/<int:department_id>', methods=['DELETE'])
@cross_origin()
def delete_department(department_id):
    logger.debug(f"DELETE /delete_department/{department_id}")
    try:
        dept = Department.query.get(department_id)
        if not dept:
            logger.warning("Department not found")
            return jsonify({'error': 'Department not found'}), 404
        db.session.delete(dept)
        db.session.commit()
        logger.info(f"Department {department_id} deleted successfully")
        return jsonify({'message': 'Department deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error: {str(e)}")
        logger.error(traceback.format_exc())  # Log the traceback
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500
