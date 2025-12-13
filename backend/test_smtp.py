"""
Script di test per verificare la configurazione SMTP
"""
import os
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Carica variabili ambiente
load_dotenv()

def test_smtp_connection():
    """Testa la connessione SMTP e l'invio di una email di test"""

    print("[*] Verifica configurazione SMTP...")

    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "465"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_from_email = os.getenv("SMTP_FROM_EMAIL", smtp_user)
    smtp_from_name = os.getenv("SMTP_FROM_NAME", "Safety Pro Suite")

    print(f"  Host: {smtp_host}")
    print(f"  Porta: {smtp_port}")
    print(f"  User: {smtp_user}")
    print(f"  From: {smtp_from_name} <{smtp_from_email}>")
    print()

    # Chiedi email destinatario
    to_email = input("Inserisci l'email di destinazione per il test: ").strip()

    if not to_email:
        print("[!] Email non valida")
        return

    try:
        print("\n[*] Connessione al server SMTP...")

        # Crea messaggio di test
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Test SMTP - Calcolo Esposizione Rumore"
        msg["From"] = f"{smtp_from_name} <{smtp_from_email}>"
        msg["To"] = to_email

        html_content = """
            <h2>Test SMTP</h2>
            <p>Questa e' una email di test per verificare la configurazione SMTP.</p>
            <p>Se ricevi questa email, la configurazione e' corretta!</p>
            <br>
            <p>Cordiali saluti,<br>Il team di Calcolo Esposizione Rumore</p>
        """

        html_part = MIMEText(html_content, "html")
        msg.attach(html_part)

        # Connetti e invia
        with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
            print("[+] Connesso al server SMTP")

            print("[*] Autenticazione in corso...")
            server.login(smtp_user, smtp_password)
            print("[+] Autenticazione riuscita")

            print(f"[*] Invio email a {to_email}...")
            server.send_message(msg)
            print("[+] Email inviata con successo!")

        print()
        print("=" * 60)
        print("[+] TEST COMPLETATO CON SUCCESSO!")
        print(f"   Email inviata a: {to_email}")
        print("   Controlla la casella di posta (anche spam)")
        print("=" * 60)

    except smtplib.SMTPAuthenticationError as e:
        print()
        print("[!] ERRORE DI AUTENTICAZIONE")
        print(f"   Verifica username e password SMTP")
        print(f"   Dettagli: {e}")

    except smtplib.SMTPException as e:
        print()
        print("[!] ERRORE SMTP")
        print(f"   Dettagli: {e}")

    except Exception as e:
        print()
        print("[!] ERRORE GENERICO")
        print(f"   Dettagli: {e}")

if __name__ == "__main__":
    print()
    print("=" * 60)
    print("  TEST CONFIGURAZIONE SMTP")
    print("=" * 60)
    print()
    test_smtp_connection()
