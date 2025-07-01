# ⚠️ Note  
**POLYCON is under active development (85–95% complete).** The system is already functional and nearing final release.

# POLYCON  
**A Cross-Platform Consultation System with Comparative Analysis and AI-Driven Minutes Recorder**

## 📘 Project Description
POLYCON is a comprehensive system designed to enhance faculty-student consultations by addressing common challenges such as scheduling conflicts and inconsistent documentation. Leveraging AI-powered transcription, comparative analytics, and an automated scheduling system, POLYCON streamlines the consultation process and delivers actionable, data-driven insights for both faculty and students.

## 🧾 Abstract
Faculty-student consultations are essential for academic success, yet traditional methods face challenges such as scheduling conflicts and inconsistent documentation. This study introduces POLYCON, a cross-platform consultation system integrating AI-driven transcription and comparative analytics to enhance efficiency and accessibility. The system streamlines scheduling, ensures seamless faculty availability management, and provides accurate documentation and insights through comparative analytics. Developed using Agile methodology, the system utilizes PostgreSQL, React.js, and Flask. Testing shows improved consultation efficiency, reduced administrative workload, and enhanced user satisfaction.

## ✨ Features and Expected Outputs

| Feature                               | Expected Output / Benefit             |
|--------------------------------------|----------------------------------------|
| Comparative Analysis                 | Performance Metrics and Graphs         |
| AI Summarization & Minutes Recording | Transcribed Minutes                    |
| Scheduling Feature                   | Appointment List                       |
| Group Consultation Feature           | Collaborative Consultation             |
| Post-Consultation Review             | Updated Consultation Record            |
| Automated Reminders                  | Push and Pop-up Notifications          |
| Two-Way Consultation Booking         | Appointment Scheduling                 |

## 🛠️ Technologies Used
- **PostgreSQL** – Database management  
- **React.js** – Frontend user interface  
- **Flask** – Backend API and business logic  
- **Google Cloud Storage** – File and audio storage  
- **Agile Software Development Methodology** – Iterative and incremental development
- 
## 🗄️ Database Setup (PostgreSQL)
PostgreSQL Installation
Before proceeding, ensure that PostgreSQL is properly installed and running on your system.
If it's not yet installed, refer to the official documentation:
👉 https://www.postgresql.org/download/

Importing the Latest Database Dump
1. Navigate to the project directory:
```sh
cd /path/to/POLYCON
```
3. Run the database import script:
```sh
python setup_database.py
```
Exporting the Database
1. Export using the provided script:
```sh
python setup_database.py export
```

## 🚀 Installation Guide
1. Clone the Repository
```sh
git clone https://github.com/xenhusk/POLYCON.git
cd POLYCON
```
3. Backend Setup
```sh
cd backend
```
```sh
pip install -r requirements.txt
```
cp .env.example .env  # Edit this file with PostgreSQL credentials and API keys
```sh
python setup_database.py
```
5. Frontend Setup
```sh
cd ../frontend/my-app
npm install
```
7. Run the Application Locally
# Backend
```sh
cd ../../backend
python app.py
```
# Frontend
```sh
cd ../frontend/my-app
npm start
```

## 📎 Usage Instructions

### ➤ Scheduling a Consultation  
Log in and use the scheduling feature to book a new appointment. Select available time slots and participants (faculty or group).

### ➤ AI-Powered Transcription  
During or after a consultation, upload or record audio. The system automatically transcribes the session and generates a summary/minutes using AI.

### ➤ Accessing Analytics and Summaries  
After consultations, users can view comparative analysis, performance metrics, and download or review AI-generated minutes and summaries from their dashboard.


👥 Contributors

David Paul Desuyo - Project Manager

Kurt Zhynkent Canja - System Analyst

Clark Jim Gabiota - Programmer

Kyrell Santillan - System Designer

📄 For more technical information, refer to the DATABASE_README.md and in-code documentation.
