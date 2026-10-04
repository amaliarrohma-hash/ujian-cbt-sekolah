import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Search,
  Upload,
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Eye,
  EyeOff,
  Filter,
  RotateCcw,
  KeyRound
} from 'lucide-react';
import { Student } from '../../types/cbt';

interface StudentManagerProps {
  students: Student[];
  onSaveStudent: (student: Partial<Student>) => Promise<Student>;
  onBulkAddStudents: (students: Partial<Student>[]) => Promise<{ count: number }>;
  onDeleteStudent: (id: string) => Promise<void>;
}

export const StudentManager: React.FC<StudentManagerProps> = ({
  students,
  onSaveStudent,
  onBulkAddStudents,
  onDeleteStudent
}) => {
  // Filter & Search States
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'nis' | 'name' | 'class'>('nis');

  // Modals & UI States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Single student form (supports Add & Edit)
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [nis, setNis] = useState('');
  const [name, setName] = useState('');
  const [classGrade, setClassGrade] = useState('10-IPA-1');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [password, setPassword] = useState('');

  // Bulk input text
  const [bulkText, setBulkText] = useState('');

  const showNotice = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const toggleShowPassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Unique classes list for filter dropdown
  const uniqueClasses = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (s.classGrade) set.add(s.classGrade);
    });
    return Array.from(set).sort();
  }, [students]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedClass('all');
    setSelectedGender('all');
    setSortBy('nis');
  };

  const hasActiveFilter =
    search.trim() !== '' || selectedClass !== 'all' || selectedGender !== 'all' || sortBy !== 'nis';

  const handleOpenAdd = () => {
    setEditingId(undefined);
    setNis('');
    setName('');
    setClassGrade('10-IPA-1');
    setGender('L');
    setPassword('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (s: Student) => {
    setEditingId(s.id);
    setNis(s.nis);
    setName(s.name);
    setClassGrade(s.classGrade);
    setGender(s.gender || 'L');
    setPassword(s.password || s.nis);
    setIsAddModalOpen(true);
  };

  const handleSaveSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nis.trim() || !name.trim()) return;

    await onSaveStudent({
      id: editingId,
      nis: nis.trim(),
      name: name.trim(),
      classGrade: classGrade.trim(),
      gender,
      password: (password.trim() || nis.trim())
    });

    setNis('');
    setName('');
    setPassword('');
    setEditingId(undefined);
    setIsAddModalOpen(false);
    showNotice(editingId ? 'Data siswa berhasil diperbarui.' : 'Siswa baru berhasil ditambahkan.');
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteStudent(studentToDelete.id);
      showNotice(`Data siswa "${studentToDelete.name}" berhasil dihapus.`);
      setStudentToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleProcessBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n');
    const parsed: Partial<Student>[] = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const parts = trimmed.split(/[,;\t]+/).map(p => p.trim());
      if (parts.length >= 2) {
        const studentNis = parts[0];
        parsed.push({
          nis: studentNis,
          name: parts[1],
          classGrade: parts[2] || '10',
          gender: parts[3]?.toUpperCase() === 'P' ? 'P' : 'L',
          password: parts[4] || studentNis
        });
      }
    });

    if (parsed.length === 0) {
      showNotice('Format data siswa tidak valid. Gunakan format: NIS, Nama, Kelas, L/P, Password');
      return;
    }

    const res = await onBulkAddStudents(parsed);
    showNotice(`Berhasil mengimpor ${res.count} data siswa baru!`);
    setBulkText('');
    setIsBulkModalOpen(false);
  };

  const filteredStudents = useMemo(() => {
    const filtered = students.filter(s => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.nis.toLowerCase().includes(search.toLowerCase()) ||
        s.classGrade.toLowerCase().includes(search.toLowerCase());
      const matchesClass = selectedClass === 'all' || s.classGrade === selectedClass;
      const matchesGender = selectedGender === 'all' || (s.gender || 'L') === selectedGender;
      return matchesSearch && matchesClass && matchesGender;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'class') return a.classGrade.localeCompare(b.classGrade);
      return a.nis.localeCompare(b.nis);
    });
  }, [students, search, selectedClass, selectedGender, sortBy]);

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Data Siswa Peserta Ujian</h2>
          <p className="text-xs text-slate-500">
            Kelola daftar NIS, nama siswa, kelas/rombel, dan password login siswa
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsBulkModalOpen(true)}
            className="py-2.5 px-3.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Import Massal</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Filter & Pencarian Data Siswa</span>
          </div>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari NIS atau nama siswa..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>

          {/* Filter Kelas */}
          <div className="lg:col-span-3">
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value="all">Semua Kelas ({uniqueClasses.length})</option>
              {uniqueClasses.map(cls => (
                <option key={cls} value={cls}>
                  Kelas {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Jenis Kelamin */}
          <div className="lg:col-span-2">
            <select
              value={selectedGender}
              onChange={e => setSelectedGender(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value="all">Semua Gender</option>
              <option value="L">Laki-laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="lg:col-span-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'nis' | 'name' | 'class')}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value="nis">Urut: NIS</option>
              <option value="name">Urut: Nama (A-Z)</option>
              <option value="class">Urut: Kelas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-4">No</th>
                <th className="py-3.5 px-4">NIS</th>
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-4">Kelas</th>
                <th className="py-3.5 px-4">Gender</th>
                <th className="py-3.5 px-4">Password Login</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    Tidak ada data siswa yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => {
                  const studentPass = s.password || s.nis;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 text-slate-400 font-mono-numbers">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-mono-numbers font-bold text-blue-700">{s.nis}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{s.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                          {s.classGrade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {s.gender === 'P' ? 'Perempuan (P)' : 'Laki-laki (L)'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-2 font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <span>{showPasswords[s.id] ? studentPass : '••••••'}</span>
                          <button
                            type="button"
                            onClick={() => toggleShowPassword(s.id)}
                            className="text-slate-400 hover:text-slate-700"
                            title={showPasswords[s.id] ? 'Sembunyikan Password' : 'Lihat Password'}
                          >
                            {showPasswords[s.id] ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Edit Siswa & Password"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentToDelete(s)}
                            className="px-2.5 py-1.5 rounded-lg text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 font-bold text-xs inline-flex items-center gap-1 transition"
                            title="Hapus Siswa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Menampilkan <strong>{filteredStudents.length}</strong> dari total <strong>{students.length}</strong> siswa
          </span>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus Siswa */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Hapus Data Siswa?</h3>
                <p className="text-xs text-slate-500">Tindakan ini akan menghapus akun siswa dari sistem</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="font-extrabold text-slate-900 text-sm">{studentToDelete.name}</div>
              <div className="text-slate-500">
                NIS: <strong className="font-mono text-slate-700">{studentToDelete.nis}</strong> • Kelas: {studentToDelete.classGrade}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md shadow-rose-500/20 transition"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus Siswa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Single Student */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? 'Edit Data & Password Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSingle} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nomor Induk Siswa (NIS)
                  </label>
                  <input
                    type="text"
                    value={nis}
                    onChange={e => setNis(e.target.value)}
                    placeholder="Contoh: 202610"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Password Login Siswa
                  </label>
                  <div className="relative">
                    <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Kosongkan = sesuai NIS"
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap siswa"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kelas / Rombel
                  </label>
                  <input
                    type="text"
                    value={classGrade}
                    onChange={e => setClassGrade(e.target.value)}
                    placeholder="Contoh: 10-IPA-1"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as 'L' | 'P')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  >
                    <option value="L">Laki-Laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Bulk Import */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Import Massal Siswa (Paste / CSV)</h3>
              </div>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessBulk} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Salin daftar siswa dari Excel atau ketik baris demi baris dengan format:<br />
                <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-mono">
                  NIS, Nama Siswa, Kelas, L/P, Password
                </code>{' '}
                <span className="text-slate-400">(Jika Password dikosongkan, otomatis sama dengan NIS)</span>
              </p>

              <div>
                <textarea
                  rows={8}
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                  placeholder={`202611, Dimas Anggara, 10-IPA-1, L, 202611\n202612, Amanda Manopo, 10-IPA-1, P, rahasia123\n202613, Fikri Haikal, 10-IPS-1, L, 202613`}
                  className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Proses Import Siswa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
