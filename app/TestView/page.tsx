'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/app/lib/dexie/db';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';
// Added AlertCircle to imports
import { ChevronLeft, ChevronRight, CheckCircle2, Trophy, AlertCircle } from 'lucide-react';

export default function TestViewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = searchParams.get('id');

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({}); 
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const assessment = useLiveQuery(async () => {
    if (!testId) return null;
    return await db.assessments.get(testId);
  }, [testId]);

  if (!testId) return <div className="p-10 text-center">Invalid Test</div>;

  const questions = assessment?.quiz_data?.questions || [];
  const currentQuestion = questions[currentStep];
  const totalQuestions = questions.length;

  const handleNext = () => {
    if (currentStep < totalQuestions - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsSubmitted(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q: any) => {
      const selectedOptionId = answers[q.id];
      const selectedOption = q.options.find((opt: any) => opt.id === selectedOptionId);
      if (selectedOption?.is_correct) correct++;
    });
    return correct;
  };

  return (
    <div className="min-h-screen ">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <div className={`transition-all duration-300 ${isOpen ? 'ml-0' : 'sm:ml-64'}`}>
        <Navbar toggleSidebar={toggleSidebar} />

        <main className="max-w-4xl mx-auto px-6 py-10">
          {!assessment ? (
            <div className="h-96 w-full rounded-3xl bg-zinc-100 animate-pulse" />
          ) : isSubmitted ? (
            /* Updated Results View with Pass/Fail Logic */
            (() => {
              const score = calculateScore();
              const isPassing = (score / totalQuestions) >= 0.5; // 50% threshold

              return (
                <div className="bg-white p-12 rounded-[2rem] text-center border border-zinc-200 dark:border-zinc-800 shadow-sm animate-in zoom-in-95 duration-500">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                    isPassing 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' 
                      : 'bg-red-50 dark:bg-red-900/20 text-red-600'
                  }`}>
                    {isPassing ? (
                      <Trophy size={40} className="animate-bounce" />
                    ) : (
                      <AlertCircle size={40} />
                    )}
                  </div>

                  <h2 className={`text-3xl font-black mb-2 ${isPassing ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isPassing ? 'Assessment Passed!' : 'Assessment Failed'}
                  </h2>
                  
                  <p className="text-zinc-500 font-bold mb-4">
                    {isPassing ? 'Well done! You have a great understanding of this topic.' : 'Keep practicing! Review the lessons and try again.'}
                  </p>

                  <div className={`text-7xl font-black my-8 ${isPassing ? 'text-emerald-600' : 'text-red-600'}`}>
                    {score}<span className="text-2xl text-zinc-400">/{totalQuestions}</span>
                  </div>

                  <button 
                    onClick={() => router.push('/Assessments')}
                    className={`w-full max-w-xs py-4 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-lg ${
                      isPassing 
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' 
                        : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                    }`}
                  >
                    {isPassing ? 'Continue Learning' : 'Return to List'}
                  </button>
                </div>
              );
            })()
          ) : (
            /* Question Step View */
            <div className="animate-in fade-in duration-500">
              <div className="mb-8">
                <h1 className="text-4xl font-black text-black mb-2">
                  {assessment.title}
                </h1>
                <p className="text-zinc-500 font-bold">
                  {currentStep + 1} of {totalQuestions} Questions
                </p>
              </div>

              <div className="bg-[#1976D2] rounded-[2rem] p-8 md:p-12 shadow-2xl overflow-hidden relative">
                <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-12 leading-tight">
                  {currentQuestion.question_text}
                </h3>

                <div className="grid gap-4 max-w-2xl mx-auto">
                  {currentQuestion.options.map((option: any, index: number) => {
                    const isSelected = answers[currentQuestion.id] === option.id;
                    const letters = ['A', 'B', 'C', 'D'];
                    
                    return (
                      <button
                        key={option.id}
                        onClick={() => setAnswers({ ...answers, [currentQuestion.id]: option.id })}
                        className={`group p-4 text-left rounded-2xl border-2 transition-all flex items-center gap-4 ${
                          isSelected
                            ? 'bg-white text-[#1976D2] border-white'
                            : 'bg-transparent text-white border-white/40 hover:border-white'
                        }`}
                      >
                        <div className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-lg font-bold text-lg border ${
                           isSelected ? 'bg-blue-50 border-blue-100' : 'bg-white/10 border-white/20'
                        }`}>
                          {letters[index]}
                        </div>
                        
                        <span className="text-lg font-bold flex-1">
                          {option.text}
                        </span>

                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'bg-[#1976D2] border-[#1976D2]' : 'bg-transparent border-white/40'
                        }`}>
                          {isSelected && <CheckCircle2 size={14} className="text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center mt-12 max-w-2xl mx-auto">
                  <button
                    disabled={currentStep === 0}
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex items-center gap-2 bg-white text-zinc-900 px-6 py-3 rounded-full font-bold shadow-md hover:bg-zinc-100 disabled:opacity-0 transition-all"
                  >
                    <ChevronLeft size={20} />
                    Previous
                  </button>
                  
                  <button
                    disabled={!answers[currentQuestion.id]}
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-white text-zinc-900 px-8 py-3 rounded-full font-bold shadow-md hover:bg-zinc-100 disabled:opacity-50 transition-all"
                  >
                    {currentStep === totalQuestions - 1 ? 'Finish' : 'Next'}
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              <div className="mt-8 text-center">
                <button 
                  onClick={() => router.back()} 
                  className="text-zinc-400 font-bold hover:text-red-500 transition-colors inline-flex items-center gap-2"
                >
                  <ChevronLeft size={18} />
                  Quit Assessment
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}