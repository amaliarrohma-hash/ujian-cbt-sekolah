import React from 'react';
import { 
  BookOpen, 
  Users, 
  FileCheck2, 
  TrendingUp, 
  PlusCircle, 
  Database, 
  ArrowRight, 
  Clock, 
  ShieldAlert,
  Award
} from 'lucide-react';
import { CBTDatabase, Exam, Submission } from '../../types/cbt';

interface AdminDashboardProps {
  db: CBTDatabase;
  onNavigateTab: (tab: 'exams' | 'students' | 'submissions' | 'database') => void;
  onCreateNewExam: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  db,
  onNavigateTab,
  onCreateNewExam
}) => {
  const activeExamsCount = db.exams.filter(e => e.isActive).length;
  
  // Average score
  const avgScore = db.submissions.length > 0
    ? Math.round(db.submissions.reduce((acc, curr) => acc + curr.percentage, 0) / db.submissions.length)
    : 0;

  const totalViolations = db.submissions.reduce((acc, curr) => acc + curr.tabSwitchViolations, 0);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-800 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold mb-2">
              Panel Pengawas & Guru
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Pusat Kendali Ujian Berbasis Komputer (CBT)
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onCreateNewExam}
              className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-2 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Ujian Baru</span>
            </button>
            <button
              onClick={() => onNavigateTab('database')}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs flex items-center gap-2 transition backdrop-blur-xs"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Backup Database</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div 
          onClick={() => onNavigateTab('exams')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {activeExamsCount} Aktif
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">Total Paket Ujian</span>
          <p className="text-2xl font-black text-slate-900 font-mono-numbers mt-1">{db.exams.length}</p>
        </div>

        <div 
          onClick={() => onNavigateTab('students')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Terdaftar</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">Total Siswa</span>
          <p className="text-2xl font-black text-slate-900 font-mono-numbers mt-1">{db.students.length}</p>
        </div>

        <div 
          onClick={() => onNavigateTab('submissions')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              Selesai
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">Lembar Jawaban Masuk</span>
          <p className="text-2xl font-black text-slate-900 font-mono-numbers mt-1">{db.submissions.length}</p>
        </div>

        <div 
          onClick={() => onNavigateTab('submissions')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Rata-Rata</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">Nilai Capaian Siswa</span>
          <p className="text-2xl font-black text-amber-600 font-mono-numbers mt-1">{avgScore}%</p>
        </div>
      </div>

      {/* Two columns: Active Exams & Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Exams Quick Card */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Ujian Berjalan & Token</h2>
              <p className="text-xs text-slate-500">Token yang sedang dibagikan ke siswa</p>
            </div>
            <button
              onClick={() => onNavigateTab('exams')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {db.exams.map(exam => (
              <div 
                key={exam.id}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-200 bg-slate-50/50 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{exam.title}</span>
                    {exam.isActive ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Aktif"></span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-300" title="Nonaktif"></span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                    <span>{exam.grade}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {exam.durationMinutes}m
                    </span>
                    <span>•</span>
                    <span>{exam.questions.length} Soal</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Token</span>
                  <span className="font-mono-numbers px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800">
                    {exam.token}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Aktivitas Ujian Terbaru</h2>
              <p className="text-xs text-slate-500">Hasil pengumpulan siswa yang baru masuk</p>
            </div>
            <button
              onClick={() => onNavigateTab('submissions')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Rekap Nilai <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {db.submissions.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Belum ada hasil ujian yang dikumpulkan siswa.</p>
            ) : (
              db.submissions.slice(0, 5).map(sub => (
                <div 
                  key={sub.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-800">{sub.studentName}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {sub.studentNis} • {sub.studentClass} — <span className="text-slate-600">{sub.subject}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {sub.tabSwitchViolations > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200" title="Pelanggaran beralih tab">
                        {sub.tabSwitchViolations}x Tab
                      </span>
                    )}
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-blue-700 font-mono-numbers">
                        {sub.score}
                      </span>
                      <span className="text-slate-400 text-xs">/{sub.maxScore}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
