# BASA v3.0 FINAL - 1 SOLO 1
## Basa_Audit_Inteligent_Usa · RNC 133378711 · Client DB & e-CF DGII

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.30+-FF4B4B.svg)](https://streamlit.io/)
[![SQLite](https://img.shields.io/badge/SQLite3-Client_DB-003B57.svg)](https://www.sqlite.org/)
[![DGII e-CF](https://img.shields.io/badge/DGII_e--CF-Ley_32--23-amber.svg)](https://dgii.gov.do/)

Sistema Jurídico y de Auditoría Forense Inteligente para radicación oficial de expedientes legales, proyectos de investigación, bases de datos SQLite independientes por cliente y facturación electrónica autorizada por la DGII (República Dominicana).

**Autor / Emisor Oficial:** Lic. Pedro A. Baldera Rondón  
**RNC:** `133378711`  
**Serie e-CF Default:** `E32` / `E31`  
**Usuario Master:** `Licpedrobaldera@gmail.com`  

---

## 🏛️ Características Principales

1. **Arquitectura Client DB**:
   - Cada cliente o expediente cuenta con su propia base de datos SQLite independiente (`data/casos/{cliente_id}/basa_{cliente_id}.db`).
   - Tablas estándar: `facturas_ecf`, `documentos`, `pagos`, `investigaciones_casos`.

2. **Radicación Oficial de Casos & Cadena de Custodia**:
   - Subida y certificación de expedientes (PDF, Excel, Word, imágenes, etc.).
   - Cálculo automático del Hash criptográfico **SHA-256** para validez legal e inmutabilidad probatoria.
   - Generación de **Actas Oficiales de Radicación** con código QR escaneable y membrete profesional.

3. **Facturación Electrónica e-CF DGII**:
   - Soporte para comprobantes electrónicos de 13 dígitos:
     - `E32`: Factura de Consumo Electrónica ($99 TU CASO).
     - `E31`: Factura de Crédito Fiscal Electrónica (B2B con RNC).
     - `E34`: Nota de Crédito Electrónica.
   - Control de secuencias automáticas y módulo de **Sincronización Manual** para evitar duplicidades con el portal DGII.
   - Generación de comprobante fiscal digital con código QR oficial.

4. **Libro Secreto de Auditoría**:
   - Registro inmutable de transacciones y trazabilidad legal en `data/libro_secreto`.

---

## 🚀 Despliegue y Ejecución

El proyecto puede ser ejecutado tanto en su versión Web SPA moderna (React + TypeScript + Tailwind) como en su versión standalone de Python (Streamlit):

### Opción A: Aplicación Web React (Recomendada)
\`\`\`bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo en puerto 3000
npm run dev

# 3. Compilar para producción
npm run build
\`\`\`

### Opción B: Aplicación Python / Streamlit
\`\`\`bash
# 1. Instalar dependencias de Python
pip install -r requirements.txt

# 2. Ejecutar aplicativo
streamlit run basa_v3_final.py
\`\`\`

---

## 🔐 Credenciales de Acceso

- **Usuario Master:** `Licpedrobaldera@gmail.com` (o RNC: `133378711`)
- **Contraseña Master:** `Basa2026!`
- **Rol:** `admin_master_full`

---

## 📂 Estructura del Repositorio

\`\`\`
Basa_Audit_Inteligent_Usa/
├── basa_v3_final.py          # Aplicación Python / Streamlit oficial
├── config_roles.json         # Configuración de usuarios y permisos
├── requirements.txt          # Dependencias Python
├── package.json              # Dependencias Node.js / React
├── index.html                # Entrada HTML web
├── src/                      # Código fuente React & TypeScript
│   ├── App.tsx               # Aplicación principal
│   ├── components/           # Módulos: Manager, Portal, e-CF, Libro Secreto
│   ├── services/             # Motor ClientDB, hashing SHA-256 y NCF
│   └── types/                # Modelos y contratos de datos
└── data/
    ├── ncf/                  # Secuencias e-CF DGII (E32, E31)
    ├── casos/                # Bases de datos SQLite y documentos por cliente
    └── libro_secreto/        # Auditoría criptográfica
\`\`\`

---

© 2026 **BASA v3.0** · Lic. Pedro A. Baldera Rondón · RNC 133378711 · 1 SOLO 1
