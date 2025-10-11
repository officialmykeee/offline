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
let cubeContainer = null;
let activePointerId = null;
let startX = 0;
let startY = 0;
let lastX = 0;
let lastY = 0;
let isDragging = false;
let currentStoryIndex = 0;
const SWIPE_THRESHOLD = 80; // px required to trigger story switch
const CLOSE_THRESHOLD = 120; // px required to trigger close (vertical)

// Create popup element and wire handlers
export function createStoryPopup() {
  if (popupEl) return;

  popupEl = document.createElement("div");
  popupEl.id = "storyPopup";
  popupEl.className = "story-popup";

  popupContent = document.createElement("div");
  popupContent.className = "story-popup-content";

  cubeContainer = document.createElement("div");
  cubeContainer.className = "story-cube-container";

  popupContent.appendChild(cubeContainer);
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

// Open story at specific index
export function openStoryPopup(story) {
  if (!popupEl) createStoryPopup();
  if (!story) return;

  // Find story index
  currentStoryIndex = stories.findIndex(s => s.id === story.id);
  if (currentStoryIndex === -1) currentStoryIndex = 0;

  renderCurrentStory();
  
  popupEl.classList.add("active");
  document.body.style.overflow = "hidden";
}

export function closeStoryPopup() {
  if (!popupEl) return;
  popupEl.classList.remove("active");
  document.body.style.overflow = "";
}

// Render the current story with cube faces
function renderCurrentStory() {
  if (!cubeContainer) return;

  const story = stories[currentStoryIndex];
  const prevStory = currentStoryIndex > 0 ? stories[currentStoryIndex - 1] : null;
  const nextStory = currentStoryIndex < stories.length - 1 ? stories[currentStoryIndex + 1] : null;

  cubeContainer.innerHTML = `
    <div class="story-cube" style="transform: rotateY(0deg);">
      <!-- Current Story (Front Face) -->
      <div class="story-cube-face story-cube-front">
        ${createStoryContent(story)}
      </div>
      
      <!-- Previous Story (Left Face) -->
      ${prevStory ? `
        <div class="story-cube-face story-cube-left">
          ${createStoryContent(prevStory)}
        </div>
      ` : ''}
      
      <!-- Next Story (Right Face) -->
      ${nextStory ? `
        <div class="story-cube-face story-cube-right">
          ${createStoryContent(nextStory)}
        </div>
      ` : ''}
    </div>
  `;
}

// Create story HTML content
function createStoryContent(story) {
  const displayName = story.isYourStory ? "My Story" : story.username;
  const timestamp = story.isYourStory ? "3 minutes ago" : "15m";

  const bottomContent = story.isYourStory 
    ? '<div class="story-no-views">No views yet</div>'
    : `<div class="story-reply-container">
         <div class="story-reply-input">
           <span class="story-reply-placeholder">Reply privately...</span>
         </div>
       </div>`;

  return `
    <div class="story-content-wrapper">
      <div class="story-viewer-container">
        <div class="story-viewer">
          <div class="story-header">
            <div class="story-progress-bars">
              <div class="story-progress-bar">
                <div class="story-progress-fill"></div>
              </div>
            </div>
            <div class="story-user-info">
              <img src="${story.avatar}" 
                   alt="${displayName}" 
                   class="story-user-avatar">
              <div class="story-user-details">
                <span class="story-user-name">${displayName}</span>
                <span class="story-user-time">${timestamp}</span>
              </div>
            </div>
          </div>
          <div class="story-background"></div>
        </div>
      </div>
      <div class="story-bottom-area">
        ${bottomContent}
      </div>
    </div>
  `;
}

// Navigate to previous/next story with cube animation
function navigateStory(direction) {
  const newIndex = currentStoryIndex + direction;
  
  // Boundary checks
  if (newIndex < 0 || newIndex >= stories.length) return;
  
  const cube = cubeContainer.querySelector('.story-cube');
  if (!cube) return;

  // Apply rotation
  const rotation = direction === 1 ? -90 : 90; // next = -90, prev = +90
  cube.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
  cube.style.transform = `rotateY(${rotation}deg)`;

  // Wait for animation, then update
  setTimeout(() => {
    currentStoryIndex = newIndex;
    cube.style.transition = 'none';
    cube.style.transform = 'rotateY(0deg)';
    renderCurrentStory();
  }, 400);
}

/* ----- pointer handlers ----- */
function onPointerDown(e) {
  if (!popupEl || !popupEl.classList.contains("active")) return;
  if (e.pointerType === "mouse" && e.button !== 0) return;

  activePointerId = e.pointerId;
  try {
    popupEl.setPointerCapture(activePointerId);
  } catch {}

  startX = e.clientX;
  startY = e.clientY;
  lastX = startX;
  lastY = startY;
  isDragging = true;
}

function onPointerMove(e) {
  if (!isDragging || e.pointerId !== activePointerId) return;
  
  lastX = e.clientX;
  lastY = e.clientY;

  const deltaX = lastX - startX;
  const deltaY = lastY - startY;

  // Visual feedback during drag
  const cube = cubeContainer?.querySelector('.story-cube');
  if (cube && Math.abs(deltaX) > Math.abs(deltaY)) {
    // Horizontal drag - show cube rotation preview
    const maxRotation = 30; // degrees
    const rotation = (deltaX / window.innerWidth) * maxRotation;
    cube.style.transition = 'none';
    cube.style.transform = `rotateY(${rotation}deg)`;
  }
}

function onPointerUp(e) {
  if (!isDragging || e.pointerId !== activePointerId) return;
  isDragging = false;
  
  try {
    popupEl.releasePointerCapture(activePointerId);
  } catch {}

  const deltaX = lastX - startX;
  const deltaY = lastY - startY;
  const absDeltaX = Math.abs(deltaX);
  const absDeltaY = Math.abs(deltaY);

  // Reset cube rotation
  const cube = cubeContainer?.querySelector('.story-cube');
  if (cube) {
    cube.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    cube.style.transform = 'rotateY(0deg)';
  }

  // Determine if horizontal or vertical swipe
  if (absDeltaX > absDeltaY) {
    // Horizontal swipe - navigate stories
    if (absDeltaX > SWIPE_THRESHOLD) {
      if (deltaX > 0) {
        // Swipe right - go to previous story (only if not first)
        if (currentStoryIndex > 0) {
          navigateStory(-1);
        }
      } else {
        // Swipe left - go to next story (only if not last)
        if (currentStoryIndex < stories.length - 1) {
          navigateStory(1);
        }
      }
    }
  } else {
    // Vertical swipe - close popup
    if (deltaY > CLOSE_THRESHOLD) {
      closeStoryPopup();
    }
  }
}
