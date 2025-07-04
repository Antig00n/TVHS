import { google } from 'googleapis';

export async function handler(event, context) {
  try {
    const encodedKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!encodedKey) throw new Error('Missing service account key');

    const keyJson = Buffer.from(encodedKey, 'base64').toString('utf-8');
    const credentials = JSON.parse(keyJson);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    const folderId = 'YOUR_FOLDER_ID_HERE';

    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='video/mp4' and trashed=false`,
      fields: 'files(id, name)',
      pageSize: 100,
    });

    const files = res.data.files || [];

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
          thumbnail: '', // optional if you have thumbnails
        };
      });

    return {
      statusCode: 200,
      body: JSON.stringify(videos),
    };
  } catch (error) {
    console.error('Error fetching videos:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
