"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUsers, getStudents } from '@/lib/data';
import type { User, Student } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const loginSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid." }).min(1, { message: "Email tidak boleh kosong." }),
  password: z.string().min(6, { message: "Password minimal 6 karakter." }),
});

export function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    async function fetchData() {
      const [storedUsers, storedStudents] = await Promise.all([getUsers(), getStudents()]);
      setUsers(storedUsers);
      setStudents(storedStudents);
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
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 100 110"
                  className="w-16 h-16 text-primary-foreground"
                >
                  <path
                    fill="hsl(var(--primary))"
                    stroke="black"
                    strokeWidth="1"
                    d="M 50 0 L 95 15 L 100 50 L 95 85 L 50 110 L 5 85 L 0 50 L 5 15 Z"
                  />
                  <text
                    x="50"
                    y="25"
                    fontFamily="Arial, sans-serif"
                    fontSize="12"
                    fill="red"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    SMKN 3
                  </text>
                  <text
                    x="50"
                    y="40"
                    fontFamily="Arial, sans-serif"
                    fontSize="12"
                    fill="red"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    SOPPENG
                  </text>
                  <circle cx="50" cy="65" r="20" fill="grey" />
                  <path
                    d="M 35 65 A 15 15 0 0 1 65 65"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                  />
                  <path
                    d="M 50 45 L 50 85"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                  />
                  <path
                    d="M 30 65 L 70 65"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                  />
                  <path
                    d="M 35 50 L 65 80"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                  />
                  <path
                    d="M 35 80 L 65 50"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                  />
                  <path
                    d="M 55 55 L 50 62 L 45 55"
                    stroke="red"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M 20 90 C 30 80, 70 80, 80 90"
                    stroke="grey"
                    fill="none"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                   <path
                    d="M 25 95 C 35 85, 65 85, 75 95"
                    stroke="grey"
                    fill="none"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 30 105 L 70 105 L 75 100 L 25 100 Z"
                    fill="yellow"
                    stroke="black"
                    strokeWidth="1"
                  />
                   <path
                    d="M 35 100 h 30 M 35 102 h 30"
                    stroke="black"
                    strokeWidth="0.5"
                    strokeDasharray="2 2"
                  />
                </svg>
            </div>
            <CardTitle>Sistem Kredit Poin Siswa</CardTitle>
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
                                <FormControl>
                                    <Input id="password" type="password" placeholder="******" {...field} />
                                </FormControl>
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
