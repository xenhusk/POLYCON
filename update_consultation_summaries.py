#!/usr/bin/env python3
"""
Script to update all consultation session summaries to be based on concern data using Gemini AI.
This script calls the backend API to update summaries for all existing sessions.
"""

import requests
import json
import time

# Configuration
BACKEND_URL = "http://localhost:5000"  # Adjust if your backend runs on a different port
UPDATE_ENDPOINT = f"{BACKEND_URL}/consultation/update_all_summaries"

def update_all_summaries():
    """
    Call the backend API to update all consultation session summaries.
    """
    print("🚀 Starting consultation summary update process...")
    print(f"📡 Calling API endpoint: {UPDATE_ENDPOINT}")
    
    try:
        # Make the API call
        response = requests.post(UPDATE_ENDPOINT)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Summary update completed successfully!")
            print(f"📊 Results:")
            print(f"   - Updated: {result.get('updated', 0)} sessions")
            print(f"   - Skipped: {result.get('skipped', 0)} sessions")
            print(f"   - Errors: {result.get('errors', 0)} sessions")
            print(f"   - Total: {result.get('total_sessions', 0)} sessions")
            print(f"💬 Message: {result.get('message', 'No message')}")
            
            return True
        else:
            print(f"❌ API call failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Could not connect to the backend server.")
        print("Make sure your Flask backend is running on the specified URL.")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False

def test_single_session(session_id):
    """
    Test updating a single session summary.
    """
    test_endpoint = f"{BACKEND_URL}/consultation/update_session_summary"
    
    try:
        payload = {"session_id": session_id}
        response = requests.post(test_endpoint, json=payload)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Successfully updated session {session_id}")
            print(f"Old summary: {result.get('old_summary', 'None')[:100]}...")
            print(f"New summary: {result.get('new_summary', 'None')[:100]}...")
            return True
        else:
            print(f"❌ Failed to update session {session_id}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing session {session_id}: {str(e)}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("CONSULTATION SUMMARY UPDATE SCRIPT")
    print("=" * 60)
    
    # Check if backend is running
    try:
        health_check = requests.get(f"{BACKEND_URL}/")
        print(f"✅ Backend is running at {BACKEND_URL}")
    except:
        print(f"❌ Backend is not accessible at {BACKEND_URL}")
        print("Please start your Flask backend first.")
        exit(1)
    
    print("\nChoose an option:")
    print("1. Update all consultation summaries")
    print("2. Test with a single session")
    print("3. Exit")
    
    choice = input("\nEnter your choice (1-3): ").strip()
    
    if choice == "1":
        print("\n🔄 Updating all consultation summaries...")
        success = update_all_summaries()
        if success:
            print("\n🎉 All summaries have been updated successfully!")
        else:
            print("\n💥 Summary update failed. Check the error messages above.")
    
    elif choice == "2":
        session_id = input("Enter the session ID to test: ").strip()
        try:
            session_id = int(session_id)
            print(f"\n🔄 Testing summary update for session {session_id}...")
            success = test_single_session(session_id)
            if success:
                print(f"\n🎉 Session {session_id} summary updated successfully!")
            else:
                print(f"\n💥 Failed to update session {session_id}.")
        except ValueError:
            print("❌ Invalid session ID. Please enter a number.")
    
    elif choice == "3":
        print("👋 Goodbye!")
    
    else:
        print("❌ Invalid choice. Please run the script again.")
    
    print("\n" + "=" * 60)
