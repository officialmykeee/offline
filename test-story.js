// story.js
// Enhanced with multi-story support per user and tap navigation

// Detect Opera Mini and add class to html element
function detectOperaMini() {
  const ua = navigator.userAgent.toLowerCase();
  const isOperaMini = (
    ua.indexOf('opera mini') > -1 ||
    ua.indexOf('opr/') > -1 ||
    (typeof window.operamini !== 'undefined') ||
    Object.prototype.toString.call(window.operamini) === '[object OperaMini]'
  );
  
  if (isOperaMini) {
    document.documentElement.classList.add('opera-mini');
    console.log('Opera Mini detected!');
  } else {
    console.log('Not Opera Mini. User Agent:', navigator.userAgent);
  }
}

// Call it when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', detectOperaMini);
} else {
  detectOperaMini();
}

export const stories = [
  {
    id: "your-story",
    username: "Your story",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    hasNewStory: false,
    isYourStory: true,
    internalStories: [
      { type: "gradient" }
    ]
  },
  {
    id: "1",
    username: "Emily",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    hasNewStory: true,
    internalStories: [
      { type: "gradient" },
      { type: "black" }
    ]
  },
  {
    id: "2",
    username: "Michael",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    hasNewStory: true,
    internalStories: [
      { type: "gradient" }
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
let currentInternalIndex = 0;
let currentRotation = 0;
const SWIPE_THRESHOLD = 80;
const CLOSE_THRESHOLD = 120;
const TAP_THRESHOLD = 10;

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
  
  currentInternalIndex = 0;
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
    
    // Create container for internal stories
    const internalContainer = document.createElement("div");
    internalContainer.className = "story-internal-container";
    internalContainer.setAttribute("data-story-index", index);
    
    // Render all internal stories for this user
    story.internalStories.forEach((internalStory, internalIdx) => {
      const storySlide = document.createElement("div");
      storySlide.className = "story-internal-slide";
      storySlide.setAttribute("data-internal-index", internalIdx);
      
      if (index === currentStoryIndex && internalIdx === currentInternalIndex) {
        storySlide.classList.add("active");
      }
      
      storySlide.innerHTML = createStoryContent(story, internalStory, internalIdx, story.internalStories.length);
      internalContainer.appendChild(storySlide);
    });
    
    face.appendChild(internalContainer);
    cube.appendChild(face);
  });
}

// Create story HTML content
function createStoryContent(story, internalStory, internalIdx, totalInternal) {
  const displayName = story.isYourStory ? "My Story" : story.username;
  const timestamp = story.isYourStory ? "3 minutes ago" : "15m";

  // Generate progress bars based on total internal stories
  const progressBars = Array.from({ length: totalInternal }, (_, i) => {
    const isFilled = i < internalIdx;
    const isCurrent = i === internalIdx;
    const fillClass = isFilled ? 'filled' : (isCurrent ? 'current' : '');
    return `
      <div class="story-progress-bar">
        <div class="story-progress-fill ${fillClass}"></div>
      </div>
    `;
  }).join('');

  const bottomContent = story.isYourStory 
    ? '<div class="story-no-views">No views yet</div>'
    : `<div class="story-reply-container">
         <div class="story-reply-input">
           <span class="story-reply-placeholder">Reply privately...</span>
         </div>
       </div>`;

  // Determine background based on internal story type
  const backgroundClass = internalStory.type === "black" ? "story-background-black" : "story-background";

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
                <span class="story-user-time">${timestamp}</span>
              </div>
            </div>
          </div>
          <div class="${backgroundClass}"></div>
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

// Navigate to previous/next user story (with cube effect)
function navigateStory(direction) {
  const newIndex = currentStoryIndex + direction;
  
  if (newIndex < 0 || newIndex >= stories.length) return;
  
  currentStoryIndex = newIndex;
  currentInternalIndex = 0;
  currentRotation = currentStoryIndex * -90;
  
  renderAllStories();
  applyCubeRotation(currentRotation, true);
}

// Navigate internal stories (instant, no animation)
function navigateInternalStory(direction) {
  const currentStory = stories[currentStoryIndex];
  if (!currentStory) return;
  
  const newInternalIndex = currentInternalIndex + direction;
  
  if (newInternalIndex < 0 || newInternalIndex >= currentStory.internalStories.length) {
    return;
  }
  
  currentInternalIndex = newInternalIndex;
  updateInternalStoryDisplay();
}

// Update internal story display (instant switch)
function updateInternalStoryDisplay() {
  const activeFace = cube.querySelector(`.story-cube-face:nth-child(${currentStoryIndex + 1})`);
  if (!activeFace) return;
  
  const allSlides = activeFace.querySelectorAll('.story-internal-slide');
  
  allSlides.forEach((slide, idx) => {
    if (idx === currentInternalIndex) {
      slide.classList.add('active');
    } else {
      slide.classList.remove('active');
    }
  });
}

// Handle tap on left/right side of screen
function handleTap(clientX) {
  const screenWidth = window.innerWidth;
  const tapZone = screenWidth / 3;
  
  if (clientX < tapZone) {
    // Left tap - previous internal story
    navigateInternalStory(-1);
  } else if (clientX > screenWidth - tapZone) {
    // Right tap - next internal story
    navigateInternalStory(1);
  }
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

  // Show rotation preview during drag
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

  // Check if it's a tap (minimal movement)
  if (absDeltaX < TAP_THRESHOLD && absDeltaY < TAP_THRESHOLD) {
    handleTap(e.clientX);
    return;
  }

  // Determine gesture type
  if (absDeltaX > absDeltaY) {
    // Horizontal swipe - navigate between users
    if (absDeltaX > SWIPE_THRESHOLD) {
      if (deltaX > 0 && currentStoryIndex > 0) {
        navigateStory(-1);
      } else if (deltaX < 0 && currentStoryIndex < stories.length - 1) {
        navigateStory(1);
      } else {
        // Bounce back if at boundary
        applyCubeRotation(currentRotation, true);
      }
    } else {
      // Snap back if didn't reach threshold
      applyCubeRotation(currentRotation, true);
    }
  } else {
    // Vertical swipe - close popup
    applyCubeRotation(currentRotation, true);
    if (deltaY > CLOSE_THRESHOLD) {
      closeStoryPopup();
    }
  }
}
