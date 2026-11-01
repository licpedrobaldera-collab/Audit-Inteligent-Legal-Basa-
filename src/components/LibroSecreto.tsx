import React, { useState } from 'react';
import { basaStorage } from '../services/storage';
import { LibroSecretoEntry } from '../types';
import { Lock, ShieldAlert, CheckCircle2, Search, Download, Clock } from 'lucide-react';

export const LibroSecreto: React.FC = () => {
  const [entries] = useState<LibroSecretoEntry[]>(basaStorage.getLibroSecreto());
  const [search, setSearch] = useState('');

  const filtered = entries.filter(
    (e) =>
      e.modulo.toLowerCase().includes(search.toLowerCase()) ||
      e.accion.toLowerCase().includes(search.toLowerCase()) ||
      e.detalle.toLowerCase().includes(search.toLowerCase()) ||
      e.cliente_id.toLowerCase().includes(search.toLowerCase()) ||
      e.hash_registro.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownloadLog = () => {
    const json = JSON.stringify(entries, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `libro_secreto_auditoria_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  LIBRO SECRETO & CADENA DE CUSTODIA CRIPTOGRÁFICA
                </h2>
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  data/libro_secreto
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Registro inmutable de trazabilidad legal para radicación de casos, e-CF y operaciones en SQLite.
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadLog}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs border border-amber-500/30 rounded-lg transition-colors whitespace-nowrap self-start md:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Registro JSON</span>
          </button>
        </div>
      </div>

      {/* Search & Audit Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Trazabilidad Forense de Operaciones ({filtered.length})
            </h3>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar acción, cliente o hash..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Fecha & Hora</th>
                <th className="py-2.5 px-4">Módulo / Acción</th>
                <th className="py-2.5 px-4">Cliente DB</th>
                <th className="py-2.5 px-4">Detalle Operacional</th>
                <th className="py-2.5 px-4">Hash Registro SHA-256</th>
                <th className="py-2.5 px-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleString('es-DO')}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-semibold text-white block">{item.accion}</span>
                    <span className="text-[10px] text-amber-400/80 font-mono">{item.modulo}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-300">
                    {item.cliente_id}
                  </td>
                  <td className="py-3 px-4 text-slate-300 max-w-md">
                    {item.detalle}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-amber-300/80">
                    <span title={item.hash_registro}>
                      {item.hash_registro.slice(0, 8)}...{item.hash_registro.slice(-6)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" /> VERIFICADO
                    </span>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-500">
                    No se encontraron registros de auditoría coincidentes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
