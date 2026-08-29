/* The belief ledger - the heart of Understanding.
   Renders the why seat's beliefs feed (foundation/beliefs-feed.json):
     zones.settled / zones.working - beliefs: { id, statement, status, provenance,
       evidence: { quote, source }, last_tested, revision_count }
     zones.open - standing questions: { id, question, raised_by, notes }
     corrections - repeated lectures per theme: { theme, count, first_raised,
       latest_raised, quote, embodied }. A rising count is the failure metric he named.
     habits - the standing habits, verbatim.
   Machine-grading only. Nothing here scores him. */

window.Ledger = (function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  /* '2026-08-29' -> 'Aug 29' */
  function fmtDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    if (!m) return esc(iso || '');
    return MONTHS[+m[2] - 1] + ' ' + (+m[3]);
  }

  /* '2026-08-29T08:49-03:00' -> 'Aug 29, 8:49 AM' */
  function fmtStamp(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso || '');
    if (!m) return esc(iso || '');
    var h = +m[4], ap = h < 12 ? 'AM' : 'PM';
    h = h % 12 || 12;
    return MONTHS[+m[2] - 1] + ' ' + (+m[3]) + ', ' + h + ':' + m[5] + ' ' + ap;
  }

  /* Truth law: his verbatim words carry full weight; observed behavior is
     inference from the record and reads dimmer; bare inference dimmest. */
  function provenanceTag(p) {
    if (p === 'his-words') return '<span class="prov prov-his">his words</span>';
    if (p === 'his-behavior') return '<span class="prov prov-mix">read from his behavior</span>';
    return '<span class="prov prov-inf">inference</span>';
  }

  function belief(b) {
    var html = '<div class="belief ' + esc(b.status || 'working') + '">' +
      '<div class="b-statement">' + esc(b.statement) + '</div>' +
      '<div class="b-meta">' + provenanceTag(b.provenance);
    if (b.last_tested) html += '<span class="b-tested">last attacked ' + fmtDate(b.last_tested) + '</span>';
    if (b.revision_count) html += '<span class="b-rev">revised ' + b.revision_count + (b.revision_count === 1 ? ' time' : ' times') + '</span>';
    html += '</div>';
    if (b.evidence && b.evidence.quote) {
      html += '<blockquote class="b-evidence">' + esc(b.evidence.quote) +
        (b.evidence.source ? '<cite>' + esc(b.evidence.source) + '</cite>' : '') + '</blockquote>';
    }
    return html + '</div>';
  }

  function openQuestion(q) {
    var html = '<div class="belief open">' +
      '<div class="b-statement">' + esc(q.question) + '</div>' +
      '<div class="b-meta"><span class="prov prov-inf">raised by ' + esc(q.raised_by || 'the machine') + '</span></div>';
    if (q.notes) html += '<div class="b-notes">' + esc(q.notes) + '</div>';
    return html + '</div>';
  }

  function zone(key, name, desc, items, renderer) {
    var h = '<div class="zone zone-' + key + '"><div class="zone-head"><span class="zone-name">' + name + '</span>' +
      '<span class="zone-desc">' + desc + '</span>' +
      '<span class="zone-count">' + items.length + '</span></div>';
    if (!items.length) {
      h += '<div class="empty-zone">' +
        (key === 'settled' ? 'Nothing has earned settled yet.' :
         key === 'working' ? 'No working beliefs on record.' :
         'No open questions on record.') + '</div>';
    } else {
      items.forEach(function (b) { h += renderer(b); });
    }
    return h + '</div>';
  }

  function correction(c) {
    var h = '<div class="correction">' +
      '<div class="c-head"><span class="c-count">&times;' + c.count + '</span>' +
      '<span class="c-theme">' + esc(c.theme) + '</span>' +
      '<span class="c-dates">first ' + fmtStamp(c.first_raised) +
      (c.latest_raised && c.latest_raised !== c.first_raised ? ' &middot; latest ' + fmtStamp(c.latest_raised) : '') +
      '</span></div>';
    if (c.quote) h += '<blockquote class="b-evidence">' + esc(c.quote) + '</blockquote>';
    if (c.embodied) h += '<div class="c-embodied">' + esc(c.embodied) + '</div>';
    return h + '</div>';
  }

  function render(container, feed) {
    var zones = feed.zones || {};
    var settled = zones.settled || [], working = zones.working || [], open = zones.open || [];
    var corrections = feed.corrections || [];
    var habits = feed.habits || [];
    var held = settled.concat(working);

    /* machine-grading metrics, computed from the record - they grade the machine, never him */
    var revised = held.filter(function (b) { return b.revision_count > 0; }).length;
    var hisWords = held.filter(function (b) { return b.provenance === 'his-words'; }).length;
    var ratio = held.length ? Math.round((hisWords / held.length) * 100) : 0;
    var lectures = corrections.reduce(function (n, c) { return n + (c.count || 0); }, 0);

    var html = '<div class="machine-metrics"><div class="block-label">Machine-grading metrics</div>' +
      'Repeated lectures: ' + lectures + ' across ' + corrections.length + ' correction themes - ' +
      'the failure metric he named. The number falls as the machine absorbs a correction for good.<br>' +
      'Beliefs revised after being written: ' + revised + ' of ' + held.length + '. ' +
      'Provenance: ' + ratio + '% his own words; the rest read from his behavior or inferred, and labeled as such.</div>';

    html += zone('settled', 'Settled', 'repeatedly tested, uncontradicted - his verbatim evidence attached, date last attacked', settled, belief);
    html += zone('working', 'Working', 'strongly stated, thin test count - provisional on purpose', working, belief);
    html += zone('open', 'Open', 'standing questions, not beliefs', open, openQuestion);

    if (corrections.length) {
      html += '<div class="zone"><div class="zone-head"><span class="zone-name">Corrections</span>' +
        '<span class="zone-desc">repeated lectures per theme; a rising count means the machine failed to absorb it</span></div>' +
        corrections.map(correction).join('') + '</div>';
    }

    if (habits.length) {
      html += '<div class="zone"><div class="zone-head"><span class="zone-name">Habits</span>' +
        '<span class="zone-desc">the standing ' + habits.length + ', verbatim from the doctrine</span></div>' +
        '<ol class="habits">' + habits.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') + '</ol></div>';
    }

    if (feed.generated_at) {
      html += '<div class="ledger-stamp">Ledger generated ' + fmtStamp(feed.generated_at) +
        ' by the why seat' + (feed.doctrine_version ? ' - ' + esc(feed.doctrine_version) : '') + '.</div>';
    }

    container.innerHTML = html;
  }

  return { render: render };
})();
