# Create backend/check_db.py
import sqlite3
import os

def check_database():
    db_path = "safespace.db"  # or your actual db file name
    
    if not os.path.exists(db_path):
        print("❌ Database file not found!")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if users table exists and its structure
    cursor.execute("PRAGMA table_info(users)")
    columns = cursor.fetchall()
    
    print("📊 Current users table structure:")
    for col in columns:
        print(f"  - {col[1]} ({col[2]})")
    
    # Check existing user columns
    existing_columns = [col[1] for col in columns]
    
    needed_columns = [
        'email', 'google_id', 'display_name', 'avatar_url', 
        'is_active', 'is_verified', 'last_login', 'theme', 
        'timezone', 'language', 'notification_preferences'
    ]
    
    missing_columns = [col for col in needed_columns if col not in existing_columns]
    
    if missing_columns:
        print(f"\n❌ Missing columns: {missing_columns}")
    else:
        print("\n✅ All required columns exist!")
    
    conn.close()

if __name__ == "__main__":
    check_database()