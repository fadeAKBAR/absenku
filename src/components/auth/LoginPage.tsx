
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUsers, getStudents, getSettings } from '@/lib/data';
import type { User, Student, AppSettings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const loginSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid." }).min(1, { message: "Email tidak boleh kosong." }),
  password: z.string().min(6, { message: "Password minimal 6 karakter." }),
});

export function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    async function fetchData() {
      const [storedUsers, storedStudents, appSettings] = await Promise.all([getUsers(), getStudents(), getSettings()]);
      setUsers(storedUsers);
      setStudents(storedStudents);
      setSettings(appSettings);
    }
    fetchData();
  }, []);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      const user = users.find(u => u.email === values.email && u.password === values.password);
      if (user) {
        localStorage.setItem('user_authenticated', JSON.stringify({ ...user, role: 'teacher' }));
        toast({
          title: 'Login Berhasil',
          description: `Selamat datang kembali, ${user.name}!`,
        });
        router.push('/dashboard');
        return;
      }

      const student = students.find(s => s.email === values.email && s.password === values.password);
      if (student) {
        localStorage.setItem('user_authenticated', JSON.stringify({ ...student, role: 'student' }));
        toast({
          title: 'Login Berhasil',
          description: `Selamat datang, ${student.name}!`,
        });
        router.push('/student/dashboard');
        return;
      }
      
      toast({
        title: 'Login Gagal',
        description: 'Email atau password salah.',
        variant: 'destructive',
      });
      setIsSubmitting(false);

    }, 1000);
  };

  return (
    <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
             <div className="mx-auto bg-primary p-3 rounded-lg w-fit mb-4">
                <Avatar className="h-16 w-16">
                    {settings?.schoolLogoUrl && <AvatarImage src={settings.schoolLogoUrl} alt={settings.schoolName} />}
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                        {settings?.schoolName.charAt(0)}
                    </AvatarFallback>
                </Avatar>
            </div>
            <CardTitle>{settings?.schoolName || "Sistem Kredit Poin Siswa"}</CardTitle>
            <CardDescription>Silakan login untuk melanjutkan</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <Label htmlFor="email">Email</Label>
                                <FormControl>
                                    <Input id="email" type="email" placeholder="nama@sekolah.id" {...field} />
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
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <FormControl>
                                        <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="******" {...field} />
                                    </FormControl>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <Button type="submit" className="w-full" disabled={isSubmitting}>
                        <LogIn className="mr-2 h-4 w-4" />
                        {isSubmitting ? 'Memproses...' : 'Login'}
                    </Button>
                </form>
            </Form>
        </CardContent>
        <CardFooter className="text-xs text-center text-muted-foreground">
             <p>Gunakan akun guru atau siswa yang terdaftar.</p>
        </CardFooter>
    </Card>
  );
}
