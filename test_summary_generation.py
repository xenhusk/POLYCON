#!/usr/bin/env python3
"""
Simple test script to validate the concern-based summary generation function.
"""

import sys
import os

# Add backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from services.google_gemini import generate_concern_based_summary

def test_concern_summary():
    """Test the concern-based summary generation with sample data."""
    
    print("🧪 Testing Concern-Based Summary Generation")
    print("=" * 60)
    
    # Test case 1: Individual session
    print("\n📝 Test Case 1: Individual Academic Concern")
    concern1 = "Difficulty understanding advanced programming concepts and algorithms"
    action1 = "Provided additional practice materials and supplementary resources"
    outcome1 = "Student mastered key concepts and ready for advanced topics"
    duration1 = "01:30:00"
    
    try:
        summary1 = generate_concern_based_summary(
            concern=concern1,
            action_taken=action1,
            outcome=outcome1,
            duration=duration1,
            session_type="Individual",
            student_count=1
        )
        print(f"✅ Generated Summary:")
        print(f"   {summary1}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test case 2: Group session
    print("\n📝 Test Case 2: Group Time Management Concern")
    concern2 = "Difficulty prioritizing multiple assignments and project deadlines"
    action2 = "Taught time-blocking techniques and productivity methods"
    outcome2 = "Students showed improved organizational skills and confidence"
    duration2 = "02:00:00"
    
    try:
        summary2 = generate_concern_based_summary(
            concern=concern2,
            action_taken=action2,
            outcome=outcome2,
            duration=duration2,
            session_type="Group",
            student_count=3
        )
        print(f"✅ Generated Summary:")
        print(f"   {summary2}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test case 3: Minimal data
    print("\n📝 Test Case 3: Minimal Data")
    concern3 = "Feeling overwhelmed with coursework"
    
    try:
        summary3 = generate_concern_based_summary(
            concern=concern3,
            action_taken="",
            outcome="",
            duration=None,
            session_type=None,
            student_count=1
        )
        print(f"✅ Generated Summary:")
        print(f"   {summary3}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_concern_summary()
    print("\n🎉 Test completed!")
