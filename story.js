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
let currentStory = null; // Track the current story being viewed
const THRESHOLD = 120; // px required to trigger close

// Create popup element and wire handlers
export function createStoryPopup() {
  // Check if popup already exists
  if (popupEl) return;

  // Create popup element
  popupEl = document.createElement("div");
  popupEl.id = "storyPopup";
  popupEl.className = "story-popup";
  
  // Create popup content container
  popupContent = document.createElement("div");
  popupContent.className = "story-popup-content";
  
  // Create story viewer structure (will be populated dynamically)
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
            <img src="" 
                 alt="User" 
                 class="story-user-avatar"
                 id="storyAvatar">
            <div class="story-user-details">
              <span class="story-user-name" id="storyUsername"></span>
              <span class="story-user-time" id="storyTime"></span>
            </div>
          </div>
        </div>
        <div class="story-background"></div>
      </div>
    </div>
  `;
  
  // Append content to popup
  popupEl.appendChild(popupContent);
  
  // Append popup to body
  document.body.appendChild(popupEl);

  // Pointer events (works for touch and mouse)
  popupEl.addEventListener("pointerdown", onPointerDown);
  popupEl.addEventListener("pointermove", onPointerMove);
  popupEl.addEventListener("pointerup", onPointerUp);
  popupEl.addEventListener("pointercancel", onPointerUp);

  // Ensure touchmove doesn't cause page scroll while dragging
  popupEl.addEventListener(
    "touchmove",
    (e) => {
      if (isDragging) e.preventDefault();
    },
    { passive: false }
  );

  // cleanup after transform transition (used on close)
  popupEl.addEventListener("transitionend", (e) => {
    if (e.propertyName === "opacity" && !popupEl.classList.contains("active")) {
      // fully closed -> reset body overflow
      document.body.style.overflow = "";
    }
  });
}

// Immediately make popup visible (instant) — only closes by dragging down
export function openStoryPopup(storyData) {
  if (!popupEl) createStoryPopup();
  
  // show instantly (no slide-in)
  popupEl.classList.add("active");
  document.body.style.overflow = "hidden"; // prevent background scroll while open
  
  // Update the story content with the clicked story's data
  if (storyData) {
    currentStory = storyData;
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => updateStoryContent(storyData), 0);
  }
}

// Update story content dynamically
function updateStoryContent(story) {
  if (!popupEl) return;
  
  const avatarEl = popupEl.querySelector("#storyAvatar");
  const usernameEl = popupEl.querySelector("#storyUsername");
  const timeEl = popupEl.querySelector("#storyTime");
  
  if (avatarEl) {
    avatarEl.src = story.avatar;
    avatarEl.alt = story.username;
  }
  if (usernameEl) {
    usernameEl.textContent = story.username;
  }
  if (timeEl) {
    // Show "Just Now" for "Your story", otherwise show timestamp
    timeEl.textContent = story.isYourStory ? "Just Now" : "15m";
  }
}

// Programmatic close (not used for background click; used internally after slide)
export function closeStoryPopup() {
  if (!popupEl) return;
  popupEl.classList.remove("active");
  document.body.style.overflow = "";
}

/* ----- pointer handlers ----- */
function onPointerDown(e) {
  // only allow dragging if popup is active
  if (!popupEl || !popupEl.classList.contains("active")) return;
  // only primary mouse button
  if (e.pointerType === "mouse" && e.button !== 0) return;

  activePointerId = e.pointerId;
  try {
    popupEl.setPointerCapture(activePointerId);
  } catch (err) {
    // ignore if not supported
  }
  startY = e.clientY;
  lastY = startY;
  isDragging = true;
}

function onPointerMove(e) {
  if (!isDragging || e.pointerId !== activePointerId) return;
  const deltaY = e.clientY - startY;
  lastY = e.clientY;

  // Only allow dragging down (positive delta)
  if (deltaY > 0) {
    // No visual feedback during drag - just track the movement
  } else {
    // don't let user drag up
  }
}

function onPointerUp(e) {
  if (!isDragging || e.pointerId !== activePointerId) return;
  isDragging = false;
  try {
    popupEl.releasePointerCapture(activePointerId);
  } catch (err) {}

  const delta = lastY - startY;

  if (delta > THRESHOLD) {
    // Just close immediately - no animation
    closeStoryPopup();
  }
  // If under threshold, do nothing (story stays open)
}
