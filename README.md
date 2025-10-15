# POLYCON

## Overview
POLYCON is a comprehensive educational consultation and learning management system designed to facilitate student-teacher consultations, track academic performance, and analyze the effectiveness of consultation sessions on student outcomes. The system provides a complete platform for managing academic consultations, booking sessions, tracking grades, and generating detailed analytics reports.

## Features
- **Consultation Management**: Book, schedule, and manage student-teacher consultation sessions
- **Real-time Communication**: WebSocket-based real-time notifications and updates
- **Academic Performance Tracking**: Comprehensive grade management across multiple academic periods
- **POLYCON Analysis**: Advanced analytics to measure consultation effectiveness on student performance
- **User Management**: Role-based access control for students, teachers, and administrators
- **Venue & Schedule Management**: Manage consultation venues and teacher availability
- **Audio Recording & Transcription**: Record consultation sessions with automatic transcription
- **Sentiment Analysis**: AI-powered analysis of consultation quality and outcomes
- **Report Generation**: Generate detailed PDF reports for academic analysis
- **Database Management**: Comprehensive database tools for backup, sync, and maintenance

## Prerequisites
- **Python 3.11+** - Backend Flask application
- **Node.js 16+** - Frontend React application
- **PostgreSQL 13+** - Primary database
- **Git** - Version control
- **Render Account** (for deployment) - Cloud hosting platform

## Installation

### Backend Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/POLYCON.git
   cd POLYCON
   ```

2. Install Python dependencies:
   ```sh
   cd backend
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   - Copy `database_config.env` to `.env` and update the database credentials
   - Configure other environment variables as needed

4. Set up the database:
   ```sh
   # Run database migrations
   python -m flask db upgrade
   
   # Or use the database manager for setup
   python db_manager.py test
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```sh
   cd frontend/my-app
   ```

2. Install Node.js dependencies:
   ```sh
   npm install
   ```

## Usage

### Development Mode
1. Start the backend server:
   ```sh
   cd backend
   python app.py
   ```
   The backend will run on `http://localhost:5001`

2. Start the frontend development server:
   ```sh
   cd frontend/my-app
   npm start
   ```
   The frontend will run on `http://localhost:3000`

### Production Deployment
The system is deployed on Render with the following URLs:
- **Frontend**: https://polycon-frontend.onrender.com
- **Backend API**: https://polycon.onrender.com

### Database Management
Use the built-in database manager for maintenance:
```sh
# Test database connections
python db_manager.py test

# Create backups
python db_manager.py backup --target production

# Sync databases
python db_manager.py sync --source production --target local
```

## Project Structure
```
POLYCON/
├── backend/                    # Flask backend application
│   ├── app.py                 # Main Flask application
│   ├── models.py              # Database models
│   ├── config.py              # Configuration settings
│   ├── requirements.txt       # Python dependencies
│   ├── routes/                # API route handlers
│   ├── services/              # Business logic services
│   ├── migrations/            # Database migrations
│   └── uploads/               # File uploads storage
├── frontend/my-app/           # React frontend application
│   ├── src/                   # React source code
│   ├── public/                # Static assets
│   └── package.json           # Node.js dependencies
├── database/                  # Database files and backups
│   ├── backups/               # Database backup files
│   └── exports/               # Data export files
├── scripts/                   # Utility scripts
├── db_manager.py              # Database management tool
├── docker-compose.yml         # Docker configuration
├── render.yaml                # Render deployment config
└── README.md                  # Project documentation
```

## Technology Stack

### Backend
- **Flask** - Web framework with eventlet for async support
- **SQLAlchemy** - ORM for database operations
- **PostgreSQL** - Primary database
- **Flask-SocketIO** - Real-time communication
- **JWT** - Authentication and authorization
- **APScheduler** - Task scheduling for reminders
- **Google Generative AI** - AI-powered analysis
- **AssemblyAI** - Audio transcription services

### Frontend
- **React 18.3.1** - UI framework
- **React Router** - Client-side routing
- **Socket.IO Client** - Real-time communication
- **Chart.js** - Data visualization
- **Tailwind CSS** - Styling framework
- **Framer Motion** - Animations
- **React Big Calendar** - Calendar component

### Deployment
- **Render** - Cloud hosting platform
- **Docker** - Containerization
- **PostgreSQL on Render** - Managed database

## Key Features in Detail

### Consultation Management
- Book consultation sessions with teachers
- Manage venue availability and scheduling
- Track consultation history and outcomes
- Audio recording and transcription capabilities

### Academic Analytics
- **POLYCON Analysis**: Measure consultation effectiveness on student performance
- Grade tracking across multiple academic periods (Prelim, Midterm, Pre-Final, Final)
- Statistical analysis of improvement trends
- Comprehensive reporting with PDF generation

### Real-time Features
- WebSocket-based notifications
- Live updates for booking status changes
- Real-time chat and communication
- Instant feedback on consultation quality

### User Management
- Role-based access control (Students, Teachers, Administrators)
- User authentication with JWT tokens
- Profile management with image uploads
- Department and program management

## Documentation

### Additional Guides
- [Database Manager Guide](DATABASE_MANAGER_GUIDE.md) - Comprehensive database management
- [Deployment Guide](DEPLOYMENT_README.md) - Production deployment instructions
- [POLYCON Analysis Documentation](POLYCON_ANALYSIS_DOCUMENTATION.md) - Analytics system details
- [Email Setup Guide](EMAIL_SETUP_GUIDE.md) - Email configuration
- [Enhanced Notifications Guide](ENHANCED_NOTIFICATIONS_README.md) - Notification system

### API Documentation
The backend provides RESTful APIs for:
- Authentication and user management
- Consultation booking and management
- Grade tracking and analytics
- Real-time notifications via WebSocket
- File upload and management

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

## License
This project is licensed under the MIT License.

## Support
For questions, issues, or support:
- Create an issue in the GitHub repository
- Check the documentation guides in the project
- Review the deployment and database management guides

## Acknowledgments
- Built for educational institutions to improve student-teacher consultation processes
- Integrates modern web technologies for real-time collaboration
- Designed with scalability and maintainability in mind
