"use client";

import React, { useState, useMemo } from 'react';
import { Download } from 'lucide-react';
import { subDays, startOfWeek, startOfMonth, format } from 'date-fns';
import type { Student, Category, Rating, RecapData } from '@/lib/types';
import { exportToCsv } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type RecapProps = {
  students: Student[];
  categories: Category[];
  ratings: Rating[];
};

const getStudentInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

const RankingList = ({ title, students, highlightClass }: { title: string; students: RecapData[], highlightClass: string }) => (
    <div>
        <h3 className="font-semibold mb-2">{title}</h3>
        <ul className="space-y-2">
            {students.map((s, index) => (
                <li key={s.studentId} className="flex items-center justify-between bg-card p-2 rounded-md border">
                    <div className="flex items-center gap-3">
                        <span className={`font-bold text-lg ${highlightClass}`}>{index + 1}</span>
                        <Avatar>
                            <AvatarFallback className={`${highlightClass} text-white`}>{getStudentInitials(s.studentName)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{s.studentName}</span>
                    </div>
                    <span className={`font-bold text-lg ${highlightClass}`}>{s.overallAverage.toFixed(2)}</span>
                </li>
            ))}
        </ul>
    </div>
);


export function Recap({ students, categories, ratings }: RecapProps) {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all-time'>('weekly');

  const filteredRatings = useMemo(() => {
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
        return ratings;
    }
    const startDateString = format(startDate, 'yyyy-MM-dd');
    return ratings.filter(r => r.date >= startDateString);
  }, [period, ratings]);

  const recapData = useMemo(() => {
    const studentData: { [studentId: string]: { ratings: Rating[] } } = {};

    students.forEach(student => {
        studentData[student.id] = { ratings: [] };
    });

    filteredRatings.forEach(rating => {
        if(studentData[rating.studentId]) {
            studentData[rating.studentId].ratings.push(rating);
        }
    });

    return students.map(student => {
      const studentRatings = studentData[student.id]?.ratings || [];
      const totalRatings = studentRatings.length;
      
      const overallAverage = totalRatings > 0 
        ? studentRatings.reduce((sum, r) => sum + r.average, 0) / totalRatings 
        : 0;

      const categoryAverages: { [categoryId: string]: { name: string; total: number; count: number; average: number } } = {};
      categories.forEach(cat => {
        categoryAverages[cat.id] = { name: cat.name, total: 0, count: 0, average: 0 };
      });

      studentRatings.forEach(r => {
        Object.entries(r.ratings).forEach(([catId, score]) => {
          if (categoryAverages[catId]) {
            categoryAverages[catId].total += score;
            categoryAverages[catId].count += 1;
          }
        });
      });
      
      Object.keys(categoryAverages).forEach(catId => {
        const catData = categoryAverages[catId];
        if(catData.count > 0) {
            catData.average = catData.total / catData.count;
        }
      });
      
      return {
        studentId: student.id,
        studentName: student.name,
        overallAverage,
        categoryAverages,
        totalRatings,
      };
    }).filter(s => s.totalRatings > 0)
      .sort((a, b) => b.overallAverage - a.overallAverage);
  }, [filteredRatings, students, categories]);

  const topStudents = recapData.slice(0, 3);
  const bottomStudents = recapData.slice(-3).reverse();
  
  const handleExport = () => {
    exportToCsv(recapData, categories, period);
  };

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Rekap Poin & Peringkat</CardTitle>
          <CardDescription>Tinjau performa siswa secara keseluruhan.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={recapData.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weekly">Mingguan</TabsTrigger>
            <TabsTrigger value="monthly">Bulanan</TabsTrigger>
            <TabsTrigger value="all-time">Semua</TabsTrigger>
          </TabsList>
          <TabsContent value={period}>
            <div className="mt-4 space-y-8">
                {recapData.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <RankingList title="🏆 Performa Terbaik" students={topStudents} highlightClass="bg-green-500" />
                            <RankingList title="⚠️ Perlu Perhatian" students={bottomStudents} highlightClass="bg-red-500" />
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[250px]">Siswa</TableHead>
                                    <TableHead className="text-center">Rata-rata</TableHead>
                                    <TableHead className="text-center">Total Rating</TableHead>
                                    {categories.map(cat => (
                                    <TableHead key={cat.id} className="text-center">{cat.name}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recapData.map(data => (
                                <TableRow key={data.studentId}>
                                    <TableCell className="font-medium">{data.studentName}</TableCell>
                                    <TableCell className="font-bold text-center text-primary">{data.overallAverage.toFixed(2)}</TableCell>
                                    <TableCell className="text-center">{data.totalRatings}</TableCell>
                                    {categories.map(cat => (
                                    <TableCell key={cat.id} className="text-center">
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
      </CardContent>
    </Card>
  );
}
