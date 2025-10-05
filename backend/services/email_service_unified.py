import os
from typing import Optional

def get_email_service():
    """Return the appropriate email service based on environment"""
    if os.getenv('SENDGRID_API_KEY'):
        # Use SendGrid for production
        from services.sendgrid_email_service import sendgrid_service
        return sendgrid_service
    else:
        # Use SMTP for local development
        from services.email_service import EmailServiceSMTP
        return EmailServiceSMTP()

class EmailServiceSMTP:
    """SMTP-based email service for local development"""
    
    def send_verification_email(self, to_email: str, verification_link: str) -> bool:
        """Send verification email using SMTP"""
        from services.email_service import send_verification_email
        return send_verification_email(to_email, verification_link)
    
    def send_verification_email_async(self, to_email: str, verification_link: str) -> None:
        """Send verification email asynchronously using SMTP"""
        from services.email_service import send_verification_email_async
        return send_verification_email_async(to_email, verification_link)
    
    def send_password_reset_email(self, to_email: str, reset_link: str, user_name: str) -> bool:
        """Send password reset email using SMTP"""
        from services.email_service import send_password_reset_email
        return send_password_reset_email(to_email, reset_link, user_name)

# Global email service instance
email_service = get_email_service()

# Convenience functions
def send_verification_email(to_email: str, verification_link: str) -> bool:
    """Send verification email using the appropriate service"""
    return email_service.send_verification_email(to_email, verification_link)

def send_verification_email_async(to_email: str, verification_link: str) -> None:
    """Send verification email asynchronously using the appropriate service"""
    return email_service.send_verification_email_async(to_email, verification_link)

def send_password_reset_email(to_email: str, reset_link: str, user_name: str) -> bool:
    """Send password reset email using the appropriate service"""
    return email_service.send_password_reset_email(to_email, reset_link, user_name)
