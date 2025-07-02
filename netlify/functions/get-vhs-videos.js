const fs = require("fs");
const path = require("path");

exports.handler = async () => {
  const folderPath = path.join(__dirname, "../../tvhsmovies");

  try {
    const files = fs.readdirSync(folderPath).filter(file => file.startsWith("vhsmovie") && file.endsWith(".mp4"));

    const videos = files.map(file => {
      const filename = path.parse(file).name; // without extension
      const titleRaw = filename.replace("vhsmovie", "");
      const title = titleRaw.replace(/_/g, " ").trim();
      return {
        filename: file,
        title: title
      };
    });

    return {
      statusCode: 200,
      body: JSON.stringify(videos)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to load videos", details: error.message })
    };
  }
};
