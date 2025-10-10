const stories = [
    { id: "your-story", username: "Your story", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face", hasNewStory: false, isYourStory: true },
    { id: "1", username: "Emily", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face", hasNewStory: true },
    { id: "2", username: "Michael", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face", hasNewStory: true },
];

function createStoryPopup() {
    const popup = document.createElement("div");
    popup.className = "story-popup";
    popup.id = "storyPopup";
    popup.innerHTML = `
        <div class="story-popup-content"></div>
    `;
    document.body.appendChild(popup);

    // Drag-to-dismiss functionality
    const popupContent = popup.querySelector(".story-popup-content");
    let isDragging = false;
    let startY = 0;
    let currentY = 0;
    let translateY = 0;

    // Mouse events
    popupContent.addEventListener("mousedown", (event) => {
        isDragging = true;
        startY = event.clientY;
        popupContent.style.transition = "none"; // Disable transition during drag
    });

    document.addEventListener("mousemove", (event) => {
        if (!isDragging) return;
        currentY = event.clientY;
        translateY = currentY - startY;
        if (translateY >= 0) { // Only allow downward drag
            popupContent.style.transform = `translateY(${translateY}px)`;
        }
    });

    document.addEventListener("mouseup", () => {
        if (!isDragging) return;
        isDragging = false;
        popupContent.style.transition = "transform 0.3s ease-out"; // Re-enable transition
        const threshold = window.innerHeight * 0.15; // Dismiss if dragged 15% of screen height
        if (translateY > threshold) {
            popupContent.style.transform = `translateY(${window.innerHeight}px)`; // Slide off screen
            setTimeout(() => {
                popup.classList.remove("active");
                popup.style.display = "none";
                popupContent.style.transition = "";
                popupContent.style.transform = "";
                translateY = 0; // Reset translateY
            }, 300); // Match transition duration
        } else {
            popupContent.style.transform = "translateY(0)"; // Snap back
            translateY = 0; // Reset translateY
        }
    });

    // Touch events for mobile
    popupContent.addEventListener("touchstart", (event) => {
        isDragging = true;
        startY = event.touches[0].clientY;
        popupContent.style.transition = "none";
    });

    document.addEventListener("touchmove", (event) => {
        if (!isDragging) return;
        currentY = event.touches[0].clientY;
        translateY = currentY - startY;
        if (translateY >= 0) {
            popupContent.style.transform = `translateY(${translateY}px)`;
        }
    });

    document.addEventListener("touchend", () => {
        if (!isDragging) return;
        isDragging = false;
        popupContent.style.transition = "transform 0.3s ease-out";
        const threshold = window.innerHeight * 0.15;
        if (translateY > threshold) {
            popupContent.style.transform = `translateY(${window.innerHeight}px)`;
            setTimeout(() => {
                popup.classList.remove("active");
                popup.style.display = "none";
                popupContent.style.transition = "";
                popupContent.style.transform = "";
                translateY = 0;
            }, 300);
        } else {
            popupContent.style.transform = "translateY(0)";
            translateY = 0;
        }
    });
}

function renderStories() {
    const storiesList = document.getElementById("storiesList");
    storiesList.innerHTML = "";
    stories.forEach((story) => {
        const storyElement = document.createElement("div");
        storyElement.className = "story-item";
        const avatarRingClass = story.isYourStory
            ? "your-story"
            : story.hasNewStory
            ? "has-story"
            : "your-story";
        storyElement.innerHTML = `
            <div class="story-avatar-container">
                <div class="story-avatar-ring ${avatarRingClass}">
                    <div class="story-avatar-bg">
                        <img src="${story.avatar}" alt="${story.username}" class="story-avatar">
                    </div>
                </div>
                ${story.isYourStory ? '<div class="story-plus">+</div>' : ""}
            </div>
            <span class="story-username">${story.username}</span>
        `;
        storyElement.addEventListener("click", () => showStoryPopup(story.id));
        storiesList.appendChild(storyElement);
    });
}

function showStoryPopup(storyId) {
    const popup = document.getElementById("storyPopup");
    const popupContent = popup.querySelector(".story-popup-content");
    const story = stories.find(s => s.id === storyId);

    // Set content (if applicable)
    if (story) {
        popupContent.innerHTML = `
            <img src="${story.avatar}" alt="${story.username}" style="width: 100%; height: auto;">
            <h2>${story.username}'s Story</h2>
        `;
    }

    // Reset state
    popup.classList.remove("active");
    popupContent.style.transition = "none"; // Ensure no transition on open
    popupContent.style.transform = "translateY(-100%)"; // Match CSS initial state

    // Show instantly
    popup.style.display = "block";
    popupContent.style.transform = "translateY(0)";
    popup.classList.add("active");

    // Re-enable transition for dismissal
    requestAnimationFrame(() => {
        popupContent.style.transition = "transform 0.3s ease-out";
    });
}

// Initialize the pop-up and render stories
createStoryPopup();
renderStories();
