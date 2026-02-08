'use client';

import { useState, useEffect, Suspense } from 'react'; // Added Suspense
import { useSearchParams } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/app/lib/dexie/db';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';

// 1. Move logic into a sub-component to handle searchParams safely
function LessonContent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  // FIX: Modals should be false by default
  const [downloadModal, setDownloadModal] = useState(false); 
  const [error, setError] = useState(false);
  
  const toggleSidebar = () => setIsOpen(!isOpen);

  const searchParams = useSearchParams();
  const subjectId = searchParams.get('subjectId');
  const lessonId = searchParams.get('lessonId');

  const lesson = useLiveQuery(async () => {
    if (!lessonId) return null;
    return await db.lessons.get(lessonId);
  }, [lessonId]);

  useEffect(() => {
    if (!subjectId || subjectId.trim() === '') return;

    try {
      let history: string[] = [];
      const saved = localStorage.getItem('recentSubjects');

      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) history = parsed;
      }

      history = [subjectId, ...history.filter(id => id !== subjectId)];
      localStorage.setItem('recentSubjects', JSON.stringify(history.slice(0, 6)));
    } catch (err) {
      console.error('[LessonView] History save failed:', err);
    }
  }, [subjectId]);

  const handleDownloadOffline = async () => {
    if (!lesson || !lesson.media_url) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(lesson.media_url);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();

      await db.lessons.update(lesson.id, {
        offline_file: blob,
        is_offline: true
      });

      setDownloadModal(true); // Trigger success modal
    } catch (err) {
      console.error('Download failed:', err);
      setError(true); // Trigger error modal
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <div className={`transition-all duration-300 ${isOpen ? 'ml-0' : 'sm:ml-64'}`}>
        <Navbar toggleSidebar={toggleSidebar} />

        <main className="max-w-5xl mx-auto p-6 lg:p-12">
          {!lessonId && (
            <div className="flex min-h-[50vh] items-center justify-center p-6 text-center">
              <div className="flex flex-col items-center">
                <p className="text-zinc-500 text-lg mb-6 font-bold">No lesson selected.</p>
                <Link href="/Subjects" className="px-8 py-4 bg-[#1976D2] text-white font-black rounded-full shadow-lg shadow-blue-500/20">
                  Back to Subjects
                </Link>
              </div>
            </div>
          )}

          {lessonId && !lesson && (
            <div className="animate-pulse space-y-6">
              <div className="h-12 w-3/4 bg-zinc-100 rounded-xl" />
              <div className="h-[400px] w-full bg-zinc-50 rounded-[2.5rem]" />
            </div>
          )}

          {lesson && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-400 font-bold">
                <Link href="/Home" className="hover:text-[#1976D2]">Home</Link>
                <span>/</span>
                <Link href="/Subjects" className="hover:text-[#1976D2]">Subjects</Link>
                <span>/</span>
                <button onClick={() => window.history.back()} className="text-[#1976D2] hover:underline">
                  Lessons
                </button>
              </nav>

              <header className="mb-10">
                <h1 className="text-4xl md:text-5xl font-black text-zinc-900 leading-tight">
                  {lesson.title}
                </h1>
                <div className="flex items-center gap-2 mt-6">
                   <div className="h-1 w-12 bg-[#1976D2] rounded-full" />
                   <h3 className="text-sm font-black uppercase tracking-widest text-[#1976D2]">Lesson Materials</h3>
                </div>
              </header>

              {lesson.media_url && (
                <section className="mb-12 rounded-[2.5rem] overflow-hidden bg-black shadow-2xl shadow-blue-900/10 ring-1 ring-zinc-100">
                  <div className="bg-zinc-50 px-6 py-3 flex justify-between items-center border-b border-zinc-100">
                    <span className="text-zinc-500 text-xs font-black uppercase tracking-tight">
                      {lesson.media_type === 'video' ? 'Video Lesson' : 'PDF Document'}
                    </span>
                    <button 
                      onClick={handleDownloadOffline}
                      disabled={isDownloading || lesson.is_offline}
                      className={`text-xs font-black px-4 py-2 rounded-full transition-all ${
                        lesson.is_offline ? 'bg-green-100 text-green-600' : 'bg-[#1976D2] text-white hover:bg-blue-700'
                      }`}
                    >
                      {isDownloading ? 'DOWNLOADING...' : lesson.is_offline ? 'AVAILABLE OFFLINE' : 'DOWNLOAD FOR OFFLINE'}
                    </button>
                  </div>

                  {lesson.media_type === 'video' ? (
                    <div className="aspect-video w-full bg-black">
                      <video 
                        src={lesson.offline_file ? URL.createObjectURL(lesson.offline_file) : lesson.media_url} 
                        controls 
                        className="w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-[600px] bg-white">
                      <embed
                        src={lesson.offline_file ? URL.createObjectURL(lesson.offline_file) : `${lesson.media_url}#toolbar=0`}
                        type="application/pdf"
                        width="100%"
                        height="100%"
                      />
                    </div>
                  )}
                </section>
              )}

              <div className="flex items-center gap-2 mb-8">
                 <div className="h-1 w-12 bg-[#1976D2] rounded-full" />
                 <h3 className="text-sm font-black uppercase tracking-widest text-[#1976D2]">Lesson Notes</h3>
              </div>

              <article className="prose prose-blue prose-lg md:prose-xl max-w-none prose-headings:font-black prose-p:text-zinc-600">
                <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
              </article>
            </div>
          )}
        </main>
      </div>

      {/* FIXED MODALS: Added Backdrop and better styling */}
      {(downloadModal || error) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center scale-up-center">
            {downloadModal ? (
              <>
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-xl font-black text-zinc-900 mb-2">Success!</h3>
                <p className="text-zinc-500 mb-6 font-medium">This lesson is now available offline.</p>
                <button onClick={() => setDownloadModal(false)} className="w-full bg-zinc-900 text-white font-black py-3 rounded-xl hover:bg-zinc-800 transition">
                  Awesome
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                </div>
                <h3 className="text-xl font-black text-zinc-900 mb-2">Download Failed</h3>
                <p className="text-zinc-500 mb-6 font-medium">Please check your internet connection.</p>
                <button onClick={() => setError(false)} className="w-full bg-red-500 text-white font-black py-3 rounded-xl hover:bg-red-600 transition">
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// 2. Main Page with Suspense Wrapper
export default function LessonViewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black text-zinc-400">LOADING LESSON...</div>}>
      <LessonContent />
    </Suspense>
  );
}