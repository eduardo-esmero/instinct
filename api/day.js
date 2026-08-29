/* Serves one day page, but only after confirming the file actually lives in
   the days folder - the allowlist is dynamic but still checked. */

const FOLDER = '1kUDSTW0IPZmpzhUDehDwB5vrn8RZqYZg';

async function folderIds() {
  const r = await fetch('https://drive.google.com/drive/folders/' + FOLDER, { redirect: 'follow' });
  if (!r.ok) throw new Error('drive responded ' + r.status);
  const html = await r.text();
  const ids = new Set();
  for (const m of html.matchAll(/data-id="([A-Za-z0-9_-]{20,})"/g)) ids.add(m[1]);
  return ids;
}

module.exports = async function handler(req, res) {
  const id = (req.query && req.query.id) || '';
  if (!/^[A-Za-z0-9_-]{20,}$/.test(id)) { res.status(400).json({ error: 'bad id' }); return; }
  try {
    const ids = await folderIds();
    if (!ids.has(id)) { res.status(404).json({ error: 'not a day page' }); return; }
    const r = await fetch('https://drive.google.com/uc?export=download&id=' + id, { redirect: 'follow' });
    if (!r.ok) throw new Error('drive responded ' + r.status);
    const text = await r.text();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).send(text);
  } catch (e) {
    res.status(502).json({ error: 'day page unavailable', detail: String(e && e.message || e) });
  }
};
