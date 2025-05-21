from flask import Blueprint, request, jsonify
from models import Department, Program

# Blueprint for data lookup endpoints
data_bp = Blueprint('data', __name__, url_prefix='/data')

@data_bp.route('/departments', methods=['GET'])
def get_departments():
    try:
        departments = Department.query.all()
        result = [{
            'departmentID': dept.id,
            'departmentName': dept.name
        } for dept in departments]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@data_bp.route('/programs', methods=['GET'])
def get_programs():
    try:
        dept_id = request.args.get('departmentID', type=int)
        query = Program.query
        if dept_id is not None:
            query = query.filter_by(department_id=dept_id)
        programs = query.all()
        result = []
        for prog in programs:
            result.append({
                'programID': prog.id,
                'programName': prog.name,
                'departmentID': prog.department_id
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
