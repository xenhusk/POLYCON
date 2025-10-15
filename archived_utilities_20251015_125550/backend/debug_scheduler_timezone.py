#!/usr/bin/env python3
"""
Debug script to investigate scheduler timezone issues
"""

import os
import sys
from datetime import datetime, timezone, timedelta
from sqlalchemy import and_

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app
from models import Booking, User
from extensions import db

def debug_timezone_issues():
    """Debug timezone and appointment scheduling issues"""
    
    with app.app_context():
        print("=" * 60)
        print("SCHEDULER TIMEZONE DEBUG")
        print("=" * 60)
        
        # Current times
        now_utc_naive = datetime.utcnow()
        now_utc_aware = datetime.now(timezone.utc)
        now_local = datetime.now()
        
        print(f"Current UTC (naive):  {now_utc_naive}")
        print(f"Current UTC (aware):  {now_utc_aware}")
        print(f"Current Local:        {now_local}")
        print()
        
        # Database info
        total_bookings = db.session.query(Booking).count()
        confirmed_bookings = db.session.query(Booking).filter(Booking.status == 'confirmed').count()
        
        print(f"Total bookings:       {total_bookings}")
        print(f"Confirmed bookings:   {confirmed_bookings}")
        print()
        
        # Get all confirmed appointments
        confirmed_appointments = db.session.query(Booking).filter(
            Booking.status == 'confirmed'
        ).order_by(Booking.schedule.asc()).all()
        
        print("CONFIRMED APPOINTMENTS:")
        print("-" * 60)
        
        for i, apt in enumerate(confirmed_appointments, 1):
            schedule = apt.schedule
            created = apt.created_at
            
            # Check timezone info
            schedule_tz = getattr(schedule, 'tzinfo', None)
            created_tz = getattr(created, 'tzinfo', None)
            
            # Calculate time differences
            if schedule:
                diff_from_now = (schedule - now_utc_naive).total_seconds() / 60
                is_future = schedule > now_utc_naive
            else:
                diff_from_now = None
                is_future = None
            
            print(f"Appointment {i}:")
            print(f"  ID:           {apt.id}")
            print(f"  Teacher:      {apt.teacher_id}")
            print(f"  Students:     {apt.student_ids}")
            print(f"  Schedule:     {schedule} (TZ: {schedule_tz})")
            print(f"  Created:      {created} (TZ: {created_tz})")
            print(f"  Minutes away: {diff_from_now:.1f} ({'future' if is_future else 'past'})")
            print()
        
        # Test the scheduler's query logic
        print("SCHEDULER QUERY TEST:")
        print("-" * 60)
        
        reminder_minutes = 15
        reminder_start_time = now_utc_naive
        reminder_end_time = now_utc_naive + timedelta(minutes=reminder_minutes + 2)
        
        print(f"Reminder window: {reminder_start_time} to {reminder_end_time}")
        
        upcoming_appointments = db.session.query(Booking).filter(
            and_(
                Booking.status == 'confirmed',
                Booking.schedule >= reminder_start_time,
                Booking.schedule <= reminder_end_time
            )
        ).all()
        
        print(f"Appointments in reminder window: {len(upcoming_appointments)}")
        
        for apt in upcoming_appointments:
            minutes_away = (apt.schedule - now_utc_naive).total_seconds() / 60
            print(f"  - ID {apt.id}: {minutes_away:.1f} minutes away")
        
        # Test with a wider window to see if there are future appointments
        print("\nFUTURE APPOINTMENTS (next 24 hours):")
        print("-" * 60)
        
        next_24h = now_utc_naive + timedelta(hours=24)
        future_appointments = db.session.query(Booking).filter(
            and_(
                Booking.status == 'confirmed',
                Booking.schedule >= now_utc_naive,
                Booking.schedule <= next_24h
            )
        ).all()
        
        print(f"Future appointments (next 24h): {len(future_appointments)}")
        
        for apt in future_appointments:
            minutes_away = (apt.schedule - now_utc_naive).total_seconds() / 60
            hours_away = minutes_away / 60
            print(f"  - ID {apt.id}: {hours_away:.1f} hours away ({minutes_away:.0f} minutes)")

if __name__ == "__main__":
    debug_timezone_issues()
