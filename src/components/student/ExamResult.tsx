import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Award, 
  CheckCircle, 
  XCircle, 
  Printer, 
  Home, 
  ShieldCheck, 
  ShieldAlert, 
  HelpCircle, 
  Clock, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Exam, Submission } from '../../types/cbt';

interface ExamResultProps {
  exam: Exam;
  submission: Submission;
  onGoHome: () => void;
}

export const ExamResult: React.FC<ExamResultProps> = ({
  exam,
  submission,
  onGoHome
}) => {
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (submission.percentage >= 70) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [submission.percentage]);

  const handlePrint = () => {
    window.print();
  };

  const hasEssay = exam.questions.some(q => q.type === 'essay');

  // Count correct and incorrect for multiple choice
  let correctCount = 0;
  let incorrectCount = 0;
  exam.questions.forEach(q => {
    if (q.type === 'multiple_choice') {
      const ans = submission.answers[q.id];
      if (ans && ans.toUpperCase() === q.correctAnswer.toUpperCase()) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    }
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Printable Receipt Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden print:border-none print:shadow-none">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-8 text-white text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Award className="w-10 h-10 text-amber-300" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Ujian Berhasil Dikumpulkan!
          </h1>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Score Highlight Box */}
          {exam.showScoreToStudent ? (
            <div className="bg-gradient-to-b from-slate-50 to-blue-50/40 border border-blue-100 rounded-3xl p-6 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Nilai Akhir Ujian
              </span>
              <div className="flex items-baseline justify-center gap-1 my-2">
                <span className="text-5xl sm:text-6xl font-black tracking-tight text-blue-700 font-mono-numbers">
                  {submission.score}
                </span>
                <span className="text-slate-400 font-bold text-lg sm:text-xl">
                  / {submission.maxScore}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Persentase Capaian: {submission.percentage}%
              </div>

              {hasEssay && (
                <p className="text-[11px] text-slate-500 mt-3 bg-amber-50 border border-amber-200 p-2 rounded-xl text-amber-800">
                  *Catatan: Ujian ini memuat soal esai. Nilai akhir di atas merupakan hasil otomatis pilihan ganda dan dapat bertambah setelah diperiksa bapak/ibu guru.
                </p>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-base">Jawaban Diterima Pengawas</h3>
              <p className="text-xs text-slate-500 mt-1">
                Hasil penilaian dan pengumuman kelulusan akan dirilis oleh pihak sekolah.
              </p>
            </div>
          )}

          {/* Student & Exam Details Table */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Bukti Pengumpulan Ujian (CBT Slip)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Nama Peserta</span>
                <strong className="text-slate-800 text-sm block">{submission.studentName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">NIS</span>
                <strong className="text-slate-800 text-sm font-mono-numbers block">{submission.studentNis}</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Kelas</span>
                <strong className="text-slate-800 text-sm block">{submission.studentClass}</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Mata Pelajaran</span>
                <strong className="text-slate-800 text-sm block">{submission.subject}</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Waktu Selesai</span>
                <span className="text-slate-700 block font-mono-numbers">
                  {new Date(submission.submittedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Status Integritas</span>
                {submission.tabSwitchViolations === 0 ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Sangat Jujur (0)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                    <ShieldAlert className="w-3.5 h-3.5" /> {submission.tabSwitchViolations}x Beralih Tab
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Review Answers Toggle (If allowed) */}
          {exam.allowReviewAnswers && (
            <div className="border border-slate-200 rounded-2xl p-5 space-y-4 print:hidden">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Pembahasan & Kunci Jawaban</h3>
                  <p className="text-xs text-slate-500">Lihat analisis soal dan penjelasan materi</p>
                </div>
                <button
                  onClick={() => setShowReview(!showReview)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  {showReview ? 'Sembunyikan' : 'Buka Pembahasan'}
                </button>
              </div>

              {showReview && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  {exam.questions.map((q, idx) => {
                    const studentAns = submission.answers[q.id];
                    const isCorrect = q.type === 'multiple_choice' && studentAns?.toUpperCase() === q.correctAnswer.toUpperCase();

                    return (
                      <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">Soal #{idx + 1}</span>
                          {q.type === 'multiple_choice' ? (
                            isCorrect ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <CheckCircle className="w-3 h-3" /> Benar (+{q.points})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                                <XCircle className="w-3 h-3" /> Salah (0)
                              </span>
                            )
                          ) : (
                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                              Soal Esai
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-line">{q.text}</p>

                        {q.imageUrl && (
                          <div className="my-2 p-2 rounded-xl border border-slate-200 bg-white flex items-center justify-center">
                            <img src={q.imageUrl} alt={`Diagram ${idx + 1}`} className="max-h-52 w-auto object-contain rounded-lg" />
                          </div>
                        )}

                        <div className="text-xs space-y-1 pt-1">
                          <p className="text-slate-600">
                            <strong>Jawaban Anda:</strong> {studentAns || '(Tidak dijawab)'}
                          </p>
                          {q.type === 'multiple_choice' && (
                            <p className="text-emerald-700">
                              <strong>Kunci Jawaban:</strong> {q.correctAnswer}
                            </p>
                          )}
                          {q.explanation && (
                            <p className="text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200 mt-2">
                              <strong>💡 Penjelasan:</strong> {q.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-1 min-w-[140px] py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Bukti Ujian</span>
            </button>

            <button
              onClick={onGoHome}
              className="flex-1 min-w-[140px] py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition"
            >
              <Home className="w-4 h-4" />
              <span>Kembali ke Dashboard Siswa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
