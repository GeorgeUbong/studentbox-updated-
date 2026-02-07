'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/app/lib/dexie/db';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';

export default function LessonViewPage() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  const searchParams = useSearchParams();
  const subjectId = searchParams.get('subjectId');
  const lessonId = searchParams.get('lessonId');

  // --- FIX 1: Fetch the Lesson data from Dexie ---
  const lesson = useLiveQuery(async () => {
    if (!lessonId) return null;
    return await db.lessons.get(lessonId);
  }, [lessonId]);

  // --- FIX 2: Sync with the Home Screen History (Last 6 subjects) ---
  useEffect(() => {
  if (!subjectId || subjectId.trim() === '') {
    console.log('[LessonView] No valid subjectId in URL → skipping save');
    return;
  }

  console.log('[LessonView] Attempting to save subjectId:', subjectId);

  try {
    // 1. Get current history (or start with empty array)
    let history: string[] = [];
    const saved = localStorage.getItem('recentSubjects');

    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        history = parsed;
        console.log('[LessonView] Loaded existing history:', history);
      } else {
        console.warn('[LessonView] Invalid history format in localStorage → starting fresh');
      }
    } else {
      console.log('[LessonView] No previous history found → starting new');
    }

    // 2. Remove duplicate if exists (move to front)
    history = [subjectId, ...history.filter(id => id !== subjectId)];

    // 3. Limit to last 6 entries
    const limitedHistory = history.slice(0, 6);

    // 4. Save back to localStorage
    localStorage.setItem('recentSubjects', JSON.stringify(limitedHistory));

    console.log('[LessonView] Successfully saved history:', limitedHistory);
    console.log('[LessonView] Current recent subjects count:', limitedHistory.length);
  } catch (error) {
    console.error('[LessonView] Failed to save recent subject:', error);
  }
}, [subjectId]);


  return (
    <div className="min-h-screen bg-white">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <div className={`transition-all duration-300 ${isOpen ? 'ml-0' : 'sm:ml-64'}`}>
        <Navbar toggleSidebar={toggleSidebar} />

        <main className="max-w-5xl mx-auto p-6 lg:p-12">
          
          {/* Case: No Lesson ID */}
          {!lessonId && (
            <div className="flex min-h-[50vh] items-center justify-center p-6 text-center">
              <div className="flex flex-col items-center">
                <p className="text-zinc-500 text-lg mb-6 font-bold">No lesson selected.</p>
                <Link
                  href="/Subjects"
                  className="px-8 py-4 bg-[#1976D2] text-white font-black rounded-full hover:bg-blue-700 transition active:scale-95 shadow-lg shadow-blue-500/20"
                >
                  Back to Subjects
                </Link>
              </div>
            </div>
          )}

          {/* Case: Loading State */}
          {lessonId && !lesson && (
            <div className="animate-pulse space-y-6">
              <div className="h-12 w-3/4 bg-zinc-100 rounded-xl" />
              <div className="h-[400px] w-full bg-zinc-50 rounded-[2.5rem]" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-zinc-50 rounded" />
                <div className="h-4 w-5/6 bg-zinc-50 rounded" />
              </div>
            </div>
          )}

          {/* Case: Lesson Data Ready */}
          {lesson && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Breadcrumb */}
              <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-400 font-bold">
                <Link href="/Home" className="hover:text-[#1976D2]">Home</Link>
                <span>/</span>
                <Link href="/Subjects" className="hover:text-[#1976D2]">Subjects</Link>
                <span>/</span>
                <button 
                  onClick={() => window.history.back()} 
                  className="text-[#1976D2] hover:underline"
                >
                  Lessons
                </button>
              </nav>

              {/* Lesson Header */}
              <header className="mb-10">
                <h1 className="text-4xl md:text-5xl font-black text-zinc-900 leading-tight">
                  {lesson.title}
                </h1>
                <div className="flex items-center gap-2 mt-6">
                   <div className="h-1 w-12 bg-[#1976D2] rounded-full" />
                   <h3 className="text-sm font-black uppercase tracking-widest text-[#1976D2]">Lesson Materials</h3>
                </div>
              </header>

              {/* Media Section */}
              {lesson.media_url && (
                <section className="mb-12 rounded-[2.5rem] overflow-hidden bg-black shadow-2xl shadow-blue-900/10 ring-1 ring-zinc-100">
                  {lesson.media_type === 'video' ? (
                    <div className="aspect-video w-full bg-black">
                      <video 
                        src={lesson.media_url} 
                        controls 
                        className="w-full h-full"
                        poster="/video-placeholder.png"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-[600px] flex flex-col bg-white">
                      <div className="bg-zinc-50 px-6 py-3 text-xs font-black flex justify-between items-center border-b border-zinc-100">
                        <span className="text-zinc-500 uppercase tracking-tight">PDF Document</span>
                        <a 
                          href={lesson.media_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#1976D2] hover:underline"
                        >
                          OPEN FULLSCREEN
                        </a>
                      </div>
                      <embed
                        src={`${lesson.media_url}#toolbar=0`}
                        type="application/pdf"
                        width="100%"
                        height="100%"
                      />
                    </div>
                  )}
                </section>
              )}

              {/* Content Section */}
              <div className="flex items-center gap-2 mb-8">
                 <div className="h-1 w-12 bg-[#1976D2] rounded-full" />
                 <h3 className="text-sm font-black uppercase tracking-widest text-[#1976D2]">Lesson Notes</h3>
              </div>

              <article className="prose prose-blue prose-lg md:prose-xl max-w-none 
                                prose-headings:font-black prose-headings:text-zinc-900
                                prose-p:text-zinc-600 prose-p:leading-relaxed
                                prose-img:rounded-[2rem] prose-img:shadow-xl">
                <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
              </article>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}