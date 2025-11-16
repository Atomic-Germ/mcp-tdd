// Adaptive Test Prioritization Engine
export interface TestMetadata {
  id: string;
  name: string;
  failureCount: number;
  lastFailure: Date | null;
  affectedFiles?: string[];
}

export interface PrioritizationOptions {
  changedFiles?: string[];
}

export class TestPrioritizer {
  prioritize(tests: TestMetadata[], options?: PrioritizationOptions): TestMetadata[] {
    return [...tests].sort((a, b) => {
      // Check if tests are affected by changed files
      if (options?.changedFiles) {
        const aAffected = this.isAffectedByChanges(a, options.changedFiles);
        const bAffected = this.isAffectedByChanges(b, options.changedFiles);
        
        if (aAffected && !bAffected) return -1;
        if (!aAffected && bAffected) return 1;
      }
      
      // Sort by failure count (higher first)
      return b.failureCount - a.failureCount;
    });
  }
  
  private isAffectedByChanges(test: TestMetadata, changedFiles: string[]): boolean {
    if (!test.affectedFiles || test.affectedFiles.length === 0) return false;
    return test.affectedFiles.some(file => changedFiles.includes(file));
  }
}

