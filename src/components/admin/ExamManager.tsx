import React, { useState } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  Clock, 
  CheckCircle, 
  BookOpen, 
  Shuffle, 
  Eye, 
  ListOrdered,
  Search,
  ChevronRight,
  ArrowLeft,
  FileQuestion,
  Sparkles
} from 'lucide-react';
import { Exam, Question } from '../../types/cbt';
import { QuestionEditorModal } from './QuestionEditorModal';

interface ExamManagerProps {
  exams: Exam[];
  onSaveExam: (exam: Partial<Exam>) => Promise<Exam>;
  onDeleteExam: (id: string) => Promise<void>;
}

export const ExamManager: React.FC<ExamManagerProps> = ({
  exams,
  onSaveExam,
  onDeleteExam
}) => {
  const [search, setSearch] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Selected exam for managing its questions
  const [activeExamForQuestions, setActiveExamForQuestions] = useState<Exam | null>(null);

  // Modal to edit Exam metadata
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Partial<Exam> | null>(null);

  // Question editing modal
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleToggleStatus = async (exam: Exam) => {
    await onSaveExam({ ...exam, isActive: !exam.isActive });
  };

  const handleOpenCreateExam = () => {
    setEditingExam({
      title: '',
      subject: 'Matematika',
      grade: 'Kelas 10',
      durationMinutes: 45,
      token: `EXAM${Math.floor(1000 + Math.random() * 9000)}`,
      isActive: true,
      shuffleQuestions: true,
      showScoreToStudent: true,
      allowReviewAnswers: true,
      questions: []
    });
    setIsExamModalOpen(true);
  };

  const handleOpenEditExam = (exam: Exam) => {
    setEditingExam(exam);
    setIsExamModalOpen(true);
  };

  const handleSaveExamMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExam?.title) return;
    const saved = await onSaveExam(editingExam);
    setIsExamModalOpen(false);
    if (activeExamForQuestions && activeExamForQuestions.id === saved.id) {
      setActiveExamForQuestions(saved);
    }
  };

  // Question bank handlers
  const handleSaveQuestion = async (q: Question) => {
    if (!activeExamForQuestions) return;
    const currentQuestions = [...activeExamForQuestions.questions];
    const existingIndex = currentQuestions.findIndex(item => item.id === q.id);

    if (existingIndex >= 0) {
      currentQuestions[existingIndex] = q;
    } else {
      currentQuestions.push(q);
    }

    const updatedExam = await onSaveExam({
      ...activeExamForQuestions,
      questions: currentQuestions
    });

    setActiveExamForQuestions(updatedExam);
    setIsQuestionModalOpen(false);
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!activeExamForQuestions) return;

    const filtered = activeExamForQuestions.questions.filter(q => q.id !== qId);
    const updatedExam = await onSaveExam({
      ...activeExamForQuestions,
      questions: filtered
    });
    setActiveExamForQuestions(updatedExam);
  };

  const filteredExams = exams.filter(e => 
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.subject.toLowerCase().includes(search.toLowerCase()) ||
    e.token.toLowerCase().includes(search.toLowerCase())
  );

  // If in Question Bank view for a specific exam
  if (activeExamForQuestions) {
    const totalPoints = activeExamForQuestions.questions.reduce((acc, q) => acc + q.points, 0);

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveExamForQuestions(null)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
              title="Kembali ke Daftar Ujian"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{activeExamForQuestions.title}</h2>
                <span className="font-mono-numbers px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                  Token: {activeExamForQuestions.token}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeExamForQuestions.subject} • {activeExamForQuestions.questions.length} Butir Soal • Total Skor Maksimal: {totalPoints} Poin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingQuestion({
                  type: 'multiple_choice',
                  points: 15,
                  options: [
                    { id: 'A', text: '' },
                    { id: 'B', text: '' },
                    { id: 'C', text: '' },
                    { id: 'D', text: '' },
                    { id: 'E', text: '' }
                  ],
                  correctAnswer: 'A'
                });
                setIsQuestionModalOpen(true);
              }}
              className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Butir Soal</span>
            </button>
          </div>
        </div>

        {/* List of Questions */}
        <div className="space-y-4">
          {activeExamForQuestions.questions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <FileQuestion className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">Bank Soal Masih Kosong</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Klik tombol di atas untuk mulai membuat soal pilihan ganda atau esai.
              </p>
            </div>
          ) : (
            activeExamForQuestions.questions.map((q, idx) => (
              <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-start justify-between gap-4 pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                      {q.type === 'multiple_choice' ? 'Pilihan Ganda' : 'Uraian/Esai'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">• Bobot: {q.points} Poin</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingQuestion(q);
                        setIsQuestionModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                      title="Edit Soal"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Hapus Soal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed mb-3">
                  {q.text}
                </div>

                {q.imageUrl && (
                  <div className="mb-3 p-2 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center max-w-sm">
                    <img src={q.imageUrl} alt={`Foto Soal ${idx + 1}`} className="max-h-48 w-auto object-contain rounded-lg" />
                  </div>
                )}

                {q.type === 'multiple_choice' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                    {q.options.map(opt => (
                      <div
                        key={opt.id}
                        className={`p-2 rounded-lg border flex items-start gap-2 ${
                          q.correctAnswer === opt.id
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <span className="font-bold">{opt.id}.</span>
                        <span>{opt.text}</span>
                        {q.correctAnswer === opt.id && (
                          <span className="ml-auto text-[10px] text-emerald-700 font-bold">Kunci</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {q.explanation && (
                  <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <strong>Penjelasan:</strong> {q.explanation}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {isQuestionModalOpen && (
          <QuestionEditorModal
            question={editingQuestion}
            onSave={handleSaveQuestion}
            onClose={() => setIsQuestionModalOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Manajemen Paket Ujian</h2>
          <p className="text-xs text-slate-500">Buat, kelola token, dan sunting bank soal ujian sekolah</p>
        </div>

        <button
          onClick={handleOpenCreateExam}
          className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Paket Ujian Baru</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari berdasarkan judul ujian, mata pelajaran, atau token..."
          className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
        />
      </div>

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredExams.map(exam => (
          <div
            key={exam.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {exam.subject}
                </span>
                <button
                  onClick={() => handleToggleStatus(exam)}
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition cursor-pointer ${
                    exam.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {exam.isActive ? '● Aktif' : '○ Nonaktif'}
                </button>
              </div>

              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug mb-2">
                {exam.title}
              </h3>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {exam.durationMinutes} Menit
                </span>
                <span>•</span>
                <span>{exam.grade}</span>
                <span>•</span>
                <span>{exam.questions.length} Soal</span>
              </div>

              {/* Token Display with Copy */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Token Ujian Siswa</span>
                  <span className="font-mono-numbers text-sm font-extrabold text-blue-900 tracking-wider">
                    {exam.token}
                  </span>
                </div>
                <button
                  onClick={() => handleCopyToken(exam.token)}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition"
                  title="Salin Token"
                >
                  {copiedToken === exam.token ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setActiveExamForQuestions(exam)}
                className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Kelola Soal ({exam.questions.length})</span>
              </button>

              <button
                onClick={() => handleOpenEditExam(exam)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                title="Edit Pengaturan Ujian"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onDeleteExam(exam.id)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                title="Hapus Ujian"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Create / Edit Exam Metadata */}
      {isExamModalOpen && editingExam && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingExam.id ? 'Edit Informasi Ujian' : 'Buat Paket Ujian Baru'}
            </h3>

            <form onSubmit={handleSaveExamMeta} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Judul Ujian
                </label>
                <input
                  type="text"
                  value={editingExam.title || ''}
                  onChange={e => setEditingExam({ ...editingExam, title: e.target.value })}
                  placeholder="Contoh: Penilaian Harian Matematika Bab 1"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    value={editingExam.subject || ''}
                    onChange={e => setEditingExam({ ...editingExam, subject: e.target.value })}
                    placeholder="Contoh: Matematika"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kelas / Jenjang
                  </label>
                  <input
                    type="text"
                    value={editingExam.grade || ''}
                    onChange={e => setEditingExam({ ...editingExam, grade: e.target.value })}
                    placeholder="Contoh: Kelas 10"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Durasi (Menit)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={300}
                    value={editingExam.durationMinutes || 45}
                    onChange={e => setEditingExam({ ...editingExam, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Token Masuk
                  </label>
                  <input
                    type="text"
                    value={editingExam.token || ''}
                    onChange={e => setEditingExam({ ...editingExam, token: e.target.value.toUpperCase() })}
                    placeholder="Contoh: MTK2026"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold uppercase tracking-wider focus:ring-2 focus:ring-blue-500 outline-hidden"
                    required
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingExam.shuffleQuestions ?? true}
                    onChange={e => setEditingExam({ ...editingExam, shuffleQuestions: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Acak urutan soal untuk tiap siswa</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingExam.showScoreToStudent ?? true}
                    onChange={e => setEditingExam({ ...editingExam, showScoreToStudent: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Tampilkan nilai langsung ke siswa setelah submit</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingExam.allowReviewAnswers ?? true}
                    onChange={e => setEditingExam({ ...editingExam, allowReviewAnswers: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Buka pembahasan & kunci jawaban setelah selesai</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
                >
                  Simpan Ujian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
