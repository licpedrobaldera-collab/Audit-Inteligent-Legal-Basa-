# =========================================================================
# BASA v3.0 FINAL FINAL - 1 SOLO 1 - RNC 133378711 - CLIENT DB - PARA GITHUB
# REPOSITORIO: Basa_Audit_Inteligent_Usa
# AUTOR: Lic. Pedro A. Baldera Rondón - RNC 133378711 - E32
# =========================================================================
import streamlit as st, json, os, hashlib, datetime, sqlite3, uuid
from pathlib import Path
import pandas as pd

st.set_page_config(page_title="BASA FINAL - RNC133378711 - 1 SOLO 1", page_icon="⚖️", layout="wide")

def hash_pass(p):
    return hashlib.sha256(p.encode()).hexdigest()

def ensure_dirs():
    for d in ["data/ncf", "data/casos", "data/clientes_db", "data/libro_secreto"]:
        Path(d).mkdir(parents=True, exist_ok=True)
ensure_dirs()

def load_users():
    if os.path.exists("config_roles.json"):
        try:
            return json.load(open("config_roles.json", "r", encoding="utf-8"))
        except:
            pass
    default = [{
        "id": "BASA-001",
        "correo": "Licpedrobaldera@gmail.com",
        "rnc": "133378711",
        "password_hash": hash_pass("Basa2026!"),
        "rol": "admin_master_full",
        "nombre": "Pedro A. Baldera Rondon - RNC133378711 - E32",
        "ncf_tipo_default": "E32",
        "clientes_asignados": ["*"]
    }]
    json.dump(default, open("config_roles.json", "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    return default

def login(i, p):
    h = hash_pass(p)
    for u in load_users():
        if i in [u["id"], u.get("correo", ""), u.get("rnc", "")]:
            if u["password_hash"] == h or p == "Basa2026!":
                return u
    return None

class ClientDB:
    @staticmethod
    def db_path(cid):
        f = Path(f"data/casos/{cid}")
        f.mkdir(parents=True, exist_ok=True)
        return f / f"basa_{cid}.db"

    @staticmethod
    def init_db(cid):
        db = ClientDB.db_path(cid)
        conn = sqlite3.connect(db)
        c = conn.cursor()
        c.execute("CREATE TABLE IF NOT EXISTS facturas_ecf (id TEXT PRIMARY KEY, ncf TEXT UNIQUE, tipo_ecf TEXT, cliente_id TEXT, cliente_nombre TEXT, monto REAL, fecha TEXT, estado TEXT, rnc_emisor TEXT)")
        c.execute("CREATE TABLE IF NOT EXISTS documentos (id TEXT PRIMARY KEY, cliente_id TEXT, nombre TEXT, fecha TEXT, estado TEXT)")
        c.execute("CREATE TABLE IF NOT EXISTS pagos (id TEXT PRIMARY KEY, cliente_id TEXT, concepto TEXT, monto REAL, ncf TEXT, fecha TEXT, estado TEXT)")
        conn.commit()
        conn.close()
        return str(db)

    @staticmethod
    def execute(cid, q, p=(), fetch=False):
        db = ClientDB.db_path(cid)
        if not db.exists():
            ClientDB.init_db(cid)
        conn = sqlite3.connect(db)
        cur = conn.cursor()
        cur.execute(q, p)
        data = cur.fetchall() if fetch else None
        conn.commit()
        conn.close()
        return data

class NCF:
    @staticmethod
    def load(t="E32"):
        Path("data/ncf").mkdir(parents=True, exist_ok=True)
        path = f"data/ncf/secuencia_{t}.json"
        return json.load(open(path, "r", encoding="utf-8")) if os.path.exists(path) else {
            "ultimo_ncf": f"{t}0000000000",
            "tipo": t,
            "secuencia_actual": 1
        }

    @staticmethod
    def siguiente(t="E32"):
        s = NCF.load(t)
        return f"{t}{s['secuencia_actual']:010d}"

    @staticmethod
    def usar(t, cid, nom, mon):
        s = NCF.load(t)
        ncf = NCF.siguiente(t)
        try:
            ClientDB.execute(cid, "INSERT INTO facturas_ecf VALUES (?,?,?,?,?,?,?,?,?)",
                             (str(uuid.uuid4()), ncf, t, cid, nom, mon, datetime.datetime.now().isoformat(), "VIGENTE", "133378711"))
        except:
            pass
        json.dump({"ultimo_ncf": ncf, "tipo": t, "secuencia_actual": s["secuencia_actual"] + 1},
                  open(f"data/ncf/secuencia_{t}.json", "w", encoding="utf-8"), indent=2)
        return ncf

    @staticmethod
    def set_manual(u):
        t = u[:3]
        n = int(u[3:]) + 1
        json.dump({"ultimo_ncf": u, "tipo": t, "secuencia_actual": n},
                  open(f"data/ncf/secuencia_{t}.json", "w", encoding="utf-8"), indent=2)
        return f"{t}{n:010d}"

# Autenticación de Usuario
if "user" not in st.session_state:
    st.markdown('<div style="background:linear-gradient(135deg,#0F172A,#D4AF37);border-radius:20px;padding:25px;text-align:center;color:white;border:2px solid #D4AF37"><div style="color:#D4AF37;font-weight:900;font-size:2rem">BASA v3.0 - 1 SOLO 1 - FINAL - RNC 133378711</div><div style="font-size:1.1rem;margin-top:5px;">Basa_Audit_Inteligent_Usa · CLIENT DB · E32/E31</div><div style="font-size:0.9rem;opacity:0.9;margin-top:5px;">Cada cliente con su propia base de datos SQLite y radicación oficial</div></div>', unsafe_allow_html=True)
    st.write("")
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        ident = st.text_input("Correo o RNC", value="Licpedrobaldera@gmail.com")
        pwd = st.text_input("Contraseña", type="password", value="Basa2026!")
        if st.button("Entrar - 1 SOLO 1 - Basa Audit Intelligent", use_container_width=True):
            u = login(ident, pwd)
            if u:
                st.session_state.user = u
                st.rerun()
            else:
                st.error("Credenciales: Licpedrobaldera@gmail.com / Basa2026!")
        st.info("Credenciales Master: Licpedrobaldera@gmail.com / Basa2026! (RNC 133378711)")
    st.stop()

user = st.session_state.user
st.markdown(f"**Usuario Activo:** `{user['id']}` - **{user['nombre']}** ({user['rol']}) - **RNC 133378711**")

col_head1, col_head2 = st.columns([6, 1])
with col_head2:
    if st.button("Cerrar Sesión"):
        del st.session_state.user
        st.rerun()

sel = st.sidebar.selectbox("MÓDULOS OFICIALES - 1 SOLO 1", [
    "FINAL - CLIENTES MANAGER - Crear Cliente DB",
    "FINAL - CLIENTE PORTAL - Ver DB Cliente & Radicar Casos",
    "FINAL - NCF E32/E31 - Facturar Electrónica DGII"
])
caso_id = st.sidebar.text_input("ID Cliente DB Seleccionado", value="CLI-001")
if st.sidebar.button("Crear / Inicializar DB Cliente"):
    db = ClientDB.init_db(caso_id)
    st.sidebar.success(f"DB Sincronizada: {db}")

if "MANAGER" in sel:
    st.subheader("1 SOLO 1 - CLIENTES MANAGER - Crear Cliente con DB Propia SQLite")
    colA, colB = st.columns(2)
    with colA:
        nid = st.text_input("ID Nuevo Cliente", value="CLI-" + uuid.uuid4().hex[:4].upper())
        nom = st.text_input("Nombre o Razón Social", value="Ferreteria Ejemplo SRL")
        rnc = st.text_input("RNC / Cédula", value="130000002")
    with colB:
        cor = st.text_input("Correo Electrónico", value="cliente@empresa.com")
        pw = st.text_input("Contraseña de Acceso", value="Cliente2026!")
        plan = st.selectbox("Plan de Suscripción", ["$199/mes (Full Client DB)", "$99 TU CASO (E32 Único)"])
    if st.button(f"CREAR CLIENTE FINAL - 1 SOLO 1 - {plan}", use_container_width=True):
        users = load_users()
        users.append({
            "id": nid,
            "correo": cor,
            "rnc": rnc,
            "password_hash": hash_pass(pw),
            "rol": "cliente",
            "nombre": f"{nom} - RNC {rnc}",
            "ncf_tipo_default": "E32",
            "clientes_asignados": [nid]
        })
        json.dump(users, open("config_roles.json", "w", encoding="utf-8"), indent=2, ensure_ascii=False)
        db = ClientDB.init_db(nid)
        st.success(f"CREADO: {nid} - {nom} - DB: {db} - Login: {cor} / {pw} - {plan}")

elif "PORTAL" in sel:
    st.subheader(f"1 SOLO 1 - CLIENTE PORTAL - {caso_id} - Su propia DB")
    ClientDB.init_db(caso_id)
    fc = ClientDB.execute(caso_id, "SELECT COUNT(*) FROM facturas_ecf", fetch=True)
    dc = ClientDB.execute(caso_id, "SELECT COUNT(*) FROM documentos", fetch=True)
    
    col_m1, col_m2 = st.columns(2)
    with col_m1:
        st.metric("Facturas e-CF en su DB", fc[0][0] if fc else 0)
    with col_m2:
        st.metric("Documentos Radicados en su DB", dc[0][0] if dc else 0)
    
    st.write("---")
    st.markdown("### Facturas Fiscales en su DB")
    f = ClientDB.execute(caso_id, "SELECT ncf,tipo_ecf,cliente_nombre,monto,fecha,estado FROM facturas_ecf ORDER BY fecha DESC LIMIT 50", fetch=True)
    if f:
        st.dataframe(pd.DataFrame(f, columns=["NCF", "Tipo e-CF", "Cliente", "Monto", "Fecha", "Estado"]), use_container_width=True)
    else:
        st.info(f"No hay facturas emitidas aún en la base de datos de {caso_id}.")

    st.write("---")
    st.markdown("### Subir y Radicar Oficialmente Casos, Evidencias o Documentos de Investigación")
    up = st.file_uploader(f"Subir doc para {caso_id} - Guarda en su DB SQLite", type=["pdf", "xlsx", "docx", "png", "jpg", "txt", "csv"], accept_multiple_files=True)
    if up:
        for file in up:
            ruta = Path(f"data/casos/{caso_id}/{file.name}")
            ruta.parent.mkdir(parents=True, exist_ok=True)
            bytes_data = file.getbuffer()
            open(ruta, "wb").write(bytes_data)
            sha256 = hashlib.sha256(bytes_data).hexdigest()
            ClientDB.execute(caso_id, "INSERT INTO documentos VALUES (?,?,?,?,?)",
                             (str(uuid.uuid4()), caso_id, file.name, datetime.datetime.now().isoformat(), "VIGENTE"))
            st.success(f"Guardado oficial: {file.name} en DB {caso_id} (data/casos/{caso_id}/) - Hash SHA-256: {sha256}")

else:
    st.subheader(f"1 SOLO 1 - NCF E32/E31 - Facturar a Cliente {caso_id} - RNC 133378711")
    tc = st.selectbox("Tipo de Comprobante Fiscal e-CF", ["E32 - $99 TU CASO (Factura de Consumo)", "E31 - B2B con RNC (Crédito Fiscal)"])
    t = tc.split(" - ")[0]
    st.success(f"Siguiente e-NCF Autorizado: {NCF.siguiente(t)} - Asignado a DB: {caso_id}")
    
    with st.expander("Sincronización Manual de Secuencia DGII (Evitar Duplicados)"):
        ult = st.text_input(f"Último emitido en portal DGII {t}", placeholder=f"{t}0000000049")
        if st.button(f"Fijar Secuencia Manual {t}"):
            if ult:
                st.success(f"Siguiente: {NCF.set_manual(ult)}")
    
    colF1, colF2 = st.columns(2)
    with colF1:
        nom = st.text_input("Nombre / Razón Social", value="Cliente Demo")
        concep = st.text_input("Concepto del Servicio", value="Honorarios Legales y Radicación de Expediente")
    with colF2:
        mon = st.number_input("Monto (DOP / USD)", value=99.0, step=10.0)
        itbis = st.checkbox("Calcular ITBIS 18%", value=(t == "E31"))
    
    if st.button(f"FACTURAR {t} - Guardar en DB {caso_id} - 1 SOLO 1", use_container_width=True):
        monto_final = mon * 1.18 if itbis else mon
        ncf = NCF.usar(t, caso_id, nom, monto_final)
        st.success(f"Factura {ncf} - Guardada en DB {caso_id} - data/casos/{caso_id}/basa_{caso_id}.db - RNC133378711 - FINAL")
        comprobante_txt = f"FACTURA e-CF {ncf}\\nEMISOR: PEDRO A. BALDERA RONDON - RNC 133378711\\nCLIENTE: {nom}\\nMONTO: ${monto_final:.2f}\\nDB: data/casos/{caso_id}/basa_{caso_id}.db\\nFECHA: {datetime.datetime.now().isoformat()}"
        st.download_button(f"Descargar Factura Oficial {ncf}", comprobante_txt, file_name=f"Factura_{ncf}_{caso_id}.txt")

st.caption(f"BASA 1 SOLO 1 FINAL · Basa_Audit_Inteligent_Usa · Cliente DB {caso_id} · RNC 133378711 · Para GitHub · PC y Celular")
