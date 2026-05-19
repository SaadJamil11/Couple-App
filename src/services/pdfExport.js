// PDF photobook export. We build an HTML "book" of every chapter on the
// timeline (occasions, memories, photos, letters), pipe it through
// expo-print to produce a paginated PDF, and hand it to the OS share
// sheet via expo-sharing.

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { memories, occasions, letters, getProfile, getSelectedPhotoIds } from './storage';
import { getAssetsByIds } from './photos';
import { buildTimeline } from './timeline';
import { formatLongDate } from '../utils/dates';

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br/>');
}

async function buildHtml() {
  const [profile, m, o, l, photoIds] = await Promise.all([
    getProfile(), memories.list(), occasions.list(), letters.list(), getSelectedPhotoIds(),
  ]);
  let assets = [];
  try { assets = await getAssetsByIds(photoIds); } catch { /* offline OK */ }

  const groups = buildTimeline({ memories: m, occasions: o, assets });
  const title = profile?.title || 'Us';
  const subtitle = profile
    ? `${profile.partnerA} & ${profile.partnerB} · since ${profile.startDate}`
    : '';

  const groupsHtml = groups.map((g) => {
    const items = g.items.map((it) => {
      const when = it.when ? formatLongDate(it.when) : '';
      if (it.kind === 'photo') {
        const uri = it.data?.localUri || it.data?.uri;
        if (!uri) return '';
        return `<div class="photo"><img src="${esc(uri)}" /><div class="cap">${esc(when)}</div></div>`;
      }
      if (it.kind === 'memory') {
        return `<div class="memory">
          <div class="cap">${esc(when)}</div>
          ${it.data.title ? `<div class="mtitle">${esc(it.data.title)}</div>` : ''}
          <div class="mbody">${esc(it.data.note || '')}</div>
          ${it.data.authorName ? `<div class="author">— ${esc(it.data.authorName)}</div>` : ''}
        </div>`;
      }
      if (it.kind === 'occasion') {
        return `<div class="occ"><span class="otag">Milestone · ${esc(when)}</span>
          <div class="otitle">${esc(it.data.title)}</div>
          ${it.data.description ? `<div class="odesc">${esc(it.data.description)}</div>` : ''}
        </div>`;
      }
      return '';
    }).join('');

    return `<section class="chapter">
      <div class="chapter-eyebrow">Chapter · ${g.items.length} ${g.items.length === 1 ? 'moment' : 'moments'}</div>
      <h2>${esc(g.label)}</h2>
      ${items}
    </section>`;
  }).join('');

  const lettersHtml = l.length
    ? `<section class="chapter">
        <div class="chapter-eyebrow">Letters</div>
        <h2>Slow conversations</h2>
        ${l.map((lt) => `<div class="letter">
          <div class="cap">${esc(formatLongDate(lt.createdAt))} · from ${esc(lt.authorName || '')}</div>
          ${lt.title ? `<div class="mtitle">${esc(lt.title)}</div>` : ''}
          <div class="mbody">${esc(lt.body)}</div>
        </div>`).join('')}
      </section>`
    : '';

  return `<!doctype html>
<html><head><meta charset="utf-8"/>
<style>
  @page { size: A4; margin: 18mm; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #211913; background: #FFF6EC; }
  .cover { page-break-after: always; padding: 60mm 0; text-align: left; }
  .cover .eyebrow { font-family: Menlo, monospace; font-size: 11px; letter-spacing: 1.4px; text-transform: uppercase; color: #C0532F; margin-bottom: 14px; }
  .cover h1 { font-size: 56px; line-height: 1.05; margin: 0 0 18px 0; letter-spacing: -0.6px; }
  .cover .subtitle { font-style: italic; color: #5A463A; font-size: 18px; }
  section.chapter { page-break-before: always; }
  .chapter-eyebrow { font-family: Menlo, monospace; font-size: 11px; letter-spacing: 1.4px; text-transform: uppercase; color: #C0532F; margin-bottom: 4px; }
  h2 { font-size: 34px; margin: 0 0 24px 0; letter-spacing: -0.4px; }
  .photo { margin: 0 0 18px 0; }
  .photo img { width: 100%; max-height: 200mm; object-fit: cover; border-radius: 12px; }
  .cap { font-family: Menlo, monospace; font-size: 10px; letter-spacing: 1.2px; text-transform: uppercase; color: #9C8775; margin-top: 6px; }
  .memory, .letter { background: #FFFDF8; border-left: 3px solid #C0532F; padding: 14px 18px; margin: 0 0 14px 0; border-radius: 8px; }
  .letter { border-left-color: #6E8F6C; }
  .mtitle { font-size: 22px; font-style: italic; margin: 6px 0 6px 0; }
  .mbody { font-size: 14px; line-height: 1.55; color: #211913; }
  .author { font-family: Menlo, monospace; font-size: 10px; letter-spacing: 1.2px; color: #9C8775; margin-top: 8px; }
  .occ { background: #F7E6CE; border: 1px solid #D9A441; padding: 12px 16px; margin: 0 0 14px 0; border-radius: 8px; }
  .otag { font-family: Menlo, monospace; font-size: 10px; letter-spacing: 1.2px; text-transform: uppercase; color: #8A6620; }
  .otitle { font-size: 18px; font-style: italic; margin-top: 4px; }
  .odesc { font-size: 13px; color: #5A463A; margin-top: 4px; }
</style></head>
<body>
  <div class="cover">
    <div class="eyebrow">Tethered · A relationship, kept</div>
    <h1>${esc(title)}</h1>
    <div class="subtitle">${esc(subtitle)}</div>
  </div>
  ${groupsHtml}
  ${lettersHtml}
</body></html>`;
}

export async function exportPhotobook() {
  const html = await buildHtml();
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Our story' });
  }
  return uri;
}
