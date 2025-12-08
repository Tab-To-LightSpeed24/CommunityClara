# backend/test_env.py
import os
from dotenv import load_dotenv

load_dotenv()

print("=== Environment Variables Test ===")
print(f"Google Client ID: {os.getenv('GOOGLE_CLIENT_ID')[:20] + '...' if os.getenv('GOOGLE_CLIENT_ID') else 'NOT SET'}")
print(f"Google Client Secret: {'SET' if os.getenv('GOOGLE_CLIENT_SECRET') else 'NOT SET'}")
print(f"JWT Secret length: {len(os.getenv('JWT_SECRET_KEY') or '')}")
print(f"JWT Algorithm: {os.getenv('JWT_ALGORITHM')}")
print(f"JWT Expire Hours: {os.getenv('JWT_EXPIRE_HOURS')}")
print(f"Frontend URL: {os.getenv('FRONTEND_URL')}")
print("================================")

# Check if .env file exists
if os.path.exists('.env'):
    print("✅ .env file found")
else:
    print("❌ .env file NOT found - create it first!")