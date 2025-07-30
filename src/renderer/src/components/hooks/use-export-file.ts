export const exportToFile = (
  markdown: string,
  currentFileName: string,
  format: 'html' | 'txt' | 'md'
) => {
  let content = ''
  let filename = currentFileName.replace(/\.md$/, '')
  let mimeType = ''

  switch (format) {
    case 'html':
      content = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${filename}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 2rem; 
            line-height: 1.6; 
            color: #333;
        }
        code { 
            background: #f4f4f4; 
            padding: 2px 4px; 
            border-radius: 3px; 
            font-family: 'Courier New', monospace;
        }
        pre { 
            background: #f4f4f4; 
            padding: 1rem; 
            border-radius: 5px; 
            overflow-x: auto; 
        }
        blockquote { 
            border-left: 4px solid #ddd; 
            margin: 0; 
            padding-left: 1rem; 
            color: #666; 
        }
        h1, h2, h3, h4, h5, h6 { color: #2c3e50; }
    </style>
</head>
<body>
    <pre>${markdown.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>`
      filename += '.html'
      mimeType = 'text/html'
      break
    case 'txt':
      content = markdown.replace(/[#*`_~[\]()]/g, '').replace(/\n+/g, '\n')
      filename += '.txt'
      mimeType = 'text/plain'
      break
    default:
      content = markdown
      filename += '.md'
      mimeType = 'text/markdown'
  }

  return {
    content,
    filename,
    mimeType
  }
}
