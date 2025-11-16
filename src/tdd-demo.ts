import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";

async function main() {
  const transport = new StdioClientTransport({
    command: "node",
    args: ["dist/index.js"],
  });

  const client = new Client({ name: "tdd-demo-client", version: "1.0.0" });

  try {
    console.log("🚀 Connecting to MCP TDD server...\n");
    await client.connect(transport);
    console.log("✅ Connected!\n");

    // List available tools
    const toolsRes = await client.listTools();
    console.log("📋 Available TDD Tools:");
    for (const t of toolsRes.tools || []) {
      console.log(`   - ${t.name}`);
    }
    console.log("\n");

    // Step 1: Initialize TDD Cycle
    console.log("=".repeat(60));
    console.log("STEP 1: Initialize TDD Cycle");
    console.log("=".repeat(60));
    const initResult = await client.callTool({
      name: "tdd_init_cycle",
      arguments: {
        feature: "email-validator",
        description: "Create an email validation function with comprehensive tests",
        testFramework: "jest",
        language: "typescript"
      }
    }, CallToolResultSchema);
    
    if (initResult.content) {
      console.log((initResult.content as any)[0].text);
    }
    console.log("\n");

    // Step 2: Check initial status
    console.log("=".repeat(60));
    console.log("STEP 2: Check Initial Status");
    console.log("=".repeat(60));
    const status1 = await client.callTool({
      name: "tdd_status",
      arguments: {}
    }, CallToolResultSchema);
    
    if (status1.content) {
      console.log((status1.content as any)[0].text);
    }
    console.log("\n");

    // Step 3: Write first test (RED phase)
    console.log("=".repeat(60));
    console.log("STEP 3: Write Test - Valid Email (RED Phase)");
    console.log("=".repeat(60));
    const writeTest1 = await client.callTool({
      name: "tdd_write_test",
      arguments: {
        testFile: "src/validators/email.test.ts",
        testName: "should return true for valid email addresses",
        testCode: `
describe('validateEmail', () => {
  test('should return true for valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test.user@domain.co.uk')).toBe(true);
    expect(validateEmail('name+tag@example.org')).toBe(true);
  });
});`,
        expectedToFail: true,
        category: "unit"
      }
    }, CallToolResultSchema);
    
    if (writeTest1.content) {
      console.log((writeTest1.content as any)[0].text);
    }
    console.log("\n");

    // Step 4: Write second test
    console.log("=".repeat(60));
    console.log("STEP 4: Write Test - Invalid Email (RED Phase)");
    console.log("=".repeat(60));
    const writeTest2 = await client.callTool({
      name: "tdd_write_test",
      arguments: {
        testFile: "src/validators/email.test.ts",
        testName: "should return false for invalid email addresses",
        testCode: `
  test('should return false for invalid email addresses', () => {
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('missing@domain')).toBe(false);
    expect(validateEmail('@nodomain.com')).toBe(false);
    expect(validateEmail('no-at-sign.com')).toBe(false);
  });`,
        expectedToFail: true,
        category: "unit"
      }
    }, CallToolResultSchema);
    
    if (writeTest2.content) {
      console.log((writeTest2.content as any)[0].text);
    }
    console.log("\n");

    // Step 5: Implement the validation function (GREEN phase)
    console.log("=".repeat(60));
    console.log("STEP 5: Implement Email Validator (GREEN Phase)");
    console.log("=".repeat(60));
    const implement = await client.callTool({
      name: "tdd_implement",
      arguments: {
        implementationFile: "src/validators/email.ts",
        code: `
/**
 * Validates email addresses using a comprehensive regex pattern
 * @param email - The email address to validate
 * @returns true if valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email.trim());
}`,
        testsCovered: [
          "should return true for valid email addresses",
          "should return false for invalid email addresses"
        ],
        minimal: true
      }
    }, CallToolResultSchema);
    
    if (implement.content) {
      console.log((implement.content as any)[0].text);
    }
    console.log("\n");

    // Step 6: Create checkpoint before completing
    console.log("=".repeat(60));
    console.log("STEP 6: Create Checkpoint");
    console.log("=".repeat(60));
    const checkpoint = await client.callTool({
      name: "tdd_checkpoint",
      arguments: {
        checkpointName: "email-validator-complete",
        reason: "Safe point after completing email validation"
      }
    }, CallToolResultSchema);
    
    if (checkpoint.content) {
      console.log((checkpoint.content as any)[0].text);
    }
    console.log("\n");

    // Step 7: Check final status
    console.log("=".repeat(60));
    console.log("STEP 7: Final Status Check");
    console.log("=".repeat(60));
    const status2 = await client.callTool({
      name: "tdd_status",
      arguments: {}
    }, CallToolResultSchema);
    
    if (status2.content) {
      console.log((status2.content as any)[0].text);
    }
    console.log("\n");

    // Step 8: Compare approaches (demonstration)
    console.log("=".repeat(60));
    console.log("STEP 8: Compare Implementation Approaches");
    console.log("=".repeat(60));
    const compare = await client.callTool({
      name: "tdd_compare_approaches",
      arguments: {
        approaches: [
          "Use simple regex pattern for email validation",
          "Use a library like validator.js for comprehensive validation",
          "Implement custom parser with detailed error messages"
        ],
        criteria: ["simplicity", "testability", "maintainability", "accuracy"],
        useConsult: false
      }
    }, CallToolResultSchema);
    
    if (compare.content) {
      console.log((compare.content as any)[0].text);
    }
    console.log("\n");

    // Step 9: Complete the cycle
    console.log("=".repeat(60));
    console.log("STEP 9: Complete TDD Cycle");
    console.log("=".repeat(60));
    const complete = await client.callTool({
      name: "tdd_complete_cycle",
      arguments: {
        summary: "Implemented email validation with regex pattern matching",
        testsAdded: 2,
        testsPassing: 2,
        notes: "Basic email validation complete. Consider adding more edge cases in future iterations."
      }
    }, CallToolResultSchema);
    
    if (complete.content) {
      console.log((complete.content as any)[0].text);
    }
    console.log("\n");

    console.log("=".repeat(60));
    console.log("🎉 TDD DEMO COMPLETE!");
    console.log("=".repeat(60));
    console.log("\nThis demo showed the complete RED-GREEN-REFACTOR cycle:");
    console.log("  ✓ Initialize cycle");
    console.log("  ✓ Write failing tests (RED)");
    console.log("  ✓ Implement minimal code (GREEN)");
    console.log("  ✓ Create checkpoints");
    console.log("  ✓ Compare approaches");
    console.log("  ✓ Complete cycle");
    console.log("\nThe MCP TDD server guides AI models through proper TDD methodology!");

  } catch (error) {
    console.error("❌ Error during demo:", error);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
