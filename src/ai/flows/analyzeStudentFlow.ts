
'use server';
/**
 * @fileOverview An AI agent for analyzing student performance.
 *
 * - analyzeStudent - A function that handles the student analysis process.
 * - AnalyzeStudentInput - The input type for the analyzeStudent function.
 * - AnalyzeStudentOutput - The return type for the analyzeStudent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Student, Rating, Attendance, PointRecord, Category } from '@/lib/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// Schemas mirroring the types from lib/types.ts for Zod validation
const StudentSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  // other fields are not needed for analysis
});

const RatingSchema = z.object({
  date: z.string(),
  ratings: z.record(z.number()),
  average: z.number(),
});

const AttendanceSchema = z.object({
  date: z.string(),
  status: z.enum(['present', 'absent', 'sick', 'permit', 'late', 'no_checkout']),
});

const PointRecordSchema = z.object({
  date: z.string(),
  type: z.enum(['award', 'violation']),
  description: z.string(),
  points: z.number(),
});

const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  isSystem: z.boolean().optional(),
});


const AnalyzeStudentInputSchema = z.object({
  student: StudentSchema,
  ratings: z.array(RatingSchema),
  attendance: z.array(AttendanceSchema),
  pointRecords: z.array(PointRecordSchema),
  categories: z.array(CategorySchema),
  period: z.string().describe("The analysis period, e.g., 'Sebulan Terakhir'"),
});
export type AnalyzeStudentInput = z.infer<typeof AnalyzeStudentInputSchema>;

const AnalyzeStudentOutputSchema = z.object({
  analysis: z.string().describe("The narrative analysis of the student's performance."),
});
export type AnalyzeStudentOutput = z.infer<typeof AnalyzeStudentOutputSchema>;

export async function analyzeStudent(input: AnalyzeStudentInput): Promise<AnalyzeStudentOutput> {
  const llmResponse = await analyzeStudentFlow(input);
  return llmResponse;
}

const analysisPrompt = ai.definePrompt({
    name: 'studentAnalysisPrompt',
    input: { schema: AnalyzeStudentInputSchema },
    output: { schema: AnalyzeStudentOutputSchema },
    prompt: `Anda adalah Asisten Wali Kelas AI yang cerdas dan teliti. Tugas Anda adalah menganalisis data performa seorang siswa dan membuat ringkasan naratif yang objektif, seimbang, dan mudah dipahami. Laporan ini akan digunakan oleh guru untuk rapat dengan orang tua atau untuk mengisi catatan rapor.

    Analisis data untuk siswa bernama {{{student.name}}} untuk periode {{{period}}}.

    Berikut adalah data yang tersedia:
    - **Riwayat Kehadiran:**
      {{#each attendance}}
      - Tanggal: {{this.date}}, Status: {{this.status}}
      {{else}}
      - Tidak ada data kehadiran.
      {{/each}}
      
    - **Riwayat Rating Harian (skala 1-5):**
      {{#each ratings}}
      - Tanggal: {{this.date}}, Rata-rata: {{this.average}}
      {{/each}}
      
    - **Catatan Poin (Penghargaan/Pelanggaran):**
      {{#each pointRecords}}
      - Tanggal: {{this.date}}, Tipe: {{this.type}}, Poin: {{this.points}}, Deskripsi: {{this.description}}
      {{/each}}

    - **Daftar Kategori Penilaian:**
      {{#each categories}}
      - ID: {{this.id}}, Nama: {{this.name}}
      {{/each}}

    **Tugas Anda:**
    1.  **Analisis Kehadiran:** Identifikasi pola kehadiran. Apakah siswa sering terlambat atau alpa? Sebutkan jumlahnya jika signifikan.
    2.  **Analisis Performa Akademik/Sikap (berdasarkan Rating):** Bagaimana tren rata-rata rating hariannya? Identifikasi kategori penilaian yang menjadi kekuatan siswa (sering dapat nilai tinggi) dan kategori yang perlu ditingkatkan (sering dapat nilai rendah).
    3.  **Analisis Poin Insidental:** Rangkum catatan penghargaan dan pelanggaran. Sebutkan contoh konkret dari deskripsi yang ada.
    4.  **Buat Ringkasan Naratif:** Gabungkan semua analisis di atas menjadi sebuah paragraf atau beberapa poin ringkasan yang koheren. Gunakan bahasa yang profesional dan konstruktif. Hindari kalimat yang menghakimi. Fokus pada fakta dari data.

    **Format Output:**
    Mulai laporan dengan "Analisis Performa untuk [Nama Siswa]:". Kemudian lanjutkan dengan analisis Anda dalam format naratif atau poin-poin.
    Pastikan output Anda hanya berisi analisis dalam format string pada field 'analysis'.`,
});

const analyzeStudentFlow = ai.defineFlow(
  {
    name: 'analyzeStudentFlow',
    inputSchema: AnalyzeStudentInputSchema,
    outputSchema: AnalyzeStudentOutputSchema,
  },
  async (input) => {
    // Helper function to get category name from ID
    const getCategoryName = (id: string) => {
        const category = input.categories.find(c => c.id === id);
        return category ? category.name : 'Kategori Tidak Dikenal';
    };

    // Pre-process data to be more readable for the prompt
    const formattedInput = {
        ...input,
        ratings: input.ratings.map(r => ({
            ...r,
            average: parseFloat(r.average.toFixed(2)),
            date: format(new Date(r.date), 'dd MMM yyyy', { locale: id }),
        })),
        attendance: input.attendance.map(a => ({
            ...a,
            date: format(new Date(a.date), 'dd MMM yyyy', { locale: id }),
        })),
        pointRecords: input.pointRecords.map(p => ({
            ...p,
            date: format(new Date(p.date), 'dd MMM yyyy', { locale: id }),
        }))
    };
    
    const { output } = await analysisPrompt(formattedInput);
    return output!;
  }
);
