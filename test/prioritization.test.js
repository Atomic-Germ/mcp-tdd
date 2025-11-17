"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const testPrioritization_1 = require("../src/testPrioritization");
(0, vitest_1.describe)('TestPrioritizer', () => {
    (0, vitest_1.it)('should prioritize tests with recent failures higher', () => {
        const prioritizer = new testPrioritization_1.TestPrioritizer();
        const tests = [
            { id: '1', name: 'stable', failureCount: 0, lastFailure: null },
            { id: '2', name: 'flaky', failureCount: 3, lastFailure: new Date('2024-01-01') },
        ];
        const sorted = prioritizer.prioritize(tests);
        (0, vitest_1.expect)(sorted[0].id).toBe('2');
    });
    (0, vitest_1.it)('should prioritize tests affected by code changes', () => {
        const prioritizer = new testPrioritization_1.TestPrioritizer();
        const tests = [
            { id: '1', name: 'unaffected', failureCount: 0, lastFailure: null, affectedFiles: [] },
            { id: '2', name: 'affected', failureCount: 0, lastFailure: null, affectedFiles: ['module.ts'] },
        ];
        const sorted = prioritizer.prioritize(tests, { changedFiles: ['module.ts'] });
        (0, vitest_1.expect)(sorted[0].id).toBe('2');
    });
});
