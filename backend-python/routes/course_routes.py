from flask import Blueprint, request, jsonify
from services.firebase_service import db

course_bp = Blueprint('course', __name__)

@course_bp.route('/get_courses', methods=['GET'])
def get_courses():
    try:
        courses_ref = db.collection('courses').stream()
        courses = []
        for doc in courses_ref:
            course_data = doc.to_dict()
            course_data['courseID'] = doc.id
            courses.append(course_data)
        return jsonify(courses), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@course_bp.route('/add_course', methods=['POST'])
def add_course():
    try:
        data = request.json
        course_id = data.get('courseID')
        course_name = data.get('courseName')
        credits = data.get('credits')
        
        if not course_id or not course_name or not credits:
            return jsonify({"error": "Missing required fields"}), 400
        
        course_ref = db.collection('courses').document(course_id)
        course_ref.set({
            "courseID": course_id,
            "courseName": course_name,
            "credits": credits
        })
        return jsonify({"message": "Course added successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500