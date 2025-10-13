// story.js
// Export stories data + functions to create/open/close the popup
export const stories = [
  {
    id: "your-story",
    username: "Your story",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abcdef4ff4e?w=400&h=400&fit=crop&crop=face",
    hasNewStory: false,
    isYourStory: true,
    storyItems: [
      {
        id: "your-1",
        background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 25%, #fecfef 50%, #a18cd1 75%, #fbc2eb 100%)",
        timestamp: "3 minutes ago"
      }
    ]
  },
  {
    id: "1",
    username: "Emily",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    hasNewStory: true,
    storyItems: [
      {
        id: "emily-1",
        background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 25%, #fecfef 50%, #a18cd1 75%, #fbc2eb 100%)",
        timestamp: "15m"
      },
      {
        id: "emily-2",
        background: "#000000",
        timestamp: "10m"
      }
    ]
  },
  {
    id: "2",
    username: "Michael",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    hasNewStory: true,
    storyItems: [
      {
        id: "michael-1",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        timestamp: "1h"
      }
    ]
  },
];

let popupEl = null;
let scene = null;
let cube = null;
let activePointerId = null;
let startX = 0;
let startY = 0;
let lastX = 0;
let lastY = 0;
let isDragging = false;
let currentStoryIndex = 0;
let currentItemIndex = 0;
let currentRotation = 0;
let pointerDownTime = 0;
const SWIPE_THRESHOLD = 80;
const CLOSE_THRESHOLD = 120;
const TAP_DURATION_THRESHOLD = 250; // Max ms for a tap
const TAP_DISTANCE_THRESHOLD = 10; // Max pixels moved for a tap

// Create popup element and wire handlers
export function createStoryPopup() {
  if (popupEl) return;

  popupEl = document.createElement("div");
  popupEl.id = "storyPopup";
  popupEl.className = "story-popup";

  // Create 3D scene
  scene = document.createElement("div");
  scene.className = "story-scene";

  // Create cube
  cube = document.createElement("div");
  cube.className = "story-cube";

  scene.appendChild(cube);
  popupEl.appendChild(scene);
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

  currentStoryIndex = stories.findIndex(s => s.id === story.id);
  if (currentStoryIndex === -1) currentStoryIndex = 0;

  currentItemIndex = 0; // Reset to first story item
  currentRotation = currentStoryIndex * -90;
  renderAllStories();
  applyCubeRotation(currentRotation, false);
  
  popupEl.classList.add("active");
  document.body.style.overflow = "hidden";
}

export function closeStoryPopup() {
  if (!popupEl) return;
  popupEl.classList.remove("active");
  document.body.style.overflow = "";
}

// Render all stories on cube faces
function renderAllStories() {
  if (!cube) return;

  cube.innerHTML = "";

  stories.forEach((story, index) => {
    const face = document.createElement("div");
    face.className = "story-cube-face";
    
    // Position each face around the cube
    const rotationY = index * 90;
    face.style.transform = `rotateY(${rotationY}deg) translateZ(192px)`;
    
    face.innerHTML = createStoryContent(story, index);
    cube.appendChild(face);
  });
}

// Create story HTML content
function createStoryContent(story, storyIndex) {
  const displayName = story.isYourStory ? "My Story" : story.username;
  const itemIndex = storyIndex === currentStoryIndex ? currentItemIndex : 0;
  const currentItem = story.storyItems[itemIndex] || { background: '#000', timestamp: 'Unknown' };

  const bottomContent = story.isYourStory 
    ? '<div class="story-no-views">No views yet</div>'
    : `<div class="story-reply-container">
         <div class="story-reply-input">
           <span class="story-reply-placeholder">Reply privately...</span>
         </div>
       </div>`;

  // Create progress bars for each story item
  const progressBars = (story.storyItems || []).map((item, idx) => {
    const isCurrent = idx === itemIndex;
    const isPast = idx < itemIndex;
    const fillClass = isPast ? 'story-progress-fill-complete' : (isCurrent ? 'story-progress-fill' : '');
    return `<div class="story-progress-bar">
              <div class="${fillClass}"></div>
            </div>`;
  }).join('');

  return `
    <div class="story-content-wrapper">
      <div class="story-viewer-container">
        <div class="story-viewer">
          <div class="story-header">
            <div class="story-progress-bars">
              ${progressBars}
            </div>
            <div class="story-user-info">
              <img src="${story.avatar}" 
                   alt="${displayName}" 
                   class="story-user-avatar">
              <div class="story-user-details">
                <span class="story-user-name">${displayName}</span>
                <span class="story-user-time">${currentItem.timestamp}</span>
              </div>
            </div>
          </div>
          <div class="story-background" style="background: ${currentItem.background}"></div>
          <div class="story-tap-zones">
            <div class="story-tap-left" data-action="prev-item" aria-label="Previous story item"></div>
            <div class="story-tap-right" data-action="next-item" aria-label="Next story item"></div>
          </div>
        </div>
      </div>
      <div class="story-bottom-area">
        ${bottomContent}
      </div>
    </div>
  `;
}

// Apply rotation to cube
function applyCubeRotation(rotation, animate = true) {
  if (!cube) return;
  
  if (animate) {
    cube.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
  } else {
    cube.style.transition = 'none';
  }
  
  cube.style.transform = `rotateY(${rotation}deg)`;
}

// Navigate to previous/next user's story (cube rotation)
function navigateStory(direction) {
  const newIndex = currentStoryIndex + direction;
  
  if (newIndex < 0 || newIndex >= stories.length) return;
  
  currentStoryIndex = newIndex;
  currentItemIndex = 0; // Reset to first item when changing users
  currentRotation = currentStoryIndex * -90;
  renderAllStories();
  applyCubeRotation(currentRotation, true);
}

// Navigate to previous/next story item within current user's stories
function navigateStoryItem(direction) {
  const currentStory = stories[currentStoryIndex];
  if (!currentStory || !currentStory.storyItems || currentStory.storyItems.length === 0) {
    console.warn('No story items available for navigation');
    return;
  }

  const newItemIndex = currentItemIndex + direction;
  
  if (newItemIndex < 0) {
    if (currentStoryIndex > 0) {
      navigateStory(-1);
    }
    return;
  }
  
  if (newItemIndex >= currentStory.storyItems.length) {
    if (currentStoryIndex < stories.length - 1) {
      navigateStory(1);
    }
    return;
  }
  
  currentItemIndex = newItemIndex;
  updateCurrentStoryFace();

  // Reset progress bar animations
  const currentFace = cube.querySelectorAll('.story-cube-face')[currentStoryIndex];
  const progressFills = currentFace.querySelectorAll('.story-progress-fill');
  progressFills.forEach(fill => {
    fill.style.animation = 'none';
    fill.offsetHeight; // Trigger reflow
    fill.style.animation = '';
  });
}

// Update only the current story face (no cube rotation)
function updateCurrentStoryFace() {
  if (!cube) return;
  
  const faces = cube.querySelectorAll('.story-cube-face');
  const currentFace = faces[currentStoryIndex];
  
  if (currentFace) {
    currentFace.innerHTML = createStoryContent(stories[currentStoryIndex], currentStoryIndex);
  }
}

/* ----- pointer handlers ----- */
function onPointerDown(e) {
  if (!popupEl || !popupEl.classList.contains("active")) return;
  if (e.pointerType === "mouse" && e.button !== 0) return;

  // Record start time for tap detection
  pointerDownTime = Date.now();

  // Check if tap is on tap zones
  const target = e.target;
  if (target.classList.contains('story-tap-left')) {
    console.log('Tapped left zone, navigating to previous item');
    e.stopPropagation();
    navigateStoryItem(-1);
    return;
  }
  if (target.classList.contains('story-tap-right')) {
    console.log('Tapped right zone, navigating to next item');
    e.stopPropagation();
    navigateStoryItem(1);
    return;
  }

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

  // Show rotation preview during drag (for user navigation)
  if (Math.abs(deltaX) > Math.abs(deltaY) && cube) {
    const dragRotation = (deltaX / window.innerWidth) * 45;
    const previewRotation = currentRotation + dragRotation;
    
    cube.style.transition = 'none';
    cube.style.transform = `rotateY(${previewRotation}deg)`;
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
  const duration = Date.now() - pointerDownTime;

  // Detect quick tap (not a swipe)
  if (duration < TAP_DURATION_THRESHOLD && absDeltaX < TAP_DISTANCE_THRESHOLD && absDeltaY < TAP_DISTANCE_THRESHOLD) {
    applyCubeRotation(currentRotation, true);
    return;
  }

  // Handle swipe gestures
  if (absDeltaX > absDeltaY) {
    if (absDeltaX > SWIPE_THRESHOLD) {
      if (deltaX > 0 && currentStoryIndex > 0) {
        navigateStory(-1);
      } else if (deltaX < 0 && currentStoryIndex < stories.length - 1) {
        navigateStory(1);
      } else {
        applyCubeRotation(currentRotation, true);
      }
    } else {
      applyCubeRotation(currentRotation, true);
    }
  } else {
    applyCubeRotation(currentRotation, true);
    if (deltaY > CLOSE_THRESHOLD) {
      closeStoryPopup();
    }
  }
}
