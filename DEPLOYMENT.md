# Deployment Instructions for POLYCON on Render

## Prerequisites
1. GitHub repository pushed to GitHub
2. Render account created

## Step-by-Step Deployment

### 1. Create PostgreSQL Database
1. Go to Render Dashboard → New → PostgreSQL
2. Configure:
   - Name: `polycon-db`
   - Database: `polycon`
   - User: `polycon_user`
   - Plan: Free
3. Save the connection details

### 2. Deploy Backend API
1. Go to Render Dashboard → New → Web Service
2. Connect your GitHub repository
3. Configure:
   - Name: `polycon-backend`
   - Root Directory: `backend`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn -k eventlet --worker-connections 1000 -b 0.0.0.0:$PORT app:app`

4. Add Environment Variables:
   - `DATABASE_URL`: (Copy from your PostgreSQL database - Internal Connection String)
   - `SECRET_KEY`: (Generate a secure random string)
   - `JWT_SECRET_KEY`: (Generate a secure random string)
   - `CORS_ALLOWED_ORIGINS`: `https://polycon-frontend.onrender.com` (replace with your frontend URL)
   - `FLASK_ENV`: `production`
   - `PYTHON_VERSION`: `3.12.0`
   
   **Optional (for additional features):**
   - `GEMINI_API_KEY`: (Google Gemini AI API key)
   - `SMTP_SERVER`: `smtp.gmail.com` (for email service)
   - `SMTP_PORT`: `587`
   - `SMTP_USER`: (your email address)
   - `SMTP_PASSWORD`: (your email app password)
   - `FROM_EMAIL`: (sender email address)
   - `GOOGLE_APPLICATION_CREDENTIALS`: (path to Google Cloud credentials)
   - `GCP_BUCKET_NAME`: (Google Cloud Storage bucket name)
   - `ASSEMBLYAI_API_KEY`: (AssemblyAI API key for speech-to-text)

### 3. Deploy Frontend
1. Go to Render Dashboard → New → Static Site
2. Connect your GitHub repository
3. Configure:
   - Name: `polycon-frontend`
   - Root Directory: `frontend/my-app`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`

4. Add Environment Variables:
   - `REACT_APP_API_URL`: (Your backend URL, e.g., `https://polycon-backend.onrender.com`)

### 4. Database Setup
After backend deployment:
1. Go to your backend service logs
2. Check if migrations ran successfully
3. If needed, manually run migrations via Render shell

## Important Notes
- Free tier services sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- Consider upgrading to paid plans for production use

## Troubleshooting
1. Check service logs in Render dashboard
2. Verify environment variables are set correctly
3. Ensure database connection string is correct
4. Check CORS settings if frontend can't reach backend
