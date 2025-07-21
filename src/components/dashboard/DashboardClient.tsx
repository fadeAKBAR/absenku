
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { getStudents, getCategories, getRatings, getUsers, getAttendance, getSettings, getPositions, getPointRecords } from '@/lib/data';
import type { Student, Category, Rating, User, Attendance, AppSettings, Position, PointRecord } from '@/lib/types';
import { Header } from '@/components/common/Header';
import { RatingInput } from '@/components/dashboard/RatingInput';
import { Recap } from '@/components/dashboard/Recap';
import { StudentManager } from '@/components/dashboard/StudentManager';
import { CategoryManager } from '@/components/dashboard/CategoryManager';
import { UserManager } from '@/components/dashboard/UserManager';
import { SettingsManager } from '@/components/dashboard/SettingsManager';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { AttendanceManager } from './AttendanceManager';
import { MonthlyAttendanceRecap } from './MonthlyAttendanceRecap';
import { CalendarCheck, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SystemInstructions } from './SystemInstructions';
import { PositionManager } from './PositionManager';
import { PointRecorder } from './PointRecorder';

type DashboardClientProps = {
  onLogout: () => void;
}

export default function DashboardClient({ onLogout }: DashboardClientProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [pointRecords, setPointRecords] = useState<PointRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    try {
      const userString = localStorage.getItem('user_authenticated');
      if (userString) {
        const user = JSON.parse(userString);
        if (user.role === 'teacher') {
          setCurrentUser(user);
        } else {
           onLogout();
        }
      } else {
        onLogout();
      }
    } catch(e) {
       onLogout();
    }
  }, [onLogout]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsData, categoriesData, ratingsData, usersData, attendanceData, settingsData, positionsData, pointRecordsData] = await Promise.all([
        getStudents(),
        getCategories(),
        getRatings(),
        getUsers(),
        getAttendance(),
        getSettings(),
        getPositions(),
        getPointRecords()
      ]);
      setStudents(studentsData);
      setCategories(categoriesData);
      setRatings(ratingsData);
      setUsers(usersData);
      setAttendance(attendanceData);
      setSettings(settingsData);
      setPositions(positionsData);
      setPointRecords(pointRecordsData);
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast({ title: "Error", description: "Gagal memuat data dari Local Storage.", variant: "destructive"});
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [fetchData, currentUser]);
  
  const [isStudentManagerOpen, setStudentManagerOpen] = useState(false);
  const [isCategoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [isPositionManagerOpen, setPositionManagerOpen] = useState(false);
  const [isUserManagerOpen, setUserManagerOpen] = useState(false);
  const [isAttendanceManagerOpen, setAttendanceManagerOpen] = useState(false);
  const [isMonthlyRecapOpen, setMonthlyRecapOpen] = useState(false);
  const [isSettingsManagerOpen, setSettingsManagerOpen] = useState(false);

  const handleDataUpdate = async () => {
    await fetchData();
  };
  
  if (!settings || !currentUser) {
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <p>Mengarahkan...</p>
        </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen">
         <Header
            onManageStudents={() => setStudentManagerOpen(true)}
            onManageCategories={() => setCategoryManagerOpen(true)}
            onManagePositions={() => setPositionManagerOpen(true)}
            onManageUsers={() => setUserManagerOpen(true)}
            onManageSettings={() => setSettingsManagerOpen(true)}
            onLogout={onLogout}
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
        onManagePositions={() => setPositionManagerOpen(true)}
        onManageUsers={() => setUserManagerOpen(true)}
        onManageSettings={() => setSettingsManagerOpen(true)}
        onLogout={onLogout}
      />

      <main className="flex-1 p-4 md:p-8 container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-start">
          <div className="lg:col-span-1 xl:col-span-1 flex flex-col gap-8">
             <div className="grid grid-cols-2 gap-2">
                <Button size="lg" onClick={() => setAttendanceManagerOpen(true)}>
                  <CalendarCheck className="mr-2 h-5 w-5" />
                  Presensi
                </Button>
                <Button size="lg" variant="secondary" onClick={() => setMonthlyRecapOpen(true)}>
                  <ClipboardCheck className="mr-2 h-5 w-5" />
                  Rekap Bulanan
                </Button>
            </div>
            <PointRecorder 
                students={students} 
                onPointRecorded={handleDataUpdate}
                currentUser={currentUser}
            />
            <RatingInput
              students={students}
              categories={categories}
              attendance={attendance}
              settings={settings}
              onRatingSaved={handleDataUpdate}
            />
          </div>
          <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-8">
            <Recap
              students={students}
              categories={categories}
              ratings={ratings}
              attendance={attendance}
              positions={positions}
              pointRecords={pointRecords}
              settings={settings}
            />
            <SystemInstructions />
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
      <PositionManager
        isOpen={isPositionManagerOpen}
        onOpenChange={setPositionManagerOpen}
        positions={positions}
        onUpdate={handleDataUpdate}
      />
      <UserManager
        isOpen={isUserManagerOpen}
        onOpenChange={setUserManagerOpen}
        users={users}
        onUpdate={handleDataUpdate}
      />
       <SettingsManager
        isOpen={isSettingsManagerOpen}
        onOpenChange={setSettingsManagerOpen}
        settings={settings}
        onUpdate={handleDataUpdate}
      />
      <AttendanceManager
        isOpen={isAttendanceManagerOpen}
        onOpenChange={setAttendanceManagerOpen}
        students={students}
        attendance={attendance}
        onUpdate={handleDataUpdate}
      />
       <MonthlyAttendanceRecap
        isOpen={isMonthlyRecapOpen}
        onOpenChange={setMonthlyRecapOpen}
        students={students}
        attendance={attendance}
      />
    </div>
  );
}
