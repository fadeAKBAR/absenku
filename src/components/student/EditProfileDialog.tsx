
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, Eye, EyeOff } from 'lucide-react';
import type { Student } from '@/lib/types';
import { updateStudent } from '@/lib/data';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

const profileSchema = z.object({
  oldPassword: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  parentPhone: z.string().optional(),
}).refine(data => {
    // If user wants to change password (fills new password), old password is required
    if (data.password && !data.oldPassword) {
        return false;
    }
    return true;
}, {
    message: "Password lama harus diisi untuk mengubah password.",
    path: ["oldPassword"],
}).refine(data => {
    // if old password is provided, new password must be provided and be valid
    if(data.oldPassword && (!data.password || data.password.length < 6)) {
        return false
    }
    return true;
}, {
    message: "Password baru minimal 6 karakter.",
    path: ["password"],
}).refine(data => {
    // If new password is provided, confirmation must match
    if (data.password && data.password !== data.confirmPassword) {
        return false;
    }
    return true;
}, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirmPassword"],
});


type EditProfileDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  student: Student;
  onUpdate: (student: Student) => void;
};

export function EditProfileDialog({ isOpen, onOpenChange, student, onUpdate }: EditProfileDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
      oldPassword: '',
      address: student.address || '',
      phone: student.phone || '',
      parentPhone: student.parentPhone || '',
    },
  });

  useEffect(() => {
    if (student) {
      form.reset({
        password: '',
        confirmPassword: '',
        oldPassword: '',
        address: student.address || '',
        phone: student.phone || '',
        parentPhone: student.parentPhone || '',
      });
    }
  }, [student, isOpen, form]);

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    setIsSubmitting(true);
    try {
      const updatedStudent = await updateStudent(student.id, {
        address: values.address,
        phone: values.phone,
        parentPhone: values.parentPhone,
        password: values.password || undefined, // Only send password if it's not empty
        oldPassword: values.oldPassword || undefined,
      });
      onUpdate(updatedStudent);
      onOpenChange(false);
      toast({ title: "Sukses", description: "Profil Anda berhasil diperbarui." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Gagal memperbarui profil.", variant: 'destructive' });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profil</DialogTitle>
          <DialogDescription>
            Perbarui informasi pribadi Anda. Nama dan email hanya bisa diubah oleh guru.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[450px] pr-4">
              <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Nama</Label>
                    <Input value={student.name} disabled />
                </div>
                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={student.email} disabled />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Alamat lengkap Anda" {...field} />
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
                      <FormLabel>Nomor HP Anda</FormLabel>
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

                <Separator />
                <p className="text-sm font-medium text-muted-foreground">Ubah Password</p>

                <FormField
                  control={form.control}
                  name="oldPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password Lama</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input type={showOldPassword ? 'text' : 'password'} placeholder="Masukkan password lama" {...field} />
                        </FormControl>
                         <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                            {showOldPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password Baru</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input type={showPassword ? 'text' : 'password'} placeholder="Minimal 6 karakter" {...field} />
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
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Konfirmasi Password Baru</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input type={showConfirmPassword ? 'text' : 'password'} placeholder="Ketik ulang password baru" {...field} />
                        </FormControl>
                         <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                            {showConfirmPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>
            <DialogFooter className="pt-6">
              <Button type="submit" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
