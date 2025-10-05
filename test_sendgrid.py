import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

# Test script to verify SendGrid setup
# Make sure to set your environment variables first:
# export SENDGRID_API_KEY='your_api_key_here'
# export FROM_EMAIL='your_verified_email@example.com'

def test_sendgrid():
    # Get environment variables
    api_key = os.environ.get('SENDGRID_API_KEY')
    from_email = os.environ.get('FROM_EMAIL', 'test@example.com')
    
    if not api_key:
        print("ERROR: SENDGRID_API_KEY environment variable not set!")
        return False
    
    print(f"Using API Key: {api_key[:10]}...")
    print(f"From Email: {from_email}")
    
    # Create the email message
    message = Mail(
        from_email=from_email,
        to_emails='your-test-email@gmail.com',  # Change this to your test email
        subject='SendGrid Test Email',
        html_content='<strong>This is a test email from SendGrid!</strong>'
    )
    
    try:
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        print(f"SUCCESS! Status code: {response.status_code}")
        print(f"Response body: {response.body}")
        print(f"Response headers: {response.headers}")
        return True
    except Exception as e:
        print(f"ERROR: {e}")
        return False

if __name__ == "__main__":
    test_sendgrid()
