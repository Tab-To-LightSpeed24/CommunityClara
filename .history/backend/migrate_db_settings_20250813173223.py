#!/usr/bin/env python3
"""
Database migration for settings functionality
"""

import sqlite3
import os
from app.utils.logger import logger

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
        
        # Add missing columns
        new_columns = {
            'spam_threshold': 'REAL DEFAULT 0.7',
            'harassment_threshold': 'REAL DEFAULT 0.7',
            'warning_enabled': 'BOOLEAN DEFAULT 1',
            'escalation_enabled': 'BOOLEAN DEFAULT 1'
        }
        
        for column_name, column_def in new_columns.items():
            if column_name not in existing_columns:
                alter_sql = f"ALTER TABLE servers ADD COLUMN {column_name} {column_def}"
                cursor.execute(alter_sql)
                logger.info(f"✅ Added column: {column_name}")
            else:
                logger.info(f"⏭️ Column already exists: {column_name}")
        
        conn.commit()
        conn.close()
        
        logger.info("✅ Settings migration completed successfully")
        
    except Exception as e:
        logger.error(f"❌ Settings migration failed: {e}")
        raise

if __name__ == "__main__":
    migrate_settings()