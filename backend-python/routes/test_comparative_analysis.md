# Test Commands for Comparative Analysis Routes

## 1. Create a new comparative analysis

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "student_id": "20-0062-747",
    "grades": {
      "prelim": 75,
      "midterm": 78,
      "prefinals": 82,
      "finals": 88
    },
    "academic_events": [
      {"event_name": "Case Study Presentation", "impact": 0.8},
      {"event_name": "Group Project", "impact": 0.7},
      {"event_name": "Consultation Session Participation", "impact": 0.9}
    ],
    "course_id": "CS101",
    "consultation_id": "sessionID00067",
    "consultation_quality_score": 0.8
  }' \
  http://localhost:5001/comparative/compare_student
```

## 2. Get all analyses for a student

```bash
curl -X GET http://localhost:5001/comparative/get_student_analyses/20-0062-747
```

## 3. Get a specific analysis by ID
(Replace analysis_123abc with the actual analysis_id returned from the first request)

```bash
curl -X GET http://localhost:5001/comparative/get_analysis/analysis_123abc
```

## Windows-friendly versions (cmd.exe)

```bash
curl -X POST -H "Content-Type: application/json" -d "{\"student_id\":\"20-0062-747\",\"grades\":{\"prelim\":75,\"midterm\":78,\"prefinals\":82,\"finals\":88},\"academic_events\":[{\"event_name\":\"Case Study Presentation\",\"impact\":0.8},{\"event_name\":\"Group Project\",\"impact\":0.7},{\"event_name\":\"Consultation Session Participation\",\"impact\":0.9}],\"course_id\":\"CS101\",\"consultation_id\":\"sessionID00067\",\"consultation_quality_score\":0.8}" http://localhost:5001/comparative/compare_student
```

```bash
curl -X GET http://localhost:5001/comparative/get_student_analyses/20-0062-747
```

```bash
curl -X GET http://localhost:5001/comparative/get_analysis/analysis_123abc
```
