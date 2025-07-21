
# GradeWise - Sistem Kredit Poin Siswa

GradeWise adalah aplikasi web modern yang dibangun dengan Next.js untuk membantu guru dan sekolah mengelola kredit poin, rating harian, dan kehadiran siswa secara efisien. Aplikasi ini dilengkapi dengan dasbor terpisah untuk guru dan siswa, dan dirancang untuk dapat di-host secara gratis tanpa memerlukan kartu kredit.

## Fitur Utama

- **Dasbor Guru:** Mengelola data siswa, kategori penilaian, pengguna (guru), dan pengaturan aplikasi. Input rating harian dan catatan poin insidental.
- **Dasbor Siswa:** Melakukan check-in/check-out presensi berbasis lokasi, melihat riwayat rating, poin, dan kehadiran dalam format tabel dan kalender visual.
- **Papan Peringkat:** Sistem peringkat mingguan untuk memotivasi siswa.
- **Notifikasi Manual WhatsApp:** Guru dapat mengirim notifikasi kehadiran atau rekap mingguan ke orang tua siswa melalui WhatsApp dengan template yang dapat disesuaikan.
- **Pendaftaran Perangkat:** Mencegah titip absen dengan mendaftarkan perangkat siswa pada check-in pertama.

## Teknologi yang Digunakan

- **Framework:** Next.js (App Router)
- **Bahasa:** TypeScript
- **Styling:** Tailwind CSS, ShadCN/UI
- **Manajemen Form:** React Hook Form, Zod
- **Visualisasi Data:** Recharts
- **Penyimpanan Data:** Local Storage (Sisi Klien)

---

## Memulai Proyek Secara Lokal

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi di komputer lokal Anda. Proyek ini **tidak memerlukan kunci API** atau konfigurasi eksternal lainnya.

### 1. Prasyarat

Pastikan Anda telah menginstal perangkat lunak berikut di sistem Anda:
- [Node.js](https://nodejs.org/) (versi 18 atau lebih baru direkomendasikan)
- npm (terinstal otomatis bersama Node.js)
- Git

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

### 4. Menjalankan Aplikasi

Setelah semua langkah di atas selesai, Anda dapat menjalankan server pengembangan lokal:

```bash
npm run dev
```

Aplikasi akan berjalan dan dapat diakses di `http://localhost:9002` (atau port lain jika 9002 sudah digunakan). Semuanya sudah siap! Tidak ada langkah konfigurasi tambahan yang diperlukan.
