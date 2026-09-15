/**
 * Google AdSense Configuration
 * 
 * To show real ads later:
 * 1. Set `enabled: true`
 * 2. Put your real Publisher Client ID in `clientId` (e.g. 'ca-pub-1234567890123456')
 * 3. Replace slot IDs with the ad unit IDs created in your Google AdSense console.
 */
export const ADSENSE_CONFIG = {
  // Master toggle to enable/disable ads completely. Set to true when you want ads to appear.
  enabled: false,

  // Toggle to show mock/demo placeholder ads during development (disabled by default)
  showDemoAds: false,

  // Your Google AdSense Publisher Client ID
  clientId: 'ca-pub-XXXXXXXXXXXXXXXX', // <-- Replace with your real ca-pub-xxxx ID

  // Ad Slot IDs generated in your Google AdSense Dashboard -> Ads -> By ad unit
  slots: {
    // Top banner shown across the website
    topLeaderboard: '1010101010',

    // Middle banner on the main Dashboard
    dashboardHorizontal: '1234567890',

    // In-content banner on tool pages (e.g. Keyboard, Mouse, Steering Wheel tester)
    toolPageBanner: '2345678901',

    // Sidebar banner (e.g. rectangle 300x250 or vertical)
    sidebarRectangle: '3456789012',

    // Bottom leaderboard above the footer on every screen
    footerLeaderboard: '4567890123',
  }
};
