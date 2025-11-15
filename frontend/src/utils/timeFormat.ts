/**
 * Format ISO timestamp to relative time (e.g., "2 minutes ago")
 */
export function formatRelativeTime(isoTimestamp: string): string {
  if (!isoTimestamp) return 'Recently';

  const now = new Date();
  const pastDate = new Date(isoTimestamp);
  const diffMs = now.getTime() - pastDate.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;

  return pastDate.toLocaleDateString();
}

/**
 * Format date for display
 */
export function formatDate(isoTimestamp: string): string {
  if (!isoTimestamp) return '';
  const date = new Date(isoTimestamp);
  return date.toLocaleDateString();
}

/**
 * Format time for display
 */
export function formatTime(isoTimestamp: string): string {
  if (!isoTimestamp) return '';
  const date = new Date(isoTimestamp);
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}
