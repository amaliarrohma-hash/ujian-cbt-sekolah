import React, { useState, useRef } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  HardDrive, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  FileCode2, 
  Sparkles,
  Server,
  ShieldCheck
} from 'lucide-react';
import { CBTDatabase } from '../../types/cbt';

interface DatabaseManagerProps {
  db: CBTDatabase;
  onRestore: (data: CBTDatabase) => Promise<void>;
  onReset: () => Promise<void>;
}

export const DatabaseManager: React.FC<DatabaseManagerProps> = ({
  db,
  onRestore,
  onReset
}) => {
  const [copied, setCopied] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1-Click Backup Database to JSON
  const handleDownloadBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
    const downloadAnchor = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cbt-database-sekolah-${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // 1-Click Restore from File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setIsProcessing(true);
        const content = event.target?.result as string;
        const parsed: CBTDatabase = JSON.parse(content);

        if (!parsed.exams || !parsed.students) {
          throw new Error('Format file tidak sesuai dengan struktur database CBT EduUjian');
        }

        if (confirm(`Pulihkan database dari file "${file.name}"? Data saat ini akan digantikan.`)) {
          await onRestore(parsed);
          alert('Database berhasil dipulihkan dengan sempurna!');
        }
      } catch (err: any) {
        alert('Gagal membaca file: ' + err.message);
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Reset to default seed
  const handleReset = async () => {
    if (confirm('Apakah Anda yakin ingin mereset database ke contoh data awal sekolah? Seluruh paket soal dan siswa contoh akan dikembalikan.')) {
      setIsProcessing(true);
      try {
        await onReset();
        alert('Database telah di-reset ke data bawaan.');
      } catch (e: any) {
        alert('Gagal mereset database: ' + e.message);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(db, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalQuestions = db.exams.reduce((acc, ex) => acc + ex.questions.length, 0);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
          Sistem Database Mudah & Tanpa Ribet
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
          Pusat Manajemen Database Sekolah
        </h1>
        <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Database berbasis berkas JSON persisten mandiri. Tidak memerlukan konfigurasi server database eksternal yang rumit atau biaya langganan bulanan. Anda dapat mencadangkan (backup) dan memulihkan (restore) seluruh data sekolah kapan saja dalam 1 klik.
        </p>
      </div>

      {/* Database Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">Status Penyimpanan</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <p className="text-lg font-black text-emerald-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Aktif & Tersinkron</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            File persisten: <code className="text-slate-600">data/cbt_database.json</code>
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block mb-1">Paket Soal Tersimpan</span>
          <p className="text-2xl font-black text-slate-900 font-mono-numbers">
            {db.exams.length} <span className="text-xs font-normal text-slate-500">Ujian</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Total {totalQuestions} butir soal pilihan & esai
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block mb-1">Data Siswa Terdaftar</span>
          <p className="text-2xl font-black text-slate-900 font-mono-numbers">
            {db.students.length} <span className="text-xs font-normal text-slate-500">Siswa</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Nomor Induk & Kelas tersimpan
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block mb-1">Lembar Nilai Pengumpulan</span>
          <p className="text-2xl font-black text-slate-900 font-mono-numbers">
            {db.submissions.length} <span className="text-xs font-normal text-slate-500">Hasil</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Riwayat skor & pelanggaran tercatat
          </span>
        </div>
      </div>

      {/* Main Operations: Backup, Restore, Reset */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Backup Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Backup Database</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Unduh salinan lengkap database berupa file <code>.json</code>. Simpan file ini di laptop, flashdisk, atau Google Drive sebagai cadangan data sekolah.
            </p>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Backup (.json)</span>
          </button>
        </div>

        {/* Restore Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Restore / Pulihkan</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Unggah file cadangan <code>.json</code> yang sudah pernah di-download sebelumnya untuk mengembalikan seluruh bank soal dan nilai siswa.
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              disabled={isProcessing}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
            >
              <Upload className="w-4 h-4" />
              <span>{isProcessing ? 'Memproses...' : 'Upload File Backup'}</span>
            </button>
          </div>
        </div>

        {/* Reset Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Reset ke Data Contoh</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Kembalikan seluruh bank soal, token, dan siswa ke paket percontohan (Matematika, Bahasa Indonesia, dan IPA). Cocok untuk uji coba simulasi.
            </p>
          </div>

          <button
            disabled={isProcessing}
            onClick={handleReset}
            className="w-full py-2.5 px-4 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <RefreshCw className="w-4 h-4 text-amber-700" />
            <span>Reset ke Contoh Standar</span>
          </button>
        </div>
      </div>

      {/* Technical raw JSON Viewer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Inspeksi Data Mentah JSON</h3>
              <p className="text-[11px] text-slate-500">Melihat isi data database secara langsung</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJson}
              className="py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin JSON'}</span>
            </button>

            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="py-1.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition"
            >
              {showRawJson ? 'Sembunyikan' : 'Buka JSON'}
            </button>
          </div>
        </div>

        {showRawJson && (
          <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs max-h-96 overflow-y-auto">
            <pre>{JSON.stringify(db, null, 2)}</pre>
          </div>
        )}

        <div className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Setiap pembaruan otomatis dicatat dengan stempel waktu: <strong>{new Date(db.lastUpdated).toLocaleString('id-ID')}</strong></span>
        </div>
      </div>
    </div>
  );
};
