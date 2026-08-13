---
name: Kartu Obrolan
description: Pemantik obrolan yang akrab, spontan, dan berani untuk hangout bersama.
colors:
  violet-table: "oklch(0.4 0.15 270)"
  violet-table-active: "oklch(0.33 0.13 270)"
  violet-mist: "oklch(0.965 0.008 270)"
  violet-line: "oklch(0.82 0.045 270)"
  ink: "oklch(0.19 0.025 270)"
  muted-ink: "oklch(0.43 0.025 270)"
  paper: "oklch(1 0 0)"
  conversation-amber: "oklch(0.84 0.14 80)"
  conversation-amber-active: "oklch(0.79 0.15 75)"
  error-blush: "oklch(0.94 0.025 25)"
typography:
  display:
    fontFamily: "Plus Jakarta Sans Variable, Segoe UI, sans-serif"
    fontSize: "3.5rem"
    fontWeight: 780
    lineHeight: 0.97
    letterSpacing: "-0.035em"
  display-compact:
    fontFamily: "Plus Jakarta Sans Variable, Segoe UI, sans-serif"
    fontSize: "3rem"
    fontWeight: 780
    lineHeight: 0.97
    letterSpacing: "-0.035em"
  question:
    fontFamily: "Plus Jakarta Sans Variable, Segoe UI, sans-serif"
    fontSize: "2rem"
    fontWeight: 780
    lineHeight: 1.25
    letterSpacing: "-0.03em"
  question-compact:
    fontFamily: "Plus Jakarta Sans Variable, Segoe UI, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 780
    lineHeight: 1.25
    letterSpacing: "-0.03em"
  question-wide:
    fontFamily: "Plus Jakarta Sans Variable, Segoe UI, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 780
    lineHeight: 1.25
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Plus Jakarta Sans Variable, Segoe UI, sans-serif"
    fontSize: "2rem"
    fontWeight: 760
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Plus Jakarta Sans Variable, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  body-strong:
    fontFamily: "Plus Jakarta Sans Variable, Segoe UI, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 700
    lineHeight: 1.4
  title:
    fontFamily: "Plus Jakarta Sans Variable, Segoe UI, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 760
    lineHeight: 1.25
  subtitle:
    fontFamily: "Plus Jakarta Sans Variable, Segoe UI, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 760
    lineHeight: 1.3
  label:
    fontFamily: "Plus Jakarta Sans Variable, Segoe UI, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.2
  caption:
    fontFamily: "Plus Jakarta Sans Variable, Segoe UI, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
  micro:
    fontFamily: "Plus Jakarta Sans Variable, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.45
rounded:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  pill: "999px"
spacing:
  2xs: "0.25rem"
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  2xl: "3rem"
  3xl: "4rem"
components:
  button-primary:
    backgroundColor: "{colors.conversation-amber}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0.875rem 1.25rem"
    height: "3.5rem"
  button-primary-hover:
    backgroundColor: "{colors.conversation-amber-active}"
    textColor: "{colors.ink}"
  button-secondary:
    backgroundColor: "{colors.violet-table}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0.875rem 1.25rem"
    height: "3.5rem"
  chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.muted-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.625rem 1rem"
    height: "2.75rem"
  chip-selected:
    backgroundColor: "{colors.violet-table}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
---

# Design System: Kartu Obrolan

## Overview

**Creative North Star: "Meja Tengah"**

Bayangkan satu ponsel diletakkan di tengah meja saat sekelompok teman nongkrong: layar harus langsung terbaca dari beberapa sudut, mengundang satu tindakan utama, lalu menghilang dari perhatian ketika percakapan dimulai. Bidang violet yang tegas memberi energi sosial, permukaan putih menjaga keputusan tetap tenang, dan amber menandai momen untuk bergerak.

Sistem terasa akrab, spontan, dan berani melalui komposisi yang kontras, bahasa natural, dan target sentuh besar. Ia menolak permainan pesta anak-anak, SaaS korporat yang dingin, serta pengalaman tarot atau mistis gelap. Pada desktop, produk tetap disajikan sebagai satu bingkai ponsel selebar 30rem karena konteks utamanya adalah satu perangkat yang dilihat bersama.

**Key Characteristics:**

- Satu keputusan utama yang jelas pada setiap layar.
- Pertanyaan menjadi pusat perhatian tanpa dekorasi yang bersaing.
- Bidang warna tegas, geometri meja melingkar, dan kartu garis tipis.
- Target sentuh minimal 44×44 px serta layout tanpa overflow pada 320–430 px.
- Motion hanya menjelaskan perubahan keadaan dalam 180 ms dan berhenti saat reduced motion aktif.

## Colors

Palet memakai violet tinta sebagai meja visual, amber hangat sebagai ajakan bertindak, serta putih dan violet kabut untuk menjaga ritme tetap dewasa dan terbaca.

### Primary

- **Violet Meja:** bidang merek utama, header pengaturan, pilihan aktif, dan layar pertanyaan.
- **Violet Meja Dalam:** kondisi aktif dan bidang pertanyaan dengan kontras paling kuat.

### Secondary

- **Amber Percakapan:** CTA utama, progres aktif, dan focus ring; pemakaiannya langka agar selalu bermakna.
- **Amber Percakapan Aktif:** respons hover atau active pada CTA amber.

### Neutral

- **Kertas:** permukaan utama dan tinta terbalik di atas violet.
- **Kabut Violet:** latar desktop, pilihan aktif yang lembut, dan bidang netral dingin.
- **Garis Violet:** border pilihan, garis dekoratif, serta teks sekunder di atas violet.
- **Tinta:** teks utama di atas permukaan terang.
- **Tinta Redup:** body copy dan keterangan sekunder.
- **Blush Error:** bidang kegagalan yang terasa jelas tanpa alarm visual berlebihan.

**The Committed Color Rule.** Violet membawa 30–60% permukaan pada momen identitas; pada layar utilitarian, ia hanya menandai struktur dan status.

**The Amber Means Go Rule.** Amber hanya untuk tindakan utama, progres aktif, atau fokus keyboard. Jangan menggunakannya sebagai dekorasi.

## Typography

**Display Font:** Plus Jakarta Sans Variable (dengan Segoe UI dan sans-serif sebagai fallback)  
**Body Font:** Plus Jakarta Sans Variable (dengan Segoe UI dan sans-serif sebagai fallback)  
**Label Font:** Plus Jakarta Sans Variable (dengan Segoe UI dan sans-serif sebagai fallback)

**Character:** Satu sans-serif humanis memberi suara yang hangat dan jelas ketika ponsel berpindah tangan. Bobot 700–780 membangun keyakinan; body copy tetap ringan dan lapang.

### Hierarchy

- **Display** (780, 3.5rem, 0.97): nama produk pada layar awal; varian compact 3rem dipakai pada layar sempit atau pendek.
- **Question** (780, 2rem, 1.25): pertanyaan utama, maksimal sekitar 19 karakter per baris visual; varian compact 1.75rem dan wide 2.25rem menjaga keterbacaan lintas viewport.
- **Headline** (760, 2rem, 1.15): keputusan utama seperti pemilihan topik.
- **Title** (760, 1.125–1.5rem, 1.25–1.3): judul kelompok pilihan, loading, dan error.
- **Body** (400, 1–1.0625rem, 1.4–1.6): penjelasan singkat dengan lebar ideal maksimal 65–75 karakter.
- **Label** (700, 0.875rem, 1.2): tombol, chip, status, dan navigasi; selalu sentence case.
- **Caption** (400–650, 0.75–0.8125rem, 1.45–1.5): metadata dan bantuan singkat yang tetap kontras.

**The Shared-Table Rule.** Pertanyaan ditulis langsung untuk semua pemain dan mudah dipahami dari satu meja, bukan sebagai instruksi untuk seorang pembaca.

**The One Voice Rule.** Jangan menambah keluarga font kedua; karakter dibentuk oleh bobot, skala, dan ritme.

## Elevation

Sistem datar secara default. Kedalaman dibangun melalui pergantian bidang warna, border, dan pergeseran 1 px pada interaksi. Satu-satunya bayangan adalah bayangan struktural pendek pada bingkai aplikasi desktop; tidak ada glassmorphism atau bayangan ambient lebar.

### Shadow Vocabulary

- **Bingkai Desktop** (`0 4px 8px color-mix(in oklch, var(--color-ink) 16%, transparent)`): memisahkan bingkai ponsel 30rem dari latar desktop, hanya mulai breakpoint 720 px.

**The Flat-By-Default Rule.** Permukaan diam tetap datar. Hierarki utama harus tetap terbaca ketika seluruh bayangan dihapus.

## Components

Komponen terasa taktil dan percaya diri: bentuknya sederhana, targetnya besar, dan setiap state memiliki perubahan warna atau posisi yang jelas.

### Buttons

- **Shape:** sudut lunak yang tegas (0.75rem), tinggi minimal 3.5rem, padding 0.875rem × 1.25rem.
- **Primary:** amber dengan tinta gelap; selalu selebar kontainer pada tindakan utama.
- **Secondary:** violet dengan teks putih untuk pemulihan dari error.
- **Hover / Focus:** naik 1 px saat hover, turun 1 px saat active, dan focus ring amber 3 px dengan offset 3 px.

### Chips

- **Style:** pill setinggi minimal 2.75rem, border Garis Violet 1 px, teks Tinta Redup.
- **State:** pilihan aktif menjadi bidang Violet Meja dengan teks putih; fokus tetap memakai ring amber.

### Cards / Containers

- **Corner Style:** sudut 0.75rem untuk pilihan kedalaman dan maksimal 1rem untuk bingkai atau kartu dekoratif.
- **Background:** putih saat idle, Kabut Violet saat terpilih.
- **Shadow Strategy:** tanpa bayangan; status dipisahkan oleh border dan warna permukaan.
- **Internal Padding:** 1rem, dengan jarak antarkartu 0.75rem.

### Inputs / Fields

- **Style:** radio native disembunyikan secara visual tetapi tetap menjadi kontrol semantik; seluruh label 44 px menjadi target sentuh.
- **Focus:** ring amber 3 px dan offset 2 px pada label pembungkus.
- **Selected:** border Violet Meja; radio kedalaman menampilkan titik isi selain perubahan warna.

### Navigation

- **Style:** tombol kembali dan akhiri sesi mengubah konteks; `Lewati` dan `Buat ulang` menjadi tindakan sekunder pada kartu aktif. Semuanya memakai label teks, tinggi minimal 2.75rem, dan tidak bersaing dengan CTA utama.
- **Loading:** selama `Buat ulang` berlangsung, seluruh tindakan kartu dinonaktifkan dan label berubah menjadi `Membuat ulang…` agar paket tidak berpindah di tengah permintaan.

### Recovery States

- **Initial generation:** tampil sebagai layar error tersendiri dengan `Coba lagi` sebagai CTA amber dan `Ubah pengaturan` sebagai tindakan sekunder. Pilihan kategori dan kedalaman tetap tersimpan di perangkat.
- **Regeneration:** tampil inline di bawah kartu agar pertanyaan, posisi, dan paket aktif tidak hilang. Pesan menjelaskan bahwa kartu saat ini tetap aman dan menyediakan `Coba lagi`.
- **No silent fallback:** kegagalan transport dan respons AI invalid memakai recovery yang sama; keduanya tidak pernah diganti pertanyaan statis.

### Table Mark

Tanda meja adalah geometri khas produk: satu lingkaran terbuka, tiga titik orang, dan dua kartu bertumpuk. Ia dibuat dengan CSS, satu warna, tanpa maskot atau ilustrasi dekoratif.

### Question Stage

Pertanyaan tampil langsung di atas bidang Violet Meja Dalam, dikelilingi satu ring amber terputus dan dua outline kartu. Ornamen tetap berada di belakang teks dan tidak boleh mengurangi keterbacaan. Header menampilkan posisi numerik dan rel progres 10 langkah; saat kartu berubah, fokus berpindah ke pertanyaan agar perubahan juga terbaca oleh teknologi bantu.

## Do's and Don'ts

### Do:

- **Do** pusatkan satu pertanyaan atau satu keputusan utama per layar.
- **Do** pertahankan CTA utama setinggi 3.5rem dan seluruh target interaktif minimal 44×44 px.
- **Do** uji setiap perubahan pada lebar 320 px, 390 px, dan bingkai desktop 30rem.
- **Do** gunakan Violet Meja secara committed dan Amber Percakapan hanya untuk maju, progres, atau fokus.
- **Do** gunakan label sederhana dalam Bahasa Indonesia dan hormati `prefers-reduced-motion`.

### Don't:

- **Don't** membuat antarmuka seperti permainan pesta anak-anak dengan warna pelangi, emoji, maskot, poin, confetti, atau dekorasi berlebihan.
- **Don't** membuatnya terasa seperti perangkat lunak SaaS korporat yang dingin dan formal.
- **Don't** membuat pengalaman tarot dan mistis gelap yang membuat pertanyaan terasa mengintimidasi.
- **Don't** memakai gradient text, glassmorphism, radius di atas 1rem, atau border tipis yang dipasangkan dengan bayangan lebar.
- **Don't** memakai motion dekoratif, entrance sequence, bounce, atau status yang hanya dibedakan lewat warna.
