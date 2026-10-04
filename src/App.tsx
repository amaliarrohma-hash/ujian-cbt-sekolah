import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { UnifiedLoginScreen } from './components/auth/UnifiedLoginScreen';
import { StudentLogin } from './components/student/StudentLogin';
import { ExamConfirm } from './components/student/ExamConfirm';
import { ExamRoom } from './components/student/ExamRoom';
import { ExamResult } from './components/student/ExamResult';
import { AdminPortal } from './components/admin/AdminPortal';
import { cbtApi } from './services/api';
import { CBTDatabase, Exam, Student, AdminUser, Submission, SchoolSettings } from './types/cbt';
import { defaultCBTDatabase } from './data/defaultData';
import { Loader2, LogOut, AlertTriangle } from 'lucide-react';

export default function App() {
  const [db, setDb] = useState<CBTDatabase>(defaultCBTDatabase);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(true);

  // Authenticated User State: MUST LOGIN FIRST!
  const [currentUser, setCurrentUser] = useState<
    | { role: 'student'; student: Student }
    | { role: 'admin'; username: string }
    | null
  >(null);

  // Student exam flow state
  const [examStage, setExamStage] = useState<'login' | 'confirm' | 'in_exam' | 'result'>('login');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [activeStudent, setActiveStudent] = useState<{ nis: string; name: string; classGrade: string } | null>(null);
  const [latestSubmission, setLatestSubmission] = useState<Submission | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Load database on start
  const refreshDatabase = async () => {
    try {
      const res = await cbtApi.getDatabase();
      if (res && res.data) {
        setDb(res.data);
        setDbConnected(true);
      }
    } catch (err) {
      console.error('Error fetching database:', err);
      setDbConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDatabase();
  }, []);

  // Admin Actions
  const handleSaveExam = async (exam: Partial<Exam>): Promise<Exam> => {
    const saved = await cbtApi.saveExam(exam);
    await refreshDatabase();
    return saved;
  };

  const handleDeleteExam = async (id: string) => {
    await cbtApi.deleteExam(id);
    await refreshDatabase();
  };

  const handleSaveStudent = async (student: Partial<Student>): Promise<Student> => {
    const saved = await cbtApi.saveStudent(student);
    await refreshDatabase();
    return saved;
  };

  const handleBulkAddStudents = async (students: Partial<Student>[]): Promise<{ count: number }> => {
    const res = await cbtApi.bulkAddStudents(students);
    await refreshDatabase();
    return res;
  };

  const handleDeleteStudent = async (id: string) => {
    await cbtApi.deleteStudent(id);
    await refreshDatabase();
  };

  const handleSaveAdmin = async (admin: Partial<AdminUser>): Promise<AdminUser> => {
    const saved = await cbtApi.saveAdmin(admin);
    await refreshDatabase();
    return saved;
  };

  const handleDeleteAdmin = async (id: string) => {
    await cbtApi.deleteAdmin(id);
    await refreshDatabase();
  };

  const handleGradeEssay = async (subId: string, essayGrading: Record<string, { score: number; note: string }>) => {
    await cbtApi.gradeEssay(subId, essayGrading);
    await refreshDatabase();
  };

  const handleRestoreDatabase = async (newDb: CBTDatabase) => {
    await cbtApi.restoreDatabase(newDb);
    await refreshDatabase();
  };

  const handleResetDatabase = async () => {
    await cbtApi.resetDatabase();
    await refreshDatabase();
  };

  const handleUpdateSettings = async (settings: Partial<SchoolSettings>) => {
    await cbtApi.updateSettings(settings);
    await refreshDatabase();
  };

  // Student Flow Handlers
  const handleStartExamConfirm = (exam: Exam, student: { nis: string; name: string; classGrade: string }) => {
    setSelectedExam(exam);
    setActiveStudent(student);
    setExamStage('confirm');
  };

  const handleProceedToExam = () => {
    setExamStage('in_exam');
  };

  const handleSubmitExamAnswers = async (
    answers: Record<string, string>,
    doubtful: Record<string, boolean>,
    tabSwitchViolations: number,
    startedAt: string
  ): Promise<Submission> => {
    if (!selectedExam || !activeStudent) {
      throw new Error('Data ujian tidak valid');
    }

    const submission = await cbtApi.submitExam({
      examId: selectedExam.id,
      examTitle: selectedExam.title,
      subject: selectedExam.subject,
      studentId: `std-${activeStudent.nis}`,
      studentNis: activeStudent.nis,
      studentName: activeStudent.name,
      studentClass: activeStudent.classGrade,
      answers,
      doubtful,
      tabSwitchViolations,
      startedAt
    });

    setLatestSubmission(submission);
    setExamStage('login');
    await refreshDatabase();
    return submission;
  };

  const handleGoHome = () => {
    setExamStage('login');
    setSelectedExam(null);
    setActiveStudent(null);
  };

  const handleViewResult = (exam: Exam, submission: Submission) => {
    setSelectedExam(exam);
    setLatestSubmission(submission);
    setExamStage('result');
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const executeLogout = () => {
    setShowLogoutConfirm(false);
    setCurrentUser(null);
    setExamStage('login');
    setSelectedExam(null);
    setActiveStudent(null);
    setLatestSubmission(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
          <h2 className="text-base font-bold text-slate-800">Menghubungkan ke Database CBT...</h2>
          <p className="text-xs text-slate-500">Memuat sistem dan bank soal sekolah</p>
        </div>
      </div>
    );
  }

  // 1. Mandatory Initial Gate: If not logged in, show Login Screen!
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
        <Navbar
          currentUser={null}
          onLogout={handleLogout}
          settings={db.settings}
          dbConnected={dbConnected}
        />
        <main className="flex-1">
          <UnifiedLoginScreen
            settings={db.settings}
            students={db.students}
            admins={db.admins || []}
            onStudentLogin={st => {
              setCurrentUser({ role: 'student', student: st });
              setExamStage('login');
            }}
            onAdminLogin={adminName => {
              setCurrentUser({ role: 'admin', username: adminName || 'admin' });
            }}
          />
        </main>
        <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
          {db.settings.schoolName} — CBT Online Siswa & Pengawas
        </footer>
      </div>
    );
  }

  // 2. Student Experience (In Exam Mode: Fullscreen Proctoring)
  if (currentUser.role === 'student' && examStage === 'in_exam' && selectedExam && activeStudent) {
    return (
      <ExamRoom
        exam={selectedExam}
        student={activeStudent}
        onSubmitExam={handleSubmitExamAnswers}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        settings={db.settings}
        dbConnected={dbConnected}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {currentUser.role === 'student' ? (
          <>
            {examStage === 'login' && (
              <StudentLogin
                exams={db.exams}
                students={db.students}
                submissions={db.submissions}
                loggedStudent={currentUser.student}
                recentSubmission={latestSubmission}
                onClearRecentSubmission={() => setLatestSubmission(null)}
                onStartExamConfirm={handleStartExamConfirm}
                onViewResult={handleViewResult}
                onBackToRoleSelect={handleLogout}
              />
            )}

            {examStage === 'confirm' && selectedExam && activeStudent && (
              <ExamConfirm
                exam={selectedExam}
                student={activeStudent}
                onCancel={handleGoHome}
                onProceed={handleProceedToExam}
              />
            )}

            {examStage === 'result' && selectedExam && latestSubmission && (
              <ExamResult
                exam={selectedExam}
                submission={latestSubmission}
                onGoHome={handleGoHome}
              />
            )}
          </>
        ) : (
          <AdminPortal
            db={db}
            onSaveExam={handleSaveExam}
            onDeleteExam={handleDeleteExam}
            onSaveStudent={handleSaveStudent}
            onBulkAddStudents={handleBulkAddStudents}
            onDeleteStudent={handleDeleteStudent}
            onSaveAdmin={handleSaveAdmin}
            onDeleteAdmin={handleDeleteAdmin}
            onGradeEssay={handleGradeEssay}
            onRestoreDatabase={handleRestoreDatabase}
            onResetDatabase={handleResetDatabase}
            onUpdateSettings={handleUpdateSettings}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">
            {db.settings.schoolName} — Platform Ujian Online CBT
          </p>
          <p className="text-[11px] text-slate-400">
            Sistem Autentikasi Pengawas & Siswa • Fitur Pembuatan Soal Lengkap • Database Persisten
          </p>
        </div>
      </footer>

      {/* Modal Konfirmasi Logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Konfirmasi Logout</h3>
                <p className="text-xs text-slate-500">Apakah Anda benar-benar ingin keluar?</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
              {currentUser?.role === 'student' ? (
                <>
                  Anda sedang masuk sebagai siswa <strong>{currentUser.student.name}</strong> ({currentUser.student.nis}). Yakin ingin keluar dari akun?
                </>
              ) : (
                <>
                  Anda sedang masuk di <strong>Panel Guru / Pengawas</strong>. Pastikan semua perubahan soal atau nilai sudah disimpan sebelum keluar.
                </>
              )}
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeLogout}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-500/20 transition flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Ya, Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
