import React, { useState } from 'react';
import {
  KeyRound,
  User,
  BookOpen,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Lock,
  Award,
  FileText,
  X,
  LogOut,
  Eye
} from 'lucide-react';
import { Exam, Student, Submission } from '../../types/cbt';

interface StudentLoginProps {
  exams: Exam[];
  students: Student[];
  submissions?: Submission[];
  loggedStudent?: Student | null;
  recentSubmission?: Submission | null;
  onClearRecentSubmission?: () => void;
  onStartExamConfirm: (exam: Exam, student: { nis: string; name: string; classGrade: string }) => void;
  onViewResult?: (exam: Exam, submission: Submission) => void;
  onBackToRoleSelect?: () => void;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({
  exams,
  submissions = [],
  loggedStudent,
  recentSubmission,
  onClearRecentSubmission,
  onStartExamConfirm,
  onViewResult,
  onBackToRoleSelect
}) => {
  const [pickingExam, setPickingExam] = useState<Exam | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const studentNis = loggedStudent?.nis || '';
  const studentName = loggedStudent?.name || 'Siswa';
  const studentClass = loggedStudent?.classGrade || '10';

  const activeExams = exams.filter(e => e.isActive);

  // Check if student already submitted a given exam
  const getStudentSubmission = (examId: string): Submission | undefined => {
    return submissions.find(
      sub =>
        sub.examId === examId &&
        sub.studentNis.trim().toLowerCase() === studentNis.trim().toLowerCase()
    );
  };

  const completedCount = activeExams.filter(ex => Boolean(getStudentSubmission(ex.id))).length;
  const pendingCount = activeExams.length - completedCount;

  const handleOpenTokenModal = (exam: Exam) => {
    setPickingExam(exam);
    setTokenInput('');
    setErrorMsg('');
  };

  const handleCloseTokenModal = () => {
    setPickingExam(null);
    setTokenInput('');
    setErrorMsg('');
  };

  const handleVerifyTokenAndStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickingExam) return;

    const cleanToken = tokenInput.trim().toUpperCase();
    if (!cleanToken) {
      setErrorMsg('Harap masukkan Token Ujian dari pengawas.');
      return;
    }

    if (cleanToken !== pickingExam.token.trim().toUpperCase()) {
      setErrorMsg('Token Ujian salah atau tidak sesuai. Silakan tanyakan token yang benar kepada Pengawas/Admin.');
      return;
    }

    const targetExam = pickingExam;
    handleCloseTokenModal();
    onStartExamConfirm(targetExam, {
      nis: studentNis,
      name: studentName,
      classGrade: studentClass
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Banner Notifikasi Selesai Ujian */}
      {recentSubmission && (
        <div className="bg-emerald-600 text-white rounded-2xl p-5 shadow-lg shadow-emerald-600/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">
                Ujian "{recentSubmission.examTitle}" Telah Selesai Dikerjakan
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onViewResult && (
              <button
                onClick={() => {
                  const ex = exams.find(item => item.id === recentSubmission.examId);
                  if (ex) onViewResult(ex, recentSubmission);
                }}
                className="px-3.5 py-2 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs transition"
              >
                Lihat Bukti Ujian
              </button>
            )}
            {onClearRecentSubmission && (
              <button
                onClick={onClearRecentSubmission}
                className="p-2 rounded-xl bg-emerald-700/60 hover:bg-emerald-700 text-white transition"
                title="Tutup pesan"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header Profil Dashboard Siswa */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-amber-300" />
              <span>Dashboard Peserta Ujian</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Halo, {studentName}
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm">
              NIS: <strong className="font-mono text-white">{studentNis}</strong> • Kelas:{' '}
              <strong className="text-white">{studentClass}</strong>
            </p>
          </div>

          {/* Ringkasan Status Ujian Siswa */}
          <div className="grid grid-cols-3 gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center">
            <div className="px-3">
              <div className="text-xl font-black text-white">{activeExams.length}</div>
              <div className="text-[11px] text-blue-100">Ujian Aktif</div>
            </div>
            <div className="px-3 border-x border-white/15">
              <div className="text-xl font-black text-amber-300">{pendingCount}</div>
              <div className="text-[11px] text-blue-100">Belum Dikerjakan</div>
            </div>
            <div className="px-3">
              <div className="text-xl font-black text-emerald-300">{completedCount}</div>
              <div className="text-[11px] text-blue-100">Sudah Selesai</div>
            </div>
          </div>
        </div>
      </div>

      {/* Daftar Ujian yang Tersedia */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Daftar Ujian Tersedia</span>
            </h2>
            <p className="text-xs text-slate-500">
              Pilih mata pelajaran ujian yang akan Anda ikuti, lalu masukkan Token Ujian dari Bapak/Ibu Pengawas.
            </p>
          </div>

          {onBackToRoleSelect && (
            <button
              onClick={onBackToRoleSelect}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-xl transition self-start sm:self-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Akun Siswa</span>
            </button>
          )}
        </div>

        {activeExams.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">Belum Ada Ujian yang Dibuka</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Saat ini belum ada jadwal ujian yang diaktifkan oleh pengawas. Silakan tunggu pengumuman dari Bapak/Ibu Guru.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeExams.map(exam => {
              const existingSub = getStudentSubmission(exam.id);
              const isCompleted = Boolean(existingSub);

              return (
                <div
                  key={exam.id}
                  className={`bg-white rounded-2xl border-2 p-6 shadow-xs transition flex flex-col justify-between ${
                    isCompleted
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200 hover:border-blue-400 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                        {exam.subject} • Kelas {exam.grade}
                      </span>

                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Sudah Dikerjakan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs">
                          <Lock className="w-3 h-3 text-amber-600" />
                          Butuh Token Pengawas
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-base font-extrabold text-slate-900 mb-1.5">
                      {exam.title}
                    </h3>
                    {exam.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                        {exam.description}
                      </p>
                    )}

                    {/* Info Pills */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs mb-5">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold">{exam.durationMinutes} Menit</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="font-semibold">{exam.questions.length} Soal</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-semibold">KKM: {(exam as any).passingScore || 75}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Footer */}
                  {isCompleted && existingSub ? (
                    <div className="pt-3 border-t border-emerald-200/70 flex items-center justify-between gap-3">
                      <div className="text-xs">
                        <span className="text-slate-500 block">Status Ujian:</span>
                        <span className="font-extrabold text-emerald-700">
                          {exam.showScoreToStudent
                            ? `Selesai • Nilai: ${existingSub.percentage}`
                            : 'Selesai & Tersimpan'}
                        </span>
                      </div>

                      {onViewResult && (
                        <button
                          type="button"
                          onClick={() => onViewResult(exam, existingSub)}
                          className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat Bukti / Hasil</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenTokenModal(exam)}
                      className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition"
                    >
                      <span>Pilih Ujian Ini</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Catatan Tata Tertib */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-amber-800">Petunjuk Pelaksanaan Ujian Siswa</div>
          <p>
            1. Pilih ujian sesuai jadwal mata pelajaran hari ini, lalu masukkan <strong>Token Ujian</strong> yang diumumkan oleh Pengawas Ruangan.
          </p>
          <p>
            2. Setelah selesai mengerjakan soal, Anda akan otomatis diarahkan kembali ke halaman Dashboard Siswa ini.
          </p>
        </div>
      </div>

      {/* Modal Input Token Ujian (Token Hanya Diberitahu oleh Admin/Pengawas) */}
      {pickingExam && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Masukkan Token Ujian</h3>
                  <p className="text-xs text-slate-500">Hubungi pengawas untuk mendapatkan token</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseTokenModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                {pickingExam.subject} • Kelas {pickingExam.grade}
              </div>
              <div className="text-sm font-extrabold text-slate-900">{pickingExam.title}</div>
              <div className="text-xs text-slate-500">
                Durasi: {pickingExam.durationMinutes} Menit • Jumlah: {pickingExam.questions.length} Soal
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleVerifyTokenAndStart} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kode Token dari Pengawas / Admin
                </label>
                <input
                  type="text"
                  value={tokenInput}
                  onChange={e => {
                    setTokenInput(e.target.value.toUpperCase());
                    setErrorMsg('');
                  }}
                  placeholder="Ketik Token Ujian..."
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-center text-lg font-mono font-black tracking-widest uppercase outline-hidden transition"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1.5 text-center">
                  Token bersifat rahasia dan hanya diberitahukan oleh guru pengawas saat ujian dimulai.
                </p>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleCloseTokenModal}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/25 flex items-center justify-center gap-1.5 transition"
                >
                  <span>Verifikasi Token</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
