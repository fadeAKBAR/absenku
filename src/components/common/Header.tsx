"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { BookUser, GanttChartSquare, LogOut, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

type HeaderProps = {
  onManageStudents: () => void;
  onManageCategories: () => void;
  onManageUsers: () => void;
};

export function Header({ onManageStudents, onManageCategories, onManageUsers }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('user_authenticated');
    router.push('/');
  };

  return (
    <header className="bg-card border-b sticky top-0 z-10 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6 text-primary-foreground"
                    >
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                </svg>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-primary">Sistem Kredit Poin Siswa</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onManageStudents}>
            <BookUser className="mr-0 md:mr-2 h-4 w-4" />
            <span className="hidden md:inline">Siswa</span>
          </Button>
          <Button variant="outline" size="sm" onClick={onManageCategories}>
            <GanttChartSquare className="mr-0 md:mr-2 h-4 w-4" />
             <span className="hidden md:inline">Kategori</span>
          </Button>
           <Button variant="outline" size="sm" onClick={onManageUsers}>
            <Users className="mr-0 md:mr-2 h-4 w-4" />
             <span className="hidden md:inline">Pengguna</span>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
             <LogOut className="mr-0 md:mr-2 h-4 w-4" />
             <span className="hidden md:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
