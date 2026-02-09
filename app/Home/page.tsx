'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/app/lib/dexie/db';
import SubjectCard from '@/app/components/Card';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';
import { useUser } from '@/context/UserContext';
import Link from 'next/link';
import SearchBar from '../components/Search';

export default function HomePage() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  const recentSubjects = useLiveQuery(
    async () => {
      const saved = localStorage.getItem('recentSubjects');
      if (!saved) return [];

      try {
        const ids: string[] = JSON.parse(saved);
        if (!Array.isArray(ids) || ids.length === 0) return [];

        const subjects = await db.subjects
          .where('id')
          .anyOf(ids)
          .toArray();

        return ids
          .map((id) => subjects.find((s) => s.id === id))
          .filter((s): s is NonNullable<typeof s> => !!s);
      } catch (err) {
        return [];
      }
    },
    [],
    []
  );

  return (
    // FIX: Added overflow-x-hidden here to prevent side-scrolling
    <div className="min-h-screen  overflow-x-hidden">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <div className={`transition-all duration-300 ${isOpen ? 'ml-0' : 'sm:ml-64'}`}>
        <Navbar toggleSidebar={toggleSidebar} />

        {/* FIX: Ensure max-width doesn't cause overflow on small screens */}
        <main className="max-w-6xl mx-auto p-6 lg:p-12 space-y-12 w-full">
          
          {/* Hero Section */}
          <section className="relative">
            <div className="relative z-10">
              <h1 className="text-4xl lg:text-5xl font-black mb-4 tracking-tight text-zinc-900">
                Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}!
              </h1>
              <p className="text-zinc-600 text-lg lg:text-xl max-w-md font-medium">
                Your lessons are ready — dive in and keep learning offline.
              </p>
              <SearchBar />
            </div>
           
           
          </section>

          

          {/* Recent Subjects Section */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
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
                      window.location.reload();
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