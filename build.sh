#!/bin/bash

# Build script for Render deployment
set -o errexit  # exit on error

echo "Starting build process..."

# Install Python dependencies
pip install -r backend/requirements.txt

echo "Dependencies installed successfully"

# Run database migrations
cd backend
echo "Running database migrations..."

# Initialize migrations if they don't exist
if [ ! -d "migrations/versions" ] || [ -z "$(ls -A migrations/versions)" ]; then
    echo "Initializing database migrations..."
    flask db init
    flask db migrate -m "Initial migration"
fi

# Run migrations
echo "Applying database migrations..."
flask db upgrade

echo "Build completed successfully!"
