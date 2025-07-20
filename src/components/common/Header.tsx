
"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookUser, GanttChartSquare, LogOut, Users, Settings, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSettings } from '@/lib/data';
import { AppSettings } from '@/lib/types';

type HeaderProps = {
  onManageStudents: () => void;
  onManageCategories: () => void;
  onManageUsers: () => void;
  onManageSettings: () => void;
  onManagePositions: () => void;
};

export function Header({ onManageStudents, onManageCategories, onManageUsers, onManageSettings, onManagePositions }: HeaderProps) {
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    async function fetchSchoolName() {
        const appSettings = await getSettings();
        setSettings(appSettings);
    }
    fetchSchoolName();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user_authenticated');
    router.push('/');
  };

  return (
    <header className="bg-card border-b sticky top-0 z-10 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1 rounded-md h-10 w-10 flex items-center justify-center">
                 {settings?.schoolLogoUrl ? (
                    <img src={settings.schoolLogoUrl} alt={settings.schoolName || ''} className="h-full w-full object-contain"/>
                ) : (
                    <span className="text-primary font-bold">
                        {settings?.schoolName.charAt(0)}
                    </span>
                )}
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-primary">{settings?.schoolName || "Sistem Kredit Poin"}</h1>
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
           <Button variant="outline" size="sm" onClick={onManagePositions}>
            <Award className="mr-0 md:mr-2 h-4 w-4" />
             <span className="hidden md:inline">Jabatan</span>
          </Button>
           <Button variant="outline" size="sm" onClick={onManageUsers}>
            <Users className="mr-0 md:mr-2 h-4 w-4" />
             <span className="hidden md:inline">Pengguna</span>
          </Button>
           <Button variant="outline" size="icon" onClick={onManageSettings}>
            <Settings className="h-4 w-4" />
            <span className="sr-only">Pengaturan</span>
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
