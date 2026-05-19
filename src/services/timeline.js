// Stitch local memories + selected device photos + chats into a single
// chronological feed, grouped into "time cards" per season.
import { seasonOf } from '../utils/dates';

export function buildTimeline({ memories = [], chats = [], occasions = [], assets = [], voiceNotes = [] }) {
  const items = [];

  for (const m of memories) {
    items.push({
      kind: 'memory',
      when: m.date || m.createdAt,
      id: `mem-${m.id}`,
      data: m,
    });
  }
  for (const c of chats) {
    items.push({
      kind: 'chat',
      when: c.date || c.createdAt,
      id: `chat-${c.id}`,
      data: c,
    });
  }
  for (const o of occasions) {
    items.push({
      kind: 'occasion',
      when: o.date,
      id: `occ-${o.id}`,
      data: o,
    });
  }
  for (const a of assets) {
    items.push({
      kind: 'photo',
      when: a.creationTime ? new Date(a.creationTime).toISOString() : new Date().toISOString(),
      id: `asset-${a.id}`,
      data: a,
    });
  }
  for (const v of voiceNotes) {
    items.push({
      kind: 'voice',
      when: v.createdAt,
      id: `voice-${v.id}`,
      data: v,
    });
  }

  items.sort((a, b) => new Date(b.when) - new Date(a.when));

  // Group into seasons → these become the tappable "time cards".
  const groups = new Map();
  for (const it of items) {
    const { key, label } = seasonOf(it.when);
    if (!groups.has(key)) {
      groups.set(key, { key, label, when: it.when, items: [] });
    }
    groups.get(key).items.push(it);
  }
  return Array.from(groups.values()).sort((a, b) => new Date(b.when) - new Date(a.when));
}

export function summariseGroup(group) {
  const counts = { memory: 0, chat: 0, occasion: 0, photo: 0, voice: 0 };
  for (const it of group.items) counts[it.kind] = (counts[it.kind] || 0) + 1;
  return counts;
}
