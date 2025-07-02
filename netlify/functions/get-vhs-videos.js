async function loadVHSClips() {
  const container = document.getElementById("movieSlider");
  container.innerHTML = ""; // clear existing

  try {
    const res = await fetch("/.netlify/functions/get-vhs-videos");
    if (!res.ok) throw new Error("Failed to fetch videos");
    let data = await res.json();

    // Sort by date descending (newest first). Assumes video.date is ISO string or timestamp
    data.sort((a, b) => new Date(b.date) - new Date(a.date));

    data.forEach((video, index) => {
      const { filename, title, rawTitle, description, caption } = video;

      // Show "Recently Added" only for the two newest videos (index 0 and 1)
      const showBadge = index < 2;
      const badgeText = showBadge ? (caption || "Recently Added") : "";

      const card = document.createElement("div");
      card.className = "movie-card";

      card.innerHTML = `
        <button onclick="showVideo(this)" data-src="tvhsmovies/${filename}" data-description="${description || ''}">
          <div class="position-relative">
            <img src="img/vhsthumbs/${rawTitle}.webp" alt="${title}"
                 onerror="this.onerror=null;this.src='img/vhsthumbs/${rawTitle}.png';
                 this.onerror=function(){this.src='img/vhsthumbs/${rawTitle}.jpg'};">
            ${badgeText ? `<div class="badge-custom">${badgeText}</div>` : ''}
          </div>
          <div class="movie-title">${title}</div>
        </button>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to load VHS movies:", err);
    container.innerHTML = "<p style='color:red;'>Failed to load videos.</p>";
  }
}
