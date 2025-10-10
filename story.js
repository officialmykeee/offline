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

  const popupContent = popup.querySelector(".story-popup-content");
  let isDragging = false;
  let startY = 0;
  let currentY = 0;
  let translateY = 0;

  // Mouse events
  popupContent.addEventListener("mousedown", (event) => {
    isDragging = true;
    startY = event.clientY;
    popupContent.style.transition = "none";
  });

  document.addEventListener("mousemove", (event) => {
    if (!isDragging) return;
    currentY = event.clientY;
    translateY = currentY - startY;
    if (translateY >= 0) {
      popupContent.style.transform = `translateY(${translateY}px)`;
    }
  });

  document.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    popupContent.style.transition = "transform 0.3s ease-out";
    const threshold = window.innerHeight * 0.15;
    if (translateY > threshold) {
      popupContent.style.transform = `translateY(${window.innerHeight}px)`;
      setTimeout(() => {
        popup.style.display = "none";
        popupContent.style.transform = "";
        popupContent.style.transition = "";
      }, 300);
    } else {
      popupContent.style.transform = "translateY(0)";
    }
    translateY = 0;
  });

  // Touch events
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
        popup.style.display = "none";
        popupContent.style.transform = "";
        popupContent.style.transition = "";
      }, 300);
    } else {
      popupContent.style.transform = "translateY(0)";
    }
    translateY = 0;
  });
}

function renderStories() {
  const storiesList = document.getElementById("storiesList");
  if (!storiesList) {
    console.error("storiesList element not found!");
    return;
  }
  
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
      <div class="story-avatar-container" style="cursor: pointer;">
        <div class="story-avatar-ring ${avatarRingClass}">
          <div class="story-avatar-bg">
            <img src="${story.avatar}" alt="${story.username}" class="story-avatar">
          </div>
        </div>
        ${story.isYourStory ? '<div class="story-plus">+</div>' : ""}
      </div>
      <span class="story-username">${story.username}</span>
    `;
    
    // Add click event specifically to the avatar container for instant response
    const avatarContainer = storyElement.querySelector(".story-avatar-container");
    avatarContainer.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      showStoryPopup();
    });
    
    storiesList.appendChild(storyElement);
  });
}

function showStoryPopup() {
  const popup = document.getElementById("storyPopup");
  if (!popup) {
    console.error("Popup not found!");
    return;
  }
  popup.style.display = "block";
}

// Initialize - wait for DOM to be ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    createStoryPopup();
    renderStories();
  });
} else {
  createStoryPopup();
  renderStories();
}

