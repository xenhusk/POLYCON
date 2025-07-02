import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

def send_verification_email(to_email, verification_link):
    smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')  # Use Gmail SMTP by default
    smtp_port = int(os.getenv('SMTP_PORT', 587))
    smtp_user = os.getenv('SMTP_USER')
    smtp_password = os.getenv('SMTP_PASSWORD')
    from_email = os.getenv('FROM_EMAIL', smtp_user)

    print(f"[DEBUG] SMTP_SERVER: {smtp_server}")
    print(f"[DEBUG] SMTP_PORT: {smtp_port}")
    print(f"[DEBUG] SMTP_USER: {smtp_user}")
    print(f"[DEBUG] FROM_EMAIL: {from_email}")
    print(f"[DEBUG] To: {to_email}")
    print(f"[DEBUG] Verification link: {verification_link}")
    print(f"[DEBUG] About to send verification email to: {to_email}")
    print(f"[DEBUG] Email will be sent from: {from_email}")
    print(f"[DEBUG] Verification link: {verification_link}")
    if not smtp_user or not smtp_password:
        print("[ERROR] SMTP_USER or SMTP_PASSWORD environment variable is missing!")
        return False

    subject = 'Verify your WNU Student Account'
    body = f"""
    <p>Welcome to POLYCON!</p>
    <p>Please verify your email by clicking the link below:</p>
    <a href='{verification_link}'>Verify Email</a>
    <p>If you did not sign up, you can ignore this email.</p>
    """

    msg = MIMEMultipart()
    msg['From'] = str(from_email) if from_email is not None else ''
    msg['To'] = str(to_email) if to_email is not None else ''
    msg['Subject'] = str(subject)  # Set subject directly as a string
    msg.attach(MIMEText(body, 'html'))    
    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(from_email, to_email, msg.as_string())
        print(f"Verification email sent to {to_email}: {verification_link}")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to send email: {e}")
        return False

def send_password_reset_email(to_email, reset_link, user_name):
    smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = int(os.getenv('SMTP_PORT', 587))
    smtp_user = os.getenv('SMTP_USER')
    smtp_password = os.getenv('SMTP_PASSWORD')
    from_email = os.getenv('FROM_EMAIL', smtp_user)

    print(f"[DEBUG] Sending password reset email to: {to_email}")
    print(f"[DEBUG] Reset link: {reset_link}")
    
    if not smtp_user or not smtp_password:
        print("[ERROR] SMTP_USER or SMTP_PASSWORD environment variable is missing!")
        return False

    subject = 'Reset Your POLYCON Password'
    body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0065A8;">Password Reset Request</h2>
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
        <p style="color: #666; font-size: 12px;">
            This is an automated message from POLYCON. Please do not reply to this email.
        </p>
    </div>
    """

    msg = MIMEMultipart()
    msg['From'] = str(from_email) if from_email is not None else ''
    msg['To'] = str(to_email) if to_email is not None else ''
    msg['Subject'] = str(subject)
    msg.attach(MIMEText(body, 'html'))

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(from_email, to_email, msg.as_string())
        print(f"Password reset email sent to {to_email}")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to send password reset email: {e}")
        return False
