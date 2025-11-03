# MDX Content Guide - TempaSKill

## Overview

TempaSKill menggunakan **MDX (Markdown + JSX)** untuk lesson content. Ini memberikan flexibilitas menulis content dengan Markdown sambil tetap bisa embed React components.

## Supported Features

### 1. Headings

```markdown
## Heading Level 2

### Heading Level 3

#### Heading Level 4
```

Auto-generated IDs dan anchor links untuk easy navigation.

### 2. Text Formatting

```markdown
**Bold text**
_Italic text_  
**_Bold and italic_**
~~Strikethrough~~
```

### 3. Lists

**Unordered:**

```markdown
- Item 1
- Item 2
  - Nested item
```

**Ordered:**

```markdown
1. First step
2. Second step
3. Third step
```

**Task Lists:**

```markdown
- [x] Completed task
- [ ] Incomplete task
```

### 4. Code Blocks

**Inline code:**

```markdown
Gunakan `const` untuk variable yang tidak berubah.
```

**Code blocks dengan syntax highlighting:**

````markdown
```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}
```
````

Supported languages: `javascript`, `typescript`, `python`, `go`, `html`, `css`, `sql`, `bash`, dll.

### 5. Links

```markdown
[Link text](https://example.com)
[Link dengan title](https://example.com "Hover title")
```

All links open in new tab by default dengan `target="_blank"`.

### 6. Images

```markdown
![Alt text](https://example.com/image.jpg)
![Image dengan title](https://example.com/image.jpg "Image title")
```

### 7. Blockquotes

```markdown
> **Pro Tip**: Ini adalah tips penting untuk diingat.
>
> Bisa multi-line juga.
```

### 8. Tables

```markdown
| Feature       | Figma | Sketch | Adobe XD       |
| ------------- | ----- | ------ | -------------- |
| Collaboration | ✅    | ❌     | ⚠️             |
| Prototyping   | ✅    | ✅     | ✅             |
| Platform      | Web   | Mac    | Cross-platform |
```

### 9. Horizontal Rules

```markdown
---
```

## Styling

Content di-render dengan **Tailwind Typography** (`prose` class) dengan customizations:

- **Headings**: Bold, proper sizing dengan margin
- **Links**: Orange brand color (#ea580c)
- **Code blocks**: Dark theme background (Atom One Dark)
- **Lists**: Proper spacing dan indentation
- **Tables**: Responsive dengan scroll pada mobile

## Writing Best Practices

### 1. Structure Content

```markdown
## Main Topic

Introduction paragraph...

### Subtopic 1

Content for subtopic 1...

### Subtopic 2

Content for subtopic 2...

---

**Summary**: Key takeaways...
```

### 2. Use Code Examples

Selalu include working code examples:

````markdown
## Component Example

```javascript
// Good: Full working example
import React from "react";

function Button({ text, onClick }) {
  return <button onClick={onClick}>{text}</button>;
}

export default Button;
```
````

Explanation of the code...

````

### 3. Add Tips & Warnings

```markdown
> **Pro Tip**: Use descriptive variable names for better code readability.

> ⚠️ **Warning**: Don't forget to validate user input to prevent security issues.
````

### 4. Break Up Long Content

- Use headings untuk break up sections
- Add horizontal rules (`---`) untuk visual separation
- Include images/diagrams untuk visual learning
- Keep paragraphs short (3-5 lines max)

## Converting HTML to MDX

Jika punya existing HTML content:

**HTML:**

```html
<h2>Design Process</h2>
<p>Pelajari:</p>
<ul>
  <li>Low-fidelity wireframes</li>
  <li>High-fidelity mockups</li>
</ul>
```

**MDX:**

```markdown
## Design Process

Pelajari:

- Low-fidelity wireframes
- High-fidelity mockups
```

## Future: Custom Components

MDX supports React components! Planned custom components:

```markdown
<CodePlayground language="javascript">
  const greeting = "Hello, MDX!";
  console.log(greeting);
</CodePlayground>

<Quiz
question="What is MDX?"
options={["Markdown", "Markdown + JSX", "Just HTML"]}
answer={1}
/>

<Tabs>
  <Tab label="JavaScript">
    Code in JavaScript...
  </Tab>
  <Tab label="TypeScript">
    Code in TypeScript...
  </Tab>
</Tabs>
```

## Resources

- [MDX Official Docs](https://mdxjs.com/)
- [GitHub Flavored Markdown](https://github.github.com/gfm/)
- [Tailwind Typography](https://tailwindcss.com/docs/typography-plugin)
- [Highlight.js Languages](https://github.com/highlightjs/highlight.js/blob/main/SUPPORTED_LANGUAGES.md)

## For Instructors

Ketika create lesson content:

1. **Write in Markdown** - Lebih simple dari HTML
2. **Test locally** - Preview content sebelum publish
3. **Use headings** - Structure content dengan proper headings
4. **Add code examples** - Always include runnable examples
5. **Include exercises** - End dengan practice exercises

---

**Happy writing! 🚀**
