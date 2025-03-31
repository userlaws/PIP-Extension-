// Site detection
const hostname = window.location.hostname;
let video = null;
let lastPosition = null;
let gestureStartX = 0;
let gestureStartY = 0;

// Platform-specific selectors
const PLATFORM_SELECTORS = {
  'youtube.com': 'video',
  'netflix.com': 'video',
  'amazon.com': 'video',
  'primevideo.com': 'video',
  'hulu.com': 'video',
  'disneyplus.com': 'video',
  'hbomax.com': 'video',
  'peacocktv.com': 'video',
  'crunchyroll.com': 'video',
  'twitch.tv': 'video',
};

// State management
let isDisplayHidden = false;
let currentSpeed = 1.0;
let currentBrightness = 100;
let isZoomed = false;

// Smart position memory
function savePosition() {
  if (document.pictureInPictureElement) {
    const pipWindow = document.pictureInPictureElement;
    lastPosition = {
      x: pipWindow.screenX,
      y: pipWindow.screenY,
      width: pipWindow.width,
      height: pipWindow.height,
    };
    chrome.storage.local.set({ lastPosition });
  }
}

// Initialize video element and event listeners
function initializeVideoElement() {
  video = document.querySelector('video');

  if (video) {
    // Add PiP event listeners
    video.addEventListener('enterpictureinpicture', (event) => {
      event.target.addEventListener('resize', handlePiPResize);

      // Restore last position if available
      chrome.storage.local.get(['lastPosition'], (result) => {
        if (result.lastPosition) {
          const pipWindow = event.pictureInPictureWindow;
          pipWindow.width = result.lastPosition.width;
          pipWindow.height = result.lastPosition.height;
        }
      });

      // Add double-tap gesture for quick actions
      video.addEventListener('dblclick', handleDoubleTap);
    });

    video.addEventListener('leavepictureinpicture', (event) => {
      event.target.removeEventListener('resize', handlePiPResize);
      event.target.removeEventListener('dblclick', handleDoubleTap);
      savePosition();
    });

    // Smart resume feature
    video.addEventListener('pause', () => {
      if (document.pictureInPictureElement) {
        setTimeout(() => {
          // Auto-resume if paused for more than 2 seconds (e.g., after an ad)
          if (video.paused && document.pictureInPictureElement) {
            video.play();
          }
        }, 2000);
      }
    });

    return true;
  }
  return false;
}

// Try to initialize immediately
initializeVideoElement();

// If video element is not found, keep trying
if (!video) {
  const observer = new MutationObserver((mutations, obs) => {
    if (initializeVideoElement()) {
      obs.disconnect(); // Stop observing once video is found
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Handle double-tap gesture
function handleDoubleTap(e) {
  if (!document.pictureInPictureElement) return;

  const x = e.clientX;
  const width = video.offsetWidth;

  // Left side: skip backward, Right side: skip forward
  if (x < width / 2) {
    skipBackward();
  } else {
    skipForward();
  }
}

// Smart size adjustment based on content
function handlePiPResize(event) {
  const pipWindow = event.target;
  const width = pipWindow.width;
  const height = pipWindow.height;

  // If PiP window is too small, exit PiP mode
  if (width < 200 || height < 150) {
    document.exitPictureInPicture();
    return;
  }

  // Optimize size based on content type
  if (hostname.includes('youtube.com')) {
    // YouTube typically has 16:9 ratio
    const optimalHeight = (width * 9) / 16;
    if (Math.abs(height - optimalHeight) > 20) {
      pipWindow.height = optimalHeight;
    }
  }
}

function triggerPiP() {
  if (video) {
    if (document.pictureInPictureElement) {
      savePosition();
      document.exitPictureInPicture();
    } else {
      video.requestPictureInPicture();
    }
  }
}

// Platform-specific control functions (only used when triggered from popup)
function skipForward() {
  if (!video || !document.pictureInPictureElement) return;

  if (hostname.includes('youtube.com')) {
    video.currentTime += 10;
  } else if (hostname.includes('netflix.com')) {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
  } else if (
    hostname.includes('amazon.com') ||
    hostname.includes('primevideo.com')
  ) {
    video.currentTime += 10;
  } else if (hostname.includes('hulu.com')) {
    video.currentTime += 10;
  } else if (hostname.includes('disneyplus.com')) {
    video.currentTime += 10;
  } else if (hostname.includes('hbomax.com')) {
    video.currentTime += 10;
  } else if (hostname.includes('peacocktv.com')) {
    video.currentTime += 10;
  } else if (hostname.includes('crunchyroll.com')) {
    video.currentTime += 10;
  } else if (hostname.includes('twitch.tv')) {
    video.currentTime += 10;
  }
}

function skipBackward() {
  if (!video || !document.pictureInPictureElement) return;

  if (hostname.includes('youtube.com')) {
    video.currentTime -= 10;
  } else if (hostname.includes('netflix.com')) {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
  } else if (
    hostname.includes('amazon.com') ||
    hostname.includes('primevideo.com')
  ) {
    video.currentTime -= 10;
  } else if (hostname.includes('hulu.com')) {
    video.currentTime -= 10;
  } else if (hostname.includes('disneyplus.com')) {
    video.currentTime -= 10;
  } else if (hostname.includes('hbomax.com')) {
    video.currentTime -= 10;
  } else if (hostname.includes('peacocktv.com')) {
    video.currentTime -= 10;
  } else if (hostname.includes('crunchyroll.com')) {
    video.currentTime -= 10;
  } else if (hostname.includes('twitch.tv')) {
    video.currentTime -= 10;
  }
}

// Smart Speed Control
function adjustPlaybackSpeed(direction) {
  if (!video || !document.pictureInPictureElement) return;

  if (direction === 'up') {
    currentSpeed = Math.min(currentSpeed + 0.25, 2);
  } else {
    currentSpeed = Math.max(currentSpeed - 0.25, 0.5);
  }

  video.playbackRate = currentSpeed;
  showOSDMessage(`Speed: ${currentSpeed}x`);
}

// Smart Zoom Toggle
function toggleSmartZoom() {
  if (!video || !document.pictureInPictureElement) return;

  isZoomed = !isZoomed;
  if (isZoomed) {
    video.style.transform = 'scale(1.2)';
    video.style.transformOrigin = 'center center';
  } else {
    video.style.transform = 'scale(1)';
  }

  showOSDMessage(isZoomed ? 'Zoom: On' : 'Zoom: Off');
}

// On-Screen Display for feedback
function showOSDMessage(message) {
  if (!document.pictureInPictureElement) return;

  const osd = document.createElement('div');
  osd.style.position = 'fixed';
  osd.style.top = '10%';
  osd.style.left = '50%';
  osd.style.transform = 'translateX(-50%)';
  osd.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  osd.style.color = 'white';
  osd.style.padding = '8px 12px';
  osd.style.borderRadius = '4px';
  osd.style.fontSize = '14px';
  osd.style.zIndex = '9999';
  osd.textContent = message;

  document.body.appendChild(osd);
  setTimeout(() => osd.remove(), 1500);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (!document.pictureInPictureElement) return;

  // Ctrl + Shift combinations for non-video controls
  if (e.ctrlKey && e.shiftKey) {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        adjustPlaybackSpeed('up');
        break;
      case 'ArrowDown':
        e.preventDefault();
        adjustPlaybackSpeed('down');
        break;
      case 'Z':
      case 'z':
        e.preventDefault();
        toggleSmartZoom();
        break;
    }
  }
});

// Create modern context menu
function createContextMenu(x, y) {
  const menu = document.createElement('div');
  menu.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    background: rgba(28, 28, 28, 0.95);
    backdrop-filter: blur(8px);
    border-radius: 8px;
    padding: 8px 0;
    min-width: 200px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    animation: menuFadeIn 0.15s ease-out;
  `;

  // Add animation keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes menuFadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `;
  document.head.appendChild(style);

  // Enhanced menu items (removed brightness controls as they don't work in PiP)
  const items = [
    { icon: '🎬', text: 'Picture in Picture', action: triggerPiP },
    {
      icon: '⚡',
      text: 'Speed Control',
      submenu: [
        {
          text: 'Faster (Ctrl + Shift + ↑)',
          action: () => adjustPlaybackSpeed('up'),
        },
        {
          text: 'Slower (Ctrl + Shift + ↓)',
          action: () => adjustPlaybackSpeed('down'),
        },
        {
          text: 'Reset Speed',
          action: () => {
            currentSpeed = 1.0;
            video.playbackRate = 1.0;
            showOSDMessage('Speed: 1x');
          },
        },
      ],
    },
    {
      icon: '🔍',
      text: `${isZoomed ? 'Disable' : 'Enable'} Zoom (Ctrl + Shift + Z)`,
      action: toggleSmartZoom,
    },
  ];

  function createMenuItem(item) {
    const menuItem = document.createElement('div');
    menuItem.style.cssText = `
      padding: 8px 16px;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background-color 0.2s;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      position: relative;
    `;

    menuItem.innerHTML = `<span style="font-size: 16px;">${
      item.icon || ''
    }</span> ${item.text}`;

    if (item.submenu) {
      menuItem.innerHTML += `<span style="margin-left: auto;">▶</span>`;
    }

    menuItem.addEventListener('mouseover', () => {
      menuItem.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';

      // Handle submenu
      if (item.submenu) {
        const submenu = createSubmenu(item.submenu);
        const rect = menuItem.getBoundingClientRect();
        submenu.style.left = `${rect.right}px`;
        submenu.style.top = `${rect.top}px`;
        document.body.appendChild(submenu);

        menuItem.addEventListener('mouseleave', (e) => {
          const submenuRect = submenu.getBoundingClientRect();
          if (
            e.clientX < submenuRect.left ||
            e.clientX > submenuRect.right ||
            e.clientY < submenuRect.top ||
            e.clientY > submenuRect.bottom
          ) {
            submenu.remove();
          }
        });
      }
    });

    menuItem.addEventListener('mouseout', () => {
      menuItem.style.backgroundColor = 'transparent';
    });

    if (!item.submenu) {
      menuItem.addEventListener('click', () => {
        item.action();
        menu.remove();
      });
    }

    return menuItem;
  }

  function createSubmenu(items) {
    const submenu = document.createElement('div');
    submenu.style.cssText = `
      position: fixed;
      background: rgba(28, 28, 28, 0.95);
      backdrop-filter: blur(8px);
      border-radius: 8px;
      padding: 8px 0;
      min-width: 180px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 10001;
    `;

    items.forEach((item) => {
      const menuItem = createMenuItem(item);
      submenu.appendChild(menuItem);
    });

    return submenu;
  }

  items.forEach((item) => {
    menu.appendChild(createMenuItem(item));
  });

  document.body.appendChild(menu);

  // Remove menu when clicking outside
  const closeMenu = (e) => {
    if (!menu.contains(e.target)) {
      menu.remove();
      style.remove();
      document.querySelectorAll('.pip-submenu').forEach((sub) => sub.remove());
    }
  };
  document.addEventListener('click', closeMenu, { once: true });

  // Ensure menu stays within viewport
  const menuRect = menu.getBoundingClientRect();
  if (menuRect.right > window.innerWidth) {
    menu.style.left = `${window.innerWidth - menuRect.width - 10}px`;
  }
  if (menuRect.bottom > window.innerHeight) {
    menu.style.top = `${window.innerHeight - menuRect.height - 10}px`;
  }
}

// Add right-click context menu
document.addEventListener('contextmenu', (e) => {
  if (e.target.tagName === 'VIDEO') {
    e.preventDefault();
    createContextMenu(e.pageX, e.pageY);
  }
});

// Message listener from popup
chrome.runtime.onMessage.addListener((msg) => {
  switch (msg.action) {
    case 'pip':
      triggerPiP();
      break;
    case 'skip':
      skipForward();
      break;
    case 'back':
      skipBackward();
      break;
  }
});
