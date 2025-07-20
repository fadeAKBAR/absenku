
"use client";

import React, { useState, useMemo } from 'react';
import { Download, BarChart2, MessageSquare } from 'lucide-react';
import { startOfWeek, startOfMonth, format } from 'date-fns';
import type { Student, Category, Rating, RecapData, Attendance, Position, PointRecord } from '@/lib/types';
import { exportToCsv } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { StudentList } from './StudentList';
import { useToast } from '@/hooks/use-toast';
import { id } from 'date-fns/locale';

type RecapProps = {
  students: Student[];
  categories: Category[];
  ratings: Rating[];
  attendance: Attendance[];
  positions: Position[];
  pointRecords: PointRecord[];
};

const getStudentInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

export function Recap({ students, categories, ratings, attendance, positions, pointRecords }: RecapProps) {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all-time'>('weekly');
  const { toast } = useToast();

  const { filteredRatings, filteredAttendance, filteredPointRecords } = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'weekly':
        startDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday
        break;
      case 'monthly':
        startDate = startOfMonth(now);
        break;
      case 'all-time':
      default:
        return { filteredRatings: ratings, filteredAttendance: attendance, filteredPointRecords: pointRecords };
    }
    const startDateString = format(startDate, 'yyyy-MM-dd');
    return {
        filteredRatings: ratings.filter(r => r.date >= startDateString),
        filteredAttendance: attendance.filter(a => a.date >= startDateString),
        filteredPointRecords: pointRecords.filter(p => p.date >= startDateString),
    };
  }, [period, ratings, attendance, pointRecords]);

  const recapData = useMemo(() => {
    return students.map(student => {
      const studentRatings = filteredRatings.filter(r => r.studentId === student.id);
      const studentAttendance = filteredAttendance.filter(a => a.studentId === student.id);
      const studentPointRecords = filteredPointRecords.filter(p => p.studentId === student.id);
      
      const totalRatings = studentRatings.length;
      
      const overallAverage = totalRatings > 0 
        ? studentRatings.reduce((sum, r) => sum + r.average, 0) / totalRatings 
        : 0;

      const totalPoints = studentPointRecords.reduce((sum, record) => sum + record.points, 0);
        
      const totalPossibleDays = studentAttendance.length;
      const daysPresent = studentAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
      const attendancePercentage = totalPossibleDays > 0 ? (daysPresent / totalPossibleDays) * 100 : 0;

      const categoryAverages: { [categoryId: string]: { name: string; total: number; count: number; average: number } } = {};
      categories.forEach(cat => {
        categoryAverages[cat.id] = { name: cat.name, total: 0, count: 0, average: 0 };
      });

      studentRatings.forEach(r => {
        // Ensure rating.ratings is an object before trying to iterate over it
        if (r.ratings && typeof r.ratings === 'object') {
            Object.entries(r.ratings).forEach(([catId, score]) => {
                if (categoryAverages[catId]) {
                    categoryAverages[catId].total += score;
                    categoryAverages[catId].count += 1;
                }
            });
        }
      });
      
      Object.keys(categoryAverages).forEach(catId => {
        const catData = categoryAverages[catId];
        if(catData.count > 0) {
            catData.average = catData.total / catData.count;
        }
      });
      
      const dailyAverages = studentRatings
        .map(r => ({ date: r.date, average: r.average }))
        .sort((a,b) => a.date.localeCompare(b.date));

      return {
        studentId: student.id,
        studentName: student.name,
        photoUrl: student.photoUrl,
        parentPhone: student.parentPhone,
        overallAverage,
        totalPoints,
        categoryAverages,
        totalRatings,
        attendancePercentage,
        daysPresent,
        dailyAverages
      };
    }).sort((a, b) => b.overallAverage - a.overallAverage);
  }, [filteredRatings, filteredAttendance, filteredPointRecords, students, categories]);
  
  const handleExport = () => {
    exportToCsv(recapData, categories, period);
  };

  const handleSendWhatsAppNotification = (student: RecapData) => {
    if (!student.parentPhone) {
      toast({
        title: "Nomor Tidak Ditemukan",
        description: `Nomor HP orang tua untuk siswa ${student.studentName} belum terdaftar.`,
        variant: "destructive",
      });
      return;
    }
    
    // Format number to international format (e.g., 62 for Indonesia)
    let phoneNumber = student.parentPhone.replace(/\D/g, ''); // Remove non-digit characters
    if (phoneNumber.startsWith('0')) {
      phoneNumber = '62' + phoneNumber.substring(1);
    } else if (!phoneNumber.startsWith('62')) {
      phoneNumber = '62' + phoneNumber;
    }

    const todayString = format(new Date(), 'yyyy-MM-dd');
    const todayAttendance = attendance.find(a => a.studentId === student.studentId && a.date === todayString);
    const todayFormatted = format(new Date(), 'eeee, dd MMMM yyyy', { locale: id });

    let message: string;

    if (todayAttendance) {
      const statusText = todayAttendance.status === 'present' 
        ? 'HADIR' 
        : todayAttendance.status === 'late'
        ? 'TERLAMBAT'
        : todayAttendance.status.toUpperCase();

      if (todayAttendance.status === 'absent') {
          message = `Yth. Bapak/Ibu Wali dari siswa ${student.studentName}, kami informasikan bahwa ananda tercatat *ALPA* pada hari ini, ${todayFormatted}. Mohon konfirmasinya. Terima kasih.`;
      } else if (todayAttendance.checkIn) {
          const checkInTime = format(new Date(todayAttendance.checkIn), 'HH:mm');
          message = `Yth. Bapak/Ibu Wali dari siswa ${student.studentName}, kami informasikan ananda telah *${statusText}* di sekolah hari ini, ${todayFormatted}, pada pukul *${checkInTime}*. Terima kasih.`;
      } else {
         // Case for sick or permit without check-in time
          message = `Yth. Bapak/Ibu Wali dari siswa ${student.studentName}, kami informasikan ananda hari ini berstatus *${statusText}* pada tanggal ${todayFormatted}. Terima kasih.`;
      }
    } else {
        // Fallback to weekly recap if no attendance record for today
        message = `Yth. Bapak/Ibu Wali dari siswa ${student.studentName}, kami informasikan rekap poin mingguan ananda:\n\nRata-rata Rating: *${student.overallAverage.toFixed(2)}*\nTotal Poin Tambahan: *${student.totalPoints > 0 ? '+' : ''}${student.totalPoints}*\n\nTerima kasih.`;
    }
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Rekap & Peringkat Siswa</CardTitle>
          <CardDescription>Tinjau performa siswa dan daftar seluruh siswa yang terdaftar.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={recapData.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="student-list" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student-list">Daftar Siswa</TabsTrigger>
            <TabsTrigger value="ranking">Peringkat</TabsTrigger>
          </TabsList>
          
          <TabsContent value="student-list" className="mt-4">
            <StudentList students={students} positions={positions} />
          </TabsContent>

          <TabsContent value="ranking">
             <Tabs value={period} onValueChange={(v) => setPeriod(v as any)} className="w-full mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="weekly">Mingguan</TabsTrigger>
                <TabsTrigger value="monthly">Bulanan</TabsTrigger>
                <TabsTrigger value="all-time">Semua</TabsTrigger>
              </TabsList>
              <TabsContent value={period}>
                <div className="mt-4 space-y-8">
                    {recapData.filter(s => s.totalRatings > 0 || s.totalPoints !== 0).length > 0 ? (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">Pkt.</TableHead>
                                        <TableHead className="w-[200px]">Siswa</TableHead>
                                        <TableHead className="text-center">Grafik</TableHead>
                                        <TableHead className="text-center">Poin +/-</TableHead>
                                        <TableHead className="text-center">Rata-rata</TableHead>
                                        <TableHead className="text-center">Kehadiran</TableHead>
                                        <TableHead className="text-center">Notifikasi</TableHead>
                                        {categories.map(cat => (
                                          <TableHead key={cat.id} className="text-center hidden md:table-cell">{cat.name}</TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recapData.map((data, index) => (
                                    <TableRow key={data.studentId}>
                                        <TableCell className="font-bold text-center">{index + 1}</TableCell>
                                        <TableCell className="font-medium flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={data.photoUrl || undefined} alt={data.studentName} />
                                                <AvatarFallback>{getStudentInitials(data.studentName)}</AvatarFallback>
                                            </Avatar>
                                            {data.studentName}
                                        </TableCell>
                                         <TableCell className="text-center">
                                           <Dialog>
                                             <DialogTrigger asChild>
                                               <Button variant="outline" size="icon" disabled={data.dailyAverages.length === 0}>
                                                 <BarChart2 className="h-4 w-4" />
                                               </Button>
                                             </DialogTrigger>
                                             <DialogContent className="max-w-2xl">
                                               <DialogHeader>
                                                 <DialogTitle>Grafik Performa: {data.studentName}</DialogTitle>
                                               </DialogHeader>
                                               <div className="h-80 w-full mt-4">
                                                  <ChartContainer config={{
                                                    average: { label: "Rata-rata", color: "hsl(var(--primary))" },
                                                  }}>
                                                    <BarChart data={data.dailyAverages} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                                                      <CartesianGrid vertical={false} />
                                                      <XAxis dataKey="date" tickFormatter={(val) => format(new Date(val), "d MMM")} />
                                                      <YAxis domain={[0, 5]} />
                                                      <ChartTooltip content={<ChartTooltipContent />} />
                                                      <Bar dataKey="average" fill="var(--color-average)" radius={4} />
                                                    </BarChart>
                                                  </ChartContainer>
                                                </div>
                                             </DialogContent>
                                           </Dialog>
                                         </TableCell>
                                        <TableCell className={`text-center font-bold ${data.totalPoints > 0 ? 'text-green-600' : data.totalPoints < 0 ? 'text-red-600' : ''}`}>
                                          {data.totalPoints}
                                        </TableCell>
                                        <TableCell className="font-bold text-center text-primary">{data.overallAverage.toFixed(2)}</TableCell>
                                        <TableCell className="text-center">{data.attendancePercentage.toFixed(0)}%</TableCell>
                                        <TableCell className="text-center">
                                           <Button variant="outline" size="icon" onClick={() => handleSendWhatsAppNotification(data)} disabled={!data.parentPhone}>
                                              <MessageSquare className="h-4 w-4" />
                                          </Button>
                                        </TableCell>
                                        {categories.map(cat => (
                                          <TableCell key={cat.id} className="text-center hidden md:table-cell">
                                              {data.categoryAverages[cat.id]?.average.toFixed(2) ?? 'N/A'}
                                          </TableCell>
                                        ))}
                                    </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </>
                    ) : (
                        <div className="text-center py-16 text-muted-foreground">
                            <p>Tidak ada data rating untuk periode ini.</p>
                        </div>
                    )}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

    