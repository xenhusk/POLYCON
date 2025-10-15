#!/usr/bin/env python3
"""
Enhanced diagnostic script for scheduler issues.
This will help identify why the scheduler only works when manually triggered.
"""

import requests
import json
import time
from datetime import datetime

def monitor_scheduler_continuously(api_url, duration_minutes=5):
    """Monitor scheduler status continuously to see if it's actually running"""
    print(f"=== CONTINUOUS SCHEDULER MONITORING ({duration_minutes} minutes) ===")
    
    start_time = time.time()
    end_time = start_time + (duration_minutes * 60)
    check_count = 0
    
    while time.time() < end_time:
        check_count += 1
        print(f"\n--- Check #{check_count} at {datetime.now().strftime('%H:%M:%S')} ---")
        
        try:
            # Get scheduler status
            response = requests.get(f"{api_url}/scheduler/status", timeout=10)
            if response.status_code == 200:
                status = response.json()
                print(f"Running: {status.get('running')}")
                print(f"Thread alive: {status.get('thread_alive')}")
                print(f"Sent reminders: {status.get('sent_reminders_count', 0)}")
                print(f"Last cleanup: {status.get('last_cleanup', 'N/A')}")
            else:
                print(f"❌ Status check failed: {response.status_code}")
                
            # Check for upcoming appointments
            response = requests.get(f"{api_url}/scheduler/debug", timeout=10)
            if response.status_code == 200:
                debug_info = response.json()
                upcoming = debug_info.get('appointments_details', [])
                print(f"Upcoming appointments: {len(upcoming)}")
                
                for apt in upcoming:
                    if apt.get('should_send_reminder'):
                        print(f"  📅 ID: {apt['id'][:8]}... - {apt['minutes_until']} min until - SHOULD REMIND")
                    else:
                        print(f"  📅 ID: {apt['id'][:8]}... - {apt['minutes_until']} min until")
            else:
                print(f"❌ Debug check failed: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error during check: {e}")
        
        # Wait 30 seconds before next check
        time.sleep(30)
    
    print(f"\n=== MONITORING COMPLETE ({check_count} checks) ===")

def test_manual_vs_auto_reminders(api_url):
    """Test the difference between manual and automatic reminders"""
    print("=== MANUAL VS AUTO REMINDER TEST ===")
    
    # First, get current state
    print("1. Getting current scheduler state...")
    try:
        response = requests.get(f"{api_url}/scheduler/status")
        if response.status_code == 200:
            initial_status = response.json()
            initial_reminders = initial_status.get('sent_reminders_count', 0)
            print(f"   Initial reminders sent: {initial_reminders}")
        else:
            print(f"   ❌ Failed to get initial status: {response.status_code}")
            return
    except Exception as e:
        print(f"   ❌ Error getting initial status: {e}")
        return
    
    # Wait 2 minutes to see if automatic reminders are sent
    print("2. Waiting 2 minutes for automatic reminders...")
    time.sleep(120)
    
    # Check if any automatic reminders were sent
    try:
        response = requests.get(f"{api_url}/scheduler/status")
        if response.status_code == 200:
            after_wait_status = response.json()
            after_wait_reminders = after_wait_status.get('sent_reminders_count', 0)
            print(f"   Reminders after waiting: {after_wait_reminders}")
            
            if after_wait_reminders > initial_reminders:
                print("   ✅ Automatic reminders ARE working!")
            else:
                print("   ❌ No automatic reminders sent")
        else:
            print(f"   ❌ Failed to get status after wait: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error checking status after wait: {e}")
    
    # Now force a manual check
    print("3. Forcing manual reminder check...")
    try:
        response = requests.post(f"{api_url}/scheduler/force_check")
        if response.status_code == 200:
            result = response.json()
            print(f"   Manual check result: {result.get('message', 'Success')}")
        else:
            print(f"   ❌ Manual check failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error during manual check: {e}")
    
    # Check final state
    try:
        response = requests.get(f"{api_url}/scheduler/status")
        if response.status_code == 200:
            final_status = response.json()
            final_reminders = final_status.get('sent_reminders_count', 0)
            print(f"   Final reminders sent: {final_reminders}")
            
            if final_reminders > after_wait_reminders:
                print("   ✅ Manual check triggered reminders!")
            else:
                print("   ❌ Manual check didn't trigger any reminders")
        else:
            print(f"   ❌ Failed to get final status: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error getting final status: {e}")

def check_scheduler_thread_health(api_url):
    """Check if the scheduler thread is actually alive and working"""
    print("=== SCHEDULER THREAD HEALTH CHECK ===")
    
    checks = []
    for i in range(3):
        print(f"Check {i+1}/3...")
        try:
            response = requests.get(f"{api_url}/debug/worker_info")
            if response.status_code == 200:
                worker_info = response.json()
                pid = worker_info.get('current_process', {}).get('pid')
                checks.append(pid)
                print(f"  Worker PID: {pid}")
            else:
                print(f"  ❌ Failed to get worker info: {response.status_code}")
                
            if i < 2:  # Don't sleep after last check
                time.sleep(10)
        except Exception as e:
            print(f"  ❌ Error: {e}")
    
    # Check if PID is consistent (single worker)
    unique_pids = set(checks)
    if len(unique_pids) == 1:
        print("✅ Single worker process confirmed")
    else:
        print(f"❌ Multiple worker processes detected: {unique_pids}")
        print("   This could cause Socket.IO room issues!")

def main():
    api_url = "https://polycon.onrender.com"
    
    print("🔍 ENHANCED POLYCON Scheduler Diagnostic")
    print("=" * 60)
    
    # Check worker consistency
    check_scheduler_thread_health(api_url)
    print()
    
    # Test manual vs automatic reminders
    test_manual_vs_auto_reminders(api_url)
    print()
    
    # Ask user if they want continuous monitoring
    duration = input("Enter monitoring duration in minutes (default 5, 0 to skip): ").strip()
    if duration and duration != "0":
        try:
            duration = int(duration)
            monitor_scheduler_continuously(api_url, duration)
        except ValueError:
            print("Invalid duration, skipping monitoring")
    elif duration != "0":
        monitor_scheduler_continuously(api_url, 5)
    
    print("\n" + "=" * 60)
    print("🏁 Enhanced diagnostic complete!")

if __name__ == "__main__":
    main()
