#!/usr/bin/env python3
"""
Database migration script to ensure compatibility
"""

import sqlite3
import os
from app.utils.logger import logger

def migrate_database():
    """Migrate database to ensure compatibility"""
    db_path = "./safespace.db"
    
    if not os.path.exists(db_path):
        logger.info("Database doesn't exist, will be created on startup")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if problematic columns exist and remove them if they do
        cursor.execute("PRAGMA table_info(violations)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if 'message_content' in columns or 'channel_name' in columns:
            logger.info("Found problematic columns, recreating violations table...")
            
            # Backup existing data
            cursor.execute("""
                CREATE TABLE violations_backup AS 
                SELECT id, server_id, user_id, channel_id, violation_type, 
                       confidence_score, action_taken, false_positive, 
                       appealed, appeal_successful, created_at
                FROM violations
            """)
            
            # Drop old table
            cursor.execute("DROP TABLE violations")
            
            # Create new table with correct schema
            cursor.execute("""
                CREATE TABLE violations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    server_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    channel_id TEXT NOT NULL,
                    violation_type TEXT NOT NULL,
                    confidence_score REAL NOT NULL,
                    action_taken TEXT NOT NULL,
                    false_positive BOOLEAN,
                    appealed BOOLEAN DEFAULT 0,
                    appeal_successful BOOLEAN,
                    created_at DATETIME,
                    FOREIGN KEY(server_id) REFERENCES servers(id),
                    FOREIGN KEY(user_id) REFERENCES users(id)
                )
            """)
            
            # Restore data
            cursor.execute("""
                INSERT INTO violations 
                SELECT * FROM violations_backup
            """)
            
            # Drop backup table
            cursor.execute("DROP TABLE violations_backup")
            
            logger.info("✅ Database migration completed successfully")
        else:
            logger.info("Database schema is already correct")
        
        conn.commit()
        conn.close()
        
    except Exception as e:
        logger.error(f"❌ Database migration failed: {e}")
        raise

if __name__ == "__main__":
    migrate_database()