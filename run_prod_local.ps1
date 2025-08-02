# Production simulation script for Windows PowerShell
# Mimics the production environment using gunicorn with eventlet workers

Write-Host "🚀 Starting production simulation locally..." -ForegroundColor Green
Write-Host "📝 Environment: production" -ForegroundColor Yellow
Write-Host "🔧 Server: gunicorn with eventlet workers" -ForegroundColor Yellow
Write-Host "🌐 Port: 5001" -ForegroundColor Yellow
Write-Host "💾 Using local database" -ForegroundColor Yellow
Write-Host ("-" * 50) -ForegroundColor Gray

# Set production-like environment variables
$env:FLASK_ENV = "production"
$env:PORT = "5001"

# Navigate to backend directory
Set-Location backend

# Check if gunicorn is installed
try {
    $null = Get-Command gunicorn -ErrorAction Stop
    Write-Host "✅ gunicorn found" -ForegroundColor Green
} catch {
    Write-Host "❌ gunicorn not found. Installing..." -ForegroundColor Red
    pip install gunicorn eventlet
}

# Run gunicorn with eventlet (same as production)
try {
    Write-Host "🚀 Starting server..." -ForegroundColor Green
    gunicorn -k eventlet --worker-connections 1000 -b 0.0.0.0:5001 --reload --log-level debug app:app
} catch {
    Write-Host "❌ Server failed to start: $_" -ForegroundColor Red
}
