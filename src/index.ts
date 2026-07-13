import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { sendEmail } from "./tools/gmail.js";
import { appendToGoogleDoc } from "./tools/docs.js";
import { McpError } from "./utils/errors.js";

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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Google Workspace MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
