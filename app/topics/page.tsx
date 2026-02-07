'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/app/lib/dexie/db';
import SubjectCard from '@/app/components/Card';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';

export default function TopicsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  const searchParams = useSearchParams();
  const subjectId = searchParams.get('id');

  const data = useLiveQuery(async () => {
    if (!subjectId) return null;

    const subject = await db.subjects.get(subjectId);
    const topics = await db.topics
      .where('subject_id')
      .equals(subjectId)
      .toArray();

    return { subject, topics };
  }, [subjectId]);

  return (
    <div className="min-h-screen">
      {/* 1. Sidebar */}
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* 2. Main Layout Wrapper */}
      <div className={`transition-all duration-300 ${isOpen ? 'ml-0' : 'sm:ml-64'}`}>
        
        {/* 3. Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* 4. Page Content */}
        <main className="max-w-6xl mx-auto p-6 lg:p-12">
          
          {/* Handle No ID Case */}
          {!subjectId && (
            <div className="p-20 text-center">
              <p className="text-zinc-500">No subject selected.</p>
              <Link href="/Subjects" className="text-blue-600 underline">
                Go back
              </Link>
            </div>
          )}

          {/* Loading State */}
          {subjectId && !data && (
            <div className="animate-pulse space-y-6">
              <div className="h-6 w-48 bg-zinc-200 rounded-lg" />
              <div className="h-10 w-64 bg-zinc-200 rounded-lg" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 bg-zinc-200 rounded-3xl" />
                ))}
              </div>
            </div>
          )}

          {/* Data Loaded State */}
          {data && (
            <>
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-black mb-6">
                <Link href="/Subjects" className="hover:text-blue-600 font-medium transition-colors">
                  Subjects
                </Link>
                <span>/</span>
                <span className="font-bold text-[#1976D2]">
                  {data.subject?.title}
                </span>
              </nav>

              <h1 className="text-4xl font-black mb-8 text-zinc-900 dark:text-white">Topics</h1>

              {data.topics.length === 0 ? (
                <div className="p-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                  <p className="text-zinc-400">No topics found offline.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.topics.map((topic) => (
                    <SubjectCard
                      key={topic.id}
                      title={topic.title}
                      subtext="View Lessons"
                      type="topic"
                      href={`/Lessons?topicId=${topic.id}`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}