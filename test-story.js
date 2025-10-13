// story.js

export const stories = [
  {
    id: "your-story",
    username: "Your story",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    hasNewStory: false,
    isYourStory: true,
    items: [
      { type: "image", src: "https://placekitten.com/800/1000" },
    ],
  },
  {
    id: "1",
    username: "Emily",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    hasNewStory: true,
    items: [
      { type: "image", src: "https://placekitten.com/801/1000" },
      { type: "image", src: "https://placekitten.com/802/1000" },
    ],
  },
  {
    id: "2",
    username: "Michael",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    hasNewStory: true,
    items: [
      { type: "image", src: "https://placekitten.com/803/1000" },
    ],
  },
];

let popupEl = null;
let currentStory = null;
let currentItemIndex = 0;

// Create popup element once
export function createStoryPopup() {
  popupEl = document.createElement("div");
  popupEl.className = "story-popup";
  popupEl.innerHTML = `
    <div class="story-popup-content">
      <div class="story-popup-header">
        <div class="story-back">&larr;</div>
        <div class="story-username"></div>
      </div>
      <div class="story-inner">
        <img class="story-media" src="" alt="">
        <div class="story-tap-left"></div>
        <div class="story-tap-right"></div>
      </div>
    </div>
  `;
  document.body.appendChild(popupEl);

  // Close popup
  popupEl.querySelector(".story-back").addEventListener("click", closeStoryPopup);

  // Tap areas
  popupEl.querySelector(".story-tap-left").addEventListener("click", showPreviousItem);
  popupEl.querySelector(".story-tap-right").addEventListener("click", showNextItem);
}

// Open popup for a story
export function openStoryPopup(story) {
  if (!popupEl) createStoryPopup();

  // Identify the clicked story (fix if event passed)
  if (story.target) {
    const username = story.currentTarget.querySelector(".story-username")?.textContent;
    story = stories.find((s) => s.username === username);
  }

  currentStory = story;
  currentItemIndex = 0;

  popupEl.querySelector(".story-username").textContent = story.username;
  showCurrentItem();
  popupEl.classList.add("active");
}

// Close popup
export function closeStoryPopup() {
  popupEl.classList.remove("active");
  currentStory = null;
}

// Internal item switching
function showCurrentItem() {
  if (!currentStory) return;
  const mediaEl = popupEl.querySelector(".story-media");
  const item = currentStory.items[currentItemIndex];

  if (!item) return;

  // Set source instantly (no fade)
  if (item.type === "image") {
    mediaEl.src = item.src;
  } else if (item.type === "video") {
    // optionally support video later
  }
}

// Tap right → next
function showNextItem() {
  if (!currentStory) return;
  if (currentItemIndex < currentStory.items.length - 1) {
    currentItemIndex++;
    showCurrentItem();
  } else {
    closeStoryPopup();
  }
}

// Tap left → previous
function showPreviousItem() {
  if (!currentStory) return;
  if (currentItemIndex > 0) {
    currentItemIndex--;
    showCurrentItem();
  } else {
    closeStoryPopup();
  }
}
