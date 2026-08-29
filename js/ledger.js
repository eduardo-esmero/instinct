/* The belief ledger - the heart of Understanding.
   Renders the why seat's feed: beliefs about him, with the doubt attached.
   Data shape per belief (drafted with the why seat):
   { statement, status: settled|working|open,
     provenance: his-words|inference|mixed,
     evidence: { quote, source, date },
     last_tested: "Aug 28", revisions: n }
   Optional top-level corrections: [{ theme, count, last }]
   Machine-grading only. Nothing here scores him. */

window.Ledger = (function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function provenanceTag(p) {
    if (p === 'his-words') return '<span class="prov prov-his">his words</span>';
    if (p === 'inference') return '<span class="prov prov-inf">inference</span>';
    if (p === 'mixed') return '<span class="prov prov-mix">his words + inference</span>';
    return '<span class="prov prov-inf">unlabeled</span>';
  }

  function belief(b) {
    var html = '<div class="belief ' + esc(b.status || 'working') + '">' +
      '<div class="b-statement">' + esc(b.statement) + '</div>' +
      '<div class="b-meta">' + provenanceTag(b.provenance);
    if (b.last_tested) html += '<span class="b-tested">last attacked ' + esc(b.last_tested) + '</span>';
    if (b.revisions) html += '<span class="b-rev">revised ' + b.revisions + (b.revisions === 1 ? ' time' : ' times') + '</span>';
    html += '</div>';
    if (b.evidence && b.evidence.quote) {
      html += '<blockquote class="b-evidence">' + esc(b.evidence.quote) +
        '<cite>' + esc([b.evidence.source, b.evidence.date].filter(Boolean).join(', ')) + '</cite></blockquote>';
    }
    return html + '</div>';
  }

  function render(container, feed) {
    var beliefs = feed.beliefs || [];
    var zones = { settled: [], working: [], open: [] };
    beliefs.forEach(function (b) {
      (zones[b.status] || zones.working).push(b);
    });

    /* machine-grading metrics, computed from the record */
    var revised = beliefs.filter(function (b) { return b.revisions > 0; }).length;
    var hisWords = beliefs.filter(function (b) { return b.provenance === 'his-words'; }).length;
    var ratio = beliefs.length ? Math.round((hisWords / beliefs.length) * 100) : 0;
    var corrections = feed.corrections || [];

    var m = '<div class="machine-metrics"><div class="block-label">Machine-grading metrics</div>';
    if (corrections.length) {
      m += 'Repeated lectures, per correction theme: ';
      m += corrections.map(function (c) {
        return esc(c.theme) + ' \u00d7' + c.count + (c.last ? ' (last ' + esc(c.last) + ')' : '');
      }).join(' \u00b7 ') + '. The number falls as the machine converges.<br>';
    }
    m += 'Beliefs revised or killed: ' + revised + ' of ' + beliefs.length + '. ' +
      'Provenance: ' + ratio + '% his own words, the rest inference, labeled as such.</div>';

    var html = m;
    html += zone('settled', 'Settled', 'held beliefs, his verbatim evidence attached, date last attacked', zones.settled);
    html += zone('working', 'Working', 'thin, single-source, provisional on purpose', zones.working);
    html += zone('open', 'Open', 'standing questions and unresolved tensions', zones.open);
    container.innerHTML = html;
  }

  function zone(key, name, desc, items) {
    var h = '<div class="zone"><div class="zone-head"><span class="zone-name">' + name + '</span>' +
      '<span class="zone-desc">' + desc + '</span></div>';
    if (!items.length) {
      h += '<div class="empty-zone">' +
        (key === 'settled' ? 'Nothing has earned settled yet.' :
         key === 'working' ? 'No working beliefs on record.' :
         'No open questions on record.') + '</div>';
    } else {
      items.forEach(function (b) { h += belief(b); });
    }
    return h + '</div>';
  }

  return { render: render };
})();
