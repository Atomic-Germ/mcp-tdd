// TDD Handlers - implements all TDD tools
import axios from 'axios';
import {
  TDDCycle,
  TDDTest,
  Implementation,
  Refactoring,
  Checkpoint,
  TDDStatus,
  CycleCompletion,
  ConsultRequest,
  ConsultResponse,
  ApproachComparison,
  Approach
} from './tddTypes.js';
import {
  getActiveCycle,
  setActiveCycle,
  updateCycle,
  addTest,
  getTestsByCycle,
  addImplementation,
  getImplementationsByCycle,
  addRefactoring,
  getRefactoringsByCycle,
  addCheckpoint,
  getCheckpoint,
  getCheckpointsByCycle,
  clearActiveCycle,
  getConfig,
  generateId,
  saveState
} from './tddState.js';
import {
  runTests,
  writeFile,
  fileExists,
  validatePhaseTransition,
  determineNextAction,
  createCheckpointSnapshot,
  restoreCheckpointSnapshot
} from './tddUtils.js';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

export function listTDDTools() {
  return {
    tools: [
      {
        name: 'tdd_init_cycle',
        description: 'Initialize a new TDD cycle for a feature or bug fix. This starts the TDD workflow.',
        inputSchema: {
          type: 'object',
          properties: {
            feature: { type: 'string', description: 'Feature name or bug ID' },
            description: { type: 'string', description: 'What you are building' },
            testFramework: { type: 'string', description: 'Test framework (jest, vitest, mocha, etc.)' },
            language: { type: 'string', description: 'Programming language (typescript, javascript, python, etc.)' },
            files: { type: 'array', items: { type: 'string' }, description: 'Files involved in this cycle' }
          },
          required: ['feature', 'description']
        }
      },
      {
        name: 'tdd_write_test',
        description: 'Create or update test cases (RED phase). Tests should be written BEFORE implementation.',
        inputSchema: {
          type: 'object',
          properties: {
            testFile: { type: 'string', description: 'Path to test file' },
            testName: { type: 'string', description: 'Descriptive test name' },
            testCode: { type: 'string', description: 'Test implementation code' },
            expectedToFail: { type: 'boolean', description: 'Should be true for RED phase' },
            category: { type: 'string', enum: ['unit', 'integration', 'e2e'], description: 'Test category' }
          },
          required: ['testFile', 'testName', 'testCode', 'expectedToFail']
        }
      },
      {
        name: 'tdd_run_tests',
        description: 'Execute tests and validate current phase. Use expectation to verify RED or GREEN phase.',
        inputSchema: {
          type: 'object',
          properties: {
            testPattern: { type: 'string', description: 'Specific tests to run (optional, default: all)' },
            expectation: { type: 'string', enum: ['fail', 'pass'], description: 'Expected outcome: fail (RED) or pass (GREEN)' },
            coverage: { type: 'boolean', description: 'Include coverage report' }
          },
          required: ['expectation']
        }
      },
      {
        name: 'tdd_implement',
        description: 'Write implementation code (GREEN phase). Only write code to make failing tests pass.',
        inputSchema: {
          type: 'object',
          properties: {
            implementationFile: { type: 'string', description: 'Path to implementation file' },
            code: { type: 'string', description: 'Implementation code' },
            testsCovered: { type: 'array', items: { type: 'string' }, description: 'Test names this code addresses' },
            minimal: { type: 'boolean', description: 'Enforce minimal implementation (default: true)' }
          },
          required: ['implementationFile', 'code', 'testsCovered']
        }
      },
      {
        name: 'tdd_refactor',
        description: 'Improve code quality while maintaining tests (REFACTOR phase). All tests must continue passing.',
        inputSchema: {
          type: 'object',
          properties: {
            file: { type: 'string', description: 'File to refactor' },
            changes: { type: 'string', description: 'Description of refactoring' },
            code: { type: 'string', description: 'Refactored code' },
            maintainTests: { type: 'boolean', description: 'Must be true' },
            autoTest: { type: 'boolean', description: 'Run tests after refactoring (default: true)' }
          },
          required: ['file', 'changes', 'code', 'maintainTests']
        }
      },
      {
        name: 'tdd_status',
        description: 'Get current TDD cycle status and next recommended action. Use this frequently to stay oriented.',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'tdd_complete_cycle',
        description: 'Finalize current TDD cycle. All tests must be passing.',
        inputSchema: {
          type: 'object',
          properties: {
            summary: { type: 'string', description: 'What was accomplished' },
            testsAdded: { type: 'number', description: 'Number of new tests' },
            testsPassing: { type: 'number', description: 'Total passing tests' },
            notes: { type: 'string', description: 'Additional observations' }
          },
          required: ['summary', 'testsAdded', 'testsPassing']
        }
      },
      {
        name: 'tdd_consult',
        description: 'Consult mcp-consult (Ollama models) for complex design decisions. Requires Ollama to be running.',
        inputSchema: {
          type: 'object',
          properties: {
            question: { type: 'string', description: 'Design question or problem' },
            context: { 
              type: 'object', 
              description: 'Current TDD cycle context',
              properties: {
                cycleId: { type: 'string' },
                phase: { type: 'string' },
                language: { type: 'string' },
                testFramework: { type: 'string' }
              }
            },
            model: { type: 'string', description: 'Specific Ollama model (optional)' },
            expectation: { type: 'string', description: 'What kind of answer you need' }
          },
          required: ['question', 'context']
        }
      },
      {
        name: 'tdd_checkpoint',
        description: 'Save current state for potential rollback. Creates a snapshot of all files.',
        inputSchema: {
          type: 'object',
          properties: {
            checkpointName: { type: 'string', description: 'Descriptive name' },
            reason: { type: 'string', description: 'Why creating checkpoint' }
          },
          required: ['checkpointName']
        }
      },
      {
        name: 'tdd_rollback',
        description: 'Restore to previous checkpoint. This will revert all files to the checkpoint state.',
        inputSchema: {
          type: 'object',
          properties: {
            checkpointId: { type: 'string', description: 'Checkpoint to restore' }
          },
          required: ['checkpointId']
        }
      },
      {
        name: 'tdd_coverage',
        description: 'Analyze test coverage metrics. Shows detailed coverage report.',
        inputSchema: {
          type: 'object',
          properties: {
            files: { type: 'array', items: { type: 'string' }, description: 'Specific files to analyze' },
            threshold: { type: 'number', description: 'Minimum coverage percentage' }
          }
        }
      },
      {
        name: 'tdd_compare_approaches',
        description: 'Compare multiple implementation strategies. Helps decide between alternatives.',
        inputSchema: {
          type: 'object',
          properties: {
            approaches: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'Array of approach descriptions' 
            },
            criteria: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'Evaluation criteria (e.g., testability, complexity, maintainability)' 
            },
            useConsult: { type: 'boolean', description: 'Leverage mcp-consult for analysis' }
          },
          required: ['approaches', 'criteria']
        }
      }
    ]
  };
}

export async function handleTDDTool(params: { name: string; arguments?: any }): Promise<any> {
  const name = params.name;
  const args = params.arguments || {};

  try {
    switch (name) {
      case 'tdd_init_cycle':
        return await handleInitCycle(args);
      case 'tdd_write_test':
        return await handleWriteTest(args);
      case 'tdd_run_tests':
        return await handleRunTests(args);
      case 'tdd_implement':
        return await handleImplement(args);
      case 'tdd_refactor':
        return await handleRefactor(args);
      case 'tdd_status':
        return await handleStatus(args);
      case 'tdd_complete_cycle':
        return await handleCompleteCycle(args);
      case 'tdd_consult':
        return await handleConsult(args);
      case 'tdd_checkpoint':
        return await handleCheckpoint(args);
      case 'tdd_rollback':
        return await handleRollback(args);
      case 'tdd_coverage':
        return await handleCoverage(args);
      case 'tdd_compare_approaches':
        return await handleCompareApproaches(args);
      default:
        throw new Error(`Unknown TDD tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `Error in ${name}: ${error.message}`
      }],
      isError: true
    };
  }
}

async function handleInitCycle(args: any): Promise<any> {
  const config = getConfig();
  
  const cycle: TDDCycle = {
    id: generateId('cycle'),
    feature: args.feature,
    description: args.description,
    testFramework: args.testFramework || config.testFramework,
    language: args.language || config.language,
    files: args.files || [],
    phase: 'READY',
    createdAt: new Date(),
    updatedAt: new Date(),
    testsWritten: 0,
    testsPassing: 0,
    testsFailing: 0,
    implementations: [],
    refactorings: []
  };
  
  setActiveCycle(cycle);
  await saveState();
  
  return {
    content: [{
      type: 'text',
      text: `✅ TDD Cycle initialized!\n\n` +
            `**Cycle ID**: ${cycle.id}\n` +
            `**Feature**: ${cycle.feature}\n` +
            `**Description**: ${cycle.description}\n` +
            `**Framework**: ${cycle.testFramework}\n` +
            `**Language**: ${cycle.language}\n` +
            `**Phase**: ${cycle.phase}\n\n` +
            `**Next Action**: ${determineNextAction(cycle.phase, 0, 0)}`
    }]
  };
}

async function handleWriteTest(args: any): Promise<any> {
  const cycle = getActiveCycle();
  if (!cycle) {
    return {
      content: [{
        type: 'text',
        text: '❌ No active TDD cycle. Start one with tdd_init_cycle first.'
      }],
      isError: true
    };
  }
  
  const test: TDDTest = {
    id: generateId('test'),
    cycleId: cycle.id,
    testFile: args.testFile,
    testName: args.testName,
    testCode: args.testCode,
    category: args.category || 'unit',
    expectedToFail: args.expectedToFail,
    status: 'pending',
    createdAt: new Date()
  };
  
  // Write test to file
  try {
    const existingContent = await fileExists(args.testFile) 
      ? (await import('fs/promises')).readFile(args.testFile, 'utf-8')
      : '';
    
    const newContent = existingContent 
      ? `${existingContent}\n\n${args.testCode}`
      : args.testCode;
    
    await writeFile(args.testFile, newContent);
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ Failed to write test file: ${error.message}`
      }],
      isError: true
    };
  }
  
  addTest(test);
  updateCycle(cycle.id, {
    testsWritten: cycle.testsWritten + 1,
    phase: 'RED'
  });
  await saveState();
  
  return {
    content: [{
      type: 'text',
      text: `✅ Test written!\n\n` +
            `**Test**: ${test.testName}\n` +
            `**File**: ${test.testFile}\n` +
            `**Category**: ${test.category}\n` +
            `**Expected to Fail**: ${test.expectedToFail}\n\n` +
            `**Phase**: RED (tests should fail)\n` +
            `**Next Action**: Run tests with tdd_run_tests to verify they fail`
    }]
  };
}

async function handleRunTests(args: any): Promise<any> {
  const cycle = getActiveCycle();
  if (!cycle) {
    return {
      content: [{
        type: 'text',
        text: '⚠️ No active cycle, but running tests anyway...'
      }]
    };
  }
  
  const result = await runTests(args.testPattern, args.coverage || false);
  
  // Validate expectation
  const expectation = args.expectation;
  const actualOutcome = result.testsFailed > 0 ? 'fail' : 'pass';
  const expectationMet = expectation === actualOutcome;
  
  let phaseUpdate = cycle.phase;
  if (expectationMet) {
    if (expectation === 'fail' && cycle.phase === 'RED') {
      phaseUpdate = 'RED'; // Stay in RED, ready to implement
    } else if (expectation === 'pass' && result.testsFailed === 0) {
      phaseUpdate = 'GREEN'; // All tests pass!
    }
  }
  
  updateCycle(cycle.id, {
    testsPassing: result.testsPassed,
    testsFailing: result.testsFailed,
    phase: phaseUpdate
  });
  await saveState();
  
  let statusIcon = expectationMet ? '✅' : '⚠️';
  let message = `${statusIcon} Tests ${actualOutcome === 'fail' ? 'failed' : 'passed'} ${expectationMet ? '(as expected)' : '(unexpected!)'}\n\n`;
  
  message += `**Tests Run**: ${result.testsRun}\n`;
  message += `**Passed**: ${result.testsPassed}\n`;
  message += `**Failed**: ${result.testsFailed}\n`;
  message += `**Skipped**: ${result.testsSkipped}\n`;
  message += `**Duration**: ${result.duration}ms\n`;
  message += `**Phase**: ${phaseUpdate}\n\n`;
  
  if (!expectationMet) {
    message += `⚠️ **Warning**: Expected tests to ${expectation} but they ${actualOutcome}ed!\n\n`;
  }
  
  if (result.failures && result.failures.length > 0) {
    message += `**Failures**:\n`;
    result.failures.forEach(f => {
      message += `- ${f.testName}: ${f.error}\n`;
    });
    message += '\n';
  }
  
  if (result.coverage) {
    message += `**Coverage**:\n`;
    message += `- Lines: ${result.coverage.lines.percentage.toFixed(1)}%\n`;
    message += `- Branches: ${result.coverage.branches.percentage.toFixed(1)}%\n`;
    message += `- Functions: ${result.coverage.functions.percentage.toFixed(1)}%\n\n`;
  }
  
  message += `**Next Action**: ${determineNextAction(phaseUpdate, result.testsFailed, result.testsPassed)}`;
  
  return {
    content: [{
      type: 'text',
      text: message
    }]
  };
}

async function handleImplement(args: any): Promise<any> {
  const cycle = getActiveCycle();
  if (!cycle) {
    return {
      content: [{
        type: 'text',
        text: '❌ No active TDD cycle. Start one with tdd_init_cycle first.'
      }],
      isError: true
    };
  }
  
  // Check if we're in the right phase
  const config = getConfig();
  if (config.strictMode && cycle.testsFailing === 0) {
    return {
      content: [{
        type: 'text',
        text: '❌ Cannot implement without failing tests! Write tests first (RED phase).'
      }],
      isError: true
    };
  }
  
  const implementation: Implementation = {
    id: generateId('impl'),
    cycleId: cycle.id,
    implementationFile: args.implementationFile,
    code: args.code,
    testsCovered: args.testsCovered || [],
    minimal: args.minimal !== false,
    createdAt: new Date(),
    verified: false
  };
  
  try {
    await writeFile(args.implementationFile, args.code);
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ Failed to write implementation: ${error.message}`
      }],
      isError: true
    };
  }
  
  addImplementation(implementation);
  updateCycle(cycle.id, {
    implementations: [...cycle.implementations, args.implementationFile]
  });
  await saveState();
  
  return {
    content: [{
      type: 'text',
      text: `✅ Implementation written!\n\n` +
            `**File**: ${implementation.implementationFile}\n` +
            `**Tests Covered**: ${implementation.testsCovered.join(', ')}\n` +
            `**Minimal**: ${implementation.minimal}\n\n` +
            `**Phase**: GREEN (verify tests pass)\n` +
            `**Next Action**: Run tests with tdd_run_tests expectation=pass to verify implementation`
    }]
  };
}

async function handleRefactor(args: any): Promise<any> {
  const cycle = getActiveCycle();
  if (!cycle) {
    return {
      content: [{
        type: 'text',
        text: '❌ No active TDD cycle. Start one with tdd_init_cycle first.'
      }],
      isError: true
    };
  }
  
  if (!args.maintainTests) {
    return {
      content: [{
        type: 'text',
        text: '❌ maintainTests must be true. Refactoring must not break tests.'
      }],
      isError: true
    };
  }
  
  // Validate we can refactor
  const validation = validatePhaseTransition(cycle.phase, 'REFACTOR', cycle.testsFailing, cycle.testsPassing);
  if (!validation.valid) {
    return {
      content: [{
        type: 'text',
        text: `❌ ${validation.error}`
      }],
      isError: true
    };
  }
  
  // Run tests before refactoring
  const testsBefore = await runTests();
  
  const refactoring: Refactoring = {
    id: generateId('refactor'),
    cycleId: cycle.id,
    file: args.file,
    changes: args.changes,
    testsBefore,
    createdAt: new Date(),
    success: false
  };
  
  try {
    await writeFile(args.file, args.code);
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ Failed to write refactored code: ${error.message}`
      }],
      isError: true
    };
  }
  
  // Run tests after refactoring if autoTest is enabled
  if (args.autoTest !== false) {
    const testsAfter = await runTests();
    refactoring.testsAfter = testsAfter;
    refactoring.success = testsAfter.success && testsAfter.testsFailed === 0;
    
    if (!refactoring.success) {
      return {
        content: [{
          type: 'text',
          text: `❌ Refactoring broke tests!\n\n` +
                `**Before**: ${testsBefore.testsPassed} passed, ${testsBefore.testsFailed} failed\n` +
                `**After**: ${testsAfter.testsPassed} passed, ${testsAfter.testsFailed} failed\n\n` +
                `**Recommendation**: Use tdd_rollback to revert, or fix the issues.`
        }],
        isError: true
      };
    }
  }
  
  addRefactoring(refactoring);
  updateCycle(cycle.id, {
    refactorings: [...cycle.refactorings, args.file],
    phase: 'REFACTOR'
  });
  await saveState();
  
  return {
    content: [{
      type: 'text',
      text: `✅ Refactoring complete!\n\n` +
            `**File**: ${refactoring.file}\n` +
            `**Changes**: ${refactoring.changes}\n` +
            `**Tests Before**: ${testsBefore.testsPassed} passed, ${testsBefore.testsFailed} failed\n` +
            `**Tests After**: ${refactoring.testsAfter?.testsPassed || 0} passed, ${refactoring.testsAfter?.testsFailed || 0} failed\n` +
            `**Success**: ${refactoring.success}\n\n` +
            `**Next Action**: ${determineNextAction('REFACTOR', cycle.testsFailing, cycle.testsPassing)}`
    }]
  };
}

async function handleStatus(args: any): Promise<any> {
  const cycle = getActiveCycle();
  
  if (!cycle) {
    return {
      content: [{
        type: 'text',
        text: '📊 **TDD Status**\n\n' +
              '**No Active Cycle**\n\n' +
              'Start a new TDD cycle with `tdd_init_cycle`'
      }]
    };
  }
  
  const tests = getTestsByCycle(cycle.id);
  const implementations = getImplementationsByCycle(cycle.id);
  const refactorings = getRefactoringsByCycle(cycle.id);
  const duration = Date.now() - new Date(cycle.createdAt).getTime();
  
  const status: TDDStatus = {
    cycleId: cycle.id,
    feature: cycle.feature,
    phase: cycle.phase,
    testsWritten: cycle.testsWritten,
    testsPassing: cycle.testsPassing,
    testsFailing: cycle.testsFailing,
    nextAction: determineNextAction(cycle.phase, cycle.testsFailing, cycle.testsPassing),
    cycleDuration: duration,
    filesModified: [...new Set([...cycle.implementations, ...cycle.refactorings])],
    canProceed: true,
    warnings: []
  };
  
  // Add warnings
  if (cycle.phase === 'GREEN' && cycle.testsFailing > 0) {
    status.warnings?.push('Tests are still failing in GREEN phase');
  }
  
  let message = `📊 **TDD Status**\n\n`;
  message += `**Cycle**: ${status.feature} (${status.cycleId})\n`;
  message += `**Phase**: ${status.phase}\n`;
  message += `**Duration**: ${Math.floor(status.cycleDuration / 1000)}s\n\n`;
  
  message += `**Tests**:\n`;
  message += `- Written: ${status.testsWritten}\n`;
  message += `- Passing: ${status.testsPassing} ✅\n`;
  message += `- Failing: ${status.testsFailing} ${status.testsFailing > 0 ? '❌' : ''}\n\n`;
  
  message += `**Implementations**: ${implementations.length}\n`;
  message += `**Refactorings**: ${refactorings.length}\n\n`;
  
  if (status.filesModified.length > 0) {
    message += `**Files Modified**:\n${status.filesModified.map(f => `- ${f}`).join('\n')}\n\n`;
  }
  
  if (status.warnings && status.warnings.length > 0) {
    message += `**Warnings**:\n${status.warnings.map(w => `⚠️ ${w}`).join('\n')}\n\n`;
  }
  
  message += `**Next Action**: ${status.nextAction}`;
  
  return {
    content: [{
      type: 'text',
      text: message
    }]
  };
}

async function handleCompleteCycle(args: any): Promise<any> {
  const cycle = getActiveCycle();
  if (!cycle) {
    return {
      content: [{
        type: 'text',
        text: '❌ No active TDD cycle to complete.'
      }],
      isError: true
    };
  }
  
  // Validate we can complete
  const validation = validatePhaseTransition(cycle.phase, 'COMPLETE', cycle.testsFailing, cycle.testsPassing);
  if (!validation.valid) {
    return {
      content: [{
        type: 'text',
        text: `❌ ${validation.error}`
      }],
      isError: true
    };
  }
  
  const duration = Date.now() - new Date(cycle.createdAt).getTime();
  const implementations = getImplementationsByCycle(cycle.id);
  const refactorings = getRefactoringsByCycle(cycle.id);
  
  const completion: CycleCompletion = {
    cycleId: cycle.id,
    summary: args.summary,
    testsAdded: args.testsAdded,
    testsPassing: args.testsPassing,
    implementationsCount: implementations.length,
    refactoringsCount: refactorings.length,
    duration,
    filesModified: [...new Set([...cycle.implementations, ...cycle.refactorings])],
    success: true
  };
  
  updateCycle(cycle.id, {
    phase: 'COMPLETE'
  });
  clearActiveCycle();
  await saveState();
  
  return {
    content: [{
      type: 'text',
      text: `🎉 **TDD Cycle Complete!**\n\n` +
            `**Feature**: ${cycle.feature}\n` +
            `**Summary**: ${completion.summary}\n\n` +
            `**Metrics**:\n` +
            `- Tests Added: ${completion.testsAdded}\n` +
            `- Tests Passing: ${completion.testsPassing}\n` +
            `- Implementations: ${completion.implementationsCount}\n` +
            `- Refactorings: ${completion.refactoringsCount}\n` +
            `- Duration: ${Math.floor(completion.duration / 1000)}s\n\n` +
            `**Files Modified**: ${completion.filesModified.length}\n` +
            `${completion.filesModified.map(f => `- ${f}`).join('\n')}\n\n` +
            `${args.notes ? `**Notes**: ${args.notes}\n\n` : ''}` +
            `Ready to start a new cycle with \`tdd_init_cycle\`!`
    }]
  };
}

async function handleConsult(args: any): Promise<any> {
  const question = args.question;
  const context = args.context || {};
  const model = args.model || 'llama2';
  
  const cycle = context.cycleId ? getActiveCycle() : undefined;
  
  // Build context-aware prompt
  let prompt = question;
  if (cycle) {
    prompt = `Context: TDD Cycle for "${cycle.feature}"\n` +
             `Phase: ${cycle.phase}\n` +
             `Language: ${cycle.language}\n` +
             `Framework: ${cycle.testFramework}\n` +
             `Tests: ${cycle.testsWritten} written, ${cycle.testsPassing} passing, ${cycle.testsFailing} failing\n\n` +
             `Question: ${question}`;
  }
  
  try {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model,
      prompt,
      stream: false
    }, { timeout: 60000 });
    
    const consultResponse: ConsultResponse = {
      question,
      answer: response.data.response,
      model,
      timestamp: new Date()
    };
    
    return {
      content: [{
        type: 'text',
        text: `🤔 **Consultation Result**\n\n` +
              `**Question**: ${question}\n\n` +
              `**Model**: ${model}\n\n` +
              `**Answer**:\n${consultResponse.answer}\n\n` +
              `Use this guidance to inform your TDD decisions.`
      }]
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ Consultation failed: ${error.message}\n\n` +
              `Make sure Ollama is running at ${OLLAMA_BASE_URL}\n` +
              `You can proceed without consultation.`
      }],
      isError: true
    };
  }
}

async function handleCheckpoint(args: any): Promise<any> {
  const cycle = getActiveCycle();
  if (!cycle) {
    return {
      content: [{
        type: 'text',
        text: '⚠️ No active cycle, but creating checkpoint anyway...'
      }]
    };
  }
  
  const allFiles = cycle.files || [];
  const snapshot = await createCheckpointSnapshot(allFiles);
  const tests = getTestsByCycle(cycle.id);
  
  const checkpoint: Checkpoint = {
    id: generateId('checkpoint'),
    cycleId: cycle.id,
    checkpointName: args.checkpointName,
    reason: args.reason,
    phase: cycle.phase,
    filesSnapshot: snapshot,
    testsSnapshot: tests,
    createdAt: new Date()
  };
  
  addCheckpoint(checkpoint);
  await saveState();
  
  return {
    content: [{
      type: 'text',
      text: `💾 **Checkpoint Created**\n\n` +
            `**ID**: ${checkpoint.id}\n` +
            `**Name**: ${checkpoint.checkpointName}\n` +
            `**Phase**: ${checkpoint.phase}\n` +
            `**Files Saved**: ${Object.keys(snapshot).length}\n` +
            `**Tests Saved**: ${tests.length}\n\n` +
            `${args.reason ? `**Reason**: ${args.reason}\n\n` : ''}` +
            `Use \`tdd_rollback\` with ID \`${checkpoint.id}\` to restore this state.`
    }]
  };
}

async function handleRollback(args: any): Promise<any> {
  const checkpointId = args.checkpointId;
  const checkpoint = getCheckpoint(checkpointId);
  
  if (!checkpoint) {
    return {
      content: [{
        type: 'text',
        text: `❌ Checkpoint not found: ${checkpointId}`
      }],
      isError: true
    };
  }
  
  try {
    await restoreCheckpointSnapshot(checkpoint.filesSnapshot);
    
    // Restore cycle state
    const cycle = getActiveCycle();
    if (cycle && cycle.id === checkpoint.cycleId) {
      updateCycle(cycle.id, {
        phase: checkpoint.phase
      });
    }
    
    await saveState();
    
    return {
      content: [{
        type: 'text',
        text: `♻️ **Rolled Back to Checkpoint**\n\n` +
              `**Checkpoint**: ${checkpoint.checkpointName}\n` +
              `**Phase**: ${checkpoint.phase}\n` +
              `**Files Restored**: ${Object.keys(checkpoint.filesSnapshot).length}\n` +
              `**Created**: ${new Date(checkpoint.createdAt).toLocaleString()}\n\n` +
              `All files have been restored to the checkpoint state.\n` +
              `Run \`tdd_status\` to see current state.`
      }]
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ Rollback failed: ${error.message}`
      }],
      isError: true
    };
  }
}

async function handleCoverage(args: any): Promise<any> {
  const result = await runTests(undefined, true);
  
  if (!result.coverage) {
    return {
      content: [{
        type: 'text',
        text: '⚠️ No coverage data available. Make sure your test framework supports coverage reporting.'
      }]
    };
  }
  
  const threshold = args.threshold || getConfig().coverageThreshold;
  const coverage = result.coverage;
  const meetsThreshold = coverage.lines.percentage >= threshold;
  
  let message = `📈 **Test Coverage Report**\n\n`;
  message += `**Overall Coverage**:\n`;
  message += `- Lines: ${coverage.lines.covered}/${coverage.lines.total} (${coverage.lines.percentage.toFixed(1)}%) ${coverage.lines.percentage >= threshold ? '✅' : '❌'}\n`;
  message += `- Branches: ${coverage.branches.covered}/${coverage.branches.total} (${coverage.branches.percentage.toFixed(1)}%)\n`;
  message += `- Functions: ${coverage.functions.covered}/${coverage.functions.total} (${coverage.functions.percentage.toFixed(1)}%)\n`;
  message += `- Statements: ${coverage.statements.covered}/${coverage.statements.total} (${coverage.statements.percentage.toFixed(1)}%)\n\n`;
  
  message += `**Threshold**: ${threshold}%\n`;
  message += `**Status**: ${meetsThreshold ? '✅ Meets threshold' : '❌ Below threshold'}\n\n`;
  
  if (coverage.files && coverage.files.length > 0) {
    message += `**File Coverage**:\n`;
    coverage.files.slice(0, 10).forEach(f => {
      message += `- ${f.path}: ${f.percentage.toFixed(1)}%\n`;
    });
    if (coverage.files.length > 10) {
      message += `... and ${coverage.files.length - 10} more files\n`;
    }
  }
  
  return {
    content: [{
      type: 'text',
      text: message
    }]
  };
}

async function handleCompareApproaches(args: any): Promise<any> {
  const approachDescriptions = args.approaches || [];
  const criteria = args.criteria || [];
  const useConsult = args.useConsult || false;
  
  if (approachDescriptions.length === 0) {
    return {
      content: [{
        type: 'text',
        text: '❌ No approaches provided to compare.'
      }],
      isError: true
    };
  }
  
  // Build basic comparison
  const approaches: Approach[] = approachDescriptions.map((desc: string, idx: number) => ({
    name: `Approach ${idx + 1}`,
    description: desc,
    pros: [],
    cons: [],
    complexity: 'medium' as const,
    testability: 'medium' as const
  }));
  
  let analysis = '';
  
  if (useConsult) {
    // Use Ollama for deeper analysis
    try {
      const prompt = `Compare these implementation approaches for TDD:\n\n` +
                    approaches.map((a, i) => `${i + 1}. ${a.description}`).join('\n\n') +
                    `\n\nEvaluate based on: ${criteria.join(', ')}\n\n` +
                    `Provide pros, cons, complexity rating, and testability rating for each approach. ` +
                    `Then recommend the best approach for TDD and explain why.`;
      
      const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
        model: 'llama2',
        prompt,
        stream: false
      }, { timeout: 60000 });
      
      analysis = response.data.response;
    } catch (error: any) {
      analysis = `Consultation unavailable: ${error.message}`;
    }
  } else {
    analysis = `Basic comparison of ${approaches.length} approaches based on criteria: ${criteria.join(', ')}`;
  }
  
  const comparison: ApproachComparison = {
    approaches,
    criteria,
    analysis
  };
  
  let message = `⚖️ **Approach Comparison**\n\n`;
  message += `**Criteria**: ${criteria.join(', ')}\n\n`;
  
  approaches.forEach((a, i) => {
    message += `**${a.name}**: ${a.description}\n`;
  });
  
  message += `\n**Analysis**:\n${analysis}\n\n`;
  message += `Use this analysis to inform your implementation choice in the TDD cycle.`;
  
  return {
    content: [{
      type: 'text',
      text: message
    }]
  };
}
