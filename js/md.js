/* A small markdown renderer for the tree's own documents.
   Covers what the corpus uses: headings, paragraphs, bold, italic,
   links, lists, blockquotes, rules, inline code. HTML is escaped first:
   these files are trusted, but the renderer never passes markup through. */

window.MD = (function () {
  'use strict';

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function inline(s) {
    s = esc(s);
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    s = s.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return s;
  }

  function render(src) {
    var lines = String(src || '').replace(/\r\n/g, '\n').split('\n');
    var out = [], i = 0, para = [];

    function flushPara() {
      if (para.length) {
        out.push('<p>' + para.map(inline).join(' ') + '</p>');
        para = [];
      }
    }

    while (i < lines.length) {
      var line = lines[i];
      var t = line.trim();

      if (!t) { flushPara(); i++; continue; }

      var h = t.match(/^(#{1,4})\s+(.*)$/);
      if (h) {
        flushPara();
        var lvl = h[1].length;
        out.push('<h' + lvl + '>' + inline(h[2]) + '</h' + lvl + '>');
        i++; continue;
      }

      if (/^(-{3,}|\*{3,})$/.test(t)) { flushPara(); out.push('<hr>'); i++; continue; }

      if (t.charAt(0) === '>') {
        flushPara();
        var quote = [];
        while (i < lines.length && lines[i].trim().charAt(0) === '>') {
          quote.push(lines[i].trim().replace(/^>\s?/, ''));
          i++;
        }
        out.push('<blockquote>' + quote.map(inline).join(' ') + '</blockquote>');
        continue;
      }

      if (/^[-*]\s+/.test(t)) {
        flushPara();
        var items = [];
        while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
          items.push('<li>' + inline(lines[i].trim().replace(/^[-*]\s+/, '')) + '</li>');
          i++;
        }
        out.push('<ul>' + items.join('') + '</ul>');
        continue;
      }

      if (/^\d+[.)]\s+/.test(t)) {
        flushPara();
        var oitems = [];
        while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) {
          oitems.push('<li>' + inline(lines[i].trim().replace(/^\d+[.)]\s+/, '')) + '</li>');
          i++;
        }
        out.push('<ol>' + oitems.join('') + '</ol>');
        continue;
      }

      para.push(t);
      i++;
    }
    flushPara();
    return out.join('\n');
  }

  return { render: render };
})();
