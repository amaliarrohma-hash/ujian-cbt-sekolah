import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  ShieldCheck,
  KeyRound,
  User,
  Eye,
  EyeOff
} from 'lucide-react';
import { AdminUser } from '../../types/cbt';

interface AdminUserManagerProps {
  admins: AdminUser[];
  onSaveAdmin: (admin: Partial<AdminUser>) => Promise<AdminUser>;
  onDeleteAdmin: (id: string) => Promise<void>;
}

export const AdminUserManager: React.FC<AdminUserManagerProps> = ({
  admins,
  onSaveAdmin,
  onDeleteAdmin
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Form state
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Super Admin' | 'Guru Mapel' | 'Pengawas'>('Guru Mapel');

  const showNotice = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 3500);
  };

  const toggleShowPassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenAdd = () => {
    setEditingId(undefined);
    setUsername('');
    setName('');
    setPassword('');
    setRole('Guru Mapel');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (adm: AdminUser) => {
    setEditingId(adm.id);
    setUsername(adm.username);
    setName(adm.name);
    setPassword(adm.password);
    setRole(adm.role);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !name.trim() || !password.trim()) return;

    await onSaveAdmin({
      id: editingId,
      username: username.trim(),
      name: name.trim(),
      password: password.trim(),
      role
    });

    setIsModalOpen(false);
    showNotice(
      editingId
        ? `Akun Admin "${name}" berhasil diperbarui.`
        : `Akun Admin / Guru "${name}" berhasil ditambahkan!`
    );
  };

  const handleConfirmDelete = async () => {
    if (!adminToDelete) return;
    if (admins.length <= 1) {
      showNotice('Minimal harus ada 1 akun Admin aktif di sistem.');
      setAdminToDelete(null);
      return;
    }

    setIsDeleting(true);
    try {
      await onDeleteAdmin(adminToDelete.id);
      showNotice(`Akun Admin "${adminToDelete.name}" berhasil dihapus.`);
      setAdminToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAdmins = admins.filter(
    a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.username.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Kelola Akun Admin & Guru Pengawas</h2>
          <p className="text-xs text-slate-500">
            Tambahkan akun guru mata pelajaran, pengawas ruangan, atau administrator baru untuk akses Panel Guru
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Admin / Guru</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari berdasarkan username, nama guru/admin, atau jabatan..."
          className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-hidden"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-4">No</th>
                <th className="py-3.5 px-4">Username Login</th>
                <th className="py-3.5 px-4">Nama Lengkap Guru / Admin</th>
                <th className="py-3.5 px-4">Peran / Jabatan</th>
                <th className="py-3.5 px-4">PIN / Password</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    Tidak ada akun admin ditemukan.
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((adm, idx) => (
                  <tr key={adm.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 text-slate-400 font-mono-numbers">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{adm.username}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{adm.name}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                          adm.role === 'Super Admin'
                            ? 'bg-indigo-100 text-indigo-800'
                            : adm.role === 'Guru Mapel'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {adm.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-2 font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                        <span>{showPasswords[adm.id] ? adm.password : '••••••'}</span>
                        <button
                          type="button"
                          onClick={() => toggleShowPassword(adm.id)}
                          className="text-slate-400 hover:text-slate-700"
                          title={showPasswords[adm.id] ? 'Sembunyikan PIN' : 'Lihat PIN'}
                        >
                          {showPasswords[adm.id] ? (
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
                          onClick={() => handleOpenEdit(adm)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          title="Edit Akun Admin"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {admins.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setAdminToDelete(adm)}
                            className="px-2.5 py-1.5 rounded-lg text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 font-bold text-xs inline-flex items-center gap-1 transition"
                            title="Hapus Akun Admin"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span>Total Akun Admin & Guru: {admins.length} akun</span>
        </div>
      </div>

      {/* Modal Tambah / Edit Admin */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingId ? 'Edit Akun Admin / Guru' : 'Tambah Admin / Guru Baru'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Username Login
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Contoh: guru_mtk atau pengawas1"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap Guru / Pengawas
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Contoh: Drs. Hendra Wijaya, M.Pd."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    PIN / Kata Sandi
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="PIN / Password"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Peran / Jabatan
                  </label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Guru Mapel">Guru Mapel</option>
                    <option value="Pengawas">Pengawas</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition"
                >
                  Simpan Akun Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Admin */}
      {adminToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Hapus Akun Admin?</h3>
                <p className="text-xs text-slate-500">Akun ini tidak akan bisa login ke Panel Guru lagi</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="font-extrabold text-slate-900 text-sm">{adminToDelete.name}</div>
              <div className="text-slate-500">
                Username: <strong className="font-mono text-indigo-700">{adminToDelete.username}</strong> • {adminToDelete.role}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setAdminToDelete(null)}
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
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus Akun'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
