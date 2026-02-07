import Dexie, { type Table } from 'dexie';

export interface Subject { 
  id: string; 
  grade_id: string; 
  title: string; 
  subtext: string; 
}

export interface Topic { 
  id: string; 
  subject_id: string; 
  title: string; 
  subtopic: string; 
}

export interface Lesson { 
  id: string; 
  topic_id: string; 
  title: string; 
  content: string; 
  media_url?: string; 
  media_type?: string; // Added to match Supabase schema
}

export interface Assessment { 
  id: string; 
  lesson_id: string; 
  title: string; 
  quiz_data: any; 
}

export class OfflineDB extends Dexie {
  subjects!: Table<Subject>;
  topics!: Table<Topic>;
  lessons!: Table<Lesson>;
  assessments!: Table<Assessment>;

  constructor() {
    super('OfflineLearningDB');
    
    // Version bumped to 2 to include any schema changes
    this.version(2).stores({
      subjects: 'id, grade_id',
      topics: 'id, subject_id',
      lessons: 'id, topic_id',
      assessments: 'id, lesson_id',
    });
  }
}

export const db = new OfflineDB();