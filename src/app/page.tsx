
"use client";

import { useState, useEffect } from 'react';
import { LoginPage } from '@/components/auth/LoginPage';
import DashboardClient from '@/components/dashboard/DashboardClient';
import StudentDashboardClient from '@/components/student/StudentDashboardClient';
import { Loader2 } from 'lucide-react';

type UserRole = 'teacher' | 'student' | null;

export default function Home() {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = () => {
    setLoading(true);
    try {
      const userString = localStorage.getItem('user_authenticated');
      if (userString) {
        const user = JSON.parse(userString);
        setUserRole(user.role);
      } else {
        setUserRole(null);
      }
    } catch (e) {
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    // Listen for storage changes to handle login/logout from other tabs
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Memuat Aplikasi...</p>
      </main>
    );
  }

  if (userRole === 'teacher') {
    return <DashboardClient onLogout={checkAuth} />;
  }

  if (userRole === 'student') {
    return <StudentDashboardClient onLogout={checkAuth} />;
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 bg-background">
      <LoginPage onLoginSuccess={checkAuth} />
    </main>
  );
}
