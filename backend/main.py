from fastapi import FastAPI, HTTPException, Depends, Header, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from contextlib import asynccontextmanager
from typing import List, Optional
import os
import secrets
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from auth import hash_password, verify_password, create_access_token, decode_access_token
import resend
from storage import storage

load_dotenv()

# ==================== MODELLI PYDANTIC ====================

# Modelli Autenticazione
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    nome: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class User(BaseModel):
    id: int
    email: str
    nome: str
    is_admin: bool
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

class AziendaBase(BaseModel):
    ragione_sociale: str
    partita_iva: str
    codice_fiscale: str
    indirizzo: str
    citta: str
    cap: str
    provincia: str
    telefono: Optional[str] = None
    email: Optional[str] = None
    rappresentante_legale: Optional[str] = None

class AziendaCreate(AziendaBase):
    pass

class AziendaUpdate(BaseModel):
    ragione_sociale: Optional[str] = None
    partita_iva: Optional[str] = None
    codice_fiscale: Optional[str] = None
    indirizzo: Optional[str] = None
    citta: Optional[str] = None
    cap: Optional[str] = None
    provincia: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    rappresentante_legale: Optional[str] = None

class Azienda(AziendaBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MisurazioneAPI(BaseModel):
    id: Optional[int] = None
    attivita: str
    leq: str
    durata: str
    lpicco: str

class ValutazioneEsposizioneCreate(BaseModel):
    azienda_id: Optional[int] = None
    mansione: str
    reparto: str
    misurazioni: List[MisurazioneAPI]
    lex: str
    lpicco: str
    classe_rischio: str

class ValutazioneEsposizione(BaseModel):
    id: int
    azienda_id: Optional[int]
    mansione: str
    reparto: str
    misurazioni: List[MisurazioneAPI]
    lex: str
    lpicco: str
    classe_rischio: str
    created_at: datetime

class ValoriHMLAPI(BaseModel):
    h: str
    m: str
    l: str

class ValutazioneDPICreate(BaseModel):
    azienda_id: Optional[int] = None
    mansione: str
    reparto: str
    dpi_selezionato: str
    valori_hml: ValoriHMLAPI
    lex_per_dpi: str
    pnr: Optional[str] = None
    leff: Optional[str] = None
    protezione_adeguata: Optional[str] = None

class ValutazioneDPI(BaseModel):
    id: int
    azienda_id: Optional[int]
    mansione: str
    reparto: str
    dpi_selezionato: str
    valori_hml: ValoriHMLAPI
    lex_per_dpi: str
    pnr: Optional[str]
    leff: Optional[str]
    protezione_adeguata: Optional[str]
    created_at: datetime

class Documento(BaseModel):
    id: int
    valutazione_esposizione_id: Optional[int]
    valutazione_dpi_id: Optional[int]
    nome_file: str
    url: str
    tipo_file: str
    created_at: datetime

# ==================== DATABASE ====================

def get_db_connection():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL environment variable is not set")
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def get_db():
    database_url = os.getenv("DATABASE_URL")

    # Debug: stampa lo stato della variabile d'ambiente
    print(f"DATABASE_URL: {database_url}")

    if not database_url:
        raise ValueError(
            "DATABASE_URL environment variable is not set. "
            "Please configure it in Dokploy Environment Settings."
        )

    try:
        conn = psycopg2.connect(
            database_url,
            cursor_factory=RealDictCursor
        )
    except Exception as e:
        print(f"Database connection error: {e}")
        print(f"Attempted to connect with URL: {database_url}")
        raise

    try:
        yield conn
    finally:
        conn.close()

# ==================== FASTAPI APP ====================

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Server avviato")
    yield
    print("👋 Server arrestato")

app = FastAPI(
    title="API Calcolo Esposizione Rumore",
    description="API per gestione valutazioni rischio rumore",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
cors_origins = os.getenv("CORS_ORIGINS")
if not cors_origins:
    print("⚠️  WARNING: CORS_ORIGINS not set. Using wildcard '*' (unsafe for production!)")
    cors_origins = "*"

origins = cors_origins.split(",") if cors_origins != "*" else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== MIDDLEWARE AUTENTICAZIONE ====================

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), conn=Depends(get_db)):
    """
    Middleware per verificare il token JWT e ottenere l'utente corrente
    """
    token = credentials.credentials
    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Token non valido o scaduto")

    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token non valido")

    # Verifica che l'utente esista nel database
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT id, email, nome, is_admin, created_at FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    cursor.close()

    if not user:
        raise HTTPException(status_code=401, detail="Utente non trovato")

    return dict(user)

# ==================== ENDPOINTS AUTENTICAZIONE ====================

@app.post("/api/auth/register", response_model=TokenResponse)
def register(user_data: UserRegister, conn=Depends(get_db)):
    """
    Registra un nuovo utente
    """
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Verifica se l'email esiste già
        cursor.execute("SELECT id FROM users WHERE email = %s", (user_data.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email già registrata")

        # Hash della password
        password_hash = hash_password(user_data.password)

        # Inserisci nuovo utente
        cursor.execute("""
            INSERT INTO users (email, password_hash, nome)
            VALUES (%s, %s, %s)
            RETURNING id, email, nome, is_admin, created_at
        """, (user_data.email, password_hash, user_data.nome))

        user = cursor.fetchone()
        conn.commit()

        # Crea token JWT
        access_token = create_access_token(data={"user_id": user["id"], "email": user["email"]})

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        }

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(f"Errore durante registrazione: {e}")
        raise HTTPException(status_code=500, detail="Errore durante la registrazione")
    finally:
        cursor.close()

@app.post("/api/auth/login", response_model=TokenResponse)
def login(credentials: UserLogin, conn=Depends(get_db)):
    """
    Login utente con email e password
    """
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Cerca utente per email
        cursor.execute("""
            SELECT id, email, nome, is_admin, password_hash, created_at
            FROM users WHERE email = %s
        """, (credentials.email,))

        user = cursor.fetchone()

        if not user or not verify_password(credentials.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Email o password errati")

        # Aggiorna last_login
        cursor.execute("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = %s", (user["id"],))
        conn.commit()

        # Crea token JWT
        access_token = create_access_token(data={"user_id": user["id"], "email": user["email"]})

        # Rimuovi password_hash dalla risposta
        user_response = {
            "id": user["id"],
            "email": user["email"],
            "nome": user["nome"],
            "is_admin": user["is_admin"],
            "created_at": user["created_at"]
        }

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_response
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Errore durante login: {e}")
        raise HTTPException(status_code=500, detail="Errore durante il login")
    finally:
        cursor.close()

@app.get("/api/auth/me", response_model=User)
def get_me(current_user: dict = Depends(get_current_user)):
    """
    Ottieni informazioni sull'utente corrente
    """
    return current_user

@app.post("/api/auth/forgot-password")
def forgot_password(request: ForgotPasswordRequest, conn=Depends(get_db)):
    """
    Richiedi reset password - genera token e invia email
    """
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Verifica che l'utente esista
        cursor.execute("SELECT id, email, nome FROM users WHERE email = %s", (request.email,))
        user = cursor.fetchone()

        if not user:
            # Per sicurezza, non rivelare se l'email esiste o meno
            return {"message": "Se l'email esiste, riceverai un link per reimpostare la password"}

        # Genera token sicuro
        token = secrets.token_urlsafe(32)
        expires_at = datetime.now() + timedelta(hours=1)  # Token valido per 1 ora

        # Salva token nel database
        cursor.execute("""
            INSERT INTO password_reset_tokens (user_id, token, expires_at)
            VALUES (%s, %s, %s)
        """, (user["id"], token, expires_at))
        conn.commit()

        # Configura Resend
        resend.api_key = os.getenv("RESEND_API_KEY")

        # URL per reset (in produzione sarà il dominio reale)
        reset_url = f"{os.getenv('FRONTEND_URL', 'http://72.61.189.136')}/reset-password?token={token}"

        # Invia email
        try:
            resend.Emails.send({
                "from": os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev"),
                "to": user["email"],
                "subject": "Recupero Password - Calcolo Esposizione Rumore",
                "html": f"""
                    <h2>Recupero Password</h2>
                    <p>Ciao {user['nome']},</p>
                    <p>Hai richiesto di reimpostare la tua password.</p>
                    <p>Clicca sul link seguente per procedere:</p>
                    <p><a href="{reset_url}">Reimposta Password</a></p>
                    <p>Il link è valido per 1 ora.</p>
                    <p>Se non hai richiesto tu questa operazione, ignora questa email.</p>
                    <br>
                    <p>Cordiali saluti,<br>Il team di Calcolo Esposizione Rumore</p>
                """
            })
        except Exception as email_error:
            print(f"Errore invio email: {email_error}")
            # Non bloccare l'operazione se l'email fallisce
            # In sviluppo, stampa il link nel log
            print(f"🔗 Link reset password: {reset_url}")

        return {"message": "Se l'email esiste, riceverai un link per reimpostare la password"}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(f"Errore durante richiesta reset password: {e}")
        raise HTTPException(status_code=500, detail="Errore durante la richiesta di reset password")
    finally:
        cursor.close()

@app.post("/api/auth/reset-password")
def reset_password(request: ResetPasswordRequest, conn=Depends(get_db)):
    """
    Reimposta password usando il token ricevuto via email
    """
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Verifica token
        cursor.execute("""
            SELECT user_id, expires_at, used
            FROM password_reset_tokens
            WHERE token = %s
        """, (request.token,))

        token_data = cursor.fetchone()

        if not token_data:
            raise HTTPException(status_code=400, detail="Token non valido")

        if token_data["used"]:
            raise HTTPException(status_code=400, detail="Token già utilizzato")

        if datetime.now() > token_data["expires_at"]:
            raise HTTPException(status_code=400, detail="Token scaduto")

        # Hash nuova password
        new_password_hash = hash_password(request.new_password)

        # Aggiorna password
        cursor.execute("""
            UPDATE users
            SET password_hash = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (new_password_hash, token_data["user_id"]))

        # Marca token come usato
        cursor.execute("""
            UPDATE password_reset_tokens
            SET used = TRUE
            WHERE token = %s
        """, (request.token,))

        conn.commit()

        return {"message": "Password reimpostata con successo"}

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(f"Errore durante reset password: {e}")
        raise HTTPException(status_code=500, detail="Errore durante il reset della password")
    finally:
        cursor.close()

# ==================== ENDPOINTS UPLOAD ====================

@app.post("/api/upload")
async def upload_file(
    file: UploadFile, 
    valutazione_id: Optional[str] = Header(None),
    tipo_valutazione: Optional[str] = Header(None),
    current_user: dict = Depends(get_current_user)
):
    try:
        # Upload su B2
        file_url = storage.upload_file(file)
        
        # Se ci sono metadati di valutazione, salva nel DB
        if valutazione_id and tipo_valutazione:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            try:
                # Determina colonne in base al tipo
                col_valutazione = "valutazione_esposizione_id" if tipo_valutazione == "esposizione" else "valutazione_dpi_id"
                
                # Determina tipo file
                ext = file.filename.split('.')[-1].lower()
                tipo_file = 'pdf' if ext == 'pdf' else 'word' if ext in ['doc', 'docx'] else 'altro'
                
                cursor.execute(
                    f"""
                    INSERT INTO documenti 
                    ({col_valutazione}, nome_file, url, tipo_file, user_id)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id
                    """,
                    (valutazione_id, file.filename, file_url, tipo_file, current_user['id'])
                )
                conn.commit()
                doc_id = cursor.fetchone()['id']
                print(f"Documento salvato nel DB con ID: {doc_id}")
                
            except Exception as e:
                print(f"Errore salvataggio DB: {e}")
                # Non blocchiamo l'upload se fallisce il salvataggio DB, ma lo logghiamo
            finally:
                cursor.close()
                conn.close()
            
        return {"url": file_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/valutazioni/{tipo}/{id}/documenti", response_model=List[Documento])
async def get_documenti_valutazione(tipo: str, id: int, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        col_valutazione = "valutazione_esposizione_id" if tipo == "esposizione" else "valutazione_dpi_id"
        
        cursor.execute(
            f"""
            SELECT * FROM documenti 
            WHERE {col_valutazione} = %s 
            ORDER BY created_at DESC
            """,
            (id,)
        )
        documenti = cursor.fetchall()
        return documenti
    finally:
        cursor.close()
        conn.close()

@app.delete("/api/documenti/{id}")
async def delete_documento(id: int, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Verifica proprietà
        cursor.execute("SELECT user_id FROM documenti WHERE id = %s", (id,))
        doc = cursor.fetchone()

        if not doc:
            raise HTTPException(status_code=404, detail="Documento non trovato")

        if doc['user_id'] != current_user['id'] and not current_user.get('is_admin'):
            raise HTTPException(status_code=403, detail="Non autorizzato")

        cursor.execute("DELETE FROM documenti WHERE id = %s", (id,))
        conn.commit()
        return {"message": "Documento eliminato"}
    finally:
        cursor.close()
        conn.close()

@app.get("/api/documenti/{id}/download")
async def download_documento(id: int, current_user: dict = Depends(get_current_user)):
    """
    Proxy download: scarica il file da B2 e lo serve al client
    Mantiene il bucket privato e sicuro
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Get document info
        cursor.execute("SELECT url, nome_file, user_id FROM documenti WHERE id = %s", (id,))
        doc = cursor.fetchone()

        if not doc:
            raise HTTPException(status_code=404, detail="Documento non trovato")

        # Verify ownership or admin
        if doc['user_id'] != current_user['id'] and not current_user.get('is_admin'):
            raise HTTPException(status_code=403, detail="Non autorizzato")

        # Extract file key from URL
        # URL format: https://rumore-storage.s3.eu-central-003.backblazeb2.com/filename.ext
        file_key = doc['url'].split('/')[-1]

        # Download file from B2
        try:
            import io
            file_obj = io.BytesIO()
            storage.s3_client.download_fileobj(storage.bucket_name, file_key, file_obj)
            file_obj.seek(0)

            # Determina content type dal nome file
            content_type = "application/octet-stream"
            if doc['nome_file'].lower().endswith('.pdf'):
                content_type = "application/pdf"
            elif doc['nome_file'].lower().endswith(('.png', '.jpg', '.jpeg')):
                content_type = f"image/{doc['nome_file'].split('.')[-1].lower()}"

            # Restituisci il file come stream
            return StreamingResponse(
                file_obj,
                media_type=content_type,
                headers={
                    "Content-Disposition": f'attachment; filename="{doc["nome_file"]}"'
                }
            )
        except Exception as e:
            print(f"Error downloading from B2: {e}")
            raise HTTPException(status_code=500, detail="Errore durante il download del file")
    finally:
        cursor.close()
        conn.close()

# ==================== ADMIN MIDDLEWARE ====================

def get_admin_user(current_user: dict = Depends(get_current_user)):
    """
    Middleware per verificare che l'utente sia un amministratore
    """
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Accesso negato. Permessi di amministratore richiesti.")
    return current_user

# ==================== ENDPOINTS ADMIN ====================

@app.get("/api/admin/users")
def get_all_users(current_user: dict = Depends(get_admin_user), conn=Depends(get_db)):
    """
    Ottieni tutti gli utenti con i conteggi dei loro dati
    Solo per amministratori
    """
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Ottieni tutti gli utenti
        cursor.execute("""
            SELECT
                u.id,
                u.email,
                u.nome,
                u.is_admin,
                u.created_at,
                u.last_login,
                COUNT(DISTINCT a.id) as num_aziende,
                COUNT(DISTINCT ve.id) as num_valutazioni_esposizione,
                COUNT(DISTINCT vd.id) as num_valutazioni_dpi
            FROM users u
            LEFT JOIN aziende a ON a.user_id = u.id
            LEFT JOIN valutazioni_esposizione ve ON ve.user_id = u.id
            LEFT JOIN valutazioni_dpi vd ON vd.user_id = u.id
            GROUP BY u.id, u.email, u.nome, u.is_admin, u.created_at, u.last_login
            ORDER BY u.created_at DESC
        """)

        users = cursor.fetchall()
        return [dict(user) for user in users]

    except Exception as e:
        print(f"Errore durante recupero utenti: {e}")
        raise HTTPException(status_code=500, detail="Errore durante il recupero degli utenti")
    finally:
        cursor.close()

@app.delete("/api/admin/users/{user_id}")
def delete_user(user_id: int, current_user: dict = Depends(get_admin_user), conn=Depends(get_db)):
    """
    Elimina un utente e tutti i suoi dati collegati (CASCADE)
    Solo per amministratori
    """
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Verifica che l'utente non stia eliminando se stesso
        if user_id == current_user["id"]:
            raise HTTPException(status_code=400, detail="Non puoi eliminare il tuo stesso account")

        # Verifica che l'utente esista
        cursor.execute("SELECT id, email, nome FROM users WHERE id = %s", (user_id,))
        user_to_delete = cursor.fetchone()

        if not user_to_delete:
            raise HTTPException(status_code=404, detail="Utente non trovato")

        # Ottieni conteggi dati prima di eliminare
        cursor.execute("""
            SELECT
                COUNT(DISTINCT a.id) as num_aziende,
                COUNT(DISTINCT ve.id) as num_valutazioni_esposizione,
                COUNT(DISTINCT vd.id) as num_valutazioni_dpi
            FROM users u
            LEFT JOIN aziende a ON a.user_id = u.id
            LEFT JOIN valutazioni_esposizione ve ON ve.user_id = u.id
            LEFT JOIN valutazioni_dpi vd ON vd.user_id = u.id
            WHERE u.id = %s
            GROUP BY u.id
        """, (user_id,))

        counts = cursor.fetchone()

        # Elimina l'utente (CASCADE eliminerà automaticamente tutti i dati collegati)
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()

        return {
            "message": "Utente eliminato con successo",
            "deleted_user": {
                "id": user_to_delete["id"],
                "email": user_to_delete["email"],
                "nome": user_to_delete["nome"]
            },
            "deleted_data": {
                "aziende": counts["num_aziende"] if counts else 0,
                "valutazioni_esposizione": counts["num_valutazioni_esposizione"] if counts else 0,
                "valutazioni_dpi": counts["num_valutazioni_dpi"] if counts else 0
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(f"Errore durante eliminazione utente: {e}")
        raise HTTPException(status_code=500, detail="Errore durante l'eliminazione dell'utente")
    finally:
        cursor.close()

# ==================== ENDPOINTS AZIENDE ====================

@app.post("/api/aziende", response_model=dict)
def create_azienda(azienda: AziendaCreate, current_user: dict = Depends(get_current_user), conn=Depends(get_db)):
    """Crea una nuova azienda"""
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO aziende (
                user_id, ragione_sociale, partita_iva, codice_fiscale,
                indirizzo, citta, cap, provincia,
                telefono, email, rappresentante_legale
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, created_at
        """, (
            current_user["id"],
            azienda.ragione_sociale, azienda.partita_iva, azienda.codice_fiscale,
            azienda.indirizzo, azienda.citta, azienda.cap, azienda.provincia,
            azienda.telefono, azienda.email, azienda.rappresentante_legale
        ))
        result = cursor.fetchone()
        conn.commit()
        return {
            "id": result["id"],
            "created_at": result["created_at"].isoformat(),
            "message": "Azienda creata con successo"
        }
    except psycopg2.IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail="Partita IVA già esistente")
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

@app.get("/api/aziende", response_model=List[Azienda])
def list_aziende(limit: int = 100, current_user: dict = Depends(get_current_user), conn=Depends(get_db)):
    """Lista tutte le aziende dell'utente corrente"""
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT * FROM aziende WHERE user_id = %s ORDER BY ragione_sociale LIMIT %s",
            (current_user["id"], limit)
        )
        return cursor.fetchall()
    finally:
        cursor.close()

@app.get("/api/aziende/{azienda_id}", response_model=Azienda)
def get_azienda(azienda_id: int, current_user: dict = Depends(get_current_user), conn=Depends(get_db)):
    """Ottieni dettagli azienda"""
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT * FROM aziende WHERE id = %s AND user_id = %s",
            (azienda_id, current_user["id"])
        )
        azienda = cursor.fetchone()
        if not azienda:
            raise HTTPException(status_code=404, detail="Azienda non trovata")
        return azienda
    finally:
        cursor.close()

@app.put("/api/aziende/{azienda_id}", response_model=dict)
def update_azienda(azienda_id: int, azienda: AziendaUpdate, current_user: dict = Depends(get_current_user), conn=Depends(get_db)):
    """Aggiorna azienda"""
    cursor = conn.cursor()
    try:
        fields = []
        values = []
        for field, value in azienda.model_dump(exclude_unset=True).items():
            if value is not None:
                fields.append(f"{field} = %s")
                values.append(value)

        if not fields:
            return {"message": "Nessun campo da aggiornare"}

        values.extend([azienda_id, current_user["id"]])
        query = f"UPDATE aziende SET {', '.join(fields)} WHERE id = %s AND user_id = %s"
        cursor.execute(query, values)
        conn.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Azienda non trovata")

        return {"message": "Azienda aggiornata con successo"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

@app.delete("/api/aziende/{azienda_id}", response_model=dict)
def delete_azienda(azienda_id: int, current_user: dict = Depends(get_current_user), conn=Depends(get_db)):
    """Elimina azienda"""
    cursor = conn.cursor()
    try:
        cursor.execute(
            "DELETE FROM aziende WHERE id = %s AND user_id = %s",
            (azienda_id, current_user["id"])
        )
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Azienda non trovata")
        return {"message": "Azienda eliminata con successo"}
    finally:
        cursor.close()

# ==================== ENDPOINTS VALUTAZIONI ESPOSIZIONE ====================

@app.post("/api/esposizione", response_model=dict)
def create_valutazione_esposizione(val: ValutazioneEsposizioneCreate, current_user: dict = Depends(get_current_user), conn=Depends(get_db)):
    """Crea valutazione esposizione"""
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO valutazioni_esposizione (
                user_id, azienda_id, mansione, reparto, lex, lpicco, classe_rischio
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, created_at
        """, (current_user["id"], val.azienda_id, val.mansione, val.reparto, val.lex, val.lpicco, val.classe_rischio))

        result = cursor.fetchone()
        valutazione_id = result["id"]

        for idx, mis in enumerate(val.misurazioni):
            cursor.execute("""
                INSERT INTO misurazioni (
                    valutazione_id, attivita, leq, durata, lpicco, ordine
                ) VALUES (%s, %s, %s, %s, %s, %s)
            """, (valutazione_id, mis.attivita, mis.leq, mis.durata, mis.lpicco, idx))

        conn.commit()
        return {
            "id": valutazione_id,
            "created_at": result["created_at"].isoformat(),
            "message": "Valutazione salvata con successo"
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

@app.get("/api/esposizione", response_model=List[ValutazioneEsposizione])
def list_valutazioni_esposizione(limit: int = 50, current_user: dict = Depends(get_current_user), conn=Depends(get_db)):
    """Lista valutazioni esposizione dell'utente corrente"""
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT * FROM valutazioni_esposizione WHERE user_id = %s ORDER BY created_at DESC LIMIT %s",
            (current_user["id"], limit)
        )
        valutazioni = cursor.fetchall()

        result = []
        for val in valutazioni:
            cursor.execute("""
                SELECT id, attivita, leq::text, durata::text, lpicco::text
                FROM misurazioni WHERE valutazione_id = %s ORDER BY ordine
            """, (val["id"],))
            misurazioni = cursor.fetchall()

            result.append({
                **val,
                "lex": str(val["lex"]) if val["lex"] else "0",
                "lpicco": str(val["lpicco"]) if val["lpicco"] else "0",
                "misurazioni": misurazioni
            })

        return result
    finally:
        cursor.close()

@app.get("/api/esposizione/{valutazione_id}", response_model=ValutazioneEsposizione)
def get_valutazione_esposizione(valutazione_id: int, conn=Depends(get_db)):
    """Ottieni dettagli valutazione esposizione"""
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM valutazioni_esposizione WHERE id = %s", (valutazione_id,))
        val = cursor.fetchone()

        if not val:
            raise HTTPException(status_code=404, detail="Valutazione non trovata")

        cursor.execute("""
            SELECT id, attivita, leq::text, durata::text, lpicco::text
            FROM misurazioni WHERE valutazione_id = %s ORDER BY ordine
        """, (valutazione_id,))
        misurazioni = cursor.fetchall()

        return {
            **val,
            "lex": str(val["lex"]) if val["lex"] else "0",
            "lpicco": str(val["lpicco"]) if val["lpicco"] else "0",
            "misurazioni": misurazioni
        }
    finally:
        cursor.close()

@app.put("/api/esposizione/{valutazione_id}", response_model=dict)
def update_valutazione_esposizione(
    valutazione_id: int,
    val: ValutazioneEsposizioneCreate,
    current_user: dict = Depends(get_current_user),
    conn=Depends(get_db)
):
    """Aggiorna valutazione esposizione esistente"""
    cursor = conn.cursor()
    try:
        # Verifica che la valutazione appartenga all'utente corrente
        cursor.execute(
            "SELECT id FROM valutazioni_esposizione WHERE id = %s AND user_id = %s",
            (valutazione_id, current_user["id"])
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Valutazione non trovata o non autorizzato")

        # Aggiorna valutazione
        cursor.execute("""
            UPDATE valutazioni_esposizione
            SET azienda_id = %s, mansione = %s, reparto = %s,
                lex = %s, lpicco = %s, classe_rischio = %s
            WHERE id = %s
        """, (val.azienda_id, val.mansione, val.reparto, val.lex, val.lpicco,
              val.classe_rischio, valutazione_id))

        # Elimina misurazioni esistenti
        cursor.execute("DELETE FROM misurazioni WHERE valutazione_id = %s", (valutazione_id,))

        # Inserisci nuove misurazioni
        for idx, mis in enumerate(val.misurazioni):
            cursor.execute("""
                INSERT INTO misurazioni (
                    valutazione_id, attivita, leq, durata, lpicco, ordine
                ) VALUES (%s, %s, %s, %s, %s, %s)
            """, (valutazione_id, mis.attivita, mis.leq, mis.durata, mis.lpicco, idx))

        conn.commit()
        return {
            "id": valutazione_id,
            "message": "Valutazione aggiornata con successo"
        }
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

@app.delete("/api/esposizione/{valutazione_id}", response_model=dict)
def delete_valutazione_esposizione(valutazione_id: int, conn=Depends(get_db)):
    """Elimina valutazione esposizione"""
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM valutazioni_esposizione WHERE id = %s", (valutazione_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Valutazione non trovata")
        return {"message": "Valutazione eliminata con successo"}
    finally:
        cursor.close()

# ==================== ENDPOINTS VALUTAZIONI DPI ====================

@app.post("/api/dpi", response_model=dict)
def create_valutazione_dpi(val: ValutazioneDPICreate, current_user: dict = Depends(get_current_user), conn=Depends(get_db)):
    """Crea valutazione DPI"""
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO valutazioni_dpi (
                user_id, azienda_id, mansione, reparto, dpi_selezionato,
                h, m, l, lex_per_dpi, pnr, leff, protezione_adeguata
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, created_at
        """, (
            current_user["id"],
            val.azienda_id, val.mansione, val.reparto, val.dpi_selezionato,
            val.valori_hml.h, val.valori_hml.m, val.valori_hml.l,
            val.lex_per_dpi, val.pnr, val.leff, val.protezione_adeguata
        ))

        result = cursor.fetchone()
        conn.commit()
        return {
            "id": result["id"],
            "created_at": result["created_at"].isoformat(),
            "message": "Valutazione DPI salvata con successo"
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

@app.get("/api/dpi", response_model=List[ValutazioneDPI])
def list_valutazioni_dpi(limit: int = 50, conn=Depends(get_db)):
    """Lista valutazioni DPI"""
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM valutazioni_dpi ORDER BY created_at DESC LIMIT %s", (limit,))
        valutazioni = cursor.fetchall()

        result = []
        for val in valutazioni:
            result.append({
                "id": val["id"],
                "azienda_id": val["azienda_id"],
                "mansione": val["mansione"],
                "reparto": val["reparto"],
                "dpi_selezionato": val["dpi_selezionato"],
                "valori_hml": {
                    "h": str(val["h"]) if val["h"] else "0",
                    "m": str(val["m"]) if val["m"] else "0",
                    "l": str(val["l"]) if val["l"] else "0"
                },
                "lex_per_dpi": str(val["lex_per_dpi"]) if val["lex_per_dpi"] else "0",
                "pnr": str(val["pnr"]) if val["pnr"] else None,
                "leff": str(val["leff"]) if val["leff"] else None,
                "protezione_adeguata": val["protezione_adeguata"],
                "created_at": val["created_at"]
            })

        return result
    finally:
        cursor.close()

@app.get("/api/dpi/{valutazione_id}", response_model=ValutazioneDPI)
def get_valutazione_dpi(valutazione_id: int, conn=Depends(get_db)):
    """Ottieni dettagli valutazione DPI"""
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM valutazioni_dpi WHERE id = %s", (valutazione_id,))
        val = cursor.fetchone()

        if not val:
            raise HTTPException(status_code=404, detail="Valutazione non trovata")

        return {
            "id": val["id"],
            "azienda_id": val["azienda_id"],
            "mansione": val["mansione"],
            "reparto": val["reparto"],
            "dpi_selezionato": val["dpi_selezionato"],
            "valori_hml": {
                "h": str(val["h"]) if val["h"] else "0",
                "m": str(val["m"]) if val["m"] else "0",
                "l": str(val["l"]) if val["l"] else "0"
            },
            "lex_per_dpi": str(val["lex_per_dpi"]) if val["lex_per_dpi"] else "0",
            "pnr": str(val["pnr"]) if val["pnr"] else None,
            "leff": str(val["leff"]) if val["leff"] else None,
            "protezione_adeguata": val["protezione_adeguata"],
            "created_at": val["created_at"]
        }
    finally:
        cursor.close()

@app.put("/api/dpi/{valutazione_id}", response_model=dict)
def update_valutazione_dpi(
    valutazione_id: int,
    val: ValutazioneDPICreate,
    current_user: dict = Depends(get_current_user),
    conn=Depends(get_db)
):
    """Aggiorna valutazione DPI esistente"""
    cursor = conn.cursor()
    try:
        # Verifica che la valutazione appartenga all'utente corrente
        cursor.execute(
            "SELECT id FROM valutazioni_dpi WHERE id = %s AND user_id = %s",
            (valutazione_id, current_user["id"])
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Valutazione non trovata o non autorizzato")

        # Aggiorna valutazione DPI
        cursor.execute("""
            UPDATE valutazioni_dpi
            SET azienda_id = %s, mansione = %s, reparto = %s,
                dpi_selezionato = %s, h = %s, m = %s, l = %s,
                lex_per_dpi = %s, pnr = %s, leff = %s, protezione_adeguata = %s
            WHERE id = %s
        """, (
            val.azienda_id, val.mansione, val.reparto, val.dpi_selezionato,
            val.valori_hml.h, val.valori_hml.m, val.valori_hml.l,
            val.lex_per_dpi, val.pnr, val.leff,
            val.protezione_adeguata, valutazione_id
        ))

        conn.commit()
        return {
            "id": valutazione_id,
            "message": "Valutazione DPI aggiornata con successo"
        }
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

@app.delete("/api/dpi/{valutazione_id}", response_model=dict)
def delete_valutazione_dpi(valutazione_id: int, conn=Depends(get_db)):
    """Elimina valutazione DPI"""
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM valutazioni_dpi WHERE id = %s", (valutazione_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Valutazione non trovata")
        return {"message": "Valutazione DPI eliminata con successo"}
    finally:
        cursor.close()

# ==================== ENDPOINTS VALUTAZIONI PER AZIENDA ====================

@app.get("/api/aziende/{azienda_id}/esposizione", response_model=List[ValutazioneEsposizione])
def get_azienda_valutazioni_esposizione(azienda_id: int, conn=Depends(get_db)):
    """Ottieni valutazioni esposizione per azienda"""
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT * FROM valutazioni_esposizione
            WHERE azienda_id = %s
            ORDER BY created_at DESC
        """, (azienda_id,))
        valutazioni = cursor.fetchall()

        result = []
        for val in valutazioni:
            cursor.execute("""
                SELECT id, attivita, leq::text, durata::text, lpicco::text
                FROM misurazioni WHERE valutazione_id = %s ORDER BY ordine
            """, (val["id"],))
            misurazioni = cursor.fetchall()

            result.append({
                **val,
                "lex": str(val["lex"]) if val["lex"] else "0",
                "lpicco": str(val["lpicco"]) if val["lpicco"] else "0",
                "misurazioni": misurazioni
            })

        return result
    finally:
        cursor.close()

@app.get("/api/aziende/{azienda_id}/dpi", response_model=List[ValutazioneDPI])
def get_azienda_valutazioni_dpi(azienda_id: int, conn=Depends(get_db)):
    """Ottieni valutazioni DPI per azienda"""
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT * FROM valutazioni_dpi
            WHERE azienda_id = %s
            ORDER BY created_at DESC
        """, (azienda_id,))
        valutazioni = cursor.fetchall()

        result = []
        for val in valutazioni:
            result.append({
                "id": val["id"],
                "azienda_id": val["azienda_id"],
                "mansione": val["mansione"],
                "reparto": val["reparto"],
                "dpi_selezionato": val["dpi_selezionato"],
                "valori_hml": {
                    "h": str(val["h"]) if val["h"] else "0",
                    "m": str(val["m"]) if val["m"] else "0",
                    "l": str(val["l"]) if val["l"] else "0"
                },
                "lex_per_dpi": str(val["lex_per_dpi"]) if val["lex_per_dpi"] else "0",
                "pnr": str(val["pnr"]) if val["pnr"] else None,
                "leff": str(val["leff"]) if val["leff"] else None,
                "protezione_adeguata": val["protezione_adeguata"],
                "created_at": val["created_at"]
            })

        return result
    finally:
        cursor.close()

# ==================== HEALTH CHECK ====================

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

# ==================== SERVE FRONTEND STATICO ====================

# Monta i file statici del frontend
import pathlib
static_dir = pathlib.Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(static_dir / "assets")), name="assets")

    @app.get("/")
    def serve_frontend():
        """Serve il frontend React"""
        index_file = static_dir / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return {
            "app": "API Calcolo Esposizione Rumore",
            "version": "1.0.0",
            "docs": "/docs",
            "note": "Frontend non disponibile"
        }

    # Catch-all per il routing client-side di React
    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        """
        Serve il frontend per tutte le route non-API.
        Questo permette al router di React di gestire il routing client-side.
        """
        # Se la richiesta è per l'API, non intercettare
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Endpoint non trovato")

        # Se la richiesta è per un file specifico (es. markdown, immagini), prova a servirlo
        if full_path.startswith("docs/") or full_path.endswith(('.md', '.pdf', '.txt', '.json')):
            requested_file = static_dir / full_path
            if requested_file.exists() and requested_file.is_file():
                return FileResponse(requested_file)

        # Per tutte le altre route, serve index.html
        index_file = static_dir / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Frontend non disponibile")
else:
    @app.get("/")
    def root():
        """Root endpoint (quando frontend non è disponibile)"""
        return {
            "app": "API Calcolo Esposizione Rumore",
            "version": "1.0.0",
            "docs": "/docs",
            "note": "Frontend non buildato - cartella static non trovata"
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
