import React, { useState, useRef } from 'react';
import { 
  PlusCircle, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  HelpCircle, 
  BookOpen, 
  Save, 
  Copy, 
  ArrowRight,
  Upload,
  Check,
  Award,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { Exam, Question, QuestionType } from '../../types/cbt';

interface QuestionCreatorProps {
  exams: Exam[];
  onSaveQuestionToExam: (examId: string, question: Question) => Promise<void>;
  onBulkAddQuestionsToExam: (examId: string, questions: Question[]) => Promise<void>;
  onNavigateToExams: () => void;
}

export const QuestionCreator: React.FC<QuestionCreatorProps> = ({
  exams,
  onSaveQuestionToExam,
  onBulkAddQuestionsToExam,
  onNavigateToExams
}) => {
  // Mode: 'single' (Formulir Buat Soal) | 'bulk' (Import Teks Massal) | 'ai' (Generator Template Soal)
  const [mode, setMode] = useState<'single' | 'bulk' | 'ai'>('single');

  // Selected Target Exam
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');

  // Single Question Form State
  const [type, setType] = useState<QuestionType>('multiple_choice');
  const [questionText, setQuestionText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [points, setPoints] = useState<number>(15);
  const [explanation, setExplanation] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<string>('A');

  // Options for multiple choice (A-E)
  const [options, setOptions] = useState([
    { id: 'A' as const, text: '' },
    { id: 'B' as const, text: '' },
    { id: 'C' as const, text: '' },
    { id: 'D' as const, text: '' },
    { id: 'E' as const, text: '' }
  ]);

  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Bulk paste text state
  const [bulkText, setBulkText] = useState('');

  // AI / Quick Template generator state
  const [curriculumSubject, setCurriculumSubject] = useState<'Matematika' | 'Bahasa Indonesia' | 'IPA' | 'Bahasa Inggris'>('Matematika');

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Harap pilih file gambar yang valid (JPG, PNG, WebP)');
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

  const handleOptionChange = (id: 'A' | 'B' | 'C' | 'D' | 'E', val: string) => {
    setOptions(prev => prev.map(o => o.id === id ? { ...o, text: val } : o));
  };

  const handleSaveSingle = async (andAddAnother: boolean) => {
    if (!selectedExamId) {
      alert('Pilih paket ujian tujuan terlebih dahulu');
      return;
    }

    if (!questionText.trim()) {
      alert('Teks pertanyaan soal tidak boleh kosong');
      return;
    }

    if (type === 'multiple_choice') {
      const emptyOpt = options.find(o => !o.text.trim());
      if (emptyOpt) {
        alert(`Pilihan ${emptyOpt.id} belum diisi`);
        return;
      }
    }

    setIsSaving(true);
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      type,
      text: questionText.trim(),
      imageUrl: imageUrl.trim() || undefined,
      points: Number(points) || 10,
      explanation: explanation.trim(),
      correctAnswer: type === 'multiple_choice' ? correctAnswer : correctAnswer.trim(),
      options: type === 'multiple_choice' ? options : []
    };

    try {
      await onSaveQuestionToExam(selectedExamId, newQuestion);
      setSavedSuccessMsg(`Soal berhasil ditambahkan ke ujian! Total bobot: ${points} poin.`);
      setTimeout(() => setSavedSuccessMsg(''), 3500);

      // Reset or keep form
      setQuestionText('');
      setImageUrl('');
      setExplanation('');
      setOptions([
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' },
        { id: 'E', text: '' }
      ]);
      setCorrectAnswer('A');

      if (!andAddAnother) {
        onNavigateToExams();
      }
    } catch (e: any) {
      alert('Gagal menyimpan soal: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Process Bulk Paste Text
  const handleProcessBulk = async () => {
    if (!selectedExamId) {
      alert('Pilih paket ujian tujuan terlebih dahulu');
      return;
    }

    if (!bulkText.trim()) {
      alert('Teks soal massal belum diisi');
      return;
    }

    // Parse format:
    // SOAL: Pertanyaan
    // A: Opsi A
    // B: Opsi B
    // C: Opsi C
    // D: Opsi D
    // KUNCI: A
    // PEMBAHASAN: Penjelasan
    // ---
    const blocks = bulkText.split(/---+/).map(b => b.trim()).filter(Boolean);
    const parsedQuestions: Question[] = [];

    blocks.forEach((block, idx) => {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      let qText = '';
      let optA = '', optB = '', optC = '', optD = '', optE = '';
      let key = 'A';
      let expl = '';

      lines.forEach(line => {
        const lower = line.toLowerCase();
        if (lower.startsWith('soal:') || lower.startsWith('pertanyaan:')) {
          qText = line.substring(line.indexOf(':') + 1).trim();
        } else if (line.match(/^[aA][.:\)]/)) {
          optA = line.substring(2).trim();
        } else if (line.match(/^[bB][.:\)]/)) {
          optB = line.substring(2).trim();
        } else if (line.match(/^[cC][.:\)]/)) {
          optC = line.substring(2).trim();
        } else if (line.match(/^[dD][.:\)]/)) {
          optD = line.substring(2).trim();
        } else if (line.match(/^[eE][.:\)]/)) {
          optE = line.substring(2).trim();
        } else if (lower.startsWith('kunci:') || lower.startsWith('jawaban:')) {
          key = line.substring(line.indexOf(':') + 1).trim().toUpperCase();
        } else if (lower.startsWith('pembahasan:') || lower.startsWith('penjelasan:')) {
          expl = line.substring(line.indexOf(':') + 1).trim();
        } else if (!qText) {
          qText = line;
        }
      });

      if (qText) {
        parsedQuestions.push({
          id: `q-bulk-${Date.now()}-${idx}`,
          type: 'multiple_choice',
          text: qText,
          points: 15,
          correctAnswer: key || 'A',
          explanation: expl,
          options: [
            { id: 'A', text: optA || 'Opsi A' },
            { id: 'B', text: optB || 'Opsi B' },
            { id: 'C', text: optC || 'Opsi C' },
            { id: 'D', text: optD || 'Opsi D' },
            ...(optE ? [{ id: 'E' as const, text: optE }] : [{ id: 'E' as const, text: 'Opsi E' }])
          ]
        });
      }
    });

    if (parsedQuestions.length === 0) {
      alert('Tidak ada soal yang berhasil diparsing. Periksa contoh format di bawah.');
      return;
    }

    setIsSaving(true);
    try {
      await onBulkAddQuestionsToExam(selectedExamId, parsedQuestions);
      alert(`Berhasil menambahkan ${parsedQuestions.length} butir soal sekaligus!`);
      setBulkText('');
      onNavigateToExams();
    } catch (e: any) {
      alert('Gagal mengimpor soal: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Generate Sample Questions based on subject
  const handleGenerateTemplateQuestions = async () => {
    if (!selectedExamId) {
      alert('Pilih paket ujian tujuan terlebih dahulu');
      return;
    }

    const templateData: Record<string, Question[]> = {
      'Matematika': [
        {
          id: `q-gen-${Date.now()}-1`,
          type: 'multiple_choice',
          text: 'Hasil dari operasi aljabar 4(2x - 3) - 3(x + 5) adalah ...',
          options: [
            { id: 'A', text: '5x - 27' },
            { id: 'B', text: '5x + 3' },
            { id: 'C', text: '5x - 3' },
            { id: 'D', text: '11x - 27' },
            { id: 'E', text: '11x + 3' }
          ],
          correctAnswer: 'A',
          points: 15,
          explanation: '4(2x - 3) - 3(x + 5) = 8x - 12 - 3x - 15 = 5x - 27.'
        },
        {
          id: `q-gen-${Date.now()}-2`,
          type: 'multiple_choice',
          text: 'Sebuah persegi panjang memiliki panjang (3x + 2) cm dan lebar (2x - 1) cm. Jika kelilingnya 42 cm, maka panjang persegi panjang tersebut adalah ...',
          options: [
            { id: 'A', text: '12 cm' },
            { id: 'B', text: '14 cm' },
            { id: 'C', text: '16 cm' },
            { id: 'D', text: '18 cm' },
            { id: 'E', text: '20 cm' }
          ],
          correctAnswer: 'B',
          points: 15,
          explanation: '2(p + l) = 42 => 5x + 1 = 21 => 5x = 20 => x = 4. Panjang = 3(4) + 2 = 14 cm.'
        },
        {
          id: `q-gen-${Date.now()}-3`,
          type: 'essay',
          text: 'Tuliskan dan buktikan rumus Teorema Pythagoras untuk segitiga siku-siku dengan panjang sisi miring c serta sisi tegak a dan b!',
          options: [],
          correctAnswer: 'a^2 + b^2 = c^2',
          points: 20,
          explanation: 'Teorema Pythagoras menyatakan kuadrat sisi miring sama dengan jumlah kuadrat sisi-sisi penyikunya (c^2 = a^2 + b^2).'
        }
      ],
      'Bahasa Indonesia': [
        {
          id: `q-gen-${Date.now()}-1`,
          type: 'multiple_choice',
          text: 'Kalimat yang mengandung opini (pendapat subjektif) dalam teks argumentasi adalah ...',
          options: [
            { id: 'A', text: 'Indonesia terletak di antara dua benua dan dua samudera.' },
            { id: 'B', text: 'Pemerintah menetapkan kurikulum baru mulai tahun ajaran ini.' },
            { id: 'C', text: 'Pemberian tugas rumah berlebihan dinilai kurang efektif bagi perkembangan kreativitas siswa.' },
            { id: 'D', text: 'Siswa kelas 10 mengikuti ujian asesmen pada hari Senin pukul 08.00 WIB.' },
            { id: 'E', text: 'Buku pelajaran dibagikan secara gratis kepada seluruh peserta didik.' }
          ],
          correctAnswer: 'C',
          points: 15,
          explanation: 'Kalimat C merupakan opini karena menggunakan kata pertimbangan subjektif "dinilai kurang efektif".'
        },
        {
          id: `q-gen-${Date.now()}-2`,
          type: 'multiple_choice',
          text: 'Penulisan kata gabung (frasa) yang tepat sesuai kaidah ejaan adalah ...',
          options: [
            { id: 'A', text: 'tanggungjawab' },
            { id: 'B', text: 'tanggung jawab' },
            { id: 'C', text: 'tanggung-jawab' },
            { id: 'D', text: 'tanggungjawabkan' },
            { id: 'E', text: 'pertanggung jawaban' }
          ],
          correctAnswer: 'B',
          points: 15,
          explanation: 'Kata gabung dasar ditulis terpisah: "tanggung jawab". Ditulis serangkai jika mendapat awalan dan akhiran sekaligus: "dipertanggungjawabkan".'
        }
      ],
      'IPA': [
        {
          id: `q-gen-${Date.now()}-1`,
          type: 'multiple_choice',
          text: 'Pemberian gaya sebesar 50 N pada benda bermassa 5 kg di atas lantai licin akan menghasilkan percepatan sebesar ...',
          options: [
            { id: 'A', text: '5 m/s²' },
            { id: 'B', text: '10 m/s²' },
            { id: 'C', text: '15 m/s²' },
            { id: 'D', text: '25 m/s²' },
            { id: 'E', text: '250 m/s²' }
          ],
          correctAnswer: 'B',
          points: 15,
          explanation: 'a = F / m = 50 N / 5 kg = 10 m/s².'
        },
        {
          id: `q-gen-${Date.now()}-2`,
          type: 'multiple_choice',
          text: 'Gas yang diserap oleh tumbuhan hijau pada tahap reaksi gelap fotosintesis untuk membentuk glukosa adalah ...',
          options: [
            { id: 'A', text: 'Oksigen (O2)' },
            { id: 'B', text: 'Nitrogen (N2)' },
            { id: 'C', text: 'Karbon Dioksida (CO2)' },
            { id: 'D', text: 'Hidrogen (H2)' },
            { id: 'E', text: 'Metana (CH4)' }
          ],
          correctAnswer: 'C',
          points: 15,
          explanation: 'Karbon dioksida difiksasi dalam siklus Calvin untuk menghasilkan karbohidrat/glukosa.'
        }
      ],
      'Bahasa Inggris': [
        {
          id: `q-gen-${Date.now()}-1`,
          type: 'multiple_choice',
          text: 'Complete the sentence: "If she ... harder, she would pass the examination easily."',
          options: [
            { id: 'A', text: 'studies' },
            { id: 'B', text: 'studied' },
            { id: 'C', text: 'had studied' },
            { id: 'D', text: 'will study' },
            { id: 'E', text: 'is studying' }
          ],
          correctAnswer: 'B',
          points: 15,
          explanation: 'Conditional Type 2: If + Simple Past (studied), Subject + would + Verb 1 (would pass).'
        }
      ]
    };

    const questionsToAdd = templateData[curriculumSubject] || templateData['Matematika'];

    setIsSaving(true);
    try {
      await onBulkAddQuestionsToExam(selectedExamId, questionsToAdd);
      alert(`Berhasil membuat dan memasukkan ${questionsToAdd.length} butir soal ${curriculumSubject} ke paket ujian!`);
      onNavigateToExams();
    } catch (e: any) {
      alert('Gagal menambahkan soal: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const targetExam = exams.find(e => e.id === selectedExamId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider mb-2">
              <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
              Fitur Pembuatan Soal Guru
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Pusat Pembuatan & Bank Soal Ujian
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              Buat butir soal pilihan ganda (A-E) atau esai dengan kunci jawaban, atur bobot poin, import teks massal, atau buat soal latihan cepat kurikulum merdeka.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex flex-wrap items-center bg-black/20 p-1.5 rounded-2xl border border-white/20">
            <button
              onClick={() => setMode('single')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                mode === 'single'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Formulir Soal</span>
            </button>

            <button
              onClick={() => setMode('bulk')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                mode === 'bulk'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Massal Teks</span>
            </button>

            <button
              onClick={() => setMode('ai')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                mode === 'ai'
                  ? 'bg-amber-400 text-amber-950 font-black shadow-sm'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generator Cepat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Target Exam Selection Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Pilih Paket Ujian Tujuan
            </label>
            <select
              value={selectedExamId}
              onChange={e => setSelectedExamId(e.target.value)}
              className="text-xs sm:text-sm font-extrabold text-slate-800 bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
            >
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>
                  {ex.title} ({ex.subject} - {ex.grade}) • {ex.questions.length} Soal
                </option>
              ))}
            </select>
          </div>
        </div>

        {targetExam && (
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="font-mono-numbers px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 font-bold text-blue-800">
              Token: {targetExam.token}
            </span>
            <span>•</span>
            <span>Saat ini: {targetExam.questions.length} butir soal</span>
          </div>
        )}
      </div>

      {savedSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* MODE 1: FORMULIR BUAT SOAL MANUAL */}
      {mode === 'single' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Formulir Tambah Soal</h2>
              <p className="text-xs text-slate-500">Masukkan pertanyaan, kunci jawaban, dan bobot nilai</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Tipe:</span>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType('multiple_choice')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    type === 'multiple_choice' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Pilihan Ganda
                </button>
                <button
                  type="button"
                  onClick={() => setType('essay')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    type === 'essay' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Uraian / Esai
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Question Text */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Isi Pertanyaan Soal
                </label>
                <span className="text-[11px] text-slate-400">Dapat memuat teks narasi, angka, atau kutipan</span>
              </div>
              <textarea
                rows={5}
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
                placeholder="Ketik narasi pertanyaan soal di sini secara lengkap..."
                className="w-full p-4 rounded-2xl border border-slate-300 text-xs sm:text-sm leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition"
                required
              />
            </div>

            {/* Foto / Gambar Soal */}
            <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Sertakan Foto / Gambar Diagram (Opsional)
                  </span>
                </div>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus Foto
                  </button>
                )}
              </div>

              {imageUrl ? (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-white p-3 flex flex-col items-center">
                  <img
                    src={imageUrl}
                    alt="Pratinjau Foto Soal"
                    className="max-h-64 w-auto object-contain rounded-lg shadow-xs"
                  />
                  <span className="text-[11px] text-emerald-700 font-bold mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Foto berhasil dilampirkan ke soal ini
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
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
                      className="py-2 px-3.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>Upload Gambar dari Laptop</span>
                    </button>
                    <span className="text-xs text-slate-400">atau masukkan tautan/URL gambar:</span>
                  </div>

                  <input
                    type="url"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    placeholder="https://example.com/foto-soal.png"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden bg-white"
                  />
                </div>
              )}
            </div>

            {/* Points Weight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bobot Nilai / Skor Soal Ini
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={points}
                  onChange={e => setPoints(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 outline-hidden"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">Bobot standar: 10 - 25 poin per butir</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kunci Jawaban Benar
                </label>
                {type === 'multiple_choice' ? (
                  <div className="flex items-center gap-2 pt-1">
                    {(['A', 'B', 'C', 'D', 'E'] as const).map(k => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setCorrectAnswer(k)}
                        className={`flex-1 py-2 rounded-xl text-xs font-extrabold border transition ${
                          correctAnswer === k
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={correctAnswer}
                    onChange={e => setCorrectAnswer(e.target.value)}
                    placeholder="Pedoman kunci atau kriteria jawaban benar..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                )}
              </div>
            </div>

            {/* Multiple Choice Options List */}
            {type === 'multiple_choice' && (
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pilihan Jawaban (A s/d E) & Tandai Kunci:
                </label>
                <div className="space-y-2.5">
                  {options.map(opt => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCorrectAnswer(opt.id)}
                        className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center shrink-0 border transition ${
                          correctAnswer === opt.id
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
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
                        placeholder={`Teks pilihan ${opt.id}...`}
                        className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-hidden transition ${
                          correctAnswer === opt.id
                            ? 'border-emerald-400 bg-emerald-50/30'
                            : 'border-slate-300'
                        }`}
                        required
                      />
                      {correctAnswer === opt.id && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 hidden sm:inline">
                          ✓ KUNCI
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Explanation / Pembahasan */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Pembahasan / Penjelasan Soal (Opsional)
              </label>
              <textarea
                rows={3}
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
                placeholder="Penjelasan langkah penyelesaian materi yang bisa dibaca siswa saat pembahasan dibuka..."
                className="w-full p-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onNavigateToExams}
              className="py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Lihat Daftar Soal
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSaveSingle(true)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <PlusCircle className="w-4 h-4 text-blue-600" />
                <span>Simpan & Tambah Soal Lagi</span>
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSaveSingle(false)}
                className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Soal'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: IMPORT MASSAL DARI TEKS */}
      {mode === 'bulk' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Import Soal Sekaligus (Copy-Paste)</h2>
            <p className="text-xs text-slate-500 mt-1">
              Salin kumpulan soal dari Microsoft Word atau teks catatan dengan format standar berikut:
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 font-mono text-xs text-slate-700 space-y-1">
            <p className="font-bold text-blue-700">Contoh Format Soal:</p>
            <p>Soal: Hasil dari 15 x 12 adalah ...</p>
            <p>A: 150</p>
            <p>B: 180</p>
            <p>C: 200</p>
            <p>D: 210</p>
            <p>Kunci: B</p>
            <p>Pembahasan: 15 dikalikan 12 menghasilkan 180.</p>
            <p className="text-slate-400">--- (Gunakan 3 tanda strip untuk memisahkan antar soal)</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tempelkan (Paste) Teks Soal Di Sini:
            </label>
            <textarea
              rows={10}
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              placeholder={`Soal: Organel sel tempat berlangsungnya fotosintesis adalah ...\nA: Kloroplas\nB: Mitokondria\nC: Ribosom\nD: Vakuola\nKunci: A\nPembahasan: Kloroplas mengandung klorofil untuk fotosintesis.\n---\nSoal: Satuan gaya dalam SI adalah ...\nA: Joule\nB: Newton\nC: Watt\nD: Pascal\nKunci: B`}
              className="w-full p-4 font-mono text-xs rounded-2xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onNavigateToExams}
              className="py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleProcessBulk}
              className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition"
            >
              <Upload className="w-4 h-4" />
              <span>{isSaving ? 'Mengimpor...' : 'Proses & Masukkan Soal ke Ujian'}</span>
            </button>
          </div>
        </div>
      )}

      {/* MODE 3: GENERATOR SOAL CEPAT (KURIKULUM SEKOLAH) */}
      {mode === 'ai' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Generator Paket Soal Otomatis</h2>
              <p className="text-xs text-slate-500">
                Pilih mata pelajaran untuk membuat butir soal kurikulum lengkap beserta kunci dan pembahasan secara otomatis.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(['Matematika', 'Bahasa Indonesia', 'IPA', 'Bahasa Inggris'] as const).map(subject => (
              <div
                key={subject}
                onClick={() => setCurriculumSubject(subject)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                  curriculumSubject === subject
                    ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{subject}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Paket soal pilihan ganda & esai terverifikasi
                  </p>
                </div>
                {curriculumSubject === subject && (
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                )}
              </div>
            ))}
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-amber-800">
              <Sparkles className="w-4 h-4" /> Apa yang akan dimasukkan?
            </span>
            <p>
              Paket soal mencakup soal pilihan ganda (A-E) dan uraian esai dengan indikator kompetensi dasar, kunci jawaban pasti, dan langkah pembahasan komprehensif.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onNavigateToExams}
              className="py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleGenerateTemplateQuestions}
              className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isSaving ? 'Menambahkan...' : `Buat & Masukkan Soal ${curriculumSubject}`}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
