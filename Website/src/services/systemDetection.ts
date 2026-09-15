export interface SystemInfo {
  browserName: string;
  browserVersion: string;
  osName: string;
  deviceType: 'Desktop' | 'Laptop' | 'Tablet' | 'Mobile';
  screenResolution: string;
  colorDepth: number;
  devicePixelRatio: number;
  isOnline: boolean;
  logicalCores: number | null;
  privacyNotice: string;
}

export function detectSystemInfo(): SystemInfo {
  const ua = navigator.userAgent;
  
  // 1. Browser Detection
  let browserName = 'Browser';
  let browserVersion = '';
  
  if (/Edg\/([0-9.]+)/.test(ua)) {
    browserName = 'Edge';
    browserVersion = RegExp.$1;
  } else if (/Chrome\/([0-9.]+)/.test(ua)) {
    browserName = 'Chrome';
    browserVersion = RegExp.$1;
  } else if (/Firefox\/([0-9.]+)/.test(ua)) {
    browserName = 'Firefox';
    browserVersion = RegExp.$1;
  } else if (/Safari\/([0-9.]+)/.test(ua) && !/Chrome/.test(ua)) {
    browserName = 'Safari';
    browserVersion = RegExp.$1;
  } else if (/OPR\/([0-9.]+)/.test(ua)) {
    browserName = 'Opera';
    browserVersion = RegExp.$1;
  } else {
    browserName = 'Standard Web';
    browserVersion = 'Modern';
  }

  // 2. OS Detection
  let osName = 'Desktop OS';
  if (/Windows NT 10.0/.test(ua)) {
    osName = 'Windows 11';
  } else if (/Windows NT 6.3/.test(ua)) {
    osName = 'Windows 8.1';
  } else if (/Windows NT 6.1/.test(ua)) {
    osName = 'Windows 7';
  } else if (/Macintosh|Mac OS X/.test(ua)) {
    osName = 'macOS';
  } else if (/Android/.test(ua)) {
    osName = 'Android';
  } else if (/iPhone|iPad|iPod/.test(ua)) {
    osName = 'iOS';
  } else if (/Linux/.test(ua)) {
    osName = 'Linux';
  }

  // 3. Device Type Detection
  let deviceType: 'Desktop' | 'Laptop' | 'Tablet' | 'Mobile' = 'Desktop';
  if (/Tablet|iPad/i.test(ua)) {
    deviceType = 'Tablet';
  } else if (/Mobile|Android|iPhone/i.test(ua)) {
    deviceType = 'Mobile';
  } else {
    deviceType = 'Desktop';
  }

  // 4. Screen resolution
  const screenWidth = window.screen.width || window.innerWidth;
  const screenHeight = window.screen.height || window.innerHeight;
  const screenResolution = `${screenWidth} × ${screenHeight}`;
  const colorDepth = window.screen.colorDepth || 24;
  const devicePixelRatio = Math.round((window.devicePixelRatio || 1) * 100) / 100;

  // 5. Logical cores
  const logicalCores = typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : null;

  return {
    browserName,
    browserVersion,
    osName,
    deviceType,
    screenResolution,
    colorDepth,
    devicePixelRatio,
    isOnline: typeof navigator.onLine === 'boolean' ? navigator.onLine : true,
    logicalCores,
    privacyNotice: 'Browser privacy restrictions prevent direct measurement of CPU temperature, GPU temperature, and fan speeds.'
  };
}
