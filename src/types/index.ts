export type UserRole = 'admin_master_full' | 'cliente';

export interface UserAccount {
  id: string;
  correo: string;
  rnc: string;
  password_hash: string;
  rol: UserRole;
  nombre: string;
  ncf_tipo_default: string;
  clientes_asignados: string[]; // ["*"] for master, or specific client IDs
}

export interface ClientProfile {
  id: string;
  nombre: string;
  rnc: string;
  correo: string;
  telefono?: string;
  materia?: string;
  plan: string; // e.g. "$199/mes" or "$99 TU CASO"
  fecha_creacion: string;
  estado: 'ACTIVO' | 'EN_PROCESO' | 'ARCHIVADO';
  notas?: string;
  db_initialized: boolean;
  db_filename: string; // e.g. "basa_CLI-001.db"
}

export interface FacturaECF {
  id: string;
  ncf: string; // e.g. E320000000001
  tipo_ecf: 'E32' | 'E31' | 'E34' | 'E44' | 'E45';
  cliente_id: string;
  cliente_nombre: string;
  concepto: string;
  monto: number;
  itbis: number;
  monto_total: number;
  fecha: string;
  estado: 'VIGENTE' | 'PAGADA' | 'ANULADA';
  rnc_emisor: string; // "133378711"
  rnc_comprador?: string;
  track_id_dgii?: string;
  hash_digital?: string;
}

export interface DocumentoOficial {
  id: string;
  cliente_id: string;
  caso_id?: string;
  nombre: string;
  tipo_mime: string;
  tamano_bytes: number;
  fecha: string;
  estado: 'VIGENTE' | 'RADICADO_OFICIAL' | 'CERTIFICADO' | 'EN_REVISION';
  categoria: 'EVIDENCIA' | 'EXPEDIENTE_INVESTIGACION' | 'CONTRATO' | 'SENTENCIA' | 'NOTIFICACION' | 'INFORME_PERICIAL' | 'OTRO';
  descripcion?: string;
  hash_sha256: string;
  archivo_data_url?: string; // base64 or blob URL stored in browser
  depositado_por: string;
}

export interface PagoRecord {
  id: string;
  cliente_id: string;
  concepto: string;
  monto: number;
  ncf: string;
  fecha: string;
  metodo: 'TRANSFERENCIA' | 'EFECTIVO' | 'CHEQUE' | 'TARJETA';
  estado: 'COMPLETADO' | 'PENDIENTE' | 'RECHAZADO';
}

export interface CasoInvestigacion {
  id: string;
  cliente_id: string;
  numero_expediente: string; // e.g. EXP-2026-0042
  titulo: string;
  materia: 'PENAL_ECONOMICO' | 'LABORAL' | 'CIVIL_COMERCIAL' | 'TRIBUTARIO_DGII' | 'INMOBILIARIO' | 'INVESTIGACION_PRIVADA' | 'CORPORATIVO';
  tribunal_o_institucion: string;
  partes: {
    demandante: string;
    demandado: string;
  };
  fecha_radicacion: string;
  estado: 'ABIERTO' | 'EN_TRAMITE' | 'DICTAMEN_PENDIENTE' | 'CERRADO_EXITOSO' | 'ARCHIVADO';
  prioridad: 'ALTA' | 'MEDIA' | 'URGENTE';
  resumen_hechos: string;
  hash_custodia: string;
}

export interface NCFSequenceState {
  ultimo_ncf: string;
  tipo: string;
  secuencia_actual: number;
  limite_autorizado_dgii?: number;
  vencimiento_secuencia?: string;
}

export interface LibroSecretoEntry {
  id: string;
  timestamp: string;
  modulo: string;
  accion: string;
  usuario_id: string;
  usuario_nombre: string;
  cliente_id: string;
  detalle: string;
  hash_previo: string;
  hash_registro: string;
}
