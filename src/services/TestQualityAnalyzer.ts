// Quality scoring constants
const NAMING_ISSUE_PENALTY = 15;
const STRUCTURE_ISSUE_PENALTY = 10;
const ASSERTION_ISSUE_PENALTY = 5;
const MAX_TEST_LENGTH_LINES = 20;
const MIN_DESCRIPTIVE_NAME_LENGTH = 10;
const MAX_ASSERTIONS_PER_TEST = 5;

export interface QualityIssue {
  type: 'naming-convention' | 'structure' | 'assertion' | 'anti-pattern';
  severity: 'low' | 'medium' | 'high';
  message: string;
  line?: number;
}

export interface TestQualityResult {
  score: number;
  issues: QualityIssue[];
  suggestions: string[];
}

export class TestQualityAnalyzer {
  analyzeTest(testCode: string, testName: string): TestQualityResult {
    const issues: QualityIssue[] = [];
    let score = 100;

    // Analyze naming convention
    const namingIssues = this.analyzeNaming(testName);
    issues.push(...namingIssues);
    score -= namingIssues.length * NAMING_ISSUE_PENALTY;

    // Analyze structure
    const structureIssues = this.analyzeStructure(testCode);
    issues.push(...structureIssues);
    score -= structureIssues.length * STRUCTURE_ISSUE_PENALTY;

    // Analyze assertions
    const assertionIssues = this.analyzeAssertions(testCode);
    issues.push(...assertionIssues);
    score -= assertionIssues.length * ASSERTION_ISSUE_PENALTY;

    // Generate suggestions
    const suggestions = this.generateSuggestions(issues);

    // Ensure score is between 0-100
    score = Math.max(0, Math.min(100, score));

    return {
      score,
      issues,
      suggestions,
    };
  }

  private analyzeNaming(testName: string): QualityIssue[] {
    const issues: QualityIssue[] = [];

    if (!testName.match(/^(should|when|given|can|will|has|is|validates|returns|throws)/i)) {
      if (testName.length < MIN_DESCRIPTIVE_NAME_LENGTH || /^test\d*$/i.test(testName)) {
        issues.push({
          type: 'naming-convention',
          severity: 'high',
          message: `Test name should be descriptive and start with "should", "when", or "given". Current: "${testName}"`,
        });
      }
    }

    return issues;
  }

  private analyzeStructure(testCode: string): QualityIssue[] {
    const issues: QualityIssue[] = [];

    const hasArrange = /\/\/\s*Arrange/i.test(testCode);
    const hasAct = /\/\/\s*Act/i.test(testCode);
    const hasAssert = /\/\/\s*Assert/i.test(testCode);

    if (!hasArrange && !hasAct && !hasAssert) {
      issues.push({
        type: 'structure',
        severity: 'medium',
        message:
          'Test should follow AAA pattern: Add Arrange, Act, and Assert comments for clarity.',
      });
    } else if ((hasArrange || hasAct || hasAssert) && !(hasArrange && hasAct && hasAssert)) {
      issues.push({
        type: 'structure',
        severity: 'medium',
        message: 'Incomplete AAA pattern. Use all three: Arrange, Act, Assert comments.',
      });
    }

    const lines = testCode.split('\n').length;
    if (lines > MAX_TEST_LENGTH_LINES) {
      issues.push({
        type: 'structure',
        severity: 'low',
        message: `Test is quite long (${lines} lines). Consider breaking it into smaller tests.`,
      });
    }

    return issues;
  }

  private analyzeAssertions(testCode: string): QualityIssue[] {
    const issues: QualityIssue[] = [];

    const assertCount = (testCode.match(/expect\(/g) || []).length;

    if (assertCount === 0) {
      issues.push({
        type: 'assertion',
        severity: 'high',
        message: 'Test contains no assertions. Add expect() statements.',
      });
    }

    if (assertCount > MAX_ASSERTIONS_PER_TEST) {
      issues.push({
        type: 'assertion',
        severity: 'medium',
        message: `Test has many assertions (${assertCount}). Consider splitting into multiple focused tests.`,
      });
    }

    return issues;
  }

  private generateSuggestions(issues: QualityIssue[]): string[] {
    const suggestions: string[] = [];

    if (issues.some(i => i.type === 'naming-convention')) {
      suggestions.push(
        'Improve test naming: Use "should", "when", or "given" to describe expected behavior',
      );
    }

    if (issues.some(i => i.type === 'structure')) {
      suggestions.push('Add AAA pattern comments (Arrange, Act, Assert) to clarify test structure');
    }

    if (issues.some(i => i.type === 'assertion')) {
      suggestions.push(
        'Ensure each test has focused, meaningful assertions that validate behavior',
      );
    }

    if (suggestions.length === 0) {
      suggestions.push('Test quality looks good! Follow these practices in future tests.');
    }

    return suggestions;
  }
}
