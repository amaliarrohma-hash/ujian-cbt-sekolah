import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { defaultCBTDatabase } from './src/data/defaultData';
import { CBTDatabase, Exam, Student, AdminUser, Submission, SchoolSettings } from './src/types/cbt';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'cbt_database.json');

// Ensure database file exists
function initDatabase(): CBTDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultCBTDatabase, null, 2), 'utf-8');
    return defaultCBTDatabase;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.exams || !parsed.students) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultCBTDatabase, null, 2), 'utf-8');
      return defaultCBTDatabase;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading database file, recreating default:', err);
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultCBTDatabase, null, 2), 'utf-8');
    return defaultCBTDatabase;
  }
}

function readDB(): CBTDatabase {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return initDatabase();
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.admins || !Array.isArray(parsed.admins) || parsed.admins.length === 0) {
      parsed.admins = defaultCBTDatabase.admins || [
        {
          id: 'adm-001',
          username: 'admin',
          name: 'Administrator Utama',
          password: parsed.settings?.adminPin || '123456',
          role: 'Super Admin'
        }
      ];
    }
    return parsed;
  } catch (err) {
    console.error('Error reading DB:', err);
    return defaultCBTDatabase;
  }
}

function writeDB(data: CBTDatabase) {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Initialize on boot
initDatabase();

// --- API ROUTES ---

// 1. Database Management ("Database yang Mudah")
app.get('/api/database', (_req: Request, res: Response) => {
  const db = readDB();
  res.json({
    success: true,
    data: db,
    stats: {
      totalExams: db.exams.length,
      totalStudents: db.students.length,
      totalSubmissions: db.submissions.length,
      fileSizeKb: (fs.statSync(DB_FILE).size / 1024).toFixed(2),
      lastUpdated: db.lastUpdated
    }
  });
});

app.post('/api/database/restore', (req: Request, res: Response) => {
  try {
    const newDb = req.body;
    if (!newDb || !Array.isArray(newDb.exams) || !Array.isArray(newDb.students)) {
      res.status(400).json({ success: false, message: 'Format database tidak valid' });
      return;
    }
    writeDB(newDb);
    res.json({ success: true, message: 'Database berhasil dipulihkan' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/database/reset', (_req: Request, res: Response) => {
  try {
    writeDB(defaultCBTDatabase);
    res.json({ success: true, message: 'Database berhasil di-reset ke data bawaan', data: defaultCBTDatabase });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Exams (Paket Ujian & Bank Soal)
app.get('/api/exams', (_req: Request, res: Response) => {
  const db = readDB();
  res.json({ success: true, data: db.exams });
});

app.get('/api/exams/:id', (req: Request, res: Response) => {
  const db = readDB();
  const exam = db.exams.find(e => e.id === req.params.id);
  if (!exam) {
    res.status(404).json({ success: false, message: 'Ujian tidak ditemukan' });
    return;
  }
  res.json({ success: true, data: exam });
});

app.get('/api/exams/token/:token', (req: Request, res: Response) => {
  const db = readDB();
  const token = req.params.token.toUpperCase().trim();
  const exam = db.exams.find(e => e.token.toUpperCase() === token && e.isActive);
  if (!exam) {
    res.status(404).json({ success: false, message: 'Token ujian tidak valid atau ujian sedang dinonaktifkan' });
    return;
  }
  res.json({ success: true, data: exam });
});

app.post('/api/exams', (req: Request, res: Response) => {
  const db = readDB();
  const newExam: Exam = {
    ...req.body,
    id: req.body.id || `exam-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  db.exams.unshift(newExam);
  writeDB(db);
  res.status(201).json({ success: true, data: newExam });
});

app.put('/api/exams/:id', (req: Request, res: Response) => {
  const db = readDB();
  const index = db.exams.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ success: false, message: 'Ujian tidak ditemukan' });
    return;
  }
  db.exams[index] = { ...db.exams[index], ...req.body };
  writeDB(db);
  res.json({ success: true, data: db.exams[index] });
});

app.delete('/api/exams/:id', (req: Request, res: Response) => {
  const db = readDB();
  db.exams = db.exams.filter(e => e.id !== req.params.id);
  writeDB(db);
  res.json({ success: true, message: 'Ujian berhasil dihapus' });
});

// 3. Students (Data Siswa)
app.get('/api/students', (_req: Request, res: Response) => {
  const db = readDB();
  res.json({ success: true, data: db.students });
});

app.post('/api/students', (req: Request, res: Response) => {
  const db = readDB();
  const newStudent: Student = {
    ...req.body,
    id: req.body.id || `std-${Date.now()}`,
    password: (req.body.password || req.body.nis || '').trim()
  };
  const existingIndex = db.students.findIndex(
    s => (req.body.id && s.id === req.body.id) || s.nis === newStudent.nis
  );
  if (existingIndex >= 0) {
    db.students[existingIndex] = newStudent;
  } else {
    db.students.push(newStudent);
  }
  writeDB(db);
  res.json({ success: true, data: newStudent });
});

app.post('/api/students/bulk', (req: Request, res: Response) => {
  const db = readDB();
  const list: Student[] = req.body.students || [];
  let added = 0;
  list.forEach(item => {
    if (!item.nis || !item.name) return;
    const exists = db.students.some(s => s.nis === item.nis);
    if (!exists) {
      db.students.push({
        id: item.id || `std-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        nis: item.nis,
        name: item.name,
        classGrade: item.classGrade || '10',
        gender: item.gender || 'L',
        password: (item.password || item.nis).trim()
      });
      added++;
    }
  });
  writeDB(db);
  res.json({ success: true, message: `Berhasil menambahkan ${added} siswa baru`, count: added });
});

app.delete('/api/students/:id', (req: Request, res: Response) => {
  const db = readDB();
  db.students = db.students.filter(s => s.id !== req.params.id);
  writeDB(db);
  res.json({ success: true, message: 'Siswa berhasil dihapus' });
});

// 3b. Admins (Data Admin / Guru / Pengawas)
app.get('/api/admins', (_req: Request, res: Response) => {
  const db = readDB();
  res.json({ success: true, data: db.admins || [] });
});

app.post('/api/admins', (req: Request, res: Response) => {
  const db = readDB();
  if (!db.admins) db.admins = [];
  const newAdmin: AdminUser = {
    id: req.body.id || `adm-${Date.now()}`,
    username: (req.body.username || '').trim(),
    name: (req.body.name || '').trim(),
    password: (req.body.password || '123456').trim(),
    role: req.body.role || 'Guru Mapel'
  };
  const existingIndex = db.admins.findIndex(
    a => (req.body.id && a.id === req.body.id) || a.username.toLowerCase() === newAdmin.username.toLowerCase()
  );
  if (existingIndex >= 0) {
    db.admins[existingIndex] = newAdmin;
  } else {
    db.admins.push(newAdmin);
  }
  writeDB(db);
  res.json({ success: true, data: newAdmin });
});

app.delete('/api/admins/:id', (req: Request, res: Response) => {
  const db = readDB();
  if (!db.admins) db.admins = [];
  if (db.admins.length <= 1) {
    res.status(400).json({ success: false, message: 'Minimal harus ada 1 akun Admin aktif di sistem.' });
    return;
  }
  db.admins = db.admins.filter(a => a.id !== req.params.id);
  writeDB(db);
  res.json({ success: true, message: 'Akun Admin berhasil dihapus' });
});

// 4. Submissions (Lembar Jawaban & Nilai Siswa)
app.get('/api/submissions', (_req: Request, res: Response) => {
  const db = readDB();
  res.json({ success: true, data: db.submissions });
});

app.post('/api/submissions', (req: Request, res: Response) => {
  const db = readDB();
  const payload = req.body;
  const exam = db.exams.find(e => e.id === payload.examId);

  let score = 0;
  let maxScore = 0;

  if (exam) {
    exam.questions.forEach(q => {
      maxScore += q.points;
      if (q.type === 'multiple_choice') {
        const studentAns = payload.answers[q.id];
        if (studentAns && studentAns.toUpperCase() === q.correctAnswer.toUpperCase()) {
          score += q.points;
        }
      }
    });
  } else {
    maxScore = 100;
  }

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  const submission: Submission = {
    id: `sub-${Date.now()}`,
    examId: payload.examId,
    examTitle: payload.examTitle || (exam ? exam.title : 'Ujian Online'),
    subject: payload.subject || (exam ? exam.subject : ''),
    studentId: payload.studentId,
    studentNis: payload.studentNis,
    studentName: payload.studentName,
    studentClass: payload.studentClass,
    answers: payload.answers || {},
    doubtful: payload.doubtful || {},
    tabSwitchViolations: payload.tabSwitchViolations || 0,
    startedAt: payload.startedAt || new Date().toISOString(),
    submittedAt: new Date().toISOString(),
    score,
    maxScore,
    percentage,
    essayGrading: {}
  };

  db.submissions.unshift(submission);
  writeDB(db);
  res.status(201).json({ success: true, data: submission });
});

app.put('/api/submissions/:id/grade', (req: Request, res: Response) => {
  const db = readDB();
  const subIndex = db.submissions.findIndex(s => s.id === req.params.id);
  if (subIndex === -1) {
    res.status(404).json({ success: false, message: 'Data pengumpulan tidak ditemukan' });
    return;
  }

  const sub = db.submissions[subIndex];
  const { essayGrading } = req.body; // { [qId]: { score: number, note: string } }
  const exam = db.exams.find(e => e.id === sub.examId);

  sub.essayGrading = essayGrading;

  // Recalculate total score
  let totalScore = 0;
  let maxScore = 0;

  if (exam) {
    exam.questions.forEach(q => {
      maxScore += q.points;
      if (q.type === 'multiple_choice') {
        const studentAns = sub.answers[q.id];
        if (studentAns && studentAns.toUpperCase() === q.correctAnswer.toUpperCase()) {
          totalScore += q.points;
        }
      } else if (q.type === 'essay') {
        const essayGrade = essayGrading && essayGrading[q.id];
        if (essayGrade && typeof essayGrade.score === 'number') {
          totalScore += essayGrade.score;
        }
      }
    });
  }

  sub.score = totalScore;
  sub.maxScore = maxScore || sub.maxScore;
  sub.percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : sub.percentage;

  db.submissions[subIndex] = sub;
  writeDB(db);
  res.json({ success: true, data: sub });
});

// 5. Settings
app.get('/api/settings', (_req: Request, res: Response) => {
  const db = readDB();
  res.json({ success: true, data: db.settings });
});

app.put('/api/settings', (req: Request, res: Response) => {
  const db = readDB();
  db.settings = { ...db.settings, ...req.body };
  writeDB(db);
  res.json({ success: true, data: db.settings });
});

// --- VITE DEV / PRODUCTION STATIC SERVING ---
async function startServer() {
  const distPath = path.resolve(process.cwd(), 'dist');
  const isProd = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true' || process.env.RAILWAY_ENVIRONMENT !== undefined;

  if (!isProd || !fs.existsSync(path.join(distPath, 'index.html'))) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Ujian CBT berjalan di http://0.0.0.0:${PORT}`);
  });
}

startServer();
