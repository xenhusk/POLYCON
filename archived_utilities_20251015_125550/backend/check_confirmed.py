from models import Booking
from extensions import db
from app import app

with app.app_context():
    confirmed = db.session.query(Booking).filter(Booking.status == 'confirmed').order_by(Booking.created_at.desc()).all()
    print(f'Confirmed bookings:')
    for booking in confirmed[:3]:  # Show last 3
        print(f'ID: {booking.id}')
        print(f'Schedule (raw): {booking.schedule}')
        print(f'Created at: {booking.created_at}')
        print(f'Status: {booking.status}')
        print('---')
