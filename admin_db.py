"""
Script di amministrazione database
Permette di visualizzare ed eliminare utenti e dati collegati
"""
import psycopg2
from psycopg2.extras import RealDictCursor

# URL del database (dalla variabile d'ambiente di Dokploy)
DATABASE_URL = "postgresql://postgres:2%23NqAWWDX6ZunW5vlG7N@calcoloesposizionerumoremain-rumoredb-zqdpxr:5432/rumore-db"

def connetti_db():
    """Connetti al database"""
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def mostra_utenti():
    """Mostra tutti gli utenti registrati"""
    conn = connetti_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, email, nome, created_at, last_login
        FROM users
        ORDER BY created_at DESC
    """)

    utenti = cursor.fetchall()

    print("\n" + "="*80)
    print("UTENTI REGISTRATI")
    print("="*80)

    for utente in utenti:
        print(f"\nID: {utente['id']}")
        print(f"Email: {utente['email']}")
        print(f"Nome: {utente['nome']}")
        print(f"Creato: {utente['created_at']}")
        print(f"Ultimo login: {utente['last_login']}")
        print("-" * 80)

    cursor.close()
    conn.close()

    return utenti

def conta_dati_utente(user_id):
    """Conta quanti dati ha un utente"""
    conn = connetti_db()
    cursor = conn.cursor()

    # Conta aziende
    cursor.execute("SELECT COUNT(*) as count FROM aziende WHERE user_id = %s", (user_id,))
    aziende = cursor.fetchone()['count']

    # Conta valutazioni esposizione
    cursor.execute("SELECT COUNT(*) as count FROM valutazioni_esposizione WHERE user_id = %s", (user_id,))
    esposizioni = cursor.fetchone()['count']

    # Conta valutazioni DPI
    cursor.execute("SELECT COUNT(*) as count FROM valutazioni_dpi WHERE user_id = %s", (user_id,))
    dpi = cursor.fetchone()['count']

    cursor.close()
    conn.close()

    return aziende, esposizioni, dpi

def elimina_utente(user_id):
    """Elimina un utente e TUTTI i suoi dati (CASCADE)"""
    conn = connetti_db()
    cursor = conn.cursor()

    # Prima recupera info utente
    cursor.execute("SELECT email, nome FROM users WHERE id = %s", (user_id,))
    utente = cursor.fetchone()

    if not utente:
        print(f"❌ Utente con ID {user_id} non trovato!")
        cursor.close()
        conn.close()
        return

    # Conta i dati
    aziende, esposizioni, dpi = conta_dati_utente(user_id)

    print(f"\n⚠️  ATTENZIONE! Stai per eliminare:")
    print(f"   Utente: {utente['nome']} ({utente['email']})")
    print(f"   - {aziende} aziende")
    print(f"   - {esposizioni} valutazioni esposizione")
    print(f"   - {dpi} valutazioni DPI")
    print(f"   - Tutte le misurazioni collegate")

    conferma = input("\n❓ Sei sicuro? Scrivi 'ELIMINA' per confermare: ")

    if conferma != "ELIMINA":
        print("❌ Operazione annullata")
        cursor.close()
        conn.close()
        return

    # Elimina l'utente (CASCADE eliminerà tutto il resto)
    cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
    conn.commit()

    print(f"✅ Utente {utente['email']} e tutti i suoi dati sono stati eliminati!")

    cursor.close()
    conn.close()

def mostra_statistiche():
    """Mostra statistiche generali del database"""
    conn = connetti_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as count FROM users")
    tot_utenti = cursor.fetchone()['count']

    cursor.execute("SELECT COUNT(*) as count FROM aziende")
    tot_aziende = cursor.fetchone()['count']

    cursor.execute("SELECT COUNT(*) as count FROM valutazioni_esposizione")
    tot_esposizioni = cursor.fetchone()['count']

    cursor.execute("SELECT COUNT(*) as count FROM valutazioni_dpi")
    tot_dpi = cursor.fetchone()['count']

    cursor.execute("SELECT COUNT(*) as count FROM misurazioni")
    tot_misurazioni = cursor.fetchone()['count']

    print("\n" + "="*80)
    print("STATISTICHE DATABASE")
    print("="*80)
    print(f"👥 Utenti: {tot_utenti}")
    print(f"🏢 Aziende: {tot_aziende}")
    print(f"📊 Valutazioni esposizione: {tot_esposizioni}")
    print(f"🎧 Valutazioni DPI: {tot_dpi}")
    print(f"📏 Misurazioni: {tot_misurazioni}")
    print("="*80)

    cursor.close()
    conn.close()

def menu():
    """Menu principale"""
    while True:
        print("\n" + "="*80)
        print("AMMINISTRAZIONE DATABASE - Calcolo Esposizione Rumore")
        print("="*80)
        print("1. Mostra tutti gli utenti")
        print("2. Mostra statistiche database")
        print("3. Elimina utente e tutti i suoi dati")
        print("4. Esci")
        print("="*80)

        scelta = input("\nScegli un'opzione: ")

        if scelta == "1":
            mostra_utenti()
        elif scelta == "2":
            mostra_statistiche()
        elif scelta == "3":
            utenti = mostra_utenti()
            if utenti:
                try:
                    user_id = int(input("\n❓ Inserisci l'ID dell'utente da eliminare: "))
                    elimina_utente(user_id)
                except ValueError:
                    print("❌ ID non valido!")
        elif scelta == "4":
            print("\n👋 Arrivederci!")
            break
        else:
            print("❌ Opzione non valida!")

if __name__ == "__main__":
    try:
        print("\n🔌 Connessione al database...")
        conn = connetti_db()
        conn.close()
        print("✅ Connessione riuscita!")
        menu()
    except Exception as e:
        print(f"❌ Errore di connessione: {e}")
        print("\n💡 Verifica che DATABASE_URL sia corretto nello script")
