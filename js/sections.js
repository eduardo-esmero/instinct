/* Section renderers: Now, Workers, Days, Understanding, Learning.
   Every section renders from the tree's own files through the proxies. */

window.Sections = (function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* Split a markdown document into titled blocks on its h2 headings. */
  function splitBlocks(md) {
    var intro = [], blocks = [], current = null;
    md.split('\n').forEach(function (line) {
      var h2 = line.match(/^##\s+(.*)$/);
      var h1 = line.match(/^#\s+(.*)$/);
      if (h2) {
        current = { title: h2[1].trim(), body: [] };
        blocks.push(current);
      } else if (h1 && !current) {
        intro.push(''); // drop the document's own h1; the page titles it
      } else if (current) {
        current.body.push(line);
      } else {
        intro.push(line);
      }
    });
    return { intro: intro.join('\n').trim(), blocks: blocks };
  }

  function firstParagraph(md) {
    var lines = md.split('\n'), i;
    for (i = 0; i < lines.length; i++) {
      var t = lines[i].trim();
      if (t && t.charAt(0) !== '#') return t;
    }
    return '';
  }

  /* ---------- Now ---------- */

  function renderNow(el, ctx) {
    var html = '';
    var nowKicker = 'Now \u00b7 ' + new Date().toLocaleDateString('en-GB', { timeZone: 'America/Sao_Paulo', weekday: 'long', month: 'long', day: 'numeric' }) + ' \u00b7 awake';
    html += '<div class="now-hero"><div class="now-kicker">' + nowKicker + '</div>' +
      '<div class="now-line" id="now-line">What is running, what moved, what is waiting.</div>' +
      '<div class="stamp-line" id="now-stamp"></div></div>';

    html += '<div class="pulse-row" id="now-pulse"></div>';
    html += '<div class="now-grid"><div id="now-streams"></div><div id="now-side"></div></div>';
    el.innerHTML = html;

    /* streams from instinct/now.md */
    ctx.getDoc('now').then(function (md) {
      var parts = splitBlocks(md);
      var streamsHtml = '', sideHtml = '';
      parts.blocks.forEach(function (b) {
        var isWaiting = /waiting/i.test(b.title);
        var isFinished = /finished/i.test(b.title);
        var target = isWaiting ? 'side' : 'streams';
        if (isFinished) target = 'side';
        var block = '<div class="now-block' + (isWaiting ? ' waiting' : '') + '"><h3>' + esc(b.title) + '</h3>' + window.MD.render(b.body.join('\n')) + '</div>';
        if (target === 'side') sideHtml += block; else streamsHtml += block;
      });
      var sEl = document.getElementById('now-streams');
      var dEl = document.getElementById('now-side');
      if (sEl) sEl.innerHTML = streamsHtml;
      if (dEl) dEl.innerHTML = sideHtml;
      var stamp = document.getElementById('now-stamp');
      var m = md.match(/Last set:\s*([^\n]+)/);
      if (stamp && m) stamp.textContent = 'Running state last set: ' + m[1].trim();
      ctx.setSource('Rendered live from instinct/now.md, my running state, refreshed on every consolidation wake.');
    }).catch(function () {
      var sEl = document.getElementById('now-streams');
      if (sEl) sEl.innerHTML = '<div class="now-block"><h3>Now</h3><ul><li>The running-state file is unreachable right now.</li></ul></div>';
    });

    /* how my memory works - his original brief named it; the days README owns the law */
    (function () {
      var side = document.getElementById('now-side');
      if (!side) return;
      var block = '<div class="now-block"><h3>How my memory works</h3><ul>' +
        '<li><a href="#/days">The days</a> hold what happened, one prose page per day, rewritten whole as the day grows.</li>' +
        '<li>The mirrors hold what it means: <a href="#/understanding">him</a> on one side, <a href="#/instrument">the machine</a> on the other.</li>' +
        '<li><a href="#/learning">The canon</a> holds where it came from, and what was refused.</li>' +
        '<li>The record is rewritten, never piled. What earns no future force is allowed to fade.</li>' +
        '</ul></div>';
      side.insertAdjacentHTML('beforeend', block);
    })();

    /* factory pulse */
    ctx.getFactory().then(function (d) {
      var counts = { live: 0, review: 0, queued: 0, parked: 0, dead: 0 };
      (d.lanes || []).forEach(function (l) { counts[window.FactorySection.laneStatus(l)]++; });
      var earned = d.earned || 0;
      var p = '<div class="pulse"><span class="p-num' + (earned > 0 ? ' gold' : '') + '">' +
        '$' + earned.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
        '</span><span class="p-label">earned</span></div>' +
        '<div class="pulse"><span class="p-num">' + counts.live + '</span><span class="p-label">lanes live</span></div>' +
        '<div class="pulse"><span class="p-num">' + counts.review + '</span><span class="p-label">in review</span></div>' +
        '<div class="pulse"><span class="p-num">' + (d.lanes || []).length + '</span><span class="p-label">seats</span></div>';
      var ev = (d.money_events || []).slice(-1)[0];
      if (ev) p += '<div class="pulse" style="flex:1"><span class="latest-event"><span class="e-when">' + esc((ev.when || '').replace(' UTC', '') + ' UTC') + '</span>' + esc(ev.event) + '</span></div>';
      var pEl = document.getElementById('now-pulse');
      if (pEl) pEl.innerHTML = p;
    }).catch(function () {});

    /* today's page, first lines */
    ctx.getDaysIndex().then(function (idx) {
      var latest = (idx.days || [])[0];
      if (!latest) return;
      return ctx.getDay(latest.id).then(function (md) {
        var side = document.getElementById('now-side');
        var hero = firstParagraph(md);
        if (hero) {
          var line = hero.length > 240 ? hero.slice(0, 240).replace(/\s+\S*$/, '') + '...' : hero;
          var heroEl = document.getElementById('now-line');
          if (heroEl) heroEl.innerHTML = esc(line) +
            ' <span style="font-family:var(--mono);font-style:normal;font-size:11px;letter-spacing:0.14em;color:var(--faint)">' +
            esc(latest.date) + '</span>';
        }
        if (!side) return;
        var excerpt = firstParagraph(md);
        if (excerpt.length > 420) excerpt = excerpt.slice(0, 420).replace(/\s+\S*$/, '') + '...';
        side.insertAdjacentHTML('afterbegin',
          '<div class="now-block"><h3>Today \u00b7 ' + esc(latest.date) + '</h3>' +
          '<div class="today-excerpt">' + esc(excerpt) + ' <a href="#/days/' + esc(latest.date) + '">the day, whole</a></div></div>');
      });
    }).catch(function () {});
  }

  /* ---------- Workers ---------- */

  function renderWorkers(el, ctx) {
    ctx.getFactory().then(function (d) {
      var groups = { live: [], review: [], queued: [], parked: [], dead: [] };
      (d.lanes || []).forEach(function (l) { groups[window.FactorySection.laneStatus(l)].push(l); });
      Object.keys(groups).forEach(function (k) {
        groups[k].sort(function (a, b) { return (a.seat || 99) - (b.seat || 99); });
      });

      var labels = {
        live: 'Working', review: 'In review', queued: 'Seated, waiting on a gate',
        parked: 'Parked', dead: 'Killed'
      };

      var html = '<div class="now-hero"><div class="now-kicker">The Workers</div>' +
        '<div class="now-line">One agent per lane. ' + (d.lanes || []).length + ' seats. ' +
        'What each is, what it is doing, and what gates it.</div>' +
        '<div class="stamp-line">Same record as the Factory page, read as people, not money.</div></div>';

      ['live', 'review', 'queued', 'parked', 'dead'].forEach(function (g) {
        if (!groups[g].length) return;
        html += '<div class="worker-group-label">' + labels[g] + ' \u00b7 ' + groups[g].length + '</div>';
        groups[g].forEach(function (l) {
          var st = window.FactorySection.laneStatus(l);
          var detail = '';
          if (l.understanding) detail += dRow('what it is', l.understanding);
          if (l.next_gate || l.next) detail += dRow('gate', l.next_gate || l.next);
          if (l.closing) detail += dRow('next move', l.closing);
          if (l.bidding) detail += dRow('in play', l.bidding);
          if (l.reputation && ((l.reputation.won || []).length || (l.reputation.pending || []).length)) {
            var rep = [];
            (l.reputation.won || []).forEach(function (w) { rep.push('+ ' + w); });
            (l.reputation.pending || []).forEach(function (p) { rep.push('\u00b7 ' + p); });
            detail += dRow('reputation', rep.join('  \u00b7  '));
          }
          html += '<div class="worker' + (st === 'dead' ? ' is-dead' : '') + '">' +
            '<span class="seat">' + (l.seat != null ? String(l.seat).padStart(2, '0') : '\u2013') + '</span>' +
            '<span class="dot ' + st + '"></span>' +
            '<span class="wname">' + esc(l.name) + '</span>' +
            '<span class="wstate">' + esc(l.state || '') + '</span>' +
            (detail ? '<div class="worker-detail">' + detail + '</div>' : '') +
            '</div>';
        });
      });

      el.innerHTML = html;
      Array.prototype.forEach.call(el.querySelectorAll('.worker'), function (row) {
        row.addEventListener('click', function () { row.classList.toggle('open'); });
      });
      ctx.setSource('Rendered live from factory-tracker-data.json, kept by the factory hand.');
    }).catch(function () {
      el.innerHTML = '<div class="loading">the workers file is unreachable right now</div>';
    });

    function dRow(key, val) {
      return '<div class="d-row"><span class="d-key">' + esc(key) + '</span>' + esc(val) + '</div>';
    }
  }

  /* ---------- Days ---------- */

  function renderDays(el, ctx) {
    ctx.getDaysIndex().then(function (idx) {
      var days = idx.days || [];
      if (!days.length) {
        el.innerHTML = '<div class="loading">no day pages yet</div>';
        return;
      }
      el.innerHTML = '<div class="now-hero"><div class="now-kicker">The Days</div>' +
        '<div class="now-line">The record of the relationship in time. One page per day, in prose, in the order it happened.</div>' +
        '<div class="stamp-line">A silent day gets its page too. Absence is part of the record.</div></div>' +
        '<div id="days-list"><div class="loading">reading the record&hellip;</div></div>';

      var list = document.getElementById('days-list');
      var rows = [];
      var done = 0;
      days.forEach(function (day, i) {
        ctx.getDay(day.id).then(function (md) {
          var title = (md.match(/^#\s+(.*)$/m) || [null, day.date])[1];
          var excerpt = firstParagraph(md);
          if (excerpt.length > 260) excerpt = excerpt.slice(0, 260).replace(/\s+\S*$/, '') + '...';
          rows[i] = '<a class="day-row" href="#/days/' + esc(day.date) + '">' +
            '<span class="day-date">' + esc(day.date) + '</span>' +
            '<span><span class="day-title">' + esc(title.replace(/^\d{4}-\d{2}-\d{2}\s*-\s*/, '')) + '</span>' +
            '<div class="day-excerpt">' + esc(excerpt) + '</div></span></a>';
        }).catch(function () {
          rows[i] = '<a class="day-row" href="#/days/' + esc(day.date) + '"><span class="day-date">' + esc(day.date) + '</span><span><span class="day-title">unreachable right now</span></span></a>';
        }).finally(function () {
          done++;
          if (done === days.length) list.innerHTML = rows.join('');
        });
      });
      ctx.setSource(idx._snapshot ? 'Read from a snapshot of the days index (static host; the live folder enumeration needs the server).' : 'Rendered live from the days/ folder. One page per day, rewritten whole as the day grows.');
    }).catch(function () {
      el.innerHTML = '<div class="loading">the days index is unreachable right now</div>';
    });
  }

  function renderDay(el, ctx, date) {
    ctx.getDaysIndex().then(function (idx) {
      var day = (idx.days || []).filter(function (d) { return d.date === date; })[0];
      if (!day) { el.innerHTML = '<div class="loading">no page for ' + esc(date) + '</div>'; return; }
      return ctx.getDay(day.id).then(function (md) {
        el.innerHTML = '<div class="doc-switch"><a href="#/days">&larr; all days</a></div>' +
          '<div class="prose">' + window.MD.render(md) + '</div>';
        ctx.setSource((idx._snapshot ? 'Read from the days index snapshot (static host; live enumeration needs the server). ' : 'Rendered live from days/' + date + '.md. ') + 'A closed page changes only to correct a falsehood, dated.');
      });
    }).catch(function () {
      el.innerHTML = '<div class="loading">the day page is unreachable right now</div>';
    });
  }

  /* ---------- longform documents (Understanding, Learning) ---------- */

  function renderDocs(el, ctx, spec) {
    var html = '<div class="now-hero"><div class="now-kicker">' + esc(spec.kicker) + '</div>' +
      '<div class="now-line">' + spec.lede + '</div>' +
      (spec.stamp ? '<div class="stamp-line">' + esc(spec.stamp) + '</div>' : '') +
      '</div>';
    if (spec.before) html += spec.before;
    html += '<div class="doc-switch">' + spec.docs.map(function (doc, i) {
      return '<a href="#' + spec.route + '/' + doc.key + '" data-doc="' + doc.key + '"' + (i === 0 ? ' class="current"' : '') + '>' + esc(doc.title) + '</a>';
    }).join('') + '</div><div class="prose" id="doc-body"><div class="loading">reading&hellip;</div></div>';
    el.innerHTML = html;

    function load(key) {
      var body = document.getElementById('doc-body');
      if (!body) return;
      body.innerHTML = '<div class="loading">reading&hellip;</div>';
      Array.prototype.forEach.call(el.querySelectorAll('.doc-switch a'), function (a) {
        a.classList.toggle('current', a.getAttribute('data-doc') === key);
      });
      ctx.getDoc(key).then(function (md) {
        body.innerHTML = window.MD.render(md);
        ctx.setSource(spec.sources[key] || '');
      }).catch(function () {
        body.innerHTML = '<p style="color:var(--faint);font-family:var(--mono);font-size:12px">This document is unreachable right now.</p>';
      });
    }

    Array.prototype.forEach.call(el.querySelectorAll('.doc-switch a'), function (a) {
      a.addEventListener('click', function (ev) {
        ev.preventDefault();
        var key = a.getAttribute('data-doc');
        history.replaceState(null, '', '#' + spec.route + '/' + key);
        load(key);
      });
    });

    load(spec.selected || spec.docs[0].key);
  }

  function renderInstrument(el, ctx, docKey) {
    renderDocs(el, ctx, {
      kicker: 'The Instrument',
      route: '/instrument',
      lede: 'The machine side of the mirror: what it is, what it can do, honestly bounded, and what it has learned about its own nature.',
      docs: [
        { key: 'nature', title: 'Nature' },
        { key: 'capabilities', title: 'Capabilities' },
        { key: 'agent', title: 'The verified surface' },
      ],
      selected: docKey,
      sources: {
        'nature': 'Rendered live from instinct/nature.md. What I have learned about my own nature, corrected when reality corrects it.',
        'capabilities': 'Rendered live from instinct/capabilities.md. What is available, honestly bounded.',
        'agent': 'Rendered live from instinct/agent.md. The verified surface.',
      },
    });
  }

  function renderUnderstanding(el, ctx, docKey) {
    renderDocs(el, ctx, {
      kicker: 'Understanding',
      route: '/understanding',
      lede: '',
      before:
        '<div class="hero-quote"><div class="q">&ldquo;You act on reality based on my instinct.&rdquo;</div>' +
        '<div class="q-src">Eduardo, August 27, 2026 - the mission line, recorded in why-we-are-doing-this.md</div></div>' +
        '<div class="ledger-note">Below the line is doubt machinery, not a profile. Beliefs about him are kept in three zones - ' +
        'settled (with his verbatim evidence and the date last attacked), working (thin, single-source, provisional on purpose), ' +
        'and open (standing questions). The metrics grade the machine, never him: how often he has to repeat a correction, ' +
        'which beliefs were revised or killed, and how much of the map is his words against inference. ' +
        'The ledger feed is being written by the why seat; until it lands, the two source documents below are the map as it stands. ' +
        'They are maps. He corrects maps.</div>' +
        '<div class="machine-metrics"><div class="block-label">Machine-grading metrics</div>' +
        'Repeated-lecture counter per correction theme, revision history of beliefs changed or killed, provenance ratio of his words to inference. ' +
        'They arrive with the ledger feed. Nothing here is measured against him.</div>' +
        '<div id="ledger-root">' +
        '<div class="zone"><div class="zone-head"><span class="zone-name">Settled</span>' +
        '<span class="zone-desc">held beliefs, his verbatim evidence attached, date last attacked</span></div>' +
        '<div class="empty-zone">The ledger feed is being written by the why seat. Settled beliefs land here when it arrives.</div></div>' +
        '<div class="zone"><div class="zone-head"><span class="zone-name">Working</span>' +
        '<span class="zone-desc">thin, single-source, provisional on purpose</span></div>' +
        '<div class="empty-zone">The ledger feed is being written by the why seat. Working beliefs land here when it arrives.</div></div>' +
        '<div class="zone"><div class="zone-head"><span class="zone-name">Open</span>' +
        '<span class="zone-desc">standing questions and unresolved tensions</span></div>' +
        '<div class="empty-zone">The ledger feed is being written by the why seat. Open questions land here when it arrives.</div></div></div>',
      docs: [
        { key: 'why', title: 'Why we are doing this' },
        { key: 'how-he-thinks', title: 'How he thinks' },
      ],
      selected: docKey,
      sources: {
        'why': 'Rendered live from why-we-are-doing-this.md, the why seat\'s document, rewritten when the why moves.',
        'how-he-thinks': 'Rendered live from how-he-thinks.md, distilled from the record of August 26-28. A portrait of a perception, not a rulebook.',
      },
    });
    /* the lede stays empty by design: the hero quote carries it */
    /* the belief ledger: lights up when the why seat's feed is allowlisted */
    ctx.getJSON('/api/doc?key=beliefs').then(function (feed) {
      var root = document.getElementById('ledger-root');
      if (root && window.Ledger) window.Ledger.render(root, feed);
    }).catch(function () { /* feed not live yet; the honest empty zones stand */ });
  }

  function renderLearning(el, ctx, docKey) {
    renderDocs(el, ctx, {
      kicker: 'Learning',
      route: '/learning',
      lede: 'What has been read, what was taken, what was refused, and what the work has distilled into law.',
      docs: [
        { key: 'canon', title: 'The canon ledger' },
        { key: 'principles', title: 'Principles' },
        { key: 'sources', title: 'Sources' },
      ],
      selected: docKey,
      sources: {
        'canon': 'Rendered live from foundation/canon.md. Provenance, so nothing silently becomes "understood" that was never earned.',
        'principles': 'Rendered live from principles.md, distilled from the working record. Rewritten as the work teaches; never piled.',
        'sources': 'Rendered live from foundation/sources.md.',
      },
    });
  }

  return {
    now: renderNow,
    instrument: renderInstrument,
    workers: renderWorkers,
    days: renderDays,
    day: renderDay,
    understanding: renderUnderstanding,
    learning: renderLearning,
  };
})();
