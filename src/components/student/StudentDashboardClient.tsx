

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format, set } from 'date-fns';
import { id } from 'date-fns/locale';
import { LogOut, CheckCircle, Clock, CalendarDays, History, XCircle, LogIn, AlertTriangle, Coffee, Loader2, MapPin, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAttendanceForStudent, checkInStudent, checkOutStudent, getSettings } from '@/lib/data';
import type { Student, Attendance, AppSettings } from '@/lib/types';
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
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { ReportAbsenceDialog } from './ReportAbsenceDialog';

const statusMapping: { [key in Attendance['status']]: { text: string; color: string; icon: React.ReactNode } } = {
  present: { text: 'Hadir', color: 'text-green-600', icon: <CheckCircle className="h-5 w-5" /> },
  late: { text: 'Terlambat', color: 'text-orange-600', icon: <Clock className="h-5 w-5" /> },
  sick: { text: 'Sakit', color: 'text-blue-600', icon: <Coffee className="h-5 w-5" /> },
  permit: { text: 'Izin', color: 'text-yellow-600', icon: <CalendarDays className="h-5 w-5" /> },
  absent: { text: 'Alpa', color: 'text-red-600', icon: <XCircle className="h-5 w-5" /> },
  no_checkout: { text: 'Tidak Check Out', color: 'text-gray-600', icon: <AlertTriangle className="h-5 w-5" /> },
};


export default function StudentDashboardClient() {
  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);
  const [showLocationError, setShowLocationError] = useState(false);
  const [locationErrorMessage, setLocationErrorMessage] = useState('');
  const [canCheckOut, setCanCheckOut] = useState(false);
  const [isReportAbsenceOpen, setReportAbsenceOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const todayString = format(new Date(), 'yyyy-MM-dd');

  const checkCanCheckOut = useCallback(() => {
    if (!settings) return;
    const now = new Date();
    const [h, m] = settings.checkOutTime.split(':').map(Number);
    const checkoutTime = set(new Date(), { hours: h, minutes: m, seconds: 0, milliseconds: 0 });
    setCanCheckOut(now >= checkoutTime);
  }, [settings]);


  const fetchData = useCallback(async (studentId: string) => {
    try {
      const [attendanceData, settingsData] = await Promise.all([
          getAttendanceForStudent(studentId),
          getSettings()
      ]);
      setSettings(settingsData);
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
  
  useEffect(() => {
    const interval = setInterval(checkCanCheckOut, 1000 * 30); // Check every 30 seconds
    checkCanCheckOut();
    return () => clearInterval(interval);
  }, [checkCanCheckOut]);

  const handleLogout = () => {
    localStorage.removeItem('user_authenticated');
    router.push('/');
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // in metres
  }
  
  const handleLocationError = (message: string) => {
    setLocationErrorMessage(message);
    setShowLocationError(true);
    setIsCheckingLocation(false);
  }

  const handleCheckIn = async () => {
    if (!student || !settings) return;
    setIsCheckingLocation(true);

    if (!navigator.geolocation) {
       handleLocationError("Browser Anda tidak mendukung geolokasi.");
       return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const distance = calculateDistance(latitude, longitude, settings.location.latitude, settings.location.longitude);

        if (distance > settings.checkInRadius) {
           handleLocationError(`Anda berada terlalu jauh dari sekolah (${Math.round(distance)} meter). Check-in hanya bisa dilakukan dalam radius ${settings.checkInRadius} meter.`);
           return;
        }

        // Location is valid, proceed with check-in
        setIsSubmitting(true);
        setIsCheckingLocation(false);
        try {
            await checkInStudent(student.id, new Date());
            toast({ title: "Sukses", description: "Check-in berhasil dicatat." });
            fetchData(student.id);
        } catch (error) {
            toast({ title: "Error", description: "Gagal melakukan check-in.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
      },
      (error) => {
        let message = "Terjadi kesalahan saat mengakses lokasi Anda.";
        if (error.code === 1) message = "Izin lokasi ditolak. Silakan izinkan akses lokasi di pengaturan browser Anda untuk melakukan check-in.";
        if (error.code === 2) message = "Lokasi tidak tersedia. Pastikan GPS Anda aktif.";
        handleLocationError(message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleCheckOut = async () => {
    if (!student) return;
    setIsSubmitting(true);
    try {
        await checkOutStudent(student.id, new Date());
        toast({ title: "Sukses", description: "Check-out berhasil dicatat. Sampai jumpa besok!" });
        fetchData(student.id);
    } catch (error) {
        toast({ title: "Error", description: "Gagal melakukan check-out.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  }


  if (!student || !settings) {
    return <div className="flex items-center justify-center min-h-screen">Mengarahkan...</div>;
  }
  
  const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Selamat Pagi';
      if (hour < 15) return 'Selamat Siang';
      if (hour < 18) return 'Selamat Sore';
      return 'Selamat Malam';
  }
  
  const handleAbsenceReported = () => {
    if(student) {
      fetchData(student.id);
    }
  }

  const renderAttendanceCard = () => {
    // Already checked in or reported sick/permit
    if (todayAttendance) {
      // Already checked out
      if (todayAttendance.checkOut) {
        return (
           <div className={`flex flex-col items-center justify-center text-center p-8 rounded-lg bg-secondary text-green-600`}>
             <div className="mb-4"><CheckCircle className="h-16 w-16" /></div>
             <p className="text-2xl font-bold">Presensi Lengkap</p>
             <p className="text-sm text-muted-foreground">Anda sudah check-out hari ini. Sampai jumpa besok!</p>
          </div>
        );
      }

      if (todayAttendance.status === 'sick' || todayAttendance.status === 'permit') {
           return (
            <div className={`flex flex-col items-center justify-center text-center p-8 rounded-lg bg-secondary ${statusMapping[todayAttendance.status].color}`}>
                <div className="mb-4">{React.cloneElement(statusMapping[todayAttendance.status].icon as React.ReactElement, { className: "h-16 w-16" })}</div>
                <p className="text-2xl font-bold">Laporan Terkirim</p>
                <p className="text-sm text-muted-foreground">Status Anda hari ini: {statusMapping[todayAttendance.status].text}. Semoga lekas sembuh jika sakit.</p>
            </div>
           )
      }
      
      // Not yet checked out
      return (
        <div className="flex flex-col items-center text-center gap-4">
          <p className="text-muted-foreground">Anda sudah check-in. Silakan lakukan check-out saat pulang.</p>
          <Button 
            size="lg" 
            className="w-full text-lg py-8 bg-blue-600 hover:bg-blue-700" 
            onClick={handleCheckOut} 
            disabled={isSubmitting || !canCheckOut}
            >
            {isSubmitting ? (
                 <><Loader2 className="mr-4 h-8 w-8 animate-spin" /> Memproses...</>
            ) : (
                 <><LogOut className="mr-4 h-8 w-8" /> Check Out</>
            )}
          </Button>
          {!canCheckOut && <p className="text-xs text-muted-foreground">Tombol Check Out akan aktif setelah pukul {settings.checkOutTime}.</p>}
        </div>
      );
    }

    // Not checked in yet
    return (
      <div className="flex flex-col items-center text-center gap-4">
        <p className="text-muted-foreground">Anda belum melakukan presensi hari ini.</p>
        <Button size="lg" className="w-full text-lg py-8" onClick={handleCheckIn} disabled={isSubmitting || isCheckingLocation}>
           {isCheckingLocation ? (
                 <><Loader2 className="mr-4 h-8 w-8 animate-spin" /> Memeriksa Lokasi...</>
           ) : isSubmitting ? (
                 <><Loader2 className="mr-4 h-8 w-8 animate-spin" /> Memproses...</>
           ) : (
                 <><LogIn className="mr-4 h-8 w-8" /> Check In</>
           )}
        </Button>
         <Button variant="outline" className="w-full" onClick={() => setReportAbsenceOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> Lapor Izin / Sakit
        </Button>
      </div>
    );
  }

  return (
    <>
    <AlertDialog open={showLocationError} onOpenChange={setShowLocationError}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><MapPin className="h-6 w-6 text-destructive"/> Error Lokasi</AlertDialogTitle>
            <AlertDialogDescription>
                {locationErrorMessage}
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowLocationError(false)}>Mengerti</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
     <ReportAbsenceDialog
        isOpen={isReportAbsenceOpen}
        onOpenChange={setReportAbsenceOpen}
        studentId={student.id}
        onSubmitted={handleAbsenceReported}
      />
    <div className="bg-secondary/50 min-h-screen">
      <header className="bg-card border-b sticky top-0 z-10 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={student.photoUrl} alt={student.name} />
              <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold text-primary">{getGreeting()}, {student.name}!</h1>
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
              {renderAttendanceCard()}
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
                                    <TableHead className="text-center">Check In</TableHead>
                                    <TableHead className="text-center">Check Out</TableHead>
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
                                        <TableCell className="text-center font-mono">
                                            {att.checkIn ? format(new Date(att.checkIn), 'HH:mm') : '-'}
                                        </TableCell>
                                        <TableCell className="text-center font-mono">
                                             {att.checkOut ? format(new Date(att.checkOut), 'HH:mm') : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {attendance.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
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
    </>
  );
}
