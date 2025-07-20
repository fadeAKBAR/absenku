
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Award, ShieldAlert, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addPointRecord } from '@/lib/data';
import type { Student, User } from '@/lib/types';
import { format } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const pointSchema = z.object({
  studentId: z.string().min(1, "Siswa harus dipilih."),
  type: z.enum(['award', 'violation'], { required_error: "Tipe harus dipilih." }),
  description: z.string().min(5, "Deskripsi minimal 5 karakter.").max(100, "Deskripsi maksimal 100 karakter."),
  points: z.coerce.number().min(1, "Poin minimal 1."),
});

type PointRecorderProps = {
  students: Student[];
  currentUser: User;
  onPointRecorded: () => void;
};

export function PointRecorder({ students, currentUser, onPointRecorded }: PointRecorderProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof pointSchema>>({
    resolver: zodResolver(pointSchema),
    defaultValues: {
      studentId: "",
      type: "award",
      description: "",
      points: 1,
    },
  });

  const recordType = form.watch('type');

  async function onSubmit(values: z.infer<typeof pointSchema>) {
    setIsSubmitting(true);
    try {
      const finalPoints = values.type === 'violation' ? -Math.abs(values.points) : Math.abs(values.points);
      
      await addPointRecord({
        studentId: values.studentId,
        type: values.type,
        description: values.description,
        points: finalPoints,
        date: format(new Date(), 'yyyy-MM-dd'),
        issuedBy: currentUser.id,
      });

      toast({ title: "Sukses", description: "Catatan poin berhasil disimpan." });
      form.reset({ studentId: "", type: "award", description: "", points: 1 });
      onPointRecorded();
    } catch (error) {
      toast({ title: "Error", description: "Gagal menyimpan catatan poin.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle>Catat Poin Insidental</CardTitle>
        <CardDescription>Berikan penghargaan atau catat pelanggaran spesifik.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className='flex flex-col items-center'>
                  <FormControl>
                    <ToggleGroup 
                      type="single" 
                      className="w-full grid grid-cols-2" 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <ToggleGroupItem value="award" aria-label="Penghargaan" className="data-[state=on]:bg-green-500 data-[state=on]:text-white">
                        <Award className="mr-2 h-4 w-4" /> Penghargaan
                      </ToggleGroupItem>
                      <ToggleGroupItem value="violation" aria-label="Pelanggaran" className="data-[state=on]:bg-red-500 data-[state=on]:text-white">
                        <ShieldAlert className="mr-2 h-4 w-4" /> Pelanggaran
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pilih Siswa</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih siswa yang akan diberi poin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.map(student => (
                        <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea placeholder={recordType === 'award' ? 'cth. Membantu guru piket' : 'cth. Terlambat mengumpulkan tugas'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="points"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Poin</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan Catatan'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
