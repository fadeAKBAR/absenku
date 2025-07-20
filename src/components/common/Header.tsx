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
                  viewBox="0 0 100 110"
                  className="w-8 h-8 text-primary-foreground"
                >
                  <path
                    fill="hsl(var(--primary))"
                    stroke="black"
                    strokeWidth="1"
                    d="M 50 0 L 95 15 L 100 50 L 95 85 L 50 110 L 5 85 L 0 50 L 5 15 Z"
                  />
                  <text
                    x="50"
                    y="25"
                    fontFamily="Arial, sans-serif"
                    fontSize="12"
                    fill="red"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    SMKN 3
                  </text>
                  <text
                    x="50"
                    y="40"
                    fontFamily="Arial, sans-serif"
                    fontSize="12"
                    fill="red"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    SOPPENG
                  </text>
                  <circle cx="50" cy="65" r="20" fill="grey" />
                  <path
                    d="M 35 65 A 15 15 0 0 1 65 65"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                  />
                  <path
                    d="M 50 45 L 50 85"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                  />
                  <path
                    d="M 30 65 L 70 65"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                  />
                  <path
                    d="M 35 50 L 65 80"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                  />
                  <path
                    d="M 35 80 L 65 50"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                  />
                  <path
                    d="M 55 55 L 50 62 L 45 55"
                    stroke="red"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M 20 90 C 30 80, 70 80, 80 90"
                    stroke="grey"
                    fill="none"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                   <path
                    d="M 25 95 C 35 85, 65 85, 75 95"
                    stroke="grey"
                    fill="none"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 30 105 L 70 105 L 75 100 L 25 100 Z"
                    fill="yellow"
                    stroke="black"
                    strokeWidth="1"
                  />
                   <path
                    d="M 35 100 h 30 M 35 102 h 30"
                    stroke="black"
                    strokeWidth="0.5"
                    strokeDasharray="2 2"
                  />
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
