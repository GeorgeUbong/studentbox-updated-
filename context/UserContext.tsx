'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
  user: any | null;
  age: number | null;
  grade: string | null;
  syncStatus: 'idle' | 'downloading' | 'error' | 'ready';
  login: (userData: any) => void;
  updateUser: (updatedData: any) => void; // New function
  setSyncStatus: (status: 'idle' | 'downloading' | 'error' | 'ready') => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [age, setAge] = useState<number | null>(null);
  const [grade, setGrade] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'downloading' | 'error' | 'ready'>('idle');

  const login = (userData: any) => {
    setUser(userData);
    setGrade(userData.grade_id);
    setAge(userData.age); 
    // Persist to local storage so they stay logged in on refresh
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const updateUser = (updatedData: any) => {
    setUser(updatedData);
    setGrade(updatedData.grade_id);
    setAge(updatedData.age);
    localStorage.setItem('user', JSON.stringify(updatedData));
  };

  return (
    <UserContext.Provider value={{ user, age, grade, syncStatus, login, updateUser, setSyncStatus }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};