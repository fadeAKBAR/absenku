
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { format, set, differenceInMinutes } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar as CalendarIcon, Save } from 'lucide-react';
import type { Student, Category, Attendance, AppSettings, Rating } from '@/lib/types';
import { getRatings, saveRating } from '@/lib/data';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { StarRating } from '@/components/common/StarRating';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';


type RatingInputProps = {
  students: Student[];
  categories: Category[];
  attendance: Attendance[];
  settings: AppSettings;
  onRatingSaved: () => void;
};

const calculateAttendanceRating = (date: string, studentId: string, attendanceData: Attendance[], appSettings: AppSettings): number | null => {
    const studentAttendance = attendanceData.find(a => a.studentId === studentId && a.date === date);

    if (!studentAttendance || !studentAttendance.checkIn) {
        return null;
    }

    if (studentAttendance.status === 'present') {
        return 5;
    }

    if (studentAttendance.status === 'late') {
        const checkInTime = new Date(studentAttendance.checkIn);
        const [h, m] = appSettings.lateTime.split(':').map(Number);
        const lateTimeThreshold = set(checkInTime, { hours: h, minutes: m, seconds: 0, milliseconds: 0 });

        const minutesLate = differenceInMinutes(checkInTime, lateTimeThreshold);

        if (minutesLate <= 10) return 4;
        if (minutesLate <= 30) return 3;
        return 1;
    }
    
    if (studentAttendance.status === 'sick' || studentAttendance.status === 'permit') {
        return 5; // Excused
    }

    return 0;
}


export function RatingInput({ students, categories, attendance, settings, onRatingSaved }: RatingInputProps) {
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [dailyRatings, setDailyRatings] = useState<{ [categoryId: string]: number }>({});
  const [attendanceRating, setAttendanceRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allRatings, setAllRatings] = useState<Rating[]>([]);
  const { toast } = useToast();

  const manualCategories = useMemo(() => categories.filter(c => !c.isSystem), [categories]);
  const attendanceCategory = useMemo(() => categories.find(c => c.isSystem), [categories]);

  const presentStudents = useMemo(() => {
    const selectedDateString = format(date, 'yyyy-MM-dd');
    const presentStudentIds = new Set(
      attendance
        .filter(a => a.date === selectedDateString && (a.status !== 'absent'))
        .map(a => a.studentId)
    );
    return students.filter(s => presentStudentIds.has(s.id));
  }, [date, attendance, students]);
  
  useEffect(() => {
      async function fetchRatings() {
          const ratingsData = await getRatings();
          setAllRatings(ratingsData);
      }
      fetchRatings();
  }, []);

  useEffect(() => {
    // Reset student selection if they are not present on the newly selected date
    if (selectedStudent && !presentStudents.some(s => s.id === selectedStudent)) {
        setSelectedStudent('');
    }
  }, [date, presentStudents, selectedStudent]);

  useEffect(() => {
    const selectedDateString = format(date, 'yyyy-MM-dd');
    const existingRating = allRatings.find(r => r.studentId === selectedStudent && r.date === selectedDateString);

    const initialRatings = manualCategories.reduce((acc, category) => {
      acc[category.id] = existingRating?.ratings[category.id] || 0;
      return acc;
    }, {} as { [categoryId: string]: number });
    setDailyRatings(initialRatings);
    
    if (selectedStudent) {
      const newAttendanceRating = calculateAttendanceRating(selectedDateString, selectedStudent, attendance, settings);
      setAttendanceRating(newAttendanceRating);
    } else {
      setAttendanceRating(null);
    }

  }, [selectedStudent, date, manualCategories, attendance, settings, allRatings]);

  const handleRatingChange = (categoryId: string, rating: number) => {
    setDailyRatings(prev => ({ ...prev, [categoryId]: rating }));
  };

  const averageRating = useMemo(() => {
    const filledManualRatings = Object.values(dailyRatings).filter(r => r > 0);
    const allRatingValues = [...filledManualRatings];
    if (attendanceRating !== null) {
        allRatingValues.push(attendanceRating);
    }
    
    if (allRatingValues.length === 0) return 0;
    const sum = allRatingValues.reduce((acc, r) => acc + r, 0);
    return sum / allRatingValues.length;
  }, [dailyRatings, attendanceRating]);

  const handleSubmit = async () => {
    if (!selectedStudent) {
      toast({ title: "Validasi Gagal", description: "Silakan pilih siswa.", variant: 'destructive' });
      return;
    }
    
    const filledManualRatings = Object.entries(dailyRatings)
      .filter(([, rating]) => rating > 0)
      .reduce((acc, [id, rating]) => {
        acc[id] = rating;
        return acc;
      }, {} as { [categoryId: string]: number });

    setIsSubmitting(true);
    try {
      await saveRating({
        studentId: selectedStudent,
        date: format(date, 'yyyy-MM-dd'),
        ratings: filledManualRatings,
        average: 0, // Server will calculate the final average
      });
      toast({ title: "Sukses", description: "Rating berhasil disimpan." });
      setSelectedStudent('');
      onRatingSaved();
    } catch (error) {
      toast({ title: "Error", description: "Gagal menyimpan rating.", variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle>Input Rating Harian</CardTitle>
        <CardDescription>Pilih siswa yang hadir, tanggal, dan berikan rating.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: id }) : <span>Pilih tanggal</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => setDate(d || new Date())}
                disabled={(date) => date > new Date() || date < new Date("2024-01-01")}
                initialFocus
                locale={id}
              />
            </PopoverContent>
          </Popover>
        </div>
         <div className="grid gap-2">
          <Select onValueChange={setSelectedStudent} value={selectedStudent} disabled={presentStudents.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder={presentStudents.length > 0 ? "Pilih Siswa (Hadir/Izin/Sakit)" : "Tidak ada siswa hadir/izin"} />
            </SelectTrigger>
            <SelectContent>
              {presentStudents.map(student => (
                <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-4">
             {attendanceCategory && selectedStudent && attendanceRating !== null && (
                 <div key={attendanceCategory.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2">
                        {attendanceCategory.name}
                        <Badge variant="secondary">Otomatis</Badge>
                    </span>
                    <StarRating
                        rating={attendanceRating}
                        onRatingChange={() => {}}
                        disabled={true}
                    />
                </div>
            )}
            {manualCategories.map(category => (
                <div key={category.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2">
                        {category.name}
                    </span>
                    <StarRating
                        rating={dailyRatings[category.id] || 0}
                        onRatingChange={(rating) => handleRatingChange(category.id, rating)}
                        disabled={!selectedStudent}
                    />
                </div>
            ))}
        </div>
        
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-4">
        <div className="flex justify-between items-center bg-secondary p-3 rounded-lg">
            <span className="font-medium">Rata-rata (Total):</span>
            <span className="text-2xl font-bold text-primary">{selectedStudent ? averageRating.toFixed(2) : '0.00'}</span>
        </div>
        <Button onClick={handleSubmit} disabled={isSubmitting || !selectedStudent}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "Menyimpan..." : "Simpan Rating"}
        </Button>
      </CardFooter>
    </Card>
  );
}
