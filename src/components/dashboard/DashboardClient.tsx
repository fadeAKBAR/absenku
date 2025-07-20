"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getStudents, getCategories, getRatings, getUsers } from '@/lib/data';
import type { Student, Category, Rating, User } from '@/lib/types';
import { Header } from '@/components/common/Header';
import { RatingInput } from '@/components/dashboard/RatingInput';
import { Recap } from '@/components/dashboard/Recap';
import { StudentManager } from '@/components/dashboard/StudentManager';
import { CategoryManager } from '@/components/dashboard/CategoryManager';
import { UserManager } from '@/components/dashboard/UserManager';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function DashboardClient() {
  const [students, setStudents] = useState<Student[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Simple auth check for prototype
    try {
      const userLoggedIn = localStorage.getItem('user_authenticated');
      if (userLoggedIn) {
        setIsAuthenticated(true);
      } else {
        router.replace('/');
        toast({
          title: "Akses Ditolak",
          description: "Silakan login untuk mengakses dasbor.",
          variant: "destructive"
        });
      }
    } catch(e) {
       setIsAuthenticated(false);
       router.replace('/');
    }
  }, [router, toast]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsData, categoriesData, ratingsData, usersData] = await Promise.all([
        getStudents(),
        getCategories(),
        getRatings(),
        getUsers()
      ]);
      setStudents(studentsData);
      setCategories(categoriesData);
      setRatings(ratingsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast({ title: "Error", description: "Gagal memuat data dari server.", variant: "destructive"});
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [fetchData, isAuthenticated]);
  
  const [isStudentManagerOpen, setStudentManagerOpen] = useState(false);
  const [isCategoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [isUserManagerOpen, setUserManagerOpen] = useState(false);

  const handleDataUpdate = async () => {
    await fetchData();
  };

  if (!isAuthenticated) {
    // Show a blank screen or a simple loader while redirecting
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <p>Mengarahkan ke halaman login...</p>
        </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen">
         <Header
            onManageStudents={() => setStudentManagerOpen(true)}
            onManageCategories={() => setCategoryManagerOpen(true)}
            onManageUsers={() => setUserManagerOpen(true)}
          />
        <div className="p-8">
          <Skeleton className="h-16 w-full mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="h-96 w-full" />
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        onManageStudents={() => setStudentManagerOpen(true)}
        onManageCategories={() => setCategoryManagerOpen(true)}
        onManageUsers={() => setUserManagerOpen(true)}
      />

      <main className="flex-1 p-4 md:p-8 container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-start">
          <div className="lg:col-span-1 xl:col-span-1">
            <RatingInput
              students={students}
              categories={categories}
              onRatingSaved={handleDataUpdate}
            />
          </div>
          <div className="lg:col-span-2 xl:col-span-3">
            <Recap
              students={students}
              categories={categories}
              ratings={ratings}
            />
          </div>
        </div>
      </main>

      <StudentManager
        isOpen={isStudentManagerOpen}
        onOpenChange={setStudentManagerOpen}
        students={students}
        onUpdate={handleDataUpdate}
      />
      <CategoryManager
        isOpen={isCategoryManagerOpen}
        onOpenChange={setCategoryManagerOpen}
        categories={categories}
        onUpdate={handleDataUpdate}
      />
      <UserManager
        isOpen={isUserManagerOpen}
        onOpenChange={setUserManagerOpen}
        users={users}
        onUpdate={handleDataUpdate}
      />
    </div>
  );
}
