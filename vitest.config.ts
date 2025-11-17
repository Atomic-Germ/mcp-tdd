import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test file patterns
    include: ['**/*.test.ts', '**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
    
    // Environment setup
    environment: 'node',
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        }
      },
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/**/*.test.ts']
    },
    
    // Test timeout
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Globals for easier testing
    globals: true,
    
    // Reporter configuration
    reporters: ['default', 'json'],
    
    // Watch mode configuration
    watch: false,
    
    // Pool options for parallel execution
    pool: 'threads',
    
    // Setup files
    setupFiles: []
  }
});