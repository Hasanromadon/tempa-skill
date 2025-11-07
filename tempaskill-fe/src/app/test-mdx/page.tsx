"use client";

import { MDXContent } from "@/components/mdx";

// Test content showcasing all MDX components
const testContent = `# TempaSkill MDX Components Test

Ini adalah konten test untuk memverifikasi semua komponen MDX berfungsi dengan baik.

## Callout Components

<Callout type="info" title="Informasi Penting">
  Ini adalah callout dengan tipe info. Cocok untuk informasi penting yang perlu diperhatikan siswa.
</Callout>

<Callout type="warning">
  Ini adalah callout warning tanpa title. Gunakan untuk peringatan penting.
</Callout>

<Callout type="success" title="Berhasil!">
  Operasi berhasil diselesaikan dengan baik.
</Callout>

<Callout type="error" title="Error">
  Terjadi kesalahan dalam proses ini.
</Callout>

<Callout type="tip">
  Tip berguna untuk meningkatkan produktivitas Anda.
</Callout>

## Tabs Component

<Tabs>
  <Tab label="Konsep Dasar">
    Konten untuk tab pertama - Konsep Dasar Programming
  </Tab>
  <Tab label="Contoh Kode">
    Konten untuk tab kedua - Berisi contoh kode praktis
  </Tab>
  <Tab label="Latihan">
    Konten untuk tab ketiga - Latihan dan soal-soal
  </Tab>
</Tabs>

## Quiz Component

<Quiz
  question="Apa itu JavaScript?"
  options={[
    { text: "Bahasa pemrograman untuk styling web", isCorrect: false },
    { text: "Bahasa pemrograman untuk membuat halaman web interaktif", isCorrect: true },
    { text: "Bahasa pemrograman untuk database", isCorrect: false },
    { text: "Bahasa markup untuk struktur web", isCorrect: false }
  ]}
  explanation="JavaScript adalah bahasa pemrograman yang digunakan untuk membuat halaman web menjadi interaktif dan dinamis."
/>

## CodeBlock Component

<CodeBlock language="javascript" title="Contoh Fungsi JavaScript">
function greetUser(name) {
  return \`Hello, \${name}!\`;
}

console.log(greetUser("World"));
</CodeBlock>

<CodeBlock language="python">
def calculate_sum(a, b):
    """Menghitung jumlah dua angka"""
    return a + b

result = calculate_sum(5, 3)
print(f"Hasil: {result}")
</CodeBlock>

## Regular Markdown Elements

### Lists
- Item pertama
- Item kedua
- Item ketiga

### Links
[Kunjungi TempaSkill](https://tempaskill.com)

### Images
![Logo TempaSkill](https://example.com/logo.png)

### Tables

| Fitur | Status | Keterangan |
|-------|--------|------------|
| MDX Editor | ✅ | Lengkap dengan live preview |
| Custom Components | ✅ | Callout, Tabs, Quiz, CodeBlock |
| Authentication | 🔄 | Dalam pengembangan |
| Progress Tracking | 🔄 | Dalam pengembangan |

> **Catatan**: Semua komponen MDX telah berhasil diintegrasikan dan siap digunakan untuk membuat konten kursus yang interaktif dan menarik.`;

export default function MDXTestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">MDX Components Test</h1>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <MDXContent content={testContent} />
      </div>
    </div>
  );
}
