# Create add_violation_fields.py
import sqlite3
import os

def add_violation_fields():
    """Add message_content and channel_name to violations table"""
    
    # Check which database file exists
    db_files = ["safespace.db", "communityclara.db"]
    db_path = None
    
    for db_file in db_files:
        if os.path.exists(db_file):
            db_path = db_file
            break
    
    if not db_path:
        print("❌ No database file found")
        return False
    
    print(f"📂 Using database: {db_path}")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check current table structure
        cursor.execute("PRAGMA table_info(violations)")
        columns = [row[1] for row in cursor.fetchall()]
        print(f"📋 Current violations columns: {columns}")
        
        # Add message_content column
        if 'message_content' not in columns:
            try:
                cursor.execute("ALTER TABLE violations ADD COLUMN message_content TEXT")
                print("✅ Added message_content column")
            except Exception as e:
                print(f"❌ message_content: {e}")
        else:
            print("ℹ️ message_content column already exists")
        
        # Add channel_name column  
        if 'channel_name' not in columns:
            try:
                cursor.execute("ALTER TABLE violations ADD COLUMN channel_name TEXT")
                print("✅ Added channel_name column")
            except Exception as e:
                print(f"❌ channel_name: {e}")
        else:
            print("ℹ️ channel_name column already exists")
        
        # Verify changes
        cursor.execute("PRAGMA table_info(violations)")
        new_columns = [row[1] for row in cursor.fetchall()]
        print(f"📋 Updated violations columns: {new_columns}")
        
        conn.commit()
        conn.close()
        
        print("🎉 Migration completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

if __name__ == "__main__":
    add_violation_fields()