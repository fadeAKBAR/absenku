
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Edit, Eye, EyeOff } from 'lucide-react';

import type { User } from '@/lib/types';
import { addUser, deleteUser, updateUser } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const userSchema = z.object({
  name: z.string().min(3, "Nama pengguna minimal 3 karakter."),
  email: z.string().email("Format email tidak valid."),
  password: z.string().min(6, "Password minimal 6 karakter.").optional().or(z.literal('')),
});

type UserManagerProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  users: User[];
  onUpdate: () => void;
};

export function UserManager({ isOpen, onOpenChange, users, onUpdate }: UserManagerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.reset({ name: user.name, email: user.email, password: "" });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    form.reset({ name: "", email: "", password: "" });
  };


  async function onSubmit(values: z.infer<typeof userSchema>) {
    if (!editingUser && !values.password) {
        form.setError("password", { message: "Password wajib diisi untuk pengguna baru."});
        return;
    }

    setIsSubmitting(true);
    try {
      if (editingUser) {
          await updateUser(editingUser.id, {
            name: values.name,
            email: values.email,
            password: values.password || undefined, // Send undefined if empty
          });
          toast({ title: "Sukses", description: "Data pengguna telah diperbarui." });
      } else {
         await addUser(values as z.infer<typeof userSchema> & { password: string });
         toast({ title: "Sukses", description: "Pengguna baru telah ditambahkan." });
      }
      handleCancelEdit();
      onUpdate();
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Gagal menyimpan data pengguna.", variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (users.length <= 1) {
        toast({ title: "Aksi Ditolak", description: "Tidak dapat menghapus satu-satunya pengguna.", variant: 'destructive' });
        return;
    }
    if (window.confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
      try {
        await deleteUser(id);
        toast({ title: "Sukses", description: "Pengguna telah dihapus." });
        onUpdate();
      } catch (error) {
        toast({ title: "Error", description: "Gagal menghapus pengguna.", variant: 'destructive' });
      }
    }
  }
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { onOpenChange(open); handleCancelEdit(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</DialogTitle>
          <DialogDescription>Tambah, edit, atau hapus pengguna (guru) yang dapat mengakses sistem.</DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="cth. Ibu Guru" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="guru.baru@sekolah.id" {...field} />
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
                            <Input type={showPassword ? "text" : "password"} placeholder={editingUser ? 'Isi untuk mengubah' : '******'} {...field} />
                        </FormControl>
                         <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                            {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                        </button>
                    </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
                {editingUser && (
                    <Button type="button" variant="ghost" onClick={handleCancelEdit}>Batal</Button>
                )}
                 <Button type="submit" disabled={isSubmitting}>
                    {editingUser ? <Edit className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    {isSubmitting ? "Menyimpan..." : (editingUser ? "Simpan Perubahan" : "Tambah Pengguna")}
                </Button>
            </DialogFooter>
          </form>
        </Form>
        
        <div className="mt-4">
          <h3 className="font-medium mb-2">Daftar Pengguna</h3>
          <ScrollArea className="h-48 border rounded-md">
            <div className="p-4 space-y-2">
              {users.length > 0 ? users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(user.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )) : <p className="text-sm text-muted-foreground text-center py-4">Belum ada pengguna.</p>}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
