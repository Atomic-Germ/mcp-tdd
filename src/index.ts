import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { listTDDTools, handleTDDTool } from "./tddHandlers.js";
import { initializeState } from "./tddState.js";

const server = new Server({
  name: "mcp-tdd",
  version: "1.0.0",
});

// Expose TDD tools via MCP request handlers
server.setRequestHandler(ListToolsRequestSchema, async () => listTDDTools());

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Normalize arguments - handle cases where arguments might be undefined, null, or empty
  let args: any = request.params.arguments;
  
  // Handle various edge cases
  if (args === undefined || args === null) {
    args = {};
  } else if (typeof args !== 'object' || Array.isArray(args)) {
    // If it's not an object or is an array, use empty object
    console.error(`[WARN] Unexpected arguments type: ${typeof args}, using empty object`);
    args = {};
  }
  
  const params = {
    name: request.params.name,
    arguments: args
  };
  
  // Log for debugging (can be disabled in production)
  if (process.env.TDD_DEBUG) {
    console.error(`[DEBUG] Tool call: ${params.name}, args:`, JSON.stringify(params.arguments));
  }
  
  return handleTDDTool(params);
});

async function main() {
  // Initialize TDD state
  try {
    await initializeState();
    console.error("TDD state initialized");
  } catch (e) {
    console.error("Failed to initialize TDD state:", e);
  }
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP TDD server running on stdio");
}

main().catch(console.error);