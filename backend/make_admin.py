"""
Script per rendere un utente amministratore
Esegui: python make_admin.py
"""
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import sys

# Leggi DATABASE_URL dalla variabile d'ambiente
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL environment variable not set!")
    print("\nPer impostare DATABASE_URL:")
    print("Windows: set DATABASE_URL=postgresql://user:password@host:port/database")
    print("Linux/Mac: export DATABASE_URL=postgresql://user:password@host:port/database")
    print("\nOppure modifica questo file e inserisci direttamente la connection string:")
    print("DATABASE_URL = \"postgresql://user:password@host:port/database\"")
    exit(1)

def mostra_utenti(cursor):
    """Mostra tutti gli utenti"""
    cursor.execute("""
        SELECT id, email, nome, is_admin, created_at
        FROM users
        ORDER BY created_at DESC
    """)

    users = cursor.fetchall()

    if not users:
        print("❌ Nessun utente trovato nel database")
        return []

    print("\n" + "="*80)
    print("UTENTI REGISTRATI")
    print("="*80)
    print(f"{'ID':<5} {'Email':<30} {'Nome':<20} {'Admin':<8} {'Creato il'}")
    print("-"*80)

    for user in users:
        admin_status = "✓ Sì" if user['is_admin'] else "  No"
        created = user['created_at'].strftime("%Y-%m-%d %H:%M") if user['created_at'] else "N/A"
        print(f"{user['id']:<5} {user['email']:<30} {user['nome']:<20} {admin_status:<8} {created}")

    print("="*80)
    return users

def rendi_admin(cursor, conn, user_id):
    """Rendi un utente amministratore"""
    # Verifica che l'utente esista
    cursor.execute("SELECT id, email, nome, is_admin FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()

    if not user:
        print(f"❌ Utente con ID {user_id} non trovato")
        return False

    if user['is_admin']:
        print(f"ℹ️  L'utente {user['nome']} ({user['email']}) è già amministratore")
        return True

    # Conferma
    print(f"\n⚠️  Stai per rendere amministratore:")
    print(f"   ID: {user['id']}")
    print(f"   Nome: {user['nome']}")
    print(f"   Email: {user['email']}")
    print()
    conferma = input("Confermi? (scrivi SI per confermare): ")

    if conferma.upper() != "SI":
        print("❌ Operazione annullata")
        return False

    # Aggiorna l'utente
    cursor.execute("UPDATE users SET is_admin = TRUE WHERE id = %s", (user_id,))
    conn.commit()

    print(f"✅ {user['nome']} ({user['email']}) è ora amministratore!")
    return True

def rimuovi_admin(cursor, conn, user_id):
    """Rimuovi i privilegi di amministratore da un utente"""
    # Verifica che l'utente esista
    cursor.execute("SELECT id, email, nome, is_admin FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()

    if not user:
        print(f"❌ Utente con ID {user_id} non trovato")
        return False

    if not user['is_admin']:
        print(f"ℹ️  L'utente {user['nome']} ({user['email']}) non è amministratore")
        return True

    # Conta gli admin totali
    cursor.execute("SELECT COUNT(*) as count FROM users WHERE is_admin = TRUE")
    admin_count = cursor.fetchone()['count']

    if admin_count <= 1:
        print("❌ Non puoi rimuovere l'ultimo amministratore!")
        return False

    # Conferma
    print(f"\n⚠️  Stai per rimuovere i privilegi di amministratore da:")
    print(f"   ID: {user['id']}")
    print(f"   Nome: {user['nome']}")
    print(f"   Email: {user['email']}")
    print()
    conferma = input("Confermi? (scrivi SI per confermare): ")

    if conferma.upper() != "SI":
        print("❌ Operazione annullata")
        return False

    # Aggiorna l'utente
    cursor.execute("UPDATE users SET is_admin = FALSE WHERE id = %s", (user_id,))
    conn.commit()

    print(f"✅ {user['nome']} ({user['email']}) non è più amministratore")
    return True

def menu_principale():
    """Menu principale"""
    print("\n" + "="*50)
    print("  GESTIONE AMMINISTRATORI")
    print("="*50)

    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        while True:
            users = mostra_utenti(cursor)

            if not users:
                break

            print("\nCosa vuoi fare?")
            print("1. Rendi un utente amministratore")
            print("2. Rimuovi privilegi admin da un utente")
            print("3. Aggiorna lista")
            print("0. Esci")

            scelta = input("\nScelta: ").strip()

            if scelta == "0":
                print("\n👋 Arrivederci!")
                break
            elif scelta == "1":
                user_id = input("\nInserisci l'ID dell'utente da rendere admin: ").strip()
                if user_id.isdigit():
                    rendi_admin(cursor, conn, int(user_id))
                else:
                    print("❌ ID non valido")
            elif scelta == "2":
                user_id = input("\nInserisci l'ID dell'utente da cui rimuovere i privilegi admin: ").strip()
                if user_id.isdigit():
                    rimuovi_admin(cursor, conn, int(user_id))
                else:
                    print("❌ ID non valido")
            elif scelta == "3":
                continue
            else:
                print("❌ Scelta non valida")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"❌ Errore: {e}")
        import traceback
        traceback.print_exc()
        return False

    return True

if __name__ == "__main__":
    print("\n🔧 Script per gestione amministratori")
    print("📝 Database: " + ("✓ Configurato" if DATABASE_URL else "❌ Non configurato"))

    if DATABASE_URL:
        menu_principale()
