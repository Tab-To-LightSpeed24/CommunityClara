# Create backend/update_db.py
import sqlite3
import os
from datetime import datetime

def update_database():
    db_path = "communityclara.db"  # Adjust if your db file has a different name
    
    if not os.path.exists(db_path):
        print("❌ Database file not found!")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # List of columns to add
    new_columns = [
        "ALTER TABLE users ADD COLUMN email TEXT",
        "ALTER TABLE users ADD COLUMN google_id TEXT",
        "ALTER TABLE users ADD COLUMN display_name TEXT",
        "ALTER TABLE users ADD COLUMN avatar_url TEXT",
        "ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1",
        "ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0",
        "ALTER TABLE users ADD COLUMN last_login TEXT",
        "ALTER TABLE users ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP",
        "ALTER TABLE users ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP",
        "ALTER TABLE users ADD COLUMN theme TEXT DEFAULT 'system'",
        "ALTER TABLE users ADD COLUMN timezone TEXT DEFAULT 'UTC'",
        "ALTER TABLE users ADD COLUMN language TEXT DEFAULT 'en'",
        "ALTER TABLE users ADD COLUMN notification_preferences TEXT DEFAULT '{}'"
    ]
    
    print("🔄 Adding missing columns to users table...")
    
    for sql in new_columns:
        try:
            cursor.execute(sql)
            column_name = sql.split("ADD COLUMN ")[1].split(" ")[0]
            print(f"  ✅ Added column: {column_name}")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                column_name = sql.split("ADD COLUMN ")[1].split(" ")[0]
                print(f"  ⚠️  Column already exists: {column_name}")
            else:
                print(f"  ❌ Error adding column: {e}")
    
    # Create unique indexes for email and google_id
    try:
        cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)")
        print("  ✅ Created email index")
    except Exception as e:
        print(f"  ❌ Error creating email index: {e}")
    
    try:
        cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)")
        print("  ✅ Created google_id index")
    except Exception as e:
        print(f"  ❌ Error creating google_id index: {e}")
    
    conn.commit()
    conn.close()
    
    print("\n✅ Database update completed!")

if __name__ == "__main__":
    update_database()