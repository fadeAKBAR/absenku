
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { LogOut, CheckCircle, Clock, CalendarDays, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAttendanceForStudent, saveAttendanceForStudent } from '@/lib/data';
import type { Student, Attendance } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '../ui/scroll-area';

const statusMapping: { [key in Attendance['status']]: { text: string; color: string; icon: React.ReactNode } } = {
  present: { text: 'Hadir', color: 'text-green-600', icon: <CheckCircle className="h-5 w-5" /> },
  late: { text: 'Terlambat', color: 'text-orange-600', icon: <Clock className="h-5 w-5" /> },
  sick: { text: 'Sakit', color: 'text-blue-600', icon: <Clock className="h-5 w-5" /> },
  permit: { text: 'Izin', color: 'text-yellow-600', icon: <Clock className="h-5 w-5" /> },
  absent: { text: 'Alpa', color: 'text-red-600', icon: <Clock className="h-5 w-5" /> },
};


export default function StudentDashboardClient() {
  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const todayString = format(new Date(), 'yyyy-MM-dd');

  const fetchData = useCallback(async (studentId: string) => {
    try {
      const attendanceData = await getAttendanceForStudent(studentId);
      setAttendance(attendanceData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      const todayRecord = attendanceData.find(a => a.date === todayString) || null;
      setTodayAttendance(todayRecord);
    } catch (error) {
      toast({ title: "Error", description: "Gagal memuat data presensi.", variant: "destructive" });
    }
  }, [toast, todayString]);

  useEffect(() => {
    try {
      const userString = localStorage.getItem('user_authenticated');
      if (userString) {
        const userData = JSON.parse(userString);
        if (userData.role === 'student') {
          setStudent(userData);
          fetchData(userData.id);
        } else {
          router.replace('/dashboard');
        }
      } else {
        router.replace('/');
      }
    } catch (e) {
      router.replace('/');
    }
  }, [router, fetchData]);

  const handleLogout = () => {
    localStorage.removeItem('user_authenticated');
    router.push('/');
  };

  const handlePresence = async () => {
    if (!student) return;
    setIsSubmitting(true);
    try {
      await saveAttendanceForStudent(student.id, todayString, 'present');
      toast({ title: "Sukses", description: "Kehadiran Anda berhasil dicatat." });
      fetchData(student.id);
    } catch (error) {
      toast({ title: "Error", description: "Gagal mencatat kehadiran.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!student) {
    return <div className="flex items-center justify-center min-h-screen">Mengarahkan...</div>;
  }
  
  const attendanceStatus = todayAttendance ? statusMapping[todayAttendance.status] : null;

  return (
    <div className="bg-secondary/50 min-h-screen">
      <header className="bg-card border-b sticky top-0 z-10 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={student.photoUrl} alt={student.name} />
              <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold text-primary">{student.name}</h1>
              <p className="text-sm text-muted-foreground">{student.email}</p>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-6 w-6 text-primary" />
                Presensi Hari Ini
              </CardTitle>
              <CardDescription>{format(new Date(), 'eeee, dd MMMM yyyy', { locale: id })}</CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceStatus ? (
                <div className={`flex flex-col items-center justify-center text-center p-8 rounded-lg bg-secondary ${attendanceStatus.color}`}>
                   <div className="mb-4">{React.cloneElement(attendanceStatus.icon, { className: "h-16 w-16"})}</div>
                  <p className="text-2xl font-bold">{attendanceStatus.text}</p>
                  <p className="text-sm text-muted-foreground">Kehadiran Anda telah dicatat oleh sistem.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center gap-4">
                  <p className="text-muted-foreground">Anda belum melakukan presensi hari ini. Silakan konfirmasi kehadiran Anda.</p>
                  <Button size="lg" className="w-full text-lg py-8" onClick={handlePresence} disabled={isSubmitting}>
                    <CheckCircle className="mr-4 h-8 w-8" />
                    {isSubmitting ? 'Memproses...' : 'Konfirmasi Kehadiran'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
            <Card className="shadow-lg">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-6 w-6 text-primary" />
                        Riwayat Presensi
                    </CardTitle>
                    <CardDescription>Berikut adalah catatan kehadiran Anda.</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <ScrollArea className="h-96">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attendance.map(att => (
                                    <TableRow key={att.id}>
                                        <TableCell>{format(new Date(att.date), 'PPP', { locale: id })}</TableCell>
                                        <TableCell>
                                            <div className={`flex items-center gap-2 ${statusMapping[att.status].color}`}>
                                                {statusMapping[att.status].icon}
                                                <span className="font-medium">{statusMapping[att.status].text}</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {attendance.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                                            Belum ada riwayat presensi.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                 </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
