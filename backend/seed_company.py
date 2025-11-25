import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def seed_company():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        # 1. Get User ID
        cursor.execute("SELECT id FROM users WHERE email = 'test_archiving_final@example.com'")
        user = cursor.fetchone()
        
        if not user:
            print("User 'test_archiving_final@example.com' not found! Using the most recent user...")
            cursor.execute("SELECT id FROM users ORDER BY created_at DESC LIMIT 1")
            user = cursor.fetchone()
            
        if not user:
            print("No users found in DB. Cannot seed company.")
            return

        user_id = user[0]
        print(f"Seeding company for User ID: {user_id}")

        # 2. Check if company already exists
        cursor.execute("SELECT id FROM aziende WHERE partita_iva = '00000000000'")
        existing = cursor.fetchone()
        
        if existing:
            print(f"Company already exists with ID: {existing[0]}")
            # Ensure it belongs to the user
            cursor.execute("UPDATE aziende SET user_id = %s WHERE id = %s", (user_id, existing[0]))
            conn.commit()
            print(f"Updated company {existing[0]} to belong to user {user_id}")
            return

        # 3. Insert Company
        # Using a dummy P.IVA that might fail validation in API but works in DB
        cursor.execute("""
            INSERT INTO aziende 
            (ragione_sociale, partita_iva, codice_fiscale, indirizzo, citta, cap, provincia, user_id)
            VALUES 
            ('Azienda Seeded Srl', '00000000000', 'RSSMRA80A01H501Z', 'Via Seed 1', 'Milano', '20100', 'MI', %s)
            RETURNING id
        """, (user_id,))
        
        company_id = cursor.fetchone()[0]
        conn.commit()
        print(f"Successfully seeded company with ID: {company_id}")

    except Exception as e:
        print(f"Error seeding company: {e}")
    finally:
        if conn: conn.close()

if __name__ == "__main__":
    seed_company()
