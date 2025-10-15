#!/usr/bin/env python3
"""
Debug script for reminder notifications in production environment.
This script will help identify issues with the reminder system on Render.
"""

import os
import sys
from datetime import datetime, timedelta
import requests
import json

def check_environment():
    """Check if we're running in production environment"""
    print("=== ENVIRONMENT CHECK ===")
    print(f"FLASK_ENV: {os.getenv('FLASK_ENV')}")
    print(f"PORT: {os.getenv('PORT')}")
    print(f"WEB_CONCURRENCY: {os.getenv('WEB_CONCURRENCY')}")
    print(f"WORKERS: {os.getenv('WORKERS')}")
    print(f"Current time: {datetime.now()}")
    print(f"Current UTC time: {datetime.utcnow()}")
    print()

def check_scheduler_status(api_url):
    """Check scheduler status via API"""
    print("=== SCHEDULER STATUS CHECK ===")
    try:
        response = requests.get(f"{api_url}/scheduler/status")
        if response.status_code == 200:
            status = response.json()
            print("Scheduler Status:")
            print(json.dumps(status, indent=2))
        else:
            print(f"Failed to get scheduler status: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error checking scheduler status: {e}")
    print()

def check_debug_info(api_url):
    """Get debug information about appointments"""
    print("=== SCHEDULER DEBUG INFO ===")
    try:
        response = requests.get(f"{api_url}/scheduler/debug")
        if response.status_code == 200:
            debug_info = response.json()
            print("Debug Information:")
            print(json.dumps(debug_info, indent=2))
        else:
            print(f"Failed to get debug info: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error getting debug info: {e}")
    print()

def check_socket_status(api_url):
    """Check Socket.IO connection status"""
    print("=== SOCKET.IO STATUS CHECK ===")
    try:
        response = requests.get(f"{api_url}/debug/socket_status")
        if response.status_code == 200:
            socket_info = response.json()
            print("Socket.IO Status:")
            print(json.dumps(socket_info, indent=2))
        else:
            print(f"Failed to get socket status: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error checking socket status: {e}")
    print()

def test_reminder_send(api_url, recipient_id):
    """Test sending a reminder"""
    print(f"=== TESTING REMINDER SEND TO USER {recipient_id} ===")
    try:
        payload = {"recipient_id": recipient_id}
        response = requests.post(f"{api_url}/debug/test_reminder", json=payload)
        if response.status_code == 200:
            result = response.json()
            print("Test Reminder Result:")
            print(json.dumps(result, indent=2))
        else:
            print(f"Failed to send test reminder: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error sending test reminder: {e}")
    print()

def check_worker_info(api_url):
    """Check worker process information"""
    print("=== WORKER PROCESS INFO ===")
    try:
        response = requests.get(f"{api_url}/debug/worker_info")
        if response.status_code == 200:
            worker_info = response.json()
            print("Worker Information:")
            print(json.dumps(worker_info, indent=2))
        else:
            print(f"Failed to get worker info: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error checking worker info: {e}")
    print()

def force_check_reminders(api_url):
    """Force immediate reminder check"""
    print("=== FORCING REMINDER CHECK ===")
    try:
        response = requests.post(f"{api_url}/scheduler/force_check")
        if response.status_code == 200:
            result = response.json()
            print("Force Check Result:")
            print(json.dumps(result, indent=2))
        else:
            print(f"Failed to force check: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error forcing reminder check: {e}")
    print()

def main():
    """Main diagnostic function"""
    # Use production URL - replace with your actual Render backend URL
    api_url = "https://polycon.onrender.com"
    
    print("🔍 POLYCON Reminder System Diagnostic Tool")
    print("=" * 50)
    
    check_environment()
    check_worker_info(api_url)
    check_scheduler_status(api_url)
    check_debug_info(api_url)
    check_socket_status(api_url)
    force_check_reminders(api_url)
    
    # Test reminder with a sample user ID
    # Replace this with an actual user ID from your system
    test_user_id = input("Enter a user ID to test reminder (or press Enter to skip): ").strip()
    if test_user_id:
        test_reminder_send(api_url, test_user_id)
    
    print("=" * 50)
    print("🏁 Diagnostic complete!")
    print()
    print("📋 Next Steps:")
    print("1. Check if scheduler is running")
    print("2. Verify Socket.IO connections")
    print("3. Check for timezone issues")
    print("4. Verify worker process configuration")

if __name__ == "__main__":
    main()
