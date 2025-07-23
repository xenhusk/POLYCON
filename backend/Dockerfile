# Use official Python image
FROM python:3.12-slim

# Install ffmpeg for audio conversion
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Run the application with eventlet worker for WebSockets support
CMD ["gunicorn", "-k", "eventlet", "--worker-connections", "1000", "-b", "0.0.0.0:5000", "app:app"]
