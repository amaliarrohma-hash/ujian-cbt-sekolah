import React from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Database,
  FileCheck2,
  Users
} from 'lucide-react';
import { SchoolSettings } from '../types/cbt';

interface RoleSelectScreenProps {
  settings: SchoolSettings;
  onSelectRole: (role: 'student' | 'admin') => void;
  examCount: number;
  studentCount: number;
}

export const RoleSelectScreen: React.FC<RoleSelectScreenProps> = ({
  settings,
  onSelectRole,
  examCount,
  studentCount
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Platform CBT Ujian Online Sekolah Terintegrasi
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {settings.schoolName}
        </h1>
        <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
          {settings.examHeader} • Tahun Ajaran {settings.academicYear} ({settings.semester})
        </p>
        <p className="text-xs text-slate-400 font-medium">
          Silakan pilih peran Anda di bawah ini untuk melanjutkan ke sistem ujian.
        </p>
      </div>

      {/* Two Role Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
        {/* Siswa Card */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-xl transition-all duration-200 p-6 sm:p-8 flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-8 h-8" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Peserta Ujian
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
              Portal Siswa
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
              Akses khusus untuk siswa sekolah mengerjakan ujian online. Masukkan Nomor Induk Siswa (NIS) dan Token Ujian yang diberikan guru pengawas.
            </p>

            <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Navigasi soal standar ANBK & timer otomatis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Penyimpanan jawaban otomatis (Anti-hilang)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Slip bukti ujian & pengumuman nilai instan</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectRole('student')}
            className="w-full py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition"
          >
            <span>Masuk sebagai Siswa</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Guru / Admin Card */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 hover:border-indigo-500 shadow-sm hover:shadow-xl transition-all duration-200 p-6 sm:p-8 flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Area Pengawas
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
              Panel Guru & Admin
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
              Akses pengawasan dan kontrol ujian. Kelola bank soal, pantau token ujian aktif, evaluasi nilai siswa, koreksi esai, dan manajemen database sekolah.
            </p>

            <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Pembuat paket soal (Pilihan Ganda & Esai)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Rekapitulasi nilai & ekspor format Excel/CSV</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Pencadangan database mandiri 1-klik (Backup/Restore)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectRole('admin')}
            className="w-full py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold text-sm shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 transition"
          >
            <span>Masuk Panel Pengawas / Guru</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Live System Info Banner */}
      <div className="max-w-4xl mx-auto mt-10 p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Sistem CBT Aktif</span>
          </div>
          <span className="text-slate-300">•</span>
          <span>{examCount} Paket Ujian Tersedia</span>
          <span className="text-slate-300">•</span>
          <span>{studentCount} Siswa Terdaftar</span>
        </div>

        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Database Lokal Siap Digunakan</span>
        </div>
      </div>
    </div>
  );
};
