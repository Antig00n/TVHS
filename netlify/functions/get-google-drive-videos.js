import { google } from 'googleapis';

export async function handler(event, context) {
  try {
    // Parse service account JSON from env var
    const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

    // Create JWT auth client
    const auth = new google.auth.JWT({
      email: serviceAccountKey.client_email,
      key: serviceAccountKey.private_key,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    // Create drive client
    const drive = google.drive({ version: 'v3', auth });

    // Your Google Drive folder ID
    const folderId = '1q5BCBvg6jep5SuBS6Tt8_8_2nwjCA_G6';

    // List files in the folder
    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'video/' and trashed = false`,
      fields: 'files(id, name, mimeType)',
      orderBy: 'name',
    });

    const files = res.data.files || [];

    // Filter files starting with "vhsmovie"
    const videos = files
      .filter(file => file.name.toLowerCase().startsWith('vhsmovie'))
      .map(file => {
        const namePart = file.name.slice('vhsmovie'.length);
        const title = namePart.replace(/_/g, ' ');
        return {
          id: file.id,
          title,
          filename: file.name,
          // Create public URL for streaming via Google Drive
          src: `https://drive.google.com/uc?export=download&id=${file.id}`,
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
