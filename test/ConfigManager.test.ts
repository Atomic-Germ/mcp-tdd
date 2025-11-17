import { describe, it, expect } from 'vitest';
import { ConfigManager } from '../src/config/index.js';

describe('ConfigManager', () => {
  it('should initialize with default config', () => {
    const config = new ConfigManager();

    expect(config.get('testFramework')).toBe('vitest');
    expect(config.get('language')).toBe('typescript');
    expect(config.get('testDirectory')).toBe('./test');
    expect(config.get('sourceDirectory')).toBe('./src');
  });

  it('should accept custom config', () => {
    const config = new ConfigManager({
      testFramework: 'jest',
      language: 'javascript',
    });

    expect(config.get('testFramework')).toBe('jest');
    expect(config.get('language')).toBe('javascript');
  });

  it('should set and get config values', () => {
    const config = new ConfigManager();

    config.set('testFramework', 'mocha');
    expect(config.get('testFramework')).toBe('mocha');
  });

  it('should return all config', () => {
    const config = new ConfigManager({ testFramework: 'jest' });
    const all = config.getAll();

    expect(all.testFramework).toBe('jest');
    expect(all.language).toBe('typescript');
    expect(all.testDirectory).toBe('./test');
    expect(all.sourceDirectory).toBe('./src');
  });
});
