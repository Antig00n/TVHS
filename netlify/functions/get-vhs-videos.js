import fs from 'fs/promises';
import path from 'path';

export async function handler(event, context) {
  try {
    const videosDir = path.resolve('./tvhsmovies');
    const files = await fs.readdir(videosDir);

    const videos = files
      .filter(file => file.startsWith('vhsmovie') && file.endsWith('.mp4'))
      .map(file => {
        const namePart = file.slice('vhsmovie'.length, -'.mp4'.length);
        const title = namePart.replace(/_/g, ' ');
        return {
          filename: file,
          title,
          src: `/tvhsmovies/${file}`,
          thumbnail: `/tvhsmovies/${file.replace('.mp4', '.png')}` // or .webp
        };
      });

    return {
      statusCode: 200,
      body: JSON.stringify(videos),
    };
  } catch (error) {
    console.error('Error reading videos:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to read video files.' }),
    };
  }
}
