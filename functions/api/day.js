/* Serves one day page (Cloudflare Pages Function), but only after confirming
   the file actually lives in the days folder - dynamic but still checked. */

const FOLDER = '1kUDSTW0IPZmpzhUDehDwB5vrn8RZqYZg';

async function folderIds() {
  const r = await fetch('https://drive.google.com/drive/folders/' + FOLDER, { redirect: 'follow' });
  if (!r.ok) throw new Error('drive responded ' + r.status);
  const html = await r.text();
  const ids = new Set();
  for (const m of html.matchAll(/data-id="([A-Za-z0-9_-]{20,})"/g)) ids.add(m[1]);
  return ids;
}

export async function onRequestGet({ request }) {
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!/^[A-Za-z0-9_-]{20,}$/.test(id)) return Response.json({ error: 'bad id' }, { status: 400 });
  try {
    const ids = await folderIds();
    if (!ids.has(id)) return Response.json({ error: 'not a day page' }, { status: 404 });
    const r = await fetch('https://drive.google.com/uc?export=download&id=' + id, { redirect: 'follow' });
    if (!r.ok) throw new Error('drive responded ' + r.status);
    const text = await r.text();
    return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=60' } });
  } catch (e) {
    return Response.json({ error: 'day page unavailable', detail: String(e && e.message || e) }, { status: 502 });
  }
}
