
"use client";

import React, { useState } from 'react';
import { Bot, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeStudent } from '@/ai/flows/analyzeStudentFlow';
import type { Student, Rating, Attendance, PointRecord, Category } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type StudentAnalysisProps = {
  students: Student[];
  ratings: Rating[];
  attendance: Attendance[];
  pointRecords: PointRecord[];
  categories: Category[];
};

export function StudentAnalysis({ students, ratings, attendance, pointRecords, categories }: StudentAnalysisProps) {
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!selectedStudent) {
      toast({ title: "Pilih Siswa", description: "Anda harus memilih siswa terlebih dahulu.", variant: 'destructive' });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult('');

    try {
      const studentData = students.find(s => s.id === selectedStudent);
      if (!studentData) {
        throw new Error("Data siswa tidak ditemukan.");
      }
      
      const studentRatings = ratings.filter(r => r.studentId === selectedStudent);
      const studentAttendance = attendance.filter(a => a.studentId === selectedStudent);
      const studentPointRecords = pointRecords.filter(p => p.studentId === selectedStudent);
      
      const result = await analyzeStudent({
        student: { id: studentData.id, name: studentData.name, email: studentData.email },
        ratings: studentRatings.map(r => ({ date: r.date, ratings: r.ratings, average: r.average})),
        attendance: studentAttendance.map(a => ({ date: a.date, status: a.status })),
        pointRecords: studentPointRecords.map(p => ({ date: p.date, type: p.type, description: p.description, points: p.points})),
        categories: categories.map(c => ({ id: c.id, name: c.name, isSystem: c.isSystem })),
        period: 'Semua Waktu',
      });

      setAnalysisResult(result.analysis);
    } catch (error) {
      console.error("AI Analysis Error:", error);
      toast({ title: "Analisis Gagal", description: "Terjadi kesalahan saat berkomunikasi dengan AI.", variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="w-full transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            Asisten Wali Kelas (AI)
        </CardTitle>
        <CardDescription>Dapatkan ringkasan performa siswa secara otomatis menggunakan AI.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
            <Select onValueChange={setSelectedStudent} value={selectedStudent}>
                <SelectTrigger>
                    <SelectValue placeholder="Pilih siswa untuk dianalisis" />
                </SelectTrigger>
                <SelectContent>
                    {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        {isAnalyzing && (
            <div className="flex items-center justify-center p-8 text-muted-foreground gap-3">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p>AI sedang menganalisis data...</p>
            </div>
        )}
        {analysisResult && (
            <div className="prose prose-sm max-w-none p-4 bg-secondary rounded-lg border">
                <p className="whitespace-pre-wrap">{analysisResult}</p>
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleAnalyze} disabled={isAnalyzing || !selectedStudent} className="w-full">
          {isAnalyzing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {isAnalyzing ? 'Menganalisis...' : 'Mulai Analisis AI'}
        </Button>
      </CardFooter>
    </Card>
  );
}
