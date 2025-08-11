#!/usr/bin/env python3
"""
Test script for production reminder system
Use this to manually test reminders while setting up external cron
"""

import requests
import json
from datetime import datetime

# Production URL
BASE_URL = "https://polycon.onrender.com"

def test_reminder_system():
    """Test all reminder endpoints"""
    print("🧪 Testing Production Reminder System")
    print("=" * 50)
    
    # Test 1: Status Check
    print("\n1. Testing Status Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/alternative-reminders/status")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 2: Check Upcoming Appointments
    print("\n2. Checking Upcoming Appointments...")
    try:
        response = requests.get(f"{BASE_URL}/alternative-reminders/check_upcoming")
        print(f"   Status: {response.status_code}")
        data = response.json()
        print(f"   Total Appointments: {data.get('total_appointments', 0)}")
        print(f"   Reminder Window: {data.get('reminder_window_minutes', 0)} minutes")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 3: Trigger Reminders
    print("\n3. Triggering Reminder Check...")
    try:
        response = requests.post(
            f"{BASE_URL}/alternative-reminders/trigger",
            headers={"Content-Type": "application/json"},
            data="{}"
        )
        print(f"   Status: {response.status_code}")
        data = response.json()
        print(f"   Success: {data.get('success', False)}")
        print(f"   Appointments Checked: {data.get('appointments_checked', 0)}")
        print(f"   Reminders Sent: {data.get('reminders_sent', 0)}")
        print(f"   Message: {data.get('message', 'No message')}")
    except Exception as e:
        print(f"   Error: {e}")
    
    print("\n" + "=" * 50)
    print("✅ Testing Complete!")
    print("\nTo set up automatic reminders:")
    print("1. Go to https://cron-job.org")
    print("2. Create account and new cron job")
    print("3. Set URL: https://polycon.onrender.com/alternative-reminders/trigger")
    print("4. Set Method: POST")
    print("5. Set Schedule: Every 5-10 minutes")
    print("6. Set Content-Type: application/json")
    print("7. Set Body: {}")

if __name__ == "__main__":
    test_reminder_system()
