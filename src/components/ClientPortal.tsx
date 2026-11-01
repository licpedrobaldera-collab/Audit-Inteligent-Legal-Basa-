import React, { useState, useRef } from 'react';
import { basaStorage } from '../services/storage';
import {
  DocumentoOficial,
  CasoInvestigacion,
  FacturaECF,
  ClientProfile
} from '../types';
import {
  FolderLock,
  Upload,
  FileText,
  FileCheck2,
  FileSpreadsheet,
  FileImage,
  FileCode,
  ShieldCheck,
  Receipt,
  Download,
  Eye,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { OfficialActaModal } from './OfficialActaModal';
import { InvoicePrintModal } from './InvoicePrintModal';

interface ClientPortalProps {
  activeClientId: string;
  onSelectClient: (clientId: string) => void;
  clients: ClientProfile[];
}

export const ClientPortal: React.FC<ClientPortalProps> = ({
  activeClientId,
  onSelectClient,
  clients,
}) => {
  const currentClient = basaStorage.getClientById(activeClientId) || clients[0] || null;

  // Refreshable data
  const [documents, setDocuments] = useState<DocumentoOficial[]>(
    basaStorage.getDocumentos(activeClientId)
  );
  const [cases, setCases] = useState<CasoInvestigacion[]>(
    basaStorage.getCasos(activeClientId)
  );
  const [invoices, setInvoices] = useState<FacturaECF[]>(
    basaStorage.getFacturas(activeClientId)
  );

  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [showNewCaseForm, setShowNewCaseForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected modals
  const [selectedDocForActa, setSelectedDocForActa] = useState<DocumentoOficial | null>(null);
  const [selectedCaseForActa, setSelectedCaseForActa] = useState<CasoInvestigacion | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<FacturaECF | null>(null);

  // Preview file modal
  const [previewDoc, setPreviewDoc] = useState<DocumentoOficial | null>(null);

  // New Case Form state
  const [caseExp, setCaseExp] = useState(`EXP-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [caseTitulo, setCaseTitulo] = useState('');
  const [caseMateria, setCaseMateria] = useState<CasoInvestigacion['materia']>('CIVIL_COMERCIAL');
  const [caseTribunal, setCaseTribunal] = useState('Juzgado de Primera Instancia del D.N.');
  const [caseDemandante, setCaseDemandante] = useState(currentClient ? currentClient.nombre : 'Cliente Titular');
  const [caseDemandado, setCaseDemandado] = useState('');
  const [caseResumen, setCaseResumen] = useState('');
  const [casePrioridad, setCasePrioridad] = useState<CasoInvestigacion['prioridad']>('ALTA');

  // New Doc category
  const [docCategoria, setDocCategoria] = useState<DocumentoOficial['categoria']>('EVIDENCIA');
  const [docDescripcion, setDocDescripcion] = useState('');

  // Handle Client Switch
  const handleClientChange = (newCid: string) => {
    onSelectClient(newCid);
    setDocuments(basaStorage.getDocumentos(newCid));
    setCases(basaStorage.getCasos(newCid));
    setInvoices(basaStorage.getFacturas(newCid));
    setUploadSuccessMsg(null);
  };

  // Handle Multi-file upload matching Streamlit behavior
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadSuccessMsg(null);

    const uploadedNames: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Read file as Data URL for browser preview & storage
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const newDoc = await basaStorage.saveDocumento({
        cliente_id: activeClientId,
        caso_id: cases.length > 0 ? cases[0].id : undefined,
        nombre: file.name,
        tipo_mime: file.type || 'application/octet-stream',
        tamano_bytes: file.size,
        categoria: docCategoria,
        descripcion: docDescripcion || `Documento radicado de manera oficial en DB basa_${activeClientId}.db`,
        archivo_data_url: dataUrl,
        depositado_por: 'Lic. Pedro A. Baldera Rondón - RNC 133378711',
      });

      uploadedNames.push(newDoc.nombre);
    }

    setDocuments(basaStorage.getDocumentos(activeClientId));
    setIsUploading(false);
    setDocDescripcion('');
    setUploadSuccessMsg(
      `Guardado exitoso de ${uploadedNames.length} archivo(s) en DB ${activeClientId} (data/casos/${activeClientId}/basa_${activeClientId}.db): ${uploadedNames.join(', ')}`
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle New Case creation
  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseTitulo || !caseExp) return;

    await basaStorage.createCaso({
      cliente_id: activeClientId,
      numero_expediente: caseExp,
      titulo: caseTitulo,
      materia: caseMateria,
      tribunal_o_institucion: caseTribunal,
      partes: {
        demandante: caseDemandante,
        demandado: caseDemandado || 'Por determinar',
      },
      estado: 'EN_TRAMITE',
      prioridad: casePrioridad,
      resumen_hechos: caseResumen,
    });

    setCases(basaStorage.getCasos(activeClientId));
    setShowNewCaseForm(false);
    setCaseTitulo('');
    setCaseResumen('');
    setCaseDemandado('');
    setCaseExp(`EXP-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setUploadSuccessMsg(`Caso / Expediente Oficial ${caseExp} radicado exitosamente con sello de custodia.`);
  };

  const getDocIcon = (tipo: string, nombre: string) => {
    if (tipo.includes('pdf') || nombre.endsWith('.pdf')) {
      return <FileText className="w-5 h-5 text-rose-400" />;
    }
    if (tipo.includes('sheet') || tipo.includes('csv') || nombre.endsWith('.xlsx')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    }
    if (tipo.includes('image') || nombre.match(/\.(png|jpg|jpeg|webp)$/i)) {
      return <FileImage className="w-5 h-5 text-sky-400" />;
    }
    return <FileCode className="w-5 h-5 text-amber-400" />;
  };

  return (
    <div className="space-y-8">
      {/* Client Selector & Banner */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <FolderLock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  1 SOLO 1 - CLIENTE PORTAL
                </h2>
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  {activeClientId}
                </span>
                <span className="text-xs text-slate-400">Su propia DB</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Cliente: <strong className="text-white">{currentClient?.nombre || activeClientId}</strong> · RNC:{' '}
                <strong className="text-slate-300 font-mono">{currentClient?.rnc || '130000002'}</strong> · SQLite:{' '}
                <span className="font-mono text-amber-300">data/casos/{activeClientId}/basa_{activeClientId}.db</span>
              </p>
            </div>
          </div>

          {/* Quick Client Switcher dropdown */}
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-400 font-medium">Cambiar Cliente DB:</label>
            <select
              value={activeClientId}
              onChange={(e) => handleClientChange(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} - {c.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {uploadSuccessMsg && (
          <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-start gap-2.5 text-xs text-emerald-200">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="font-mono break-all">{uploadSuccessMsg}</div>
          </div>
        )}

        {/* Client KPI metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Facturas en su DB</span>
              <span className="text-2xl font-black font-mono text-white mt-1 block">
                {invoices.length}
              </span>
            </div>
            <Receipt className="w-7 h-7 text-amber-400/80" />
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Documentos & Evidencias</span>
              <span className="text-2xl font-black font-mono text-white mt-1 block">
                {documents.length}
              </span>
            </div>
            <FileCheck2 className="w-7 h-7 text-emerald-400/80" />
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Expedientes / Proyectos</span>
              <span className="text-2xl font-black font-mono text-white mt-1 block">
                {cases.length}
              </span>
            </div>
            <ShieldCheck className="w-7 h-7 text-indigo-400/80" />
          </div>
        </div>
      </div>

      {/* SECTION 1: Radicación Oficial de Casos, Proyectos e Investigación */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>Expedientes Oficiales, Proyectos de Investigación & Causas Jurídicas</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Radicación formal con cadena de custodia legal y hash SHA-256 en base de datos dedicada.
            </p>
          </div>
          <button
            onClick={() => setShowNewCaseForm(!showNewCaseForm)}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center gap-2 self-start sm:self-auto shrink-0 shadow-md shadow-amber-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>{showNewCaseForm ? 'Cerrar Formulario' : 'Radicar Nuevo Caso / Proyecto'}</span>
          </button>
        </div>

        {/* New Case Form */}
        {showNewCaseForm && (
          <form onSubmit={handleCreateCase} className="mb-6 p-5 bg-slate-950 border border-amber-500/40 rounded-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Radicación Oficial de Caso / Investigación
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                DB: basa_{activeClientId}.db
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  No. Expediente Oficial
                </label>
                <input
                  type="text"
                  required
                  value={caseExp}
                  onChange={(e) => setCaseExp(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Materia Jurídica
                </label>
                <select
                  value={caseMateria}
                  onChange={(e) => setCaseMateria(e.target.value as CasoInvestigacion['materia'])}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="CIVIL_COMERCIAL">Civil & Comercial</option>
                  <option value="INMOBILIARIO">Inmobiliario & Tierras</option>
                  <option value="PENAL_ECONOMICO">Penal Económico & Fraudes</option>
                  <option value="TRIBUTARIO_DGII">Tributario & Fiscal DGII</option>
                  <option value="LABORAL">Laboral & Seguridad Social</option>
                  <option value="INVESTIGACION_PRIVADA">Investigación Privada / Forense</option>
                  <option value="CORPORATIVO">Corporativo & Fusiones</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Prioridad Procesal
                </label>
                <select
                  value={casePrioridad}
                  onChange={(e) => setCasePrioridad(e.target.value as CasoInvestigacion['prioridad'])}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-amber-300 font-semibold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="ALTA">Alta</option>
                  <option value="URGENTE">Urgente</option>
                  <option value="MEDIA">Media</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Título de la Causa o Proyecto de Investigación
              </label>
              <input
                type="text"
                required
                value={caseTitulo}
                onChange={(e) => setCaseTitulo(e.target.value)}
                placeholder="Ej: Demanda en Cobro de Pesos y Ejecución de Garantías Hipotecarias..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Demandante / Investigador Principal
                </label>
                <input
                  type="text"
                  value={caseDemandante}
                  onChange={(e) => setCaseDemandante(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Demandado / Entidad Auditada
                </label>
                <input
                  type="text"
                  value={caseDemandado}
                  onChange={(e) => setCaseDemandado(e.target.value)}
                  placeholder="Contraparte o entidad investigada"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tribunal, Fiscalía o Dependencia de Radicación
              </label>
              <input
                type="text"
                value={caseTribunal}
                onChange={(e) => setCaseTribunal(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Resumen Ejecutivo de los Hechos & Elementos Probatorios
              </label>
              <textarea
                rows={2}
                value={caseResumen}
                onChange={(e) => setCaseResumen(e.target.value)}
                placeholder="Breve relación circunstanciada de los hechos, pretensiones jurídicas o hipótesis de investigación..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewCaseForm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-md transition-colors flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Radicar Oficialmente con Sello RNC 133378711</span>
              </button>
            </div>
          </form>
        )}

        {/* Cases List */}
        <div className="space-y-3">
          {cases.map((c) => (
            <div
              key={c.id}
              className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {c.numero_expediente}
                    </span>
                    <span className="text-[11px] font-semibold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800">
                      {c.materia.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      {c.estado}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white">{c.titulo}</h4>

                  <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                    <span>Instancia: <strong className="text-slate-300">{c.tribunal_o_institucion}</strong></span>
                    <span>·</span>
                    <span>Demandante: {c.partes.demandante}</span>
                    <span>·</span>
                    <span>Demandado: {c.partes.demandado}</span>
                  </div>

                  {c.resumen_hechos && (
                    <p className="text-xs text-slate-400 line-clamp-2 max-w-3xl">
                      {c.resumen_hechos}
                    </p>
                  )}

                  <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2">
                    <span>Hash Custodia: {c.hash_custodia?.slice(0, 16)}...</span>
                    <span>·</span>
                    <span>Fecha: {new Date(c.fecha_radicacion).toLocaleDateString('es-DO')}</span>
                  </div>
                </div>

                <div className="shrink-0 self-end lg:self-center">
                  <button
                    onClick={() => setSelectedCaseForActa(c)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-amber-500/30 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Acta de Radicación</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {cases.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-500">
              No hay expedientes o proyectos radicados aún para este cliente. Utilice el botón superior para crear el primero.
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: Subir Documentos Oficiales en su DB */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-400" />
            <span>Subir Documentos para {activeClientId} - Guarda en su DB</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Formatos admitidos: PDF, Excel (.xlsx, .csv), Word (.docx), Imágenes (.png, .jpg), Archivos de Texto (.txt).
            Cada archivo se almacena en <span className="text-amber-300 font-mono">data/casos/{activeClientId}/</span> con sello SHA-256.
          </p>
        </div>

        {/* Upload Dropzone & Category Select */}
        <div className="bg-slate-950 border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl p-6 transition-all text-center">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Upload className="w-6 h-6" />
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-white">
                Seleccione o arrastre los archivos oficiales para este cliente
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Genera hash criptográfico SHA-256 y radicación inmediata en tabla <code>documentos</code>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Categoría Oficial del Documento
                </label>
                <select
                  value={docCategoria}
                  onChange={(e) => setDocCategoria(e.target.value as DocumentoOficial['categoria'])}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="EVIDENCIA">Evidencia Probatoria</option>
                  <option value="EXPEDIENTE_INVESTIGACION">Expediente de Investigación</option>
                  <option value="CONTRATO">Contrato / Pagaré Notarial</option>
                  <option value="NOTIFICACION">Notificación de Alguacil</option>
                  <option value="SENTENCIA">Sentencia / Auto Judicial</option>
                  <option value="INFORME_PERICIAL">Informe Pericial Contable/Técnico</option>
                  <option value="OTRO">Otro Documento Oficial</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Descripción Breve (Opcional)
                </label>
                <input
                  type="text"
                  value={docDescripcion}
                  onChange={(e) => setDocDescripcion(e.target.value)}
                  placeholder="Ej: Acto 104-2026 notificado..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.xlsx,.xls,.docx,.doc,.png,.jpg,.jpeg,.txt,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload-input"
              />
              <label
                htmlFor="file-upload-input"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'Procesando & Firmando...' : 'Examinar Archivos para Subir'}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Uploaded Documents Table */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Documentos Oficiales Depositados ({documents.length})
            </h4>
            <span className="text-[11px] font-mono text-slate-500">
              data/casos/{activeClientId}/
            </span>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Documento</th>
                  <th className="py-2.5 px-4">Categoría</th>
                  <th className="py-2.5 px-4">Tamaño</th>
                  <th className="py-2.5 px-4">Hash SHA-256</th>
                  <th className="py-2.5 px-4">Fecha Depósito</th>
                  <th className="py-2.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {getDocIcon(doc.tipo_mime, doc.nombre)}
                        <div>
                          <div className="font-semibold text-white">{doc.nombre}</div>
                          {doc.descripcion && (
                            <div className="text-[11px] text-slate-400 truncate max-w-xs">
                              {doc.descripcion}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {doc.categoria}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {(doc.tamano_bytes / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-amber-300/80">
                      <span title={doc.hash_sha256}>
                        {doc.hash_sha256.slice(0, 10)}...{doc.hash_sha256.slice(-6)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(doc.fecha).toLocaleDateString('es-DO')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {doc.archivo_data_url && (
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            title="Previsualizar Archivo"
                            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedDocForActa(doc)}
                          title="Generar Acta Oficial de Radicación"
                          className="px-2.5 py-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-md transition-colors whitespace-nowrap"
                        >
                          Ver Acta
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {documents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-slate-500">
                      No hay documentos oficiales cargados en la base de datos de este cliente aún.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 3: Facturas e-CF Registradas en su DB */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-400" />
              <span>Facturas Fiscales e-CF en su Base de Datos</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Registros en tabla <code>facturas_ecf</code> de <span className="font-mono text-amber-300">basa_{activeClientId}.db</span>
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            {invoices.length} e-CF Emitidos
          </span>
        </div>

        <div className="border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">NCF e-CF</th>
                <th className="py-2.5 px-4">Tipo</th>
                <th className="py-2.5 px-4">Cliente / Receptor</th>
                <th className="py-2.5 px-4 text-right">Monto (DOP/USD)</th>
                <th className="py-2.5 px-4">Fecha</th>
                <th className="py-2.5 px-4">Estado</th>
                <th className="py-2.5 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-amber-300">
                    {inv.ncf}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-200">
                      {inv.tipo_ecf}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-200 font-medium">
                    {inv.cliente_nombre}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-white">
                    ${inv.monto_total.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(inv.fecha).toLocaleDateString('es-DO')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {inv.estado}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-md transition-colors"
                    >
                      Ver / Descargar e-CF
                    </button>
                  </td>
                </tr>
              ))}

              {invoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-500">
                    No hay facturas e-CF emitidas aún para este cliente. Puede facturar en el módulo de facturación.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Acta Oficial de Radicación */}
      {(selectedDocForActa || selectedCaseForActa) && (
        <OfficialActaModal
          documento={selectedDocForActa || undefined}
          caso={selectedCaseForActa || undefined}
          client={currentClient}
          onClose={() => {
            setSelectedDocForActa(null);
            setSelectedCaseForActa(null);
          }}
        />
      )}

      {/* MODAL 2: Factura e-CF DGII */}
      {selectedInvoice && (
        <InvoicePrintModal
          factura={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {/* MODAL 3: Preview de Documento */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl p-6 text-white max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {getDocIcon(previewDoc.tipo_mime, previewDoc.nombre)}
                <span className="font-bold text-sm truncate max-w-md">{previewDoc.nombre}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewDoc.archivo_data_url}
                  download={previewDoc.nombre}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto py-4">
              {previewDoc.tipo_mime.startsWith('image/') ? (
                <div className="flex justify-center">
                  <img
                    src={previewDoc.archivo_data_url}
                    alt={previewDoc.nombre}
                    className="max-h-[60vh] rounded-lg border border-slate-800 object-contain"
                  />
                </div>
              ) : previewDoc.tipo_mime.includes('pdf') ? (
                <iframe
                  src={previewDoc.archivo_data_url}
                  className="w-full h-[60vh] rounded-lg border border-slate-800"
                  title={previewDoc.nombre}
                />
              ) : (
                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap">
                  Visualización de documento binario/oficial radicada en base de datos.
                  {`\nNombre: ${previewDoc.nombre}\nTamaño: ${(previewDoc.tamano_bytes / 1024).toFixed(1)} KB\nHash SHA-256: ${previewDoc.hash_sha256}`}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
