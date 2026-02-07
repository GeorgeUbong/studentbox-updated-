'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { createClient } from '@/app/lib/client';
import { db } from '@/app/lib/dexie/db';
import Navbar from '@/app/components/Navbar';
import Sidebar from '@/app/components/Sidebar';
import { Download, RefreshCw, WifiOff, CheckCircle2 } from 'lucide-react';

export default function NotificationsPage() {
  const { user, updateUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const handleSync = async () => {
    if (!user?.grade_id || !isOnline) return;
    setIsUpdating(true);
    setDownloadProgress(5); // Start progress

    try {
      // 1. Fetch Grade Name (ensures navbar and context stay accurate)
      const { data: gradeData } = await supabase
        .from('grades')
        .select('name')
        .eq('id', user.grade_id)
        .single();
      
      // 2. Clear & Re-download
      await Promise.all([
        db.subjects.clear(),
        db.topics.clear(),
        db.lessons.clear(),
        db.assessments.clear()
      ]);
      
      setDownloadProgress(20);

      // 3. Sequential Sync
      const { data: subjects } = await supabase.from('subjects').select('*').eq('grade_id', user.grade_id);
      if (subjects && subjects.length > 0) {
        await db.subjects.bulkPut(subjects);
        setDownloadProgress(50);

        const subjectIds = subjects.map(s => s.id);
        const { data: topics } = await supabase.from('topics').select('*').in('subject_id', subjectIds);
        
        if (topics && topics.length > 0) {
          await db.topics.bulkPut(topics);
          setDownloadProgress(80);

          const topicIds = topics.map(t => t.id);
          const { data: lessons } = await supabase.from('lessons').select('*').in('topic_id', topicIds);
          
          if (lessons && lessons.length > 0) {
            await db.lessons.bulkPut(lessons);
          }
        }
      }
      
      // Update global context
      updateUser({ ...user, grade_name: gradeData?.name || user.grade_name });
      setDownloadProgress(100);
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setTimeout(() => {
        setIsUpdating(false);
        setDownloadProgress(0);
      }, 800);
    }
  };

  return (
    <div className="min-h-screen ">
      <Sidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
      <div className={`transition-all duration-300 ${isOpen ? 'ml-0' : 'sm:ml-64'}`}>
        <Navbar toggleSidebar={() => setIsOpen(!isOpen)} />

        <main className="max-w-2xl mx-auto p-6 lg:p-12">
          <header className="mb-10 flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-black ">Updates</h1>
              <p className="text-zinc-500 mt-1">Check for new content and sync your device.</p>
            </div>
          </header>

          <div className="space-y-4">
            {isOnline ? (
              <div className="bg-white border border-gray-500
               p-6 rounded-[2rem] flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50  text-blue-600 rounded-2xl flex items-center justify-center">
                    <RefreshCw size={24} className={isUpdating ? 'animate-spin' : ''} />
                  </div>
                  <div>
                    <h3 className="font-bold text-black text-xl">Refresh Lessons</h3>
                    <p className="text-xs text-zinc-500">Update curriculum for {user?.grade_name}</p>
                  </div>
                </div>
                <button 
                  onClick={handleSync}
                  className="bg-blue-500 text-white px-6 py-2.5 rounded-xl 
                  font-bold text-sm hover:bg-blue-600 transition-all
                  active:scale-95 shadow-lg shadow-blue-500/20"
                >
                  Sync Now
                </button>
              </div>
            ) : (
              <div className="bg-zinc-100 dark:bg-zinc-900/50 border border-dashed border-zinc-300 dark:border-zinc-800 p-10 rounded-[2rem] text-center">
                <WifiOff className="mx-auto mb-4 text-zinc-400" size={40} />
                <h3 className="font-bold text-zinc-400 uppercase tracking-widest text-xs">Offline Mode</h3>
                <p className="text-sm text-zinc-500 mt-2">Connect to the internet to fetch latest data.</p>
              </div>
            )}

            {/* Success State Hint */}
            {!isUpdating && isOnline && (
              <div className="flex items-center justify-center gap-2 text-zinc-400 py-10">
                <CheckCircle2 size={16} />
                <span className="text-sm font-medium">Device is ready for offline use</span>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Syncing Modal (Overlay) */}
      {isUpdating && (
  <div className="fixed inset-0 bg-white/95 dark:bg-zinc-950/95 z-[9999] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
    <div className="relative">
      {/* Changed bg-emerald to bg-blue and text-emerald to text-blue */}
      <div className="w-24 h-24 bg-blue-50 dark:bg-blue-500/10 rounded-[2.5rem] flex items-center justify-center text-[#1976D2] animate-bounce">
        <Download size={48} />
      </div>
    </div>
    
    <h2 className="text-2xl font-black mt-8 text-zinc-900 dark:text-white">Redownloading Content</h2>
    <p className="text-zinc-500 mt-2 text-center max-w-xs">
      We're preparing your lessons for offline access. This won't take long.
    </p>
    
    <div className="w-full max-w-xs bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full mt-8 overflow-hidden">
      <div 
       
        className="h-full bg-[#1976D2] transition-all duration-500 ease-out" 
        style={{ width: `${downloadProgress}%` }} 
      />
    </div>
    
    {/* Changed text-emerald-600 to text-blue-600 */}
    <span className="mt-4 text-[#1976D2] font-bold text-sm">{downloadProgress}%</span>
  </div>
)}
    </div>
  );
}