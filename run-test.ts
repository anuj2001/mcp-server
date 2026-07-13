import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const EventSource = require("eventsource");

(global as any).EventSource = EventSource;

async function main() {
  const serverUrl = "https://mcp-server-production-adb9.up.railway.app/sse";
  const apiKey = process.env.API_KEY || ""; 
  
  console.log(`Connecting to MCP server at ${serverUrl}...`);
  const transport = new SSEClientTransport(new URL(serverUrl), {
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {}
  });
  
  const client = new Client({ name: "test-client", version: "1.0.0" }, { capabilities: {} });
  await client.connect(transport);
  console.log("Connected successfully!\n");

  const email = "anuj76913@gmail.com";
  console.log(`Calling send_email to ${email}...`);
  try {
    const result = await client.callTool({
      name: "send_email",
      arguments: {
        to: email,
        subject: "Test from MCP Server on Railway",
        emailBody: "Hello! This email was sent successfully using the Railway deployed MCP server via SSE transport."
      }
    });
    console.log("Send Email Result:", JSON.stringify(result, null, 2));
  } catch (e) {
    console.error("Failed to send email:", e);
  }

  const docId = "1T4WIWRFStoE86a6BHbtlz5YAtuSpSJFo5C27ohaci0M";
  console.log(`\nCalling append_to_google_doc for Doc ID ${docId}...`);
  try {
    const result = await client.callTool({
      name: "append_to_google_doc",
      arguments: {
        documentId: docId,
        content: "\n\nHello from the MCP Railway test client!"
      }
    });
    console.log("Append Doc Result:", JSON.stringify(result, null, 2));
  } catch (e) {
    console.error("Failed to append to doc:", e);
  }

  process.exit(0);
}

main();
