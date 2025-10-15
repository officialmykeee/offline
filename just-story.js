// story.js
// export stories data + functions to create/open/close the popup

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

// Track liked stories
const likedStories = new Set();

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
let currentRotation = 0;
const SWIPE_THRESHOLD = 80;
const CLOSE_THRESHOLD = 120;

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
    
    face.innerHTML = createStoryContent(story);
    cube.appendChild(face);

    // Add click handler for heart icon if not your story
    if (!story.isYourStory) {
      const heartContainer = face.querySelector('.story-heart-container');
      if (heartContainer) {
        heartContainer.addEventListener('click', () => {
          if (likedStories.has(story.id)) {
            likedStories.delete(story.id);
            heartContainer.classList.remove('active');
          } else {
            likedStories.add(story.id);
            heartContainer.classList.add('active');
          }
        });
        // Set initial state based on likedStories
        if (likedStories.has(story.id)) {
          heartContainer.classList.add('active');
        }
      }
    }
  });
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
         <div class="story-heart-container">
           <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
             <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
             <g id="SVGRepo_iconCarrier">
               <path d="M15.7 4C18.87 4 21 6.98 21 9.76C21 15.39 12.16 20 12 20C11.84 20 3 15.39 3 9.76C3 6.98 5.13 4 8.3 4C10.12 4 11.31 4.91 12 5.71C12.69 4.91 13.88 4 15.7 4Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
             </g>
           </svg>
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

// Navigate to previous/next story
function navigateStory(direction) {
  const newIndex = currentStoryIndex + direction;
  
  if (newIndex < 0 || newIndex >= stories.length) return;
  
  currentStoryIndex = newIndex;
  currentRotation = currentStoryIndex * -90;
  applyCubeRotation(currentRotation, true);
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

  // Determine gesture type
  if (absDeltaX > absDeltaY) {
    // Horizontal swipe - navigate stories
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
