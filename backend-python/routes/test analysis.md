curl -X POST -H "Content-Type: application/json" -d @C:\\Users\\xenhu\\OneDrive\\Documents\\GitHub\\POLYCON\\backend-python\\routes\\consultations_date.json http://localhost:5001/consultation/store_consultation

curl -X GET http://localhost:5001/consultation/get_session?sessionID=sessionID00067

curl -X POST -H "Content-Type: application/json" \
  -d '{
    "grades": {"prelim": 75, "finals": 85},
    "consultation_quality_score": 0.0036050246103030304,
    "academic_events": [
      {"event_name": "Case Study Assignment", "student_weight": 0.8},
      {"event_name": "Class Participation", "student_weight": 0.7}
    ]
  }' http://localhost:5001/consultation/consultation_progress_analysis

  