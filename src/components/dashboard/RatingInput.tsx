
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Save } from 'lucide-react';
import type { Student, Category, Attendance } from '@/lib/types';
import { saveRating } from '@/lib/data';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { StarRating } from '@/components/common/StarRating';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type RatingInputProps = {
  students: Student[];
  categories: Category[];
  attendance: Attendance[];
  onRatingSaved: () => void;
};

export function RatingInput({ students, categories, attendance, onRatingSaved }: RatingInputProps) {
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [dailyRatings, setDailyRatings] = useState<{ [categoryId: string]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const presentStudents = useMemo(() => {
    const todayString = format(date, 'yyyy-MM-dd');
    const presentStudentIds = new Set(
      attendance
        .filter(a => a.date === todayString && a.status === 'present')
        .map(a => a.studentId)
    );
    return students.filter(s => presentStudentIds.has(s.id));
  }, [date, attendance, students]);

  useEffect(() => {
    // Reset student selection if they are not present on the newly selected date
    if (selectedStudent && !presentStudents.some(s => s.id === selectedStudent)) {
        setSelectedStudent('');
    }
  }, [date, presentStudents, selectedStudent]);

  useEffect(() => {
    // Reset ratings when student or date changes
    const initialRatings = categories.reduce((acc, category) => {
      acc[category.id] = 0;
      return acc;
    }, {} as { [categoryId: string]: number });
    setDailyRatings(initialRatings);
  }, [selectedStudent, date, categories]);

  const handleRatingChange = (categoryId: string, rating: number) => {
    setDailyRatings(prev => ({ ...prev, [categoryId]: rating }));
  };

  const averageRating = useMemo(() => {
    const ratedValues = Object.values(dailyRatings).filter(r => r > 0);
    if (ratedValues.length === 0) return 0;
    const sum = ratedValues.reduce((acc, r) => acc + r, 0);
    return sum / ratedValues.length;
  }, [dailyRatings]);

  const handleSubmit = async () => {
    if (!selectedStudent) {
      toast({ title: "Validasi Gagal", description: "Silakan pilih siswa.", variant: 'destructive' });
      return;
    }
    if (Object.values(dailyRatings).some(r => r === 0)) {
        toast({ title: "Validasi Gagal", description: "Silakan berikan rating untuk semua kategori.", variant: 'destructive' });
        return;
    }

    setIsSubmitting(true);
    try {
      await saveRating({
        studentId: selectedStudent,
        date: format(date, 'yyyy-MM-dd'),
        ratings: dailyRatings,
        average: averageRating,
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
                {date ? format(date, "PPP") : <span>Pilih tanggal</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => setDate(d || new Date())}
                disabled={(date) => date > new Date() || date < new Date("2024-01-01")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
         <div className="grid gap-2">
          <Select onValueChange={setSelectedStudent} value={selectedStudent} disabled={presentStudents.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder={presentStudents.length > 0 ? "Pilih Siswa (Hadir)" : "Tidak ada siswa hadir"} />
            </SelectTrigger>
            <SelectContent>
              {presentStudents.map(student => (
                <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-4">
            {categories.map(category => (
                <div key={category.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category.name}</span>
                    <StarRating
                        rating={dailyRatings[category.id] || 0}
                        onRatingChange={(rating) => handleRatingChange(category.id, rating)}
                    />
                </div>
            ))}
        </div>
        
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-4">
        <div className="flex justify-between items-center bg-secondary p-3 rounded-lg">
            <span className="font-medium">Rata-rata Harian:</span>
            <span className="text-2xl font-bold text-primary">{averageRating.toFixed(2)}</span>
        </div>
        <Button onClick={handleSubmit} disabled={isSubmitting || !selectedStudent}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "Menyimpan..." : "Simpan Rating"}
        </Button>
      </CardFooter>
    </Card>
  );
}
