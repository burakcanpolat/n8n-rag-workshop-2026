/* İmbat Pedal el kitabı v3: theme, navigation, search, copy, tabs, rail, notes.
   Every storage access sits in try/catch; the page works without storage and without this file. */
(function () {
  "use strict";

  var d = document, root = d.documentElement;
  var ROOT = root.getAttribute("data-root") || "";
  var PREFIX = "n8n-rag-handbook-v1.";
  /* filled by build.py: every note box and checklist item of the whole handbook */
  var REG = [{"k": "s00", "t": "Ana sayfa", "c": []}, {"k": "", "t": "Başla: kurulum ve kit", "c": [{"id": "chk-n8n", "l": "n8n açık ve boş bir workflow oluşturabiliyorum"}, {"id": "chk-key", "l": "Google AI Studio anahtarım hazır"}, {"id": "chk-kit", "l": "Kit indirildi ve açıldı"}, {"id": "chk-store", "l": "01-klasik-rag çalıştı, depo dolu"}]}, {"k": "u1-1", "t": "1.1 Açılış", "c": []}, {"k": "u1-2", "t": "1.2 n8n turu", "c": []}, {"k": "u1-3", "t": "1.3 Klasik RAG (2023)", "c": []}, {"k": "u1-4", "t": "1.4 Ne değişti", "c": []}, {"k": "u1-5", "t": "1.5 Agentic (2026)", "c": []}, {"k": "u1-6", "t": "1.6 Context engineering", "c": []}, {"k": "u1-7", "t": "1.7 Yeni yapılar", "c": []}, {"k": "u1-8", "t": "1.8 Ölçüm ve kapanış", "c": [{"id": "chk-yarin-1", "l": "Kitteki 10 soruyu sor ve skorla"}, {"id": "chk-yarin-2", "l": "belge_arama 'da Limit'i 2 yap, aynı 10 soruyu tekrar ölç"}, {"id": "chk-yarin-3", "l": "Kişisel veri içermeyen 5 belgeni aynı hatta koy, 5 soruluk test seti yaz"}]}, {"k": "r1", "t": "R1 RAG: 2023'ten 2026'ya", "c": []}, {"k": "r2", "t": "R2 Masa ve dört fiil", "c": []}, {"k": "r3", "t": "R3 Ne zaman hangisi", "c": []}, {"k": "r4", "t": "R4 n8n Agents ve dosya araçları", "c": []}, {"k": "r5", "t": "R5 Claude Code köprüsü ve MCP", "c": []}, {"k": "r6", "t": "R6 Test setiyle ölçmek", "c": []}, {"k": "r7", "t": "R7 Güvenlik ve KVKK", "c": []}, {"k": "r8", "t": "R8 Kaynaklar ve sözlük", "c": []}];

  function lsGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { window.localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function all(sel, ctx) { return Array.prototype.slice.call((ctx || d).querySelectorAll(sel)); }
  function on(el, ev, fn) { if (el) el.addEventListener(ev, fn); }

  var live = d.getElementById("live");
  function announce(msg) {
    if (!live) return;
    live.textContent = "";
    window.setTimeout(function () { live.textContent = msg; }, 30);
  }

  /* ---------------------------------------------------------- theme */
  function currentTheme() { return root.getAttribute("data-theme") === "light" ? "light" : "dark"; }
  function syncThemeButtons() {
    var t = currentTheme();
    all("[data-theme-toggle]").forEach(function (b) {
      b.setAttribute("title", t === "dark" ? "Açık temaya geç" : "Koyu temaya geç");
    });
  }
  all("[data-theme-toggle]").forEach(function (b) {
    on(b, "click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      lsSet("ih.theme", next);
      syncThemeButtons();
    });
  });
  syncThemeButtons();

  /* ---------------------------------------------------------- focus helpers */
  var FOCUSABLE = "a[href],button:not([disabled]),input:not([disabled]),textarea,select,[tabindex]:not([tabindex='-1'])";
  function focusables(box) {
    return all(FOCUSABLE, box).filter(function (el) { return el.offsetParent !== null || el === d.activeElement; });
  }
  function trap(box, e) {
    if (e.key !== "Tab") return;
    var f = focusables(box);
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------------------------------------------------------- sidebar groups */
  all(".nav-group-btn").forEach(function (btn) {
    on(btn, "click", function () {
      var list = d.getElementById(btn.getAttribute("aria-controls"));
      var open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (list) list.hidden = !open;
    });
  });
  try {
    var sb = d.querySelector(".sidebar");
    var cur = sb && sb.querySelector("[aria-current='page']");
    if (sb && cur) {
      var top = cur.offsetTop, h = sb.clientHeight;
      if (top < sb.scrollTop || top + cur.offsetHeight > sb.scrollTop + h) {
        sb.scrollTop = Math.max(0, top - h / 2);
      }
    }
  } catch (e) { /* convenience only */ }

  /* ---------------------------------------------------------- mobile sheet */
  var sheet = d.getElementById("sheet"), menuBtn = d.getElementById("menuBtn"), sheetReturn = null;
  function openSheet() {
    if (!sheet) return;
    sheetReturn = (d.activeElement && d.activeElement !== d.body) ? d.activeElement : menuBtn;
    sheet.hidden = false;
    d.body.classList.add("no-scroll");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "true");
    var cur = sheet.querySelector("[aria-current='page']");
    var closeBtn = sheet.querySelector("[data-sheet-close]");
    (closeBtn || cur).focus();
  }
  function closeSheet(restore) {
    if (!sheet || sheet.hidden) return;
    sheet.hidden = true;
    d.body.classList.remove("no-scroll");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
    if (restore !== false && sheetReturn && sheetReturn.focus) sheetReturn.focus();
  }
  on(menuBtn, "click", openSheet);
  all("[data-sheet-close]").forEach(function (b) { on(b, "click", function () { closeSheet(); }); });
  on(sheet, "keydown", function (e) {
    if (e.key === "Escape") { e.preventDefault(); closeSheet(); }
    else trap(sheet, e);
  });
  on(sheet, "click", function (e) {
    var a = e.target.closest ? e.target.closest("a[href]") : null;
    if (a && a.getAttribute("href").indexOf("#") !== 0) closeSheet(false);
  });
  window.addEventListener("resize", function () {
    if (sheet && !sheet.hidden && window.innerWidth >= 1024) closeSheet(false);
  });

  /* ---------------------------------------------------------- search */
  var S = {
    box: d.getElementById("search"), input: d.getElementById("searchInput"),
    list: d.getElementById("searchResults"), empty: d.getElementById("searchEmpty"),
    suggest: d.getElementById("searchSuggest"), data: null, loading: false, sel: -1, ret: null
  };
  var KIND = { unite: "Ünite", referans: "Referans", prompt: "Prompt", sozluk: "Sözlük", sayfa: "Sayfa" };
  function fold(s) {
    return (s || "").toLocaleLowerCase("tr")
      .replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ü/g, "u")
      .replace(/ö/g, "o").replace(/ç/g, "c").replace(/â/g, "a").replace(/î/g, "i").replace(/û/g, "u");
  }
  function prep(arr) {
    (arr || []).forEach(function (r, i) {
      r._i = i; r._t = fold(r.t); r._h = fold(r.h); r._x = fold(r.x);
    });
    return arr || [];
  }
  function loadIndex(cb) {
    if (S.data) { cb(); return; }
    if (window.IH_SEARCH) { S.data = prep(window.IH_SEARCH); cb(); return; }
    if (S.loading) return;
    S.loading = true;
    function viaScript() {
      var s = d.createElement("script");
      s.src = ROOT + "assets/search-index.js";
      s.onload = function () { S.data = prep(window.IH_SEARCH || []); S.loading = false; cb(); };
      s.onerror = function () { S.data = []; S.loading = false; cb(); };
      d.head.appendChild(s);
    }
    if (/^https?:$/.test(location.protocol) && window.fetch) {
      window.fetch(ROOT + "assets/search-index.json")
        .then(function (r) { if (!r.ok) throw new Error("index"); return r.json(); })
        .then(function (j) { S.data = prep(j); S.loading = false; cb(); })
        .catch(viaScript);
    } else {
      viaScript();
    }
  }
  function select(i) {
    var items = all("li", S.list);
    if (!items.length) { S.sel = -1; S.input.removeAttribute("aria-activedescendant"); return; }
    S.sel = (i + items.length) % items.length;
    items.forEach(function (li, j) { li.setAttribute("aria-selected", j === S.sel ? "true" : "false"); });
    S.input.setAttribute("aria-activedescendant", items[S.sel].id);
    var a = items[S.sel];
    if (a.scrollIntoView) a.scrollIntoView({ block: "nearest" });
  }
  /* wrap every folded match of the query terms in <mark>, keeping the original casing */
  function paint(el, text, terms) {
    var folded = "", map = [];
    for (var i = 0; i < text.length; i++) {
      var f = fold(text.charAt(i));
      for (var j = 0; j < f.length; j++) { folded += f.charAt(j); map.push(i); }
    }
    var marks = [];
    terms.forEach(function (t) {
      if (!t) return;
      var from = 0, at;
      while ((at = folded.indexOf(t, from)) > -1) {
        marks.push([map[at], map[at + t.length - 1] + 1]);
        from = at + t.length;
      }
    });
    marks.sort(function (a, b) { return a[0] - b[0]; });
    var merged = [];
    marks.forEach(function (m) {
      var last = merged[merged.length - 1];
      if (last && m[0] <= last[1]) last[1] = Math.max(last[1], m[1]); else merged.push([m[0], m[1]]);
    });
    var pos = 0;
    merged.forEach(function (m) {
      if (m[0] > pos) el.appendChild(d.createTextNode(text.slice(pos, m[0])));
      var mk = d.createElement("mark");
      mk.textContent = text.slice(m[0], m[1]);
      el.appendChild(mk);
      pos = m[1];
    });
    if (pos < text.length) el.appendChild(d.createTextNode(text.slice(pos)));
  }
  function render(results, q) {
    var terms = fold(q || "").split(/\s+/).filter(Boolean);
    while (S.list.firstChild) S.list.removeChild(S.list.firstChild);
    S.sel = -1;
    results.forEach(function (res, i) {
      var r = res.r;
      var li = d.createElement("li");
      li.id = "sr-" + i;
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", "false");
      var a = d.createElement("a");
      a.href = ROOT + r.u;
      a.tabIndex = -1;
      var top = d.createElement("span");
      top.className = "sr-top";
      var k = d.createElement("span");
      k.className = "sr-kind";
      k.textContent = KIND[r.k] || "";
      var t = d.createElement("span");
      t.className = "sr-title";
      paint(t, r.h ? r.t + ", " + r.h : r.t, terms);
      top.appendChild(k); top.appendChild(t);
      var x = d.createElement("span");
      x.className = "sr-x";
      paint(x, r.x || "", terms);
      a.appendChild(top); a.appendChild(x);
      a.addEventListener("mousemove", function () { if (S.sel !== i) select(i); });
      li.appendChild(a);
      S.list.appendChild(li);
    });
    S.empty.hidden = !(q && !results.length);
    S.suggest.hidden = !!q;
    if (results.length) select(0);
  }
  function run() {
    var q = S.input.value.trim();
    if (!q) { render([], ""); return; }
    loadIndex(function () {
      var terms = fold(q).split(/\s+/).filter(Boolean);
      var whole = fold(q);
      var out = [];
      S.data.forEach(function (r) {
        var score = 0, ok = true;
        terms.forEach(function (t) {
          var s = 0, it = r._t.indexOf(t);
          if (it === 0) s += 4; else if (it > 0) s += 3;
          if (r._h.indexOf(t) > -1) s += 2;
          if (r._x.indexOf(t) > -1) s += 1;
          if (!s) ok = false;
          score += s;
        });
        if (!ok) return;
        if (r._t === whole && !r._h) score += 20;       /* the page itself, e.g. "sozluk" */
        else if (r._t === whole || r._h === whole) score += 10;
        if (terms.length > 1 && r._x.indexOf(whole) > -1) score += 1;
        if (r.k === "prompt") score += 0.5;
        out.push({ r: r, s: score });
      });
      out.sort(function (a, b) { return b.s - a.s || a.r._i - b.r._i; });
      if (S.input.value.trim() === q) render(out.slice(0, 12), q);
    });
  }
  function openSearch() {
    if (!S.box) return;
    var fromSheet = sheet && !sheet.hidden;
    S.ret = fromSheet ? menuBtn : d.activeElement;
    if (fromSheet) closeSheet(false);
    S.box.hidden = false;
    d.body.classList.add("no-scroll");
    S.input.focus();
    S.input.select();
    loadIndex(function () { if (S.input.value.trim()) run(); });
  }
  function closeSearch() {
    if (!S.box || S.box.hidden) return;
    S.box.hidden = true;
    d.body.classList.remove("no-scroll");
    if (S.ret && S.ret.focus) S.ret.focus();
  }
  all("[data-search-open]").forEach(function (b) { on(b, "click", openSearch); });
  all("[data-search-close]").forEach(function (b) { on(b, "click", closeSearch); });
  all(".s-chip").forEach(function (c) {
    on(c, "click", function () { S.input.value = c.getAttribute("data-q") || c.textContent; run(); S.input.focus(); });
  });
  on(S.input, "input", run);
  on(S.input, "keydown", function (e) {
    var items = all("li", S.list);
    if (e.key === "ArrowDown") { e.preventDefault(); select(S.sel + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); select(S.sel - 1); }
    else if (e.key === "Enter") {
      var li = items[S.sel >= 0 ? S.sel : 0];
      if (li) { e.preventDefault(); var a = li.querySelector("a"); closeSearch(); window.location.href = a.href; }
    }
  });
  on(S.box, "keydown", function (e) {
    if (e.key === "Escape") { e.preventDefault(); closeSearch(); }
    else trap(S.box, e);
  });
  on(S.list, "click", function (e) {
    var a = e.target.closest ? e.target.closest("a") : null;
    if (a) { S.box.hidden = true; d.body.classList.remove("no-scroll"); }
  });
  try {
    if (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) {
      all("[data-kbd]").forEach(function (k) { k.textContent = "⌘ K"; });
    }
  } catch (e) { /* ignore */ }
  d.addEventListener("keydown", function (e) {
    var t = e.target, tag = (t && t.tagName) || "";
    var typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable);
    if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (S.box && S.box.hidden) openSearch(); else closeSearch();
      return;
    }
    if (e.key === "/" && !typing && S.box && S.box.hidden) { e.preventDefault(); openSearch(); }
  });

  /* ---------------------------------------------------------- copy */
  function fallbackCopy(text) {
    try {
      var ta = d.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed"; ta.style.top = "-1000px"; ta.style.opacity = "0";
      d.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      var ok = d.execCommand("copy");
      d.body.removeChild(ta);
      return ok;
    } catch (e) { return false; }
  }
  all(".copy-btn").forEach(function (btn) {
    on(btn, "click", function () {
      var target = d.getElementById(btn.getAttribute("data-copy"));
      if (!target) return;
      var text = target.textContent || "";
      var name = btn.getAttribute("data-copy-name") || "Metin";
      var block = btn.closest ? btn.closest(".code-block") : null;
      var status = block ? block.querySelector(".copy-status") : null;
      function done() {
        btn.classList.add("is-copied");
        if (block) block.classList.add("is-copied");
        if (status) status.textContent = "Kopyalandı";
        announce(name + " kopyalandı");
        window.clearTimeout(btn._t);
        btn._t = window.setTimeout(function () {
          btn.classList.remove("is-copied");
          if (block) block.classList.remove("is-copied");
          if (live) live.textContent = "";
        }, 2000);
      }
      function fail() {
        announce(name + " kopyalanamadı, metni seçip kopyala");
        try {
          var range = d.createRange();
          range.selectNodeContents(target);
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        } catch (e) { /* ignore */ }
      }
      if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () { if (fallbackCopy(text)) done(); else fail(); });
      } else if (fallbackCopy(text)) { done(); } else { fail(); }
    });
  });

  /* ---------------------------------------------------------- tabs */
  all("[role='tablist']").forEach(function (list) {
    var tabs = all("[role='tab']", list);
    var key = list.getAttribute("data-store");
    function choose(tab, focus, store) {
      tabs.forEach(function (t) {
        var sel = t === tab;
        t.setAttribute("aria-selected", sel ? "true" : "false");
        t.tabIndex = sel ? 0 : -1;
        var p = d.getElementById(t.getAttribute("aria-controls"));
        if (p) p.hidden = !sel;
      });
      if (focus) tab.focus();
      if (key && store) lsSet(key, tab.id);
    }
    tabs.forEach(function (t, i) {
      on(t, "click", function () { choose(t, false, true); });
      on(t, "keydown", function (e) {
        var j = null;
        if (e.key === "ArrowRight") j = (i + 1) % tabs.length;
        else if (e.key === "ArrowLeft") j = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") j = 0;
        else if (e.key === "End") j = tabs.length - 1;
        if (j !== null) { e.preventDefault(); choose(tabs[j], true, true); }
      });
    });
    var saved = key ? lsGet(key) : null;
    var st = saved ? d.getElementById(saved) : null;
    if (st && tabs.indexOf(st) > -1) choose(st, false, false);
  });

  /* ---------------------------------------------------------- on this page */
  (function () {
    var links = all(".rail-list a");
    var inline = all(".toc-list a");
    if (!links.length && !inline.length) return;
    var src = links.length ? links : inline;
    var targets = src.map(function (a) { return d.getElementById(decodeURIComponent(a.hash.slice(1))); });
    var ind = d.querySelector(".rail-ind");
    var railNav = d.querySelector(".rail-nav");
    var current = -1, picked = -1, lockUntil = 0;
    function setCurrent(i) {
      if (i === current) return;
      current = i;
      [links, inline].forEach(function (group) {
        group.forEach(function (a, j) {
          if (j === i) { a.classList.add("is-current"); a.setAttribute("aria-current", "location"); }
          else { a.classList.remove("is-current"); a.removeAttribute("aria-current"); }
        });
      });
      if (railNav) railNav.classList.toggle("has-current", i >= 0);
      if (ind && links[i]) {
        ind.style.transform = "translateY(" + links[i].offsetTop + "px)";
        ind.style.opacity = "1";
      }
    }
    var ticking = false;
    function onScreen(i) {
      if (i < 0 || !targets[i]) return false;
      var top = targets[i].getBoundingClientRect().top;
      return top >= 0 && top < window.innerHeight;
    }
    function compute() {
      ticking = false;
      if (Date.now() < lockUntil) return;          /* a rail click is still scrolling */
      var line = window.innerWidth < 1024 ? 96 : 150;
      var idx = 0;
      for (var i = 0; i < targets.length; i++) {
        if (targets[i] && targets[i].getBoundingClientRect().top - line <= 0) idx = i;
      }
      var doc = d.documentElement;
      if (window.innerHeight + window.pageYOffset >= doc.scrollHeight - 4) {
        /* the page cannot scroll further: keep a clicked target if it is on screen,
           otherwise take the last target whose top is inside the viewport */
        if (onScreen(picked)) idx = picked;
        else for (var j = targets.length - 1; j > idx; j--) { if (onScreen(j)) { idx = j; break; } }
      } else {
        picked = -1;
      }
      setCurrent(idx);
    }
    function pick(i) {
      if (i < 0) return;
      picked = i;
      lockUntil = Date.now() + 700;
      setCurrent(i);
    }
    function indexOfHash(h) {
      h = decodeURIComponent((h || "").replace(/^#/, ""));
      if (!h) return -1;
      for (var i = 0; i < targets.length; i++) { if (targets[i] && targets[i].id === h) return i; }
      return -1;
    }
    [links, inline].forEach(function (group) {
      group.forEach(function (a, j) { on(a, "click", function () { pick(j); }); });
    });
    window.addEventListener("hashchange", function () { var i = indexOfHash(location.hash); if (i !== picked) pick(i); });
    function schedule() { if (!ticking) { ticking = true; window.requestAnimationFrame(compute); } }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(schedule, { rootMargin: "-120px 0px -60% 0px", threshold: [0, 1] });
      targets.forEach(function (t) { if (t) io.observe(t); });
    }
    window.addEventListener("scroll", function () {
      /* a long smooth scroll outlasts 700 ms: keep the lock until the scroll has been quiet for 150 ms */
      if (Date.now() < lockUntil) lockUntil = Math.max(lockUntil, Date.now() + 150);
      schedule();
    }, { passive: true });
    window.addEventListener("resize", schedule);
    var start = indexOfHash(location.hash);
    if (start > -1) pick(start); else compute();
  })();

  /* ---------------------------------------------------------- wide figures */
  all(".fig-body").forEach(function (box) {
    function edge() { box.classList.toggle("at-end", box.scrollLeft + box.clientWidth >= box.scrollWidth - 2); }
    on(box, "scroll", edge);
    window.addEventListener("resize", edge);
    edge();
  });

  /* ---------------------------------------------------------- checklists */
  all(".checklist input[type='checkbox']").forEach(function (box) {
    if (!box.id) return;
    var key = PREFIX + "check." + box.id;
    if (lsGet(key) === "1") box.checked = true;
    on(box, "change", function () { lsSet(key, box.checked ? "1" : "0"); });
  });

  /* ---------------------------------------------------------- notes */
  var noteBoxes = all(".notes");
  function markEmpty(wrap, area) {
    if (area.value.replace(/\s+/g, "") === "") wrap.classList.add("is-empty");
    else wrap.classList.remove("is-empty");
  }
  noteBoxes.forEach(function (wrap) {
    var name = wrap.getAttribute("data-note");
    var area = wrap.querySelector("textarea");
    var flag = wrap.querySelector(".notes-saved");
    if (!name || !area) return;
    var stored = lsGet(PREFIX + "note." + name);
    if (stored !== null) area.value = stored;
    markEmpty(wrap, area);
    var timer = null;
    on(area, "input", function () {
      markEmpty(wrap, area);
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        var ok = lsSet(PREFIX + "note." + name, area.value);
        if (flag) {
          flag.textContent = ok ? "Kaydedildi" : "Bu tarayıcıda kaydedilmedi";
          flag.classList.add("on");
          window.setTimeout(function () { flag.classList.remove("on"); }, 1600);
        }
      }, 400);
    });
  });

  /* ---------------------------------------------------------- export and print */
  function buildMarkdown() {
    var out = ["# 2023'ten 2026'ya: Belgelerinden Cevap Veren Asistan", "",
      "27 Eylül 2026 eğitiminden notlarım.",
      "Dışa aktarıldı: " + new Date().toISOString().slice(0, 10) + ".", ""];
    var wrote = false;
    (REG || []).forEach(function (sec) {
      var text = (lsGet(PREFIX + "note." + sec.k) || "").replace(/\s+$/, "");
      var ticked = (sec.c || []).filter(function (c) { return lsGet(PREFIX + "check." + c.id) === "1"; })
        .map(function (c) { return c.l; });
      if (text === "" && !ticked.length) return;
      wrote = true;
      out.push("## " + sec.t, "");
      if (text !== "") out.push(text, "");
      if (ticked.length) {
        out.push("İşaretlenenler:");
        ticked.forEach(function (t) { out.push("- " + t); });
        out.push("");
      }
    });
    if (!wrote) out.push("## Henüz not yok", "", "Bu tarayıcıda not ya da işaretli madde bulunamadı.", "");
    return out.join("\n");
  }
  all("[data-export]").forEach(function (b) {
    on(b, "click", function () {
      try {
        var blob = new Blob([buildMarkdown()], { type: "text/markdown;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var a = d.createElement("a");
        a.href = url;
        a.download = "n8n-rag-egitim-notlarim.md";
        d.body.appendChild(a);
        a.click();
        d.body.removeChild(a);
        window.setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
        announce("Notlar indirildi");
      } catch (e) {
        window.alert("Bu tarayıcı dosyayı indirmeye izin vermedi. Notlarını seçip elle kopyala.");
      }
    });
  });
  all("[data-print]").forEach(function (b) {
    on(b, "click", function () {
      noteBoxes.forEach(function (wrap) {
        var area = wrap.querySelector("textarea");
        if (area) markEmpty(wrap, area);
      });
      window.print();
    });
  });
})();
