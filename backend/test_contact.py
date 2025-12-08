# test_contact.py
import requests
import json

def test_contact_api():
    # Make sure your backend is running on localhost:8000
    url = "http://localhost:8000/api/contact/send"
    
    # Test data
    test_data = {
        "name": "Test User",
        "email": "your-personal-email@gmail.com",  # Replace with your real email
        "subject": "Test Contact Form Submission",
        "message": "This is a test message to verify the contact form API is working correctly.",
        "type": "technical"
    }
    
    try:
        print("🧪 Testing contact form API...")
        print(f"📤 Sending request to: {url}")
        
        response = requests.post(url, json=test_data)
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📋 Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ Contact form API test successful!")
            print("📧 Check your email and communityclaras@gmail.com for messages")
        else:
            print(f"❌ Contact form API test failed with status {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to backend. Is the server running?")
        print("💡 Run: python run.py in your backend directory")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_contact_api()