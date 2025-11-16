// Test File Writer - properly merges tests into existing test files
import fs from 'fs/promises';

export async function mergeTestIntoFile(
  filePath: string,
  testCode: string,
  targetDescribeBlock?: string
): Promise<boolean> {
  try {
    const fileExists = await checkFileExists(filePath);
    
    if (!fileExists) {
      // Create new file with the test code
      await fs.writeFile(filePath, testCode, 'utf-8');
      return true;
    }
    
    // Read existing content
    const existingContent = await fs.readFile(filePath, 'utf-8');
    
    // If we're adding just an 'it' block and a target describe is specified
    if (targetDescribeBlock && testCode.trim().startsWith('it(')) {
      const merged = insertTestIntoDescribe(existingContent, testCode, targetDescribeBlock);
      await fs.writeFile(filePath, merged, 'utf-8');
      return true;
    }
    
    // Otherwise, append the test code (new describe block or full test)
    const merged = `${existingContent}\n\n${testCode}`;
    await fs.writeFile(filePath, merged, 'utf-8');
    return true;
    
  } catch (error) {
    console.error('Error merging test:', error);
    return false;
  }
}

function insertTestIntoDescribe(
  content: string,
  testCode: string,
  describeBlock: string
): string {
  // Find the describe block with the given name
  const describePattern = `describe\\(['"\`]${escapeRegex(describeBlock)}['"\`],\\s*\\(\\)\\s*=>\\s*\\{`;
  const describeRegex = new RegExp(describePattern, 'g');
  
  const match = describeRegex.exec(content);
  
  if (!match) {
    // Describe block not found, append the test code as-is
    return `${content}\n\n${testCode}`;
  }
  
  // Find the matching closing brace for this describe block
  const startIndex = match.index + match[0].length;
  const closingBraceIndex = findClosingBrace(content, startIndex);
  
  if (closingBraceIndex === -1) {
    // Could not find closing brace, append as-is
    return `${content}\n\n${testCode}`;
  }
  
  // Insert the test before the closing brace
  const before = content.substring(0, closingBraceIndex);
  const after = content.substring(closingBraceIndex);
  
  return `${before}\n${testCode}\n${after}`;
}

function findClosingBrace(content: string, startIndex: number): number {
  let braceCount = 1;
  for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '{') braceCount++;
    if (content[i] === '}') braceCount--;
    if (braceCount === 0) return i;
  }
  return -1;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
