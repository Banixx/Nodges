import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node', // Für Three.js/Logik-Tests ohne DOM
        setupFiles: './src/tests/setup.ts',
        include: ['src/tests/**/*.{test,spec}.ts'],
        exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.ts'],
            exclude: [
                'node_modules/',
                'src/tests/',
                '**/*.d.ts',
                '**/*.config.*',
                '**/mockData',
                'dist/',
            ],
            thresholds: {
                lines: 15,
                functions: 20,
                branches: 25,
                statements: 15,
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
