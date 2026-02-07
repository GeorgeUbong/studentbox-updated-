"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, ChevronRight, Layers } from "lucide-react";

interface TestCardProps {
  id: string;
  title: string;
  subject: string;
  topic: string;
  lesson: string;
}

const TestCard = ({ id, title, subject, topic, lesson }: TestCardProps) => {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/TestView?id=${id}`)}
      className={`
        group relative
        bg-white
        rounded-[2.5rem]
        border border-gray-500
        hover:border-blue-400/60
        hover:shadow-2xl hover:shadow-blue-500/15
        transition-all duration-300
        cursor-pointer
        active:scale-[0.985]
        overflow-hidden
      `}
    >
      {/* Top row – icon + subject pill */}
      <div className="flex items-start justify-between p-7 pb-5">
        {/* Left icon */}
        <div
          className={`
            p-4 rounded-2xl
            bg-gradient-to-br from-blue-50 to-blue-100
            text-blue-600
            shadow-sm
            group-hover:scale-110 group-hover:shadow-md
            transition-all duration-300
          `}
        >
          <ClipboardCheck size={28} strokeWidth={1.8} />
        </div>

        {/* Subject pill */}
        <div
          className={`
            px-4 py-1.5
            bg-zinc-100/90
            rounded-full
            border border-zinc-200/70
            text-[11px] font-semibold uppercase tracking-wider
            text-zinc-600
          `}
        >
          {subject}
        </div>
      </div>

      {/* Title */}
      <h3
        className={`
          px-7 pb-3
          text-2xl font-extrabold
          text-zinc-900
          leading-tight
          group-hover:text-blue-600
          transition-colors duration-300
        `}
      >
        {title}
      </h3>

      {/* Topic • Lesson */}
      <div className="px-7 pb-7">
        <div className="flex items-center gap-2.5 text-zinc-500 text-sm font-medium">
          <Layers size={15} strokeWidth={1.8} className="flex-shrink-0 opacity-80" />
          <p className="line-clamp-1">
            {topic} <span className="opacity-40 mx-1.5">•</span> {lesson}
          </p>
        </div>
      </div>

      {/* Footer CTA */}
      <div
        className={`
          flex items-center justify-between
          px-7 py-5
          border-t border-zinc-100
          bg-zinc-50/70
          group-hover:bg-blue-50/40
          transition-colors duration-300
        `}
      >
        <span className="font-bold text-blue-600 text-base tracking-wide">
          Take Assessment
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
            
          `}
        >
          <ChevronRight size={20} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
};

export default TestCard;