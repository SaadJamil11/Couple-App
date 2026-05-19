// Lightweight UUID v4 generator that doesn't require a node dep.
// Uses Math.random — fine for local-first IDs (collision-resistant enough
// for a single-couple dataset; Firebase will handle server IDs).
export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
