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
  
  const client = new Client({ name: "scenario-client", version: "1.0.0" }, { capabilities: {} });
  await client.connect(transport);
  console.log("Connected successfully!\n");

  const email = "anuj76913@gmail.com";
  const docId = "1T4WIWRFStoE86a6BHbtlz5YAtuSpSJFo5C27ohaci0M";
  const docLink = `https://docs.google.com/document/d/${docId}/edit`;

  const reviewSummary = `Groww App Customer Reviews Summary (AI Generated)
===================================================

Customer reviews for the Groww app are mixed, generally leaning toward positive for beginners and long-term investors while receiving more critical feedback from active or professional traders.

Commonly Praised Features (Pros):
- User-Friendly Interface: Clean, intuitive, and simple design.
- Ease of Use for Mutual Funds: Excellent for tracking and investing in mutual funds with zero commissions.
- Cost-Effective: Zero account opening fees and zero AMC.
- Simplified Onboarding: Paperless, quick, and digital account opening process.

Commonly Reported Concerns (Cons):
- Technical Glitches: Issues with app speed and stability during high market volatility.
- Limited Advanced Tools: Charting and analytical tools are too basic for active traders.
- Customer Support: Some users report slow responses to urgent technical issues.
`;

  console.log(`1. Appending summary to Google Doc (${docId})...`);
  try {
    await client.callTool({
      name: "append_to_google_doc",
      arguments: {
        documentId: docId,
        content: "\n\n" + reviewSummary
      }
    });
    console.log("-> Successfully appended to Document.\n");
  } catch (e) {
    console.error("-> Failed to append to doc:", e);
    process.exit(1);
  }

  console.log(`2. Sending email with summary and Doc link to ${email}...`);
  const emailBody = `Hi Anuj,\n\nHere is the AI-generated summary of the Groww App customer reviews:\n\n${reviewSummary}\n\nYou can find the full details appended in our Google Doc here: ${docLink}\n\nBest,\nYour Automated AI Agent`;

  try {
    await client.callTool({
      name: "send_email",
      arguments: {
        to: email,
        subject: "Groww App Reviews Summary",
        emailBody: emailBody
      }
    });
    console.log("-> Email sent successfully!\n");
  } catch (e) {
    console.error("-> Failed to send email:", e);
  }

  process.exit(0);
}

main();
