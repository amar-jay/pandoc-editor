export const defaultMarkdown = `# Pandoc Editor
*Just Another Markdown Editor*

Welcome to **Pandoc Editor** -- a feature-packed markdown editor built for writers, researchers, and developers who demand excellence. Born from the power of Pandoc's universal document conversion engine, this editor transforms how you write, edit, and publish content.

> **Why Pandoc Editor?** Because your ideas deserve better than basic text editors. Write once, publish everywhere -- from academic papers to web articles, from technical documentation to beautiful presentations.

## What Makes Us Different

**Built in 2 days**: Yes, you read that right. This editor illustrates the extraordinary skill of current AI based coding assistants. In just 48 hours or less, with the help of GitHub Copilot and V0, we crafted a markdown editor that rivals the best in this space (like Obsidian, Typora, and more).

**Universal Export Engine**: Powered by Pandoc's battle-tested conversion system, export to 40+ formats including PDF, LaTeX, DOCX, HTML, EPUB, and more with professional typography. However, currently, this editor supports only a subset of these formats.

**Live Everything**: Real-time preview, instant math rendering, live diagram generation -- see your ideas come to life as you type.

## Feature Highlights

### Smart Diagrams and Visualizations

Create professional diagrams with simple text. No external tools needed:

\`\`\`mermaid
graph TD
    A[Write] --> B{Visualize}
    B -->|Mermaid| C[Flowcharts]
    B -->|Code| D[Syntax Highlight]
    B -->|Math| E[LaTeX Render]
    C --> F[Export Anywhere]
    D --> F
    E --> F
    F --> G[Professional Output]
\`\`\`

### Academic-Grade Mathematics

Perfect for researchers, students, and technical writers. Full LaTeX support with real-time rendering:

**Inline equations**: The quadratic formula $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$ renders beautifully inline.

**Display equations**: Complex mathematical expressions shine in display mode:

**Gaussian Integral:**
$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

**Basel Problem:**
$$\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}$$

**Euler's Identity:**
$$e^{i\\pi} + 1 = 0$$

**Taylor Series for Exponential Function:**
$$e^x = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!} = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\cdots$$

**Fourier Transform:**
$$\\mathcal{F}\\{f(t)\\}(\\omega) = \\int_{-\\infty}^{\\infty} f(t) e^{-i\\omega t} dt$$

**Maxwell's Equations:**
$$\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\epsilon_0}$$
$$\\nabla \\cdot \\mathbf{B} = 0$$
$$\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}$$
$$\\nabla \\times \\mathbf{B} = \\mu_0\\mathbf{J} + \\mu_0\\epsilon_0\\frac{\\partial \\mathbf{E}}{\\partial t}$$

### Developer-Friendly Code Blocks

Beautiful syntax highlighting for 100+ programming languages:

\`\`\`javascript
// Modern JavaScript with full syntax support
const fibonacci = (n, memo = {}) => {
  if (n in memo) return memo[n];
  if (n <= 2) return 1;
  
  memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
  return memo[n];
};

// Generate sequence
const sequence = Array.from({length: 10}, (_, i) => fibonacci(i + 1));
console.log(\`Fibonacci: \${sequence.join(', ')}\`);
// Output: Fibonacci: 1, 1, 2, 3, 5, 8, 13, 21, 34, 55
\`\`\`

\`\`\`python
import numpy as np
import matplotlib.pyplot as plt

def mandelbrot(c, max_iter):
    z = 0
    for n in range(max_iter):
        if abs(z) > 2:
            return n
        z = z*z + c
    return max_iter

# Create mandelbrot set
width, height = 800, 600
xmin, xmax = -2.5, 1.5
ymin, ymax = -1.5, 1.5

x = np.linspace(xmin, xmax, width)
y = np.linspace(ymin, ymax, height)
X, Y = np.meshgrid(x, y)
C = X + 1j*Y

mandelbrot_set = np.zeros((height, width))
for i in range(height):
    for j in range(width):
        mandelbrot_set[i, j] = mandelbrot(C[i, j], 100)

plt.imshow(mandelbrot_set, extent=[xmin, xmax, ymin, ymax], cmap='hot')
plt.colorbar()
plt.title('Mandelbrot Set')
plt.show()
\`\`\`

### Professional Data Tables

Create publication-ready tables with ease:

| Feature | Status | Impact | Notes |
|---------|--------|--------|-------|
| **Live Preview** | Ready | High | Real-time WYSIWYG rendering |
| **Universal Export** | Ready | High | 40+ formats via Pandoc |
| **LaTeX Math** | Ready | High | Academic-grade equations |
| **Mermaid Diagrams** | Ready | Medium | Flowcharts, sequences, graphs |
| **Vim Mode** | Ready | Medium | Modal editing for power users |
| **Auto-save** | Ready | Low | Never lose your work |

### Writing Experience

- **Focus Mode**: Distraction-free writing environment
- **Smart Themes**: Light, dark, and auto themes that adapt
- **Keyboard First**: Every action has a shortcut
- **Responsive**: Works beautifully on any screen size
- **Smart Search**: Find and replace with regex support
- **File Management**: Built-in file explorer and recent files

## Export Powerhouse

**One Source, Infinite Destinations**: Write in markdown, export to anything:

- **Documents**: PDF, DOCX, ODT, RTF
- **Web**: HTML, EPUB, reveal.js presentations  
- **Academic**: LaTeX, Beamer slides, academic citations
- **Publishing**: Medium, WordPress, static sites
- **Custom**: Templates for branded documents

**Mathematical typesetting** works seamlessly across all formats. Whether you're writing about:

**Statistics and Probability:**
$$P(A|B) = \\frac{P(B|A)P(A)}{P(B)}$$

**Linear Algebra:**
$$\\mathbf{A}\\mathbf{x} = \\lambda\\mathbf{x}$$

**Calculus:**
$$\\frac{d}{dx}\\int_a^x f(t)dt = f(x)$$

**Complex Analysis:**
$$\\oint_C f(z)dz = 2\\pi i \\sum \\text{Res}(f,z_k)$$

## Quick Start Guide

1. **Write**: Use the powerful editor with live preview
2. **Enhance**: Add math, diagrams, and rich formatting  
3. **Export**: Choose from 40+ professional formats
4. **Share**: Publish anywhere with perfect formatting

---

## Perfect For

**Students and Researchers**: Write papers, theses, and reports with proper citations and beautiful math rendering.

From simple algebra to advanced mathematics:

**Schrödinger Equation:**
$$i\\hbar\\frac{\\partial}{\\partial t}\\Psi(\\mathbf{r},t) = \\hat{H}\\Psi(\\mathbf{r},t)$$

**Matrix Operations:**
$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} \\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} ax + by \\\\ cx + dy \\end{pmatrix}$$

**Summation and Products:**
$$\\prod_{k=1}^n k = n! \\quad \\text{and} \\quad \\sum_{k=1}^n k = \\frac{n(n+1)}{2}$$

**Developers**: Document projects with syntax-highlighted code blocks and technical diagrams.

**Writers and Bloggers**: Create content once, publish everywhere with consistent formatting.

**Professionals**: Generate reports, presentations, and documentation with enterprise-grade quality.

---

*Ready to revolutionize your writing workflow? Start typing and experience the difference!*

> **Pro Tip**: Press Ctrl+F to search, Ctrl+/ for shortcuts, and F11 for focus mode. Your productivity journey starts here!
`
