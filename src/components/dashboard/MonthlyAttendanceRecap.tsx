
"use client";

import React, { useMemo } from 'react';
import { Download } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { id } from 'date-fns/locale';
import type { Student, Attendance, ChartConfig } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';


type MonthlyAttendanceRecapProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  students: Student[];
  attendance: Attendance[];
};

type StudentMonthlyRecap = {
  studentId: string;
  studentName: string;
  present: number;
  late: number;
  sick: number;
  permit: number;
  absent: number;
  totalDays: number;
};

const chartConfig = {
    Hadir: { label: 'Hadir', color: 'hsl(142.1 76.2% 42.2%)' }, // green-600
    Terlambat: { label: 'Terlambat', color: 'hsl(35.5 85.8% 52.9%)' }, // orange-500
    Sakit: { label: 'Sakit', color: 'hsl(221.2 83.2% 53.3%)' }, // blue-600
    Izin: { label: 'Izin', color: 'hsl(47.9 95.8% 53.1%)' }, // yellow-500
    Alpa: { label: 'Alpa', color: 'hsl(0 84.2% 60.2%)' }, // red-600
} satisfies ChartConfig;


export function MonthlyAttendanceRecap({ isOpen, onOpenChange, students, attendance }: MonthlyAttendanceRecapProps) {
  const currentMonth = new Date();

  const monthlyRecap = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start, end });
    const monthDays = daysInMonth.filter(day => day.getDay() !== 0 && day.getDay() !== 6); // Filter out weekends

    const recap: StudentMonthlyRecap[] = students.map(student => {
      const studentAttendance = attendance.filter(a =>
        a.studentId === student.id &&
        new Date(a.date) >= start &&
        new Date(a.date) <= end
      );

      return {
        studentId: student.id,
        studentName: student.name,
        present: studentAttendance.filter(a => a.status === 'present').length,
        late: studentAttendance.filter(a => a.status === 'late').length,
        sick: studentAttendance.filter(a => a.status === 'sick').length,
        permit: studentAttendance.filter(a => a.status === 'permit').length,
        absent: studentAttendance.filter(a => a.status === 'absent').length,
        totalDays: monthDays.length,
      };
    });

    return recap;
  }, [students, attendance, currentMonth]);

  const handleExport = () => {
    const headers = ['Nama Siswa', 'Hadir', 'Terlambat', 'Sakit', 'Izin', 'Alpa', 'Total Hari Efektif'];
    const rows = monthlyRecap.map(item =>
      [
        `"${item.studentName}"`,
        item.present,
        item.late,
        item.sick,
        item.permit,
        item.absent,
        item.totalDays,
      ].join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rekap_kehadiran_${format(currentMonth, 'MMMM-yyyy', { locale: id })}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const chartData = monthlyRecap.map(s => ({
      name: s.studentName,
      Hadir: s.present,
      Terlambat: s.late,
      Sakit: s.sick,
      Izin: s.permit,
      Alpa: s.absent
  })).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>
            Rekap Kehadiran Bulanan - {format(currentMonth, 'MMMM yyyy', { locale: id })}
          </DialogTitle>
          <DialogDescription>
            Ringkasan kehadiran seluruh siswa untuk bulan ini.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end mt-4">
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-1 xl:grid-cols-5 gap-8">
            <div className="xl:col-span-3">
                <h3 className="font-semibold mb-4 text-center">Grafik Kehadiran Siswa</h3>
                 <div className="h-96 w-full">
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                barCategoryGap={5}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                {Object.keys(chartConfig).map((key) => (
                                    <Bar key={key} dataKey={key} stackId="a" fill={chartConfig[key as keyof typeof chartConfig].color} radius={[4, 4, 0, 0]} />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            </div>

            <div className="xl:col-span-2">
                <h3 className="font-semibold mb-4">Tabel Rekapitulasi</h3>
                <ScrollArea className="h-[400px] border rounded-md">
                    <Table>
                        <TableHeader className="sticky top-0 bg-secondary">
                        <TableRow>
                            <TableHead>Nama Siswa</TableHead>
                            <TableHead className="text-center">Hadir</TableHead>
                            <TableHead className="text-center">Telat</TableHead>
                            <TableHead className="text-center">Sakit</TableHead>
                            <TableHead className="text-center">Izin</TableHead>
                            <TableHead className="text-center">Alpa</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {monthlyRecap.map(recap => (
                            <TableRow key={recap.studentId}>
                            <TableCell className="font-medium">{recap.studentName}</TableCell>
                            <TableCell className="text-center">{recap.present}</TableCell>
                            <TableCell className="text-center">{recap.late}</TableCell>
                            <TableCell className="text-center">{recap.sick}</TableCell>
                            <TableCell className="text-center">{recap.permit}</TableCell>
                            <TableCell className="text-center">{recap.absent}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
