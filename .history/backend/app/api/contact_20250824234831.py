# backend/app/api/contact.py
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os
from app.utils.logger import logger

router = APIRouter(prefix="/contact", tags=["contact"])

class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str
    type: str = "general"
    timestamp: Optional[str] = None

# Email configuration - Add these to your .env file
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")  # Your email
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")  # Your app password
SUPPORT_EMAIL = os.getenv("SUPPORT_EMAIL", "support@communityclara.ai")
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")


def send_email_notification(contact_data: ContactMessage):
    """Send email notification to support team"""
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = SUPPORT_EMAIL
        msg['Subject'] = f"[CommunityClara Support] {contact_data.type.title()}: {contact_data.subject}"
        
        # Email body
        body = f"""
New support message received:

Name: {contact_data.name}
Email: {contact_data.email}
Type: {contact_data.type.title()}
Subject: {contact_data.subject}
Timestamp: {contact_data.timestamp or datetime.now().isoformat()}

Message:
{contact_data.message}

---
Reply directly to {contact_data.email} to respond to this inquiry.
CommunityClara AI Support System
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Send email
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        logger.info(f"Support email sent for contact form submission from {contact_data.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send support email: {str(e)}")
        return False

def send_confirmation_email(contact_data: ContactMessage):
    """Send confirmation email to the user"""
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = contact_data.email
        msg['Subject'] = "Thank you for contacting CommunityClara AI"
        
        # Email body
        body = f"""
Hi {contact_data.name},

Thank you for reaching out to CommunityClara AI support! We've received your message and will get back to you within 24 hours.

Your Message Details:
Subject: {contact_data.subject}
Type: {contact_data.type.title()}
Submitted: {contact_data.timestamp or datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}

If you have any urgent questions, you can reply directly to this email.

Best regards,
CommunityClara AI Support Team
support@communityclara.ai
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Send email
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        logger.info(f"Confirmation email sent to {contact_data.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send confirmation email: {str(e)}")
        return False

@router.post("/send")
async def send_contact_message(
    contact_data: ContactMessage, 
    background_tasks: BackgroundTasks
):
    """
    Send contact form message to support team
    """
    try:
        # Validate required fields
        if not all([contact_data.name, contact_data.email, contact_data.subject, contact_data.message]):
            raise HTTPException(status_code=400, detail="All fields are required")
        
        # Add timestamp if not provided
        if not contact_data.timestamp:
            contact_data.timestamp = datetime.now().isoformat()
        
        # Send emails in background
        background_tasks.add_task(send_email_notification, contact_data)
        background_tasks.add_task(send_confirmation_email, contact_data)
        
        logger.info(f"Contact form submitted by {contact_data.name} ({contact_data.email})")
        
        return {
            "success": True,
            "message": "Your message has been sent successfully! We'll get back to you within 24 hours."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Contact form submission error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send message. Please try again.")