# POLYCON Analysis: A Student Academic Improvement Assessment System

## Abstract

POLYCON Analysis is a web-based educational application designed to assess student academic improvement by analyzing grade progression, consultation session effectiveness, and academic event participation. The system focuses on measuring improvement trends rather than predicting future performance, using basic computational algorithms to calculate improvement scores and identify factors that contribute to student academic growth.

## Table of Contents

1. [System Overview](#system-overview)
2. [What the System Actually Does](#what-the-system-actually-does)
3. [Computer Science Concepts Applied](#computer-science-concepts-applied)
4. [Grade Improvement Calculation](#grade-improvement-calculation)
5. [Consultation Quality Assessment](#consultation-quality-assessment)
6. [System Architecture](#system-architecture)
7. [Data Processing](#data-processing)
8. [Statistical Calculations](#statistical-calculations)
9. [Citations and References](#citations-and-references)

## System Overview

POLYCON Analysis is an educational technology application that measures student improvement rather than predicting academic success. The system combines:

- **Grade Progression Analysis**: Mathematical calculation of improvement from initial to final grades
- **Consultation Effectiveness Measurement**: Using third-party sentiment analysis to assess consultation quality
- **Factor Contribution Analysis**: Determining how much different factors (grades, consultations, events) contribute to overall improvement
- **Improvement Visualization**: Presenting improvement data through web-based charts and reports

**Important Note**: This system does not use machine learning to predict future performance, nor does it employ complex data mining algorithms to discover hidden patterns. It focuses on analyzing existing data to measure improvement that has already occurred.

## What the System Actually Does

### 1. Grade Improvement Measurement

The system calculates how much a student's grades have improved from their initial assessment (Prelim) to their final assessment (Final), with adjustments for different starting points:

```python
def calculate_grade_improvement(prelim, midterm, prefinal, final):
    # Basic improvement calculation
    raw_improvement = final - prelim
    
    # Adjustment factor based on starting grade
    # Students who start with high grades get credit for maintaining excellence
    if prelim >= 90:
        baseline_factor = 1.3  # Harder to improve when you're already excellent
    elif prelim >= 80:
        baseline_factor = 1.1  # Good starting point
    elif prelim <= 70:
        baseline_factor = 0.9  # More room for improvement
    else:
        baseline_factor = 1.0  # Average case
    
    # Check if grades show consistent upward trend
    trend_consistency = calculate_trend_consistency([prelim, midterm, prefinal, final])
    
    # Normalize to 0-1 scale (assuming max possible improvement is 30 points)
    normalized_improvement = (raw_improvement / 30) * baseline_factor * trend_consistency
    
    return min(1.0, max(0.0, normalized_improvement))
```

### 2. Consultation Quality Scoring

The system uses AssemblyAI's sentiment analysis API to analyze consultation audio transcriptions:

```python
def assess_consultation_quality(sentiment_data, duration_minutes):
    # Count sentiment types from the API response
    positive_segments = len([s for s in sentiment_data if s.sentiment == "POSITIVE"])
    total_segments = len(sentiment_data)
    
    # Calculate positivity ratio
    positivity_ratio = positive_segments / total_segments if total_segments > 0 else 0
    
    # Duration factor - consultations should be meaningful but not too long
    if duration_minutes < 10:
        duration_factor = 0.5  # Too short to be effective
    elif duration_minutes > 45:
        duration_factor = 0.8  # Might be too long
    else:
        duration_factor = 1.0  # Good duration
    
    return positivity_ratio * duration_factor
```

### 3. Overall Improvement Index

The system combines different factors to create an overall improvement score:

```python
def calculate_overall_improvement(grade_improvement, consultation_quality, event_participation):
    # Weights are adjustable based on available data
    w_grades = 0.5      # Grade improvement is most important
    w_consultation = 0.3  # Consultation quality is secondary
    w_events = 0.2       # Academic events have some impact
    
    # If some data is missing, adjust weights
    if consultation_quality is None:
        w_grades = 0.7
        w_events = 0.3
        w_consultation = 0
    
    overall_score = (w_grades * grade_improvement + 
                    w_consultation * consultation_quality + 
                    w_events * event_participation)
    
    return overall_score
```

## Computer Science Concepts Applied

### 1. Basic Algorithms and Data Structures

**Data Structures Used**:

- **Lists/Arrays**: Storing grade sequences `[prelim, midterm, prefinal, final]`
- **Dictionaries/Hash Maps**: Fast lookup of student records by ID number
- **JSON Objects**: Storing consultation metadata and sentiment analysis results

**Algorithms Applied**:

- **Linear calculations**: Basic arithmetic for grade differences and percentages
- **Weighted averages**: Combining multiple factors with different importance levels
- **Conditional logic**: Different processing based on starting grade levels
- **Data filtering**: Finding records that match specific criteria (student, semester, etc.)

### 2. Database Operations

**SQL Query Processing**:

```sql
-- Finding grades for a specific student, teacher, and semester
SELECT g.grade, g.period, c.name as course_name
FROM grades g
JOIN courses c ON g.course_id = c.id
WHERE g.student_user_id = ? 
  AND g.faculty_user_id = ?
  AND g.school_year = ?
  AND g.semester = ?
ORDER BY 
  CASE g.period 
    WHEN 'Prelim' THEN 1
    WHEN 'Midterm' THEN 2
    WHEN 'Pre-Final' THEN 3
    WHEN 'Final' THEN 4
  END
```

**Database Design Concepts**:

- **Relational modeling**: Foreign key relationships between users, students, grades, and consultations
- **Data normalization**: Separating user information, academic records, and consultation data
- **Indexing**: Using indexed columns for faster lookup operations

### 3. API Integration

**Third-Party Service Integration**:

- **AssemblyAI API**: Converting audio files to text with sentiment analysis
- **RESTful API design**: Creating endpoints that follow REST principles
- **JSON data processing**: Handling API responses and database storage

## Grade Improvement Calculation

### Mathematical Foundation

The grade improvement calculation is based on educational assessment principles that recognize different improvement contexts:

1. **Raw Improvement**: `final_grade - initial_grade`
2. **Baseline Adjustment**: Recognition that improvement is harder when starting from high grades
3. **Consistency Factor**: Reward for steady improvement rather than volatile performance
4. **Normalization**: Converting to a 0-1 scale for comparison across different courses

### Algorithm Complexity

- **Time Complexity**: O(n) where n is the number of grade periods (typically 4)
- **Space Complexity**: O(1) for individual calculations, O(m) for storing m student records

## Consultation Quality Assessment

### Sentiment Analysis Processing

The system relies on AssemblyAI's machine learning models for sentiment analysis but implements its own scoring logic:

1. **Audio Processing**: AssemblyAI converts consultation recordings to text
2. **Sentiment Classification**: AssemblyAI provides positive/negative/neutral classification for each segment
3. **Quality Scoring**: POLYCON's algorithm calculates consultation effectiveness based on sentiment distribution
4. **Duration Adjustment**: Scoring adjustment based on consultation length

### What This Measures

- **Communication Quality**: How positive or negative the consultation conversation was
- **Engagement Level**: Inferred from consultation duration and sentiment patterns
- **Session Effectiveness**: Combined score indicating how productive the consultation likely was

## System Architecture

### Backend (Python Flask)

**Framework Structure**:

```python
# Flask application with Blueprint organization
app = Flask(__name__)
app.register_blueprint(polycon_analysis_bp, url_prefix='/polycon-analysis')

# Database models using SQLAlchemy ORM
class ConsultationSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quality_score = db.Column(db.Float, nullable=True)
    raw_sentiment_analysis = db.Column(db.JSON, nullable=True)
    # ... other fields
```

**API Endpoints**:

- `GET /polycon-analysis/get_teacher_students`: Lists students for a teacher
- `GET /polycon-analysis/get_grades_by_period`: Retrieves grade data for analysis
- `GET /polycon-analysis/get_consultation_history`: Gets consultation records

### Frontend (React.js)

**Component Architecture**:

```javascript
// Main analysis component
function ComparativeAnalysis() {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [gradeData, setGradeData] = useState([]);
    const [improvementScore, setImprovementScore] = useState(null);
    
    // API calls to backend
    const fetchStudentData = async () => {
        const response = await fetch(`/polycon-analysis/get_grades_by_period?...`);
        const data = await response.json();
        setGradeData(data);
    };
    
    return (
        // JSX for rendering improvement analysis
    );
}
```

## Data Processing

### ETL Process (Extract, Transform, Load)

1. **Extract**:
   - Grade records from PostgreSQL database
   - Consultation audio files from file storage
   - Academic event data from application forms

2. **Transform**:
   - Convert grades to improvement scores
   - Process sentiment analysis results into quality scores
   - Normalize different data types to comparable scales

3. **Load**:
   - Store calculated improvement scores
   - Cache frequently accessed data
   - Generate reports for display

### Data Flow

```
Grade Data → Improvement Calculation → Weighted Scoring
     ↓
Audio Files → AssemblyAI API → Sentiment Analysis → Quality Score
     ↓
Event Data → Participation Scoring → Factor Weighting
     ↓
Combined Analysis → Improvement Report → Web Display
```

## Statistical Calculations

### Descriptive Statistics

The system uses basic statistical measures:

- **Mean**: Average improvement across multiple courses
- **Percentage Change**: Grade improvement as percentage of starting grade
- **Weighted Average**: Combining different factors with assigned weights

### No Predictive Modeling

**Important Clarification**: This system does NOT:

- Train machine learning models to predict future performance
- Use regression analysis to forecast academic outcomes
- Employ clustering algorithms to group similar students
- Implement recommendation systems based on collaborative filtering

Instead, it focuses on **descriptive analysis** of improvement that has already occurred.

## Citations and References

[1] Bloom, B. S. (1984). The 2 Sigma Problem: The Search for Methods of Group Instruction as Effective as One-to-One Tutoring. *Educational Researcher*, 13(6), 4-16.

[2] Hattie, J. (2008). *Visible Learning: A Synthesis of Over 800 Meta-Analyses Relating to Achievement*. Routledge.

[3] Pang, B., & Lee, L. (2008). Opinion Mining and Sentiment Analysis. *Foundations and Trends in Information Retrieval*, 2(1-2), 1-135.

[4] Fielding, R. T. (2000). *Architectural Styles and the Design of Network-based Software Architectures*. Doctoral dissertation, University of California, Irvine.

[5] Silberschatz, A., Galvin, P. B., & Gagne, G. (2018). *Operating System Concepts*. John Wiley & Sons.

[6] Elmasri, R., & Navathe, S. (2015). *Fundamentals of Database Systems*. Pearson.

[7] Flanagan, D. (2020). *JavaScript: The Definitive Guide*. O'Reilly Media.

[8] Banks, A., & Porcello, E. (2020). *Learning React: Modern Patterns for Developing React Apps*. O'Reilly Media.

## Conclusion

POLYCON Analysis represents a practical application of fundamental computer science concepts to educational assessment. Rather than employing complex machine learning or data mining techniques, the system focuses on transparent, understandable calculations that measure student improvement across multiple factors.

The system's strength lies in its simplicity and clarity - educators can understand how improvement scores are calculated and trust the results. By combining grade progression analysis with consultation quality assessment, POLYCON Analysis provides valuable insights into factors that contribute to student academic growth.

This approach demonstrates that effective educational technology doesn't always require advanced AI or machine learning - sometimes, well-designed algorithms using fundamental computer science principles can provide meaningful insights into the learning process.
