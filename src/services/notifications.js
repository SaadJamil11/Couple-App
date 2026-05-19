// Local notifications — wraps expo-notifications with the four schedules
// the app uses:
//   1. Memory of the Day      — daily at 09:00, picks one random saved memory
//   2. Anniversary reminders  — 7 days + day-of, for every occasion
//   3. Black Box countdown    — day-of for each sealed letter
//   4. Weekly letter nudge    — every Sunday 19:00
//
// All scheduling is idempotent: we cancel every Tethered-owned schedule
// before re-creating them, so the user can call refreshAllNotifications()
// from Settings (or after any data change) without piling up duplicates.

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  memories, occasions, blackbox, letters,
} from './storage';
import { nextAnniversary, daysUntil } from '../utils/dates';

const TAG = 'tethered:v1'; // marker so we only cancel our own.

// Foreground handler — show the banner even if the user is mid-app.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission() {
  if (Platform.OS === 'web') return false;
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }
  const res = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: false, allowAnnouncements: false },
  });
  return res.granted;
}

async function cancelOurs() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((s) => s.content?.data?.tag === TAG)
      .map((s) => Notifications.cancelScheduledNotificationAsync(s.identifier)),
  );
}

function dataPayload(kind, extra = {}) {
  return { tag: TAG, kind, ...extra };
}

// Pick today's memory deterministically so multiple calls in the same
// day surface the same memory (the user sees consistency, not chaos).
export function pickMemoryOfDay(list, day = new Date()) {
  if (!list || list.length === 0) return null;
  const seed = day.getFullYear() * 10000 + (day.getMonth() + 1) * 100 + day.getDate();
  return list[seed % list.length];
}

// --- Public API ------------------------------------------------------------

export async function refreshAllNotifications() {
  if (Platform.OS === 'web') return { skipped: true };
  const granted = await requestNotificationPermission();
  if (!granted) return { skipped: true, reason: 'permission' };

  await cancelOurs();

  const [m, o, b, l] = await Promise.all([
    memories.list(), occasions.list(), blackbox.list(), letters.list(),
  ]);

  // 1. Memory of the Day — daily 09:00
  const todayMem = pickMemoryOfDay(m);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Memory of the day',
      body: todayMem
        ? (todayMem.title || todayMem.note || 'Tap to relive a quiet moment together.').slice(0, 110)
        : 'Add your first memory — Tethered will resurface one every morning.',
      data: dataPayload('memoryOfDay', todayMem ? { id: todayMem.id } : {}),
    },
    trigger: { hour: 9, minute: 0, repeats: true, channelId: 'tethered-daily' },
  });

  // 2. Anniversary reminders — 7-day warning + day-of
  for (const occ of o) {
    const next = nextAnniversary(occ.date);
    const dueIn = daysUntil(next); // 0 = today, can be ~365
    if (dueIn >= 1) {
      const warnDate = new Date(next.getTime() - 7 * 86_400_000);
      if (warnDate > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${occ.title} — 7 days to go`,
            body: 'A week to plan something tiny and beautiful.',
            data: dataPayload('occasionWarn', { id: occ.id }),
          },
          trigger: warnDate,
        });
      }
    }
    if (dueIn >= 0) {
      const dayOf = new Date(next);
      dayOf.setHours(8, 30, 0, 0);
      if (dayOf > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Today: ${occ.title}`,
            body: 'A small anniversary worth marking.',
            data: dataPayload('occasionDay', { id: occ.id }),
          },
          trigger: dayOf,
        });
      }
    }
  }

  // 3. Black Box unlock — day-of
  for (const item of b) {
    const unlock = new Date(item.unlockDate);
    if (!Number.isNaN(unlock.getTime()) && unlock > new Date()) {
      unlock.setHours(9, 0, 0, 0);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'The vault opens today',
          body: item.title || 'A letter from your past selves is ready to be read.',
          data: dataPayload('blackboxUnlock', { id: item.id }),
        },
        trigger: unlock > new Date() ? unlock : { seconds: 60 },
      });
    }
  }

  // 4. Weekly letter nudge — every Sunday at 19:00
  const lastLetter = l.length > 0
    ? l.reduce((a, b2) => (new Date(a.createdAt) > new Date(b2.createdAt) ? a : b2))
    : null;
  const body = lastLetter
    ? `It has been a while since your last letter. ${describeAuthor(lastLetter)} would love to read one.`
    : 'Sunday slow-down — write your first letter to your partner.';
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'A letter, in your own time',
      body,
      data: dataPayload('letterNudge'),
    },
    trigger: { weekday: 1, hour: 19, minute: 0, repeats: true, channelId: 'tethered-weekly' },
    // Note: in expo-notifications weekday 1 = Sunday on iOS/Android calendar trigger.
  });

  return { scheduled: true };
}

export async function cancelAllNotifications() {
  await cancelOurs();
}

export async function getScheduledCount() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.filter((s) => s.content?.data?.tag === TAG).length;
}

function describeAuthor(letter) {
  if (!letter?.authorName) return 'Your partner';
  return `${letter.authorName} (or your partner)`;
}

// Android channels — set once on app boot.
export async function ensureChannels() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('tethered-daily', {
    name: 'Daily memory',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: null,
  });
  await Notifications.setNotificationChannelAsync('tethered-weekly', {
    name: 'Weekly nudges',
    importance: Notifications.AndroidImportance.LOW,
    sound: null,
  });
}
