/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { basaStorage } from './services/storage';
import { UserAccount, ClientProfile } from './types';
import { Header } from './components/Header';
import { LoginModal } from './components/LoginModal';
import { ClientManager } from './components/ClientManager';
import { ClientPortal } from './components/ClientPortal';
import { NCFBilling } from './components/NCFBilling';
import { LibroSecreto } from './components/LibroSecreto';
import { GitHubExportModal } from './components/GitHubExportModal';
import { Shield, Database, Plus, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserAccount | null>(() => basaStorage.getActiveUser());
  const [activeTab, setActiveTab] = useState<'manager' | 'portal' | 'billing' | 'secret' | 'github'>('portal');
  const [activeClientId, setActiveClientId] = useState<string>(() => basaStorage.getActiveClientId());
  const [clients, setClients] = useState<ClientProfile[]>(() => basaStorage.getClients());
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [quickDbMsg, setQuickDbMsg] = useState<string | null>(null);

  // Sync dark class on documentElement
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle Logout
  const handleLogout = () => {
    basaStorage.setActiveUser(null);
    setUser(null);
  };

  // Handle Select Client
  const handleSelectClient = (cid: string) => {
    setActiveClientId(cid);
    basaStorage.setActiveClientId(cid);
  };

  // Handle Quick Create/Init DB for active client matching sidebar button
  const handleQuickInitDb = () => {
    const res = basaStorage.initClientDB(activeClientId);
    setClients(basaStorage.getClients());
    setQuickDbMsg(`Base de datos SQLite sincronizada: data/casos/${activeClientId}/${res.db_filename}`);
    setTimeout(() => setQuickDbMsg(null), 4000);
  };

  // If not logged in, show authentication screen
  if (!user) {
    return <LoginModal onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  const activeClientObj = clients.find(c => c.id === activeClientId) || clients[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        activeClientId={activeClientId}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      {/* Sub-header Identity Bar matching script:
          st.markdown(f"**{user['id']} - {user['nombre']} - {user['rol']} - RNC133378711**")
      */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {user.id}
            </span>
            <span className="font-semibold text-white">
              {user.nombre}
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              ({user.rol})
            </span>
            <span className="font-mono text-amber-300 font-bold">
              · RNC 133378711
            </span>
          </div>

          {/* Quick Client DB Switcher & Init matching sidebar in Streamlit */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-slate-400 text-[11px]">ID Cliente DB:</span>
            <div className="flex items-center gap-1.5">
              <select
                value={activeClientId}
                onChange={(e) => handleSelectClient(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1 text-xs text-amber-300 font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} - {c.nombre.slice(0, 20)}
                  </option>
                ))}
              </select>
              <button
                onClick={handleQuickInitDb}
                title="Crear o Inicializar DB Cliente"
                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-semibold rounded-md border border-amber-500/30 transition-colors flex items-center gap-1"
              >
                <Database className="w-3 h-3" />
                <span>Init DB</span>
              </button>
            </div>
          </div>
        </div>

        {quickDbMsg && (
          <div className="max-w-7xl mx-auto mt-2 p-2 bg-emerald-950/70 border border-emerald-500/30 rounded text-[11px] text-emerald-200 font-mono flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{quickDbMsg}</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'manager' && (
          <ClientManager
            onSelectClient={(cid) => {
              handleSelectClient(cid);
              setActiveTab('portal');
            }}
            activeClientId={activeClientId}
          />
        )}

        {activeTab === 'portal' && (
          <ClientPortal
            activeClientId={activeClientId}
            onSelectClient={handleSelectClient}
            clients={clients}
          />
        )}

        {activeTab === 'billing' && (
          <NCFBilling
            activeClientId={activeClientId}
            clients={clients}
          />
        )}

        {activeTab === 'secret' && <LibroSecreto />}

        {activeTab === 'github' && <GitHubExportModal />}
      </main>

      {/* Official Footer matching script caption:
          st.caption(f"BASA 1 SOLO 1 FINAL - Cliente DB {caso_id} - RNC133378711 - Para GitHub - PC y Celular")
      */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-slate-300">
              BASA 1 SOLO 1 FINAL · Cliente DB <span className="text-amber-400 font-mono">{activeClientId}</span>
            </span>
            <span>·</span>
            <span className="font-mono text-slate-400">RNC 133378711</span>
          </div>

          <div className="text-[11px] text-slate-400">
            Para GitHub · PC y Celular · Base de datos SQLite por cliente · Cumplimiento e-CF DGII Ley 32-23
          </div>

          <div className="text-[11px] text-slate-400">
            Lic. Pedro A. Baldera Rondón
          </div>
        </div>
      </footer>
    </div>
  );
}
