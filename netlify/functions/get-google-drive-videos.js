import fs from 'fs/promises';
import path from 'path';
import { google } from 'googleapis';

const FOLDER_ID = '1q5BCBvg6jep5SuBS6Tt8_8_2nwjCA_G6'; // Your Google Drive folder ID

async function getGoogleServiceAccount() {
  const jsonPath = path.resolve('./netlify/functions/google-service-account.json');
  const jsonData = await fs.readFile(jsonPath, 'utf-8');
  return JSON.parse(jsonData);
}

export async function handler(event, context) {
  try {
    const key = await getGoogleServiceAccount();

    const auth = new google.auth.GoogleAuth({
      credentials: key,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // List files in the specified folder with .mp4 extension
    const res = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and mimeType='video/mp4' and trashed=false`,
      fields: 'files(id, name, webContentLink, thumbnailLink)',
      pageSize: 100,
    });

    const files = res.data.files || [];

    // Format videos similar to your old scheme
    const videos = files.map(file => {
      // Remove "vhsmovie" prefix and ".mp4" suffix from name to get title
      let title = file.name;
      if (title.toLowerCase().startsWith('vhsmovie')) {
        title = title.slice('vhsmovie'.length);
      }
      if (title.toLowerCase().endsWith('.mp4')) {
        title = title.slice(0, -4);
      }
      title = title.replace(/_/g, ' ').trim();

      return {
        id: file.id,
        filename: file.name,
        title,
        src: file.webContentLink, // direct download link from Drive
        thumbnail: file.thumbnailLink || '', // may be empty if no thumbnail
      };
    });

    return {
      statusCode: 200,
      body: JSON.stringify(videos),
    };
  } catch (error) {
    console.error('Error fetching Google Drive videos:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch videos', details: error.message }),
    };
  }
}
