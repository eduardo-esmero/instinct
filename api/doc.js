/* Document proxy for the Instinct dashboard.
   Serves allowlisted files from the Eduardo's Instinct Drive tree.
   The allowlist is the boundary: nothing else is exposed. */

const DOCS = {
  factory:        { id: '1kGc7N5RD1TuplVGnaTyhjNy1CdSPFbSl', type: 'json' },
  now:            { id: '1pgwYFVdjPafhd4s5KJ-aDLsWOEXTnE2k', type: 'md' },
  why:            { id: '1SLybFRaEsVWPwhb-kYEND5QyHq67160K', type: 'md' },
  'how-he-thinks':{ id: '1MacWd73-8Dsm_KCG6lcuWaj2bTvJheEd', type: 'md' },
  canon:          { id: '1ffoK1QKXxregI9mWYCOHddbRigSObsHW', type: 'md' },
  sources:        { id: '1_ALvSEB4mGkd0ZSqkrqKjDdIYIJ0GkE3', type: 'md' },
  principles:     { id: '1iyShVGZfV6iLDAvvQJNIP7jDXbCkAoTu', type: 'md' },
  nature:         { id: '1LlLOAbDdOQC_562umgJoJoX-5IO0vBwP', type: 'md' },
  capabilities:   { id: '1UvgHi_Wqe-4SIdIhGtxoa2lYvjQk7__u', type: 'md' },
  agent:          { id: '10m6_Obaix9n_lMpH5mlD446qMn57zqqm', type: 'md' },
};

module.exports = async function handler(req, res) {
  const key = (req.query && req.query.key) || '';
  const doc = DOCS[key];
  if (!doc) {
    res.status(404).json({ error: 'unknown document', known: Object.keys(DOCS) });
    return;
  }
  try {
    const r = await fetch('https://drive.google.com/uc?export=download&id=' + doc.id, { redirect: 'follow' });
    if (!r.ok) throw new Error('drive responded ' + r.status);
    const text = await r.text();
    if (doc.type === 'json') {
      JSON.parse(text);
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    } else {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    }
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');
    res.status(200).send(text);
  } catch (e) {
    res.status(502).json({ error: 'source unavailable', detail: String(e && e.message || e) });
  }
};
