import React from 'react';
import { 
  School, 
  GraduationCap, 
  ShieldCheck, 
  Database, 
  LogOut, 
  User
} from 'lucide-react';
import { SchoolSettings, Student } from '../types/cbt';

interface NavbarProps {
  currentUser: { role: 'student'; student: Student } | { role: 'admin'; username: string } | null;
  onLogout: () => void;
  settings: SchoolSettings;
  dbConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  settings,
  dbConnected
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & School Name */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${
              currentUser?.role === 'admin'
                ? 'bg-gradient-to-tr from-indigo-700 to-slate-800 shadow-indigo-500/20'
                : 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/20'
            }`}>
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                  Ujian CBT
                </span>
                {currentUser?.role === 'student' && (
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" /> Ruang Siswa
                  </span>
                )}
                {currentUser?.role === 'admin' && (
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Panel Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-xs font-medium">
                {settings.schoolName}
              </p>
            </div>
          </div>

          {/* Right Header Navigation */}
          <div className="flex items-center gap-3">
            {/* If logged in as student */}
            {currentUser?.role === 'student' && (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-800 leading-tight">{currentUser.student.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono-numbers">
                      NIS: {currentUser.student.nis} • {currentUser.student.classGrade}
                    </div>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition"
                  title="Logout Siswa"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-400" />
                  <span>Logout</span>
                </button>
              </div>
            )}

            {/* If logged in as admin */}
            {currentUser?.role === 'admin' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-xs font-bold transition"
                  title="Logout Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout Admin</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
