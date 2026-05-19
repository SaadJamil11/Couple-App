// Photo library access via expo-media-library. We never copy photos —
// we just keep references (asset IDs + URIs) and let the OS own the bytes.
// This keeps the app tiny on disk and respects user storage.

import * as MediaLibrary from 'expo-media-library';
import { getSelectedPhotoIds, setSelectedPhotoIds } from './storage';

export async function requestPhotoPermission() {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  return status === 'granted';
}

// Pull a paginated chunk of the user's library, newest first.
export async function fetchLibraryPage({ after = undefined, pageSize = 60 } = {}) {
  const res = await MediaLibrary.getAssetsAsync({
    mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
    sortBy: [[MediaLibrary.SortBy.creationTime, false]],
    first: pageSize,
    after,
  });
  return res;
}

// Hydrate metadata for a list of asset IDs (used by Timeline + Memory cards).
export async function getAssetsByIds(ids) {
  if (!ids || ids.length === 0) return [];
  // MediaLibrary doesn't expose a bulk lookup by ID, so we use getAssetInfoAsync.
  const settled = await Promise.allSettled(ids.map((id) => MediaLibrary.getAssetInfoAsync(id)));
  return settled
    .filter((r) => r.status === 'fulfilled' && r.value)
    .map((r) => r.value);
}

export async function toggleSelected(assetId) {
  const ids = await getSelectedPhotoIds();
  const next = ids.includes(assetId) ? ids.filter((x) => x !== assetId) : [...ids, assetId];
  await setSelectedPhotoIds(next);
  return next;
}

// Group selected assets by season for "time cards" on the timeline.
import { seasonOf } from '../utils/dates';
export function groupAssetsBySeason(assets) {
  const map = new Map();
  for (const a of assets) {
    const when = a.creationTime ? new Date(a.creationTime) : new Date();
    const { key, label } = seasonOf(when);
    if (!map.has(key)) {
      map.set(key, { key, label, when, assets: [] });
    }
    map.get(key).assets.push(a);
  }
  return Array.from(map.values()).sort((a, b) => b.when - a.when);
}
