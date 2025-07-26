export const defaultMarkdown = `# 🚀 Advanced Markdown Editor

Welcome to the most feature-rich markdown editor! This editor includes **syntax highlighting**, **math rendering**, **mermaid diagrams**, and much more.

## ✨ Features Showcase

### 📊 Mermaid Diagrams

\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]
\`\`\`

### 🧮 Mathematical Expressions

The quadratic formula: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

Block equation:
$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

### 💻 Code with Syntax Highlighting

\`\`\`javascript
// Fibonacci sequence generator
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

const fib = fibonacci();
console.log([...Array(10)].map(() => fib.next().value));
// Output: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
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

### 📋 Tables

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Live Preview | ✅ Complete | High | Real-time rendering |
| Syntax Highlighting | ✅ Complete | High | Multiple languages |
| Math Support | ✅ Complete | High | LaTeX rendering |
| Mermaid Diagrams | ✅ Complete | Medium | Flowcharts & more |
| Export Options | ✅ Complete | Medium | HTML, PDF, etc. |
| Auto-save | ✅ Complete | Low | Local storage |
| 📤 **Export**: HTML, PDF, and more
| ⌨️ **Shortcuts**: Keyboard shortcuts for everything
| 🎯 **Focus Mode**: Distraction-free writing

Happy writing! 🎉
`
