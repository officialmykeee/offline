// story.js

export const stories = [
  {
    id: "your-story",
    username: "Your story",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    hasNewStory: false,
    isYourStory: true,
  },
  {
    id: "1",
    username: "Maggie",
    handle: "@domingo_124",
    time: "15m",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    hasNewStory: true,
  },
  {
    id: "2",
    username: "Michael",
    handle: "@mikey_24",
    time: "8m",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    hasNewStory: true,
  },
];

// Inject Story Popup dynamically
document.addEventListener("DOMContentLoaded", () => {
  const popup = document.createElement("div");
  popup.className = "story-popup";
  popup.id = "storyPopup";
  popup.innerHTML = `
    <div class="story-popup-content">
      <div class="story-top-bar">
        <div class="story-user-info">
          <img src="" alt="" class="story-user-avatar" id="storyUserAvatar">
          <div class="story-user-text">
            <h3 id="storyUsername"></h3>
            <p id="storyHandleTime"></p>
          </div>
        </div>
        <div class="story-icons">
          <span class="story-icon">&#10003;</span>
          <span class="story-icon">&#10005;</span>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(popup);

  // Touch slide down logic
  const storyPopup = document.getElementById("storyPopup");
  let startY = 0;
  let currentY = 0;
  let isDragging = false;

  storyPopup.addEventListener("touchstart", (e) => {
    startY = e.touches[0].clientY;
    isDragging = true;
  });

  storyPopup.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    currentY = e.touches[0].clientY - startY;
    if (currentY > 0) {
      storyPopup.style.transform = `translateY(${currentY}px)`;
      storyPopup.style.opacity = `${1 - currentY / 400}`;
    }
  });

  storyPopup.addEventListener("touchend", () => {
    isDragging = false;
    if (currentY > 120) {
      storyPopup.classList.remove("active");
    } else {
      storyPopup.style.transform = "";
      storyPopup.style.opacity = "1";
    }
  });
});
