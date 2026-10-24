/**
 * Date and relative time formatting helpers
 */

export function formatTimeAgo(timestamp: number | null): string {
  if (!timestamp) return 'Never synced';

  const diffMs = Date.now() - timestamp;
  if (diffMs < 0) return 'Just now';

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 45) return 'Just now';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin === 1) return '1 minute ago';
  if (diffMin < 60) return `${diffMin} minutes ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}
