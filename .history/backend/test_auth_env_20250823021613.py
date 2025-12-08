# backend/test_auth_env.py
import os
from dotenv import load_dotenv

print("=== Testing Authentication Environment ===")

print("🔍 Before loading .env:")
print(f"Google Client ID: {os.getenv('GOOGLE_CLIENT_ID')}")

print("\n📂 Loading .env file...")
load_dotenv()

print("\n✅ After loading .env:")
google_id = os.getenv('GOOGLE_CLIENT_ID')
if google_id:
    print(f"Google Client ID: {google_id[:30]}...")
    print(f"Google Client Secret: {'SET' if os.getenv('GOOGLE_CLIENT_SECRET') else 'NOT SET'}")
    print(f"JWT Secret length: {len(os.getenv('JWT_SECRET_KEY') or '')}")
    print(f"Frontend URL: {os.getenv('FRONTEND_URL')}")
else:
    print("Google Client ID: NOT SET")

# Test auth service import
print("\n🔧 Testing auth service import...")
try:
    from app.services.auth_service import auth_service
    print(f"✅ Auth service loaded")
    print(f"✅ Google Client ID in auth service: {auth_service.google_client_id[:30] + '...' if auth_service.google_client_id else 'NOT SET'}")
except Exception as e:
    print(f"❌ Auth service import failed: {e}")