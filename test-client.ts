import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import * as readline from "readline/promises";

// Ensure EventSource is available globally for Node.js
import EventSource from "eventsource";
(global as any).EventSource = EventSource;

async function main() {
  const serverUrl = "https://mcp-server-production-adb9.up.railway.app/sse";
  const apiKey = process.env.API_KEY || ""; 
  
  console.log(`Connecting to MCP server at ${serverUrl}...`);
  
  // Create transport with auth headers if needed
  const transport = new SSEClientTransport(new URL(serverUrl), {
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {}
  });
  
  const client = new Client(
    { name: "test-client", version: "1.0.0" },
    { capabilities: {} }
  );

  await client.connect(transport);
  console.log("Connected successfully!");

  // List tools to prove connection works
  const tools = await client.listTools();
  console.log("Available tools:", tools.tools.map(t => t.name).join(", "));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const email = await rl.question("\nEnter an email address to send a test email to (or press Enter to skip): ");
  if (email) {
    console.log(`\nCalling send_email to ${email}...`);
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
  }

  const docId = await rl.question("\nEnter a Google Document ID to append text to (or press Enter to skip): ");
  if (docId) {
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
  }

  rl.close();
  process.exit(0);
}

main().catch(e => {
  console.error("Test Client Error:", e);
  process.exit(1);
});
