# Google Workspace MCP Server

A generic Model Context Protocol (MCP) server that enables AI agents to securely interact with Google Workspace services. The server exposes tools for sending emails via Gmail and appending content to Google Docs.

It is built with **Express** and **SSE Transport**, making it perfect for cloud deployments (like Railway) so remote AI agents can connect over HTTP.

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

### 3. Deploy to Railway (Cloud Hosting)
1. Push this repository to your GitHub account.
2. Sign in to [Railway.app](https://railway.app) and create a New Project from your GitHub Repository.
3. In the Railway Dashboard for this service, navigate to **Variables** and add the following:
   - `GOOGLE_CLIENT_ID`: Your Client ID
   - `GOOGLE_CLIENT_SECRET`: Your Client Secret
   - `GOOGLE_REFRESH_TOKEN`: The Refresh Token generated in Step 2.
   - `API_KEY`: Generate a secure random string (e.g., a UUID). This protects your server from unauthorized access!

Railway will automatically build and deploy the server. Once deployed, note the public Domain provided by Railway.

## Integrating with AI Agents
Since this is an SSE-based server, your agent needs to connect to the `/sse` endpoint via HTTP, passing the API Key as a Bearer token.

For an MCP Client that supports SSE natively, configure it with:
- **URL**: `https://your-railway-app-url.up.railway.app/sse`
- **Headers**: `{"Authorization": "Bearer YOUR_API_KEY"}`
