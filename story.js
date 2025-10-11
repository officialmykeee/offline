// story.js
// export stories data + functions to create/open/close the popup
export const stories = [
  {
    id: "your-story",
    username: "Your story",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    hasNewStory: false,
    isYourStory: true,
  },
  {
    id: "1",
    username: "Emily",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    hasNewStory: true,
  },
  {
    id: "2",
    username: "Michael",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    hasNewStory: true,
  },
];

let popupEl = null;
let popupContent = null;
let activePointerId = null;
let startY = 0;
let lastY = 0;
let isDragging = false;
let currentStory = null;
const THRESHOLD = 120; // px required to trigger close

// Create popup element and wire handlers
export function createStoryPopup() {
  if (popupEl) return;

  popupEl = document.createElement("div");
  popupEl.id = "storyPopup";
  popupEl.className = "story-popup";

  popupContent = document.createElement("div");
  popupContent.className = "story-popup-content";

  popupContent.innerHTML = `
    <div class="story-viewer-container">
      <div class="story-viewer">
        <div class="story-header">
          <div class="story-progress-bars">
            <div class="story-progress-bar">
              <div class="story-progress-fill"></div>
            </div>
          </div>
          <div class="story-user-info">
            <!-- This will be dynamically filled -->
          </div>
        </div>
        <div class="story-background"></div>
      </div>
    </div>
  `;

  popupEl.appendChild(popupContent);
  document.body.appendChild(popupEl);

  popupEl.addEventListener("pointerdown", onPointerDown);
  popupEl.addEventListener("pointermove", onPointerMove);
  popupEl.addEventListener("pointerup", onPointerUp);
  popupEl.addEventListener("pointercancel", onPointerUp);

  popupEl.addEventListener(
    "touchmove",
    (e) => {
      if (isDragging) e.preventDefault();
    },
    { passive: false }
  );

  popupEl.addEventListener("transitionend", (e) => {
    if (e.propertyName === "opacity" && !popupEl.classList.contains("active")) {
      document.body.style.overflow = "";
    }
  });
}

// Immediately make popup visible (instant)
export function openStoryPopup(story) {
  if (!popupEl) createStoryPopup();

  if (!story) return; // safety check

  currentStory = story;

  const userInfoContainer = popupEl.querySelector(".story-user-info");
  if (userInfoContainer) {
    const displayName = story.isYourStory ? "My Story" : story.username;
    const timestamp = story.isYourStory ? "3 minutes ago" : "15m";

    userInfoContainer.innerHTML = `
      <img src="${story.avatar}" 
           alt="${displayName}" 
           class="story-user-avatar">
      <div class="story-user-details">
        <span class="story-user-name">${displayName}</span>
        <span class="story-user-time">${timestamp}</span>
      </div>
    `;
  }

  popupEl.classList.add("active");
  document.body.style.overflow = "hidden";
}

export function closeStoryPopup() {
  if (!popupEl) return;
  popupEl.classList.remove("active");
  document.body.style.overflow = "";
}

/* ----- pointer handlers ----- */
function onPointerDown(e) {
  if (!popupEl || !popupEl.classList.contains("active")) return;
  if (e.pointerType === "mouse" && e.button !== 0) return;

  activePointerId = e.pointerId;
  try {
    popupEl.setPointerCapture(activePointerId);
  } catch {}

  startY = e.clientY;
  lastY = startY;
  isDragging = true;
}

function onPointerMove(e) {
  if (!isDragging || e.pointerId !== activePointerId) return;
  const deltaY = e.clientY - startY;
  lastY = e.clientY;

  if (deltaY > 0) {
    // optionally, you can add visual feedback here
  }
}

function onPointerUp(e) {
  if (!isDragging || e.pointerId !== activePointerId) return;
  isDragging = false;
  try {
    popupEl.releasePointerCapture(activePointerId);
  } catch {}

  const delta = lastY - startY;

  if (delta > THRESHOLD) {
    closeStoryPopup();
  }
}
