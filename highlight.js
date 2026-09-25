// highlight.js — tiny, self-contained syntax highlighter for the posts' <pre><code> blocks.
//
// No external dependency, no CDN. It reads each code block's textContent (already-decoded text),
// tokenizes comments / strings / numbers / keywords, and re-escapes as it emits token spans — so
// it is XSS-safe and never double-escapes. Colours come from CSS variables, so it follows the
// light/dark theme. Exposes window.upHighlight(root) so the writing.html reader can re-run it after
// injecting an article; static post pages get an automatic pass on load.
(function () {
  var KW = new Set(('if then else elif fi for while do done case esac in function return exit ' +
    'export local readonly declare source set unset ' +
    'const let var new delete typeof instanceof void yield async await class extends super import from default ' +
    'func range struct chan go defer select package interface type map ' +
    'def pass raise try except finally with as lambda global nonlocal ' +
    'public private protected static final abstract ' +
    'resource module provider variable output data locals terraform ' +
    'and or not is').split(/\s+/));
  var LIT = new Set(['true', 'false', 'null', 'nil', 'none', 'undefined']);

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  // which comment leaders a language uses. Unknown → allow '#' (shell/yaml are the common default)
  // but NOT '//', so URLs like https://… inside unlabelled blocks aren't mistaken for comments.
  function styles(lang) {
    if (lang === 'json') return { hash: false, slash: false };
    var hash = /^(bash|sh|shell|zsh|yaml|yml|dockerfile|docker|toml|ini|python|py|ruby|rb|makefile|make|conf|nginx|perl|pl|r|properties|env|hcl|terraform|tf)$/.test(lang);
    var slash = /^(js|javascript|ts|typescript|tsx|jsx|go|golang|java|c|cc|cpp|cs|rust|rs|kotlin|kt|swift|php|scala|groovy|json5|jsonc|hcl|terraform|tf)$/.test(lang);
    if (!lang) { hash = true; slash = false; }
    return { hash: hash, slash: slash };
  }

  function highlight(src, s) {
    var comment = [];
    if (s.slash) comment.push('\\/\\/[^\\n]*', '\\/\\*[\\s\\S]*?\\*\\/');
    if (s.hash) comment.push('#[^\\n]*');
    var cRe = comment.length ? comment.join('|') : '(?!)';   // (?!) → group present but never matches
    var re = new RegExp(
      '(' + cRe + ')' +                                       // 1 comment
      '|("(?:\\\\.|[^"\\\\])*"|\'(?:\\\\.|[^\'\\\\])*\'|`(?:\\\\.|[^`\\\\])*`)' + // 2 string
      '|(\\b0x[0-9a-fA-F]+\\b|\\b\\d[\\d_]*(?:\\.\\d+)?(?:[eE][+-]?\\d+)?\\b)' +   // 3 number
      '|([A-Za-z_$][\\w$]*)',                                 // 4 word
      'g');
    var out = '', last = 0, m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index));
      if (m[1]) out += '<span class="tok-cmt">' + esc(m[1]) + '</span>';
      else if (m[2]) out += '<span class="tok-str">' + esc(m[2]) + '</span>';
      else if (m[3]) out += '<span class="tok-num">' + esc(m[3]) + '</span>';
      else if (m[4]) {
        out += LIT.has(m[4]) ? '<span class="tok-lit">' + esc(m[4]) + '</span>'
          : KW.has(m[4]) ? '<span class="tok-kw">' + esc(m[4]) + '</span>' : esc(m[4]);
      }
      last = m.index + m[0].length;
      if (m[0].length === 0) re.lastIndex++;                  // guard against a zero-width match
    }
    return out + esc(src.slice(last));
  }

  function run(root) {
    var nodes = (root || document).querySelectorAll('pre code');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.dataset.hl) continue; el.dataset.hl = '1';
      var lang = (el.className.match(/language-([\w+#-]+)/) || [])[1] || '';
      el.innerHTML = highlight(el.textContent, styles(lang.toLowerCase()));
    }
  }
  window.upHighlight = run;
  if (document.readyState !== 'loading') run(); else addEventListener('DOMContentLoaded', function () { run(); });
})();
