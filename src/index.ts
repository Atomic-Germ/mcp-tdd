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

server.setRequestHandler(CallToolRequestSchema, async (request) => handleTDDTool(request.params));

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