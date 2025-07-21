
# GradeWise - Sistem Kredit Poin Siswa

GradeWise adalah aplikasi web modern yang dibangun dengan Next.js untuk membantu guru dan sekolah mengelola kredit poin, rating harian, dan kehadiran siswa secara efisien. Aplikasi ini dilengkapi dengan dasbor terpisah untuk guru dan siswa, dan dirancang untuk dapat di-host secara gratis di GitHub Pages.

Aplikasi ini berjalan sepenuhnya di sisi klien (browser) dan menggunakan **Local Storage** sebagai databasenya. Tidak ada data yang dikirim ke server eksternal, sehingga privasi terjaga.

## Fitur Utama

- **Dasbor Guru:** Mengelola data siswa, kategori penilaian, pengguna (guru), dan pengaturan aplikasi. Input rating harian dan catatan poin insidental.
- **Dasbor Siswa:** Melakukan check-in/check-out presensi berbasis lokasi, melihat riwayat rating, poin, dan kehadiran dalam format tabel dan kalender visual.
- **Papan Peringkat:** Sistem peringkat mingguan untuk memotivasi siswa.
- **Notifikasi Manual WhatsApp:** Guru dapat mengirim notifikasi kehadiran atau rekap mingguan ke orang tua siswa melalui WhatsApp.
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

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi di komputer lokal Anda.

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

## 2. Mempublikasikan Proyek di GitHub Pages (Hosting Gratis)

Proyek ini sudah dikonfigurasi untuk dapat di-hosting secara gratis menggunakan GitHub Pages. Proses deployment terjadi secara otomatis setiap kali Anda melakukan `push` ke branch `main`.

### Langkah-langkah Deployment

1.  **Unggah Proyek ke GitHub**
    Ikuti langkah-langkah di atas untuk menjalankan proyek secara lokal, lalu unggah kode Anda ke repositori GitHub baru.

2.  **Aktifkan GitHub Pages (Hanya perlu dilakukan sekali)**
    - Buka repositori Anda di GitHub.
    - Klik tab "**Settings**".
    - Di menu sebelah kiri, klik "**Pages**".
    - Di bawah "Build and deployment", pada bagian "Source", pilih "**GitHub Actions**".

3.  **Lakukan Push ke Branch `main`**
    Setiap kali Anda melakukan `git push` ke branch `main`, GitHub Actions akan secara otomatis membangun aplikasi Anda dan men-deploy-nya. Anda dapat melihat progresnya di tab "**Actions**" pada repositori Anda.

Setelah proses deployment pertama selesai, aplikasi Anda akan aktif dan dapat diakses di URL seperti `https://<NAMA_PENGGUNA_ANDA>.github.io/<NAMA_REPOSITORI_ANDA>/`.
