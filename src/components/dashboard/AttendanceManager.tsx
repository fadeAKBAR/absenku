
"use client";

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Check, X, Hand, FlaskConical, Save, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Student, Attendance } from '@/lib/types';
import { saveAttendance } from '@/lib/data';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type AttendanceManagerProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  students: Student[];
  attendance: Attendance[];
  onUpdate: () => void;
};

type Status = 'present' | 'absent' | 'sick' | 'permit' | 'late';

const statusIcons = {
    present: <Check className="h-4 w-4" />,
    late: <Clock className="h-4 w-4" />,
    absent: <X className="h-4 w-4" />,
    sick: <FlaskConical className="h-4 w-4" />,
    permit: <Hand className="h-4 w-4" />,
}

export function AttendanceManager({ isOpen, onOpenChange, students, attendance, onUpdate }: AttendanceManagerProps) {
  const [attendanceRecords, setAttendanceRecords] = useState<{ [studentId: string]: Status }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const todayString = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (isOpen) {
      const todayAttendance = attendance.filter(a => a.date === todayString);
      const initialRecords = students.reduce((acc, student) => {
        const record = todayAttendance.find(a => a.studentId === student.id);
        acc[student.id] = record ? record.status : 'present';
        return acc;
      }, {} as { [studentId: string]: Status });
      setAttendanceRecords(initialRecords);
    }
  }, [isOpen, students, attendance, todayString]);

  const handleStatusChange = (studentId: string, status: Status) => {
    if (status) { // ToggleGroup can return empty string if deselected
        setAttendanceRecords(prev => ({ ...prev, [studentId]: status }));
    }
  };
  
  const markAll = (status: Status) => {
    const newRecords = students.reduce((acc, student) => {
      acc[student.id] = status;
      return acc;
    }, {} as { [studentId: string]: Status });
    setAttendanceRecords(newRecords);
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
        await saveAttendance(todayString, attendanceRecords);
        toast({ title: "Sukses", description: "Data presensi hari ini berhasil disimpan." });
        onUpdate();
        onOpenChange(false);
    } catch (error) {
        toast({ title: "Error", description: "Gagal menyimpan data presensi.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Kelola Presensi Hari Ini ({format(new Date(), 'PPP')})</DialogTitle>
          <DialogDescription>Tandai kehadiran setiap siswa untuk hari ini.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 my-4">
            <Button variant="outline" size="sm" onClick={() => markAll('present')}>Tandai Semua Hadir</Button>
            <Button variant="outline" size="sm" onClick={() => markAll('absent')}>Tandai Semua Alpa</Button>
        </div>

        <ScrollArea className="h-96 border rounded-md">
          <div className="p-4 space-y-2">
            {students.map(student => (
              <div key={student.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                    <AvatarImage src={student.photoUrl} alt={student.name} />
                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{student.name}</span>
                </div>
                
                <ToggleGroup type="single" value={attendanceRecords[student.id] || 'present'} onValueChange={(value: Status) => handleStatusChange(student.id, value)}>
                    <ToggleGroupItem value="present" aria-label="Hadir" className="data-[state=on]:bg-green-500 data-[state=on]:text-white">
                        {statusIcons.present}
                    </ToggleGroupItem>
                     <ToggleGroupItem value="late" aria-label="Terlambat" className="data-[state=on]:bg-orange-500 data-[state=on]:text-white">
                        {statusIcons.late}
                    </ToggleGroupItem>
                    <ToggleGroupItem value="permit" aria-label="Izin" className="data-[state=on]:bg-yellow-500 data-[state=on]:text-white">
                        {statusIcons.permit}
                    </ToggleGroupItem>
                    <ToggleGroupItem value="sick" aria-label="Sakit" className="data-[state=on]:bg-blue-500 data-[state=on]:text-white">
                        {statusIcons.sick}
                    </ToggleGroupItem>
                     <ToggleGroupItem value="absent" aria-label="Alpa" className="data-[state=on]:bg-red-500 data-[state=on]:text-white">
                        {statusIcons.absent}
                    </ToggleGroupItem>
                </ToggleGroup>

              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Menyimpan...' : 'Simpan Presensi'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
