# Deployment Plan: Publishing MCP Server to GitHub

This plan outlines the steps to prepare and publish the Google Workspace MCP Server to a GitHub repository. Since this is an MCP server, "deployment" in this context means making the source code available securely, providing usage instructions, and ensuring sensitive credentials are not accidentally exposed.

## User Review Required

> [!CAUTION]
> **Sensitive Files**: It is extremely important that we do not commit `.env`, `credentials.json`, or `tokens.json`. I will create a strict `.gitignore` to ensure these files are excluded before we initialize Git.

> [!IMPORTANT]
> **GitHub Repository Creation**: Would you like me to use the `github` MCP server (if you have it configured) to automatically create the repository on your behalf, or will you create an empty repository on GitHub manually and provide me with the remote URL to push to?

## Open Questions
- Do you want to publish this as a public NPM package in the future? If so, we can add a GitHub Action for that.

## Proposed Changes

### 1. Preparation & Security
#### [NEW] `.gitignore`
Create a git ignore file that excludes:
- `node_modules/`
- `dist/`
- `.env`
- `credentials.json`
- `tokens.json`
- IDE specific files (e.g., `.vscode/`, `.idea/`)

### 2. Documentation
#### [NEW] `README.md`
Create a comprehensive README that includes:
- Project Overview and capabilities.
- Setup Instructions (how to obtain Google OAuth credentials).
- How to generate the tokens using `generate-token.ts`.
- How to configure an MCP client (like Claude Desktop) to connect to this server.

### 3. CI/CD Pipeline
#### [NEW] `.github/workflows/build.yml`
Create a simple GitHub Actions workflow to run `npm run build` on every push to ensure the code always compiles correctly for contributors.

### 4. Git Initialization & Push
- Run `git init`.
- Stage all non-sensitive files.
- Create the initial commit.
- (Pending your answer) Add the remote origin and push.

## Verification Plan
- Verify `.gitignore` rules prevent sensitive files from being staged using `git status`.
- Verify the repository builds locally before committing.
