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
    if (e.propertyName === "transform" && !popupEl.classList.contains("active")) {
      // fully closed -> reset inline styles
      popupEl.style.transform = "";
      popupEl.style.transition = "";
      popupEl.style.opacity = "";
      document.body.style.overflow = "";
    }
  });
}

// Immediately make popup visible (instant) — only closes by dragging down
export function openStoryPopup() {
  if (!popupEl) createStoryPopup();
  // show instantly (no slide-in)
  popupEl.classList.add("active");
  popupEl.style.transition = ""; // ensure no show animation
  popupEl.style.transform = "translateY(0)";
  popupEl.style.opacity = "1";
  document.body.style.overflow = "hidden"; // prevent background scroll while open
}

// Programmatic close (not used for background click; used internally after slide)
export function closeStoryPopup() {
  if (!popupEl) return;
  popupEl.classList.remove("active");
  popupEl.style.transform = "";
  popupEl.style.opacity = "";
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
  // while dragging we want immediate transforms (no CSS transition)
  popupEl.style.transition = "none";
}

function onPointerMove(e) {
  if (!isDragging || e.pointerId !== activePointerId) return;
  const deltaY = e.clientY - startY;
  lastY = e.clientY;

  // Only allow dragging down (positive delta)
  if (deltaY > 0) {
    popupEl.style.transform = `translateY(${deltaY}px)`;
    // optional: slightly fade as user drags (helps feedback)
    const fadeRatio = Math.max(0, 1 - deltaY / (window.innerHeight * 0.8));
    popupEl.style.opacity = `${fadeRatio}`;
  } else {
    // don't let user drag up
    popupEl.style.transform = `translateY(0)`;
    popupEl.style.opacity = "1";
  }
}

function onPointerUp(e) {
  if (!isDragging || e.pointerId !== activePointerId) return;
  isDragging = false;
  try {
    popupEl.releasePointerCapture(activePointerId);
  } catch (err) {}

  const delta = lastY - startY;

  // set a closing animation for transform + opacity
  popupEl.style.transition = "transform 250ms ease, opacity 200ms ease";

  if (delta > THRESHOLD) {
    // slide down off-screen and hide
    popupEl.style.transform = `translateY(100vh)`;
    popupEl.style.opacity = "0";
    // transitionend handler will reset and restore body overflow
  } else {
    // snap back to fully visible
    popupEl.style.transform = "";
    popupEl.style.opacity = "1";
    // clear transition after it finishes so next drag is immediate
    setTimeout(() => {
      popupEl.style.transition = "";
    }, 260);
  }
}
