# KODA AI Coding Agent CLI (`koda`)

**KODA AI Coding Agent** adalah agentic coding CLI otonom berbasis terminal yang terintegrasi langsung dengan ekosistem **KODA PRD Builder & Editor** (`/app`).

Dirancang untuk merealisasikan konsep **Spec-Driven Development**: mengubah ide kasar dan dokumen Product Requirements Document (PRD) menjadi aplikasi nyata secara otonom, presisi, dan terverifikasi.

---

## ⚡ Fitur Utama

- **🔐 Otentikasi Browser Google (`koda login`)**:
  - Tampilan visual Braille/Dot-matrix futuristik di terminal (mirip Grok & Antigravity).
  - Membuka halaman otorisasi browser secara otomatis (`/auth/cli`) menggunakan *RFC 8252 Loopback Flow*.
  - Login dengan Google, konfirmasi akses, dan terminal akan otomatis login secara instan tanpa perlu menyalin token secara manual (dilengkapi fallback kode manual).
- **🔗 Hubungan Langsung ke Ekosistem PRD (`koda link`)**:
  - Hubungkan direktori kerja lokal dengan dokumen PRD di KODA Web / Supabase Database melalui ID atau URL.
  - Membaca daftar PRD terbaru di cloud secara interaktif.
- **📥 Tarik Spesifikasi Terkini (`koda pull`)**:
  - Men-download spesifikasi PRD lengkap (user stories, database schema, REST API contracts, edge cases) ke `.koda/specs.md` sebagai *Single Source of Truth*.
- **📋 Rencana Kerja Otonom (`koda plan`)**:
  - Menganalisis PRD dan codebase lokal untuk menyusun checklist tahapan implementasi ke `.koda/plan.md`.
- **🔄 Sinkronisasi Dua Arah (`koda sync`)**:
  - Mengirimkan laporan progress, status tugas selesai, atau catatan review dari terminal langsung ke panel komentar KODA Web PRD Editor secara real-time.
- **🤖 Manajemen AI Model Provider (`koda model`)**:
  - Mendukung Google Gemini (Flash-Lite Waterfall), DeepSeek, OpenAI, Groq (Llama 3.3), dan Ollama lokal.
- **🩺 Diagnosis Kesehatan Sistem (`koda doctor`)**:
  - Memeriksa status login, sesi AI provider, API keys, konektivitas cloud Supabase, dan git repository.
- **🛠️ Agentic Tool Suite Lengkap (Mirip Antigravity & Claude Code)**:
  - `view_file`: Membaca file dengan penomoran baris.
  - `write_to_file`: Menulis file baru.
  - `replace_file_content`: Pengeditan kode bedah presisi tinggi dengan preview unified diff berwarna.
  - `run_command`: Eksekusi terminal bash (test, build, lint, git) dengan perlindungan perintah destruktif.
  - `grep_search` & `find_by_name`: Pencarian cepat di seluruh file project.
  - `fetch_prd_spec` & `sync_prd_progress`: Akses PRD dan sinkronisasi komentar tim.

---

## 🚀 Penggunaan CLI

Binary CLI `koda` telah terinstal di `~/.local/bin/koda` dan dapat langsung dipanggil dari direktori mana saja:

```bash
# 1. Login dengan Google via browser
koda login

# 2. Cek status akun yang aktif
koda whoami

# 3. Periksa kesehatan sistem & konektivitas
koda doctor

# 4. Menghubungkan project ke PRD KODA
koda link
# Atau dengan ID dokumen spesifik:
koda link doc-app-1794589290637

# 5. Tarik update terbaru dari PRD
koda pull

# 6. Buat rencana kerja implementasi (.koda/plan.md)
koda plan

# 7. Memulai sesi interaktif dengan AI Agent
koda

# 8. Menjalankan task instruksi langsung
koda run "buatkan skema database supabase untuk produk dan pesanan"

# 9. Kirim progress ke PRD Editor web
koda sync "Berhasil mengimplementasikan otentikasi JWT dan middleware"

# 10. Konfigurasi model AI (Gemini, DeepSeek, OpenAI, Groq)
koda model

# 11. Keluar dari akun KODA
koda logout
```

---

## 💬 Slash Commands dalam Sesi Interaktif

Saat berada dalam sesi interaktif `koda`:
- `/specs`  : Menampilkan ringkasan spesifikasi PRD yang terhubung.
- `/plan`   : Menampilkan atau memperbarui checklist `.koda/plan.md`.
- `/pull`   : Menarik spesifikasi terbaru dari KODA cloud.
- `/sync`   : Mengirim catatan progress ke KODA Web Editor.
- `/login`  : Masuk dengan akun Google / KODA Web.
- `/whoami` : Menampilkan informasi profil akun aktif.
- `/doctor` : Memeriksa kesehatan sistem dan AI engine.
- `/clear`  : Membersihkan riwayat percakapan.
- `/exit`   : Keluar dari CLI.
