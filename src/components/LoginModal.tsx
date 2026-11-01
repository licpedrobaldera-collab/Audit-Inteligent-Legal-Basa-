import React, { useState } from 'react';
import { basaStorage } from '../services/storage';
import { UserAccount } from '../types';
import { Shield, Lock, Mail, KeyRound, AlertCircle, Sparkles } from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [ident, setIdent] = useState('Licpedrobaldera@gmail.com');
  const [pwd, setPwd] = useState('Basa2026!');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const user = basaStorage.login(ident, pwd);
    if (user) {
      onLoginSuccess(user);
    } else {
      setError('Credenciales inválidas. Ingrese con el correo autorizado (ej: Licpedrobaldera@gmail.com / Basa2026!)');
    }
  };

  const handleUseMaster = () => {
    setIdent('Licpedrobaldera@gmail.com');
    setPwd('Basa2026!');
    const user = basaStorage.login('Licpedrobaldera@gmail.com', 'Basa2026!');
    if (user) {
      onLoginSuccess(user);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Banner inspired by the Streamlit style */}
        <div className="rounded-2xl p-6 sm:p-8 text-center text-white border-2 border-amber-500/80 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 shadow-2xl relative overflow-hidden mb-6">
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-amber-500/20 border border-amber-500/40 mb-4 text-amber-400">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight mb-2">
            BASA v3.0 - 1 SOLO 1
          </h1>
          <p className="text-xs font-mono text-slate-300 font-semibold tracking-wide uppercase">
            RNC 133378711 · CLIENT DB · E32/E31
          </p>
          <div className="mt-3 pt-3 border-t border-slate-800 text-[13px] text-slate-400">
            Cada cliente con su propia base de datos SQLite y radicación oficial
          </div>
        </div>

        {/* Login Form Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white mb-1">Acceso a Plataforma</h2>
            <p className="text-xs text-slate-400">
              Identifíquese con su Correo, ID de Cliente o RNC registrado.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-950/60 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Correo Electrónico / ID / RNC
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={ident}
                  onChange={(e) => setIdent(e.target.value)}
                  placeholder="Licpedrobaldera@gmail.com o CLI-001"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Entrar - 1 SOLO 1</span>
            </button>
          </form>

          {/* Quick Master Credentials Box */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="p-3 bg-slate-950/80 rounded-lg border border-amber-500/20 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Credenciales Master:
                </span>
                <button
                  type="button"
                  onClick={handleUseMaster}
                  className="text-[11px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold px-2 py-0.5 rounded transition-colors"
                >
                  Acceso 1-Click
                </button>
              </div>
              <div className="font-mono text-[11px] text-slate-300 space-y-0.5">
                <div>Usuario: <span className="text-white">Licpedrobaldera@gmail.com</span></div>
                <div>Clave: <span className="text-white">Basa2026!</span></div>
                <div>RNC: <span className="text-amber-300">133378711</span> (Pedro A. Baldera Rondón)</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-slate-400">
          BASA v3.0 Sistema Oficial · Para GitHub, PC y Celular
        </div>
      </div>
    </div>
  );
};
