import React, { useEffect, useState } from 'react';
import { DocumentoOficial, CasoInvestigacion, ClientProfile } from '../types';
import { Shield, Printer, Download, X, CheckCircle, FileText, Lock } from 'lucide-react';
import QRCode from 'qrcode';

interface OfficialActaModalProps {
  documento?: DocumentoOficial;
  caso?: CasoInvestigacion;
  client: ClientProfile | null;
  onClose: () => void;
}

export const OfficialActaModal: React.FC<OfficialActaModalProps> = ({
  documento,
  caso,
  client,
  onClose,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    const hash = documento?.hash_sha256 || caso?.hash_custodia || '133378711';
    const verificationUrl = `https://basa.legal/verificar?rnc=133378711&hash=${hash}`;
    QRCode.toDataURL(verificationUrl, { width: 140, margin: 1 })
      .then(setQrUrl)
      .catch(console.error);
  }, [documento, caso]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    const content = `================================================================================
ACTA OFICIAL DE RADICACIÓN Y CONSTANCIA DE CUSTODIA LEGAL
REPÚBLICA DOMINICANA - SISTEMA BASA v3.0 - RNC 133378711
================================================================================
EXPEDIENTE / CASO: ${caso?.numero_expediente || 'EXP-2026-OFICIAL'}
TÍTULO: ${caso?.titulo || documento?.nombre || 'PROYECTO DE INVESTIGACIÓN Y EXPEDIENTE JURÍDICO'}
MATERIA: ${caso?.materia || 'CIVIL Y COMERCIAL'}
CLIENTE DB: ${client?.nombre || 'CLIENTE REGISTRADO'} (ID: ${client?.id || 'CLI-001'}, RNC: ${client?.rnc || '130000002'})
DATABASE ARCHIVO: data/casos/${client?.id || 'CLI-001'}/basa_${client?.id || 'CLI-001'}.db

DOCUMENTO RADICADO: ${documento?.nombre || 'EXPEDIENTE COMPLETO'}
CATEGORÍA: ${documento?.categoria || 'EXPEDIENTE'}
FECHA DE DEPÓSITO: ${documento?.fecha || caso?.fecha_radicacion || new Date().toISOString()}
FIRMA DIGITAL Y HASH SHA-256 DE INTEGRIDAD LEGAL:
${documento?.hash_sha256 || caso?.hash_custodia}

OFICIAL DEPOSITARIO Y CONSULTOR JURÍDICO EMISOR:
Lic. Pedro A. Baldera Rondón
RNC: 133378711
SISTEMA DE FACTURACIÓN DGII e-CF VINCULADO
================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Acta_Radicacion_${caso?.numero_expediente || documento?.id || 'BASA'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="relative w-full max-w-3xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden print:p-0 print:border-none print:shadow-none">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm tracking-wide">
              Acta Oficial de Radicación & Cadena de Custodia Legal
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={handleDownloadText}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Acta</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-12 space-y-6 text-sm text-slate-800">
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest font-bold text-amber-700">
                Oficina de Asesoría Legal, Litigios & Investigaciones Forenses
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
                Lic. Pedro A. Baldera Rondón
              </h1>
              <div className="text-xs font-mono text-slate-600 mt-1">
                RNC: <strong>133378711</strong> · E-CF DGII E32/E31 · Matrícula CARD Oficial
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Santo Domingo, Distrito Nacional, República Dominicana
              </div>
            </div>

            <div className="text-right sm:self-center">
              {qrUrl && (
                <img
                  src={qrUrl}
                  alt="QR Verificación"
                  className="w-24 h-24 border border-slate-300 rounded p-1 mx-auto sm:ml-auto"
                />
              )}
              <span className="text-[10px] font-mono text-slate-500 block mt-1">
                Verificación Hash DGII/BASA
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center py-2 bg-slate-100 rounded-lg border border-slate-200">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Constancia Oficial de Depósito de Expediente, Evidencia y Cadena de Custodia
            </h2>
            <div className="text-[11px] font-mono text-slate-600">
              BASA v3.0 FINAL · 1 SOLO 1 · Base de Datos SQLite Dedicada
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium">Cliente Titular / DB:</span>
              <div className="font-bold text-slate-900">{client?.nombre || 'Cliente Registrado'}</div>
              <div className="text-slate-600 font-mono">
                ID: {client?.id} · RNC: {client?.rnc}
              </div>
              <div className="text-slate-500 font-mono text-[11px]">
                DB: data/casos/{client?.id}/basa_{client?.id}.db
              </div>
            </div>

            <div className="space-y-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium">Expediente de Referencia:</span>
              <div className="font-bold text-slate-900">
                {caso?.numero_expediente || 'EXP-RAD-2026-OFICIAL'}
              </div>
              <div className="text-slate-600">
                Materia: <strong className="text-slate-900">{caso?.materia || 'Civil & Comercial'}</strong>
              </div>
              <div className="text-slate-600 truncate">
                Instancia: {caso?.tribunal_o_institucion || 'Tribunal / Dependencia Oficial'}
              </div>
            </div>
          </div>

          {/* Case / Document Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b pb-1">
              Detalle del Documento o Proyecto Radicado
            </h3>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Nombre de Archivo:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {documento?.nombre || caso?.titulo}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Categoría Oficial:</span>
                <span className="font-semibold text-slate-800">
                  {documento?.categoria || 'PROYECTO DE INVESTIGACIÓN JURÍDICA'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fecha y Hora de Depósito:</span>
                <span className="font-mono text-slate-800">
                  {new Date(documento?.fecha || caso?.fecha_radicacion || Date.now()).toLocaleString('es-DO')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estado de Validez:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> RADICADO Y CERTIFICADO
                </span>
              </div>
            </div>
          </div>

          {/* Cryptographic Hash Section */}
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Lock className="w-4 h-4" />
              <span>Sello Criptográfico & Hash SHA-256 de Inmutabilidad Legal</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Este identificador garantiza matemáticamente que el contenido depositado no ha sido alterado, mutilado ni modificado desde el momento de su radicación en el sistema.
            </p>
            <div className="p-2 bg-slate-950 rounded border border-slate-800 font-mono text-xs text-amber-300 break-all select-all">
              {documento?.hash_sha256 || caso?.hash_custodia || '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'}
            </div>
          </div>

          {/* Signatures & Certification */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="border-t border-slate-400 pt-2">
              <div className="font-bold text-slate-900">Lic. Pedro A. Baldera Rondón</div>
              <div className="text-slate-600 text-[11px]">Abogado Consultor & Emisor e-CF</div>
              <div className="text-slate-500 font-mono text-[10px]">RNC: 133378711 · BASA Master</div>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <div className="font-bold text-slate-900">{client?.nombre || 'Cliente Depositante'}</div>
              <div className="text-slate-600 text-[11px]">Titular de Base de Datos SQLite</div>
              <div className="text-slate-500 font-mono text-[10px]">RNC: {client?.rnc}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
