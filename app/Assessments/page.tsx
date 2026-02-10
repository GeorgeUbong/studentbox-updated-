'use client';

import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/app/lib/dexie/db';
import { useUser } from '@/context/UserContext';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';
import TestCard from '@/app/components/TestCard';

export default function AssessmentsPage() {
  const { user, login } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  const assessmentsData = useLiveQuery(async () => {
    if (!user?.grade_id) return [];

    // 1. Get all subjects for this grade
    const subjects = await db.subjects.where('grade_id').equals(user.grade_id).toArray();
    const subjectIds = subjects.map(s => s.id);

    // 2. Get all topics for these subjects
    const topics = await db.topics.where('subject_id').anyOf(subjectIds).toArray();
    const topicIds = topics.map(t => t.id);

    // 3. Get all lessons for these topics
    const lessons = await db.lessons.where('topic_id').anyOf(topicIds).toArray();
    const lessonIds = lessons.map(l => l.id);

    // 4. Find assessments linked to these lessons
    // v2 schema uses 'lesson_id' as an index
    const assessments = await db.assessments
      .where('lesson_id')
      .anyOf(lessonIds)
      .toArray();

    // 5. Enrich for display
    return await Promise.all(
      assessments.map(async (asmt) => {
        const lesson = lessons.find(l => l.id === asmt.lesson_id);
        const topic = topics.find(t => t.id === lesson?.topic_id);
        const subject = subjects.find(s => s.id === topic?.subject_id);

        return {
          ...asmt,
          lessonTitle: lesson?.title || 'Lesson',
          topicTitle: topic?.title || 'Topic',
          subjectTitle: subject?.title || 'Subject'
        };
      })
    );
  }, [user?.grade_id]);

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
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <div className={`transition-all duration-300 ${isOpen ? 'ml-0' : 'sm:ml-64'}`}>
        <Navbar toggleSidebar={toggleSidebar} />

        <main className="max-w-6xl mx-auto p-6 lg:p-12">
          <div className="fixed min-h-screen inset-0 -z-10 bg-[#f8fbff]/60"></div>
          <header className="mb-10">
            <h1 className="text-4xl text-[#1976D2] font-bold leading-tight">
              Your Assessments
            </h1>
            <p className="text-zinc-500 mt-2 text-lg">
              Show what you've learned from your lessons.
            </p>
          </header>

          {assessmentsData === undefined ? (
            /* Pulse Loading */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-white rounded-[2.5rem] animate-pulse" />
              ))}
            </div>
          ) : assessmentsData.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-gray-[#] rounded-[2.5rem] text-center">
              <div className="text-5xl mb-6">🎯</div>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">No Tests Found</h3>
              <p className="text-zinc-500 mt-2 max-w-sm">
                Complete more lessons to unlock your assessments here.
              </p>
            </div>
          ) : (
            /* Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {assessmentsData.map((item) => (
                <TestCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  subject={item.subjectTitle}
                  topic={item.topicTitle}
                  lesson={item.lessonTitle}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}