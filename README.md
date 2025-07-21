
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

## 1. Menjalankan Proyek Secara Lokal

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi di komputer lokal Anda. Proyek ini **tidak memerlukan kunci API** atau konfigurasi eksternal lainnya.

### Prasyarat

Pastikan Anda telah menginstal perangkat lunak berikut di sistem Anda:
- [Node.js](https://nodejs.org/) (versi 18 atau lebih baru direkomendasikan)
- [Git](https://git-scm.com/downloads)

### Langkah-langkah Instalasi

1.  **Kloning Repositori**
    Buka terminal Anda dan jalankan perintah berikut (ganti dengan URL repositori Anda):
    ```bash
    git clone https://[URL_REPOSITORI_GITHUB_ANDA].git
    cd [NAMA_FOLDER_PROYEK]
    ```

2.  **Instalasi Dependensi**
    Install semua library yang dibutuhkan oleh proyek:
    ```bash
    npm install
    ```

3.  **Menjalankan Aplikasi**
    Setelah semua langkah di atas selesai, Anda dapat menjalankan server pengembangan lokal:
    ```bash
    npm run dev
    ```
    Aplikasi akan berjalan dan dapat diakses di `http://localhost:9002`.

---

## 2. Mempublikasikan Proyek (Hosting Gratis)

Anda dapat mempublikasikan aplikasi ini secara gratis menggunakan Vercel. Proses ini sangat mudah dan tidak memerlukan kartu kredit.

### Prasyarat
- Akun [GitHub](https://github.com) gratis.
- Akun [Vercel](https://vercel.com) gratis (Anda bisa mendaftar menggunakan akun GitHub Anda).

### Langkah-langkah Deployment ke Vercel

1.  **Unggah Proyek ke GitHub**
    Ikuti langkah-langkah di atas untuk menjalankan proyek secara lokal, lalu unggah kode Anda ke repositori GitHub baru.

2.  **Impor Proyek ke Vercel**
    - Login ke dasbor Vercel Anda.
    - Klik "**Add New...**" lalu pilih "**Project**".
    - Vercel akan menampilkan daftar repositori GitHub Anda. Klik "**Import**" pada repositori GradeWise yang telah Anda unggah.

3.  **Konfigurasi dan Deploy**
    - Vercel akan otomatis mendeteksi bahwa ini adalah proyek Next.js dan menampilkan konfigurasi yang benar.
    - Anda **tidak perlu mengubah pengaturan apa pun**.
    - Cukup klik tombol "**Deploy**".

Tunggu beberapa saat hingga proses build selesai. Setelah itu, Vercel akan memberikan Anda URL publik (seperti `nama-proyek-anda.vercel.app`) di mana aplikasi Anda sudah aktif dan bisa diakses oleh siapa saja.
