#!/usr/bin/env python3
"""
Test script to verify the schedule timezone fix
"""

import os
import sys
from datetime import datetime, timezone

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app
from routes.booking_routes import format_schedule_for_api

def test_schedule_formatting():
    """Test the schedule formatting function"""
    
    print("=" * 60)
    print("TESTING SCHEDULE TIMEZONE FORMATTING")
    print("=" * 60)
    
    # Test with naive datetime (how it's stored in database)
    naive_dt = datetime(2025, 8, 2, 21, 30, 0)  # 9:30 PM
    print(f"Naive datetime: {naive_dt}")
    print(f"Has timezone: {naive_dt.tzinfo}")
    
    # Test our formatting function
    formatted = format_schedule_for_api(naive_dt)
    print(f"Formatted for API: {formatted}")
    
    # Test with None
    none_formatted = format_schedule_for_api(None)
    print(f"None formatted: {none_formatted}")
    
    print()
    print("Expected behavior:")
    print("- Naive datetime should be treated as UTC")
    print("- Result should include timezone info (+00:00)")
    print("- Frontend should interpret this correctly as UTC")

if __name__ == "__main__":
    test_schedule_formatting()
