
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Edit, User as UserIcon, Eye, EyeOff, Award, SmartphoneNfc } from 'lucide-react';

import type { Student, Position } from '@/lib/types';
import { addStudent, deleteStudent, updateStudent, getPositions, resetDevice } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const studentSchema = z.object({
  name: z.string().min(3, "Nama siswa minimal 3 karakter."),
  email: z.string().email("Format email tidak valid."),
  password: z.string().min(6, "Password minimal 6 karakter.").optional().or(z.literal('')),
  photoUrl: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  parentPhone: z.string().optional(),
  positionId: z.string().optional(),
});

type StudentManagerProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  students: Student[];
  onUpdate: () => void;
};

const NO_POSITION_VALUE = 'no-position';

export function StudentManager({ isOpen, onOpenChange, students, onUpdate }: StudentManagerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: { name: "", email: "", password: "", photoUrl: "", address: "", phone: "", parentPhone: "", positionId: NO_POSITION_VALUE },
  });
  
  useEffect(() => {
    async function fetchPositions() {
      if (isOpen) {
        const fetchedPositions = await getPositions();
        setPositions(fetchedPositions);
      }
    }
    fetchPositions();
  }, [isOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('photoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    form.reset({ 
        name: student.name, 
        email: student.email, 
        password: "", 
        photoUrl: student.photoUrl,
        address: student.address,
        phone: student.phone,
        parentPhone: student.parentPhone,
        positionId: student.positionId || NO_POSITION_VALUE
    });
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    form.reset({ name: "", email: "", password: "", photoUrl: "", address: "", phone: "", parentPhone: "", positionId: NO_POSITION_VALUE });
  };

  async function onSubmit(values: z.infer<typeof studentSchema>) {
    if (!editingStudent && !values.password) {
        form.setError("password", { message: "Password wajib diisi untuk siswa baru."});
        return;
    }

    setIsSubmitting(true);
    try {
      const studentData = {
          ...values,
          password: values.password || undefined,
          positionId: values.positionId === NO_POSITION_VALUE ? undefined : values.positionId
      }
      if (editingStudent) {
        await updateStudent(editingStudent.id, studentData);
        toast({ title: "Sukses", description: "Data siswa telah diperbarui." });
      } else {
        await addStudent(studentData as z.infer<typeof studentSchema> & { password: string });
        toast({ title: "Sukses", description: "Siswa baru telah ditambahkan." });
      }
      handleCancelEdit();
      onUpdate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Gagal menyimpan data siswa.", variant: 'destructive' });
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

  async function handleResetDevice(id: string) {
    if (window.confirm("Apakah Anda yakin ingin mereset perangkat untuk siswa ini? Siswa akan dapat mendaftarkan perangkat baru saat check-in berikutnya.")) {
      try {
        await resetDevice(id);
        toast({ title: "Sukses", description: "Perangkat siswa telah direset." });
        onUpdate();
      } catch (error) {
        toast({ title: "Error", description: "Gagal mereset perangkat.", variant: 'destructive' });
      }
    }
  }
  
  const photoUrl = form.watch('photoUrl');
  const getPositionName = (positionId?: string) => {
      return positions.find(p => p.id === positionId)?.name || "Tanpa Jabatan";
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { onOpenChange(open); handleCancelEdit(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingStudent ? 'Edit Siswa' : 'Tambah Siswa Baru'}</DialogTitle>
          <DialogDescription>
            {editingStudent ? 'Perbarui detail siswa.' : 'Tambahkan siswa baru ke dalam sistem.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24">
                    <AvatarImage src={photoUrl || undefined} />
                    <AvatarFallback>
                        <UserIcon className="h-12 w-12" />
                    </AvatarFallback>
                    </Avatar>
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    Ganti Foto
                    </Button>
                    <Input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    />
                </div>

                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nama Siswa</FormLabel>
                    <FormControl>
                        <Input placeholder="cth. Budi Hartono" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                    control={form.control}
                    name="positionId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="flex items-center gap-2"><Award className="h-4 w-4"/> Jabatan</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || NO_POSITION_VALUE}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih jabatan" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value={NO_POSITION_VALUE}>Tanpa Jabatan</SelectItem>
                                {positions.map(pos => (
                                    <SelectItem key={pos.id} value={pos.id}>{pos.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email Siswa</FormLabel>
                    <FormControl>
                        <Input type="email" placeholder="budi.hartono@sekolah.id" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Password</FormLabel>
                    <div className="relative">
                        <FormControl>
                            <Input type={showPassword ? "text" : "password"} placeholder={editingStudent ? "Isi untuk mengubah" : "******"} {...field} />
                        </FormControl>
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                            {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                        </button>
                    </div>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Alamat lengkap siswa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor HP Siswa</FormLabel>
                      <FormControl>
                        <Input placeholder="08..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parentPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor HP Orang Tua</FormLabel>
                      <FormControl>
                        <Input placeholder="08..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>
            <DialogFooter className="pt-4">
                {editingStudent && (
                    <Button type="button" variant="ghost" onClick={handleCancelEdit}>Batal</Button>
                )}
                <Button type="submit" disabled={isSubmitting}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Menyimpan..." : (editingStudent ? "Simpan Perubahan" : "Tambah Siswa")}
                </Button>
            </DialogFooter>
          </form>
        </Form>
        
        <div className="mt-4">
          <h3 className="font-medium mb-2">Daftar Siswa</h3>
          <ScrollArea className="h-64 border rounded-md">
            <div className="p-4 space-y-2">
              {students.length > 0 ? students.map(student => (
                <div key={student.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                   <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={student.photoUrl || undefined} alt={student.name} />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <p className="font-medium">{student.name}</p>
                        <p className="text-muted-foreground">{getPositionName(student.positionId)}</p>
                      </div>
                   </div>
                  <div className="flex items-center gap-1">
                    {student.deviceId && (
                      <Button variant="outline" size="icon" className="h-8 w-8" title="Reset Perangkat" onClick={() => handleResetDevice(student.id)}>
                        <SmartphoneNfc className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(student)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(student.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )) : <p className="text-sm text-muted-foreground text-center py-4">Belum ada siswa.</p>}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
