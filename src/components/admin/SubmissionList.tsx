import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Search,
  Eye,
  ShieldAlert,
  ShieldCheck,
  Filter,
  RotateCcw,
  Award,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Exam, Submission } from '../../types/cbt';
import { SubmissionDetailModal } from './SubmissionDetailModal';

interface SubmissionListProps {
  submissions: Submission[];
  exams: Exam[];
  onGradeEssay: (subId: string, essayGrading: Record<string, { score: number; note: string }>) => Promise<void>;
}

export const SubmissionList: React.FC<SubmissionListProps> = ({
  submissions,
  exams,
  onGradeEssay
}) => {
  // Filter & Sort States
  const [search, setSearch] = useState('');
  const [selectedExamId, setSelectedExamId] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [passStatus, setPassStatus] = useState<'all' | 'passed' | 'failed'>('all');
  const [integrityFilter, setIntegrityFilter] = useState<'all' | 'clean' | 'violated'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest' | 'name'>('newest');

  const [viewingSub, setViewingSub] = useState<Submission | null>(null);

  // Unique classes from submissions
  const uniqueClasses = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach(s => {
      if (s.studentClass) set.add(s.studentClass);
    });
    return Array.from(set).sort();
  }, [submissions]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedExamId('all');
    setSelectedClass('all');
    setPassStatus('all');
    setIntegrityFilter('all');
    setSortBy('newest');
  };

  const hasActiveFilter =
    search.trim() !== '' ||
    selectedExamId !== 'all' ||
    selectedClass !== 'all' ||
    passStatus !== 'all' ||
    integrityFilter !== 'all' ||
    sortBy !== 'newest';

  const filteredSubs = useMemo(() => {
    const filtered = submissions.filter(s => {
      const matchesExam = selectedExamId === 'all' || s.examId === selectedExamId;
      const matchesClass = selectedClass === 'all' || s.studentClass === selectedClass;
      const matchesSearch =
        s.studentName.toLowerCase().includes(search.toLowerCase()) ||
        s.studentNis.toLowerCase().includes(search.toLowerCase()) ||
        s.studentClass.toLowerCase().includes(search.toLowerCase()) ||
        s.examTitle.toLowerCase().includes(search.toLowerCase());

      const matchesPass =
        passStatus === 'all' ||
        (passStatus === 'passed' && s.percentage >= 75) ||
        (passStatus === 'failed' && s.percentage < 75);

      const matchesIntegrity =
        integrityFilter === 'all' ||
        (integrityFilter === 'clean' && s.tabSwitchViolations === 0) ||
        (integrityFilter === 'violated' && s.tabSwitchViolations > 0);

      return matchesExam && matchesClass && matchesSearch && matchesPass && matchesIntegrity;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'highest') return b.percentage - a.percentage;
      if (sortBy === 'lowest') return a.percentage - b.percentage;
      if (sortBy === 'name') return a.studentName.localeCompare(b.studentName);
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });
  }, [submissions, search, selectedExamId, selectedClass, passStatus, integrityFilter, sortBy]);

  // Summary metrics for filtered results
  const avgPercentage =
    filteredSubs.length > 0
      ? Math.round(filteredSubs.reduce((acc, s) => acc + s.percentage, 0) / filteredSubs.length)
      : 0;
  const passedCount = filteredSubs.filter(s => s.percentage >= 75).length;
  const failedCount = filteredSubs.length - passedCount;

  const handleExportCSV = () => {
    if (filteredSubs.length === 0) return;

    const headers = [
      'No',
      'NIS',
      'Nama Siswa',
      'Kelas',
      'Mata Pelajaran',
      'Judul Ujian',
      'Waktu Pengumpulan',
      'Skor',
      'Skor Maksimal',
      'Nilai Akhir (%)',
      'Status KKM',
      'Pelanggaran Tab'
    ];
    const rows = filteredSubs.map((s, idx) => [
      idx + 1,
      `"${s.studentNis}"`,
      `"${s.studentName}"`,
      `"${s.studentClass}"`,
      `"${s.subject}"`,
      `"${s.examTitle}"`,
      `"${new Date(s.submittedAt).toLocaleString('id-ID')}"`,
      s.score,
      s.maxScore,
      `${s.percentage}`,
      s.percentage >= 75 ? 'LULUS' : 'BELUM LULUS',
      s.tabSwitchViolations
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap-nilai-ujian-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const activeExamObj = viewingSub ? exams.find(e => e.id === viewingSub.examId) : undefined;

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Rekap Hasil & Lembar Jawaban Ujian</h2>
          <p className="text-xs text-slate-500">
            Filter rekapitulasi nilai berdasarkan paket ujian, kelas, status kelulusan KKM, dan integritas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="py-2.5 px-3.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition print:hidden"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Cetak Rekap</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filteredSubs.length === 0}
            className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition print:hidden"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export ke Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* Comprehensive Filter Box */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>Filter Rekapitulasi Nilai</span>
          </div>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Semua Filter</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama siswa atau NIS..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
            />
          </div>

          {/* Filter Paket Ujian */}
          <div>
            <select
              value={selectedExamId}
              onChange={e => setSelectedExamId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
            >
              <option value="all">Semua Ujian ({exams.length})</option>
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>
                  {ex.subject} - {ex.title}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Kelas / Rombel */}
          <div>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
            >
              <option value="all">Semua Kelas ({uniqueClasses.length})</option>
              {uniqueClasses.map(cls => (
                <option key={cls} value={cls}>
                  Kelas {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Kelulusan KKM */}
          <div>
            <select
              value={passStatus}
              onChange={e => setPassStatus(e.target.value as 'all' | 'passed' | 'failed')}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
            >
              <option value="all">Semua Status KKM</option>
              <option value="passed">✓ Lulus KKM (≥ 75)</option>
              <option value="failed">✗ Belum Lulus (&lt; 75)</option>
            </select>
          </div>

          {/* Urutkan & Integritas */}
          <div className="flex gap-2">
            <select
              value={integrityFilter}
              onChange={e => setIntegrityFilter(e.target.value as 'all' | 'clean' | 'violated')}
              className="w-1/2 px-2 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
              title="Filter Integritas"
            >
              <option value="all">Semua Tab</option>
              <option value="clean">0x Pindah</option>
              <option value="violated">Ada Pindah</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'newest' | 'highest' | 'lowest' | 'name')}
              className="w-1/2 px-2 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
              title="Urutkan Data"
            >
              <option value="newest">Terbaru</option>
              <option value="highest">Tertinggi</option>
              <option value="lowest">Terendah</option>
              <option value="name">Nama A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ringkasan Statistik dari Hasil Filter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 block">Data Terfilter</span>
            <span className="text-lg font-black text-slate-900 font-mono-numbers">{filteredSubs.length} Siswa</span>
          </div>
          <Filter className="w-5 h-5 text-slate-400" />
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 block">Rata-Rata Nilai</span>
            <span className="text-lg font-black text-indigo-700 font-mono-numbers">{avgPercentage}</span>
          </div>
          <Award className="w-5 h-5 text-indigo-500" />
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 block">Lulus KKM (≥ 75)</span>
            <span className="text-lg font-black text-emerald-700 font-mono-numbers">{passedCount} Siswa</span>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 block">Belum Lulus (&lt; 75)</span>
            <span className="text-lg font-black text-rose-600 font-mono-numbers">{failedCount} Siswa</span>
          </div>
          <XCircle className="w-5 h-5 text-rose-500" />
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-4">No</th>
                <th className="py-3.5 px-4">Siswa</th>
                <th className="py-3.5 px-4">Kelas</th>
                <th className="py-3.5 px-4">Paket Ujian</th>
                <th className="py-3.5 px-4">Waktu Selesai</th>
                <th className="py-3.5 px-4 text-center">Nilai Akhir</th>
                <th className="py-3.5 px-4 text-center">Integritas</th>
                <th className="py-3.5 px-4 text-right print:hidden">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    Belum ada data pengumpulan ujian yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredSubs.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 text-slate-400 font-mono-numbers">{idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{s.studentName}</div>
                      <div className="text-[11px] text-slate-500 font-mono-numbers">NIS: {s.studentNis}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                        {s.studentClass}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{s.examTitle}</div>
                      <div className="text-[11px] text-slate-500">{s.subject}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono-numbers">
                      {new Date(s.submittedAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}{' '}
                      WIB
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 font-black font-mono-numbers text-sm px-2.5 py-1 rounded-lg ${
                          s.percentage >= 75
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : s.percentage >= 50
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {s.percentage}
                        <span className="text-[10px] font-normal text-slate-400">
                          ({s.score}/{s.maxScore})
                        </span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {s.tabSwitchViolations === 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="w-3.5 h-3.5" /> 0x
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          <ShieldAlert className="w-3.5 h-3.5" /> {s.tabSwitchViolations}x Beralih
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right print:hidden">
                      <button
                        type="button"
                        onClick={() => setViewingSub(s)}
                        className="py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs inline-flex items-center gap-1 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Koreksi / Detail</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Menampilkan <strong>{filteredSubs.length}</strong> dari total <strong>{submissions.length}</strong> lembar jawaban
          </span>
        </div>
      </div>

      {/* Submission Detail & Essay Grading Modal */}
      {viewingSub && (
        <SubmissionDetailModal
          submission={viewingSub}
          exam={activeExamObj}
          onGradeEssay={async (subId, grading) => {
            await onGradeEssay(subId, grading);
            setViewingSub(prev => (prev ? { ...prev, essayGrading: grading } : null));
          }}
          onClose={() => setViewingSub(null)}
        />
      )}
    </div>
  );
};
