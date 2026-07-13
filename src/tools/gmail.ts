import { getGmailClient } from '../auth.js';
import { McpError, ErrorCodes } from '../utils/errors.js';

export async function sendEmail(args: any) {
  const { to, cc, bcc, subject, emailBody, bodyType, replyTo } = args;

  if (!to || !subject || !emailBody) {
    throw new McpError(ErrorCodes.INVALID_INPUT, "Missing mandatory fields: 'to', 'subject', or 'emailBody'");
  }

  const gmail = getGmailClient();

  // Create email message
  const toHeader = Array.isArray(to) ? to.join(', ') : to;
  const ccHeader = Array.isArray(cc) ? cc.join(', ') : cc || '';
  const bccHeader = Array.isArray(bcc) ? bcc.join(', ') : bcc || '';
  
  const isHtml = bodyType === 'HTML';
  
  let messageStr = `To: ${toHeader}\n`;
  messageStr += `Subject: ${subject}\n`;
  if (ccHeader) messageStr += `Cc: ${ccHeader}\n`;
  if (bccHeader) messageStr += `Bcc: ${bccHeader}\n`;
  if (replyTo) messageStr += `Reply-To: ${replyTo}\n`;

  messageStr += `Content-Type: text/${isHtml ? 'html' : 'plain'}; charset="UTF-8"\n`;
  messageStr += `MIME-Version: 1.0\n\n`;
  messageStr += `${emailBody}`;

  const encodedMessage = Buffer.from(messageStr)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    return {
      success: true,
      messageId: res.data.id,
      status: "sent"
    };
  } catch (error: any) {
    throw new McpError(ErrorCodes.API_ERROR, `Gmail API Error: ${error.message}`);
  }
}
