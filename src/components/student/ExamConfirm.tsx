import React from 'react';
import { ArrowLeft, Clock, FileQuestion, ShieldAlert, CheckCircle, Award } from 'lucide-react';
import { Exam } from '../../types/cbt';

interface ExamConfirmProps {
  exam: Exam;
  student: { nis: string; name: string; classGrade: string };
  onCancel: () => void;
  onProceed: () => void;
}

export const ExamConfirm: React.FC<ExamConfirmProps> = ({
  exam,
  student,
  onCancel,
  onProceed
}) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke form masuk
          </button>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Konfirmasi Memulai Ujian</h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            Harap pastikan data peserta dan mata pelajaran sudah sesuai sebelum memulai pengerjaan.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Identity Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Identitas Peserta</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-400">Nomor Induk Siswa (NIS)</span>
                <p className="text-sm font-bold text-slate-800 font-mono-numbers">{student.nis}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Kelas / Rombel</span>
                <p className="text-sm font-bold text-slate-800">{student.classGrade}</p>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-slate-400">Nama Lengkap Siswa</span>
                <p className="text-base font-extrabold text-blue-900">{student.name}</p>
              </div>
            </div>
          </div>

          {/* Exam Details */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider">Rincian Paket Ujian</h3>
            <div className="space-y-2">
              <div className="text-base font-extrabold text-slate-900">{exam.title}</div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-white p-3 rounded-xl border border-blue-100 flex flex-col items-center justify-center text-center">
                  <Clock className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="text-[11px] text-slate-400">Alokasi Waktu</span>
                  <span className="text-sm font-bold text-slate-800">{exam.durationMinutes} Menit</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-blue-100 flex flex-col items-center justify-center text-center">
                  <FileQuestion className="w-5 h-5 text-indigo-600 mb-1" />
                  <span className="text-[11px] text-slate-400">Jumlah Soal</span>
                  <span className="text-sm font-bold text-slate-800">{exam.questions.length} Butir</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-blue-100 flex flex-col items-center justify-center text-center">
                  <Award className="w-5 h-5 text-amber-500 mb-1" />
                  <span className="text-[11px] text-slate-400">Mata Pelajaran</span>
                  <span className="text-xs font-bold text-slate-800 truncate max-w-full">{exam.subject}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Warnings and Agreement */}
          <div className="border border-slate-200 rounded-2xl p-4 space-y-2 bg-slate-50 text-xs text-slate-600">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Ketentuan Pengerjaan:
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
              <li>Waktu akan langsung berjalan mundur saat Anda menekan tombol "Mulai Kerjakan".</li>
              <li>Sistem dilengkapi deteksi kecurangan otomatis (Anti-Cheat). Dilarang beralih jendela/tab browser.</li>
              <li>Jawaban tersimpan secara otomatis setiap kali Anda memilih opsi.</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition"
            >
              Batal
            </button>
            <button
              onClick={onProceed}
              className="flex-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mulai Kerjakan Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
