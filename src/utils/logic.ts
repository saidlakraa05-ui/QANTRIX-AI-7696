import { UserSession, VideoProject } from '../types';

export function canUserSendMessage(user: UserSession): boolean {
  if (user.plan === 'pro') return true;
  return user.messagesRemaining > 0;
}

export function canUserCreateVideo(user: UserSession): boolean {
  if (user.plan === 'pro') return true;
  return user.videosRemaining > 0;
}

export function calculateNextRenewal(currentDate: Date, months: number = 1): string {
  const date = new Date(currentDate);
  date.setMonth(date.getMonth() + months);
  return date.toISOString();
}

export function isProjectExpired(project: VideoProject, currentDate: Date = new Date()): boolean {
  if (!project.expiresAt) return false;
  return new Date(project.expiresAt).getTime() < currentDate.getTime();
}

export function cleanTextForSpeech(text: string): string {
  return text
    .replace(/[*_#`~[\]]/g, '')
    .replace(/https?:\/\/\S+/g, 'رابط')
    .trim();
}

export function formatCurrency(amount: number, symbol: string = 'د.م'): string {
  return `${amount} ${symbol}`;
}

export function filterMemories<T extends { key: string; value: string; category: string }>(
  memories: T[],
  searchQuery: string,
  categoryFilter?: string
): T[] {
  const query = searchQuery.trim().toLowerCase();
  return memories.filter((m) => {
    const matchesCategory = !categoryFilter || categoryFilter === 'all' || m.category === categoryFilter;
    const matchesQuery = !query || m.key.toLowerCase().includes(query) || m.value.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });
}

export function categorizeDifficulty(text: string): 'simple' | 'medium' | 'complex' {
  const t = text.toLowerCase();
  if (
    t.includes('code') ||
    t.includes('كود') ||
    t.includes('برمج') ||
    t.includes('algorithm') ||
    t.includes('خوارزمية') ||
    t.includes('معادلة') ||
    t.includes('اثبت') ||
    t.includes('derive') ||
    t.includes('architecture') ||
    t.length > 250
  ) {
    return 'complex';
  }
  if (t.length > 80 || t.includes('قارن') || t.includes('حلل') || t.includes('compare') || t.includes('why')) {
    return 'medium';
  }
  return 'simple';
}
