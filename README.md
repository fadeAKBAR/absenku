# GradeWise - Sistem Kredit Poin Siswa Berbasis AI

GradeWise adalah aplikasi web modern yang dibangun dengan Next.js untuk membantu guru dan sekolah mengelola kredit poin, rating harian, dan kehadiran siswa secara efisien. Aplikasi ini dilengkapi dengan dasbor terpisah untuk guru dan siswa, serta memanfaatkan kekuatan AI (melalui Google Gemini & Genkit) untuk memberikan analisis performa siswa secara naratif.

## Fitur Utama

- **Dasbor Guru:** Mengelola data siswa, kategori penilaian, pengguna (guru), dan pengaturan aplikasi. Input rating harian dan catatan poin insidental.
- **Dasbor Siswa:** Melakukan check-in/check-out presensi berbasis lokasi, melihat riwayat rating, poin, dan kehadiran dalam format tabel dan kalender visual.
- **Papan Peringkat:** Sistem peringkat mingguan untuk memotivasi siswa.
- **Notifikasi Manual WhatsApp:** Guru dapat mengirim notifikasi kehadiran atau rekap mingguan ke orang tua siswa melalui WhatsApp dengan template yang dapat disesuaikan.
- **Analisis AI "Asisten Wali Kelas":** Memberikan ringkasan naratif tentang performa siswa berdasarkan data historis, membantu guru dalam membuat laporan atau berkomunikasi dengan orang tua.
- **Pendaftaran Perangkat:** Mencegah titip absen dengan mendaftarkan perangkat siswa pada check-in pertama.

## Teknologi yang Digunakan

- **Framework:** Next.js (App Router)
- **Bahasa:** TypeScript
- **Styling:** Tailwind CSS, ShadCN/UI
- **Manajemen Form:** React Hook Form, Zod
- **AI:** Google Gemini, Genkit
- **Visualisasi Data:** Recharts

---

## Memulai Proyek Secara Lokal

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi di komputer lokal Anda.

### 1. Prasyarat

Pastikan Anda telah menginstal perangkat lunak berikut di sistem Anda:
- [Node.js](https://nodejs.org/) (versi 18 atau lebih baru)
- npm atau package manager lain (yarn, pnpm)

### 2. Kloning Repositori

Kloning repositori ini ke mesin lokal Anda menggunakan git:

```bash
git clone https://[URL_REPOSITORI_GITHUB_ANDA].git
cd [NAMA_FOLDER_PROYEK]
```

### 3. Instalasi Dependensi

Install semua library dan paket yang dibutuhkan oleh proyek dengan menjalankan perintah berikut di terminal dari dalam direktori proyek:

```bash
npm install
```

### 4. Konfigurasi Environment Variable

Proyek ini memerlukan API Key dari Google Gemini untuk menjalankan fitur AI.

1.  Salin file `.env.local.example` menjadi file baru bernama `.env.local`:
    ```bash
    cp .env.local.example .env.local
    ```
2.  Buka file `.env.local` yang baru dibuat.
3.  Dapatkan API Key Anda dari [Google AI Studio](https://aistudio.google.com/app/apikey).
4.  Ganti `KUNCI_API_GEMINI_ANDA` dengan API Key yang telah Anda dapatkan.

```plaintext
# .env.local
GEMINI_API_KEY=KUNCI_API_GEMINI_ANDA
```

### 5. Menjalankan Aplikasi

Setelah semua langkah di atas selesai, Anda dapat menjalankan server pengembangan lokal:

```bash
npm run dev
```

Aplikasi akan berjalan dan dapat diakses di `http://localhost:9002` (atau port lain jika 9002 sudah digunakan).

### 6. Menjalankan Genkit Developer UI (Opsional)

Genkit memiliki UI pengembangan sendiri untuk melihat, menguji, dan melacak alur AI Anda. Untuk menjalankannya, buka terminal kedua dan jalankan:

```bash
npm run genkit:dev
```

UI Genkit akan tersedia di `http://localhost:4000`.
