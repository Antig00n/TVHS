import { google } from 'googleapis';

// Your service account JSON key — best to store as environment variable (NETLIFY_GOOGLE_SERVICE_ACCOUNT)
// and parse it here:
const serviceAccount = JSON.parse(process.env.NETLIFY_GOOGLE_SERVICE_ACCOUNT);

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({ version: 'v3', auth });

export async function handler(event, context) {
  try {
    const folderId = '1q5BCBvg6jep5SuBS6Tt8_8_2nwjCA_G6'; // Your Google Drive folder ID

    // List files in the folder
    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='video/mp4' and trashed = false`,
      fields: 'files(id, name, webViewLink, webContentLink)',
      orderBy: 'name',
    });

    const files = res.data.files || [];

    const videos = files.map(file => {
      // Remove 'vhsmovie' prefix and '.mp4' suffix if present
      let title = file.name;
      if (title.startsWith('vhsmovie')) {
        title = title.slice('vhsmovie'.length);
      }
      if (title.endsWith('.mp4')) {
        title = title.slice(0, -4);
      }
      title = title.replace(/_/g, ' ');

      return {
        id: file.id,
        title,
        // Use webContentLink to stream the file directly (may need proper permissions)
        src: file.webContentLink,
        // Thumbnail - you may want to create this separately or leave blank for now
        thumbnail: '', 
        viewLink: file.webViewLink,
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
      body: JSON.stringify({ error: 'Failed to fetch videos from Google Drive.' }),
    };
  }
}
