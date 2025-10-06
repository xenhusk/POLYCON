#!/usr/bin/env python3
"""
Test script to verify email verification functionality
"""

import os
import sys

# Add the backend directory to the Python path
sys.path.append('backend')

def test_verification_email():
    """Test the verification email functionality"""
    
    # Set up environment variables for testing
    os.environ['SENDGRID_API_KEY'] = 'your_api_key_here'  # Replace with your actual API key
    os.environ['FROM_EMAIL'] = 'your_verified_email@example.com'  # Replace with your verified email
    os.environ['FROM_NAME'] = 'POLYCON'
    
    try:
        # Import the unified email service
        from services.email_service_unified import send_verification_email_async
        
        # Test email
        test_email = "test@example.com"  # Replace with your test email
        test_verification_link = "https://polycon-frontend.onrender.com/verify-email?token=test_token_123"
        
        print(f"Testing verification email to: {test_email}")
        print(f"Verification link: {test_verification_link}")
        
        # Send the verification email
        send_verification_email_async(test_email, test_verification_link)
        
        print("✅ Verification email sent successfully!")
        print("Check your email inbox (including spam folder)")
        
    except Exception as e:
        print(f"❌ Error sending verification email: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🧪 Testing Email Verification Functionality")
    print("=" * 50)
    test_verification_email()
