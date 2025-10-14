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
    internalStories: [
      {
        id: "your-story-1",
        background: "gradient",
        mediaType: "color" // color, image, video
      }
    ]
  },
  {
    id: "1",
    username: "Emily",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    hasNewStory: true,
    internalStories: [
      {
        id: "emily-1",
        background: "gradient",
        mediaType: "color"
      },
      {
        id: "emily-2",
        background: "black",
        mediaType: "color"
      }
    ]
  },
  {
    id: "2",
    username: "Michael",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    hasNewStory: true,
    internalStories: [
      {
        id: "michael-1",
        background: "gradient",
        mediaType: "color"
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
let currentUserIndex = 0;
let currentInternalStoryIndex = 0;
let currentRotation = 0;
let progressTimer = null;
const SWIPE_THRESHOLD = 80;
const CLOSE_THRESHOLD = 120;
const TAP_THRESHOLD = 10;
const STORY_DURATION = 5000; // 5 seconds per story, like WhatsApp

// Create popup element and wire handlers
export function createStoryPopup() {
  if (popupEl) return;

  popupEl = document.createElement("div");
  popupEl.id = "storyPopup";
  popupEl.className = "story-popup";

  scene = document.createElement("div");
  scene.className = "story-scene";

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
      stopProgressTimer();
    }
  });
}

// Open story at specific user and internal story index
export function openStoryPopup(story) {
  if (!popupEl) createStoryPopup();
  if (!story) return;

  currentUserIndex = stories.findIndex(s => s.id === story.id);
  if (currentUserIndex === -1) currentUserIndex = 0;
  currentInternalStoryIndex = 0;

  currentRotation = currentUserIndex * -90;
  renderAllStories();
  applyCubeRotation(currentRotation, false);
  renderInternalStory();
  startProgressTimer();

  popupEl.classList.add("active");
  document.body.style.overflow = "hidden";
}

export function closeStoryPopup() {
  if (!popupEl) return;
  popupEl.classList.remove("active");
  document.body.style.overflow = "";
  stopProgressTimer();
}

// Render all users' stories on cube faces
function renderAllStories() {
  if (!cube) return;

  cube.innerHTML = "";

  stories.forEach((story, index) => {
    const face = document.createElement("div");
    face.className = "story-cube-face";
    
    const rotationY = index * 90;
    face.style.transform = `rotateY(${rotationY}deg) translateZ(192px)`;
    
    const internalStoriesContainer = document.createElement("div");
    internalStoriesContainer.className = "internal-stories-container";
    
    const currentStory = story.internalStories[currentInternalStoryIndex] || story.internalStories[0];
    internalStoriesContainer.innerHTML = createStoryContent(story, currentStory);
    
    face.appendChild(internalStoriesContainer);
    cube.appendChild(face);
  });
}

// Render specific internal story for the current user
function renderInternalStory() {
  const currentStory = stories[currentUserIndex];
  const internalStory = currentStory.internalStories[currentInternalStoryIndex];
  const face = cube.children[currentUserIndex];
  const internalStoriesContainer = face.querySelector(".internal-stories-container");
  
  if (internalStoriesContainer) {
    internalStoriesContainer.innerHTML = createStoryContent(currentStory, internalStory);
    updateProgressBars();
    extractDominantColor();
    attachHeartClickHandler();
  }
}

// Attach heart icon click handler
function attachHeartClickHandler() {
  const heartIcons = document.querySelectorAll('.story-heart-icon');
  heartIcons.forEach(heart => {
    heart.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      heart.classList.toggle('liked');
    });
  });
}

// Extract dominant color from image if needed
function extractDominantColor() {
  const images = document.querySelectorAll('.story-media-image[data-extract-color="true"]');
  
  images.forEach(img => {
    if (img.complete) {
      applyDominantColor(img);
    } else {
      img.addEventListener('load', () => applyDominantColor(img));
    }
  });
}

// Apply dominant color to background
function applyDominantColor(img) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  
  try {
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    let r = 0, g = 0, b = 0;
    const pixelCount = pixels.length / 4;
    
    for (let i = 0; i < pixels.length; i += 4) {
      r += pixels[i];
      g += pixels[i + 1];
      b += pixels[i + 2];
    }
    
    r = Math.floor(r / pixelCount);
    g = Math.floor(g / pixelCount);
    b = Math.floor(b / pixelCount);
    
    const dominantColor = `rgb(${r}, ${g}, ${b})`;
    const background = img.parentElement.querySelector('.story-media-background');
    
    if (background) {
      background.style.backgroundColor = dominantColor;
    }
  } catch (e) {
    console.error('Could not extract color due to CORS:', e);
  }
}

// Create story HTML content
function createStoryContent(story, internalStory) {
  const displayName = story.isYourStory ? "My Story" : story.username;
  const timestamp = story.isYourStory ? "3 minutes ago" : "15m";
  
  // Determine media content based on mediaType
  let mediaContent = '';
  
  if (internalStory.mediaType === 'image' && internalStory.mediaUrl) {
    // Image with blur background or color fill
    const fillStrategy = internalStory.fillStrategy || 'blur'; // blur, color, dominant
    
    if (fillStrategy === 'blur') {
      mediaContent = `
        <div class="story-media-container">
          <div class="story-media-background" style="background-image: url('${internalStory.mediaUrl}');"></div>
          <img src="${internalStory.mediaUrl}" alt="Story" class="story-media-image" />
        </div>
      `;
    } else if (fillStrategy === 'color') {
      const fillColor = internalStory.fillColor || '#000000';
      mediaContent = `
        <div class="story-media-container">
          <div class="story-media-background" style="background-color: ${fillColor};"></div>
          <img src="${internalStory.mediaUrl}" alt="Story" class="story-media-image" />
        </div>
      `;
    } else if (fillStrategy === 'dominant') {
      // Will be calculated dynamically
      const fillColor = internalStory.dominantColor || '#000000';
      mediaContent = `
        <div class="story-media-container">
          <div class="story-media-background" style="background-color: ${fillColor};"></div>
          <img src="${internalStory.mediaUrl}" alt="Story" class="story-media-image" data-extract-color="true" />
        </div>
      `;
    }
  } else if (internalStory.mediaType === 'video' && internalStory.mediaUrl) {
    // Video with color fill
    const fillColor = internalStory.fillColor || '#000000';
    mediaContent = `
      <div class="story-media-container">
        <div class="story-media-background" style="background-color: ${fillColor};"></div>
        <video src="${internalStory.mediaUrl}" class="story-media-video" playsinline autoplay muted loop></video>
      </div>
    `;
  } else {
    // Color/gradient only (no media)
    const backgroundClass = internalStory.background === "black" ? "story-background-black" : "story-background";
    mediaContent = `<div class="${backgroundClass}"></div>`;
  }

  const bottomContent = story.isYourStory 
    ? '<div class="story-no-views">No views yet</div>'
    : `<div class="story-reply-container">
         <div class="story-reply-input" data-story-id="${internalStory.id}">
           <span class="story-reply-placeholder">Reply to ${displayName}'s story...</span>
         </div>
         <svg class="story-heart-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
           <path d="M15.7 4C18.87 4 21 6.98 21 9.76C21 15.39 12.16 20 12 20C11.84 20 3 15.39 3 9.76C3 6.98 5.13 4 8.3 4C10.12 4 11.31 4.91 12 5.71C12.69 4.91 13.88 4 15.7 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
         </svg>
       </div>`;

  return `
    <div class="story-content-wrapper">
      <div class="story-viewer-container">
        <div class="story-viewer">
          <div class="story-header">
            <div class="story-progress-bars">
              ${createProgressBars(story.internalStories, internalStory.id)}
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
          ${mediaContent}
        </div>
      </div>
      <div class="story-bottom-area">
        ${bottomContent}
      </div>
    </div>
  `;
}

// Create progress bars for internal stories
function createProgressBars(internalStories, currentInternalStoryId) {
  return internalStories.map((story, index) => `
    <div class="story-progress-bar ${story.id === currentInternalStoryId ? 'active' : ''}" data-story-id="${story.id}">
      <div class="story-progress-fill"></div>
    </div>
  `).join('');
}

// Update progress bar fill animation
function updateProgressBars() {
  const currentStory = stories[currentUserIndex];
  const currentInternalStoryId = currentStory.internalStories[currentInternalStoryIndex].id;
  const progressBars = cube.children[currentUserIndex].querySelectorAll('.story-progress-bar');
  
  progressBars.forEach((bar, index) => {
    const fill = bar.querySelector('.story-progress-fill');
    if (bar.dataset.storyId === currentInternalStoryId) {
      // Reset to 0 before animating
      fill.style.transition = 'none';
      fill.style.width = '0';
      bar.classList.add('active');
      // Force reflow to ensure reset applies
      void fill.offsetWidth;
      // Use requestAnimationFrame to ensure animation triggers
      requestAnimationFrame(() => {
        fill.style.transition = `width ${STORY_DURATION}ms linear`;
        fill.style.width = '100%';
      });
    } else if (index < currentInternalStoryIndex) {
      bar.classList.remove('active');
      fill.style.transition = 'none';
      fill.style.width = '100%';
    } else {
      bar.classList.remove('active');
      fill.style.transition = 'none';
      fill.style.width = '0';
    }
  });
}

// Start progress timer for auto-filling
function startProgressTimer() {
  stopProgressTimer(); // Clear any existing timer
  
  progressTimer = setTimeout(() => {
    const currentStory = stories[currentUserIndex];
    const nextInternalIndex = currentInternalStoryIndex + 1;
    
    if (nextInternalIndex < currentStory.internalStories.length) {
      // Move to next internal story
      currentInternalStoryIndex = nextInternalIndex;
      renderInternalStory();
      startProgressTimer();
    } else if (currentUserIndex < stories.length - 1) {
      // Move to next user
      navigateUser(1);
      startProgressTimer();
    } else {
      // Last story of last user, close popup
      closeStoryPopup();
    }
  }, STORY_DURATION);
}

// Stop progress timer
function stopProgressTimer() {
  if (progressTimer) {
    clearTimeout(progressTimer);
    progressTimer = null;
  }
  // Reset all progress bars to prevent stale animations
  const progressBars = document.querySelectorAll('.story-progress-bar');
  progressBars.forEach(bar => {
    const fill = bar.querySelector('.story-progress-fill');
    fill.style.transition = 'none';
    fill.style.width = '0';
    bar.classList.remove('active');
  });
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

// Navigate to previous/next user
function navigateUser(direction) {
  const newIndex = currentUserIndex + direction;
  
  if (newIndex < 0 || newIndex >= stories.length) return;
  
  currentUserIndex = newIndex;
  currentInternalStoryIndex = 0;
  currentRotation = currentUserIndex * -90;
  applyCubeRotation(currentRotation, true);
  renderInternalStory();
  startProgressTimer();
}

// Navigate to previous/next internal story
function navigateInternalStory(direction) {
  const currentStory = stories[currentUserIndex];
  const newIndex = currentInternalStoryIndex + direction;
  
  if (newIndex < 0 || newIndex >= currentStory.internalStories.length) {
    navigateUser(direction);
    return;
  }
  
  currentInternalStoryIndex = newIndex;
  renderInternalStory();
  startProgressTimer();
}

/* ----- pointer handlers ----- */
function onPointerDown(e) {
  if (!popupEl || !popupEl.classList.contains("active")) return;
  if (e.pointerType === "mouse" && e.button !== 0) return;
  
  // Ignore if clicking on heart icon, reply input, or bottom area
  if (e.target.closest('.story-heart-icon') || 
      e.target.closest('.story-reply-input') ||
      e.target.closest('.story-bottom-area')) {
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
  stopProgressTimer(); // Pause timer on interaction
}

function onPointerMove(e) {
  if (!isDragging || e.pointerId !== activePointerId) return;
  
  lastX = e.clientX;
  lastY = e.clientY;

  const deltaX = lastX - startX;
  const deltaY = lastY - startY;

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

  if (absDeltaX < TAP_THRESHOLD && absDeltaY < TAP_THRESHOLD) {
    const halfWidth = window.innerWidth / 2;
    if (startX > halfWidth) {
      navigateInternalStory(1);
    } else {
      navigateInternalStory(-1);
    }
    return;
  }

  if (absDeltaX > absDeltaY) {
    if (absDeltaX > SWIPE_THRESHOLD) {
      if (deltaX > 0 && currentUserIndex > 0) {
        navigateUser(-1);
      } else if (deltaX < 0 && currentUserIndex < stories.length - 1) {
        navigateUser(1);
      } else {
        applyCubeRotation(currentRotation, true);
        startProgressTimer();
      }
    } else {
      applyCubeRotation(currentRotation, true);
      startProgressTimer();
    }
  } else {
    applyCubeRotation(currentRotation, true);
    // Only check for down swipe close if not interacting with bottom area
    if (deltaY > CLOSE_THRESHOLD) {
      closeStoryPopup();
    } else {
      startProgressTimer();
    }
  }
}
