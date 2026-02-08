'use client';

import { useState, Suspense } from 'react'; // Added Suspense
import { useSearchParams } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/app/lib/dexie/db';
import SubjectCard from '@/app/components/Card';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';

// 1. Move the data-dependent logic to a separate component
function LessonsContent() {
  const searchParams = useSearchParams();
  const topicId = searchParams.get('topicId');

  const data = useLiveQuery(async () => {
    if (!topicId) return null;

    const topic = await db.topics.get(topicId);
    const lessons = await db.lessons
      .where('topic_id')
      .equals(topicId)
      .toArray();

    return { topic, lessons };
  }, [topicId]);

  return (
    <main className="max-w-6xl mx-auto p-6 lg:p-12">
      {/* Case: No Topic Selected */}
      {!topicId && (
        <div className="flex min-h-[50vh] items-center justify-center p-6 text-center">
          <div>
            <p className="text-zinc-500 text-lg mb-6">No topic selected.</p>
            <Link
              href="/Subjects"
              className="inline-block px-8 py-4 bg-[#1976D2] text-white font-medium rounded-xl hover:bg-blue-700 transition shadow-md"
            >
              Back to Subjects
            </Link>
          </div>
        </div>
      )}

      {/* Case: Loading Skeleton */}
      {topicId && !data && (
        <div className="animate-pulse space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-zinc-200 rounded-full" />
            <div className="h-10 w-64 bg-zinc-200 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-zinc-100 rounded-3xl" />
            ))}
          </div>
        </div>
      )}

      {/* Case: Data Ready */}
      {data && (
        <>
          <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-6 flex-wrap">
            <Link href="/Subjects" className="hover:text-[#1976D2] font-medium transition-colors">
              Subjects
            </Link>
            <span>/</span>
            <Link
              href={`/topics?id=${data.topic?.subject_id}`}
              className="hover:text-[#1976D2] font-medium transition-colors"
            >
              {data.topic?.title ?? 'Topic'}
            </Link>
            <span>/</span>
            <span className="font-bold text-[#1976D2]">Lessons</span>
          </nav>

          <header className="mb-10">
            <h1 className="text-4xl font-black text-black">
              {data.topic?.title ?? 'Lessons'}
            </h1>
            <p className="text-zinc-500 mt-3 text-lg">
              Choose a lesson to start learning.
            </p>
          </header>

          {data.lessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-zinc-200 rounded-[2.5rem] text-center">
              <div className="text-5xl mb-6">📚</div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-3">No Lessons Found</h3>
              <p className="text-zinc-500 max-w-md">
                We couldn't find any lessons for this topic offline.
              </p>
              <Link
                href={`/topics?id=${data.topic?.subject_id}`}
                className="mt-8 inline-block px-8 py-4 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition"
              >
                Back to Topics
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.lessons.map((lesson) => (
                <SubjectCard
                  key={lesson.id}
                  title={lesson.title}
                  subtext={lesson.content || 'Start this lesson'}
                  type="lesson"
                  href={`/LessonView?lessonId=${lesson.id}&subjectId=${data.topic?.subject_id}`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}

// 2. Main Page Component
export default function LessonsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div className="min-h-screen">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <div className={`transition-all duration-300 ${isOpen ? 'ml-0' : 'sm:ml-64'}`}>
        <Navbar toggleSidebar={toggleSidebar} />

        {/* 3. Wrap Content in Suspense */}
        <Suspense fallback={<div className="p-12 text-zinc-500">Loading lesson details...</div>}>
          <LessonsContent />
        </Suspense>
      </div>
    </div>
  );
}