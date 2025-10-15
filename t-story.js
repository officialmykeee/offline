function onPointerDown(e) {
  if (!popupEl || !popupEl.classList.contains("active")) {
    console.log('PointerDown ignored: Popup not active');
    return;
  }
  if (e.pointerType === "mouse" && e.button !== 0) {
    console.log('PointerDown ignored: Non-primary mouse button');
    return;
  }
  
  // Check for interactive elements first - MUST return early to prevent isDragging from being set
  const isInteractiveElement = e.target.closest('.story-heart-icon, .story-reply-input, .story-reply-placeholder, .story-heart-icon *');
  if (isInteractiveElement) {
    console.log('PointerDown on interactive element - exiting early:', e.target);
    // Don't set isDragging, don't capture pointer, just exit
    return;
  }

  console.log('PointerDown on navigation area:', e.target);
  activePointerId = e.pointerId;
  try {
    popupEl.setPointerCapture(activePointerId);
  } catch (err) {
    console.error('Pointer capture failed:', err);
  }

  startX = e.clientX;
  startY = e.clientY;
  lastX = startX;
  lastY = startY;
  isDragging = true;
  stopProgressTimer(); // Pause timer on interaction
}
