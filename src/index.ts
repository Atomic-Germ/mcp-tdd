#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { TDDServer } from './server.js';
import { TDDStateManager } from './services/TDDStateManager.js';
import { TestRunner } from './services/TestRunner.js';
import { TDDToolHandlers } from './handlers/TDDToolHandlers.js';

async function main() {
  const tddServer = new TDDServer();
  const stateManager = new TDDStateManager();
  const testRunner = new TestRunner();
  const handlers = new TDDToolHandlers(stateManager, testRunner);

  const server = new Server({
    name: tddServer.name,
    version: tddServer.version,
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools = tddServer.listTools();
    return { tools };
  });

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;

    try {
      let result: string;

      // Ensure args is always an object (handle null/undefined from client)
      const safeArgs = args || {};

      switch (name) {
        case 'tdd_init_cycle':
          result = await handlers.handleInitCycle(safeArgs);
          break;
        case 'tdd_write_test':
          result = await handlers.handleWriteTest(safeArgs);
          break;
        case 'tdd_run_tests':
          result = await handlers.handleRunTests(safeArgs);
          break;
        case 'tdd_implement':
          result = await handlers.handleImplement(safeArgs);
          break;
        case 'tdd_refactor':
          result = await handlers.handleRefactor(safeArgs);
          break;
        case 'tdd_status':
          result = await handlers.handleStatus(safeArgs);
          break;
        case 'tdd_complete_cycle':
          result = await handlers.handleCompleteCycle(safeArgs);
          break;
        case 'tdd_checkpoint':
          result = await handlers.handleCheckpoint(safeArgs);
          break;
        case 'tdd_rollback':
          result = await handlers.handleRollback(safeArgs);
          break;
        case 'tdd_coverage':
          result = await handlers.handleCoverage(safeArgs);
          break;
        case 'tdd_get_failure_details':
          result = await handlers.handleGetFailureDetails(safeArgs);
          break;
        case 'tdd_analyze_test_quality':
          result = await handlers.handleAnalyzeTestQuality(safeArgs);
          break;
        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Provide helpful guidance for common issues
      let guidance = '';
      if (errorMessage.includes('JSON') || errorMessage.includes('parse')) {
        guidance =
          "\n\nNote: If you called a tool with no required arguments (like tdd_status or tdd_get_failure_details), this may be a client-side JSON serialization issue. Try calling tdd_run_tests instead to get cycle status, or ensure you're passing valid JSON arguments (even if empty: {}).";
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: errorMessage,
                guidance: guidance || undefined,
                hint: "If you're stuck, try: 1) tdd_run_tests to get status, 2) tdd_write_test for RED phase, 3) tdd_implement for GREEN phase",
              },
              null,
              2,
            ),
          },
        ],
        isError: true,
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('MCP TDD server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
