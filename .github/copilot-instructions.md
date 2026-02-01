# GitHub Copilot Code Review Instructions

## Review Focus

When reviewing pull requests, focus **only** on the following categories:

### 1. Security Issues (High Priority)
- XSS vulnerabilities (e.g., unsanitized user input in HTML)
- SQL injection risks
- Authentication/authorization bypasses
- Sensitive data exposure
- Insecure dependencies

### 2. Broken Code / Bugs
- Syntax errors and typos that would cause runtime failures
- Undefined variables or missing imports
- Broken module references
- Logic errors that would cause crashes
- Type mismatches in TypeScript

### 3. Unused / Dead Code
- Unreachable code paths
- Unused imports
- Unused variables or functions
- Commented-out code blocks that should be removed

## Do NOT Comment On

- Code style or formatting (we use automated formatters)
- Indentation preferences
- Naming conventions (unless genuinely confusing)
- Minor performance optimizations
- Subjective "better ways" to write something
- Adding more tests (unless existing tests are broken)
- Documentation suggestions
- File organization preferences

## Comment Guidelines

- Be specific: Point to the exact line and explain the concrete issue
- Be actionable: Explain how to fix the problem
- Be concise: One issue per comment, no lengthy explanations
- Limit comments: Maximum 5 comments per PR unless there are critical security issues
