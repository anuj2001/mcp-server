# Google Workspace MCP Server

A generic Model Context Protocol (MCP) server that enables AI agents to securely interact with Google Workspace services. The server exposes tools for sending emails via Gmail and appending content to Google Docs.

## Features
- `send_email`: Send an email (Supports To, CC, BCC, HTML, Reply-To).
- `append_to_google_doc`: Append text to an existing Google Document.

## Setup Instructions

### 1. Google Cloud Console Setup
1. Create a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Gmail API** and **Google Docs API**.
3. Create OAuth 2.0 Client IDs (Desktop application type).
4. Download the credentials and save them as `credentials.json` in the root of this project.

### 2. Generate Tokens
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the token generation script:
   ```bash
   npm run auth
   ```
3. Follow the CLI prompt to authorize the application. The tokens will be saved locally and output a Refresh Token.

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
```

### 4. Build
```bash
npm run build
```

## Integrating with Claude Desktop
Add the following to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "google-workspace": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"]
    }
  }
}
```
