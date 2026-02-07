import { db } from '@/app/lib/dexie/db';
import { createClient } from '@/app/lib/client';
import { useUser } from '@/context/UserContext';

export function useSyncEngine() {
  const { setSyncStatus } = useUser();
  const supabase = createClient();

  const downloadAllContent = async (gradeId: string) => {
    setSyncStatus('downloading');
    try {
      // 1. Fetch & Store Subjects
      const { data: subjects } = await supabase.from('subjects').select('*').eq('grade_id', gradeId);
      if (subjects) await db.subjects.bulkPut(subjects);

      // 2. Fetch & Store Topics
      const subIds = subjects?.map(s => s.id) || [];
      const { data: topics } = await supabase.from('topics').select('*').in('subject_id', subIds);
      if (topics) await db.topics.bulkPut(topics);

      // 3. Fetch & Store Lessons
      const topIds = topics?.map(t => t.id) || [];
      const { data: lessons } = await supabase.from('lessons').select('*').in('topic_id', topIds);
      if (lessons) await db.lessons.bulkPut(lessons);

      // 4. Fetch & Store Assessments
      const lesIds = lessons?.map(l => l.id) || [];
      const { data: assessments } = await supabase.from('assessments').select('*').in('lesson_id', lesIds);
      if (assessments) await db.assessments.bulkPut(assessments);

      setSyncStatus('ready');
    } catch (error) {
      console.error("Download failed", error);
      setSyncStatus('error');
    }
  };

  return { downloadAllContent };
}