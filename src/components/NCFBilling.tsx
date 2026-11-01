import React, { useState } from 'react';
import { basaStorage } from '../services/storage';
import { FacturaECF, ClientProfile } from '../types';
import {
  Receipt,
  CheckCircle2,
  AlertCircle,
  Printer,
  Download,
  Settings,
  Shield,
  Building,
  DollarSign,
  FileCheck
} from 'lucide-react';
import { InvoicePrintModal } from './InvoicePrintModal';

interface NCFBillingProps {
  activeClientId: string;
  clients: ClientProfile[];
}

export const NCFBilling: React.FC<NCFBillingProps> = ({ activeClientId, clients }) => {
  const currentClient = basaStorage.getClientById(activeClientId) || clients[0] || null;

  // Invoice form state matching script defaults
  const [tipoSelect, setTipoSelect] = useState<'E32 - $99 TU CASO' | 'E31 - B2B con RNC' | 'E34 - Nota de Crédito'>('E32 - $99 TU CASO');
  const tipo = tipoSelect.split(' - ')[0] as 'E32' | 'E31' | 'E34';

  const [nom, setNom] = useState(currentClient ? currentClient.nombre : 'Cliente Demo');
  const [rncComprador, setRncComprador] = useState(currentClient ? currentClient.rnc : '130000002');
  const [concepto, setConcepto] = useState('Honorarios Profesionales de Asesoría Jurídica y Radicación Oficial de Caso');
  const [mon, setMon] = useState<number>(tipoSelect.startsWith('E32') ? 99 : 199);
  const [includeItbis, setIncludeItbis] = useState(tipo === 'E31');

  // Manual NCF input state
  const [ult, setUlt] = useState('');
  const [manualMsg, setManualMsg] = useState<string | null>(null);

  // Success Feedback
  const [lastBilledFactura, setLastBilledFactura] = useState<FacturaECF | null>(null);
  const [selectedFacturaForModal, setSelectedFacturaForModal] = useState<FacturaECF | null>(null);

  // List of all invoices
  const [allInvoices, setAllInvoices] = useState<FacturaECF[]>(basaStorage.getFacturas());

  // Current next NCF
  const siguienteNCF = basaStorage.getSiguienteNCF(tipo);

  const handleTipoChange = (newVal: typeof tipoSelect) => {
    setTipoSelect(newVal);
    const newT = newVal.split(' - ')[0] as 'E32' | 'E31';
    if (newT === 'E32') {
      setMon(99);
      setIncludeItbis(false);
      setConcepto('Asesoría Jurídica, Radicación de Caso & Gestión DB - Plan $99 TU CASO');
    } else {
      setMon(199);
      setIncludeItbis(true);
      setConcepto('Suscripción Mensual Plataforma BASA CLIENT DB - E32/E31 & Almacenamiento Criptográfico');
    }
  };

  const handleSetManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ult) return;
    try {
      const nextOne = basaStorage.setManualNCF(ult);
      setManualMsg(`Secuencia ${tipo} actualizada con éxito. Siguiente NCF autorizado: ${nextOne}`);
      setUlt('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar secuencia';
      setManualMsg(`Error: ${errorMessage}`);
    }
  };

  const handleFacturar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || mon <= 0) return;

    const itbisAmount = includeItbis ? Number((mon * 0.18).toFixed(2)) : 0;

    const newFactura = basaStorage.emitirFacturaECF({
      tipo_ecf: tipo,
      cliente_id: activeClientId,
      cliente_nombre: nom,
      concepto,
      monto: mon,
      itbis: itbisAmount,
      rnc_comprador: rncComprador,
    });

    setLastBilledFactura(newFactura);
    setAllInvoices(basaStorage.getFacturas());
  };

  const handleQuickDownload = (factura: FacturaECF) => {
    const textContent = `Factura ${factura.ncf} - ${factura.cliente_nombre} - $${factura.monto_total} - RNC133378711 - DB ${factura.cliente_id}`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Factura_${factura.ncf}_${factura.cliente_id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Title Banner matching script exact headline */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  1 SOLO 1 - NCF E32/E31
                </h2>
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  Cliente {activeClientId}
                </span>
                <span className="text-xs text-slate-300 font-mono font-semibold">
                  RNC 133378711
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Facturación Electrónica e-CF con validez DGII y asignación a la base de datos SQLite del cliente.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-right">
            <span className="text-[11px] text-slate-400 block">Siguiente NCF Asignado:</span>
            <span className="text-sm font-mono font-black text-amber-400 tracking-wider">
              {siguienteNCF}
            </span>
          </div>
        </div>

        {/* Success notification following script exact copy */}
        {lastBilledFactura && (
          <div className="mt-4 p-4 bg-emerald-950/70 border border-emerald-500/50 rounded-xl space-y-3">
            <div className="flex items-start gap-3 text-xs text-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">FACTURACIÓN EXITOSA:</strong> Factura{' '}
                <span className="font-mono text-amber-300 font-bold">{lastBilledFactura.ncf}</span> - Guardada en DB{' '}
                <span className="font-mono font-bold text-white">{activeClientId}</span> (data/casos/{activeClientId}/basa_{activeClientId}.db) - RNC133378711 - FINAL
              </div>
            </div>

            <div className="flex items-center gap-2 pl-8">
              <button
                onClick={() => setSelectedFacturaForModal(lastBilledFactura)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Ver Comprobante con QR Fiscal</span>
              </button>
              <button
                onClick={() => handleQuickDownload(lastBilledFactura)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar {lastBilledFactura.ncf}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Facturar Form + Sincronización Manual DGII */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Emisión de Factura e-CF */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-400" />
              <span>Emitir Comprobante Fiscal Electrónico (e-CF)</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Emisor RNC: <strong className="text-amber-300">133378711</strong>
            </span>
          </div>

          <form onSubmit={handleFacturar} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tipo de Comprobante e-CF
              </label>
              <select
                value={tipoSelect}
                onChange={(e) => handleTipoChange(e.target.value as typeof tipoSelect)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-amber-300 font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none"
              >
                <option value="E32 - $99 TU CASO">E32 - $99 TU CASO (Factura de Consumo Electrónica)</option>
                <option value="E31 - B2B con RNC">E31 - B2B con RNC (Crédito Fiscal Electrónico)</option>
                <option value="E34 - Nota de Crédito">E34 - Nota de Crédito Electrónica</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cliente / Receptor
                </label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Cliente Demo"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  RNC / Cédula Receptor
                </label>
                <input
                  type="text"
                  value={rncComprador}
                  onChange={(e) => setRncComprador(e.target.value)}
                  placeholder="130000002"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Concepto / Descripción del Servicio Legal o Caso
              </label>
              <input
                type="text"
                required
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Monto Base (USD / DOP)
                </label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={mon}
                    onChange={(e) => setMon(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs font-mono font-bold text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={includeItbis}
                    onChange={(e) => setIncludeItbis(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Aplicar ITBIS 18% (${(mon * 0.18).toFixed(2)})</span>
                </label>
                <div className="text-[11px] font-mono text-amber-300 font-bold mt-1">
                  Total Final: ${(mon + (includeItbis ? mon * 0.18 : 0)).toFixed(2)}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:opacity-95 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Receipt className="w-4 h-4" />
              <span>
                FACTURAR {tipo} - Guardar en DB {activeClientId} - 1 SOLO 1
              </span>
            </button>
          </form>
        </div>

        {/* Right: Sincronización Manual DGII (evitar duplicado) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800">
              <Settings className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">
                Sincronización de Secuencia DGII ({tipo})
              </h3>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Si ya ha emitido comprobantes directamente en la DGII u otro sistema, configure aquí el último número utilizado para continuar correlativamente sin duplicidades.
            </p>

            <form onSubmit={handleSetManual} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Último DGII {tipo} (para evitar duplicado)
                </label>
                <input
                  type="text"
                  placeholder={`${tipo}0000000049`}
                  value={ult}
                  onChange={(e) => setUlt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Set Manual {tipo}</span>
              </button>
            </form>

            {manualMsg && (
              <div className="mt-3 p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-300">
                {manualMsg}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-xs">
              <div className="text-slate-400 font-semibold">Reglas e-CF DGII Oficiales:</div>
              <div className="text-[11px] text-slate-400 space-y-1">
                <div>• Longitud total: 13 caracteres (3 letras + 10 dígitos)</div>
                <div>• Serie E32: Facturas de Consumo Electrónicas</div>
                <div>• Serie E31: Crédito Fiscal Electrónico (B2B con RNC)</div>
                <div>• Emisor Autorizado: RNC 133378711 (Pedro A. Baldera Rondón)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Invoices Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-amber-400" />
            <span>Registro General de Facturas Fiscales Emitidas ({allInvoices.length})</span>
          </h3>
          <span className="text-xs text-slate-400">
            Sincronizado con bases de datos por cliente
          </span>
        </div>

        <div className="border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">NCF e-CF</th>
                <th className="py-2.5 px-4">Tipo</th>
                <th className="py-2.5 px-4">Cliente / Receptor</th>
                <th className="py-2.5 px-4">Cliente DB</th>
                <th className="py-2.5 px-4 text-right">Total</th>
                <th className="py-2.5 px-4">Fecha</th>
                <th className="py-2.5 px-4">Estado</th>
                <th className="py-2.5 px-4 text-right">Comprobante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
              {allInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-amber-300">
                    {inv.ncf}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-200">
                      {inv.tipo_ecf}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white font-medium">
                    {inv.cliente_nombre}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {inv.cliente_id}
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
                      onClick={() => setSelectedFacturaForModal(inv)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-md transition-colors"
                    >
                      Ver Fiscal
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Print Modal */}
      {selectedFacturaForModal && (
        <InvoicePrintModal
          factura={selectedFacturaForModal}
          onClose={() => setSelectedFacturaForModal(null)}
        />
      )}
    </div>
  );
};
