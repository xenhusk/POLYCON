# POLYCON - Deployment Guide

A comprehensive consultation and learning management system built with Flask (backend) and React (frontend), deployed on Render.

## 🚀 Live Deployment

- **Frontend**: https://polycon-frontend.onrender.com
- **Backend API**: https://polycon.onrender.com
- **Database**: PostgreSQL on Render

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Local Development Setup](#local-development-setup)
4. [Deployment Instructions](#deployment-instructions)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [Troubleshooting](#troubleshooting)
8. [API Documentation](#api-documentation)

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │   Flask Backend │    │   PostgreSQL    │
│   Static Site   │───▶│   Web Service   │───▶│   Database      │
│   (Render)      │    │   (Render)      │    │   (Render)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

**Frontend:**
- React 18.3.1
- React Router v6.28.0
- Socket.IO Client
- Tailwind CSS
- Axios for API calls

**Backend:**
- Flask with eventlet
- SQLAlchemy with PostgreSQL
- Socket.IO for real-time communication
- JWT authentication
- CORS enabled for cross-origin requests

**Database:**
- PostgreSQL 13+
- SQLAlchemy ORM
- Database migrations with Alembic

## 🔧 Prerequisites

- Node.js 16+ and npm
- Python 3.11+
- PostgreSQL (for local development)
- Git
- Render account

## 🛠️ Local Development Setup

### Backend Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/xenhusk/POLYCON.git
   cd POLYCON/backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up local environment variables:**
   ```bash
   # Create .env file in backend directory
   DATABASE_URL=postgresql://username:password@localhost:5432/polycon_local
   SECRET_KEY=your-secret-key-here
   GEMINI_API_KEY=your-gemini-api-key
   OPENAI_API_KEY=your-openai-api-key
   ASSEMBLYAI_API_KEY=your-assemblyai-api-key
   ```

5. **Initialize database:**
   ```bash
   python setup_database.py
   ```

6. **Run the backend:**
   ```bash
   python app.py
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend/my-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Create .env file in frontend/my-app directory
   REACT_APP_API_URL=http://localhost:5001
   ```

4. **Start development server:**
   ```bash
   npm start
   ```

## 🚀 Deployment Instructions

### 1. Database Deployment (Render PostgreSQL)

1. **Create PostgreSQL database on Render:**
   - Go to Render Dashboard → New → PostgreSQL
   - Database Name: `polycon_database`
   - User: `polycon_user`
   - Region: Choose closest to your users
   - Plan: Choose appropriate plan

2. **Note the connection details:**
   - Internal Database URL (for backend)
   - External Database URL (for database management)

### 2. Backend Deployment (Render Web Service)

1. **Create Web Service on Render:**
   - Repository: `https://github.com/xenhusk/POLYCON`
   - Branch: `postgre`
   - Root Directory: `backend`
   - Runtime: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python app.py`

2. **Configure Environment Variables:**
   ```
   DATABASE_URL=<your-render-postgresql-internal-url>
   SECRET_KEY=<generate-a-secure-secret-key>
   GEMINI_API_KEY=<your-gemini-api-key>
   OPENAI_API_KEY=<your-openai-api-key>
   ASSEMBLYAI_API_KEY=<your-assemblyai-api-key>
   CORS_ALLOWED_ORIGINS=https://polycon-frontend.onrender.com
   ```

3. **Deploy and verify:**
   - Service should be accessible at: `https://polycon.onrender.com`
   - Check health endpoint: `https://polycon.onrender.com/health`

### 3. Frontend Deployment (Render Static Site)

1. **Create Static Site on Render:**
   - Repository: `https://github.com/xenhusk/POLYCON`
   - Branch: `postgre`
   - Root Directory: `frontend/my-app`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`

2. **Configure Environment Variables:**
   ```
   REACT_APP_API_URL=https://polycon.onrender.com
   ```

3. **Set up Client-Side Routing:**
   - Ensure `public/_redirects` file contains:
     ```
     /*    /index.html   200
     ```
   - **Important**: Note the leading slash in `/index.html`

4. **Configure Redirect Rules in Render Dashboard:**
   - Go to your Static Site → Redirects and Rewrites
   - Add rule:
     - Source: `/*`
     - Destination: `/index.html`
     - Action: `Rewrite`

### 4. Database Migration

1. **Export local database (if applicable):**
   ```bash
   pg_dump polycon_local > polycon_dump.sql
   ```

2. **Import to Render PostgreSQL:**
   ```bash
   psql <external-database-url> < polycon_dump.sql
   ```

## ⚙️ Environment Configuration

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `SECRET_KEY` | Flask secret key for sessions | `your-secure-secret-key` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `ASSEMBLYAI_API_KEY` | AssemblyAI API key | `your-key` |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origins | `https://polycon-frontend.onrender.com` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `https://polycon.onrender.com` |

## 🗄️ Database Setup

### Schema Overview

The database includes tables for:
- **users**: User accounts and profiles
- **bookings**: Appointment bookings
- **consultation_sessions**: Session records with transcriptions
- **courses**: Academic courses
- **departments**: Academic departments
- **programs**: Academic programs
- **semesters**: Academic terms

### Key Database Features

- **Authentication**: JWT-based user authentication
- **File Storage**: Profile pictures and audio files
- **Real-time Data**: Session transcriptions and summaries
- **Academic Management**: Courses, programs, and enrollments

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. **404 Errors on Direct URL Access**
```
Problem: Pages show "Not Found" when accessing URLs directly
Solution: Ensure _redirects file has correct format: /*    /index.html   200
```

#### 2. **CORS Errors**
```
Problem: Frontend can't connect to backend
Solution: Check CORS_ALLOWED_ORIGINS environment variable in backend
```

#### 3. **Profile Pictures Not Loading**
```
Problem: Images return 404 errors
Solution: Verify REACT_APP_API_URL points to backend, not frontend
```

#### 4. **Database Connection Errors**
```
Problem: Backend can't connect to database
Solution: Verify DATABASE_URL format and NullPool configuration
```

#### 5. **Build Failures**
```
Problem: Deployment fails during build
Solution: Check package.json scripts and dependency versions
```

### Debugging Steps

1. **Check service logs** in Render dashboard
2. **Verify environment variables** are set correctly
3. **Test API endpoints** directly
4. **Check browser console** for frontend errors
5. **Verify database connectivity** with external tools

## 📚 API Documentation

### Base URL
```
Production: https://polycon.onrender.com
Development: http://localhost:5001
```

### Key Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout

#### Users
- `GET /user/get_user?idNumber={id}` - Get user by ID number
- `PUT /user/profile` - Update user profile
- `POST /user/upload_profile_picture` - Upload profile picture

#### Bookings
- `GET /booking/student_bookings` - Get student bookings
- `POST /booking/create_booking` - Create new booking
- `PUT /booking/confirm_booking` - Confirm booking
- `DELETE /booking/cancel_booking` - Cancel booking

#### Consultations
- `GET /consultation/get_session?sessionID={id}` - Get session details
- `POST /consultation/create_session` - Create consultation session
- `GET /consultation/get_final_document?sessionID={id}` - Get session document

#### Static Files
- `GET /uploads/{filename}` - Serve uploaded files (profile pictures, audio)

### Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

## 🚨 Security Considerations

1. **Environment Variables**: Never commit API keys or secrets
2. **CORS Configuration**: Restrict to specific frontend domains
3. **Database Security**: Use connection pooling and prepared statements
4. **File Uploads**: Validate file types and sizes
5. **Authentication**: Implement proper JWT token validation

## 📈 Performance Optimization

1. **Database**: Use connection pooling (NullPool for eventlet)
2. **Frontend**: Implement code splitting and lazy loading
3. **Static Assets**: Optimize images and use CDN
4. **API**: Implement caching for frequently accessed data
5. **Monitoring**: Set up logging and error tracking

## 🔄 Continuous Deployment

The project is configured for automatic deployment:
- **Trigger**: Push to `postgre` branch
- **Frontend**: Rebuilds automatically on code changes
- **Backend**: Restarts automatically on code changes
- **Database**: Requires manual migration for schema changes

## 📞 Support

For deployment issues or questions:
1. Check the troubleshooting section above
2. Review Render service logs
3. Verify environment configuration
4. Test API endpoints independently

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Deployment Platform**: Render  
**Repository**: https://github.com/xenhusk/POLYCON
