import React, { useState } from 'react';
import { X, CheckCircle, XCircle, ShieldAlert, Award, Save, HelpCircle } from 'lucide-react';
import { Exam, Submission } from '../../types/cbt';

interface SubmissionDetailModalProps {
  submission: Submission;
  exam?: Exam;
  onGradeEssay: (subId: string, essayGrading: Record<string, { score: number; note: string }>) => Promise<void>;
  onClose: () => void;
}

export const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  submission,
  exam,
  onGradeEssay,
  onClose
}) => {
  const [essayScores, setEssayScores] = useState<Record<string, { score: number; note: string }>>(
    submission.essayGrading || {}
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleScoreChange = (qId: string, score: number, max: number) => {
    const valid = Math.min(Math.max(0, score), max);
    setEssayScores(prev => ({
      ...prev,
      [qId]: { score: valid, note: prev[qId]?.note || '' }
    }));
  };

  const handleNoteChange = (qId: string, note: string) => {
    setEssayScores(prev => ({
      ...prev,
      [qId]: { score: prev[qId]?.score || 0, note }
    }));
  };

  const handleSaveGrades = async () => {
    setIsSaving(true);
    try {
      await onGradeEssay(submission.id, essayScores);
      alert('Penilaian esai berhasil disimpan dan nilai total telah diperbarui!');
    } catch (e) {
      alert('Gagal menyimpan nilai esai');
    } finally {
      setIsSaving(false);
    }
  };

  const questions = exam?.questions || [];
  const hasEssay = questions.some(q => q.type === 'essay');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-start justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900">Lembar Jawaban Siswa</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">
                {submission.percentage}% ({submission.score}/{submission.maxScore})
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {submission.studentName} ({submission.studentNis}) • {submission.studentClass} — {submission.examTitle}
            </p>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Violations notice */}
        {submission.tabSwitchViolations > 0 ? (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
            <span>
              <strong>Peringatan Pengawas:</strong> Siswa terdeteksi meninggalkan halaman/beralih tab sebanyak{' '}
              <strong>{submission.tabSwitchViolations} kali</strong> selama pengerjaan.
            </span>
          </div>
        ) : (
          <div className="mb-5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <Award className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Siswa mengerjakan dengan tertib tanpa pelanggaran tab (0 kali switch).</span>
          </div>
        )}

        {/* Answers List */}
        <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2">
          {questions.map((q, idx) => {
            const studentAns = submission.answers[q.id];
            const isMc = q.type === 'multiple_choice';
            const isCorrect = isMc && studentAns?.toUpperCase() === q.correctAnswer.toUpperCase();
            const currentEssayGrade = essayScores[q.id];

            return (
              <div key={q.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-white border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {isMc ? 'Pilihan Ganda' : 'Soal Esai/Uraian'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">• Max: {q.points} Poin</span>
                  </div>

                  {isMc ? (
                    isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5" /> Benar (+{q.points})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        <XCircle className="w-3.5 h-3.5" /> Salah (0)
                      </span>
                    )
                  ) : (
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                      Nilai Esai: {currentEssayGrade?.score ?? 0} / {q.points}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-800 whitespace-pre-line">{q.text}</p>

                {q.imageUrl && (
                  <div className="my-2 p-2 rounded-xl border border-slate-200 bg-white flex items-center justify-center max-w-sm">
                    <img src={q.imageUrl} alt={`Diagram ${idx + 1}`} className="max-h-48 w-auto object-contain rounded-lg" />
                  </div>
                )}

                {isMc ? (
                  <div className="text-xs bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                    <p className="text-slate-700">
                      <strong>Jawaban Siswa:</strong>{' '}
                      <span className={`font-bold ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {studentAns || '(Kosong)'}
                      </span>
                    </p>
                    <p className="text-slate-500">
                      <strong>Kunci Jawaban:</strong> {q.correctAnswer}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-xs font-bold text-slate-600 block mb-1">
                        Jawaban Siswa:
                      </span>
                      <p className="text-xs text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100 whitespace-pre-line">
                        {studentAns || '(Siswa tidak mengisi jawaban esai)'}
                      </p>
                    </div>

                    {q.correctAnswer && (
                      <div className="text-[11px] text-slate-500">
                        <strong>Pedoman Jawaban / Kunci:</strong> {q.correctAnswer}
                      </div>
                    )}

                    {/* Teacher grading input for essay */}
                    <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Beri Skor (0 - {q.points})
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={q.points}
                          value={currentEssayGrade?.score ?? 0}
                          onChange={e => handleScoreChange(q.id, Number(e.target.value), q.points)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500 outline-hidden"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Catatan / Koreksi Guru
                        </label>
                        <input
                          type="text"
                          value={currentEssayGrade?.note ?? ''}
                          onChange={e => handleNoteChange(q.id, e.target.value)}
                          placeholder="Beri catatan untuk siswa..."
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Tutup
          </button>

          {hasEssay && (
            <button
              disabled={isSaving}
              onClick={handleSaveGrades}
              className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Nilai Esai'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
