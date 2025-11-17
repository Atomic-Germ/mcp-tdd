import { TDDConfig } from '../types/index.js';

export const DEFAULT_CONFIG: Required<TDDConfig> = {
  testFramework: 'vitest',
  language: 'typescript',
  testDirectory: './test',
  sourceDirectory: './src',
};

export class ConfigManager {
  private config: Required<TDDConfig>;

  constructor(config: TDDConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  get<K extends keyof TDDConfig>(key: K): Required<TDDConfig>[K] {
    return this.config[key];
  }

  set<K extends keyof TDDConfig>(key: K, value: Required<TDDConfig>[K]): void {
    this.config[key] = value;
  }

  getAll(): Required<TDDConfig> {
    return { ...this.config };
  }
}
