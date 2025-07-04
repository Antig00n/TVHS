import fetch from 'node-fetch';

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} = process.env;

const FOLDER_ID = '1q5BCBvg6jep5SuBS6Tt8_8_2nwjCA_G6'; // 🔁 Replace with your actual folder ID

let cachedAccessToken = null;

export async function handler() {
  try {
    // Step 1: Get access token using client credentials (OAuth 2.0 Device or Installed App Flow)
    if (!cachedAccessToken) {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          grant_type: 'client_credentials', // you could also use refresh_token if using full OAuth
        }),
      });

      const tokenData = await tokenRes.json();

      if (!tokenData.access_token) {
        throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`);
      }

      cachedAccessToken = tokenData.access_token;
    }

    // Step 2: Query files in the Drive folder
    const query = encodeURIComponent(`'${FOLDER_ID}' in parents and mimeType = 'video/mp4'`);
    const fields = encodeURIComponent('files(id, name)');
    const listRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&key=${GOOGLE_CLIENT_ID}`,
      {
        headers: {
          Authorization: `Bearer ${cachedAccessToken}`,
        },
      }
    );

    const listData = await listRes.json();
    if (!listData.files) throw new Error('No files returned.');

    // Step 3: Map the files to your frontend format
    const videos = listData.files
      .filter(file => file.name.startsWith('vhsmovie') && file.name.endsWith('.mp4'))
      .map(file => {
        const namePart = file.name.slice('vhsmovie'.length, -'.mp4'.length);
        const title = namePart.replace(/_/g, ' ').trim();
        const fileId = file.id;

        return {
          filename: file.name,
          title,
          src: `https://drive.google.com/uc?export=preview&id=${fileId}`, // embeddable preview link
          thumbnail: `https://drive.google.com/thumbnail?id=${fileId}`,
        };
      });

    return {
      statusCode: 200,
      body: JSON.stringify(videos),
    };
  } catch (err) {
    console.error('Error fetching Google Drive videos:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
