import os
import requests
import json
from typing import Optional

class SendGridEmailService:
    def __init__(self):
        self.api_key = os.getenv('SENDGRID_API_KEY')
        self.from_email = os.getenv('FROM_EMAIL', 'noreply@polycon.com')
        self.from_name = os.getenv('FROM_NAME', 'POLYCON')
        
    def send_verification_email(self, to_email: str, verification_link: str) -> bool:
        """Send email verification using SendGrid API"""
        if not self.api_key:
            print("[ERROR] SENDGRID_API_KEY environment variable is missing!")
            return False
            
        url = "https://api.sendgrid.com/v3/mail/send"
        
        subject = 'Verify your WNU Student Account'
        body = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0065A8; text-align: center;">Welcome to POLYCON!</h2>
            <p>Please verify your email by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{verification_link}" 
                   style="background-color: #0065A8; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; display: inline-block;">
                    Verify Email
                </a>
            </div>
            <p style="margin-top:16px;color:#666;font-size:12px">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break:break-all;font-size:12px;background:#f5f5f5;padding:10px;border-radius:4px;"><code>{verification_link}</code></p>
            <p>If you did not sign up, you can ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px; text-align: center;">
                This is an automated message from POLYCON. Please do not reply to this email.
            </p>
        </div>
        """
        
        payload = {
            "personalizations": [
                {
                    "to": [{"email": to_email}],
                    "subject": subject
                }
            ],
            "from": {
                "email": self.from_email,
                "name": self.from_name
            },
            "content": [
                {
                    "type": "text/html",
                    "value": body
                }
            ]
        }
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.post(url, headers=headers, data=json.dumps(payload), timeout=30)
            if response.status_code == 202:
                print(f"Verification email sent successfully to {to_email}")
                return True
            else:
                print(f"[ERROR] SendGrid API error: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"[ERROR] Failed to send verification email via SendGrid: {e}")
            return False
    
    def send_password_reset_email(self, to_email: str, reset_link: str, user_name: str) -> bool:
        """Send password reset email using SendGrid API"""
        if not self.api_key:
            print("[ERROR] SENDGRID_API_KEY environment variable is missing!")
            return False
            
        url = "https://api.sendgrid.com/v3/mail/send"
        
        subject = 'Reset Your POLYCON Password'
        body = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0065A8; text-align: center;">Password Reset Request</h2>
            <p>Hello {user_name},</p>
            <p>We received a request to reset your password for your POLYCON account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}" 
                   style="background-color: #0065A8; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; display: inline-block;">
                    Reset Password
                </a>
            </div>
            <p><strong>Note:</strong> This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request this password reset, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px; text-align: center;">
                This is an automated message from POLYCON. Please do not reply to this email.
            </p>
        </div>
        """
        
        payload = {
            "personalizations": [
                {
                    "to": [{"email": to_email}],
                    "subject": subject
                }
            ],
            "from": {
                "email": self.from_email,
                "name": self.from_name
            },
            "content": [
                {
                    "type": "text/html",
                    "value": body
                }
            ]
        }
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.post(url, headers=headers, data=json.dumps(payload), timeout=30)
            if response.status_code == 202:
                print(f"Password reset email sent successfully to {to_email}")
                return True
            else:
                print(f"[ERROR] SendGrid API error: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"[ERROR] Failed to send password reset email via SendGrid: {e}")
            return False

# Create a global instance
sendgrid_service = SendGridEmailService()

# Convenience functions to maintain compatibility with existing code
def send_verification_email(to_email: str, verification_link: str) -> bool:
    """Send verification email using SendGrid"""
    return sendgrid_service.send_verification_email(to_email, verification_link)

def send_verification_email_async(to_email: str, verification_link: str) -> None:
    """Send verification email asynchronously using SendGrid"""
    import threading
    
    def _send():
        success = sendgrid_service.send_verification_email(to_email, verification_link)
        if not success:
            print(f"[ERROR] Failed to send verification email to {to_email}")
    
    thread = threading.Thread(target=_send, daemon=True)
    thread.start()

def send_password_reset_email(to_email: str, reset_link: str, user_name: str) -> bool:
    """Send password reset email using SendGrid"""
    return sendgrid_service.send_password_reset_email(to_email, reset_link, user_name)
