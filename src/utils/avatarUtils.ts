// Generates an official NMDC statutory badge avatar SVG data URI
// Eliminates stock photos and mock images while looking official and crisp
export function getPersonnelAvatar(name: string, category: 'OFFICER' | 'REGULAR' | 'CONTRACT' = 'REGULAR'): string {
  const cleanName = (name || 'NMDC').trim();
  const parts = cleanName.split(' ').filter(Boolean);
  let initials = 'NM';
  if (parts.length >= 2) {
    initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  } else if (parts.length === 1 && parts[0].length >= 2) {
    initials = parts[0].slice(0, 2).toUpperCase();
  }

  let bg1 = '#1e293b'; // slate-800
  let bg2 = '#0f172a'; // slate-900
  let ringColor = '#d97706'; // amber-600
  let textColor = '#f8fafc'; // slate-50

  if (category === 'OFFICER') {
    bg1 = '#0f172a';
    bg2 = '#1e3a8a'; // blue-900
    ringColor = '#f59e0b'; // amber-500
  } else if (category === 'CONTRACT') {
    bg1 = '#78350f'; // amber-900
    bg2 = '#451a03';
    ringColor = '#fbbf24';
  } else {
    bg1 = '#1e293b';
    bg2 = '#334155';
    ringColor = '#f59e0b';
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg1}" />
        <stop offset="100%" stop-color="${bg2}" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="50" fill="url(#grad)" />
    <circle cx="50" cy="50" r="46" fill="none" stroke="${ringColor}" stroke-width="2.5" stroke-dasharray="1 0" opacity="0.85" />
    <text x="50" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="800" fill="${textColor}" text-anchor="middle" letter-spacing="1">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
