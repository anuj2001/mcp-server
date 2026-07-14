import { getDocsClient } from '../auth.js';
import { McpError, ErrorCodes } from '../utils/errors.js';

export async function appendToGoogleDoc(args: any) {
  const { documentId, content } = args;

  if (!documentId || !content) {
    throw new McpError(ErrorCodes.INVALID_INPUT, "Missing mandatory fields: 'documentId' or 'content'");
  }

  const docs = getDocsClient();

  try {
    // Need to get the document first to find the end index
    const doc = await docs.documents.get({
      documentId,
    });

    const body = doc.data.body;
    if (!body || !body.content) {
       throw new McpError(ErrorCodes.NOT_FOUND, "Document body not found");
    }

    // Find the end index
    let endIndex = 1;
    const lastElement = body.content[body.content.length - 1];
    if (lastElement && lastElement.endIndex) {
      endIndex = lastElement.endIndex - 1; // Insert before the very last newline
    }

    const requests: any[] = [];
    
    if (endIndex > 1) {
      requests.push({
        deleteContentRange: {
          range: {
            startIndex: 1,
            endIndex: endIndex
          }
        }
      });
    }
    
    requests.push({
      insertText: {
        location: {
          index: 1,
        },
        text: content,
      },
    });

    const res = await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: requests,
      },
    });

    return {
      success: true,
      documentId,
      status: "updated"
    };
  } catch (error: any) {
    throw new McpError(ErrorCodes.API_ERROR, `Google Docs API Error: ${error.message}`);
  }
}
