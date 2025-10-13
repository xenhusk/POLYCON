#!/usr/bin/env python3
"""
Migration script to create default periods for the POLYCON system.
This script creates the four default academic periods: Prelims, Midterm, Pre-finals, and Finals.
Only one period can be active at a time.

Usage:
    python create_default_periods.py

Requirements:
    - The backend must be running or the database must be accessible
    - The Period model must be created in the database
"""

import sys
import os
import requests
import json

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

try:
    from backend.models import Period, db
    from backend.app import create_app
    from backend.extensions import db as db_ext
except ImportError as e:
    print(f"Error importing backend modules: {e}")
    print("Make sure you're running this script from the project root directory.")
    sys.exit(1)

def create_default_periods():
    """Create the default academic periods."""
    
    # Create Flask app context
    app = create_app()
    
    with app.app_context():
        try:
            # Check if periods already exist
            existing_periods = Period.query.all()
            if existing_periods:
                print(f"Found {len(existing_periods)} existing periods:")
                for period in existing_periods:
                    print(f"  - {period.name} ({'Active' if period.is_active else 'Inactive'})")
                
                response = input("\nDo you want to continue and add missing default periods? (y/N): ")
                if response.lower() != 'y':
                    print("Operation cancelled.")
                    return
            
            # Default periods to create
            default_periods = [
                {'name': 'Prelims', 'is_active': True},  # Set Prelims as active by default
                {'name': 'Midterm', 'is_active': False},
                {'name': 'Pre-finals', 'is_active': False},
                {'name': 'Finals', 'is_active': False}
            ]
            
            created_count = 0
            skipped_count = 0
            
            for period_data in default_periods:
                # Check if period already exists
                existing_period = Period.query.filter_by(name=period_data['name']).first()
                
                if existing_period:
                    print(f"Period '{period_data['name']}' already exists. Skipping.")
                    skipped_count += 1
                    continue
                
                # Create new period
                new_period = Period(
                    name=period_data['name'],
                    is_active=period_data['is_active']
                )
                
                db.session.add(new_period)
                created_count += 1
                print(f"Created period: {period_data['name']} ({'Active' if period_data['is_active'] else 'Inactive'})")
            
            # Commit all changes
            db.session.commit()
            
            print(f"\n✅ Successfully created {created_count} new periods.")
            if skipped_count > 0:
                print(f"⏭️  Skipped {skipped_count} existing periods.")
            
            # Display final status
            print("\n📋 Current periods:")
            all_periods = Period.query.all()
            for period in all_periods:
                status = "🟢 Active" if period.is_active else "⚪ Inactive"
                print(f"  - {period.name}: {status}")
            
            print("\n🎉 Default periods setup completed!")
            print("\nNote: Only one period can be active at a time.")
            print("You can manage periods through the admin interface at /periods")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error creating default periods: {e}")
            print("Rolling back changes...")
            raise

def create_default_periods_via_api():
    """Alternative method: Create default periods via API call."""
    
    # Try to get the API URL from environment or use default
    api_url = os.getenv('API_URL', 'http://localhost:5000')
    
    try:
        print(f"Creating default periods via API at {api_url}...")
        
        response = requests.post(
            f"{api_url}/periods/create_default_periods",
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        if response.status_code == 201:
            data = response.json()
            print(f"✅ {data.get('message', 'Default periods created successfully!')}")
            if 'created_periods' in data:
                print(f"Created periods: {', '.join(data['created_periods'])}")
        else:
            print(f"❌ API request failed with status {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error: {error_data.get('error', 'Unknown error')}")
            except:
                print(f"Response: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the API server.")
        print("Make sure the backend server is running.")
    except requests.exceptions.Timeout:
        print("❌ API request timed out.")
    except Exception as e:
        print(f"❌ Error calling API: {e}")

def main():
    """Main function to handle the migration."""
    
    print("🎓 POLYCON Default Periods Migration Script")
    print("=" * 50)
    print("This script will create the default academic periods:")
    print("  - Prelims (set as active)")
    print("  - Midterm")
    print("  - Pre-finals")
    print("  - Finals")
    print()
    
    # Ask user which method to use
    print("Choose creation method:")
    print("1. Direct database access (requires backend modules)")
    print("2. API call (requires running backend server)")
    
    choice = input("Enter choice (1 or 2): ").strip()
    
    if choice == '1':
        try:
            create_default_periods()
        except ImportError:
            print("❌ Backend modules not available. Try method 2 (API call).")
        except Exception as e:
            print(f"❌ Error: {e}")
    elif choice == '2':
        create_default_periods_via_api()
    else:
        print("❌ Invalid choice. Please run the script again and choose 1 or 2.")

if __name__ == "__main__":
    main()
