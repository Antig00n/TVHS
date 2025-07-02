const fs = require('fs');
const path = require('path');

exports.handler = async () => {
  try {
    const moviesDir = path.join(__dirname, '../../tvhsmovies'); 
    // Adjust path depending on your project structure

    const files = fs.readdirSync(moviesDir);
    
    const videos = files
      .filter(file => file.startsWith('vhsmovie') && /\.(mp4|webm|mov)$/i.test(file))
      .map(file => {
        // filename format example: vhsmovie_2024-05-21_Kleine_Kova_In_De_Natuur.mp4
        // Remove "vhsmovie_" prefix and extension
        const base = file.replace(/^vhsmovie_/, '').replace(/\.[^/.]+$/, '');
        
        // Try to parse date and title: assume date is YYYY-MM-DD at start
        const parts = base.split('_');
        let date = null;
        let titleParts = parts;

        // Check if first part looks like a date
        if (/^\d{4}-\d{2}-\d{2}$/.test(parts[0])) {
          date = parts[0];
          titleParts = parts.slice(1);
        }

        // Convert underscores to spaces for title
        const title = titleParts.join(' ').replace(/-/g, ' ');

        return {
          filename: file,
          title,
          rawTitle: base,
          description: `Bekijk de clip: ${title}`, // default description, customize if needed
          caption: date || "Recently Added",
          date
        };
      })
      // Sort by date descending (newest first)
      .sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return b.date.localeCompare(a.date);
      });

    return {
      statusCode: 200,
      body: JSON.stringify(videos),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    };
  } catch (error) {
    console.error("Error reading VHS movies:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to load VHS movies" }),
    };
  }
};
