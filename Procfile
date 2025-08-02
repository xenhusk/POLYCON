web: cd backend && gunicorn -k eventlet --workers 1 --worker-connections 1000 -b 0.0.0.0:$PORT app:app
release: cd backend && flask db upgrade; python production_timezone_fix.py || echo "Timezone fix completed or already applied"
