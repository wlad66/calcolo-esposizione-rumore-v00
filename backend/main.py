from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import List, Optional
import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel
from datetime import datetime

load_dotenv()

# ==================== MODELLI PYDANTIC ====================

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

# ==================== DATABASE ====================

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
origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== ENDPOINTS AZIENDE ====================

@app.post("/api/aziende", response_model=dict)
def create_azienda(azienda: AziendaCreate, conn=Depends(get_db)):
    """Crea una nuova azienda"""
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO aziende (
                ragione_sociale, partita_iva, codice_fiscale,
                indirizzo, citta, cap, provincia,
                telefono, email, rappresentante_legale
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, created_at
        """, (
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
def list_aziende(limit: int = 100, conn=Depends(get_db)):
    """Lista tutte le aziende"""
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM aziende ORDER BY ragione_sociale LIMIT %s", (limit,))
        return cursor.fetchall()
    finally:
        cursor.close()

@app.get("/api/aziende/{azienda_id}", response_model=Azienda)
def get_azienda(azienda_id: int, conn=Depends(get_db)):
    """Ottieni dettagli azienda"""
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM aziende WHERE id = %s", (azienda_id,))
        azienda = cursor.fetchone()
        if not azienda:
            raise HTTPException(status_code=404, detail="Azienda non trovata")
        return azienda
    finally:
        cursor.close()

@app.put("/api/aziende/{azienda_id}", response_model=dict)
def update_azienda(azienda_id: int, azienda: AziendaUpdate, conn=Depends(get_db)):
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

        values.append(azienda_id)
        query = f"UPDATE aziende SET {', '.join(fields)} WHERE id = %s"
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
def delete_azienda(azienda_id: int, conn=Depends(get_db)):
    """Elimina azienda"""
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM aziende WHERE id = %s", (azienda_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Azienda non trovata")
        return {"message": "Azienda eliminata con successo"}
    finally:
        cursor.close()

# ==================== ENDPOINTS VALUTAZIONI ESPOSIZIONE ====================

@app.post("/api/esposizione", response_model=dict)
def create_valutazione_esposizione(val: ValutazioneEsposizioneCreate, conn=Depends(get_db)):
    """Crea valutazione esposizione"""
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO valutazioni_esposizione (
                azienda_id, mansione, reparto, lex, lpicco, classe_rischio
            ) VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, created_at
        """, (val.azienda_id, val.mansione, val.reparto, val.lex, val.lpicco, val.classe_rischio))

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
def list_valutazioni_esposizione(limit: int = 50, conn=Depends(get_db)):
    """Lista valutazioni esposizione"""
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM valutazioni_esposizione ORDER BY created_at DESC LIMIT %s", (limit,))
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
def create_valutazione_dpi(val: ValutazioneDPICreate, conn=Depends(get_db)):
    """Crea valutazione DPI"""
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO valutazioni_dpi (
                azienda_id, mansione, reparto, dpi_selezionato,
                h, m, l, lex_per_dpi, pnr, leff, protezione_adeguata
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, created_at
        """, (
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

@app.get("/")
def root():
    """Root endpoint"""
    return {
        "app": "API Calcolo Esposizione Rumore",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
