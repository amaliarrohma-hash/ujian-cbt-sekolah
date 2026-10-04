import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  ArrowLeft, 
  ArrowRight, 
  KeyRound, 
  User, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { SchoolSettings } from '../../types/cbt';

interface AdminLoginProps {
  settings: SchoolSettings;
  onLoginSuccess: () => void;
  onBackToRoleSelect: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  settings,
  onLoginSuccess,
  onBackToRoleSelect
}) => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Valid if pin matches settings.adminPin or default 123456
    const cleanPin = pin.trim();
    if (cleanPin === settings.adminPin || cleanPin === '123456') {
      onLoginSuccess();
    } else {
      setErrorMsg('PIN Pengawas atau kata sandi tidak cocok. Silakan coba lagi.');
    }
  };

  const handleQuickFill = () => {
    setUsername('admin');
    setPin(settings.adminPin || '123456');
    setErrorMsg('');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <button
        onClick={onBackToRoleSelect}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Pilihan Peran
      </button>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Autentikasi Pengawas & Guru</h2>
          <p className="text-xs text-slate-500 mt-1">
            Masukkan kredensial pengawas untuk mengakses bank soal dan data nilai ujian
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Username / ID Guru
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-3 text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Contoh: admin atau guru"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              PIN Keamanan Pengawas
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-3 text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                maxLength={10}
                value={pin}
                onChange={e => {
                  setPin(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="PIN Pengawas (Default: 123456)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono font-bold tracking-widest focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Kunci keamanan untuk mencegah siswa mengakses kunci jawaban.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold text-xs shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 transition"
          >
            <span>Masuk ke Panel Guru</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Helper */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={handleQuickFill}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Klik di sini untuk Isi Otomatis PIN Demo (123456)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
