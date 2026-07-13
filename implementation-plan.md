# Generic MCP Server for Gmail & Google Docs Integration

Build a generic Model Context Protocol (MCP) server that enables AI agents to securely interact with Google Workspace services. The initial version will support Gmail for sending emails and Google Docs for appending content to existing documents. The server will be designed as a reusable integration layer.

## User Review Required

> [!IMPORTANT]
> **Tech Stack Selection**: I propose building the server in **Node.js with TypeScript** using the official `@modelcontextprotocol/sdk` and `googleapis`. Node.js has excellent support for Google OAuth and MCP. Please confirm if you agree with this choice or if you prefer Python or another language.

> [!WARNING]
> **Token Storage**: The problem statement mentions "Secure token storage". Since this is an MCP server, how should we handle the token storage? 
> Options:
> 1. Local secure file (e.g., using system keychain or encrypted file).
> 2. Expecting the user to provide OAuth tokens via environment variables.
> 3. Provide a local web server for the initial OAuth consent flow and save to a local configuration file.

## Open Questions

> [!NOTE]
> - Should the server be configured via environment variables (e.g., `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)?
> - For multiple users (future-ready), do we need a specific way to identify the user per request, or is it sufficient to authenticate the instance running the MCP server for one user initially?

## Proposed Changes

### Server Initialization

#### [NEW] `package.json`
- Initialize Node.js project.
- Add dependencies: `@modelcontextprotocol/sdk`, `googleapis`, `dotenv`, `zod` (for input validation).

#### [NEW] `src/index.ts`
- Setup the MCP Server instance.
- Register `send_email` and `append_to_google_doc` tools.
- Start the server using stdio transport.

---

### Authentication Module

#### [NEW] `src/auth.ts`
- Implement OAuth2 client using `googleapis`.
- Handle token loading, saving, and refreshing.
- Functions to authorize and return authenticated clients for Gmail and Docs.

---

### Gmail Integration

#### [NEW] `src/tools/gmail.ts`
- Implement `send_email` function.
- Validate inputs: To, Subject, Body, etc.
- Construct email in proper format (MIME for attachments or standard for simple).
- Use `gmail.users.messages.send` API.
- Return success status and `messageId`.
- Handle standard Gmail API errors.

---

### Google Docs Integration

#### [NEW] `src/tools/docs.ts`
- Implement `append_to_google_doc` function.
- Validate inputs: Document ID, Content.
- Use `docs.documents.batchUpdate` API to insert text at the end of the document.
- Handle document not found or permission errors.

---

### Error Handling & Utilities

#### [NEW] `src/utils/errors.ts`
- Define standardized error formats.
- Map Google API errors and validation errors to meaningful messages for the AI agent.

## Verification Plan

### Automated Tests
- Setup Jest for unit testing.
- Mock Google APIs to verify tool logic and error handling.
- E.g., `npm run test`

### Manual Verification
- Authenticate locally and start the MCP server.
- Connect an MCP client (like the Claude Desktop app or a test script).
- Invoke `send_email` and verify the email is sent successfully.
- Invoke `append_to_google_doc` and verify the document is updated.
- Verify error handling by providing invalid Document IDs and email addresses.
