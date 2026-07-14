import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { sendEmail } from "./tools/gmail.js";
import { appendToGoogleDoc } from "./tools/docs.js";
import { McpError } from "./utils/errors.js";
import express from "express";

const app = express();
const API_KEY = process.env.API_KEY;

// Authentication middleware
app.use((req, res, next) => {
  if (!API_KEY) {
    console.warn("WARNING: API_KEY environment variable is not set. Server is open to the public.");
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
});

// Store active transports by session ID
const transports = new Map<string, SSEServerTransport>();

app.get("/sse", async (req, res) => {
  console.log("New SSE connection established");
  const transport = new SSEServerTransport("/messages", res);
  
  // Create a NEW Server instance for each client connection
  const server = new Server(
    {
      name: "google-workspace-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tools for this specific server instance
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "send_email",
          description: "Send an email using the authenticated Gmail account.",
          inputSchema: {
            type: "object",
            properties: {
              to: { type: ["string", "array"], items: { type: "string" }, description: "To" },
              cc: { type: ["string", "array"], items: { type: "string" }, description: "CC" },
              bcc: { type: ["string", "array"], items: { type: "string" }, description: "BCC" },
              subject: { type: "string", description: "Subject" },
              emailBody: { type: "string", description: "Body" },
              bodyType: { type: "string", enum: ["Plain Text", "HTML"], default: "Plain Text" },
              replyTo: { type: "string" }
            },
            required: ["to", "subject", "emailBody"],
          },
        },
        {
          name: "append_to_google_doc",
          description: "Append content to an existing Google Document.",
          inputSchema: {
            type: "object",
            properties: {
              documentId: { type: "string" },
              content: { type: "string" },
            },
            required: ["documentId", "content"],
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
      if (name === "send_email") {
        const result = await sendEmail(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } else if (name === "append_to_google_doc") {
        const result = await appendToGoogleDoc(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } else {
        throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error: any) {
      if (error instanceof McpError) {
        return { isError: true, content: [{ type: "text", text: `Error [${error.code}]: ${error.message}` }] };
      }
      return { isError: true, content: [{ type: "text", text: `Error: ${error.message}` }] };
    }
  });

  await server.connect(transport);
  
  // Store the transport with its unique session ID
  transports.set(transport.sessionId, transport);

  // Clean up when connection closes
  transport.onclose = () => {
    transports.delete(transport.sessionId);
  };
});

app.post("/messages", async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports.get(sessionId);
  
  if (!transport) {
    res.status(404).send("Session not found");
    return;
  }
  
  await transport.handlePostMessage(req, res);
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Google Workspace MCP server running on SSE at http://0.0.0.0:${PORT}/sse`);
});
