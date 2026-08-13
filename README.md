# Kartu Obrolan

Kartu Obrolan adalah aplikasi PWA mobile-first yang membuat pertanyaan percakapan berbasis AI untuk menemani hangout atau nongkrong. Satu kelompok memilih kategori dan kedalaman, lalu aplikasi menyiapkan 10 kartu pertanyaan yang dapat dibaca bersama dari satu ponsel.

## Fitur

- Sesi tanpa akun untuk dua orang atau lebih pemain.
- Lima kategori: ringan, lucu, cerita hidup, reflektif, dan campur.
- Tiga tingkat kedalaman: santai, personal, dan mendalam.
- Paket berisi tepat 10 pertanyaan berbahasa Indonesia.
- Aksi lewati, buat ulang, lanjut, dan coba lagi saat AI gagal.
- Disclosure untuk pertanyaan eksploratif yang mungkin membahas topik dewasa, sensitif, atau kontroversial.
- PWA yang dapat dipasang dengan ikon maskable dan application shell offline.
- Analytics anonim minimal: jumlah sesi, kategori, kedalaman, dan jumlah pertanyaan yang dilewati atau dibuat ulang. Disimpan di localStorage, tanpa data pribadi.
- Tidak menyimpan isi percakapan atau riwayat sesi di server.

> Generasi atau pembuatan ulang pertanyaan tetap membutuhkan koneksi internet karena menggunakan Gemini API.

## Teknologi

- React 19 dan TypeScript
- Vite 8
- Vercel Functions
- Vercel AI SDK dengan Google provider
- Gemini Developer API (`gemini-3.5-flash-lite`)
- Vitest dan Testing Library
- Workbox melalui `vite-plugin-pwa`
- pnpm

## Prasyarat

- Node.js 24 atau lebih baru
- pnpm
- Gemini API key

API key Gemini dapat dibuat melalui [Google AI Studio](https://aistudio.google.com/app/apikey). Gunakan key hanya sebagai environment variable server dan jangan pernah menaruhnya di source code atau mengirimkannya ke browser.

## Menjalankan secara lokal

1. Clone repository dan masuk ke folder proyek.
2. Instal dependensi:

   ```bash
   pnpm install
   ```

3. Salin `.env.example` menjadi `.env.local`, lalu isi key Gemini:

   ```dotenv
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
   ```

4. Jalankan development server:

   ```bash
   pnpm dev
   ```

Vite akan menampilkan alamat lokal aplikasi di terminal.

## Perintah proyek

```bash
pnpm dev                 # Menjalankan development server
pnpm test                # Menjalankan seluruh automated test
pnpm run test:domain     # Menjalankan test domain dan server boundary
pnpm run test:ui         # Menjalankan test antarmuka
pnpm run typecheck       # Memeriksa TypeScript
pnpm run build           # Membuat production build
pnpm run generate:pwa-assets # Membuat ulang seluruh ikon dari favicon.svg
```

Hasil production build tersedia di folder `dist/`.

## Deployment ke Vercel

1. Import repository ini ke Vercel.
2. Tambahkan `GOOGLE_GENERATIVE_AI_API_KEY` sebagai environment variable untuk environment yang digunakan.
3. Gunakan `pnpm build` sebagai build command dan `dist` sebagai output directory bila tidak terdeteksi otomatis.
4. Deploy aplikasi.

Endpoint serverless tersedia di:

- `POST /api/questions` untuk membuat satu paket pertanyaan.
- `POST /api/question-replacement` untuk mengganti kartu aktif.

## Privasi dan batasan produk

- Tidak ada akun atau login.
- Tidak ada riwayat percakapan yang disimpan di server.
- Isi pertanyaan yang sedang dimainkan hanya hidup di state aplikasi selama sesi aktif.
- API menerima kategori, kedalaman, dan daftar pertanyaan aktif hanya ketika penggantian kartu diperlukan.
- API key Gemini hanya boleh tersedia di environment server.
- Tidak ada fallback pertanyaan statis ketika AI tidak tersedia; kegagalan selalu ditampilkan dengan opsi pemulihan.

## Struktur penting

```text
api/                 Vercel Functions
public/              Ikon dan aset PWA
src/                  Antarmuka, domain, dan AI boundary
test/                 Automated tests
docs/adr/             Keputusan arsitektur
.scratch/             Spesifikasi dan ticket implementasi lokal
```

Detail domain tersedia di [`CONTEXT.md`](./CONTEXT.md), prinsip produk di [`PRODUCT.md`](./PRODUCT.md), dan design system di [`DESIGN.md`](./DESIGN.md).

## Status

MVP selesai. Alur inti pembuatan dan penggunaan paket pertanyaan, pemulihan kegagalan AI, pengalaman PWA, dan analytics anonim minimal sudah tersedia dan terverifikasi.
