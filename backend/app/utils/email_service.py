# backend/app/utils/email_service.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os
from app.utils.logger import logger

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.username = os.getenv("SMTP_USERNAME")
        self.password = os.getenv("SMTP_PASSWORD")
        self.support_email = os.getenv("SUPPORT_EMAIL")
        
    def send_support_email(self, contact_data):
        """Send email to support team"""
        try:
            msg = MIMEMultipart()
            msg['From'] = self.username
            msg['To'] = self.support_email
            msg['Subject'] = f"[CommunityClara Support] {contact_data.get('type', 'general').title()}: {contact_data.get('subject', 'No Subject')}"
            
            body = f"""
New support message received:

Name: {contact_data.get('name', 'Unknown')}
Email: {contact_data.get('email', 'Unknown')}
Type: {contact_data.get('type', 'general').title()}
Subject: {contact_data.get('subject', 'No Subject')}
Timestamp: {contact_data.get('timestamp', datetime.now().isoformat())}

Message:
{contact_data.get('message', 'No message provided')}

---
Reply directly to {contact_data.get('email', 'the sender')} to respond to this inquiry.
CommunityClara AI Support System
            """
            
            msg.attach(MIMEText(body, 'plain'))
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.username, self.password)
                server.send_message(msg)
            
            logger.info(f"Support email sent for contact form submission from {contact_data.get('email')}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send support email: {str(e)}")
            return False

    def send_confirmation_email(self, contact_data):
        """Send confirmation email to user"""
        try:
            user_email = contact_data.get('email')
            if not user_email:
                return False
                
            msg = MIMEMultipart()
            msg['From'] = self.username
            msg['To'] = user_email
            msg['Subject'] = "Thank you for contacting CommunityClara AI"
            
            body = f"""
Hi {contact_data.get('name', 'there')},

Thank you for reaching out to CommunityClara AI support! We've received your message and will get back to you within 24 hours.

Your Message Details:
Subject: {contact_data.get('subject', 'No Subject')}
Type: {contact_data.get('type', 'general').title()}
Submitted: {contact_data.get('timestamp', datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC'))}

If you have any urgent questions, you can reply directly to this email.

Best regards,
CommunityClara AI Support Team
communityclaras@gmail.com
            """
            
            msg.attach(MIMEText(body, 'plain'))
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.username, self.password)
                server.send_message(msg)
            
            logger.info(f"Confirmation email sent to {user_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send confirmation email: {str(e)}")
            return False

email_service = EmailService()