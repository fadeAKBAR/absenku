
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
- **Deployment:** GitHub Pages (Deploy from branch)

---

## Cara Menjalankan & Mempublikasikan Proyek

Ikuti langkah-langkah di bawah ini untuk menjalankan dan mempublikasikan aplikasi Anda di GitHub Pages.

### Langkah 1: Persiapan di Komputer Lokal

1.  **Kloning Repositori**
    Buka terminal Anda dan jalankan perintah berikut setelah Anda membuat repositori baru di GitHub:
    ```bash
    git clone https://[URL_REPOSITORI_GITHUB_ANDA].git
    cd [NAMA_FOLDER_PROYEK]
    ```

2.  **Install Dependensi**
    Install semua library yang dibutuhkan oleh proyek:
    ```bash
    npm install
    ```

3.  **Menjalankan Server Pengembangan**
    Untuk menjalankan aplikasi di komputer lokal Anda (`http://localhost:9002`):
    ```bash
    npm run dev
    ```

### Langkah 2: Proses Build untuk Produksi

Setiap kali Anda selesai melakukan perubahan dan siap untuk mempublikasikannya, jalankan perintah ini di terminal Anda:

```bash
npm run build
```
Perintah ini akan membuat atau memperbarui folder bernama `docs` di proyek Anda. Folder ini berisi versi statis dari aplikasi Anda yang siap untuk diunggah.

### Langkah 3: Unggah ke GitHub

Setelah menjalankan `npm run build`, unggah semua perubahan Anda ke GitHub:

```bash
git add .
git commit -m "Deskripsi perubahan Anda"
git push origin main
```
**Penting:** Folder `docs` sengaja tidak diunggah ke GitHub berkat file `.gitignore`. Proses build hanya perlu dilakukan di komputer lokal Anda sebelum push.

### Langkah 4: Konfigurasi GitHub Pages (Hanya Dilakukan Sekali)

1.  Buka repositori Anda di GitHub.
2.  Klik tab "**Settings**".
3.  Di menu sebelah kiri, klik "**Pages**".
4.  Di bawah bagian "Build and deployment", ubah **Source** menjadi **"Deploy from a branch"**.
5.  Di bawahnya, pada bagian **Branch**, pilih branch `main` dan folder `/docs`. **Ini adalah langkah yang paling penting.**
6.  Klik **Save**.

Tunggu beberapa menit hingga proses deployment selesai. Aplikasi Anda akan aktif dan dapat diakses di URL seperti `https://<NAMA_PENGGUNA_ANDA>.github.io/<NAMA_REPOSITORI_ANDA>/`. Setiap kali Anda melakukan `push` setelah ini, situs akan diperbarui secara otomatis.

