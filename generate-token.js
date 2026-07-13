import { google } from 'googleapis';
import * as fs from 'fs';
import * as readline from 'readline';
import * as dotenv from 'dotenv';
dotenv.config();
const SCOPES = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/documents'
];
const credentialsPath = './credentials.json';
const tokenPath = './tokens.json';
async function main() {
    let clientId = process.env.GOOGLE_CLIENT_ID;
    let clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    let redirectUri = 'http://localhost';
    if (fs.existsSync(credentialsPath)) {
        const creds = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
        const web = creds.web || creds.installed;
        if (web) {
            clientId = web.client_id || clientId;
            clientSecret = web.client_secret || clientSecret;
            if (web.redirect_uris && web.redirect_uris.length > 0) {
                redirectUri = web.redirect_uris[0];
            }
        }
    }
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
    });
    console.log('\n=============================================================');
    console.log('Please authorize the application by visiting this URL:');
    console.log(authUrl);
    console.log('=============================================================\n');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the full code parameter from the URL you were redirected to: ', async (code) => {
        try {
            const { tokens } = await oauth2Client.getToken(code.trim());
            oauth2Client.setCredentials(tokens);
            fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
            console.log('\nTokens saved successfully to', tokenPath);
            if (tokens.refresh_token) {
                console.log(`\n---> SUCCESS! Here is your Refresh Token: \n${tokens.refresh_token}\n\nPlease copy this into your .env file as GOOGLE_REFRESH_TOKEN`);
            }
            else {
                console.log('\nWarning: No refresh token was returned. You may need to revoke access in your Google Account and try again.');
            }
        }
        catch (error) {
            console.error('\nError fetching token:', error.message);
        }
        finally {
            rl.close();
            process.exit(0);
        }
    });
}
main().catch(console.error);
//# sourceMappingURL=generate-token.js.map