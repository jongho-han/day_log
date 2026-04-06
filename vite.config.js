import dotenvExpand from 'dotenv-expand';
import { loadEnv, defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  if (mode === 'development') {
    const env = loadEnv(mode, process.cwd(), '');
    dotenvExpand.expand({ parsed: env });
  }

  return {
    server: {
      proxy: {
        '/api': 'http://localhost:3001'
      }
    }
  };
});
