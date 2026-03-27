export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}

export function formatDate(dateStr: string): string {
  return dateStr; // Already formatted in mock data
}

export function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars).trimEnd() + '…';
}

export function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    Banking: '#1e40af',
    Markets: '#166534',
    Business: '#7c3aed',
    Startups: '#ea580c',
    Technology: '#0e7490',
    Economy: '#9f1239',
    Auto: '#92400e',
    Infrastructure: '#374151',
    Fintech: '#0f766e',
    'ET Policy': '#1e3a5f',
  };
  return map[category] || '#374151';
}

export function getCategoryBg(category: string): string {
  const map: Record<string, string> = {
    Banking: '#dbeafe',
    Markets: '#dcfce7',
    Business: '#ede9fe',
    Startups: '#ffedd5',
    Technology: '#cffafe',
    Economy: '#ffe4e6',
    Auto: '#fef3c7',
    Infrastructure: '#f3f4f6',
    Fintech: '#ccfbf1',
  };
  return map[category] || '#f3f4f6';
}
