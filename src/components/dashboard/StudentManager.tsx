"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2 } from 'lucide-react';

import type { Student } from '@/lib/types';
import { addStudent, deleteStudent } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';

const studentSchema = z.object({
  name: z.string().min(3, "Nama siswa minimal 3 karakter."),
});

type StudentManagerProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  students: Student[];
  onUpdate: () => void;
};

export function StudentManager({ isOpen, onOpenChange, students, onUpdate }: StudentManagerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(values: z.infer<typeof studentSchema>) {
    setIsSubmitting(true);
    try {
      await addStudent(values.name);
      toast({ title: "Sukses", description: "Siswa baru telah ditambahkan." });
      form.reset();
      onUpdate();
    } catch (error) {
      toast({ title: "Error", description: "Gagal menambahkan siswa.", variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (window.confirm("Apakah Anda yakin ingin menghapus siswa ini? Semua data rating terkait akan dihapus.")) {
      try {
        await deleteStudent(id);
        toast({ title: "Sukses", description: "Siswa telah dihapus." });
        onUpdate();
      } catch (error) {
        toast({ title: "Error", description: "Gagal menghapus siswa.", variant: 'destructive' });
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Kelola Siswa</DialogTitle>
          <DialogDescription>Tambah, lihat, atau hapus data siswa dari sistem.</DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormLabel>Nama Siswa</FormLabel>
                  <FormControl>
                    <Input placeholder="cth. Budi Hartono" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              <Plus className="h-4 w-4 mr-2" />
              {isSubmitting ? "Menambahkan..." : "Tambah"}
            </Button>
          </form>
        </Form>
        
        <div className="mt-4">
          <h3 className="font-medium mb-2">Daftar Siswa</h3>
          <ScrollArea className="h-64 border rounded-md">
            <div className="p-4 space-y-2">
              {students.length > 0 ? students.map(student => (
                <div key={student.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                  <span>{student.name}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(student.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )) : <p className="text-sm text-muted-foreground text-center py-4">Belum ada siswa.</p>}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
