const stories = [
  { id: "your-story", username: "Your story", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face", hasNewStory: false, isYourStory: true },
  { id: "1", username: "Emily", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face", hasNewStory: true },
  { id: "2", username: "Michael", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face", hasNewStory: true },
];

function renderStories() {
  const storiesList = document.getElementById("storiesList");
  storiesList.innerHTML = "";
  stories.forEach((story) => {
    const storyElement = document.createElement("div");
    storyElement.className = "story-item";
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
    storyElement.addEventListener("click", () => showStoryPopup(story));
    storiesList.appendChild(storyElement);
  });
}

function showStoryPopup(story) {
  const popup = document.getElementById("storyPopup");
  const popupImage = document.getElementById("storyPopupImage");
  const popupUsername = document.getElementById("storyPopupUsername");

  popupImage.src = story.avatar;
  popupImage.alt = story.username;
  popupUsername.textContent = story.username;
  popup.style.display = "flex";
}

function closeStoryPopup() {
  const popup = document.getElementById("storyPopup");
  popup.style.display = "none";
}

document.getElementById("storyPopupClose").addEventListener("click", closeStoryPopup);

renderStories();
