const { google } = require('googleapis');

exports.handler = async function(event) {
  const fileId = event.queryStringParameters.id;
  if (!fileId) {
    return { statusCode: 400, body: 'Missing file ID' };
  }

  try {
    // Decode your base64-encoded service account JSON
    const creds = JSON.parse(Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8'));

    const auth = new google.auth.JWT(
      creds.client_email,
      null,
      creds.private_key,
      ['https://www.googleapis.com/auth/drive.readonly']
    );

    const drive = google.drive({ version: 'v3', auth });

    // Get metadata (to check mimeType)
    const meta = await drive.files.get({
      fileId,
      fields: 'name, mimeType'
    });

    const mimeType = meta.data.mimeType || 'video/mp4';

    // Get media stream
    const mediaRes = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    const passthrough = require('stream').PassThrough();
    mediaRes.data.pipe(passthrough);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'no-cache',
        'Accept-Ranges': 'bytes',
      },
      body: passthrough,
      isBase64Encoded: false,
    };
  } catch (err) {
    console.error('Stream error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
