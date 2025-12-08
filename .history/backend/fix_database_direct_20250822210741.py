# Create fix_database_direct.py
import sqlite3

def fix_database():
    # Check both possible database files
    db_files = ["safespace.db", "communityclara.db"]
    
    for db_file in db_files:
        try:
            print(f"🔍 Checking {db_file}...")
            conn = sqlite3.connect(db_file)
            cursor = conn.cursor()
            
            # Check current columns
            cursor.execute("PRAGMA table_info(violations)")
            columns = [row[1] for row in cursor.fetchall()]
            print(f"📋 Current columns: {columns}")
            
            # Add missing columns
            if 'message_content' not in columns:
                cursor.execute("ALTER TABLE violations ADD COLUMN message_content TEXT")
                print("✅ Added message_content column")
            else:
                print("ℹ️ message_content already exists")
                
            if 'channel_name' not in columns:
                cursor.execute("ALTER TABLE violations ADD COLUMN channel_name TEXT")
                print("✅ Added channel_name column")
            else:
                print("ℹ️ channel_name already exists")
            
            # Verify
            cursor.execute("PRAGMA table_info(violations)")
            new_columns = [row[1] for row in cursor.fetchall()]
            print(f"📋 After update: {new_columns}")
            
            conn.commit()
            conn.close()
            print(f"🎉 Successfully updated {db_file}")
            break
            
        except FileNotFoundError:
            print(f"❌ {db_file} not found")
            continue
        except Exception as e:
            print(f"❌ Error with {db_file}: {e}")
            continue
    else:
        print("❌ No database file found!")

if __name__ == "__main__":
    fix_database()