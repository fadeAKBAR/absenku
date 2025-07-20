
"use client";

import React from 'react';
import { Student, Position } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '../ui/scroll-area';

interface StudentListProps {
  students: Student[];
  positions: Position[];
}

const getStudentInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

export function StudentList({ students, positions }: StudentListProps) {
  const getPositionName = (positionId?: string) => {
    return positions.find(p => p.id === positionId)?.name;
  };

  return (
    <ScrollArea className="h-[600px] border rounded-md">
      <Table>
        <TableHeader className="sticky top-0 bg-secondary z-10">
          <TableRow>
            <TableHead className="w-[300px]">Nama Siswa</TableHead>
            <TableHead>Jabatan</TableHead>
            <TableHead className="hidden md:table-cell">Nomor HP</TableHead>
            <TableHead className="hidden md:table-cell">Nomor HP Ortu</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map(student => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={student.photoUrl || undefined} alt={student.name} />
                        <AvatarFallback>{getStudentInitials(student.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span>{student.name}</span>
                        <span className="text-xs text-muted-foreground">{student.email}</span>
                    </div>
                </div>
              </TableCell>
              <TableCell>
                {student.positionId ? (
                    <Badge>{getPositionName(student.positionId)}</Badge>
                ) : (
                    <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell">{student.phone || '-'}</TableCell>
              <TableCell className="hidden md:table-cell">{student.parentPhone || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
       {students.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p>Belum ada siswa yang terdaftar.</p>
            <p className="text-sm">Silakan tambahkan siswa melalui tombol "Siswa" di atas.</p>
          </div>
        )}
    </ScrollArea>
  );
}
