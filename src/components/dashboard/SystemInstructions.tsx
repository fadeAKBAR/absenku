
"use client"

import { BookCheck, Info, Star, Users, Workflow, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function SystemInstructions() {
  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Info className="h-6 w-6 text-primary" />
            Panduan Sistem GradeWise
        </CardTitle>
        <CardDescription>Penjelasan mengenai alur kerja, aturan, dan fitur utama aplikasi.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Workflow className="h-5 w-5"/>
                <span className="font-semibold">Alur Kerja Utama</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2 pl-2">
              <p>1. <strong>Siswa Check-in:</strong> Siswa melakukan check-in setiap hari melalui aplikasi mereka. Sistem akan mencatat waktu dan status kehadiran (hadir/terlambat).</p>
              <p>2. <strong>Rating Otomatis Terbuat:</strong> Saat check-in berhasil, sebuah rating awal untuk hari itu otomatis dibuat untuk siswa, berisi poin kehadiran.</p>
              <p>3. <strong>Guru Memberi Rating Manual:</strong> Guru menginput rating harian untuk kategori lain (misal: Partisipasi, Tugas) melalui panel "Input Rating Harian".</p>
              <p>4. <strong>Data Terekap:</strong> Semua data rating dan kehadiran akan direkapitulasi secara mingguan, bulanan, atau keseluruhan pada panel "Rekap Poin & Peringkat".</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                <span className="font-semibold">Aturan Rating Kehadiran Otomatis</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2 pl-2">
              <p>Kategori "Kehadiran" dinilai secara otomatis oleh sistem berdasarkan waktu check-in siswa dan tidak dapat diubah secara manual.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>5 Bintang:</strong> Check-in tepat waktu.</li>
                <li><strong>4 Bintang:</strong> Terlambat hingga 10 menit.</li>
                <li><strong>3 Bintang:</strong> Terlambat 11 - 30 menit.</li>
                <li><strong>1 Bintang:</strong> Terlambat lebih dari 30 menit.</li>
                <li><strong>0 Bintang (Alpa):</strong> Siswa tidak melakukan check-in pada hari tersebut.</li>
                 <li><strong>5 Bintang (Izin/Sakit):</strong> Siswa yang melapor izin atau sakit dianggap hadir.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="font-semibold">Manajemen Data</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2 pl-2">
              <p>Gunakan tombol-tombol di bagian header untuk mengelola data penting:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Siswa:</strong> Menambah, mengedit, atau menghapus data siswa.</li>
                <li><strong>Kategori:</strong> Menambah atau menghapus kategori penilaian manual.</li>
                <li><strong>Pengguna:</strong> Mengelola akun guru yang dapat mengakses dasbor ini.</li>
                <li><strong>Pengaturan:</strong> Mengubah nama sekolah, logo, koordinat, radius, dan jadwal presensi.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
           <AccordionItem value="item-4">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5"/>
                <span className="font-semibold">Poin Penting</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2 pl-2">
               <ul className="list-disc pl-5 space-y-1">
                <li>Rating manual tidak wajib diisi setiap hari. Jika tidak diisi, rata-rata harian siswa akan dihitung hanya dari poin kehadiran.</li>
                <li>Siswa yang tidak check-in akan dianggap "Alpa" oleh sistem pada hari tersebut. Guru dapat mengubah status ini melalui menu "Presensi".</li>
                <li>Pastikan data di menu "Pengaturan" (terutama lokasi dan jadwal) sudah sesuai untuk memastikan sistem presensi berjalan akurat.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
