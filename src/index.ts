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

      switch (name) {
        case 'tdd_init_cycle':
          result = await handlers.handleInitCycle(args);
          break;
        case 'tdd_write_test':
          result = await handlers.handleWriteTest(args);
          break;
        case 'tdd_run_tests':
          result = await handlers.handleRunTests(args);
          break;
        case 'tdd_implement':
          result = await handlers.handleImplement(args);
          break;
        case 'tdd_refactor':
          result = await handlers.handleRefactor(args);
          break;
        case 'tdd_status':
          result = await handlers.handleStatus();
          break;
        case 'tdd_complete_cycle':
          result = await handlers.handleCompleteCycle(args);
          break;
        case 'tdd_checkpoint':
          result = await handlers.handleCheckpoint(args);
          break;
        case 'tdd_rollback':
          result = await handlers.handleRollback(args);
          break;
        case 'tdd_coverage':
          result = await handlers.handleCoverage();
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
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: errorMessage,
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
