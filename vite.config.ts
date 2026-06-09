import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    target: 'es2020',
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      formats: ['es'],
      fileName: () => 'main.bundle.js'
    },
    rollupOptions: {
      external: ['three'],
      output: {
        globals: { three: 'THREE' },
        inlineDynamicImports: true
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: false, drop_debugger: true }
    }
  }
});
