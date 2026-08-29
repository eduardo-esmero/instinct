/* The Factory section - Project Time's money truth.
   Renders from factory-tracker-data.json. Gold appears only when earned. */

window.FactorySection = (function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function money(n) {
    if (n === null || n === undefined || isNaN(n)) return '$0.00';
    return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function moneyShort(n) {
    if (!n) return '$0';
    return '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  function waypointParts(d) {
    var amount = 500, date = new Date(Date.UTC(2026, 8, 5, 3, 0, 0));
    var m = (d.waypoint || '').match(/\$([\d,]+)/);
    if (m) amount = parseFloat(m[1].replace(/,/g, ''));
    var dt = (d.waypoint || '').match(/by\s+([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
    var months = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };
    if (dt) {
      var mo = months[dt[1].slice(0, 3).toLowerCase()];
      if (mo !== undefined) date = new Date(Date.UTC(parseInt(dt[3], 10), mo, parseInt(dt[2], 10) + 1, 3, 0, 0));
    }
    return { amount: amount, date: date };
  }

  function laneStatus(l) {
    var s = (l.status || '').toLowerCase();
    var state = (l.state || '').toLowerCase();
    if (s === 'dead' || s === 'killed' || state.indexOf('killed') === 0 || state.indexOf('dead.') === 0) return 'dead';
    if (s === 'live' || s === 'review' || s === 'queued' || s === 'parked') return s;
    return 'queued';
  }

  function dRow(key, val) {
    return '<div class="d-row"><span class="d-key">' + esc(key) + '</span>' + esc(val) + '</div>';
  }

  function renderChart(daily, wpAmount, wpDate) {
    var W = 1080, H = 260, padL = 46, padR = 16, padT = 18, padB = 30;
    var innerW = W - padL - padR, innerH = H - padT - padB;
    var start = new Date(wpDate.getTime() - 8 * 24 * 3600 * 1000);
    if (daily.length && daily[0]._date) start = new Date(Math.min(daily[0]._date.getTime(), wpDate.getTime() - 6 * 24 * 3600 * 1000));
    var span = wpDate - start;
    function x(t) { return padL + ((t - start) / span) * innerW; }
    function y(v) { return padT + innerH - (v / wpAmount) * innerH; }
    var parts = ['<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Money over time">'];
    var i, v;
    for (i = 0; i <= 4; i++) {
      v = (wpAmount / 4) * i;
      parts.push('<line x1="' + padL + '" y1="' + y(v) + '" x2="' + (W - padR) + '" y2="' + y(v) + '" stroke="#1a1a1d" stroke-width="1"/>');
      parts.push('<text x="' + (padL - 8) + '" y="' + (y(v) + 4) + '" fill="#5c5952" font-family="IBM Plex Mono, monospace" font-size="10" text-anchor="end">$' + Math.round(v) + '</text>');
    }
    var days = Math.round(span / (24 * 3600 * 1000));
    for (i = 0; i <= days; i++) {
      var t = new Date(start.getTime() + i * 24 * 3600 * 1000);
      parts.push('<text x="' + x(t) + '" y="' + (H - 8) + '" fill="#5c5952" font-family="IBM Plex Mono, monospace" font-size="10" text-anchor="middle">' + (t.getUTCMonth() + 1) + '/' + t.getUTCDate() + '</text>');
    }
    var firstDay = (daily.length && daily[0]._date) ? daily[0]._date : start;
    parts.push('<line x1="' + x(firstDay) + '" y1="' + y(0) + '" x2="' + x(wpDate) + '" y2="' + y(wpAmount) + '" stroke="#5c5952" stroke-width="1" stroke-dasharray="3 5"/>');
    parts.push('<text x="' + (x(wpDate) - 6) + '" y="' + (y(wpAmount) + 14) + '" fill="#5c5952" font-family="IBM Plex Mono, monospace" font-size="10" text-anchor="end">pace required</text>');
    if (daily.length) {
      var cum = 0, ptsE = [], ptsM = [];
      daily.forEach(function (d) {
        cum += d.earned || 0;
        ptsE.push([x(d._date), y(cum)]);
        ptsM.push([x(d._date), y(d.in_motion || 0)]);
      });
      function path(pts) { return pts.map(function (p, j) { return (j ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' '); }
      parts.push('<path d="' + path(ptsM) + '" fill="none" stroke="#97948b" stroke-width="1"/>');
      parts.push('<path d="' + path(ptsE) + '" fill="none" stroke="#c9a227" stroke-width="1.6"/>');
      var last = ptsE[ptsE.length - 1];
      parts.push('<circle cx="' + last[0] + '" cy="' + last[1] + '" r="2.6" fill="#c9a227"/>');
    }
    parts.push('</svg>');
    return parts.join('');
  }

  function render(el, d, meta) {
    var wp = waypointParts(d);
    var now = new Date();
    var earned = d.earned || 0;

    (d.daily || []).forEach(function (day) {
      var m = (day.day || '').match(/([A-Za-z]+)\s+(\d{1,2})/);
      var months = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };
      if (m) day._date = new Date(Date.UTC(wp.date.getUTCFullYear(), months[m[1].slice(0, 3).toLowerCase()], parseInt(m[2], 10), 12));
    });

    var msLeft = wp.date - now;
    var countdown, paceSub;
    if (msLeft > 0) {
      var dl = msLeft / (24 * 3600 * 1000);
      countdown = Math.floor(dl) + 'd ' + Math.floor((dl % 1) * 24) + 'h';
      paceSub = money(Math.max(wp.amount - earned, 0) / dl).replace('.00', '') + '/day from here to close the gap';
    } else {
      countdown = 'due';
      paceSub = 'the waypoint has arrived';
    }

    var counts = { live: 0, review: 0, queued: 0, parked: 0, dead: 0 };
    (d.lanes || []).forEach(function (l) { counts[laneStatus(l)]++; });

    var windowStart = (d.daily && d.daily.length && d.daily[0]._date) ? d.daily[0]._date : new Date(wp.date.getTime() - 8 * 24 * 3600 * 1000);
    var pacePct = Math.min(Math.max(((now - windowStart) / (wp.date - windowStart)) * 100, 0), 100);

    var html = '';
    html += '<div class="objective-band">' +
      '<div class="obj">' + esc(d.objective || '').replace(/\$5,000/, '<strong>$5,000</strong>') + '</div>' +
      '<div class="waypoint">' + esc(d.waypoint || '') + '</div></div>';

    html += '<div class="scoreboard">' +
      '<div class="score"><div class="score-num' + (earned > 0 ? ' has-gold' : '') + '">' + money(earned) + '</div><div class="score-label">EARNED</div><div class="score-sub">gold is only gold when a stranger pays</div></div>' +
      '<div class="score"><div class="score-num dim-num">' + money(d.in_motion || 0) + '</div><div class="score-label">IN MOTION</div><div class="score-sub">committed, not yet paid</div></div>' +
      '<div class="score"><div class="score-num dim-num">' + money(d.pace_per_day || 0).replace('.00', '') + '/day</div><div class="score-label">PACE REQUIRED</div><div class="score-sub">' + paceSub + '</div></div>' +
      '<div class="score"><div class="score-num dim-num">' + countdown + '</div><div class="score-label">WAYPOINT CLOCK</div><div class="score-sub">to the first waypoint</div></div>' +
      '</div>';

    html += '<div class="waypoint-track-section"><div class="section-head"><h2 class="sec-title">Distance to the waypoint</h2><span class="head-note">' + moneyShort(earned) + ' of ' + moneyShort(wp.amount) + '</span></div>' +
      '<div class="track"><div class="track-fill" style="width:' + Math.min((earned / wp.amount) * 100, 100) + '%"></div><div class="track-pace" style="left:' + pacePct + '%"></div></div>' +
      '<div class="track-labels"><span>today</span><span>' + esc((d.waypoint || '').replace(/^.*?by\s+/, '').replace(/\s*\(.*$/, '')) + '</span></div></div>';

    html += '<div class="vitals-strip">' +
      vital((d.lanes || []).length, 'seats') + vital(counts.live, 'live') + vital(counts.review, 'in review') +
      vital(counts.queued, 'queued') + vital(counts.parked, 'parked') +
      '<div class="vital v-dead"><span class="v-num">' + counts.dead + '</span><span class="v-label">killed</span></div></div>';

    html += '<div class="section-head"><h2 class="sec-title">Money over time</h2><span class="head-note">earned vs pace required</span></div>' +
      '<div class="chart-wrap">' + renderChart(d.daily || [], wp.amount, wp.date) + '</div>';

    /* lanes by tier */
    var tierNames = { T1: 'Tier 1 \u00b7 the front line', T2: 'Tier 2', T3: 'Tier 3', other: 'No tier on record', parked: 'Parked' };
    var groups = { T1: [], T2: [], T3: [], other: [], parked: [] };
    (d.lanes || []).forEach(function (l) {
      var t = l.tier;
      if (t === 'parked' || (l.tier_class === 'parked' && laneStatus(l) !== 'dead')) groups.parked.push(l);
      else if (['T1', 'T2', 'T3'].indexOf(t) >= 0) groups[t].push(l);
      else groups.other.push(l);
    });

    html += '<div class="section-head"><h2 class="sec-title">The floor</h2><span class="head-note">' + (d.lanes || []).length + ' seats \u00b7 click a row for the full card</span></div>';
    ['T1', 'T2', 'T3', 'other', 'parked'].forEach(function (g) {
      if (!groups[g].length) return;
      html += '<div class="worker-group-label">' + tierNames[g] + ' \u00b7 ' + groups[g].length + '</div>';
      groups[g].forEach(function (l) {
        var st = laneStatus(l);
        var detail = '';
        if (l.bidding) detail += dRow('in play', l.bidding);
        if (l.closing) detail += dRow('closing', l.closing);
        if (l.understanding) detail += dRow('read', l.understanding);
        if (l.reputation && ((l.reputation.won || []).length || (l.reputation.pending || []).length)) {
          var rep = [];
          (l.reputation.won || []).forEach(function (w) { rep.push('+ ' + w); });
          (l.reputation.pending || []).forEach(function (p) { rep.push('\u00b7 ' + p); });
          detail += dRow('reputation', rep.join('  \u00b7  '));
        }
        html += '<div class="f-lane' + (st === 'dead' ? ' is-dead' : '') + '">' +
          '<span class="seat">' + (l.seat != null ? String(l.seat).padStart(2, '0') : '\u2013') + '</span>' +
          '<span class="dot ' + st + '"></span>' +
          '<span class="lname">' + esc(l.name) + '</span>' +
          '<span class="lstate">' + esc(l.state || '') + '</span>' +
          '<span class="lgate">' + esc(l.next_gate || l.next || '') + '</span>' +
          '<span class="lmoney">' + money(l.earned || 0).replace('.00', '') + '</span>' +
          (detail ? '<div class="f-lane-detail">' + detail + '</div>' : '') +
          '</div>';
      });
    });

    /* ledger + events */
    var rep = d.reputation || { won: [], pending: [] };
    var rh = '<div class="section-head"><h2 class="sec-title">Reputation ledger</h2></div>' +
      '<div class="ledger-group"><div class="block-label">Won</div>';
    if ((rep.won || []).length) rep.won.forEach(function (w) { rh += '<div class="ledger-item won">' + esc(w) + '</div>'; });
    else rh += '<div class="ledger-item pending">nothing yet</div>';
    rh += '</div><div class="ledger-group"><div class="block-label">Pending</div>';
    (rep.pending || []).forEach(function (p) { rh += '<div class="ledger-item pending">' + esc(p) + '</div>'; });
    rh += '</div>';

    var ev = (d.money_events || []).slice().reverse();
    var eh = '<div class="section-head"><h2 class="sec-title">The day\'s record</h2><span class="head-note">' + esc(d.clock_note || '') + '</span></div>';
    ev.forEach(function (e) {
      eh += '<div class="event"><span class="e-when">' + esc((e.when || '').replace(' UTC', '')) + '</span>' +
        '<span class="e-lane">' + esc(e.lane || '') + '</span>' +
        '<span class="e-text">' + esc(e.event || '') +
        (e.amount && e.amount !== '-' ? '<span class="e-amount">' + esc(e.amount) + '</span>' : '') +
        '</span></div>';
    });

    html += '<div class="two-col"><section>' + rh + '</section><section>' + eh + '</section></div>';

    /* costs */
    html += '<div class="section-head"><h2 class="sec-title">Costs on record</h2><span class="head-note">money out, honestly booked</span></div>' +
      '<table class="costs-table"><thead><tr><th>When</th><th>What</th><th class="num">Amount</th><th>Note</th></tr></thead><tbody>';
    (d.costs || []).forEach(function (c) {
      html += '<tr><td>' + esc(c.when) + '</td><td>' + esc(c.what) + '</td><td class="amount">' + esc(c.amount) + '</td><td class="note">' + esc(c.note || '') + '</td></tr>';
    });
    html += '</tbody></table>';

    el.innerHTML = html;

    Array.prototype.forEach.call(el.querySelectorAll('.f-lane'), function (row) {
      row.addEventListener('click', function () { row.classList.toggle('open'); });
    });
  }

  function vital(n, label) {
    return '<div class="vital"><span class="v-num">' + n + '</span><span class="v-label">' + label + '</span></div>';
  }

  return { render: render, laneStatus: laneStatus };
})();
