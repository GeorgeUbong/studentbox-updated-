'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/app/lib/client';
import { useUser } from '@/context/UserContext';
import { useSyncEngine } from '@/hooks/useSyncEngine';
import { useRouter } from 'next/navigation';
import { ChevronDown, Download } from 'lucide-react';

export default function Home() {
  const [grades, setGrades] = useState<any[]>([]);
  const [formData, setFormData] = useState({ name: '', age: '', gradeId: '' });
  const [loading, setLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0); // For progress tracking
  const [synced, setSynced] = useState(false);
  
  const supabase = createClient();
  const { login } = useUser();
  const { downloadAllContent } = useSyncEngine();
  const router = useRouter();

  useEffect(() => {
    const fetchGrades = async () => {
      const { data } = await supabase
        .from('grades')
        .select('*')
        .order('order_index', { ascending: true });
      if (data) setGrades(data);
    };
    fetchGrades();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedGrade = grades.find(g => g.id === formData.gradeId);
      const gradeName = selectedGrade ? selectedGrade.name : 'Grade Set';

      login({ 
        full_name: formData.name, 
        age: Number(formData.age), 
        grade_id: formData.gradeId,
        grade_name: gradeName 
      });

      // Simulation of progress or actual hook listener
      // If downloadAllContent supports a callback, use that to update downloadProgress
      await downloadAllContent(formData.gradeId);
      
      router.push('/Home');
    } catch (error) {
      console.error("Setup failed:", error);
      setLoading(false);
    }
  };

  return (
    <div 
      className="flex min-h-screen items-center justify-center  p-6 relative overflow-hidden"
      style={{ 
        backgroundImage: `url('/pattern.png')`,
        backgroundRepeat: 'repeat',
        backgroundSize: '400px'
      }}
    >
      {/* Downloading Modal Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/95 z-[9999] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="relative">
            <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center text-[#1976D2] animate-bounce">
              <Download size={48} />
            </div>
          </div>
          
          <h2 className="text-2xl font-black mt-8 text-zinc-900">Downloading Content</h2>
          <p className="text-zinc-500 mt-2 text-center max-w-xs font-bold">
            We're preparing your lessons for offline access. This won't take long.
          </p>
          
          <div className="w-full max-w-xs bg-zinc-200 h-1.5 rounded-full mt-8 overflow-hidden">
            <div 
              className="h-full bg-[#1976D2] transition-all duration-500 ease-out" 
              style={{ width: `${downloadProgress || 45}%` }} // Default to 45 if no real-time progress
            />
          </div>
          <span className="mt-4 text-[#1976D2] font-black text-sm">{downloadProgress || 45}%</span>
        </div>
      )}

      <div className="w-full max-w-lg flex flex-col items-center">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-zinc-900 mb-4">
            Welcome To <span className="text-[#1976D2]">BridgeBox</span>
          </h1>
          <p className="text-zinc-600 text-sm font-bold leading-relaxed max-w-xs mx-auto">
            Designed for environments where internet is unreliable or unavailable. 
            Deploy on a Raspberry Pi and serve education to your community.
          </p>
        </div>
        
        {/* Form Section */}
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="relative">
            <input
              required
              type="text"
              placeholder="Enter your name"
              className="w-full p-4 bg-white border-2 border-blue-200 rounded-xl text-[#1976D2] 
              placeholder:text-blue-300 font-bold outline-none focus:border-[#1976D2] transition-colors"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="relative">
            <input
              required
              type="number"
              placeholder="Enter your Age"
              className="w-full p-4 border-2 bg-white border-blue-200 rounded-xl text-[#1976D2] placeholder:text-blue-300 font-bold outline-none focus:border-[#1976D2] transition-colors"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            />
          </div>

          <div className="relative">
            <select
              required
              className="w-full p-4 border-2 border-blue-200 rounded-xl text-[#1976D2] font-bold outline-none focus:border-[#1976D2] transition-colors appearance-none cursor-pointer bg-white"
              value={formData.gradeId}
              onChange={(e) => setFormData({ ...formData, gradeId: e.target.value })}
            >
              <option value="" className="text-blue-300">Select Grade</option>
              {grades.map((g) => (
                <option key={g.id} value={g.id} className="text-zinc-900">{g.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#1976D2]">
              <ChevronDown size={24} />
            </div>
          </div>

          <div className="pt-4 flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-4 bg-[#1976D2] text-white rounded-full font-black text-2xl shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 shadow-blue-500/30"
            >
              Start Learning
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}