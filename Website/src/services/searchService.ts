import type { CompatibilityItem } from '../types';
import { COMPATIBILITY_DATA } from '../data/compatibilityData';

/**
 * Client-side search service for the compatibility dataset.
 * Debounced usage is handled by the calling component.
 */

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

function scoreMatch(query: string, item: CompatibilityItem): number {
  const q = normalize(query);
  const name = normalize(item.name);
  const dev = normalize(item.developer);
  const cat = normalize(item.category);
  const tags = item.tags.map(normalize).join(' ');

  if (name === q) return 100;
  if (name.startsWith(q)) return 90;
  if (name.includes(q)) return 80;
  if (dev.includes(q)) return 50;
  if (cat.includes(q)) return 40;
  if (tags.includes(q)) return 30;

  // Fuzzy: check if all words of query appear in name
  const words = q.split(' ').filter(Boolean);
  const allWordsMatch = words.every((w) => name.includes(w));
  if (allWordsMatch) return 70;

  // Partial word match
  const anyWordMatch = words.some((w) => name.includes(w) || dev.includes(w));
  if (anyWordMatch) return 35;

  return 0;
}

export function searchCompatibilityItems(
  query: string,
  options?: { type?: 'game' | 'software'; limit?: number }
): CompatibilityItem[] {
  if (!query.trim()) return [];

  const limit = options?.limit ?? 10;
  const typeFilter = options?.type;

  const scored = COMPATIBILITY_DATA
    .filter((item) => !typeFilter || item.type === typeFilter)
    .map((item) => ({ item, score: scoreMatch(query, item) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ item }) => item);
}
