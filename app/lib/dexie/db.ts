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
  media_type?: string;
  // --- OFFLINE BLOB FIELDS ---
  offline_file?: Blob;   // Stores the actual video/PDF file
  is_offline?: boolean;  // Helper flag to check status quickly
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
    
    // Version bumped to 3 to handle the addition of offline_file
    this.version(3).stores({
      subjects: 'id, grade_id',
      topics: 'id, subject_id',
      lessons: 'id, topic_id, is_offline', // Added is_offline to the index for faster filtering
      assessments: 'id, lesson_id',
    });
  }
}

export const db = new OfflineDB();