'use client';

import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/app/lib/dexie/db';
import { useUser } from '@/context/UserContext';
import SubjectCard from '@/app/components/Card';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';
import SearchBar from '@/app/components/Search';

export default function SubjectsPage() {
  const { user, login } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  /**
   * Reactive query: 
   * Fetches subjects based on the grade_id stored in your UserContext.
   */
  const subjects = useLiveQuery(async () => {
    if (!user?.grade_id) return [];
    
    return await db.subjects
      .where('grade_id')
      .equals(user.grade_id)
      .toArray();
  }, [user?.grade_id]);

  /**
   * PERSISTENCE LOGIC:
   * Saves the selected subject ID to localStorage for the Home Page.
   */
  const handleSubjectClick = (id: string) => {
    localStorage.setItem('lastReadSubject', id);
  };

   //check if prev user
   //check if formerly registered
    useEffect (() => {
      //check if they exist
      const savedUser = localStorage.getItem('user');
  
      if(savedUser){
        const parsedUser = JSON.parse(savedUser);
        if(parsedUser && !user){
          login(parsedUser)
        } 
      }
    }, []);
  return (
    <div className="min-h-screen ">
      {/* Sidebar */}
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* Main Layout Wrapper */}
      <div className={`transition-all duration-300 ${isOpen ? 'ml-0' : 'sm:ml-64'}`}>
        
        {/* Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Page Content */}
        <main className="max-w-6xl mx-auto p-6 lg:p-12">
          <div className="fixed min-h-screen inset-0 -z-10 bg-[#f8fbff]/60"></div>
          <header className="mb-10">
            <h1 className="text-4xl font-black text-black">
              Your Subjects
            </h1>
            <p className="text-zinc-500 mt-2 text-lg">
              Pick a subject to start exploring your topics and lessons.
            </p>

            <SearchBar />
          </header>

          {!subjects ? (
            /* Loading State */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-zinc-200 rounded-3xl" />
              ))}
            </div>
          ) : subjects.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] text-center">
              <div className="text-4xl mb-4">📂</div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">No Subjects Found</h3>
              <p className="text-zinc-500 mt-2 max-w-xs">
                We couldn't find any content for your current grade offline.
              </p>
            </div>
          ) : (
            /* Grid State */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {subjects.map((subject) => (
                <div 
                  key={subject.id} 
                  onClick={() => handleSubjectClick(subject.id)}
                >
                  <SubjectCard 
                    title={subject.title}
                    subtext={subject.subtext || "View Topics"}
                    type="subject"
                    /** * RESTORED ROUTING: 
                     * Using 'id' instead of 'subjectId' as per your original request.
                     */
                    href={`/topics?id=${subject.id}`}
                  />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}