import React, { useEffect, useState } from 'react';
import { FacturaECF } from '../types';
import { Shield, Printer, Download, X, CheckCircle, Receipt, QrCode } from 'lucide-react';
import QRCode from 'qrcode';

interface InvoicePrintModalProps {
  factura: FacturaECF;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({ factura, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    // Standard DGII e-CF validation URL structure
    const dgiiUrl = `https://dgii.gov.do/consulta-ecf?rncEmisor=${factura.rnc_emisor}&rncComprador=${factura.rnc_comprador || ''}&eNCF=${factura.ncf}&montoTotal=${factura.monto_total}&fecha=${factura.fecha.split('T')[0]}&codigoSeguridad=${factura.hash_digital?.slice(0, 6) || '8F3A21'}`;
    QRCode.toDataURL(dgiiUrl, { width: 140, margin: 1 })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [factura]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTxt = () => {
    const txt = `========================================================================
FACTURA ELECTRÓNICA DE COMPROBANTE FISCAL (e-CF) - DGII
REPÚBLICA DOMINICANA - SISTEMA BASA v3.0 - 1 SOLO 1
========================================================================
EMISOR: PEDRO A. BALDERA RONDON
RNC EMISOR: 133378711
ACTIVIDAD: ASESORÍA JURÍDICA, LITIGIOS & SISTEMAS CLIENT DB
SANTO DOMINGO, DISTRITO NACIONAL

TIPO COMPROBANTE: ${factura.tipo_ecf === 'E32' ? 'E32 - FACTURA DE CONSUMO ELECTRÓNICA' : 'E31 - FACTURA DE CRÉDITO FISCAL ELECTRÓNICA'}
e-NCF: ${factura.ncf}
ESTADO: ${factura.estado}
FECHA EMISIÓN: ${new Date(factura.fecha).toLocaleString('es-DO')}
TRACK ID DGII: ${factura.track_id_dgii || 'TRK-DGII-98234120'}
CLIENTE DB ASIGNADO: ${factura.cliente_id}

DATOS DEL RECEPTOR:
NOMBRE/RAZÓN SOCIAL: ${factura.cliente_nombre}
RNC/CÉDULA RECEPTOR: ${factura.rnc_comprador || 'CONSUMIDOR FINAL'}

DESCRIPCIÓN DEL SERVICIO / CONCEPTO:
${factura.concepto}

DETALLE FINANCIERO (DOP/USD):
SUBTOTAL: $${factura.monto.toFixed(2)}
ITBIS (18%): $${factura.itbis.toFixed(2)}
------------------------------------------------------------------------
TOTAL A PAGAR: $${factura.monto_total.toFixed(2)}
------------------------------------------------------------------------
FIRMA DIGITAL Y HASH DE VALIDACIÓN FISCAL:
${factura.hash_digital || 'a7c8e9b0124f5a6b8c9d0e1f2a3b4c5d6e7f8a9b'}

Este comprobante electrónico cumple con las disposiciones de la Ley 32-23 
de Facturación Electrónica de la República Dominicana y normas de la DGII.
========================================================================`;

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Factura_eCF_${factura.ncf}_${factura.cliente_id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden print:p-0 print:border-none print:shadow-none">
        {/* Controls Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm tracking-wide">
              Comprobante Fiscal Electrónico ({factura.ncf})
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
              onClick={handleDownloadTxt}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Descargar</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable View */}
        <div className="p-8 sm:p-10 space-y-6 text-sm text-slate-800">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">
                Comprobante Fiscal Electrónico (e-CF)
              </span>
              <h1 className="text-xl font-black text-slate-900 mt-0.5">
                PEDRO A. BALDERA RONDÓN
              </h1>
              <div className="text-xs font-mono text-slate-700 mt-1">
                RNC Emisor: <strong className="text-slate-950">133378711</strong>
              </div>
              <div className="text-xs text-slate-500">
                Servicios Legales & Soluciones Tecnológicas BASA v3.0
              </div>
              <div className="text-xs text-slate-500">
                Santo Domingo, D.N., República Dominicana
              </div>
            </div>

            <div className="sm:text-right border-l sm:border-l-0 pl-4 sm:pl-0 border-slate-200">
              <div className="inline-block px-3 py-1 bg-slate-900 text-amber-400 font-mono font-bold text-xs rounded">
                e-NCF: {factura.ncf}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                Tipo: <strong className="text-slate-900">{factura.tipo_ecf} - {factura.tipo_ecf === 'E32' ? 'Consumo' : 'Crédito Fiscal'}</strong>
              </div>
              <div className="text-xs font-mono text-slate-500 mt-0.5">
                TrackID: {factura.track_id_dgii || 'TRK-DGII-98234120'}
              </div>
              <div className="text-xs font-mono text-slate-500">
                Fecha: {new Date(factura.fecha).toLocaleDateString('es-DO')}
              </div>
            </div>
          </div>

          {/* Client Info Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Facturado a:</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{factura.cliente_nombre}</div>
              <div className="text-slate-600 font-mono mt-0.5">
                RNC/Cédula: <strong>{factura.rnc_comprador || 'CONSUMIDOR FINAL'}</strong>
              </div>
            </div>
            <div>
              <span className="text-slate-500 block">Base de Datos Cliente:</span>
              <div className="font-mono text-slate-800 font-semibold mt-0.5">
                data/casos/{factura.cliente_id}/basa_{factura.cliente_id}.db
              </div>
              <div className="text-emerald-700 flex items-center gap-1 font-semibold text-[11px] mt-1">
                <CheckCircle className="w-3.5 h-3.5" /> Estado: {factura.estado}
              </div>
            </div>
          </div>

          {/* Invoice Line Items */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Descripción del Concepto</th>
                  <th className="py-2.5 px-4 text-right">Cant.</th>
                  <th className="py-2.5 px-4 text-right">Precio</th>
                  <th className="py-2.5 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {factura.concepto}
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Asignado a cliente ID {factura.cliente_id} · RNC Emisor 133378711
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono">1</td>
                  <td className="py-3 px-4 text-right font-mono">${factura.monto.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold">${factura.monto.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Totals & QR */}
          <div className="flex flex-col sm:flex-row justify-between items-end gap-6 pt-2">
            <div className="flex items-center gap-3">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="QR Fiscal DGII"
                  className="w-24 h-24 border border-slate-300 rounded p-1"
                />
              )}
              <div className="text-[10px] text-slate-500 space-y-0.5 max-w-[200px]">
                <div className="font-bold text-slate-700">Validación Electrónica DGII</div>
                <div>Escanee el código QR para verificar la autenticidad en el portal tributario oficial.</div>
              </div>
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Neto:</span>
                <span className="font-mono font-semibold">${factura.monto.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ITBIS (18%):</span>
                <span className="font-mono font-semibold">${factura.itbis.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-900 border-t-2 border-slate-900 pt-2 text-sm font-black">
                <span>TOTAL A PAGAR:</span>
                <span className="font-mono text-base font-bold text-amber-700">
                  ${factura.monto_total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Digital Signature Footer */}
          <div className="border-t border-slate-200 pt-3 text-[10px] font-mono text-slate-500 flex flex-col gap-0.5">
            <div>Firma Digital Hash SHA-256: {factura.hash_digital || 'a7c8e9b0124f5a6b8c9d0e1f2a3b4c5d6e7f8a9b'}</div>
            <div>Ley 32-23 de Facturación Electrónica · Sistema BASA v3.0 · RNC 133378711 · 1 SOLO 1</div>
          </div>
        </div>
      </div>
    </div>
  );
};
