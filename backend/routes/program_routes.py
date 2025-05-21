from flask import Blueprint, request, jsonify
from models import Program, Department
from extensions import db

program_bp = Blueprint('program', __name__, url_prefix='/program')

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
                'id': prog.id,
                'programID': prog.id,
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
                'departmentID': dept.id,  # for consistency with frontend if it uses this
                'name': dept.name,
                'departmentName': dept.name  # for consistency with frontend
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
        if not name or department_id is None:
            return jsonify({'error': 'Program name and departmentID are required'}), 400
        dept = Department.query.get(department_id)
        if not dept:
            return jsonify({'error': 'Department not found'}), 404
        if Program.query.filter_by(name=name, department_id=department_id).first():
            return jsonify({'error': 'Program already exists'}), 400
        new_prog = Program(name=name, department_id=department_id)
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

@program_bp.route('/delete_program/<program_id>', methods=['DELETE'])
def delete_program(program_id):  # Changed to accept string ID to match frontend call
    try:
        # Attempt to convert program_id to integer if it's not already (e.g. 'P01' -> error, but 1 -> ok)
        # The frontend seems to send the actual ID (e.g., 1, 2) not the 'P01' format for deletion.
        # If it sends 'P01', this will need adjustment or the frontend needs to send the numeric ID.
        # For now, assuming numeric ID is passed or can be derived.
        # Let's assume the frontend sends the numeric ID as per `programToDelete` state.
        prog_id_int = int(program_id)
        prog = Program.query.get(prog_id_int)
        if not prog:
            return jsonify({'error': 'Program not found'}), 404
        db.session.delete(prog)
        db.session.commit()
        return jsonify({'message': 'Program deleted successfully'}), 200
    except ValueError:  # Handle cases where program_id is not a valid integer
        return jsonify({'error': 'Invalid program ID format'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
