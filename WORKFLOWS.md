# TDD Workflow Examples

## Example 1: Simple Email Validation

### Visual Flow
```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Initialize Cycle                                   │
│ tdd_init_cycle({                                            │
│   feature: "email-validation",                              │
│   description: "Validate email format",                     │
│   testFramework: "jest"                                     │
│ })                                                          │
│ → Cycle ID: cycle-1234567890-abc123                        │
│ → Phase: READY                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Write First Test (RED Phase)                       │
│ tdd_write_test({                                            │
│   testFile: "validators/email.test.ts",                     │
│   testName: "should accept valid emails",                   │
│   testCode: `                                               │
│     test('should accept valid emails', () => {             │
│       expect(validateEmail('test@example.com')).toBe(true);│
│     });                                                     │
│   `,                                                        │
│   expectedToFail: true                                      │
│ })                                                          │
│ → Test written to file                                      │
│ → Phase: RED                                                │
│ → Tests written: 1                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Verify RED (Test Should Fail)                      │
│ tdd_run_tests({                                             │
│   expectation: "fail"                                       │
│ })                                                          │
│ → Tests run: 1                                              │
│ → Passed: 0                                                 │
│ → Failed: 1 ✅ (Expected!)                                  │
│ → Phase: RED (confirmed)                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Implement (GREEN Phase)                            │
│ tdd_implement({                                             │
│   implementationFile: "validators/email.ts",                │
│   code: `                                                   │
│     export function validateEmail(email: string): boolean { │
│       const regex = /^[^@]+@[^@]+\.[^@]+$/;               │
│       return regex.test(email);                            │
│     }                                                       │
│   `,                                                        │
│   testsCovered: ["should accept valid emails"]             │
│ })                                                          │
│ → Implementation written                                    │
│ → Phase: GREEN                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Verify GREEN (Test Should Pass)                    │
│ tdd_run_tests({                                             │
│   expectation: "pass"                                       │
│ })                                                          │
│ → Tests run: 1                                              │
│ → Passed: 1 ✅                                              │
│ → Failed: 0                                                 │
│ → Phase: GREEN (confirmed)                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: Add More Tests (Back to RED)                       │
│ tdd_write_test({                                            │
│   testName: "should reject invalid emails",                 │
│   testCode: `                                               │
│     test('should reject invalid emails', () => {           │
│       expect(validateEmail('invalid')).toBe(false);        │
│       expect(validateEmail('no-domain@')).toBe(false);     │
│     });                                                     │
│   `,                                                        │
│   expectedToFail: true                                      │
│ })                                                          │
│ tdd_run_tests({ expectation: "fail" })                      │
│ → New test fails (needs better validation)                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: Enhance Implementation                              │
│ tdd_implement({                                             │
│   implementationFile: "validators/email.ts",                │
│   code: `                                                   │
│     export function validateEmail(email: string): boolean { │
│       if (!email || !email.includes('@')) return false;    │
│       const regex = /^[^@]+@[^@]+\.[^@]+$/;               │
│       return regex.test(email);                            │
│     }                                                       │
│   `,                                                        │
│   testsCovered: ["should reject invalid emails"]           │
│ })                                                          │
│ tdd_run_tests({ expectation: "pass" })                      │
│ → All tests pass! ✅                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 8: Refactor (Optional)                                │
│ tdd_checkpoint({                                            │
│   checkpointName: "before-refactor"                         │
│ })                                                          │
│ tdd_refactor({                                              │
│   file: "validators/email.ts",                              │
│   changes: "Extract regex to constant",                     │
│   code: `                                                   │
│     const EMAIL_REGEX = /^[^@]+@[^@]+\.[^@]+$/;           │
│     export function validateEmail(email: string): boolean { │
│       if (!email || !email.includes('@')) return false;    │
│       return EMAIL_REGEX.test(email);                      │
│     }                                                       │
│   `,                                                        │
│   maintainTests: true                                       │
│ })                                                          │
│ → Tests still pass ✅                                       │
│ → Phase: REFACTOR                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 9: Check Coverage                                      │
│ tdd_coverage()                                              │
│ → Lines: 95%                                                │
│ → Branches: 90%                                             │
│ → Functions: 100%                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 10: Complete Cycle                                     │
│ tdd_complete_cycle({                                        │
│   summary: "Email validation with comprehensive tests",     │
│   testsAdded: 2,                                            │
│   testsPassing: 2                                           │
│ })                                                          │
│ → Cycle complete! 🎉                                        │
│ → Phase: COMPLETE                                           │
│ → Ready for next feature                                    │
└─────────────────────────────────────────────────────────────┘
```

## Example 2: Complex Feature with Consultation

### Authentication System

```
[INIT] → Feature: "JWT Authentication"
   ↓
[RED] → Write test: "should generate valid JWT token"
   ↓
[RED] → Write test: "should validate token signature"
   ↓
[RED] → Write test: "should reject expired tokens"
   ↓
[CONSULT] → Question: "Should I use HS256 or RS256 for JWT?"
            Answer: "Use RS256 for better security with public/private keys"
   ↓
[GREEN] → Implement JWT generation with RS256
   ↓
[GREEN] → Implement token validation
   ↓
[GREEN] → Implement expiration checking
   ↓
[GREEN] → Run tests → All pass ✅
   ↓
[CHECKPOINT] → Save state before refactoring
   ↓
[REFACTOR] → Extract token creation to factory
   ↓
[REFACTOR] → Extract validation to middleware
   ↓
[GREEN] → Run tests → Still pass ✅
   ↓
[COVERAGE] → Check coverage → 92% ✅
   ↓
[COMPLETE] → Cycle done!
```

## Example 3: Checkpoint & Rollback Pattern

### Risky Refactoring

```
[GREEN] → All tests passing
   ↓
[CHECKPOINT] → "before-major-refactor"
              Files saved: 5
              Tests saved: 12
   ↓
[REFACTOR] → Major structural changes
   ↓
[RUN TESTS] → Some tests fail ❌
   ↓
[ROLLBACK] → Restore checkpoint "before-major-refactor"
             All files restored ✅
   ↓
[GREEN] → Tests passing again
   ↓
[REFACTOR] → Smaller, incremental changes
   ↓
[GREEN] → Tests still pass ✅
```

## Example 4: Multi-Cycle Feature

### User Management System

```
═══════════════════════════════════════════════════════════
CYCLE 1: User Registration
═══════════════════════════════════════════════════════════
[INIT] → "user-registration"
[RED] → Test: validate email format
[RED] → Test: validate password strength
[GREEN] → Implement validators
[REFACTOR] → Extract validation rules
[COMPLETE] → Registration validation done

═══════════════════════════════════════════════════════════
CYCLE 2: Password Hashing
═══════════════════════════════════════════════════════════
[INIT] → "password-hashing"
[RED] → Test: hash password securely
[RED] → Test: verify hashed password
[CONSULT] → "Best hashing algorithm?"
[GREEN] → Implement bcrypt hashing
[COMPLETE] → Password security done

═══════════════════════════════════════════════════════════
CYCLE 3: User Storage
═══════════════════════════════════════════════════════════
[INIT] → "user-storage"
[RED] → Test: save user to database
[RED] → Test: prevent duplicate emails
[GREEN] → Implement database layer
[REFACTOR] → Extract repository pattern
[COVERAGE] → Check coverage: 95% ✅
[COMPLETE] → Storage layer done

═══════════════════════════════════════════════════════════
CYCLE 4: Integration
═══════════════════════════════════════════════════════════
[INIT] → "user-registration-integration"
[RED] → Test: complete registration flow
[GREEN] → Connect all components
[GREEN] → Integration tests pass
[COMPLETE] → User management complete! 🎉
```

## Example 5: Status-Driven Development

### Using Status to Guide Work

```
[INIT] "shopping-cart"
   ↓
[STATUS] → Phase: READY
           Next: Write your first failing test
   ↓
[WRITE TEST] "add item to cart"
   ↓
[STATUS] → Phase: RED
           Tests: 1 written, 0 passing, 0 failing
           Next: Run tests with expectation=fail
   ↓
[RUN TESTS] expectation=fail
   ↓
[STATUS] → Phase: RED
           Tests: 1 written, 0 passing, 1 failing ✅
           Next: Implement code to make tests pass
   ↓
[IMPLEMENT] shopping cart class
   ↓
[STATUS] → Phase: GREEN
           Tests: 1 written, 0 passing, 1 failing
           Next: Run tests to verify implementation
   ↓
[RUN TESTS] expectation=pass
   ↓
[STATUS] → Phase: GREEN
           Tests: 1 written, 1 passing, 0 failing ✅
           Next: Refactor, add more tests, or complete
   ↓
[COMPLETE]
```

## Example 6: Approach Comparison

### Design Decision

```
[INIT] "cache-layer"
   ↓
[COMPARE APPROACHES] {
  approaches: [
    "In-memory Map for simple caching",
    "Redis for distributed caching",
    "LRU Cache with size limits"
  ],
  criteria: ["simplicity", "scalability", "testability"]
}
   ↓
[ANALYSIS] → 
  Approach 1: High simplicity, low scalability
  Approach 2: Low simplicity, high scalability
  Approach 3: Medium on both, best testability
  
  Recommendation: Start with LRU Cache (approach 3)
  Reason: Balances testability with practical features
   ↓
[RED] → Write tests for LRU cache
   ↓
[GREEN] → Implement LRU cache
   ↓
[COMPLETE]
```

## Phase Transition Matrix

```
┌─────────┬────────┬──────────┬───────────┬──────────┐
│ From/To │ READY  │   RED    │  GREEN    │ REFACTOR │ COMPLETE │
├─────────┼────────┼──────────┼───────────┼──────────┤──────────┤
│ READY   │   -    │    ✅    │    ❌     │    ❌    │    ❌    │
│ RED     │   ❌   │    ✅    │    ✅*    │    ❌    │    ❌    │
│ GREEN   │   ❌   │    ✅    │    ✅     │    ✅**  │    ✅*** │
│ REFACTOR│   ❌   │    ✅    │    ✅     │    ✅    │    ✅*** │
│ COMPLETE│   N/A  │   N/A    │    N/A    │   N/A    │    -     │
└─────────┴────────┴──────────┴───────────┴──────────┴──────────┘

* Only if tests fail (proper RED phase)
** Only if all tests pass
*** Only if all tests pass and at least 1 test added
```

## Tool Usage Patterns

### Frequent Tools (Use Often)
- `tdd_status` - Check before each action
- `tdd_run_tests` - After writing tests/code
- `tdd_write_test` - Core of RED phase

### Periodic Tools (Use When Needed)
- `tdd_checkpoint` - Before risky changes
- `tdd_coverage` - End of cycle or phase
- `tdd_refactor` - When code needs improvement

### Occasional Tools (Use Sparingly)
- `tdd_consult` - Complex design decisions
- `tdd_compare_approaches` - Major architectural choices
- `tdd_rollback` - When refactoring fails

### Once Per Cycle
- `tdd_init_cycle` - Start of work
- `tdd_complete_cycle` - End of work

## Common Patterns

### Pattern 1: Test-First Always
```
tdd_status → tdd_write_test → tdd_run_tests(fail) → 
tdd_implement → tdd_run_tests(pass) → tdd_status
```

### Pattern 2: Safe Refactoring
```
tdd_run_tests(pass) → tdd_checkpoint → tdd_refactor → 
tdd_run_tests(pass) → (if fail: tdd_rollback)
```

### Pattern 3: Incremental Development
```
Loop:
  tdd_write_test → tdd_run_tests(fail) → 
  tdd_implement → tdd_run_tests(pass)
Until: Feature complete
Then: tdd_complete_cycle
```

### Pattern 4: Design Consultation
```
tdd_status → tdd_compare_approaches → tdd_consult → 
Decision made → Continue with TDD
```

---

These workflows demonstrate the flexibility and power of the MCP TDD server. Use them as templates for your own TDD journeys!
