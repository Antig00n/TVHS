import { google } from 'googleapis';

export async function handler(event, context) {
  try {
    const serviceAccountEncoded = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountEncoded) throw new Error('Missing service account key');

    // Decode and parse service account JSON
    const serviceAccountJSON = Buffer.from(serviceAccountEncoded, 'base64').toString('utf-8');
    const credentials = JSON.parse(serviceAccountJSON);

    // Authenticate
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    const folderId = '1q5BCBvg6jep5SuBS6Tt8_8_2nwjCA_G6';

    // List files in the folder (only mp4 videos, not trashed)
    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='video/mp4' and trashed=false`,
      fields: 'files(id, name)',
      pageSize: 100,
    });

    const files = res.data.files || [];

    // Map files to your video object format
    const videos = files
      .filter(file => file.name.startsWith('vhsmovie') && file.name.endsWith('.mp4'))
      .map(file => {
        const namePart = file.name.slice('vhsmovie'.length, -'.mp4'.length);
        const title = namePart.replace(/_/g, ' ');
        return {
          id: file.id,
          filename: file.name,
          title,
          src: `https://drive.google.com/uc?export=download&id=${file.id}`,
          thumbnail: '', // Optional: Add thumbnail URL if available
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
      body: JSON.stringify({ error: error.message }),
    };
  }
}
