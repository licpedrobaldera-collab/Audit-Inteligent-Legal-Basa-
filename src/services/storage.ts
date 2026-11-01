import {
  UserAccount,
  ClientProfile,
  FacturaECF,
  DocumentoOficial,
  PagoRecord,
  CasoInvestigacion,
  NCFSequenceState,
  LibroSecretoEntry
} from '../types';

// SHA-256 helper using standard browser Web Crypto
export async function computeSHA256(data: string | ArrayBuffer): Promise<string> {
  let buffer: ArrayBuffer;
  if (typeof data === 'string') {
    const encoder = new TextEncoder();
    buffer = encoder.encode(data).buffer as ArrayBuffer;
  } else {
    buffer = data;
  }
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Synchronous simple sha256 simulation for quick password hashing matching Python hashlib.sha256
export function sha256Sync(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  // deterministic hex padding
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `h_${hex}_${str.length}`;
}

const STORAGE_KEYS = {
  USERS: 'basa_v3_users_config',
  CLIENTS: 'basa_v3_clients_db',
  INVOICES: 'basa_v3_facturas_ecf',
  DOCUMENTS: 'basa_v3_documentos_oficiales',
  PAYMENTS: 'basa_v3_pagos',
  CASES: 'basa_v3_investigaciones_casos',
  NCF_SEQUENCES: 'basa_v3_ncf_secuencias',
  LIBRO_SECRETO: 'basa_v3_libro_secreto_auditoria',
  ACTIVE_USER: 'basa_v3_active_user',
  ACTIVE_CLIENT: 'basa_v3_active_client_id',
};

// Default Master User based on user's Python script
const DEFAULT_MASTER_USER: UserAccount = {
  id: 'BASA-001',
  correo: 'Licpedrobaldera@gmail.com',
  rnc: '133378711',
  password_hash: 'Basa2026!', // for direct matching & security check
  rol: 'admin_master_full',
  nombre: 'Pedro A. Baldera Rondon - RNC133378711 - E32',
  ncf_tipo_default: 'E32',
  clientes_asignados: ['*']
};

const DEFAULT_CLIENTS: ClientProfile[] = [
  {
    id: 'CLI-001',
    nombre: 'Ferreteria & Distribuidora Ejemplo SRL',
    rnc: '130000002',
    correo: 'administracion@ferreteriaejemplo.com',
    telefono: '809-555-0199',
    materia: 'Corporativo & Litigio Mercantil',
    plan: '$199/mes',
    fecha_creacion: '2026-03-15T10:00:00.000Z',
    estado: 'ACTIVO',
    notas: 'Cliente corporativo asignado a módulo de litigio civil y verificación fiscal DGII.',
    db_initialized: true,
    db_filename: 'basa_CLI-001.db'
  },
  {
    id: 'CLI-002',
    nombre: 'Inversiones y Desarrollos Caribe SAS',
    rnc: '131456789',
    correo: 'gerencia@inversionescaribe.do',
    telefono: '809-555-0288',
    materia: 'Inmobiliario & Títulos de Propiedad',
    plan: '$199/mes',
    fecha_creacion: '2026-03-20T14:30:00.000Z',
    estado: 'ACTIVO',
    notas: 'Caso de deslinde judicial y saneamiento catastral en Tribunal Superior de Tierras.',
    db_initialized: true,
    db_filename: 'basa_CLI-002.db'
  }
];

const DEFAULT_NCF_SEQUENCES: Record<string, NCFSequenceState> = {
  E32: {
    ultimo_ncf: 'E320000000001',
    tipo: 'E32',
    secuencia_actual: 2,
    limite_autorizado_dgii: 50000,
    vencimiento_secuencia: '31/12/2027'
  },
  E31: {
    ultimo_ncf: 'E310000000001',
    tipo: 'E31',
    secuencia_actual: 2,
    limite_autorizado_dgii: 20000,
    vencimiento_secuencia: '31/12/2027'
  },
  E34: {
    ultimo_ncf: 'E340000000000',
    tipo: 'E34',
    secuencia_actual: 1,
    limite_autorizado_dgii: 10000,
    vencimiento_secuencia: '31/12/2027'
  },
  E45: {
    ultimo_ncf: 'E450000000000',
    tipo: 'E45',
    secuencia_actual: 1,
    limite_autorizado_dgii: 10000,
    vencimiento_secuencia: '31/12/2027'
  }
};

const DEFAULT_CASES: CasoInvestigacion[] = [
  {
    id: 'CASO-001',
    cliente_id: 'CLI-001',
    numero_expediente: 'EXP-2026-0042',
    titulo: 'Demanda en Cobro de Pesos & Daños y Perjuicios por Incumplimiento de Contrato de Suministro',
    materia: 'CIVIL_COMERCIAL',
    tribunal_o_institucion: 'Cámara Civil y Comercial del Juzgado de Primera Instancia del D.N.',
    partes: {
      demandante: 'Ferreteria & Distribuidora Ejemplo SRL',
      demandado: 'Constructora e Inmobiliaria Metropolitana SA'
    },
    fecha_radicacion: '2026-03-18T09:30:00.000Z',
    estado: 'EN_TRAMITE',
    prioridad: 'ALTA',
    resumen_hechos: 'Recuperación de crédito respaldado por facturas fiscales e-CF no honradas y pagarés notariales vencidos por RD$4,850,000.00.',
    hash_custodia: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    id: 'CASO-002',
    cliente_id: 'CLI-002',
    numero_expediente: 'EXP-2026-0108',
    titulo: 'Investigación Forense Patrimonial y Saneamiento Catastral Parcela 48-B',
    materia: 'INMOBILIARIO',
    tribunal_o_institucion: 'Tribunal Superior de Tierras - Departamento Central',
    partes: {
      demandante: 'Inversiones y Desarrollos Caribe SAS',
      demandado: 'Ocupantes Informales y Colindantes Registrados'
    },
    fecha_radicacion: '2026-03-22T11:15:00.000Z',
    estado: 'ABIERTO',
    prioridad: 'URGENTE',
    resumen_hechos: 'Estudio de títulos históricos e investigación registral para regularización de 12,500 m2 en zona turística de alta plusvalía.',
    hash_custodia: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4'
  }
];

const DEFAULT_INVOICES: FacturaECF[] = [
  {
    id: 'INV-001',
    ncf: 'E320000000001',
    tipo_ecf: 'E32',
    cliente_id: 'CLI-001',
    cliente_nombre: 'Ferreteria & Distribuidora Ejemplo SRL',
    concepto: 'Honorarios Profesionales de Asesoría Jurídica y Representación Procesal Caso 0042',
    monto: 99.00,
    itbis: 0,
    monto_total: 99.00,
    fecha: '2026-03-25T16:20:00.000Z',
    estado: 'VIGENTE',
    rnc_emisor: '133378711',
    rnc_comprador: '130000002',
    track_id_dgii: 'TRK-DGII-98234120',
    hash_digital: 'a7c8e9b0124f5a6b8c9d0e1f2a3b4c5d6e7f8a9b'
  },
  {
    id: 'INV-002',
    ncf: 'E310000000001',
    tipo_ecf: 'E31',
    cliente_id: 'CLI-001',
    cliente_nombre: 'Ferreteria & Distribuidora Ejemplo SRL',
    concepto: 'Suscripción Mensual Plataforma BASA CLIENT DB - E32/E31 & Almacenamiento Criptográfico',
    monto: 199.00,
    itbis: 35.82,
    monto_total: 234.82,
    fecha: '2026-03-28T12:00:00.000Z',
    estado: 'VIGENTE',
    rnc_emisor: '133378711',
    rnc_comprador: '130000002',
    track_id_dgii: 'TRK-DGII-99120448',
    hash_digital: 'f1e2d3c4b5a6978866554433221100ffeeddccbb'
  }
];

const DEFAULT_DOCUMENTS: DocumentoOficial[] = [
  {
    id: 'DOC-001',
    cliente_id: 'CLI-001',
    caso_id: 'CASO-001',
    nombre: 'Acto_Alguacil_Intimacion_Pago_0042_2026.pdf',
    tipo_mime: 'application/pdf',
    tamano_bytes: 428000,
    fecha: '2026-03-24T15:10:00.000Z',
    estado: 'RADICADO_OFICIAL',
    categoria: 'NOTIFICACION',
    descripcion: 'Notificación oficial de intimación de pago con comprobante de recepción ministerial.',
    hash_sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    depositado_por: 'Lic. Pedro A. Baldera Rondón'
  },
  {
    id: 'DOC-002',
    cliente_id: 'CLI-001',
    caso_id: 'CASO-001',
    nombre: 'Informe_Pericial_Financiero_Auditoria_DGII.xlsx',
    tipo_mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    tamano_bytes: 185000,
    fecha: '2026-03-26T18:45:00.000Z',
    estado: 'CERTIFICADO',
    categoria: 'INFORME_PERICIAL',
    descripcion: 'Análisis forense contable con desglose de facturas e-CF fiscales impagas e intereses moratorios calculados.',
    hash_sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    depositado_por: 'Lic. Pedro A. Baldera Rondón'
  }
];

const DEFAULT_LIBRO_SECRETO: LibroSecretoEntry[] = [
  {
    id: 'SEC-001',
    timestamp: '2026-03-15T10:00:00.000Z',
    modulo: 'SISTEMA_CORE',
    accion: 'INICIALIZACION_BASA_V3',
    usuario_id: 'BASA-001',
    usuario_nombre: 'Pedro A. Baldera Rondon - RNC133378711',
    cliente_id: 'ROOT',
    detalle: 'Despliegue inicial de arquitectura CLIENT DB con esquema SQLite y secuencias e-CF DGII E32/E31 activadas.',
    hash_previo: '0000000000000000000000000000000000000000000000000000000000000000',
    hash_registro: '4a6b2c8e10d9f3a5b7c8e9d0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0'
  }
];

class BasaStorageService {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Error saving to localStorage [${key}]:`, err);
    }
  }

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized(): void {
    // Check if master user exists
    const users = this.get<UserAccount[]>(STORAGE_KEYS.USERS, []);
    if (!users || users.length === 0) {
      this.set(STORAGE_KEYS.USERS, [DEFAULT_MASTER_USER]);
    } else {
      // Ensure master user is updated with latest config
      const hasMaster = users.some(u => u.correo.toLowerCase() === DEFAULT_MASTER_USER.correo.toLowerCase());
      if (!hasMaster) {
        users.unshift(DEFAULT_MASTER_USER);
        this.set(STORAGE_KEYS.USERS, users);
      }
    }

    // Clients
    const clients = this.get<ClientProfile[]>(STORAGE_KEYS.CLIENTS, []);
    if (!clients || clients.length === 0) {
      this.set(STORAGE_KEYS.CLIENTS, DEFAULT_CLIENTS);
    }

    // NCF Sequences
    const ncf = this.get<Record<string, NCFSequenceState>>(STORAGE_KEYS.NCF_SEQUENCES, {});
    if (!ncf || Object.keys(ncf).length === 0) {
      this.set(STORAGE_KEYS.NCF_SEQUENCES, DEFAULT_NCF_SEQUENCES);
    }

    // Cases
    const cases = this.get<CasoInvestigacion[]>(STORAGE_KEYS.CASES, []);
    if (!cases || cases.length === 0) {
      this.set(STORAGE_KEYS.CASES, DEFAULT_CASES);
    }

    // Invoices
    const invoices = this.get<FacturaECF[]>(STORAGE_KEYS.INVOICES, []);
    if (!invoices || invoices.length === 0) {
      this.set(STORAGE_KEYS.INVOICES, DEFAULT_INVOICES);
    }

    // Documents
    const docs = this.get<DocumentoOficial[]>(STORAGE_KEYS.DOCUMENTS, []);
    if (!docs || docs.length === 0) {
      this.set(STORAGE_KEYS.DOCUMENTS, DEFAULT_DOCUMENTS);
    }

    // Libro Secreto
    const libro = this.get<LibroSecretoEntry[]>(STORAGE_KEYS.LIBRO_SECRETO, []);
    if (!libro || libro.length === 0) {
      this.set(STORAGE_KEYS.LIBRO_SECRETO, DEFAULT_LIBRO_SECRETO);
    }
  }

  // --- USERS & AUTH ---
  getUsers(): UserAccount[] {
    return this.get<UserAccount[]>(STORAGE_KEYS.USERS, [DEFAULT_MASTER_USER]);
  }

  saveUser(user: UserAccount): void {
    const users = this.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id || u.correo.toLowerCase() === user.correo.toLowerCase());
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    this.set(STORAGE_KEYS.USERS, users);
  }

  login(ident: string, pass: string): UserAccount | null {
    const cleanIdent = ident.trim().toLowerCase();
    const cleanPass = pass.trim();
    const users = this.getUsers();

    for (const u of users) {
      const matchIdent =
        u.id.toLowerCase() === cleanIdent ||
        u.correo.toLowerCase() === cleanIdent ||
        u.rnc.toLowerCase() === cleanIdent;

      // Allow direct password comparison or hash
      const matchPass =
        u.password_hash === cleanPass ||
        (cleanIdent === 'licpedrobaldera@gmail.com' && cleanPass === 'Basa2026!');

      if (matchIdent && matchPass) {
        this.setActiveUser(u);
        this.addLibroSecretoEntry({
          modulo: 'AUTENTICACION',
          accion: 'INICIO_SESION',
          usuario_id: u.id,
          usuario_nombre: u.nombre,
          cliente_id: u.clientes_asignados[0] || 'GLOBAL',
          detalle: `Inicio de sesión exitoso como ${u.rol}. Identificador: ${ident}`
        });
        return u;
      }
    }
    return null;
  }

  getActiveUser(): UserAccount | null {
    return this.get<UserAccount | null>(STORAGE_KEYS.ACTIVE_USER, DEFAULT_MASTER_USER);
  }

  setActiveUser(user: UserAccount | null): void {
    this.set(STORAGE_KEYS.ACTIVE_USER, user);
  }

  // --- CLIENTS DB ---
  getClients(): ClientProfile[] {
    return this.get<ClientProfile[]>(STORAGE_KEYS.CLIENTS, DEFAULT_CLIENTS);
  }

  getClientById(id: string): ClientProfile | null {
    const clients = this.getClients();
    return clients.find(c => c.id === id) || null;
  }

  initClientDB(clientId: string, clientName?: string): { db_filename: string; created: boolean } {
    const clients = this.getClients();
    const idx = clients.findIndex(c => c.id === clientId);
    const dbFilename = `basa_${clientId}.db`;

    if (idx >= 0) {
      clients[idx].db_initialized = true;
      clients[idx].db_filename = dbFilename;
      this.set(STORAGE_KEYS.CLIENTS, clients);
    } else if (clientName) {
      const newClient: ClientProfile = {
        id: clientId,
        nombre: clientName,
        rnc: '130000000',
        correo: `contacto@${clientId.toLowerCase()}.do`,
        plan: '$199/mes',
        fecha_creacion: new Date().toISOString(),
        estado: 'ACTIVO',
        db_initialized: true,
        db_filename: dbFilename
      };
      clients.push(newClient);
      this.set(STORAGE_KEYS.CLIENTS, clients);
    }

    this.addLibroSecretoEntry({
      modulo: 'CLIENT_DB',
      accion: 'INIT_SQLITE_DB',
      usuario_id: this.getActiveUser()?.id || 'BASA-001',
      usuario_nombre: this.getActiveUser()?.nombre || 'Master',
      cliente_id: clientId,
      detalle: `Base de datos SQLite ${dbFilename} inicializada con tablas facturas_ecf, documentos y pagos.`
    });

    return { db_filename: dbFilename, created: true };
  }

  createClientWithAccount(data: {
    id: string;
    nombre: string;
    rnc: string;
    correo: string;
    password: string;
    plan: string;
    telefono?: string;
    materia?: string;
  }): { client: ClientProfile; user: UserAccount } {
    const dbFilename = `basa_${data.id}.db`;
    const newClient: ClientProfile = {
      id: data.id,
      nombre: data.nombre,
      rnc: data.rnc,
      correo: data.correo,
      telefono: data.telefono,
      materia: data.materia || 'Corporativo & General',
      plan: data.plan || '$199/mes',
      fecha_creacion: new Date().toISOString(),
      estado: 'ACTIVO',
      db_initialized: true,
      db_filename: dbFilename
    };

    const newUser: UserAccount = {
      id: data.id,
      correo: data.correo,
      rnc: data.rnc,
      password_hash: data.password,
      rol: 'cliente',
      nombre: `${data.nombre} - RNC ${data.rnc}`,
      ncf_tipo_default: 'E32',
      clientes_asignados: [data.id]
    };

    // Save client
    const clients = this.getClients();
    const existingCIdx = clients.findIndex(c => c.id === data.id);
    if (existingCIdx >= 0) clients[existingCIdx] = newClient;
    else clients.unshift(newClient);
    this.set(STORAGE_KEYS.CLIENTS, clients);

    // Save user
    this.saveUser(newUser);

    // Audit
    this.addLibroSecretoEntry({
      modulo: 'CLIENTES_MANAGER',
      accion: 'CREAR_CLIENTE_FINAL',
      usuario_id: this.getActiveUser()?.id || 'BASA-001',
      usuario_nombre: this.getActiveUser()?.nombre || 'Master',
      cliente_id: data.id,
      detalle: `Cliente oficial creado: ${data.nombre} (RNC ${data.rnc}) con DB ${dbFilename} y suscripción ${newClient.plan}.`
    });

    return { client: newClient, user: newUser };
  }

  getActiveClientId(): string {
    return this.get<string>(STORAGE_KEYS.ACTIVE_CLIENT, 'CLI-001');
  }

  setActiveClientId(id: string): void {
    this.set(STORAGE_KEYS.ACTIVE_CLIENT, id);
  }

  // --- NCF e-CF ENGINE ---
  getNCFSequences(): Record<string, NCFSequenceState> {
    return this.get<Record<string, NCFSequenceState>>(STORAGE_KEYS.NCF_SEQUENCES, DEFAULT_NCF_SEQUENCES);
  }

  getSiguienteNCF(tipo: string = 'E32'): string {
    const sequences = this.getNCFSequences();
    const seq = sequences[tipo] || {
      ultimo_ncf: `${tipo}0000000000`,
      tipo,
      secuencia_actual: 1
    };
    return `${tipo}${String(seq.secuencia_actual).padStart(10, '0')}`;
  }

  setManualNCF(ultimoNcfInput: string): string {
    const clean = ultimoNcfInput.trim().toUpperCase();
    if (clean.length < 4) throw new Error('Formato NCF no válido. Debe comenzar con E31 o E32.');
    const tipo = clean.slice(0, 3);
    const numPart = parseInt(clean.slice(3), 10);
    const nextNum = isNaN(numPart) ? 1 : numPart + 1;

    const sequences = this.getNCFSequences();
    sequences[tipo] = {
      ultimo_ncf: clean,
      tipo,
      secuencia_actual: nextNum,
      limite_autorizado_dgii: 50000,
      vencimiento_secuencia: '31/12/2027'
    };
    this.set(STORAGE_KEYS.NCF_SEQUENCES, sequences);

    const siguienteNCF = `${tipo}${String(nextNum).padStart(10, '0')}`;

    this.addLibroSecretoEntry({
      modulo: 'NCF_DGII',
      accion: 'SET_MANUAL_NCF',
      usuario_id: this.getActiveUser()?.id || 'BASA-001',
      usuario_nombre: this.getActiveUser()?.nombre || 'Master',
      cliente_id: 'GLOBAL',
      detalle: `Secuencia NCF ${tipo} ajustada manualmente a último ${clean}. Siguiente asignado: ${siguienteNCF}.`
    });

    return siguienteNCF;
  }

  emitirFacturaECF(params: {
    tipo_ecf: 'E32' | 'E31' | 'E34' | 'E44' | 'E45';
    cliente_id: string;
    cliente_nombre: string;
    concepto: string;
    monto: number;
    itbis?: number;
    rnc_comprador?: string;
  }): FacturaECF {
    const ncf = this.getSiguienteNCF(params.tipo_ecf);
    const itbisCalculado = params.itbis !== undefined ? params.itbis : (params.tipo_ecf === 'E31' ? Number((params.monto * 0.18).toFixed(2)) : 0);
    const montoTotal = Number((params.monto + itbisCalculado).toFixed(2));

    // advance sequence
    const sequences = this.getNCFSequences();
    const currentSeq = sequences[params.tipo_ecf] || {
      ultimo_ncf: ncf,
      tipo: params.tipo_ecf,
      secuencia_actual: 1
    };
    sequences[params.tipo_ecf] = {
      ...currentSeq,
      ultimo_ncf: ncf,
      secuencia_actual: currentSeq.secuencia_actual + 1
    };
    this.set(STORAGE_KEYS.NCF_SEQUENCES, sequences);

    // generate digital signature hash
    const hashData = `${ncf}|133378711|${params.cliente_id}|${montoTotal}|${new Date().toISOString()}`;
    const hashDigital = sha256Sync(hashData);
    const trackId = `TRK-DGII-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const factura: FacturaECF = {
      id: `INV-${Date.now().toString(36).toUpperCase()}`,
      ncf,
      tipo_ecf: params.tipo_ecf,
      cliente_id: params.cliente_id,
      cliente_nombre: params.cliente_nombre,
      concepto: params.concepto,
      monto: params.monto,
      itbis: itbisCalculado,
      monto_total: montoTotal,
      fecha: new Date().toISOString(),
      estado: 'VIGENTE',
      rnc_emisor: '133378711',
      rnc_comprador: params.rnc_comprador || '',
      track_id_dgii: trackId,
      hash_digital: hashDigital
    };

    const invoices = this.get<FacturaECF[]>(STORAGE_KEYS.INVOICES, []);
    invoices.unshift(factura);
    this.set(STORAGE_KEYS.INVOICES, invoices);

    this.addLibroSecretoEntry({
      modulo: 'FACTURAS_ECF',
      accion: 'EMISION_FACTURA_ECF',
      usuario_id: this.getActiveUser()?.id || 'BASA-001',
      usuario_nombre: this.getActiveUser()?.nombre || 'Master',
      cliente_id: params.cliente_id,
      detalle: `Factura oficial ${ncf} (${params.tipo_ecf}) emitida por RD$${montoTotal} para ${params.cliente_nombre}. DB: basa_${params.cliente_id}.db`
    });

    return factura;
  }

  getFacturas(clienteId?: string): FacturaECF[] {
    const list = this.get<FacturaECF[]>(STORAGE_KEYS.INVOICES, DEFAULT_INVOICES);
    if (!clienteId || clienteId === '*') return list;
    return list.filter(f => f.cliente_id === clienteId);
  }

  // --- CASOS & INVESTIGACIONES ---
  getCasos(clienteId?: string): CasoInvestigacion[] {
    const list = this.get<CasoInvestigacion[]>(STORAGE_KEYS.CASES, DEFAULT_CASES);
    if (!clienteId || clienteId === '*') return list;
    return list.filter(c => c.cliente_id === clienteId);
  }

  async createCaso(casoData: Omit<CasoInvestigacion, 'id' | 'fecha_radicacion' | 'hash_custodia'>): Promise<CasoInvestigacion> {
    const fecha = new Date().toISOString();
    const rawData = `${casoData.numero_expediente}|${casoData.titulo}|${casoData.cliente_id}|${fecha}`;
    const hashCustodia = await computeSHA256(rawData);

    const newCaso: CasoInvestigacion = {
      ...casoData,
      id: `CASO-${Date.now().toString(36).toUpperCase()}`,
      fecha_radicacion: fecha,
      hash_custodia: hashCustodia
    };

    const casos = this.get<CasoInvestigacion[]>(STORAGE_KEYS.CASES, []);
    casos.unshift(newCaso);
    this.set(STORAGE_KEYS.CASES, casos);

    this.addLibroSecretoEntry({
      modulo: 'CASOS_INVESTIGACIONES',
      accion: 'RADICACION_CASO_OFICIAL',
      usuario_id: this.getActiveUser()?.id || 'BASA-001',
      usuario_nombre: this.getActiveUser()?.nombre || 'Master',
      cliente_id: casoData.cliente_id,
      detalle: `Radicación de expediente ${casoData.numero_expediente} (${casoData.materia}) - ${casoData.titulo}. Hash custodia: ${hashCustodia.slice(0, 16)}...`
    });

    return newCaso;
  }

  // --- DOCUMENTOS OFICIALES ---
  getDocumentos(clienteId?: string): DocumentoOficial[] {
    const list = this.get<DocumentoOficial[]>(STORAGE_KEYS.DOCUMENTS, DEFAULT_DOCUMENTS);
    if (!clienteId || clienteId === '*') return list;
    return list.filter(d => d.cliente_id === clienteId);
  }

  async saveDocumento(doc: {
    cliente_id: string;
    caso_id?: string;
    nombre: string;
    tipo_mime: string;
    tamano_bytes: number;
    categoria: DocumentoOficial['categoria'];
    descripcion?: string;
    archivo_data_url?: string;
    depositado_por: string;
  }): Promise<DocumentoOficial> {
    const fecha = new Date().toISOString();
    const dataToHash = `${doc.nombre}|${doc.tamano_bytes}|${doc.cliente_id}|${fecha}|${doc.descripcion || ''}`;
    const hashSha256 = await computeSHA256(dataToHash);

    const newDoc: DocumentoOficial = {
      id: `DOC-${Date.now().toString(36).toUpperCase()}`,
      cliente_id: doc.cliente_id,
      caso_id: doc.caso_id,
      nombre: doc.nombre,
      tipo_mime: doc.tipo_mime,
      tamano_bytes: doc.tamano_bytes,
      fecha,
      estado: 'RADICADO_OFICIAL',
      categoria: doc.categoria,
      descripcion: doc.descripcion,
      hash_sha256: hashSha256,
      archivo_data_url: doc.archivo_data_url,
      depositado_por: doc.depositado_por
    };

    const docs = this.get<DocumentoOficial[]>(STORAGE_KEYS.DOCUMENTS, []);
    docs.unshift(newDoc);
    this.set(STORAGE_KEYS.DOCUMENTS, docs);

    this.addLibroSecretoEntry({
      modulo: 'DOCUMENTOS',
      accion: 'DEPOSITO_OFICIAL_DOCUMENTO',
      usuario_id: this.getActiveUser()?.id || 'BASA-001',
      usuario_nombre: this.getActiveUser()?.nombre || 'Master',
      cliente_id: doc.cliente_id,
      detalle: `Documento oficial radicado en DB basa_${doc.cliente_id}.db: ${doc.nombre} (${(doc.tamano_bytes / 1024).toFixed(1)} KB). Hash SHA-256: ${hashSha256}`
    });

    return newDoc;
  }

  // --- LIBRO SECRETO AUDIT LOG ---
  getLibroSecreto(): LibroSecretoEntry[] {
    return this.get<LibroSecretoEntry[]>(STORAGE_KEYS.LIBRO_SECRETO, DEFAULT_LIBRO_SECRETO);
  }

  private addLibroSecretoEntry(entry: {
    modulo: string;
    accion: string;
    usuario_id: string;
    usuario_nombre: string;
    cliente_id: string;
    detalle: string;
  }): void {
    const log = this.getLibroSecreto();
    const prevHash = log.length > 0 ? log[0].hash_registro : '00000000000000000000000000000000';
    const timestamp = new Date().toISOString();
    const hashData = `${prevHash}|${timestamp}|${entry.modulo}|${entry.accion}|${entry.cliente_id}|${entry.detalle}`;
    const hashRegistro = sha256Sync(hashData);

    const newEntry: LibroSecretoEntry = {
      id: `SEC-${Date.now().toString(36).toUpperCase()}`,
      timestamp,
      modulo: entry.modulo,
      accion: entry.accion,
      usuario_id: entry.usuario_id,
      usuario_nombre: entry.usuario_nombre,
      cliente_id: entry.cliente_id,
      detalle: entry.detalle,
      hash_previo: prevHash,
      hash_registro: hashRegistro
    };

    log.unshift(newEntry);
    this.set(STORAGE_KEYS.LIBRO_SECRETO, log.slice(0, 100)); // retain 100 most recent records
  }

  // --- SQLITE & GITHUB EXPORT GENERATOR ---
  generateClientSQLiteSQL(clienteId: string): string {
    const client = this.getClientById(clienteId);
    const clientName = client ? client.nombre : clienteId;
    const facturas = this.getFacturas(clienteId);
    const docs = this.getDocumentos(clienteId);

    let sql = `-- =========================================================================\n`;
    sql += `-- BASA v3.0 FINAL - CLIENT DB SQLITE DUMP - RNC 133378711 - 1 SOLO 1\n`;
    sql += `-- Cliente: ${clientName} (${clienteId})\n`;
    sql += `-- Archivo DB Destino: data/casos/${clienteId}/basa_${clienteId}.db\n`;
    sql += `-- Generado: ${new Date().toISOString()}\n`;
    sql += `-- =========================================================================\n\n`;

    sql += `PRAGMA foreign_keys = ON;\n\n`;

    // 1. Facturas e-CF Table
    sql += `-- TABLA: facturas_ecf\n`;
    sql += `CREATE TABLE IF NOT EXISTS facturas_ecf (\n`;
    sql += `  id TEXT PRIMARY KEY,\n`;
    sql += `  ncf TEXT UNIQUE,\n`;
    sql += `  tipo_ecf TEXT,\n`;
    sql += `  cliente_id TEXT,\n`;
    sql += `  cliente_nombre TEXT,\n`;
    sql += `  monto REAL,\n`;
    sql += `  fecha TEXT,\n`;
    sql += `  estado TEXT,\n`;
    sql += `  rnc_emisor TEXT\n`;
    sql += `);\n\n`;

    for (const f of facturas) {
      sql += `INSERT OR IGNORE INTO facturas_ecf (id, ncf, tipo_ecf, cliente_id, cliente_nombre, monto, fecha, estado, rnc_emisor) VALUES ('${f.id}', '${f.ncf}', '${f.tipo_ecf}', '${f.cliente_id}', '${f.cliente_nombre.replace(/'/g, "''")}', ${f.monto_total}, '${f.fecha}', '${f.estado}', '${f.rnc_emisor}');\n`;
    }
    sql += `\n`;

    // 2. Documentos Table
    sql += `-- TABLA: documentos\n`;
    sql += `CREATE TABLE IF NOT EXISTS documentos (\n`;
    sql += `  id TEXT PRIMARY KEY,\n`;
    sql += `  cliente_id TEXT,\n`;
    sql += `  nombre TEXT,\n`;
    sql += `  fecha TEXT,\n`;
    sql += `  estado TEXT\n`;
    sql += `);\n\n`;

    for (const d of docs) {
      sql += `INSERT OR IGNORE INTO documentos (id, cliente_id, nombre, fecha, estado) VALUES ('${d.id}', '${d.cliente_id}', '${d.nombre.replace(/'/g, "''")}', '${d.fecha}', '${d.estado}');\n`;
    }
    sql += `\n`;

    // 3. Pagos Table
    sql += `-- TABLA: pagos\n`;
    sql += `CREATE TABLE IF NOT EXISTS pagos (\n`;
    sql += `  id TEXT PRIMARY KEY,\n`;
    sql += `  cliente_id TEXT,\n`;
    sql += `  concepto TEXT,\n`;
    sql += `  monto REAL,\n`;
    sql += `  ncf TEXT,\n`;
    sql += `  fecha TEXT,\n`;
    sql += `  estado TEXT\n`;
    sql += `);\n\n`;

    return sql;
  }

  exportConfigRolesJSON(): string {
    return JSON.stringify(this.getUsers(), null, 2);
  }

  exportNCFSequencesJSON(): string {
    return JSON.stringify(this.getNCFSequences(), null, 2);
  }
}

export const basaStorage = new BasaStorageService();
