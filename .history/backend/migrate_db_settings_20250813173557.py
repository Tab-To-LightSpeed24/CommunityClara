#!/usr/bin/env python3
"""
Database migration for settings functionality
"""

import sqlite3
import os
import sys

# Add the app directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from app.utils.logger import logger
except ImportError:
    # Fallback if logger import fails
    import logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

def migrate_settings():
    """Add missing settings fields to database"""
    db_path = "./safespace.db"
    
    if not os.path.exists(db_path):
        logger.info("Database doesn't exist, will be created on startup")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check existing columns
        cursor.execute("PRAGMA table_info(servers)")
        existing_columns = [row[1] for row in cursor.fetchall()]
        logger.info(f"Existing columns: {existing_columns}")
        
        # Add missing columns
        new_columns = {
            'spam_threshold': 'REAL DEFAULT 0.7',
            'harassment_threshold': 'REAL DEFAULT 0.7', 
            'warning_enabled': 'BOOLEAN DEFAULT 1',
            'escalation_enabled': 'BOOLEAN DEFAULT 1'
        }
        
        changes_made = False
        for column_name, column_def in new_columns.items():
            if column_name not in existing_columns:
                alter_sql = f"ALTER TABLE servers ADD COLUMN {column_name} {column_def}"
                cursor.execute(alter_sql)
                logger.info(f"✅ Added column: {column_name}")
                changes_made = True
            else:
                logger.info(f"⏭️ Column already exists: {column_name}")
        
        if changes_made:
            conn.commit()
            logger.info("✅ Settings migration completed successfully")
        else:
            logger.info("ℹ️ No migration needed - all columns exist")
        
        conn.close()
        
    except Exception as e:
        logger.error(f"❌ Settings migration failed: {e}")
        raise

if __name__ == "__main__":
    print("🔄 Starting settings migration...")
    migrate_settings()
    print("✅ Migration completed!")