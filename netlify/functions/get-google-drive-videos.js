import { google } from 'googleapis';

const FOLDER_ID = '1q5BCBvg6jep5SuBS6Tt8_8_2nwjCA_G6';

export async function handler(event, context) {
  try {
    // Parse service account JSON from environment variable
    const key = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

    const auth = new google.auth.GoogleAuth({
      credentials: key,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    const res = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and mimeType='video/mp4' and trashed=false`,
      fields: 'files(id, name, webContentLink, thumbnailLink)',
      pageSize: 100,
    });

    const files = res.data.files || [];

    const videos = files.map(file => {
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
        src: file.webContentLink,
        thumbnail: file.thumbnailLink || '',
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




