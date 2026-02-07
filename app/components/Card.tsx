"use client";

import { BookOpen, PlayCircle, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface SubjectCardProps {
  title: string;
  subtext: string;
  href: string;
  type?: 'subject' | 'topic' | 'lesson';
}

export default function SubjectCard({ title, subtext, href, type = 'subject' }: SubjectCardProps) {
  // Choose icon based on type
  const Icon = type === 'lesson' ? PlayCircle : type === 'topic' ? FileText : BookOpen;

  return (
    <Link href={href}>
      <div
        className={`
          group relative
          bg-white
          rounded-[2.5rem]
          border border-zinc-200/80
          hover:border-blue-400/60
          hover:shadow-2xl hover:shadow-blue-500/15
          transition-all duration-300
          cursor-pointer
          active:scale-[0.985]
          overflow-hidden
          h-full flex flex-col
          p-7
        `}
      >
        {/* Top icon */}
        <div className="mb-6">
          <div
            className={`
              inline-flex p-4 rounded-2xl
              bg-gradient-to-br from-blue-50 to-blue-100
              text-blue-600
              shadow-sm
              group-hover:scale-110 group-hover:shadow-md
              transition-all duration-300
            `}
          >
            <Icon size={28} strokeWidth={1.8} />
          </div>
        </div>

        {/* Title */}
        <h3
          className={`
            text-2xl font-extrabold
            text-zinc-900
            leading-tight
            mb-3
            group-hover:text-blue-600
            transition-colors duration-300
          `}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          className={`
            text-base text-zinc-600
            leading-relaxed
            mb-8 flex-grow
            line-clamp-3
          `}
        >
          {subtext}
        </p>

        {/* CTA */}
        <div
          className={`
            flex items-center justify-between
            pt-5
            border-t border-zinc-100
            bg-zinc-50/70
            group-hover:bg-blue-50/40
            transition-colors duration-300
          `}
        >
          <span className="font-bold text-blue-600 text-base tracking-wide">
            {type === 'lesson' ? 'View Lesson' : 'Start Learning'}
          </span>

          <div
            className={`
              w-10 h-10 rounded-full
              bg-blue-100
              text-blue-600
              flex items-center justify-center
              group-hover:bg-blue-600 group-hover:text-white
              group-hover:scale-110
              transition-all duration-300
              shadow-sm group-hover:shadow-md
            `}
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </Link>
  );
}