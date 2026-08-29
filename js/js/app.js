/* Router and shell for the Instinct dashboard. */

(function () {
  'use strict';

  var view = document.getElementById('view');
  var sourceLine = document.getElementById('source-line');

  function setSource(text) { sourceLine.textContent = text || ''; }

  function getJSON(url) {
    return fetch(url, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error(url + ' -> ' + r.status);
      return r.json();
    });
  }

  function getText(url) {
    return fetch(url, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error(url + ' -> ' + r.status);
      return r.text();
    });
  }

  function getDoc(key) { return getText('/api/doc?key=' + encodeURIComponent(key)); }

  function getFactory() {
    return getJSON('/api/doc?key=factory').catch(function () {
      return getJSON('data/factory.json');
    });
  }

  var ctx = { getJSON: getJSON, getText: getText, getDoc: getDoc, getFactory: getFactory, setSource: setSource };

  /* clock */
  function tickClock() {
    try {
      document.getElementById('clock').textContent =
        new Date().toLocaleTimeString('en-GB', { timeZone: 'America/Sao_Paulo', hour12: false });
    } catch (e) {
      document.getElementById('clock').textContent = new Date().toLocaleTimeString('en-GB', { hour12: false });
    }
  }
  tickClock();
  setInterval(tickClock, 1000);

  var TITLES = {
    now: "Now", factory: "The Factory", workers: "The Workers",
    instrument: "The Instrument", days: "The Days",
    understanding: "Understanding", learning: "Learning"
  };

  function setNav(route) {
    document.title = (TITLES[route] ? TITLES[route] + ' · ' : '') + "Eduardo's Instinct";
    Array.prototype.forEach.call(document.querySelectorAll('#nav a'), function (a) {
      a.classList.toggle('current', a.getAttribute('data-route') === route);
    });
  }

  function route() {
    var hash = location.hash.replace(/^#\/?/, '');
    var parts = hash.split('/').filter(Boolean);
    var name = parts[0] || 'now';
    var arg = parts[1];

    window.scrollTo(0, 0);
    setSource('');

    if (name === 'now') { setNav('now'); window.Sections.now(view, ctx); }
    else if (name === 'factory') {
      setNav('factory');
      view.innerHTML = '<div class="loading">reading the floor&hellip;</div>';
      getFactory().then(function (d) {
        window.FactorySection.render(view, d, {});
        setSource('Rendered live from factory-tracker-data.json, kept by the factory hand. Snapshot only if the feed fails, labeled as one.');
      }).catch(function () {
        view.innerHTML = '<div class="loading">the factory record is unreachable right now</div>';
      });
    }
    else if (name === 'workers') { setNav('workers'); view.innerHTML = '<div class="loading">walking the floor&hellip;</div>'; window.Sections.workers(view, ctx); }
    else if (name === 'instrument') { setNav('instrument'); window.Sections.instrument(view, ctx, arg); }
    else if (name === 'days' && arg) { setNav('days'); view.innerHTML = '<div class="loading">opening the day&hellip;</div>'; window.Sections.day(view, ctx, arg); }
    else if (name === 'days') { setNav('days'); window.Sections.days(view, ctx); }
    else if (name === 'understanding') { setNav('understanding'); window.Sections.understanding(view, ctx, arg); }
    else if (name === 'learning') { setNav('learning'); window.Sections.learning(view, ctx, arg); }
    else { location.hash = '#/now'; }
  }

  window.addEventListener('hashchange', route);
  route();
})();
