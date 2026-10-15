import { defineConfig } from 'vite'

// Keep JSX modules explicit about the React namespace so components can use
// React.useState as well as named React imports.
export default defineConfig({
  plugins: [
    {
      name: 'react-namespace-compat',
      enforce: 'pre',
      transform(code, id) {
        if (id.endsWith('.jsx') && code.includes('React.')) {
          return `import * as React from 'react';\n${code}`
        }
      },
    },
  ],
})
