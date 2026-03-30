---
name: pr-review
description: Comprehensive PR review combining security and code quality checks on the current branch
allowed-tools: Read, Grep, Glob, Bash, Agent
---

Run a full review of the current branch's changes against master. Execute the following steps:

## Step 1: Gather context
- Run `git log --oneline master..HEAD` to list all commits in this branch
- Run `git diff --stat master...HEAD` to see which files changed
- Run `git diff master...HEAD` to see the full diff

## Step 2: Launch reviews in parallel
Launch both agents simultaneously:
1. **@security-reviewer** — analyze all changes for security vulnerabilities
2. **@code-quality-checker** — analyze all changes for code quality issues

## Step 3: Summarize
After both agents complete, produce a unified report:

### PR Review Summary
- **Branch**: (branch name)
- **Commits**: (count)
- **Files changed**: (count)

### Security Findings
(Summary from security-reviewer, grouped by severity)

### Code Quality Findings
(Summary from code-quality-checker, grouped by category)

### Verdict
- APPROVE: No critical/high issues found
- REQUEST CHANGES: Critical or high severity issues that must be fixed
- COMMENT: Only medium/low issues, suggestions for improvement
