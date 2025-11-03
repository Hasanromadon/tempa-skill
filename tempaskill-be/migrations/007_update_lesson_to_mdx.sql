-- Update lessons dengan MDX format yang lebih proper
-- Convert dari plain HTML ke Markdown/MDX

-- Lesson 25: Wireframing & Prototyping
UPDATE lessons 
SET content = '## Design Process

Pelajari tahapan dalam proses design dari wireframe hingga prototype interaktif:

### Low-fidelity Wireframes
Sketsa kasar untuk menggambarkan struktur dan layout dasar tanpa detail visual.

### High-fidelity Mockups  
Design visual lengkap dengan warna, typography, dan elemen grafis yang detail.

### Interactive Prototypes
Prototype yang dapat diklik untuk simulasi user flow dan testing UX.

### Tools Recommendation

Berikut adalah tools yang direkomendasikan untuk wireframing dan prototyping:

- **Figma**: Best for collaboration, real-time editing
- **Sketch**: Mac-only, powerful plugins ecosystem  
- **Adobe XD**: Integration dengan Adobe Creative Cloud
- **InVision**: Prototyping dan user testing platform

```javascript
// Example: Simple wireframe component structure
const Wireframe = {
  header: {
    logo: "Logo",
    navigation: ["Home", "About", "Contact"]
  },
  hero: {
    title: "Welcome",
    cta: "Get Started"
  },
  footer: {
    links: ["Privacy", "Terms", "Help"]
  }
};
```

> **Pro Tip**: Mulai dengan low-fidelity wireframes dulu sebelum jump ke mockup detail. Ini membantu validate struktur informasi tanpa distraksi visual.

### Best Practices

1. **Start Simple**: Jangan langsung detail, fokus struktur dulu
2. **Iterate Fast**: Buat banyak variasi dengan cepat  
3. **Get Feedback**: Test prototype dengan real users
4. **Document Decisions**: Catat alasan design choices Anda

---

**Next Steps**: Setelah menguasai wireframing, lanjut ke Design Systems untuk consistency.'
WHERE id = 25;
