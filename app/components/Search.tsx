'use client';

import React, { useState, useEffect } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { db } from '@/app/lib/dexie/db';
import SubjectCard from '@/app/components/Card';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const searchDexie = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const lowerQuery = query.toLowerCase();

        // 1. Search across all tables simultaneously
        const [subjects, topics, lessons] = await Promise.all([
          db.subjects.filter(s => s.title.toLowerCase().includes(lowerQuery)).toArray(),
          db.topics.filter(t => t.title.toLowerCase().includes(lowerQuery)).toArray(),
          db.lessons.filter(l => l.title.toLowerCase().includes(lowerQuery)).toArray()
        ]);

        // 2. Normalize results for the SubjectCard component
        const formattedSubjects = subjects.map(s => ({
          id: s.id,
          title: s.title,
          subtext: 'Subject',
          type: 'subject',
          href: `/topics?id=${s.id}`
        }));

        const formattedTopics = topics.map(t => ({
          id: t.id,
          title: t.title,
          subtext: 'Topic',
          type: 'topic',
          href: `/Lessons?topicId=${t.id}`
        }));

        const formattedLessons = lessons.map(l => ({
          id: l.id,
          title: l.title,
          subtext: 'Lesson',
          type: 'lesson',
          href: `/LessonView?lessonId=${l.id}&subjectId=${l.topic_id}`
        }));

        // 3. Combine and limit results
        setResults([...formattedSubjects, ...formattedTopics, ...formattedLessons].slice(0, 10));
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce search to prevent lag while typing
    const timeoutId = setTimeout(searchDexie, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="relative w-full max-w-xl">
      {/* Search Input Container */}
      <div className="relative flex items-center ">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search subjects, topics, or lessons..."
          className="w-full mt-4 pl-12 pr-10 py-3 bg-white border-2 
          border-gray-300 rounded-full focus:border-[#1976D2]
           focus:outline-none transition-all font-medium 
           text-zinc-900"
        />
        <Search className="absolute left-4 top-8 text-zinc-400" size={20} />
        
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="absolute right-4 text-zinc-400 hover:text-zinc-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-zinc-100 z-[100] max-h-[70vh] overflow-y-auto p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {isSearching ? (
            <div className="flex items-center justify-center py-10 text-zinc-400 gap-2">
              <Loader2 className="animate-spin" size={20} />
              <span className="font-bold uppercase tracking-widest text-xs">Searching Database...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {results.map((item) => (
                <div key={`${item.type}-${item.id}`} onClick={() => setQuery('')}>
                  <SubjectCard
                    title={item.title}
                    subtext={item.subtext}
                    type={item.type}
                    href={item.href}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-zinc-400 font-bold">No results found for "{query}"</p>
              <p className="text-zinc-400 text-sm">Try a different keyword.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}