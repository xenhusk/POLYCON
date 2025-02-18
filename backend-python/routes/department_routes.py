from flask import Blueprint, request, jsonify
from services.firebase_service import db
from google.cloud.firestore import SERVER_TIMESTAMP

department_bp = Blueprint('department', __name__)

@department_bp.route('/get_departments', methods=['GET'])
def get_departments():
    try:
        departments_ref = db.collection('departments').stream()
        departments = []
        for doc in departments_ref:
            department_data = doc.to_dict()
            print("Department Data:", department_data)  # Debug log
            departments.append({
                'id': doc.id,
                'name': department_data.get('departmentName', '')  # Ensure we're getting the departmentName field
            })
        
        return jsonify(departments), 200
    except Exception as e:
        print(f"Error fetching departments: {e}")
        return jsonify({"error": str(e)}), 500

@department_bp.route('/add_department', methods=['POST'])
def add_department():
    try:
        data = request.json
        department_name = data.get('departmentName')

        if not department_name:
            return jsonify({"error": "Department name is required"}), 400

        # Fetch the last added department document to determine the next incremental ID
        departments_ref = db.collection('departments').order_by("departmentID", direction="DESCENDING").limit(1).stream()
        last_department = next(departments_ref, None)

        if last_department:
            last_id = last_department.to_dict().get('departmentID', 'D00')
            if last_id.startswith("D"):
                last_number = int(last_id[1:])
                new_id = f"D{last_number + 1:02d}"  # Format as D01, D02, etc.
            else:
                new_id = "D01"
        else:
            new_id = "D01"

        # Explicitly set the new document ID
        department_ref = db.collection('departments').document(new_id)
        department_ref.set({
            "departmentID": new_id,  # Store the document ID as a field
            "departmentName": department_name,
        })

        return jsonify({"message": "Department added successfully", "id": department_ref.id}), 201
    except Exception as e:
        print(f"Error adding department: {e}")
        return jsonify({"error": str(e)}), 500

@department_bp.route('/edit_department/<department_id>', methods=['PUT'])
def edit_department(department_id):
    try:
        data = request.json
        department_name = data.get('departmentName')

        if not department_name:
            return jsonify({"error": "Department name is required"}), 400

        department_ref = db.collection('departments').document(department_id)
        if not department_ref.get().exists:
            return jsonify({"error": "Department not found"}), 404

        department_ref.update({
            "departmentName": department_name,
            "updated_at": SERVER_TIMESTAMP
        })

        return jsonify({"message": "Department updated successfully"}), 200
    except Exception as e:
        print(f"Error editing department: {e}")
        return jsonify({"error": str(e)}), 500

@department_bp.route('/delete_department/<department_id>', methods=['DELETE'])
def delete_department(department_id):
    try:
        department_ref = db.collection('departments').document(department_id)
        if not department_ref.get().exists:
            return jsonify({"error": "Department not found"}), 404

        department_ref.delete()

        return jsonify({"message": "Department deleted successfully"}), 200
    except Exception as e:
        print(f"Error deleting department: {e}")
        return jsonify({"error": str(e)}), 500