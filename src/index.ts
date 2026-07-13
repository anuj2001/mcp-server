import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { sendEmail } from "./tools/gmail.js";
import { appendToGoogleDoc } from "./tools/docs.js";
import { McpError } from "./utils/errors.js";
import express from "express";

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

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "send_email",
        description: "Send an email using the authenticated Gmail account.",
        inputSchema: {
          type: "object",
          properties: {
            to: {
              type: ["string", "array"],
              items: { type: "string" },
              description: "To (single or multiple recipients)",
            },
            cc: {
              type: ["string", "array"],
              items: { type: "string" },
              description: "CC (optional)",
            },
            bcc: {
              type: ["string", "array"],
              items: { type: "string" },
              description: "BCC (optional)",
            },
            subject: {
              type: "string",
              description: "Subject of the email",
            },
            emailBody: {
              type: "string",
              description: "Email Body",
            },
            bodyType: {
              type: "string",
              enum: ["Plain Text", "HTML"],
              description: "Format of the email body",
              default: "Plain Text"
            },
            replyTo: {
              type: "string",
              description: "Reply-To address (optional)"
            }
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
            documentId: {
              type: "string",
              description: "Google Document ID",
            },
            content: {
              type: "string",
              description: "Content to append",
            },
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
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } else if (name === "append_to_google_doc") {
      const result = await appendToGoogleDoc(args);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    if (error instanceof McpError) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error [${error.code}]: ${error.message}` }],
      };
    }
    return {
      isError: true,
      content: [{ type: "text", text: `Error: ${error.message}` }],
    };
  }
});

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

let transport: SSEServerTransport | null = null;

app.get("/sse", async (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);
});

app.post("/messages", express.json(), async (req, res) => {
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(500).send("Transport not initialized");
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Google Workspace MCP server running on SSE at http://localhost:${PORT}/sse`);
});
