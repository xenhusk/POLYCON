from flask import Blueprint, request, jsonify
from models import Program, Department
from extensions import db

program_bp = Blueprint('program', __name__, url_prefix='/program')

def get_next_available_id():
    # Get all existing integer IDs, find the lowest missing one
    ids = sorted([prog.id for prog in Program.query.order_by(Program.id).all()])
    next_id = 1
    for i in ids:
        if i == next_id:
            next_id += 1
        else:
            break
    return next_id

@program_bp.route('/get_programs', methods=['GET'])
def get_programs():
    try:
        dept_id = request.args.get('departmentID', type=int)
        query = Program.query
        if dept_id is not None:
            query = query.filter_by(department_id=dept_id)
        programs = query.all()
        result = []
        for prog in programs:
            dept = Department.query.get(prog.department_id)
            dept_name = dept.name if dept else ''
            result.append({
                'id': prog.id,  # integer PK
                'programName': prog.name,
                'departmentID': prog.department_id,
                'departmentName': dept_name
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@program_bp.route('/get_departments', methods=['GET'])
def get_departments():
    try:
        departments = Department.query.all()
        result = [
            {
                'id': dept.id,
                'name': dept.name
            }
            for dept in departments
        ]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@program_bp.route('/add_program', methods=['POST'])
def add_program():
    try:
        data = request.json
        name = data.get('programName')
        department_id = data.get('departmentID')
        if not name or not department_id:
            return jsonify({'error': 'Program name and departmentID are required'}), 400
        dept = Department.query.get(department_id)
        if not dept:
            return jsonify({'error': 'Department not found'}), 404
        if Program.query.filter_by(name=name, department_id=department_id).first():
            return jsonify({'error': 'Program already exists'}), 400
        # Assign the lowest available integer ID
        new_id = get_next_available_id()
        new_prog = Program(id=new_id, name=name, department_id=department_id)
        db.session.add(new_prog)
        db.session.commit()
        return jsonify({'message': 'Program added successfully', 'id': new_prog.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@program_bp.route('/update_program/<int:program_id>', methods=['PUT'])
def update_program(program_id):
    try:
        data = request.json
        prog = Program.query.get(program_id)
        if not prog:
            return jsonify({'error': 'Program not found'}), 404
        if 'programName' in data:
            prog.name = data['programName']
        if 'departmentID' in data:
            dept = Department.query.get(data['departmentID'])
            if not dept:
                return jsonify({'error': 'Department not found'}), 404
            prog.department_id = dept.id
        db.session.commit()
        return jsonify({'message': 'Program updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@program_bp.route('/delete_program/<int:program_id>', methods=['DELETE'])
def delete_program(program_id):
    try:
        prog = Program.query.get(program_id)
        if not prog:
            return jsonify({'error': 'Program not found'}), 404
        db.session.delete(prog)
        db.session.commit()
        return jsonify({'message': 'Program deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
