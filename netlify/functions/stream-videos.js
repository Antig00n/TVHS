const { google } = require('googleapis');

exports.handler = async function(event) {
  const fileId = event.queryStringParameters.id;
  if (!fileId) {
    return { statusCode: 400, body: 'Missing file ID' };
  }

  try {
    // Decode base64 credentials
    const decoded = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
    const credentials = JSON.parse(decoded);

    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/drive.readonly']
    );

    const drive = google.drive({ version: 'v3', auth });

    // Get video metadata
    const meta = await drive.files.get({
      fileId,
      fields: 'name, mimeType'
    });

    // Get stream
    const file = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': meta.data.mimeType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache'
      },
      body: file.data,
      isBase64Encoded: false,
    };
  } catch (err) {
    console.error('Stream error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
