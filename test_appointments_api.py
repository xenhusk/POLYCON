#!/usr/bin/env python3
"""
Test script to check if the appointments API is returning data correctly.
"""

import requests
import json

def test_appointments_api():
    """Test the appointments API endpoints."""
    
    base_url = "http://localhost:5001"
    
    print("Testing Appointments API endpoints...")
    print("=" * 50)
    
    # Test 1: Get all bookings (admin view)
    print("\n1. Testing GET /bookings/get_bookings (admin view)")
    try:
        response = requests.get(f"{base_url}/bookings/get_bookings?role=admin")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            bookings = response.json()
            print(f"Found {len(bookings)} total bookings:")
            for booking in bookings:
                print(f"  - ID: {booking.get('id', 'N/A')}")
                print(f"    Status: {booking.get('status', 'N/A')}")
                print(f"    Teacher: {booking.get('teacher_name', 'N/A')}")
                print(f"    Students: {booking.get('student_names', [])}")
                print(f"    Schedule: {booking.get('schedule', 'N/A')}")
                print(f"    Venue: {booking.get('venue', 'N/A')}")
                print(f"    Period: {booking.get('period', 'N/A')}")
                print("    ---")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 2: Get faculty bookings
    print("\n2. Testing GET /bookings/get_bookings (faculty view)")
    try:
        response = requests.get(f"{base_url}/bookings/get_bookings?role=faculty&idNumber=22-3191-535")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            bookings = response.json()
            print(f"Found {len(bookings)} faculty bookings:")
            for booking in bookings:
                print(f"  - ID: {booking.get('id', 'N/A')}")
                print(f"    Status: {booking.get('status', 'N/A')}")
                print(f"    Teacher: {booking.get('teacher_name', 'N/A')}")
                print(f"    Students: {booking.get('student_names', [])}")
                print(f"    Schedule: {booking.get('schedule', 'N/A')}")
                print("    ---")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 3: Get student bookings
    print("\n3. Testing GET /bookings/get_bookings (student view)")
    try:
        response = requests.get(f"{base_url}/bookings/get_bookings?role=student&idNumber=22-3191-534")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            bookings = response.json()
            print(f"Found {len(bookings)} student bookings:")
            for booking in bookings:
                print(f"  - ID: {booking.get('id', 'N/A')}")
                print(f"    Status: {booking.get('status', 'N/A')}")
                print(f"    Teacher: {booking.get('teacher_name', 'N/A')}")
                print(f"    Students: {booking.get('student_names', [])}")
                print(f"    Schedule: {booking.get('schedule', 'N/A')}")
                print("    ---")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n" + "=" * 50)
    print("Appointments API test completed!")

if __name__ == "__main__":
    test_appointments_api()
