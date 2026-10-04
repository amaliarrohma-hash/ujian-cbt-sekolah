import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  BookOpen, 
  Users, 
  ShieldCheck,
  FileCheck2, 
  Database, 
  Settings, 
  LogOut
} from 'lucide-react';
import { CBTDatabase, Exam, Student, AdminUser, Submission, SchoolSettings, Question } from '../../types/cbt';
import { AdminDashboard } from './AdminDashboard';
import { ExamManager } from './ExamManager';
import { QuestionCreator } from './QuestionCreator';
import { StudentManager } from './StudentManager';
import { AdminUserManager } from './AdminUserManager';
import { SubmissionList } from './SubmissionList';
import { DatabaseManager } from './DatabaseManager';
import { SettingsModal } from './SettingsModal';

interface AdminPortalProps {
  db: CBTDatabase;
  onSaveExam: (exam: Partial<Exam>) => Promise<Exam>;
  onDeleteExam: (id: string) => Promise<void>;
  onSaveStudent: (student: Partial<Student>) => Promise<Student>;
  onBulkAddStudents: (students: Partial<Student>[]) => Promise<{ count: number }>;
  onDeleteStudent: (id: string) => Promise<void>;
  onSaveAdmin: (admin: Partial<AdminUser>) => Promise<AdminUser>;
  onDeleteAdmin: (id: string) => Promise<void>;
  onGradeEssay: (subId: string, essayGrading: Record<string, { score: number; note: string }>) => Promise<void>;
  onRestoreDatabase: (data: CBTDatabase) => Promise<void>;
  onResetDatabase: () => Promise<void>;
  onUpdateSettings: (settings: Partial<SchoolSettings>) => Promise<void>;
  onLogout: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  db,
  onSaveExam,
  onDeleteExam,
  onSaveStudent,
  onBulkAddStudents,
  onDeleteStudent,
  onSaveAdmin,
  onDeleteAdmin,
  onGradeEssay,
  onRestoreDatabase,
  onResetDatabase,
  onUpdateSettings,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create-question' | 'exams' | 'students' | 'admins' | 'submissions' | 'database'>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Question Creation handler
  const handleSaveQuestionToExam = async (examId: string, question: Question) => {
    const exam = db.exams.find(e => e.id === examId);
    if (!exam) throw new Error('Ujian tidak ditemukan');

    const updatedQuestions = [...exam.questions, question];
    await onSaveExam({
      ...exam,
      questions: updatedQuestions
    });
  };

  const handleBulkAddQuestionsToExam = async (examId: string, newQuestions: Question[]) => {
    const exam = db.exams.find(e => e.id === examId);
    if (!exam) throw new Error('Ujian tidak ditemukan');

    const updatedQuestions = [...exam.questions, ...newQuestions];
    await onSaveExam({
      ...exam,
      questions: updatedQuestions
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Tab Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Ringkasan</span>
          </button>

          {/* Prominent Buat Soal Tab */}
          <button
            onClick={() => setActiveTab('create-question')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition ${
              activeTab === 'create-question'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buat Soal Ujian</span>
          </button>

          <button
            onClick={() => setActiveTab('exams')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'exams'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Bank Soal & Ujian ({db.exams.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'students'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Data Siswa ({db.students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('admins')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'admins'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Data Admin / Guru ({(db.admins || []).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'submissions'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Rekap Nilai ({db.submissions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'database'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Kelola Database</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-xs font-bold transition"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Pengaturan</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-bold transition"
            title="Keluar dari Panel Admin"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'dashboard' && (
        <AdminDashboard
          db={db}
          onNavigateTab={tab => setActiveTab(tab as any)}
          onCreateNewExam={() => setActiveTab('create-question')}
        />
      )}

      {activeTab === 'create-question' && (
        <QuestionCreator
          exams={db.exams}
          onSaveQuestionToExam={handleSaveQuestionToExam}
          onBulkAddQuestionsToExam={handleBulkAddQuestionsToExam}
          onNavigateToExams={() => setActiveTab('exams')}
        />
      )}

      {activeTab === 'exams' && (
        <ExamManager
          exams={db.exams}
          onSaveExam={onSaveExam}
          onDeleteExam={onDeleteExam}
        />
      )}

      {activeTab === 'students' && (
        <StudentManager
          students={db.students}
          onSaveStudent={onSaveStudent}
          onBulkAddStudents={onBulkAddStudents}
          onDeleteStudent={onDeleteStudent}
        />
      )}

      {activeTab === 'admins' && (
        <AdminUserManager
          admins={db.admins || []}
          onSaveAdmin={onSaveAdmin}
          onDeleteAdmin={onDeleteAdmin}
        />
      )}

      {activeTab === 'submissions' && (
        <SubmissionList
          submissions={db.submissions}
          exams={db.exams}
          onGradeEssay={onGradeEssay}
        />
      )}

      {activeTab === 'database' && (
        <DatabaseManager
          db={db}
          onRestore={onRestoreDatabase}
          onReset={onResetDatabase}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={db.settings}
          onSave={onUpdateSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
};
