from models import Booking
from extensions import db
from app import app

with app.app_context():
    latest = db.session.query(Booking).order_by(Booking.created_at.desc()).first()
    print(f'Latest booking:')
    print(f'ID: {latest.id}')
    print(f'Schedule (raw): {latest.schedule}')
    print(f'Schedule type: {type(latest.schedule)}')
    print(f'Created at: {latest.created_at}')
    print(f'Status: {latest.status}')
