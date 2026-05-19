// Thin wrapper around Google Calendar REST API. Only used when the user
// is signed in with Google. Failures are swallowed so they never block
// the local-first UX.

import { getStoredGoogle, isAccessTokenValid } from './googleAuth';

const BASE = 'https://www.googleapis.com/calendar/v3';

async function withToken() {
  const tokens = await getStoredGoogle();
  if (!tokens || !isAccessTokenValid(tokens)) {
    const err = new Error('Google session expired');
    err.code = 'EXPIRED';
    throw err;
  }
  return tokens.accessToken;
}

export async function listUpcomingEvents({ maxResults = 25 } = {}) {
  const token = await withToken();
  const params = new URLSearchParams({
    timeMin: new Date().toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: String(maxResults),
  });
  const res = await fetch(`${BASE}/calendars/primary/events?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Calendar list failed: ${res.status}`);
  const data = await res.json();
  return data.items || [];
}

export async function createEvent({ title, description, startISO, endISO, allDay }) {
  const token = await withToken();
  const body = {
    summary: title,
    description,
    start: allDay ? { date: startISO.slice(0, 10) } : { dateTime: startISO },
    end: allDay
      ? { date: (endISO || startISO).slice(0, 10) }
      : { dateTime: endISO || startISO },
  };
  const res = await fetch(`${BASE}/calendars/primary/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Calendar create failed: ${res.status}`);
  return res.json();
}

// Helper to push a relationship occasion to Google as a yearly recurring event.
export async function pushOccasion(occasion) {
  const token = await withToken();
  const startISO = occasion.date;
  const body = {
    summary: `💞 ${occasion.title}`,
    description: occasion.description || 'From Tethered — your relationship calendar.',
    start: { date: startISO.slice(0, 10) },
    end: { date: startISO.slice(0, 10) },
    recurrence: ['RRULE:FREQ=YEARLY'],
  };
  const res = await fetch(`${BASE}/calendars/primary/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Calendar push failed: ${res.status}`);
  return res.json();
}
