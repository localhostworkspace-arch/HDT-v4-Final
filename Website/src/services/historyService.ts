export interface TestActivity {
  id: string;
  toolId: string;
  toolName: string;
  path: string;
  iconName: string;
  timestamp: number;
  status: 'Completed' | 'In Progress';
}

const STORAGE_KEY = 'hdt_test_activity_history';

const INITIAL_DEMO_ACTIVITY: TestActivity[] = [
  {
    id: 'demo-1',
    toolId: 'keyboard-tester',
    toolName: 'Keyboard Test',
    path: '/keyboard-tester',
    iconName: 'Keyboard',
    timestamp: Date.now() - 2 * 60 * 1000,
    status: 'Completed'
  },
  {
    id: 'demo-2',
    toolId: 'mouse-tester',
    toolName: 'Mouse Test',
    path: '/mouse-tester',
    iconName: 'Mouse',
    timestamp: Date.now() - 12 * 60 * 1000,
    status: 'Completed'
  },
  {
    id: 'demo-3',
    toolId: 'screen-test',
    toolName: 'On-Screen Test',
    path: '/screen-test',
    iconName: 'Monitor',
    timestamp: Date.now() - 25 * 60 * 1000,
    status: 'Completed'
  },
  {
    id: 'demo-4',
    toolId: 'internet-speed-test',
    toolName: 'Speed Test',
    path: '/internet-speed-test',
    iconName: 'Gauge',
    timestamp: Date.now() - 60 * 60 * 1000,
    status: 'Completed'
  }
];

export function getTestActivities(): TestActivity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Initialize with clean demo history
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_ACTIVITY));
      return INITIAL_DEMO_ACTIVITY;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_DEMO_ACTIVITY;
  } catch {
    return INITIAL_DEMO_ACTIVITY;
  }
}

export function recordTestActivity(entry: Omit<TestActivity, 'id' | 'timestamp'>): void {
  try {
    const list = getTestActivities();
    // Remove previous recent duplicate of the same tool to keep list fresh
    const filtered = list.filter(item => item.toolId !== entry.toolId);
    const newEntry: TestActivity = {
      ...entry,
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now()
    };
    const updated = [newEntry, ...filtered].slice(0, 15);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('hdt_history_updated'));
  } catch {
    // Gracefully handle storage errors
  }
}

export function clearTestActivities(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent('hdt_history_updated'));
  } catch {
    // Graceful fallback
  }
}

export function formatTimeAgo(timestamp: number): string {
  const diff = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? '1 day ago' : `${days} days ago`;
}
