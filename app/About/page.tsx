'use client';

import { useState } from 'react';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';

export default function AboutPage() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div className="min-h-screen ">
      {/* 1. Sidebar Component */}
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* 2. Layout Wrapper */}
      <div className={`transition-all duration-300 ${isOpen ? 'ml-0' : 'sm:ml-64'}`}>
        
        {/* 3. Global Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* 4. Main Content */}
        <main className="max-w-4xl mx-auto p-6 lg:p-12">
          <div className="fixed min-h-screen inset-0 -z-10 bg-[#f8fbff]/60"></div>
          
          {/* Header */}
          <header className="mb-10">
            <h1 className="text-4xl font-black ">
              About
            </h1>
            <div className="mt-4 h-1 w- bg-[#1976D2] rounded-full" />
          </header>

          {/* Core Content */}
          <div className="space-y-8">
            <section className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-black leading-relaxed font-medium">
                Bridge Box is an offline-first learning application designed to support students in Nigeria, 
                especially those in rural areas and communities with limited or no internet access. 
                The app provides access to digital lessons, videos, quizzes, and learning materials 
                without the need for constant data or network coverage.
              </p>

              <p className="text-black leading-relaxed font-medium">
                By storing educational content directly on the device and syncing only when internet 
                is available, Bridge Box helps students continue learning even in areas where 
                connectivity is poor, unreliable, or expensive. This makes it ideal for use in 
                public schools, rural communities, IDP camps, and low-income learning environments 
                across Nigeria.
              </p>

              <p className="text-black leading-relaxed font-medium">
                Bridge Box helps bridge the digital divide by making quality education more 
                accessible, supporting self-paced learning, and enabling students and teachers 
                to benefit from digital education regardless of internet challenges.
              </p>
            </section>
          </div>

          
        </main>
      </div>
    </div>
  );
}