import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  School,
  AlertCircle,
  Database,
  Eye,
  EyeOff
} from 'lucide-react';
import { SchoolSettings, Student, AdminUser } from '../../types/cbt';

interface UnifiedLoginScreenProps {
  settings: SchoolSettings;
  students: Student[];
  admins?: AdminUser[];
  onStudentLogin: (student: Student) => void;
  onAdminLogin: (adminName: string) => void;
}

export const UnifiedLoginScreen: React.FC<UnifiedLoginScreenProps> = ({
  settings,
  students,
  admins = [],
  onStudentLogin,
  onAdminLogin
}) => {
  // Completely separate view mode: 'student' (default) vs 'admin' (dedicated admin portal login)
  const [loginView, setLoginView] = useState<'student' | 'admin'>('student');

  // Student form state
  const [studentNis, setStudentNis] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [showStudentPass, setShowStudentPass] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentError, setStudentError] = useState('');

  // Admin form state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Auto-detect registered student when NIS is typed
  const handleNisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setStudentNis(val);
    setStudentError('');
    const found = students.find(s => s.nis.toLowerCase() === val.toLowerCase());
    if (found) {
      setSelectedStudent(found);
    } else {
      setSelectedStudent(null);
    }
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError('');

    const cleanNis = studentNis.trim();
    const cleanPass = studentPassword.trim();

    if (!cleanNis || !cleanPass) {
      setStudentError('NIS dan Password wajib diisi.');
      return;
    }

    // Check if student is registered by Admin
    const registeredStudent = students.find(
      s => s.nis.trim().toLowerCase() === cleanNis.toLowerCase()
    );

    if (!registeredStudent) {
      setStudentError(
        `NIS "${cleanNis}" belum terdaftar di sistem. Siswa hanya dapat login jika sudah ditambahkan oleh Admin.`
      );
      return;
    }

    // Validate student password (if not explicitly set in older records, default is student's NIS)
    const expectedPass = (registeredStudent.password || registeredStudent.nis).trim();
    if (cleanPass !== expectedPass) {
      setStudentError('Password Siswa salah. Silakan periksa kembali atau tanyakan kepada Pengawas/Admin.');
      return;
    }

    onStudentLogin(registeredStudent);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    const cleanUser = adminUsername.trim().toLowerCase();
    const cleanPass = adminPin.trim();

    if (!cleanUser || !cleanPass) {
      setAdminError('Username dan PIN/Password wajib diisi.');
      return;
    }

    // Check against admins database list
    const matchedAdmin = admins.find(
      a => a.username.trim().toLowerCase() === cleanUser && a.password.trim() === cleanPass
    );

    if (matchedAdmin) {
      onAdminLogin(matchedAdmin.name || matchedAdmin.username);
      return;
    }

    // Fallback check against default settings.adminPin if username is 'admin'
    if (cleanUser === 'admin' && cleanPass === settings.adminPin) {
      onAdminLogin('Administrator');
      return;
    }

    setAdminError('Username atau PIN/Password Admin salah. Silakan periksa kembali.');
  };

  // ============================================================================
  // TAMPILAN 2: HALAMAN KHUSUS LOGIN GURU / ADMIN (TERPISAH DARI SISWA)
  // ============================================================================
  if (loginView === 'admin') {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-900 flex items-center justify-center px-4 py-10">
        <div className="max-w-md w-full space-y-6">
          {/* Tombol Kembali ke Portal Siswa */}
          <div>
            <button
              type="button"
              onClick={() => {
                setLoginView('student');
                setAdminError('');
              }}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-xl border border-slate-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Halaman Login Siswa</span>
            </button>
          </div>

          {/* Branding Khusus Admin */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="inline-block px-3 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[11px] font-bold uppercase tracking-wider">
              Portal Khusus Pengawas & Administrator
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Login Panel Guru / Admin
            </h1>
            <p className="text-xs text-slate-400">
              {settings.schoolName} • TA {settings.academicYear}
            </p>
          </div>

          {/* Card Login Admin */}
          <div className="bg-slate-800/90 backdrop-blur-md rounded-3xl border border-slate-700 shadow-2xl p-6 sm:p-8">
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              {adminError && (
                <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{adminError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Username Admin / Guru
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3 text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={e => {
                      setAdminUsername(e.target.value);
                      setAdminError('');
                    }}
                    placeholder="Masukkan username admin/guru"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-600 text-white text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  PIN / Kata Sandi Keamanan
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    value={adminPin}
                    onChange={e => {
                      setAdminPin(e.target.value);
                      setAdminError('');
                    }}
                    placeholder="Masukkan PIN / Kata Sandi"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-600 text-white text-xs sm:text-sm font-mono font-bold tracking-widest focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition placeholder:text-slate-500 placeholder:tracking-normal placeholder:font-sans"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 p-0.5"
                    title={showAdminPass ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
                >
                  <span>Masuk ke Panel Guru & Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // TAMPILAN 1 (UTAMA): HALAMAN KHUSUS LOGIN SISWA PESERTA UJIAN
  // ============================================================================
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full">
        {/* School Branding Card */}
        <div className="text-center mb-6 space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-700 to-indigo-700 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
            <School className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {settings.schoolName}
          </h1>
          <p className="text-xs text-slate-500">
            {settings.examHeader} • TA {settings.academicYear}
          </p>
        </div>

        {/* Dedicated Student Login Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-blue-600 px-6 py-4 text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-wide">PORTAL LOGIN SISWA</h2>
              <p className="text-[11px] text-blue-100">Masuk menggunakan NIS dan Password akun siswa</p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              {studentError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{studentError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nomor Induk Siswa (NIS)
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3 text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={studentNis}
                    onChange={handleNisChange}
                    placeholder="Masukkan NIS Anda"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition"
                    required
                  />
                  {selectedStudent && (
                    <div className="absolute right-3 top-3 text-emerald-500">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>
                {selectedStudent && (
                  <p className="mt-1 text-[11px] text-emerald-600 font-bold">
                    ✓ Siswa Terdaftar: {selectedStudent.name} ({selectedStudent.classGrade})
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password Siswa
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showStudentPass ? 'text' : 'password'}
                    value={studentPassword}
                    onChange={e => {
                      setStudentPassword(e.target.value);
                      setStudentError('');
                    }}
                    placeholder="Masukkan Password Siswa"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudentPass(!showStudentPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                    title={showStudentPass ? 'Sembunyikan Password' : 'Lihat Password'}
                  >
                    {showStudentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xs shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition pt-3"
              >
                <span>Masuk ke Dashboard Siswa</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Tombol Terpisah Menuju Halaman Login Guru / Admin */}
        <div className="mt-6 pt-5 border-t border-slate-200/80 flex flex-col items-center">
          <button
            type="button"
            onClick={() => {
              setLoginView('admin');
              setStudentError('');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 text-xs font-bold shadow-2xs transition"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Buka Halaman Login Guru / Admin</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
