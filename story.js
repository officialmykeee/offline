// Story Data
const stories = [
  { id: "your-story", username: "Your story", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face", hasNewStory: false, isYourStory: true },
  { id: "1", username: "Emily", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face", hasNewStory: true },
  { id: "2", username: "Michael", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face", hasNewStory: true },
];

// -----------------------------------------------------------------
// POP-UP CREATION AND MANAGEMENT
// -----------------------------------------------------------------

// Create the pop-up div in JavaScript
const storyPopup = document.createElement('div');
storyPopup.id = 'story-popup';
storyPopup.className = 'story-popup';
storyPopup.innerHTML = `
  <div class="popup-content">
    </div>
`;

// Append it to the body so it covers the whole screen
document.body.appendChild(storyPopup);

// Function to show the pop-up
function openStoryPopup(storyId) {
  // console.log(`Opening story for ID: ${storyId}`);
  storyPopup.classList.add('open');
  // Optional: prevent background scrolling
  document.body.style.overflow = 'hidden';
}

// Function to close the pop-up
function closeStoryPopup() {
  storyPopup.classList.remove('open');
  document.body.style.overflow = ''; // Restore background scrolling
}

// Close pop-up when clicking the background (or any part of the pop-up)
storyPopup.addEventListener('click', closeStoryPopup);

// Stop propagation on the content to prevent it from closing when clicking inside
storyPopup.querySelector('.popup-content').addEventListener('click', (e) => {
    e.stopPropagation();
});


// -----------------------------------------------------------------
// STORY RENDERING LOGIC
// -----------------------------------------------------------------

function renderStories() {
  const storiesList = document.getElementById("storiesList");
  if (!storiesList) return; // Exit if the element is not found

  storiesList.innerHTML = "";
  stories.forEach((story) => {
    const storyElement = document.createElement("div");
    storyElement.className = "story-item";
    storyElement.dataset.storyId = story.id; // Add ID for click handler

    const avatarRingClass = story.isYourStory
      ? "your-story"
      : story.hasNewStory
      ? "has-story"
      : "your-story";

    storyElement.innerHTML = `
      <div class="story-avatar-container">
        <div class="story-avatar-ring ${avatarRingClass}">
          <div class="story-avatar-bg">
            <img src="${story.avatar}" alt="${story.username}" class="story-avatar">
          </div>
        </div>
        ${story.isYourStory ? '<div class="story-plus">+</div>' : ""}
      </div>
      <span class="story-username">${story.username}</span>
    `;

    // Add click event listener to open the pop-up
    storyElement.addEventListener('click', () => openStoryPopup(story.id));

    storiesList.appendChild(storyElement);
  });
}

// Render stories when the module loads and the DOM is ready
document.addEventListener('DOMContentLoaded', renderStories);

