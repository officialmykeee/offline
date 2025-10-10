// story.js
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

// --- Create popup ---
const popup = document.createElement("div");
popup.className = "story-popup";
document.body.appendChild(popup);

let startY = 0;
let currentY = 0;
let isDragging = false;

// Open popup instantly
export function openStoryPopup() {
  popup.classList.add("active");
}

// Close popup
export function closeStoryPopup() {
  popup.classList.remove("active");
  popup.style.transform = "";
}

// --- Drag to slide down & close ---
popup.addEventListener("touchstart", (e) => {
  startY = e.touches[0].clientY;
  isDragging = true;
});

popup.addEventListener("touchmove", (e) => {
  if (!isDragging) return;
  currentY = e.touches[0].clientY;
  const delta = currentY - startY;

  // Only drag down
  if (delta > 0) {
    popup.style.transform = `translateY(${delta}px)`;
  }
});

popup.addEventListener("touchend", () => {
  isDragging = false;
  const delta = currentY - startY;

  // If dragged enough, close; else, snap back
  if (delta > 120) {
    popup.style.transition = "transform 0.25s ease";
    popup.style.transform = `translateY(100%)`;
    setTimeout(() => {
      closeStoryPopup();
      popup.style.transition = "";
    }, 250);
  } else {
    popup.style.transition = "transform 0.25s ease";
    popup.style.transform = "";
    setTimeout(() => (popup.style.transition = ""), 250);
  }
});
