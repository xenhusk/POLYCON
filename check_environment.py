#!/usr/bin/env python3
"""
Quick script to check environment detection on production
"""

import requests
import json

def check_production_environment():
    api_url = "https://polycon.onrender.com"
    
    print("🔍 Checking Production Environment Detection")
    print("=" * 50)
    
    # Check scheduler status to see which one is running
    try:
        response = requests.get(f"{api_url}/scheduler/status")
        if response.status_code == 200:
            status = response.json()
            print(f"Scheduler Status: {status}")
            
            # Check if it's production or development scheduler
            print(f"Running: {status.get('running')}")
            print(f"Thread alive: {status.get('thread_alive')}")
            print(f"Last cleanup: {status.get('last_cleanup', 'N/A')}")
        else:
            print(f"❌ Failed to get scheduler status: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Try to access debug endpoint to get environment info
    try:
        response = requests.get(f"{api_url}/debug/worker_info")
        if response.status_code == 200:
            worker_info = response.json()
            print(f"\nWorker Info: {json.dumps(worker_info, indent=2)}")
        else:
            print(f"❌ Failed to get worker info: {response.status_code}")
    except Exception as e:
        print(f"❌ Error getting worker info: {e}")

if __name__ == "__main__":
    check_production_environment()
