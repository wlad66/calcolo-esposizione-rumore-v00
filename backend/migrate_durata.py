"""
Script per modificare il tipo di dato della colonna durata da INTEGER a DECIMAL
"""
import psycopg2
import os

# Leggi DATABASE_URL dalla variabile d'ambiente
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL environment variable not set!")
    DATABASE_URL = input("Inserisci DATABASE_URL manualmente: ")

print("Connecting to database...")

try:
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()

    print("Modifying durata column from INTEGER to DECIMAL(10,2)...")

    # Modifica il tipo di dato della colonna durata
    cursor.execute("""
        ALTER TABLE misurazioni
        ALTER COLUMN durata TYPE DECIMAL(10,2) USING durata::DECIMAL(10,2);
    """)

    conn.commit()
    print("Migration completed successfully!")

    cursor.close()
    conn.close()

except Exception as e:
    print(f"Migration failed: {e}")
    exit(1)
