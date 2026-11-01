import React, { useState } from 'react';
import { basaStorage } from '../services/storage';
import { ClientProfile } from '../types';
import {
  Users,
  PlusCircle,
  Database,
  Building,
  Mail,
  Lock,
  Download,
  FolderOpen,
  Receipt,
  Search,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface ClientManagerProps {
  onSelectClient: (clientId: string) => void;
  activeClientId: string;
}

export const ClientManager: React.FC<ClientManagerProps> = ({
  onSelectClient,
  activeClientId,
}) => {
  const [clients, setClients] = useState<ClientProfile[]>(basaStorage.getClients());
  const [search, setSearch] = useState('');

  // Form state initialized matching script defaults
  const generateNewId = () => `CLI-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const [nid, setNid] = useState(generateNewId());
  const [nom, setNom] = useState('Ferreteria & Distribuidora Ejemplo SRL');
  const [rnc, setRnc] = useState('130000002');
  const [cor, setCor] = useState('cliente@empresa.com');
  const [pw, setPw] = useState('Cliente2026!');
  const [plan, setPlan] = useState('$199/mes');
  const [materia, setMateria] = useState('Corporativo & Litigio Mercantil');
  const [lastCreatedMsg, setLastCreatedMsg] = useState<string | null>(null);

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nid || !nom || !rnc || !cor || !pw) return;

    const result = basaStorage.createClientWithAccount({
      id: nid,
      nombre: nom,
      rnc,
      correo: cor,
      password: pw,
      plan,
      materia,
    });

    setClients(basaStorage.getClients());
    setLastCreatedMsg(
      `CREADO EXITOSO: ${result.client.id} - ${result.client.nombre} | DB: data/casos/${result.client.id}/${result.client.db_filename} | Login: ${result.user.correo} / ${pw} | Plan: ${result.client.plan}`
    );

    // regenerate ID for next entry
    setNid(generateNewId());
  };

  const handleInitDB = (cid: string, cname: string) => {
    const res = basaStorage.initClientDB(cid, cname);
    setClients(basaStorage.getClients());
    setLastCreatedMsg(`DB Sincronizada y Lista: data/casos/${cid}/${res.db_filename}`);
  };

  const handleDownloadSQL = (cid: string) => {
    const sqlContent = basaStorage.generateClientSQLiteSQL(cid);
    const blob = new Blob([sqlContent], { type: 'application/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `basa_${cid}_schema_dump.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredClients = clients.filter(
    (c) =>
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.rnc.includes(search)
  );

  return (
    <div className="space-y-8">
      {/* Module Title Banner */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                1 SOLO 1 - CLIENTES MANAGER
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Creación y Administración de Clientes con Base de Datos Propia SQLite (<span className="text-amber-300 font-mono">data/casos/{'{id}'}/basa_{'{id}'}.db</span>)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Total Clientes DB:</span>
            <span className="text-sm font-bold text-amber-400 font-mono bg-slate-950 px-3 py-1 rounded-md border border-slate-800">
              {clients.length} Registrados
            </span>
          </div>
        </div>

        {lastCreatedMsg && (
          <div className="mt-4 p-3.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-start gap-3 text-xs text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="font-mono break-all">{lastCreatedMsg}</div>
          </div>
        )}
      </div>

      {/* Grid: Create Client Form + Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Crear Cliente con DB Propia */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Nuevo Cliente & DB Dedicada</h3>
            </div>
            <span className="text-[11px] font-mono text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded">
              Plan $199/mes
            </span>
          </div>

          <form onSubmit={handleCreateClient} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">ID Cliente</label>
                  <button
                    type="button"
                    onClick={() => setNid(generateNewId())}
                    className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <RefreshCw className="w-2.5 h-2.5" /> Auto
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={nid}
                  onChange={(e) => setNid(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">RNC / Cédula</label>
                <input
                  type="text"
                  required
                  value={rnc}
                  onChange={(e) => setRnc(e.target.value)}
                  placeholder="130000002"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre / Razón Social
              </label>
              <div className="relative">
                <Building className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ferreteria Ejemplo SRL"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  <input
                    type="email"
                    required
                    value={cor}
                    onChange={(e) => setCor(e.target.value)}
                    placeholder="cliente@empresa.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-7 pr-2 py-2 text-xs text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Contraseña Acceso
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    required
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-7 pr-2 py-2 text-xs font-mono text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Materia Principal
                </label>
                <select
                  value={materia}
                  onChange={(e) => setMateria(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="Corporativo & Litigio Mercantil">Corporativo & Mercantil</option>
                  <option value="Inmobiliario & Títulos de Tierras">Inmobiliario & Tierras</option>
                  <option value="Laboral & Seguridad Social">Laboral</option>
                  <option value="Tributario & Fiscal DGII">Tributario DGII</option>
                  <option value="Penal Económico & Auditoría">Penal Económico</option>
                  <option value="Investigación Forense Patrimonial">Investigación Forense</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Plan de Facturación
                </label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-amber-300 font-semibold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="$199/mes">$199/mes (Suscripción Full DB)</option>
                  <option value="$99 TU CASO">$99 TU CASO (Caso Específico E32)</option>
                  <option value="$499/mes">$499/mes (Corporativo Enterprise)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:opacity-95 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Database className="w-4 h-4" />
              <span>CREAR CLIENTE FINAL - 1 SOLO 1 - {plan}</span>
            </button>
          </form>

          <div className="mt-4 p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">Configuración Automática:</div>
            <div>• Genera archivo SQLite: <span className="text-amber-400 font-mono">data/casos/{nid}/basa_{nid}.db</span></div>
            <div>• Registra credenciales en <span className="text-slate-300 font-mono">config_roles.json</span></div>
            <div>• Asigna secuencia NCF autorizada para emisión e-CF DGII</div>
          </div>
        </div>

        {/* Right: Client Directory */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                <span>Directorio de Clientes con DB Dedicada</span>
              </h3>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, ID o RNC..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-60 bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredClients.map((client) => {
                const isActive = client.id === activeClientId;
                const facturas = basaStorage.getFacturas(client.id);
                const docs = basaStorage.getDocumentos(client.id);

                return (
                  <div
                    key={client.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-amber-500/5 border-amber-500/50 shadow-sm ring-1 ring-amber-500/30'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {client.id}
                          </span>
                          <h4 className="text-sm font-semibold text-white">{client.nombre}</h4>
                          {isActive && (
                            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                              Activo en Portal
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                          <span>RNC: <strong className="text-slate-300 font-mono">{client.rnc}</strong></span>
                          <span>·</span>
                          <span>{client.correo}</span>
                          <span>·</span>
                          <span className="text-amber-300 font-medium">{client.plan}</span>
                        </div>

                        <div className="mt-2 text-[11px] font-mono text-slate-500 flex items-center gap-2">
                          <span>DB: data/casos/{client.id}/{client.db_filename}</span>
                          <span>·</span>
                          <span>{facturas.length} Facturas e-CF</span>
                          <span>·</span>
                          <span>{docs.length} Documentos</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => onSelectClient(client.id)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                            isActive
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          }`}
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>{isActive ? 'Seleccionado' : 'Abrir Portal'}</span>
                        </button>

                        <button
                          onClick={() => handleDownloadSQL(client.id)}
                          title="Descargar Dump SQL SQLite compatible para GitHub"
                          className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleInitDB(client.id, client.nombre)}
                          title="Re-sincronizar DB SQLite"
                          className="p-1.5 text-slate-400 hover:text-amber-400 bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredClients.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500">
                  No se encontraron clientes con el criterio de búsqueda.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
