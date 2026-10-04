import { CBTDatabase, Exam, Student, AdminUser, Submission, SchoolSettings } from '../types/cbt';
import { defaultCBTDatabase } from '../data/defaultData';

const LOCAL_KEY = 'cbt_offline_database';

function getLocalDB(): CBTDatabase {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Local storage error:', e);
  }
  return defaultCBTDatabase;
}

function saveLocalDB(db: CBTDatabase) {
  try {
    db.lastUpdated = new Date().toISOString();
    localStorage.setItem(LOCAL_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Local storage save error:', e);
  }
}

export const cbtApi = {
  async getDatabase(): Promise<{ data: CBTDatabase; stats: any }> {
    try {
      const res = await fetch('/api/database');
      if (res.ok) {
        const json = await res.json();
        saveLocalDB(json.data);
        return json;
      }
    } catch (e) {
      console.warn('API error, using local fallback:', e);
    }
    const local = getLocalDB();
    return {
      data: local,
      stats: {
        totalExams: local.exams.length,
        totalStudents: local.students.length,
        totalSubmissions: local.submissions.length,
        fileSizeKb: '12.4',
        lastUpdated: local.lastUpdated
      }
    };
  },

  async restoreDatabase(data: CBTDatabase): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/database/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        saveLocalDB(data);
        return await res.json();
      }
    } catch (e) {
      console.warn('API restore failed, saving locally:', e);
    }
    saveLocalDB(data);
    return { success: true, message: 'Database lokal berhasil dipulihkan' };
  },

  async resetDatabase(): Promise<CBTDatabase> {
    try {
      const res = await fetch('/api/database/reset', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        saveLocalDB(json.data);
        return json.data;
      }
    } catch (e) {
      console.warn('API reset failed, resetting locally:', e);
    }
    saveLocalDB(defaultCBTDatabase);
    return defaultCBTDatabase;
  },

  async getExams(): Promise<Exam[]> {
    try {
      const res = await fetch('/api/exams');
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.warn('Fallback exams:', e);
    }
    return getLocalDB().exams;
  },

  async getExamByToken(token: string): Promise<Exam> {
    const cleanToken = token.trim().toUpperCase();
    try {
      const res = await fetch(`/api/exams/token/${encodeURIComponent(cleanToken)}`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.warn('Fallback token check:', e);
    }
    const local = getLocalDB();
    const exam = local.exams.find(e => e.token.toUpperCase() === cleanToken && e.isActive);
    if (!exam) {
      throw new Error('Token ujian tidak ditemukan atau ujian tidak aktif');
    }
    return exam;
  },

  async saveExam(exam: Partial<Exam>): Promise<Exam> {
    try {
      if (exam.id) {
        const res = await fetch(`/api/exams/${exam.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(exam)
        });
        if (res.ok) {
          const json = await res.json();
          return json.data;
        }
      } else {
        const res = await fetch('/api/exams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(exam)
        });
        if (res.ok) {
          const json = await res.json();
          return json.data;
        }
      }
    } catch (e) {
      console.warn('Fallback saveExam:', e);
    }
    // Local fallback
    const db = getLocalDB();
    if (exam.id) {
      const idx = db.exams.findIndex(e => e.id === exam.id);
      if (idx >= 0) {
        db.exams[idx] = { ...db.exams[idx], ...exam } as Exam;
        saveLocalDB(db);
        return db.exams[idx];
      }
    }
    const newExam: Exam = {
      ...(exam as Exam),
      id: exam.id || `exam-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    db.exams.unshift(newExam);
    saveLocalDB(db);
    return newExam;
  },

  async deleteExam(id: string): Promise<void> {
    try {
      await fetch(`/api/exams/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Fallback deleteExam:', e);
    }
    const db = getLocalDB();
    db.exams = db.exams.filter(e => e.id !== id);
    saveLocalDB(db);
  },

  async getStudents(): Promise<Student[]> {
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.warn('Fallback students:', e);
    }
    return getLocalDB().students;
  },

  async saveStudent(student: Partial<Student>): Promise<Student> {
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.warn('Fallback saveStudent:', e);
    }
    const db = getLocalDB();
    const newStd: Student = {
      ...(student as Student),
      id: student.id || `std-${Date.now()}`
    };
    const idx = db.students.findIndex(s => s.nis === newStd.nis);
    if (idx >= 0) db.students[idx] = newStd;
    else db.students.push(newStd);
    saveLocalDB(db);
    return newStd;
  },

  async bulkAddStudents(students: Partial<Student>[]): Promise<{ count: number }> {
    try {
      const res = await fetch('/api/students/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students })
      });
      if (res.ok) {
        const json = await res.json();
        return json;
      }
    } catch (e) {
      console.warn('Fallback bulkAddStudents:', e);
    }
    const db = getLocalDB();
    let count = 0;
    students.forEach(st => {
      if (st.nis && st.name) {
        const exists = db.students.some(s => s.nis === st.nis);
        if (!exists) {
          db.students.push({
            id: `std-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            nis: st.nis,
            name: st.name,
            classGrade: st.classGrade || '10',
            gender: st.gender || 'L'
          });
          count++;
        }
      }
    });
    saveLocalDB(db);
    return { count };
  },

  async deleteStudent(id: string): Promise<void> {
    try {
      await fetch(`/api/students/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Fallback deleteStudent:', e);
    }
    const db = getLocalDB();
    db.students = db.students.filter(s => s.id !== id);
    saveLocalDB(db);
  },

  async saveAdmin(admin: Partial<AdminUser>): Promise<AdminUser> {
    try {
      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(admin)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.warn('Fallback saveAdmin:', e);
    }
    const db = getLocalDB();
    if (!db.admins) db.admins = [];
    const newAdm: AdminUser = {
      id: admin.id || `adm-${Date.now()}`,
      username: (admin.username || '').trim(),
      name: (admin.name || '').trim(),
      password: (admin.password || '123456').trim(),
      role: admin.role || 'Guru Mapel'
    };
    const idx = db.admins.findIndex(
      a => (admin.id && a.id === admin.id) || a.username.toLowerCase() === newAdm.username.toLowerCase()
    );
    if (idx >= 0) db.admins[idx] = newAdm;
    else db.admins.push(newAdm);
    saveLocalDB(db);
    return newAdm;
  },

  async deleteAdmin(id: string): Promise<void> {
    try {
      await fetch(`/api/admins/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Fallback deleteAdmin:', e);
    }
    const db = getLocalDB();
    if (db.admins && db.admins.length > 1) {
      db.admins = db.admins.filter(a => a.id !== id);
      saveLocalDB(db);
    }
  },

  async getSubmissions(): Promise<Submission[]> {
    try {
      const res = await fetch('/api/submissions');
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.warn('Fallback submissions:', e);
    }
    return getLocalDB().submissions;
  },

  async submitExam(payload: {
    examId: string;
    examTitle: string;
    subject: string;
    studentId: string;
    studentNis: string;
    studentName: string;
    studentClass: string;
    answers: Record<string, string>;
    doubtful: Record<string, boolean>;
    tabSwitchViolations: number;
    startedAt: string;
  }): Promise<Submission> {
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.warn('Fallback submitExam:', e);
    }

    // Local grading calculation fallback
    const db = getLocalDB();
    const exam = db.exams.find(e => e.id === payload.examId);
    let score = 0;
    let maxScore = 0;
    if (exam) {
      exam.questions.forEach(q => {
        maxScore += q.points;
        if (q.type === 'multiple_choice' && payload.answers[q.id]?.toUpperCase() === q.correctAnswer?.toUpperCase()) {
          score += q.points;
        }
      });
    } else {
      maxScore = 100;
    }

    const sub: Submission = {
      id: `sub-${Date.now()}`,
      examId: payload.examId,
      examTitle: payload.examTitle,
      subject: payload.subject,
      studentId: payload.studentId,
      studentNis: payload.studentNis,
      studentName: payload.studentName,
      studentClass: payload.studentClass,
      answers: payload.answers,
      doubtful: payload.doubtful,
      tabSwitchViolations: payload.tabSwitchViolations,
      startedAt: payload.startedAt,
      submittedAt: new Date().toISOString(),
      score,
      maxScore,
      percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
    };
    db.submissions.unshift(sub);
    saveLocalDB(db);
    return sub;
  },

  async gradeEssay(submissionId: string, essayGrading: Record<string, { score: number; note: string }>): Promise<Submission> {
    try {
      const res = await fetch(`/api/submissions/${submissionId}/grade`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essayGrading })
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.warn('Fallback gradeEssay:', e);
    }

    const db = getLocalDB();
    const idx = db.submissions.findIndex(s => s.id === submissionId);
    if (idx >= 0) {
      const sub = db.submissions[idx];
      sub.essayGrading = essayGrading;
      const exam = db.exams.find(e => e.id === sub.examId);
      let total = 0;
      if (exam) {
        exam.questions.forEach(q => {
          if (q.type === 'multiple_choice' && sub.answers[q.id]?.toUpperCase() === q.correctAnswer?.toUpperCase()) {
            total += q.points;
          } else if (q.type === 'essay') {
            total += essayGrading[q.id]?.score || 0;
          }
        });
        sub.score = total;
        sub.percentage = Math.round((total / sub.maxScore) * 100);
      }
      saveLocalDB(db);
      return sub;
    }
    throw new Error('Pengumpulan tidak ditemukan');
  },

  async getSettings(): Promise<SchoolSettings> {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.warn('Fallback settings:', e);
    }
    return getLocalDB().settings;
  },

  async updateSettings(settings: Partial<SchoolSettings>): Promise<SchoolSettings> {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.warn('Fallback updateSettings:', e);
    }
    const db = getLocalDB();
    db.settings = { ...db.settings, ...settings };
    saveLocalDB(db);
    return db.settings;
  }
};
