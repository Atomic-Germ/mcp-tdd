import { describe, it, expect } from 'vitest';
import { TDDServer } from '../src/server.js';

describe('TDDServer', () => {
  it('should initialize with default config', () => {
    const server = new TDDServer();

    expect(server.name).toBe('mcp-tdd');
    expect(server.version).toBe('2.0.0');
    expect(server.config.testFramework).toBe('vitest');
    expect(server.config.language).toBe('typescript');
  });

  it('should accept custom config', () => {
    const server = new TDDServer({
      testFramework: 'jest',
      language: 'javascript',
    });

    expect(server.config.testFramework).toBe('jest');
    expect(server.config.language).toBe('javascript');
  });

  it('should return server info', () => {
    const server = new TDDServer();
    const info = server.getServerInfo();

    expect(info.name).toBe('mcp-tdd');
    expect(info.version).toBe('2.0.0');
    expect(info.protocolVersion).toBe('2024-11-05');
  });

  it('should list all TDD tools', () => {
    const server = new TDDServer();
    const tools = server.listTools();

    expect(tools).toBeInstanceOf(Array);
    expect(tools.length).toBeGreaterThan(0);

    const toolNames = tools.map(t => t.name);
    expect(toolNames).toContain('tdd_init_cycle');
    expect(toolNames).toContain('tdd_write_test');
    expect(toolNames).toContain('tdd_run_tests');
    expect(toolNames).toContain('tdd_implement');
    expect(toolNames).toContain('tdd_refactor');
    expect(toolNames).toContain('tdd_status');
    expect(toolNames).toContain('tdd_complete_cycle');
    expect(toolNames).toContain('tdd_get_failure_details');
  });

  it('should have proper tool schemas', () => {
    const server = new TDDServer();
    const tools = server.listTools();

    const initTool = tools.find(t => t.name === 'tdd_init_cycle');
    expect(initTool).toBeDefined();
    expect(initTool?.inputSchema.type).toBe('object');
    expect(initTool?.inputSchema.required).toContain('feature');
    expect(initTool?.inputSchema.required).toContain('description');
  });
});
