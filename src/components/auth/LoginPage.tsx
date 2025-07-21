
"use client";

import { useState, useEffect } from 'react';
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

const loginSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid." }).min(1, { message: "Email tidak boleh kosong." }),
  password: z.string().min(6, { message: "Password minimal 6 karakter." }),
});

type LoginPageProps = {
  onLoginSuccess: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
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
        onLoginSuccess();
        return;
      }

      const student = students.find(s => s.email === values.email && s.password === values.password);
      if (student) {
        localStorage.setItem('user_authenticated', JSON.stringify({ ...student, role: 'student' }));
        toast({
          title: 'Login Berhasil',
          description: `Selamat datang, ${student.name}!`,
        });
        onLoginSuccess();
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
  
  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
             <div className="mx-auto p-2 rounded-lg w-20 h-20 flex items-center justify-center mb-4">
                {settings?.schoolLogoUrl ? (
                    <img src={settings.schoolLogoUrl} alt={settings.schoolName} className="h-full w-full object-contain"/>
                ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center rounded-lg">
                        <span className="text-primary text-lg font-bold">
                            {settings?.schoolName.charAt(0)}
                        </span>
                    </div>
                )}
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
