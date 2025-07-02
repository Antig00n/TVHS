
  let allVideos = [];
  let isNewestFirst = true;
  const container = document.getElementById("movieSlider");
  const searchInput = document.getElementById("searchInput");
  const toggleSortBtn = document.getElementById("toggleSortBtn");

  async function loadVHSClips() {
    try {
      const res = await fetch("/.netlify/functions/get-vhs-videos");
      if (!res.ok) throw new Error("Failed to fetch videos");
      allVideos = await res.json();
      renderMovies();
    } catch (err) {
      console.error("Failed to load VHS movies:", err);
      container.innerHTML = "<p style='color:red;'>Failed to load videos.</p>";
    }
  }

  function renderMovies() {
    container.innerHTML = ""; // Clear current

    // Get search query, lowercase for case-insensitive match
    const query = searchInput.value.toLowerCase();

    // Filter by title match
    let filteredVideos = allVideos.filter(video => {
      const filename = video.filename;
      const titleRaw = filename.replace("vhsmovie", "").replace(".mp4", "").replace(/_/g, " ").toLowerCase();
      return titleRaw.includes(query);
    });

    // Sort by date (assuming video.showdate exists or use filename as fallback)
    filteredVideos.sort((a, b) => {
      // If you have a date property like a.showdate, use it here. Otherwise fallback:
      // Example: date format YYYY-MM-DD or just sort by filename string:
      const dateA = a.showdate ? new Date(a.showdate) : new Date(a.filename);
      const dateB = b.showdate ? new Date(b.showdate) : new Date(b.filename);

      return isNewestFirst ? dateB - dateA : dateA - dateB;
    });

    filteredVideos.forEach(video => {
      const filename = video.filename;
      const titleRaw = filename.replace("vhsmovie", "").replace(".mp4", "");
      const title = titleRaw.replace(/_/g, " ").trim();

      const card = document.createElement("div");
      card.className = "movie-card";

      card.innerHTML = `
        <button onclick="showVideo(this)" data-src="tvhsmovies/${filename}" data-description="${video.description || ''}">
          <div class="position-relative">
            <img src="img/vhsthumbs/${titleRaw}.webp" alt="${title}"
                 onerror="this.onerror=null;this.src='img/vhsthumbs/${titleRaw}.png';
                          this.onerror=function(){this.src='img/vhsthumbs/${titleRaw}.jpg'};">
          </div>
          <div class="movie-title">${title}</div>
        </button>
      `;

      container.appendChild(card);
    });

    if (filteredVideos.length === 0) {
      container.innerHTML = "<p style='color: white;'>No videos found.</p>";
    }
  }

  // Scroll vertical wrapper vertically
  function scrollSlider(direction) {
    const scrollContainer = document.querySelector(".vertical-scroll-wrapper");
    const scrollAmount = 260;
    scrollContainer.scrollBy({ top: direction * scrollAmount, behavior: "smooth" });
  }

  // Toggle sort order and update button text
  toggleSortBtn.addEventListener("click", () => {
    isNewestFirst = !isNewestFirst;
    toggleSortBtn.textContent = isNewestFirst ? "Sort: Newest" : "Sort: Oldest";
    renderMovies();
  });

  // Filter movies on search input
  searchInput.addEventListener("input", () => {
    renderMovies();
  });

  window.addEventListener("DOMContentLoaded", loadVHSClips);

