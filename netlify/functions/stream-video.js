// netlify/functions/stream-video.js
const { google } = require('googleapis');

exports.handler = async (event) => {
  const id = event.queryStringParameters?.id;
  if (!id) {
    return {
      statusCode: 400,
      body: 'Missing id parameter',
    };
  }

  try {
    // Parse service account JSON from base64 env var
    const credentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_BASE64, 'base64').toString()
    );

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Fetch file as arraybuffer
    const response = await drive.files.get(
      { fileId: id, alt: 'media' },
      { responseType: 'arraybuffer' }
    );

    const videoBuffer = Buffer.from(response.data);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': videoBuffer.length.toString(),
        'Accept-Ranges': 'bytes',
      },
      isBase64Encoded: true,
      body: videoBuffer.toString('base64'),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: `Error fetching video: ${error.message}`,
    };
  }
};
