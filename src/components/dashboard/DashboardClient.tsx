"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { getStudents, getCategories, getRatings, addStudent, deleteStudent, addCategory, deleteCategory, saveRating } from '@/lib/data';
import type { Student, Category, Rating } from '@/lib/types';
import { Header } from '@/components/common/Header';
import { RatingInput } from '@/components/dashboard/RatingInput';
import { Recap } from '@/components/dashboard/Recap';
import { StudentManager } from '@/components/dashboard/StudentManager';
import { CategoryManager } from '@/components/dashboard/CategoryManager';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardClient() {
  const [students, setStudents] = useState<Student[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  const [isStudentManagerOpen, setStudentManagerOpen] = useState(false);
  const [isCategoryManagerOpen, setCategoryManagerOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsData, categoriesData, ratingsData] = await Promise.all([
        getStudents(),
        getCategories(),
        getRatings()
      ]);
      setStudents(studentsData);
      setCategories(categoriesData);
      setRatings(ratingsData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDataUpdate = async () => {
    // This function is passed to child components to trigger a refetch
    await fetchData();
  };

  if (loading) {
    return (
      <div className="w-full h-screen p-8">
        <Skeleton className="h-16 w-full mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-96 w-full" />
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
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
    </div>
  );
}
