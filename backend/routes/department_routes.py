from flask import Blueprint, request, jsonify
from models import Department
from extensions import db

department_bp = Blueprint('department', __name__, url_prefix='/department')

@department_bp.route('/get_departments', methods=['GET'])
def get_departments():
    try:
        departments = Department.query.all()
        result = []
        for dept in departments:
            result.append({
                'id': dept.id,
                'name': dept.name
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@department_bp.route('/add_department', methods=['POST'])
def add_department():
    try:
        data = request.json
        name = data.get('departmentName')
        if not name:
            return jsonify({'error': 'Department name is required'}), 400
        # Optional: check duplicate by name
        if Department.query.filter_by(name=name).first():
            return jsonify({'error': 'Department already exists'}), 400
        new_dept = Department(name=name)
        db.session.add(new_dept)
        db.session.commit()
        return jsonify({'message': 'Department added successfully', 'id': new_dept.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@department_bp.route('/edit_department/<int:department_id>', methods=['PUT'])
def edit_department(department_id):
    try:
        data = request.json
        name = data.get('departmentName')
        if not name:
            return jsonify({'error': 'Department name is required'}), 400
        dept = Department.query.get(department_id)
        if not dept:
            return jsonify({'error': 'Department not found'}), 404
        dept.name = name
        db.session.commit()
        return jsonify({'message': 'Department updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@department_bp.route('/delete_department/<int:department_id>', methods=['DELETE'])
def delete_department(department_id):
    try:
        dept = Department.query.get(department_id)
        if not dept:
            return jsonify({'error': 'Department not found'}), 404
        db.session.delete(dept)
        db.session.commit()
        return jsonify({'message': 'Department deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
