#!/usr/bin/env python3
"""
Thread Health Test for Production Scheduler
This will help us understand why the scheduler thread isn't executing the loop.
"""

import requests
import json
import time
from datetime import datetime

def thread_health_test():
    """Test if the scheduler thread is actually running its loop"""
    api_url = "https://polycon.onrender.com"
    
    print("🧪 SCHEDULER THREAD HEALTH TEST")
    print("=" * 50)
    
    # Get initial state
    print("1. Getting initial scheduler state...")
    try:
        response = requests.get(f"{api_url}/scheduler/status")
        if response.status_code == 200:
            initial_status = response.json()
            initial_cleanup = initial_status.get('last_cleanup')
            initial_check_interval = initial_status.get('check_interval', 30)
            print(f"   Initial last_cleanup: {initial_cleanup}")
            print(f"   Check interval: {initial_check_interval} seconds")
            print(f"   Thread alive: {initial_status.get('thread_alive')}")
        else:
            print(f"   ❌ Failed to get initial status: {response.status_code}")
            return
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return
    
    # Wait for 2 check intervals to see if timestamp updates
    wait_time = initial_check_interval * 2 + 5  # Extra buffer
    print(f"2. Waiting {wait_time} seconds for scheduler loop to run...")
    print(f"   (Should see at least 2 loop iterations in this time)")
    
    time.sleep(wait_time)
    
    # Check if timestamp updated
    print("3. Checking if scheduler loop actually ran...")
    try:
        response = requests.get(f"{api_url}/scheduler/status")
        if response.status_code == 200:
            final_status = response.json()
            final_cleanup = final_status.get('last_cleanup')
            
            print(f"   Final last_cleanup: {final_cleanup}")
            print(f"   Thread alive: {final_status.get('thread_alive')}")
            
            if final_cleanup != initial_cleanup:
                print("   ✅ SUCCESS: Scheduler loop IS running!")
                print("   ✅ The automatic reminders should work!")
            else:
                print("   ❌ FAILURE: Scheduler loop is NOT running!")
                print("   ❌ Thread claims to be alive but loop never executed")
                print("   ❌ This is a CRITICAL threading/environment issue")
        else:
            print(f"   ❌ Failed to get final status: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("🏁 Thread health test complete!")

if __name__ == "__main__":
    thread_health_test()
