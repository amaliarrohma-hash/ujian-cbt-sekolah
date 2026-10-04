# 🏫 CBT EduUjian - Platform Ujian Online Sekolah

Aplikasi Computer-Based Test (CBT) modern untuk ujian sekolah berbasis web dengan backend Express, frontend React + Tailwind CSS, dan sistem penyimpanan database mandiri (`data/cbt_database.json`).

---

## 💻 Panduan Menjalankan di Laptop Anda

### 1. Prasyarat di Laptop
Pastikan laptop Anda sudah terinstal **Node.js** (versi 18 ke atas disarankan).
- Unduh gratis di: [https://nodejs.org](https://nodejs.org) (pilih versi LTS).
- Cek instalasi lewat Terminal / Command Prompt (CMD):
  ```bash
  node -v
  npm -v
  ```

---

### 2. Cara Mengunduh & Membuka Proyek
1. Buka folder proyek ini di text editor pilihan Anda (disarankan **VS Code**).
2. Buka Terminal di dalam folder proyek tersebut.

---

### 3. Install Dependensi (Hanya Sekali di Awal)
Jalankan perintah berikut di Terminal untuk mengunduh semua pustaka yang dibutuhkan:
```bash
npm install
```

---

### 4. Menjalankan Aplikasi (Frontend + Backend Sekaligus)
Jalankan perintah berikut:
```bash
npm run dev
```

Server full-stack akan langsung berjalan di:
👉 **`http://localhost:3000`**

Buka tautan tersebut di browser (Google Chrome, Edge, dsb.).

---

## 🌐 Menjalankan di Jaringan Wi-Fi Sekolah / Lab Komputer (Akses Siswa)
Agar siswa di laboratorium komputer atau melalui smartphone mereka bisa ikut ujian dari laptop guru:

1. Pastikan laptop guru dan perangkat siswa terhubung ke **Wi-Fi yang sama**.
2. Cek alamat IP lokal laptop guru:
   - **Windows**: Buka CMD, ketik `ipconfig` (cari *IPv4 Address*, misal: `192.168.1.15`).
   - **Mac/Linux**: Buka Terminal, ketik `ifconfig` atau `ip a`.
3. Di perangkat/komputer siswa, buka browser dan ketik:
   ```text
   http://192.168.1.15:3000
   ```
   *(ganti dengan IP laptop guru Anda)*. Siswa langsung bisa login dan mengerjakan ujian secara bersamaan!

---

## 🔑 Kredensial Login Bawaan

| Peran | Username / NIS | Kata Sandi / PIN |
|---|---|---|
| **Guru / Admin** | `admin` | `123456` |
| **Siswa Contoh 1** | `202601` (Ahmad Fauzi) | *(Cukup NIS & Nama)* |
| **Siswa Contoh 2** | `202602` (Siti Nurhaliza) | *(Cukup NIS & Nama)* |

> 💡 **Token Ujian Contoh**: `MTK2026` (Matematika), `BINDO26` (Bhs. Indonesia), `IPA2026` (IPA). Anda bisa membuat token baru kapan saja di menu Admin.

---

## 🗂️ Struktur File & Cara Mengendalikan Sistem

```
├── server.ts               <-- [BACKEND] Endpoint API Express, route ujian, siswa, & database
├── data/
│   └── cbt_database.json   <-- [DATABASE] Berkas data fisik (bisa dibuka & dibackup kapan saja)
│
├── src/                    <-- [FRONTEND] Antarmuka Tampilan Pengguna
│   ├── App.tsx             <-- Pengendali alur utama (Login, Siswa, Admin)
│   ├── types/cbt.ts        <-- Struktur tipe data (Soal, Ujian, Siswa, Nilai)
│   ├── services/api.ts     <-- Penghubung frontend ke backend API
│   │
│   └── components/
│       ├── auth/
│       │   └── UnifiedLoginScreen.tsx    <-- Halaman login awal wajib
│       ├── student/
│       │   ├── StudentLogin.tsx          <-- Halaman input token ujian siswa
│       │   ├── ExamConfirm.tsx           <-- Kartu konfirmasi sebelum mulai
│       │   ├── ExamRoom.tsx              <-- Ruang ujian CBT (Timer, Soal, Anti-Curang)
│       │   └── ExamResult.tsx            <-- Tanda terima skor nilai & pembahasan
│       └── admin/
│           ├── AdminPortal.tsx           <-- Pusat navigasi menu guru
│           ├── AdminDashboard.tsx        <-- Ringkasan statistik ujian
│           ├── QuestionCreator.tsx       <-- Studio buat soal (Manual, AI, Import Teks)
│           ├── ExamManager.tsx           <-- Kelola paket ujian & token
│           ├── StudentManager.tsx        <-- Kelola data & import massal siswa
│           ├── SubmissionList.tsx        <-- Rekap nilai & export Excel/CSV
│           ├── DatabaseManager.tsx       <-- Backup, restore, & reset database
│           └── SettingsModal.tsx         <-- Ubah nama sekolah, tahun ajaran, & PIN
```

---

## 🛠️ Perintah Berguna (Commands)

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan server pengembangan (Hot-reload) di port 3000 |
| `npm run build` | Melakukan kompilasi bundle frontend siap rilis |
| `npm run start` | Menjalankan server mode produksi |
| `npm run lint` | Memeriksa apakah ada kesalahan pengetikan TypeScript |

---

## 💾 Pengendalian Database Mandiri
- **File Database Langsung**: Seluruh data tersimpan di berkas `data/cbt_database.json`. Anda bisa menyalin file ini untuk dicadangkan di Google Drive atau flashdisk.
- **Lewat Tampilan Web**: Di Panel Admin ➔ Tab **"Kelola Database"**, klik tombol **"Download Backup (.json)"** untuk mengunduh, atau **"Upload File Backup"** untuk memulihkan data.
