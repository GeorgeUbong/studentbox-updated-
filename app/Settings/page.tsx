'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { db } from '@/app/lib/dexie/db';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';
import { Download, AlertCircle, Save, RotateCcw } from 'lucide-react';
import { createClient } from '@/app/lib/client';

export default function SettingsPage() {
  const { user, updateUser, setSyncStatus } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [ageError, setAgeError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [grades, setGrades] = useState<any[]>([]);

  const supabase = createClient();

  // Form state prefilled from user context
  const [formData, setFormData] = useState({
    name: user?.full_name || '',
    age: user?.age?.toString() || '',
    grade_id: user?.grade_id || '',
  });

  const toggleSidebar = () => setIsOpen(!isOpen);

  // 1. Fetch Dynamic Grades from Supabase
  useEffect(() => {
    async function fetchGrades() {
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .order('order_index', { ascending: true });

      if (!error && data) {
        setGrades(data);
      }
    }
    fetchGrades();
  }, [supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'age') {
      if (value !== '' && !/^\d+$/.test(value)) {
        setAgeError('Please enter a valid number');
        return;
      }
      setAgeError('');
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSaveError('');
  };

  const resetForm = () => {
    setFormData({
      name: user?.full_name || '',
      age: user?.age?.toString() || '',
      grade_id: user?.grade_id || '',
    });
    setAgeError('');
    setSaveError('');
  };

  // 2. The Internal Sync Logic
  const syncNewGradeData = async (gradeId: string) => {
    try {
      // Step A: Subjects
      setDownloadProgress(10);
      const { data: subjects } = await supabase.from('subjects').select('*').eq('grade_id', gradeId);
      if (!subjects || subjects.length === 0) return;
      await db.subjects.bulkPut(subjects);

      // Step B: Topics
      setDownloadProgress(30);
      const subjectIds = subjects.map(s => s.id);
      const { data: topics } = await supabase.from('topics').select('*').in('subject_id', subjectIds);
      if (topics && topics.length > 0) {
        await db.topics.bulkPut(topics);
        
        // Step C: Lessons
        setDownloadProgress(60);
        const topicIds = topics.map(t => t.id);
        const { data: lessons } = await supabase.from('lessons').select('*').in('topic_id', topicIds);
        if (lessons && lessons.length > 0) {
          await db.lessons.bulkPut(lessons);
          
          // Step D: Assessments
          setDownloadProgress(90);
          const lessonIds = lessons.map(l => l.id);
          const { data: assessments } = await supabase.from('assessments').select('*').in('lesson_id', lessonIds);
          if (assessments) await db.assessments.bulkPut(assessments);
        }
      }
      setDownloadProgress(100);
    } catch (err) {
      throw new Error("Failed to download curriculum data");
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (!formData.name.trim() || !formData.age || !formData.grade_id) {
      setSaveError('Please fill in all fields correctly.');
      return;
    }

    setIsUpdating(true);
    setSaveError('');
    
    try {
      const isGradeChanged = formData.grade_id !== user.grade_id;

      if (isGradeChanged) {
        setSyncStatus('downloading');

        // Wipe old Dexie data
        await Promise.all([
          db.subjects.clear(),
          db.topics.clear(),
          db.lessons.clear(),
          db.assessments.clear(),
        ]);

        // Run the internal sync
        await syncNewGradeData(formData.grade_id);
      }

      // --- NEW: Extract Grade Name for Navbar ---
      const selectedGrade = grades.find(g => g.id === formData.grade_id);
      const gradeName = selectedGrade ? (selectedGrade.name || selectedGrade.grade_name) : 'Grade Set';

      // Update Global Context with name included
      const updatedUser = {
        ...user,
        full_name: formData.name.trim(),
        age: Number(formData.age),
        grade_id: formData.grade_id,
        grade_name: gradeName, // This allows navbar to show the name instantly
      };

      updateUser(updatedUser);
      setSyncStatus('ready');
      alert('Settings saved and content synced!');
    } catch (error: any) {
      setSaveError(error.message || 'Save failed.');
    } finally {
      setIsUpdating(false);
      setDownloadProgress(0);
    }
  };

  const hasChanges =
    formData.name.trim() !== (user?.full_name || '') ||
    formData.age !== (user?.age?.toString() || '') ||
    formData.grade_id !== (user?.grade_id || '');

  return (
    <div className="min-h-screen ">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      <div className={`transition-all duration-300 ${isOpen ? 'ml-0' : 'sm:ml-64'}`}>
        <Navbar toggleSidebar={toggleSidebar} />

        <main className="max-w-2xl mx-auto p-6 md:p-10">
          <h1 className="text-4xl font-black mb-10">Settings</h1>

          <div className="space-y-8 bg-white  p-8 rounded-3xl shadow-sm border-[#568CCE] ">
            {/* Name Input */}
            <div>
              <label className="text-sm font-medium text-[#568CCE] block mb-2">Full Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={isUpdating}
                className="w-full p-4 rounded-2xl border border-blue-200
                bg-white  
                focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Age Input */}
            <div>
              <label className="text-sm font-medium text-[#568CCE] block mb-2">Age</label>
              <input
                name="age"
                inputMode="numeric"
                value={formData.age}
                onChange={handleChange}
                disabled={isUpdating}
                className={`w-full p-4 rounded-2xl border bg-white outline-none 
                  transition-all ${ageError ? 'border-red-500' : 'border-blue-200'}`}
              />
              {ageError && <p className="mt-2 text-red-500 text-xs flex items-center gap-1.5"><AlertCircle size={14} /> {ageError}</p>}
            </div>

            {/* Dynamic Grade Select */}
            <div>
              <label className="block text-lg font-black text-[#568CCE] mb-3">Grade Level</label>
              <div className="relative">
                <select
                  name="grade_id"
                  value={formData.grade_id}
                  onChange={handleChange}
                  disabled={isUpdating}
                  className="w-full p-4 bg-blue-600 text-white font-bold rounded-2xl appearance-none px-6 cursor-pointer outline-none shadow-md"
                >
                  <option value="">Select your grade</option>
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>{g.name || g.grade_name}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white font-bold">▼</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <button
                onClick={handleSave}
                disabled={isUpdating || !hasChanges}
                className={`flex-1 py-4 rounded-3xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${isUpdating || !hasChanges ? 'bg-gray-400 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'}`}
              >
                <Save size={18} />
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={resetForm}
                disabled={isUpdating}
                className="flex-1 py-4 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold rounded-3xl hover:bg-zinc-300 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} />
                Discard
              </button>
            </div>

            {saveError && (
              <p className="text-red-500 text-sm flex items-center justify-center gap-2 mt-4">
                <AlertCircle size={16} /> {saveError}
              </p>
            )}
          </div>
        </main>
      </div>

      {/* Sync Overlay */}
      {isUpdating && (
        <div className="fixed inset-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md z-[9999] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-3xl flex items-center justify-center mb-6 animate-bounce">
            <Download size={48} />
          </div>
          <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-3">
            {downloadProgress > 0 ? `Syncing Data (${downloadProgress}%)` : 'Saving Profile...'}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-sm mb-8">
            Please don't close the app while we update your curriculum content.
          </p>
          {downloadProgress > 0 && (
            <div className="w-full max-w-md h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-500 ease-out" 
                style={{ width: `${downloadProgress}%` }} 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}