// Update this URL to your actual Render app URL
export const BACKEND_URL = 'https://intelcraft.onrender.com';

// You can also use environment variables
export const API_BASE_URL = import.meta.env.VITE_API_URL || BACKEND_URL;

// WebSocket URL (convert HTTP/HTTPS to WS/WSS)
export const WS_BASE_URL = API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://');

// Force new deployment - API configuration updated

// WebSocket Configuration
export const MAX_RECONNECT_ATTEMPTS = 3;
export const RECONNECT_DELAY = 2000; // 2 seconds

// Animation Styles
export const writingAnimation = `
@keyframes writing {
  0% {
    stroke-dashoffset: 1000;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.animate-writing {
  animation: writing 1.5s linear infinite;
}
`;

export const colorAnimation = `
@keyframes colorTransition {
  0% { stroke: #468BFF; }
  15% { stroke: #8FBCFA; }
  30% { stroke: #468BFF; }
  45% { stroke: #FE363B; }
  60% { stroke: #FF9A9D; }
  75% { stroke: #FDBB11; }
  90% { stroke: #F6D785; }
  100% { stroke: #468BFF; }
}

.animate-colors {
  animation: colorTransition 8s ease-in-out infinite;
  animation-fill-mode: forwards;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Add transition for smoother color changes */
.loader-icon {
  transition: stroke 1s ease-in-out;
}
`;

export const dmSansStyle = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  
  /* Apply DM Sans globally */
  body {
    font-family: 'DM Sans', sans-serif;
  }
`;

// Color Palette
export const colors = {
  primary: {
    blue: "#468BFF",
    lightBlue: "#8FBCFA",
    red: "#FE363B",
    lightRed: "#FF9A9D",
    yellow: "#FDBB11",
    lightYellow: "#F6D785"
  }
};

// Animation Durations
export const ANIMATION_DURATIONS = {
  reset: 300,
  collapse: 1000,
  briefingCollapse: 2000
}; 