import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Sistem Kredit Poin Siswa',
  description: 'Aplikasi untuk mengelola kredit poin siswa.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={cn("h-full font-sans antialiased flex flex-col", inter.variable)}>
        <div className="flex-1">
          {children}
        </div>
        <footer className="py-4 text-center text-sm text-muted-foreground">
          Copyright © 2025 Fadlan Akbar
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
