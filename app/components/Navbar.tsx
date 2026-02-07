'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Menu, WifiOff } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  toggleSidebar?: () => void;
}

const Navbar = ({ toggleSidebar }: NavbarProps) => {
  const { user } = useUser();
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);

  // Sync online status
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Display "No Grade" only if the context is truly empty
  const displayGrade = user?.grade_name || "No Grade Set";

  return (
    <nav className="sticky top-0 z-30 w-full bg-white backdrop-blur-md px-4 md:px-8 py-3 flex items-center justify-between transition-all sm:pl-72 border-b border-gray-100">
      
      {/* Left Side: Mobile Menu */}
      <div className="flex items-center gap-3">
        {toggleSidebar && (
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl sm:hidden transition-colors"
            aria-label="Toggle Menu"
          >
            <Menu size={24} />
          </button>
        )}
      </div>

      {/* Right Side: Status + Grade + Notifications */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Connection Status Indicator */}
        {isOnline ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 shadow-[0_0_12px_-3px_rgba(16,185,129,0.4)]">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
              Sync Lessons
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-100">
            <WifiOff size={12} className="text-red-500" />
            <span className="text-[10px] font-black uppercase tracking-wider text-red-600">
              Offline
            </span>
          </div>
        )}

        {/* Grade Badge - ALWAYS VISIBLE */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F0F7FF] border border-[#D0E5FF]">
          <span className="font-bold text-[11px] sm:text-xs whitespace-nowrap text-[#1976D2]">
            {displayGrade}
          </span>
        </div>

        {/* Notifications Button */}
        <button
          onClick={() => router.push('/Notifications')}
          className="relative p-2 bg-[#1976D2] text-white rounded-full hover:bg-[#1565C0] active:scale-95 shadow-md"
        >
          <Bell size={18} fill="currentColor" />
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 border-2 border-white rounded-full" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;