"""
Test script for concern analytics prefetch service
"""

import requests
import time
import json

def test_prefetch_service(base_url="http://localhost:5001"):
    """Test the concern analytics prefetch service"""
    
    print("🧪 Testing Concern Analytics Prefetch Service")
    print("=" * 50)
    
    # Test 1: Check prefetch status
    print("\n1. Checking prefetch service status...")
    try:
        response = requests.get(f"{base_url}/prefetch/status")
        if response.status_code == 200:
            status = response.json()
            print(f"✅ Status check successful:")
            print(f"   - Running: {status.get('running', False)}")
            print(f"   - Last prefetch: {status.get('last_prefetch', 'Never')}")
            print(f"   - Interval: {status.get('interval_minutes', 'Unknown')} minutes")
        else:
            print(f"❌ Status check failed: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Status check error: {e}")
        return
    
    # Test 2: Force a prefetch
    print("\n2. Testing forced prefetch...")
    try:
        start_time = time.time()
        response = requests.post(f"{base_url}/prefetch/force")
        duration = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Forced prefetch completed in {duration:.2f} seconds")
            print(f"   - Success: {result.get('success', False)}")
            print(f"   - Message: {result.get('message', 'No message')}")
        else:
            print(f"❌ Forced prefetch failed: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Forced prefetch error: {e}")
    
    # Test 3: Test analytics load speed (before cache warm-up)
    print("\n3. Testing analytics load speed...")
    try:
        # Test analytics endpoint directly
        start_time = time.time()
        response = requests.get(f"{base_url}/hometeacher/student_concern_analytics")
        duration = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            categories = len(data.get('nlp_categories', {}))
            print(f"✅ Analytics loaded in {duration:.2f} seconds")
            print(f"   - Categories found: {categories}")
            print(f"   - Analysis method: {data.get('analysis_method', 'Unknown')}")
        else:
            print(f"❌ Analytics load failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Analytics load error: {e}")
    
    # Test 4: Check status again to see if last_prefetch updated
    print("\n4. Checking if prefetch updated status...")
    try:
        response = requests.get(f"{base_url}/prefetch/status")
        if response.status_code == 200:
            status = response.json()
            print(f"✅ Updated status:")
            print(f"   - Running: {status.get('running', False)}")
            print(f"   - Last prefetch: {status.get('last_prefetch', 'Never')}")
            print(f"   - Thread alive: {status.get('thread_alive', False)}")
        else:
            print(f"❌ Status check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Status check error: {e}")
    
    print("\n🎉 Test completed!")
    print("\n💡 Tips:")
    print("   - Prefetch runs automatically every 30 minutes")
    print("   - Check /prefetch/status to monitor service")
    print("   - Use /prefetch/force to manually refresh cache")
    print("   - Analytics should load faster after prefetch completes")

if __name__ == "__main__":
    import sys
    
    base_url = "http://localhost:5001"
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    
    test_prefetch_service(base_url)
