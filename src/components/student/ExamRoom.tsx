import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  Check, 
  CheckCircle2, 
  HelpCircle, 
  Maximize2, 
  Minimize2, 
  Send, 
  ShieldAlert,
  Save,
  Menu,
  X
} from 'lucide-react';
import { Exam, Question, Submission } from '../../types/cbt';

interface ExamRoomProps {
  exam: Exam;
  student: { nis: string; name: string; classGrade: string };
  onSubmitExam: (answers: Record<string, string>, doubtful: Record<string, boolean>, violations: number, startedAt: string) => Promise<Submission>;
}

export const ExamRoom: React.FC<ExamRoomProps> = ({
  exam,
  student,
  onSubmitExam
}) => {
  // Questions order (either shuffled or original)
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Student answers state: questionId -> answer
  const [answers, setAnswers] = useState<Record<string, string>>({});
  // Doubtful state: questionId -> boolean
  const [doubtful, setDoubtful] = useState<Record<string, boolean>>({});

  // Timer: remaining seconds
  const [remainingSeconds, setRemainingSeconds] = useState<number>(exam.durationMinutes * 60);

  // Anti-cheat violations count
  const [tabViolations, setTabViolations] = useState<number>(0);
  const [showViolationModal, setShowViolationModal] = useState<boolean>(false);

  // Font size modifier: 'sm' | 'md' | 'lg'
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');

  // Finish exam confirmation modal
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Mobile question palette drawer
  const [showMobilePalette, setShowMobilePalette] = useState<boolean>(false);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Timestamp when exam started
  const startedAtRef = useRef<string>(new Date().toISOString());

  // Save status badge animation
  const [lastSavedTime, setLastSavedTime] = useState<string>('Baru saja');

  // Initialize questions
  useEffect(() => {
    let list = [...exam.questions];
    if (exam.shuffleQuestions) {
      list = list.sort(() => Math.random() - 0.5);
    }
    setQuestions(list);
  }, [exam]);

  // Anti-Cheat: detect tab switch or window blur
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabViolations(prev => {
          const next = prev + 1;
          setShowViolationModal(true);
          return next;
        });
      }
    };

    const handleWindowBlur = () => {
      // Some browsers trigger blur on dialog, so check visibility
      if (document.hidden) {
        setTabViolations(prev => {
          const next = prev + 1;
          setShowViolationModal(true);
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmitTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time HH:MM:SS
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const currentQ = questions[currentIndex];

  const handleSelectAnswer = (qId: string, val: string) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
    setLastSavedTime('Tersimpan');
  };

  const handleToggleDoubtful = (qId: string) => {
    setDoubtful(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const handleAutoSubmitTimeOut = async () => {
    alert('Waktu ujian telah habis! Jawaban Anda akan otomatis dikumpulkan ke sistem.');
    setIsSubmitting(true);
    await onSubmitExam(answers, doubtful, tabViolations, startedAtRef.current);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmitExam(answers, doubtful, tabViolations, startedAtRef.current);
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
      alert('Terjadi kesalahan saat mengumpulkan ujian. Silakan coba lagi.');
    }
  };

  // Stats calculation
  const totalCount = questions.length;
  const answeredCount = Object.keys(answers).filter(k => answers[k] && answers[k].trim() !== '').length;
  const doubtfulCount = Object.keys(doubtful).filter(k => doubtful[k]).length;
  const emptyCount = totalCount - answeredCount;

  const fontClass = fontSize === 'sm' ? 'text-sm' : fontSize === 'lg' ? 'text-lg' : 'text-base';

  if (!currentQ) {
    return <div className="p-8 text-center text-slate-500">Memuat soal ujian...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* CBT Exam Top Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Student & Subject info */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center font-bold text-sm">
                CBT
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold truncate max-w-xs">{exam.title}</div>
                <div className="text-xs text-slate-400">
                  {student.name} • {student.nis} ({student.classGrade})
                </div>
              </div>
            </div>

            {/* Middle: Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono-numbers font-extrabold text-base sm:text-lg transition ${
              remainingSeconds < 300
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-slate-800 border-slate-700 text-amber-300'
            }`}>
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{formatTime(remainingSeconds)}</span>
            </div>

            {/* Right Controls: Font, Autosave, Palette, Fullscreen */}
            <div className="flex items-center gap-2">
              {/* Font Sizer */}
              <div className="hidden md:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs text-slate-300">
                <button
                  onClick={() => setFontSize('sm')}
                  className={`px-2 py-1 rounded ${fontSize === 'sm' ? 'bg-slate-700 text-white font-bold' : 'hover:text-white'}`}
                  title="Ukuran teks kecil"
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize('md')}
                  className={`px-2 py-1 rounded ${fontSize === 'md' ? 'bg-slate-700 text-white font-bold' : 'hover:text-white'}`}
                  title="Ukuran teks sedang"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('lg')}
                  className={`px-2 py-1 rounded ${fontSize === 'lg' ? 'bg-slate-700 text-white font-bold' : 'hover:text-white'}`}
                  title="Ukuran teks besar"
                >
                  A+
                </button>
              </div>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="hidden sm:flex items-center justify-center p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition"
                title="Layar Penuh"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Mobile Palette Trigger */}
              <button
                onClick={() => setShowMobilePalette(!showMobilePalette)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
              >
                <Menu className="w-4 h-4" />
                <span>Nomor</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Exam Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Question Viewer Column */}
          <div className="lg:col-span-8 space-y-4">
            {/* Question Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-xs font-extrabold uppercase tracking-wide">
                    Soal No. {currentIndex + 1} dari {totalCount}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Bobot: {currentQ.points} Poin
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Save className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-700 font-medium">{lastSavedTime}</span>
                </div>
              </div>

              {/* Question Text */}
              <div className={`text-slate-800 leading-relaxed font-normal whitespace-pre-line mb-4 ${fontClass}`}>
                {currentQ.text}
              </div>

              {/* Question Image (If available) */}
              {currentQ.imageUrl && (
                <div className="mb-6 p-2 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                  <img
                    src={currentQ.imageUrl}
                    alt={`Diagram Soal ${currentIndex + 1}`}
                    className="max-h-80 w-auto object-contain rounded-xl shadow-xs"
                  />
                </div>
              )}

              {/* Options or Essay Area */}
              {currentQ.type === 'multiple_choice' ? (
                <div className="space-y-3">
                  {currentQ.options.map(opt => {
                    const isSelected = answers[currentQ.id] === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectAnswer(currentQ.id, opt.id)}
                        className={`flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-semibold shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-slate-700'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {opt.id}
                        </div>
                        <div className={`pt-0.5 leading-snug ${fontClass}`}>{opt.text}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Jawaban Esai Anda:
                  </label>
                  <textarea
                    rows={6}
                    value={answers[currentQ.id] || ''}
                    onChange={e => handleSelectAnswer(currentQ.id, e.target.value)}
                    placeholder="Ketik uraian jawaban Anda secara lengkap di sini..."
                    className={`w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition ${fontClass}`}
                  />
                </div>
              )}
            </div>

            {/* Bottom Navigation Buttons */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-wrap items-center justify-between gap-3">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => prev - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none text-slate-700 text-xs font-bold transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              {/* Ragu-ragu Checkbox */}
              <button
                type="button"
                onClick={() => handleToggleDoubtful(currentQ.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition ${
                  doubtful[currentQ.id]
                    ? 'border-amber-400 bg-amber-50 text-amber-800'
                    : 'border-slate-300 hover:bg-amber-50/50 text-slate-600'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                    doubtful[currentQ.id]
                      ? 'border-amber-500 bg-amber-400 text-amber-950'
                      : 'border-slate-400 bg-white'
                  }`}
                >
                  {doubtful[currentQ.id] && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span>Ragu-Ragu</span>
              </button>

              {currentIndex < totalCount - 1 ? (
                <button
                  onClick={() => setCurrentIndex(prev => prev + 1)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold transition shadow-xs"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition shadow-md shadow-emerald-500/20"
                >
                  <Send className="w-4 h-4" />
                  <span>Kumpulkan Jawaban</span>
                </button>
              )}
            </div>
          </div>

          {/* Desktop Right Column: Palette & Stats */}
          <div className="hidden lg:block lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sticky top-24">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">Daftar Nomor Soal</h3>
                <span className="text-xs text-slate-500 font-medium">
                  {answeredCount} / {totalCount} Terjawab
                </span>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-3 gap-2 text-[11px] mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-3.5 h-3.5 rounded bg-emerald-500 shrink-0"></span>
                  <span>Sudah ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-3.5 h-3.5 rounded bg-amber-400 shrink-0"></span>
                  <span>Ragu ({doubtfulCount})</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-3.5 h-3.5 rounded bg-slate-200 shrink-0"></span>
                  <span>Belum ({emptyCount})</span>
                </div>
              </div>

              {/* Number Matrix */}
              <div className="grid grid-cols-5 gap-2 max-h-[360px] overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const isAnswered = answers[q.id] && answers[q.id].trim() !== '';
                  const isDoubt = doubtful[q.id];
                  const isActive = idx === currentIndex;

                  let colorClass = 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200';
                  if (isDoubt) {
                    colorClass = 'bg-amber-400 text-amber-950 font-bold border-amber-500';
                  } else if (isAnswered) {
                    colorClass = 'bg-emerald-500 text-white font-bold border-emerald-600';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-10 rounded-xl flex items-center justify-center text-xs font-bold border transition ${colorClass} ${
                        isActive ? 'ring-3 ring-blue-500 ring-offset-2' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Submit Button Trigger */}
              <div className="pt-5 mt-4 border-t border-slate-100">
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Selesai & Kumpulkan Ujian</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Question Palette Modal Drawer */}
      {showMobilePalette && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end lg:hidden">
          <div className="w-4/5 max-w-sm bg-white h-full p-5 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">Daftar Nomor Soal</h3>
                <button
                  onClick={() => setShowMobilePalette(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const isAnswered = answers[q.id] && answers[q.id].trim() !== '';
                  const isDoubt = doubtful[q.id];
                  const isActive = idx === currentIndex;

                  let colorClass = 'bg-slate-100 text-slate-600 border-slate-200';
                  if (isDoubt) colorClass = 'bg-amber-400 text-amber-950 font-bold border-amber-500';
                  else if (isAnswered) colorClass = 'bg-emerald-500 text-white font-bold border-emerald-600';

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setShowMobilePalette(false);
                      }}
                      className={`h-10 rounded-xl flex items-center justify-center text-xs font-bold border transition ${colorClass} ${
                        isActive ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowMobilePalette(false);
                  setShowSubmitModal(true);
                }}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Kumpulkan Ujian</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Anti-Cheat Violation Alert Modal */}
      {showViolationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center border-2 border-rose-500 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">Peringatan Pelanggaran!</h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Anda terdeteksi meninggalkan halaman ujian atau membuka tab/aplikasi lain.
            </p>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold mb-5">
              Total Pelanggaran Tercatat: {tabViolations} kali
              <p className="font-normal text-[11px] text-rose-600 mt-0.5">
                Catatan ini dikirimkan ke server dan terlampir pada laporan nilai pengawas ujian.
              </p>
            </div>
            <button
              onClick={() => setShowViolationModal(false)}
              className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition"
            >
              Saya Mengerti & Lanjutkan Ujian
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 mb-2">Konfirmasi Selesai Ujian</h3>
            <p className="text-xs text-slate-500 mb-5">
              Apakah Anda yakin ingin mengumpulkan seluruh lembar jawaban sekarang?
            </p>

            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 mb-6 text-center">
              <div className="p-2">
                <span className="text-[11px] text-slate-400">Terjawab</span>
                <p className="text-base font-extrabold text-emerald-600">{answeredCount}</p>
              </div>
              <div className="p-2 border-x border-slate-200">
                <span className="text-[11px] text-slate-400">Ragu-Ragu</span>
                <p className="text-base font-extrabold text-amber-500">{doubtfulCount}</p>
              </div>
              <div className="p-2">
                <span className="text-[11px] text-slate-400">Belum Diisi</span>
                <p className={`text-base font-extrabold ${emptyCount > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                  {emptyCount}
                </p>
              </div>
            </div>

            {emptyCount > 0 && (
              <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Masih terdapat {emptyCount} soal yang belum Anda jawab.</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                disabled={isSubmitting}
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
              >
                Periksa Kembali
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition"
              >
                {isSubmitting ? (
                  <span>Mengirim...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Ya, Kumpulkan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
