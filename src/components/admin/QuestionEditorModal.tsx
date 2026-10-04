import React, { useState, useRef } from 'react';
import { X, Plus, Trash2, CheckCircle2, Image as ImageIcon, Upload } from 'lucide-react';
import { Question, QuestionType } from '../../types/cbt';

interface QuestionEditorModalProps {
  question: Partial<Question> | null;
  onSave: (q: Question) => void;
  onClose: () => void;
}

export const QuestionEditorModal: React.FC<QuestionEditorModalProps> = ({
  question,
  onSave,
  onClose
}) => {
  const [type, setType] = useState<QuestionType>(question?.type || 'multiple_choice');
  const [text, setText] = useState(question?.text || '');
  const [imageUrl, setImageUrl] = useState(question?.imageUrl || '');
  const [points, setPoints] = useState<number>(question?.points || 15);
  const [explanation, setExplanation] = useState(question?.explanation || '');
  const [correctAnswer, setCorrectAnswer] = useState(question?.correctAnswer || 'A');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Options for multiple choice (A, B, C, D, E)
  const defaultOpts = [
    { id: 'A' as const, text: '' },
    { id: 'B' as const, text: '' },
    { id: 'C' as const, text: '' },
    { id: 'D' as const, text: '' },
    { id: 'E' as const, text: '' }
  ];

  const [options, setOptions] = useState(
    question?.options && question.options.length > 0 ? question.options : defaultOpts
  );

  const handleOptionChange = (id: 'A' | 'B' | 'C' | 'D' | 'E', val: string) => {
    setOptions(prev => prev.map(o => o.id === id ? { ...o, text: val } : o));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Harap pilih file gambar (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran gambar terlalu besar. Maksimal 5 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImageUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      alert('Teks soal tidak boleh kosong');
      return;
    }

    const newQuestion: Question = {
      id: question?.id || `q-${Date.now()}`,
      type,
      text: text.trim(),
      imageUrl: imageUrl.trim() || undefined,
      points: Number(points) || 10,
      explanation: explanation.trim(),
      correctAnswer: type === 'multiple_choice' ? correctAnswer : correctAnswer.trim(),
      options: type === 'multiple_choice' ? options : []
    };

    onSave(newQuestion);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {question?.id ? 'Edit Butir Soal' : 'Tambah Soal Baru'}
            </h3>
            <p className="text-xs text-slate-500">Pilihan ganda atau uraian/esai</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tipe Soal
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as QuestionType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
              >
                <option value="multiple_choice">Pilihan Ganda (A-E)</option>
                <option value="essay">Uraian / Esai Bebas</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Bobot Nilai / Poin
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={points}
                onChange={e => setPoints(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Teks / Pertanyaan Soal
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Ketik narasi atau pertanyaan soal di sini..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
              required
            />
          </div>

          {/* Foto Soal Section */}
          <div className="p-3.5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <span>Foto / Diagram Soal (Opsional)</span>
              </div>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus Foto
                </button>
              )}
            </div>

            {imageUrl ? (
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-white p-2 flex flex-col items-center">
                <img
                  src={imageUrl}
                  alt="Pratinjau Foto"
                  className="max-h-48 w-auto object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-1.5 px-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Upload Foto dari Laptop</span>
                  </button>
                  <span className="text-[11px] text-slate-400">atau link URL:</span>
                </div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://example.com/gambar.png"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden bg-white"
                />
              </div>
            )}
          </div>

          {type === 'multiple_choice' ? (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Opsi Pilihan Jawaban & Kunci:
              </label>
              <div className="space-y-2">
                {options.map(opt => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCorrectAnswer(opt.id)}
                      className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 border transition ${
                        correctAnswer === opt.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                      }`}
                      title={correctAnswer === opt.id ? 'Kunci Jawaban Benar' : 'Jadikan Kunci Jawaban'}
                    >
                      {opt.id}
                    </button>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={e => handleOptionChange(opt.id, e.target.value)}
                      placeholder={`Pilihan ${opt.id}`}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                      required
                    />
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 italic">
                *Klik huruf tombol (A/B/C/D/E) di atas untuk menetapkan kunci jawaban yang benar.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kunci Jawaban / Kata Kunci Penilaian Esai
              </label>
              <textarea
                rows={2}
                value={correctAnswer}
                onChange={e => setCorrectAnswer(e.target.value)}
                placeholder="Pedoman kunci atau kriteria penskoran guru..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Pembahasan / Catatan Penjelasan (Opsional)
            </label>
            <textarea
              rows={2}
              value={explanation}
              onChange={e => setExplanation(e.target.value)}
              placeholder="Penjelasan langkah penyelesaian yang bisa dibaca siswa saat pembahasan..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
            >
              Simpan Soal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
