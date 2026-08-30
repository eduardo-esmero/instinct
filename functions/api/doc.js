/* Document proxy for the Instinct dashboard (Cloudflare Pages Function).
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
  beliefs:        { id: '1_TGR65HjE30Z6fsb0ip9_vbx-9Ej0bcd', type: 'json' },
};

export async function onRequestGet({ request }) {
  const key = new URL(request.url).searchParams.get('key') || '';
  const doc = DOCS[key];
  if (!doc) {
    return Response.json({ error: 'unknown document', known: Object.keys(DOCS) }, { status: 404 });
  }
  try {
    const r = await fetch('https://drive.google.com/uc?export=download&id=' + doc.id, { redirect: 'follow' });
    if (!r.ok) throw new Error('drive responded ' + r.status);
    const text = await r.text();
    const type = doc.type === 'json' ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8';
    if (doc.type === 'json') JSON.parse(text);
    return new Response(text, { headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=30', 'Access-Control-Allow-Origin': '*' } });
  } catch (e) {
    return Response.json({ error: 'source unavailable', detail: String(e && e.message || e) }, { status: 502 });
  }
}
