"use client";

import { BookOpen, FileText, ArrowRight, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/dexie/db';

interface SubjectCardProps {
  title: string;
  subtext: string;
  href: string;
  type?: 'subject' | 'topic' | 'lesson';
}

export default function SubjectCard({ title, subtext, href, type = 'subject' }: SubjectCardProps) {
  
  // 1. DYNAMIC COUNT LOGIC
  const stats = useLiveQuery(async () => {
    // Parse the ID from the href string (works for ?id= or ?topicId=)
    const urlParams = new URLSearchParams(href.split('?')[1]);
    const targetId = urlParams.get('id') || urlParams.get('topicId');

    if (!targetId) return null;

    if (type === 'subject') {
      // For Subjects: Count child topics and total lessons
      const tCount = await db.topics.where('subject_id').equals(targetId).count();
      const lCount = await db.lessons.where('subject_id').equals(targetId).count();
      return { primary: tCount, secondary: lCount, primaryLabel: 'Topics', secondaryLabel: 'Lessons' };
    } 
    
    if (type === 'topic') {
      // For Topics: Count lessons within this specific topic
      const lCount = await db.lessons.where('topic_id').equals(targetId).count();
      return { primary: lCount, secondary: null, primaryLabel: 'Lessons', secondaryLabel: '' };
    }

    return null; // Lessons don't need sub-counts
  }, [href, type]);

  // 2. ICON LOGIC
  const Icon = type === 'lesson' ? FileText : type === 'topic' ? LayoutGrid : BookOpen;

  return (
    <Link href={href} className="block h-full">
      <div className="group relative bg-white rounded-[2.5rem] border border-zinc-200/80 hover:border-blue-400/60 hover:shadow-2xl hover:shadow-blue-500/15 transition-all duration-300 cursor-pointer active:scale-[0.985] overflow-hidden h-full flex flex-col p-7">
        
        {/* Top Section: Icon and Stats Badge */}
        <div className="flex justify-between items-start mb-6">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
            <Icon size={28} strokeWidth={1.8} />
          </div>

          {stats && (
            <div className="flex flex-row bg-blue-100 p-3 rounded-full items-baseline gap-1.5">
  <span className="text-[10px] font-black uppercase tracking-widest text-[#1976D2] leading-none">
    {stats.primaryLabel}
  </span>
  <span className="font-black text-[#1976D2] leading-none">
    {stats.primary}
  </span>
</div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-grow">
          <h3 className="text-2xl font-extrabold text-zinc-900 leading-tight mb-3 group-hover:text-blue-600 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-base text-zinc-500 leading-relaxed font-medium line-clamp-3">
            {subtext}
          </p>
        </div>

        {/* Footer Section */}
        <div className="mt-8 pt-5 border-t border-zinc-50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-bold text-blue-600 text-sm tracking-wide">
              {type === 'subject' && 'Explore Topics'}
              {type === 'topic' && 'View Lessons'}
              {type === 'lesson' && 'Start Learning'}
            </span>
            
          </div>

          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm group-hover:shadow-md">
            <ArrowRight size={20} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </Link>
  );
}