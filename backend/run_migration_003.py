#!/usr/bin/env python3
"""
Run Migration 003: Subscription System
Execute this script to create subscription tables
"""

import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def run_migration():
    """Execute the 003 migration script"""

    print("=" * 60)
    print("  MIGRATION 003: Subscription System")
    print("=" * 60)

    # Get database URL
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ ERROR: DATABASE_URL not found in environment")
        return False

    print(f"\n📦 Connecting to database...")

    try:
        # Connect to database
        conn = psycopg2.connect(database_url)
        conn.autocommit = False
        cursor = conn.cursor()

        print("✅ Connected successfully")

        # Read migration file
        migration_file = os.path.join(os.path.dirname(__file__), "migrations", "003_create_subscriptions.sql")
        print(f"\n📄 Reading migration file: {migration_file}")

        with open(migration_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()

        print(f"✅ Migration file loaded ({len(sql_content)} characters)")

        # Execute migration
        print("\n🚀 Executing migration...")
        cursor.execute(sql_content)

        # Commit transaction
        conn.commit()
        print("✅ Migration executed successfully")

        # Verify tables created
        cursor.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name LIKE '%subscription%'
            ORDER BY table_name;
        """)

        tables = cursor.fetchall()
        print("\n📋 Subscription tables created:")
        for table in tables:
            print(f"   - {table[0]}")

        # Verify plans inserted
        cursor.execute("SELECT name, display_name, price_monthly FROM subscription_plans ORDER BY sort_order;")
        plans = cursor.fetchall()
        print("\n💰 Subscription plans available:")
        for plan in plans:
            print(f"   - {plan[1]}: €{plan[2]}/month")

        cursor.close()
        conn.close()

        print("\n" + "=" * 60)
        print("  ✅ MIGRATION COMPLETED SUCCESSFULLY")
        print("=" * 60)

        return True

    except Exception as e:
        print(f"\n❌ ERROR during migration:")
        print(f"   {str(e)}")
        if conn:
            conn.rollback()
            conn.close()
        return False


if __name__ == "__main__":
    success = run_migration()
    exit(0 if success else 1)
