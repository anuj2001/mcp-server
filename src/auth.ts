import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { McpError, ErrorCodes } from './utils/errors.js';

dotenv.config();

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn("Google OAuth credentials are not set in environment variables. Auth will fail.");
}

export function getAuthClient() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    throw new McpError(ErrorCodes.UNAUTHORIZED, "Missing Google OAuth credentials or refresh token in environment.");
  }

  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: GOOGLE_REFRESH_TOKEN
  });

  return oauth2Client;
}

export function getGmailClient() {
  const auth = getAuthClient();
  return google.gmail({ version: 'v1', auth });
}

export function getDocsClient() {
  const auth = getAuthClient();
  return google.docs({ version: 'v1', auth });
}
