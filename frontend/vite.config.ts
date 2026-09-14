import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(rootDir, '..');

const viteConfig = defineConfig(({ mode }) => {
  const env = loadEnv(mode, repoRoot, '');
  const proxyTarget =
    env.VITE_API_PROXY_TARGET ||
    `http://localhost:${env.PORT || '4000'}`;

  return {
    // Load shared repo-root .env (same file as backend)
    envDir: repoRoot,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@app': path.resolve(rootDir, 'src/app'),
        '@pages': path.resolve(rootDir, 'src/pages'),
        '@widgets': path.resolve(rootDir, 'src/widgets'),
        '@features': path.resolve(rootDir, 'src/features'),
        '@entities': path.resolve(rootDir, 'src/entities'),
        '@shared': path.resolve(rootDir, 'src/shared'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});

export default viteConfig;
