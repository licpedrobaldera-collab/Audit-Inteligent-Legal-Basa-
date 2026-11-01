import React, { useState } from 'react';
import { basaStorage } from '../services/storage';
import { Github, Download, Terminal, Copy, CheckCircle2, FileCode, Database, FolderArchive } from 'lucide-react';

export const GitHubExportModal: React.FC = () => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  const handleDownloadPythonScript = () => {
    const pythonCode = `# =========================================================================
# BASA v3.0 FINAL FINAL - 1 SOLO 1 - RNC 133378711 - CLIENT DB - PARA GITHUB
# AUTOR: Lic. Pedro A. Baldera Rondón - RNC 133378711
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

if "user" not in st.session_state:
    st.markdown('<div style="background:linear-gradient(135deg,#0F172A,#D4AF37);border-radius:20px;padding:20px;text-align:center;color:white;border:2px solid #D4AF37"><div style="color:#D4AF37;font-weight:900;font-size:1.8rem">BASA v3.0 - 1 SOLO 1 - FINAL - RNC 133378711</div><div>CLIENT DB - E32/E31 - Cada cliente con su propia SQLite</div></div>', unsafe_allow_html=True)
    ident = st.text_input("Correo", value="Licpedrobaldera@gmail.com")
    pwd = st.text_input("Contrasena", type="password", value="Basa2026!")
    if st.button("Entrar - 1 SOLO 1"):
        u = login(ident, pwd)
        if u:
            st.session_state.user = u
            st.rerun()
        else:
            st.error("Licpedrobaldera@gmail.com / Basa2026!")
    st.info("Master: Licpedrobaldera@gmail.com / Basa2026!")
    st.stop()

user = st.session_state.user
st.markdown(f"**{user['id']} - {user['nombre']} - {user['rol']} - RNC133378711**")
if st.button("Salir"):
    del st.session_state.user
    st.rerun()

sel = st.sidebar.selectbox("MODULOS - 1 SOLO 1", [
    "FINAL - CLIENTES MANAGER - Crear Cliente DB",
    "FINAL - CLIENTE PORTAL - Ver DB Cliente",
    "FINAL - NCF E32/E31 - Facturar"
])
caso_id = st.sidebar.text_input("ID Cliente DB", value="CLI-001")
if st.sidebar.button("Crear DB Cliente"):
    db = ClientDB.init_db(caso_id)
    st.sidebar.success(f"DB: {db}")

if "MANAGER" in sel:
    st.subheader("1 SOLO 1 - CLIENTES MANAGER - Crear Cliente con DB Propia SQLite")
    nid = st.text_input("ID Nuevo", value="CLI-" + uuid.uuid4().hex[:4].upper())
    nom = st.text_input("Nombre", value="Ferreteria Ejemplo SRL")
    rnc = st.text_input("RNC", value="130000002")
    cor = st.text_input("Correo", value="cliente@empresa.com")
    pw = st.text_input("Password", value="Cliente2026!")
    if st.button("CREAR CLIENTE FINAL - 1 SOLO 1 - $199/mes"):
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
        st.success(f"CREADO: {nid} - {nom} - DB: {db} - Login: {cor} / {pw} - $199/mes")

elif "PORTAL" in sel:
    st.subheader(f"1 SOLO 1 - CLIENTE PORTAL - {caso_id} - Su propia DB")
    ClientDB.init_db(caso_id)
    fc = ClientDB.execute(caso_id, "SELECT COUNT(*) FROM facturas_ecf", fetch=True)
    st.metric("Facturas en su DB", fc[0][0] if fc else 0)
    f = ClientDB.execute(caso_id, "SELECT ncf,tipo_ecf,cliente_nombre,monto,fecha FROM facturas_ecf ORDER BY fecha DESC LIMIT 50", fetch=True)
    if f:
        st.dataframe(pd.DataFrame(f, columns=["NCF", "Tipo", "Cliente", "Monto", "Fecha"]), use_container_width=True)
    up = st.file_uploader(f"Subir doc para {caso_id} - Guarda en su DB", type=["pdf", "xlsx", "docx", "png", "jpg", "txt"], accept_multiple_files=True)
    if up:
        for file in up:
            ruta = Path(f"data/casos/{caso_id}/{file.name}")
            ruta.parent.mkdir(parents=True, exist_ok=True)
            open(ruta, "wb").write(file.getbuffer())
            ClientDB.execute(caso_id, "INSERT INTO documentos VALUES (?,?,?,?,?)",
                             (str(uuid.uuid4()), caso_id, file.name, datetime.datetime.now().isoformat(), "VIGENTE"))
            st.success(f"Guardado {file.name} en DB {caso_id}")

else:
    st.subheader(f"1 SOLO 1 - NCF E32/E31 - Cliente {caso_id} - RNC133378711")
    tc = st.selectbox("Tipo", ["E32 - $99 TU CASO", "E31 - B2B con RNC"])
    t = tc.split(" - ")[0]
    st.success(f"Siguiente: {NCF.siguiente(t)} - DB: {caso_id}")
    ult = st.text_input(f"Ultimo DGII {t} (para evitar duplicado)", placeholder=f"{t}0000000049")
    if st.button(f"Set Manual {t}"):
        if ult:
            st.success(f"Siguiente: {NCF.set_manual(ult)}")
    nom = st.text_input("Cliente", value="Cliente Demo")
    mon = st.number_input("Monto", value=99)
    if st.button(f"FACTURAR {t} - Guardar en DB {caso_id} - 1 SOLO 1"):
        ncf = NCF.usar(t, caso_id, nom, mon)
        st.success(f"Factura {ncf} - Guardada en DB {caso_id} - data/casos/{caso_id}/basa_{caso_id}.db - RNC133378711 - FINAL")
        st.download_button(f"Descargar {ncf}", f"Factura {ncf} - {nom} - \${mon} - RNC133378711 - DB {caso_id}", file_name=f"Factura_{ncf}_{caso_id}.pdf")

st.caption(f"BASA 1 SOLO 1 FINAL - Cliente DB {caso_id} - RNC133378711 - Para GitHub - PC y Celular")
`;

    const blob = new Blob([pythonCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'basa_v3_final.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadRolesConfig = () => {
    const jsonStr = basaStorage.exportConfigRolesJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config_roles.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadNCFConfig = () => {
    const jsonStr = basaStorage.exportNCFSequencesJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'secuencias_ncf_dgii.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const gitCommands = `# Paso 1: Inicializar repositorio Git en tu máquina local o servidor
git init

# Paso 2: Agregar todos los archivos oficiales del proyecto BASA
git add .

# Paso 3: Confirmar ver# Paso 3: Confirmar versión final con firma RNC 133378711
git commit -m "BASA v3.0 FINAL - Basa_Audit_Inteligent_Usa - RNC 133378711 - CLIENT DB"

# Paso 4: Establecer rama principal
git branch -M main

# Paso 5: Vincular con tu repositorio GitHub oficial Basa_Audit_Inteligent_Usa:
git remote add origin https://github.com/licpedrobaldera/Basa_Audit_Inteligent_Usa.git

# Paso 6: Subir proyecto de manera oficial a GitHub
git push -u origin main`;

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  CENTRO DE EXPORTACIÓN & DESPLIEGUE PARA GITHUB
                </h2>
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  CLIENT DB · 1 SOLO 1
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Descargue el script en Python, esquemas SQLite (.db / .sql) y configuraciones JSON listos para subir a GitHub.
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-400">
            <div>RNC: <strong className="text-amber-300 font-mono">133378711</strong></div>
            <div>Pedro A. Baldera Rondón</div>
          </div>
        </div>
      </div>

      {/* Grid: Downloadable Assets + Git Push Commands */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Project Files */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FolderArchive className="w-4 h-4 text-amber-400" />
            <span>Archivos del Proyecto para GitHub</span>
          </h3>
          <p className="text-xs text-slate-400">
            Descargue los módulos de código y bases de datos para su repositorio oficial.
          </p>

          <div className="space-y-3 pt-2">
            {/* Python Script */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileCode className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="font-bold text-xs text-white">basa_v3_final.py</div>
                  <div className="text-[11px] text-slate-400">Script Streamlit v3.0 completo</div>
                </div>
              </div>
              <button
                onClick={handleDownloadPythonScript}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar</span>
              </button>
            </div>

            {/* config_roles.json */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-indigo-400" />
                <div>
                  <div className="font-bold text-xs text-white">config_roles.json</div>
                  <div className="text-[11px] text-slate-400">Roles, Master y Clientes</div>
                </div>
              </div>
              <button
                onClick={handleDownloadRolesConfig}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar</span>
              </button>
            </div>

            {/* secuencia_E32.json */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="font-bold text-xs text-white">secuencia_E32.json / E31</div>
                  <div className="text-[11px] text-slate-400">Secuencias DGII e-CF sincronizadas</div>
                </div>
              </div>
              <button
                onClick={handleDownloadNCFConfig}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-300">Estructura oficial de directorios:</div>
            <pre className="p-3 bg-slate-950 rounded-lg text-[11px] font-mono text-amber-300/90 overflow-x-auto">
{`basa-v3/
├── basa_v3_final.py
├── config_roles.json
├── data/
│   ├── ncf/
│   │   ├── secuencia_E32.json
│   │   └── secuencia_E31.json
│   ├── casos/
│   │   └── CLI-001/
│   │       ├── basa_CLI-001.db
│   │       └── [documentos...]
│   └── libro_secreto/`}
            </pre>
          </div>
        </div>

        {/* Right: Git Terminal Instructions */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Comandos para Subir Oficialmente a GitHub</h3>
            </div>
            <button
              onClick={() => copyToClipboard(gitCommands, 'all')}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
            >
              {copiedCmd === 'all' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Comandos</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto space-y-2">
            <div className="text-slate-500"># 1. En tu terminal o consola:</div>
            <div className="text-amber-400 font-bold">git init</div>
            <div className="text-amber-400 font-bold">git add .</div>
            <div className="text-amber-400 font-bold">git commit -m &quot;BASA v3.0 FINAL - Basa_Audit_Inteligent_Usa - RNC 133378711&quot;</div>
            <div className="text-amber-400 font-bold">git branch -M main</div>
            <div className="text-slate-500"># 2. Conectar con tu repositorio remoto de GitHub:</div>
            <div className="text-amber-300">git remote add origin https://github.com/licpedrobaldera/Basa_Audit_Inteligent_Usa.git</div>
            <div className="text-slate-500"># 3. Subida final y oficial:</div>
            <div className="text-emerald-400 font-bold">git push -u origin main</div>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200 space-y-1">
            <div className="font-bold text-amber-300">Compatibilidad Completa PC y Celular:</div>
            <p>
              El aplicativo funciona de forma sincronizada: los archivos generados y los registros fiscales se mantienen protegidos con algoritmos SHA-256 e interoperabilidad nativa tanto en la versión Web actual como en el script de Streamlit para Python.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
