"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    
    // --- MOCK LOGIN ---
    // In a real app, you would make an API call here.
    // For this prototype, we'll just check for a test user.
    setTimeout(() => {
      if (values.email === 'guru@sekolah.id' && values.password === 'password') {
        localStorage.setItem('user_authenticated', 'true');
        toast({
          title: 'Login Berhasil',
          description: 'Selamat datang kembali!',
        });
        router.push('/dashboard');
      } else {
        toast({
          title: 'Login Gagal',
          description: 'Email atau password salah.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
      }
    }, 1000);
  };

  return (
    <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary p-3 rounded-lg w-fit mb-4">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-8 h-8 text-primary-foreground"
                    >
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
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
                                    <Input id="email" type="email" placeholder="guru@sekolah.id" {...field} />
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
            <p>Gunakan email: guru@sekolah.id & password: password</p>
        </CardFooter>
    </Card>
  );
}
