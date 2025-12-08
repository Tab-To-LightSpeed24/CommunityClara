# backend/test_env_loading.py
import os
from dotenv import load_dotenv

print("🔍 Before loading .env:")
print(f"Google Client ID: {os.getenv('GOOGLE_CLIENT_ID')}")

print("\n📂 Loading .env file...")
load_dotenv()

print("\n✅ After loading .env:")
print(f"Google Client ID: {os.getenv('GOOGLE_CLIENT_ID')[:30] + '...' if os.getenv('GOOGLE_CLIENT_ID') else 'NOT SET'}")
print(f"JWT Secret length: {len(os.getenv('JWT_SECRET_KEY') or '')}")
print(f"Frontend URL: {os.getenv('FRONTEND_URL')}")

# Check if .env file exists
if os.path.exists('.env'):
    print("\n✅ .env file found")
    with open('.env', 'r') as f:
        lines = f.readlines()
    print(f"📄 .env file has {len(lines)} lines")
    
    # Show first few characters of each line (for debugging)
    for i, line in enumerate(lines[:5]):
        if line.strip() and not line.startswith('#'):
            key = line.split('=')[0]
            print(f"  Line {i+1}: {key}=...")
else:
    print("\n❌ .env file NOT found!")