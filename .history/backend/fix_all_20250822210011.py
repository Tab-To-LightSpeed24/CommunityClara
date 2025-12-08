# Create fix_all.py
import sqlite3
import os
import re

def fix_database():
    """Fix database schema"""
    db_files = ["safespace.db", "communityclara.db"]
    db_path = None
    
    for db_file in db_files:
        if os.path.exists(db_file):
            db_path = db_file
            break
    
    if not db_path:
        print("❌ No database found")
        return
    
    print(f"📂 Fixing database: {db_path}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Add missing columns
    try:
        cursor.execute("ALTER TABLE violations ADD COLUMN message_content TEXT")
        print("✅ Added message_content")
    except:
        print("ℹ️ message_content exists")
    
    try:
        cursor.execute("ALTER TABLE violations ADD COLUMN channel_name TEXT")
        print("✅ Added channel_name")
    except:
        print("ℹ️ channel_name exists")
    
    conn.commit()
    conn.close()

def fix_bot_code():
    """Fix bot code to actually store content"""
    try:
        with open('app/bot/discord_bot_minimal.py', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace None with actual message content
        content = content.replace(
            'message_content=None',
            'message_content=message.content[:500]'
        )
        
        with open('app/bot/discord_bot_minimal.py', 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("✅ Fixed bot code to store actual content")
        
    except Exception as e:
        print(f"❌ Error fixing bot code: {e}")

if __name__ == "__main__":
    print("🔧 Running complete fix...")
    fix_database()
    fix_bot_code()
    print("🎉 All fixes applied!")