import React from 'react';
import { UserAccount } from '../types';
import { Shield, Database, FileText, Receipt, Lock, Github, LogOut, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  activeTab: 'manager' | 'portal' | 'billing' | 'secret' | 'github';
  setActiveTab: (tab: 'manager' | 'portal' | 'billing' | 'secret' | 'github') => void;
  user: UserAccount | null;
  onLogout: () => void;
  activeClientId: string;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  activeClientId,
  isDarkMode,
  setIsDarkMode,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-amber-500/20 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5 text-slate-950" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
                BASA <span className="text-amber-400 font-extrabold">v3.0</span>
              </span>
              <span className="text-[11px] text-amber-300/80 tracking-wide font-mono whitespace-nowrap">
                RNC 133378711 · 1 SOLO 1
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Single-line, clean) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium">
            <button
              onClick={() => setActiveTab('manager')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'manager'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Clientes Manager</span>
            </button>

            <button
              onClick={() => setActiveTab('portal')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'portal'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Portal Casos ({activeClientId})</span>
            </button>

            <button
              onClick={() => setActiveTab('billing')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'billing'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>e-CF DGII (E32/E31)</span>
            </button>

            <button
              onClick={() => setActiveTab('secret')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'secret'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Libro Secreto</span>
            </button>

            <button
              onClick={() => setActiveTab('github')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'github'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Github className="w-3.5 h-3.5" />
              <span>Exportar GitHub / DB</span>
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action & User Session */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
              className="p-2 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-medium text-slate-200 truncate max-w-[160px]">
                    {user.nombre.split(' - ')[0]}
                  </span>
                  <span className="text-[10px] font-mono text-amber-400">
                    {user.rol === 'admin_master_full' ? 'MASTER' : 'CLIENTE'}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  title="Cerrar Sesión"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-800 gap-1 text-xs no-scrollbar">
          <button
            onClick={() => setActiveTab('manager')}
            className={`px-2.5 py-1.5 rounded whitespace-nowrap ${
              activeTab === 'manager' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
            }`}
          >
            Manager
          </button>
          <button
            onClick={() => setActiveTab('portal')}
            className={`px-2.5 py-1.5 rounded whitespace-nowrap ${
              activeTab === 'portal' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
            }`}
          >
            Portal Casos
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-2.5 py-1.5 rounded whitespace-nowrap ${
              activeTab === 'billing' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
            }`}
          >
            e-CF DGII
          </button>
          <button
            onClick={() => setActiveTab('secret')}
            className={`px-2.5 py-1.5 rounded whitespace-nowrap ${
              activeTab === 'secret' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
            }`}
          >
            Libro Secreto
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`px-2.5 py-1.5 rounded whitespace-nowrap ${
              activeTab === 'github' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
            }`}
          >
            GitHub
          </button>
        </div>
      </div>
    </header>
  );
};
