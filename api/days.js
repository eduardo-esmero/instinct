/* Days index: enumerates the shared days/ folder server-side so a new day
   page appears with no redeploy and no maintained manifest. */

const FOLDER = '1kUDSTW0IPZmpzhUDehDwB5vrn8RZqYZg';

function parseFolder(html) {
  const chunks = html.split(/data-id="([A-Za-z0-9_-]{20,})"/);
  const files = {};
  for (let i = 1; i < chunks.length - 1; i += 2) {
    const id = chunks[i];
    const rest = chunks[i + 1].slice(0, 3000);
    const m = rest.match(/aria-label="([^"]+?\.md)[^"]*"/);
    if (m && !files[id]) files[id] = m[1];
  }
  return Object.entries(files)
    .map(([id, name]) => ({ id, name }))
    .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f.name))
    .map(f => ({ id: f.id, date: f.name.replace('.md', '') }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

module.exports = async function handler(req, res) {
  try {
    const r = await fetch('https://drive.google.com/drive/folders/' + FOLDER, { redirect: 'follow' });
    if (!r.ok) throw new Error('drive responded ' + r.status);
    const html = await r.text();
    const days = parseFolder(html);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).json({ days });
  } catch (e) {
    res.status(502).json({ error: 'days index unavailable', detail: String(e && e.message || e) });
  }
};
