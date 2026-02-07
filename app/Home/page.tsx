'use client';

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/app/lib/dexie/db';
import SubjectCard from '@/app/components/Card';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';
import { useUser } from '@/context/UserContext';
import Link from 'next/link';

export default function HomePage() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [recentSubjectIds, setRecentSubjectIds] = useState<string[]>([]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  // 1. Load from localStorage - ensure key is 'recentSubjects'
 const recentSubjects = useLiveQuery(
  async () => {
    // 1. Read the correct key (array of IDs)
    const saved = localStorage.getItem('recentSubjects');
    if (!saved) {
      console.log('No recentSubjects in localStorage');
      return [];
    }

    let ids: string[] = [];
    try {
      ids = JSON.parse(saved);
      if (!Array.isArray(ids)) {
        console.warn('recentSubjects is not an array → clearing');
        localStorage.removeItem('recentSubjects');
        return [];
      }
      console.log('Loaded recent subject IDs:', ids);
    } catch (err) {
      console.error('Failed to parse recentSubjects:', err);
      return [];
    }

    if (ids.length === 0) return [];

    // 2. Fetch matching subjects from Dexie
    const subjects = await db.subjects
      .where('id')
      .anyOf(ids)
      .toArray();

    // 3. Preserve the order from localStorage
    const ordered = ids
      .map((id) => subjects.find((s) => s.id === id))
      .filter((s): s is NonNullable<typeof s> => !!s);

    console.log('Found recent subjects:', ordered.map(s => s.title));

    return ordered;
  },
  [], // ← empty deps = only run once + when Dexie data changes
  []  // default return value while loading (prevents undefined)
);
  return (
    <div className="min-h-screen ">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <div className={`transition-all duration-300 ${isOpen ? 'ml-0' : 'sm:ml-64'}`}>
        <Navbar toggleSidebar={toggleSidebar} />

        <main className="max-w-6xl mx-auto p-6 lg:p-12 space-y-12">
          {/* Hero Section */}
          
            <div className="relative z-10">
              <h1 className="text-4xl lg:text-5xl font-black mb-4 tracking-tight">
                Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}!
              </h1>
              <p className="text-black text-lg lg:text-xl max-w-md font-medium">
                Your lessons are ready — dive in and keep learning offline.
              </p>
            </div>
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
         

          {/* Recent Subjects Section */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Logic: If we have even 1 subject, show the grid */}
            {recentSubjects && recentSubjects.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-[#1976D2] rounded-full" />
                    <h2 className="text-2xl font-black text-black uppercase tracking-tight">
                      Continue Learning
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem('recentSubjects');
                      setRecentSubjectIds([]);
                    }}
                    className="text-xs font-black text-zinc-400 hover:text-red-500 transition-colors uppercase tracking-widest"
                  >
                    Clear History
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {recentSubjects.map((subj) => (
                    <SubjectCard
                      key={subj.id}
                      title={subj.title}
                      subtext="Pick up where you left off"
                      type="subject"
                      href={`/topics?id=${subj.id}`}
                    />
                  ))}
                </div>
              </>
            ) : (
              /* Empty State if 0 subjects found */
              <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-zinc-100 rounded-[2.5rem]">
                <p className="text-zinc-400 font-bold text-lg">No recent lessons yet.</p>
                <Link href="/Subjects" className="text-[#1976D2] font-black hover:underline mt-2">
                  Explore subjects to start your journey!
                </Link>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}