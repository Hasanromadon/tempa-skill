"use client";

import { MDXContent } from "@/components/mdx";

// Test content showcasing all MDX components
const testContent = `# TempaSkill MDX Components Test

Ini adalah konten test untuk memverifikasi semua komponen MDX berfungsi dengan baik.

## Basic Markdown

Ini adalah **teks tebal** dan ini adalah *teks miring*.

### Lists
- Item pertama
- Item kedua
- Item ketiga

### Code Block

\`\`\`javascript
function greetUser(name) {
  return "Hello, " + name + "!";
}

console.log(greetUser("World"));
\`\`\`

## Callout Component

<Callout type="info">
  Ini adalah callout dengan tipe info. Cocok untuk informasi penting.
</Callout>

<Callout type="warning">
  Ini adalah callout dengan tipe warning. Untuk peringatan penting.
</Callout>

## Tabs Component

<Tabs>
  <Tab label="Konsep Dasar">
    Konten untuk tab pertama - Konsep Dasar Programming
  </Tab>
  <Tab label="Contoh Kode">
    Konten untuk tab kedua - Berisi contoh kode praktis
  </Tab>
</Tabs>

## Quiz Component

<MDXQuiz
  question="Apa itu JavaScript?"
  option1="Bahasa pemrograman untuk styling web"
  option2="Bahasa pemrograman untuk membuat halaman web interaktif"
  option3="Bahasa pemrograman untuk database"
  option4="Bahasa markup untuk struktur web"
  correctAnswer={2}
  explanation="JavaScript adalah bahasa pemrograman yang digunakan untuk membuat halaman web menjadi interaktif dan dinamis."
/>

### Links
[Kunjungi TempaSkill](https://tempaskill.com)

> **Catatan**: Komponen MDX telah berhasil diintegrasikan.`;

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
