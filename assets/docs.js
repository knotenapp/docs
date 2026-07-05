/* ============================================================================
   Knoten Docs — client-side renderer
   Reads manifest.json for navigation and renders the Markdown chapters live.
   No build step: edit the .md files and the site reflects them.
   ========================================================================== */
(function () {
  "use strict";

  /* --- config ------------------------------------------------------------ */
  // Derive the base path from where THIS script is served, so the site works
  // whether it's hosted at a domain root (docs.knoten.dev/) or a subpath
  // (e.g. knotenapp.github.io/docs/). Content + assets sit next to it.
  const SCRIPT_SRC =
    (document.currentScript && document.currentScript.src) ||
    (function () {
      const s = Array.prototype.slice
        .call(document.getElementsByTagName("script"))
        .find((n) => /docs\.js(\?|$)/.test(n.src || ""));
      return s ? s.src : location.href;
    })();
  // e.g. "/", or "/docs/". Always ends with a slash.
  const BASE = new URL(".", SCRIPT_SRC).pathname.replace(/assets\/?$/, "");
  // TODO: set to the docs content repo to enable the "Edit this page" link,
  // e.g. "https://github.com/knotenapp/docs/edit/main/". Empty = hidden.
  const GITHUB_EDIT_BASE = "";

  /* --- state ------------------------------------------------------------- */
  let manifest = null;
  let routes = new Map(); // slug -> page {title, file, slug, section}
  let order = []; // ordered slugs for prev/next (home first)
  let searchIndex = null; // built lazily on first search
  let searchResults = [];
  let searchActive = -1;

  const $ = (sel, el = document) => el.querySelector(sel);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const esc = (s) =>
    s.replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[c]);

  /* --- boot -------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", boot);

  async function boot() {
    initTheme();
    wireChrome();
    try {
      manifest = await fetchJSON(BASE + "manifest.json");
    } catch (e) {
      if (location.protocol === "file:") return renderFileProtocolHelp();
      return renderError("Couldn't load the documentation index.");
    }
    buildSidebar();
    window.addEventListener("popstate", () =>
      renderPage(pathToSlug(location.pathname), location.hash, false),
    );
    renderPage(pathToSlug(location.pathname), location.hash, false);
  }

  async function fetchJSON(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(r.status);
    return r.json();
  }
  async function fetchText(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(r.status);
    return r.text();
  }

  /* --- routing ----------------------------------------------------------- */
  function pathToSlug(pathname) {
    let p = decodeURIComponent(pathname);
    if (BASE !== "/" && p.indexOf(BASE) === 0) p = p.slice(BASE.length);
    p = p.replace(/^\/+/, "").replace(/\/+$/, "");
    if (p === "") return "index";
    return p.split("/").pop();
  }
  function slugToPath(slug) {
    return BASE + (slug === "index" ? "" : slug);
  }

  function navigate(slug, push, hash) {
    if (push) history.pushState({ slug }, "", slugToPath(slug) + (hash || ""));
    renderPage(slug, hash, false);
  }

  /* --- sidebar ----------------------------------------------------------- */
  function buildSidebar() {
    const nav = $("#sidebarNav");
    nav.innerHTML = "";

    // Home link.
    const home = manifest.home || { title: "Overview", slug: "index", file: "README.md" };
    routes.set(home.slug, { ...home, section: "" });
    order.push(home.slug);

    const homeSec = el("div", "nav-section");
    homeSec.appendChild(navLink(home.slug, home.title));
    nav.appendChild(homeSec);

    (manifest.sections || []).forEach((section) => {
      const sec = el("div", "nav-section");
      sec.appendChild(el("div", "nav-section__title", esc(section.title)));
      (section.items || []).forEach((item) => {
        routes.set(item.slug, { ...item, section: section.title });
        order.push(item.slug);
        sec.appendChild(navLink(item.slug, item.title));
      });
      nav.appendChild(sec);
    });
  }

  function navLink(slug, title) {
    const a = el("a", "nav-link", esc(title));
    a.href = slugToPath(slug);
    a.dataset.slug = slug;
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      closeSidebar();
      navigate(slug, true);
    });
    return a;
  }

  function setActiveNav(slug) {
    document.querySelectorAll(".nav-link").forEach((a) =>
      a.classList.toggle("is-active", a.dataset.slug === slug),
    );
  }

  /* --- page render ------------------------------------------------------- */
  async function renderPage(slug, hash, isPush) {
    const page = routes.get(slug);
    const content = $("#content");
    setActiveNav(slug);

    if (!page) return renderNotFound();

    content.innerHTML =
      '<div class="content-inner skeleton">' +
      '<div class="sk" style="width:40%;height:34px"></div>' +
      '<div class="sk" style="width:90%"></div><div class="sk" style="width:80%"></div>' +
      '<div class="sk" style="width:85%"></div><div class="sk" style="width:60%"></div>' +
      "</div>";

    let md;
    try {
      md = await fetchText(BASE + page.file);
    } catch (e) {
      return renderError("Couldn't load “" + page.title + "”.");
    }

    md = stripFrontmatter(md);
    const html = parseMarkdown(md);

    const inner = el("div", "content-inner");
    if (page.section)
      inner.appendChild(
        el(
          "div",
          "breadcrumb",
          "<b>" + esc(page.section) + "</b><span>›</span><span>" + esc(page.title) + "</span>",
        ),
      );

    const article = el("article", "prose");
    article.innerHTML = html;
    inner.appendChild(article);

    enhance(article, page);
    inner.appendChild(pageNav(slug));
    if (GITHUB_EDIT_BASE)
      inner.appendChild(
        el(
          "div",
          "edit-link",
          '<a href="' + GITHUB_EDIT_BASE + page.file + '" target="_blank" rel="noopener">Edit this page on GitHub ↗</a>',
        ),
      );

    content.innerHTML = "";
    content.appendChild(inner);

    document.title =
      (slug === "index" ? "Knoten Documentation" : page.title + " · Knoten Docs");
    setMeta(page.description || (manifest && manifest.description) || "");

    buildTOC(article);
    wireContentLinks(article);

    // Scroll to hash target or top.
    const target = hash && $(hash, article);
    if (target) target.scrollIntoView();
    else window.scrollTo({ top: 0, behavior: "auto" });

    updateProgress();
  }

  function stripFrontmatter(md) {
    if (md.startsWith("---")) {
      const end = md.indexOf("\n---", 3);
      if (end !== -1) {
        const after = md.indexOf("\n", end + 1);
        return md.slice(after === -1 ? md.length : after + 1);
      }
    }
    return md;
  }

  function parseMarkdown(md) {
    if (window.marked) {
      try {
        window.marked.setOptions &&
          window.marked.setOptions({ gfm: true, breaks: false, mangle: false, headerIds: false });
      } catch (e) {}
      return (window.marked.parse || window.marked)(md);
    }
    return "<pre>" + esc(md) + "</pre>";
  }

  /* --- content enhancement ---------------------------------------------- */
  function enhance(article, page) {
    // Headings: assign ids (respecting explicit anchors) + hover anchor link.
    const used = {};
    article.querySelectorAll("h2, h3, h4").forEach((h) => {
      let id =
        h.id ||
        (h.querySelector("[id]") && h.querySelector("[id]").id) ||
        slugify(h.textContent);
      if (!h.id && !h.querySelector("[id]")) {
        if (used[id]) id = id + "-" + ++used[id];
        else used[id] = 0;
        h.id = id;
      }
      if (h.tagName !== "H4") {
        const a = el("a", "heading-anchor", "#");
        a.href = "#" + (h.id || id);
        a.setAttribute("aria-label", "Link to this section");
        h.appendChild(a);
      }
    });

    // Tables: wrap for horizontal scroll.
    article.querySelectorAll("table").forEach((t) => {
      if (t.parentElement.classList.contains("table-wrap")) return;
      const w = el("div", "table-wrap");
      t.parentNode.insertBefore(w, t);
      w.appendChild(t);
    });

    // Code blocks: highlight + language label + copy button.
    article.querySelectorAll("pre > code").forEach((code) => {
      const pre = code.parentElement;
      let lang = (code.className.match(/language-([\w-]+)/) || [])[1] || "";
      if (lang === "jsonc") code.className = "language-json";
      if (window.hljs) {
        try {
          window.hljs.highlightElement(code);
        } catch (e) {}
      }
      if (lang) pre.appendChild(el("span", "code-lang", esc(lang)));
      const btn = el("button", "copy-btn", copyIcon());
      btn.setAttribute("aria-label", "Copy code");
      btn.addEventListener("click", () => {
        navigator.clipboard.writeText(code.textContent).then(() => {
          btn.classList.add("copied");
          btn.innerHTML = checkIcon();
          setTimeout(() => {
            btn.classList.remove("copied");
            btn.innerHTML = copyIcon();
          }, 1400);
        });
      });
      pre.appendChild(btn);
    });
  }

  function wireContentLinks(article) {
    article.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href) return;
      if (/^https?:\/\//i.test(href)) {
        a.target = "_blank";
        a.rel = "noopener";
        return;
      }
      if (href.startsWith("#")) return; // same-page anchor
      const url = new URL(href, location.origin);
      if (url.origin !== location.origin) return;
      const slug = pathToSlug(url.pathname);
      if (routes.has(slug)) {
        e.preventDefault();
        navigate(slug, true, url.hash);
      }
    });
  }

  /* --- table of contents (right rail) ----------------------------------- */
  let tocLinks = [];
  let tocHeadings = [];
  function buildTOC(article) {
    const toc = $("#toc");
    const list = $("#tocList");
    list.innerHTML = "";
    tocLinks = [];
    tocHeadings = [];
    const heads = article.querySelectorAll("h2, h3");
    if (heads.length < 2) {
      toc.classList.add("is-empty");
      return;
    }
    toc.classList.remove("is-empty");
    heads.forEach((h) => {
      const id = h.id;
      if (!id) return;
      const a = el("a", h.tagName === "H3" ? "lvl-3" : "lvl-2", esc(headingText(h)));
      a.href = "#" + id;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const t = document.getElementById(id);
        if (t) {
          history.replaceState(null, "", "#" + id);
          t.scrollIntoView();
        }
      });
      list.appendChild(a);
      tocLinks.push(a);
      tocHeadings.push(h);
    });
    onScroll();
  }
  function headingText(h) {
    return h.textContent.replace(/#$/, "").trim();
  }

  /* --- scroll: progress bar + toc scroll-spy ---------------------------- */
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  });
  function onScroll() {
    updateProgress();
    if (!tocHeadings.length) return;
    const line = 90;
    let active = 0;
    for (let i = 0; i < tocHeadings.length; i++) {
      if (tocHeadings[i].getBoundingClientRect().top <= line) active = i;
      else break;
    }
    tocLinks.forEach((a, i) => a.classList.toggle("is-active", i === active));
  }
  function updateProgress() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    $("#progress").style.width = pct + "%";
  }

  /* --- prev / next ------------------------------------------------------- */
  function pageNav(slug) {
    const i = order.indexOf(slug);
    const wrap = el("nav", "page-nav");
    const prev = i > 0 ? routes.get(order[i - 1]) : null;
    const next = i >= 0 && i < order.length - 1 ? routes.get(order[i + 1]) : null;
    if (prev) {
      const a = el(
        "a",
        "prev",
        '<span class="pn-label">← Previous</span><span class="pn-title">' + esc(prev.title) + "</span>",
      );
      a.href = slugToPath(prev.slug);
      a.addEventListener("click", (e) => {
        e.preventDefault();
        navigate(prev.slug, true);
      });
      wrap.appendChild(a);
    } else wrap.appendChild(el("span"));
    if (next) {
      const a = el(
        "a",
        "next",
        '<span class="pn-label">Next →</span><span class="pn-title">' + esc(next.title) + "</span>",
      );
      a.href = slugToPath(next.slug);
      a.addEventListener("click", (e) => {
        e.preventDefault();
        navigate(next.slug, true);
      });
      wrap.appendChild(a);
    }
    return wrap;
  }

  /* --- error / 404 ------------------------------------------------------- */
  function renderError(msg) {
    $("#content").innerHTML =
      '<div class="content-inner error-state"><h1>⚠</h1><p>' +
      esc(msg) +
      '</p><a class="btn" href="' + BASE + '">Back to overview</a></div>';
  }

  // Shown when the site is opened as a file:// page, where browsers block
  // fetching local files. Turns the dead-end into copy-paste instructions.
  function renderFileProtocolHelp() {
    var dir = decodeURIComponent(location.pathname).replace(/\/[^/]*$/, "");
    $("#content").innerHTML =
      '<div class="content-inner error-state">' +
      "<h1>Run a local server</h1>" +
      '<p style="max-width:560px;margin:0 auto">Opening the docs as a file won’t work — your browser blocks a local page from reading other local files. Start a tiny web server, then open the address it prints:</p>' +
      '<pre style="text-align:left;max-width:560px;margin:20px auto"><code>cd ' +
      esc(dir) +
      "\npython3 -m http.server 8080</code></pre>" +
      "<p><strong>Then open http://localhost:8080 in your browser</strong> — do not open the file path. This only affects local preview; on knoten.dev it works normally.</p>" +
      "</div>";
  }
  function renderNotFound() {
    setActiveNav(null);
    $("#content").innerHTML =
      '<div class="content-inner error-state"><h1>404</h1><p>That page doesn’t exist.</p>' +
      '<a class="btn" href="' + BASE + '">Back to overview</a></div>';
    const a = $("#content .btn");
    a.addEventListener("click", (e) => {
      e.preventDefault();
      navigate("index", true);
    });
    document.title = "Not found · Knoten Docs";
  }

  /* --- theme ------------------------------------------------------------- */
  function initTheme() {
    const saved = localStorage.getItem("knoten-docs-theme");
    const theme = saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  }
  function toggleTheme() {
    const cur = document.documentElement.getAttribute("data-theme");
    const next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("knoten-docs-theme", next);
  }

  /* --- chrome wiring ----------------------------------------------------- */
  function wireChrome() {
    // Point the brand/logo at the docs home (base-aware, not a bare "/").
    const brand = document.querySelector(".brand");
    if (brand) {
      brand.setAttribute("href", slugToPath("index"));
      brand.addEventListener("click", (e) => {
        if (e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        navigate("index", true);
      });
    }
    $("#themeToggle").addEventListener("click", toggleTheme);
    $("#menuBtn").addEventListener("click", toggleSidebar);
    $("#scrim").addEventListener("click", closeSidebar);
    $("#searchTrigger").addEventListener("click", openSearch);
    $("#searchClose") && $("#searchClose").addEventListener("click", closeSearch);
    $("#searchInput").addEventListener("input", (e) => runSearch(e.target.value));
    $("#searchInput").addEventListener("keydown", onSearchKey);
    $("#searchOverlay").addEventListener("mousedown", (e) => {
      if (e.target.id === "searchOverlay") closeSearch();
    });
    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
      } else if (e.key === "/" && !isTyping(e) && !isSearchOpen()) {
        e.preventDefault();
        openSearch();
      } else if (e.key === "Escape") {
        closeSearch();
        closeSidebar();
      }
    });
  }
  function isTyping(e) {
    const t = e.target.tagName;
    return t === "INPUT" || t === "TEXTAREA" || e.target.isContentEditable;
  }

  /* --- mobile sidebar ---------------------------------------------------- */
  function toggleSidebar() {
    $("#sidebar").classList.toggle("open");
    $("#scrim").classList.toggle("open");
  }
  function closeSidebar() {
    $("#sidebar").classList.remove("open");
    $("#scrim").classList.remove("open");
  }

  /* --- search ------------------------------------------------------------ */
  function isSearchOpen() {
    return $("#searchOverlay").classList.contains("open");
  }
  async function openSearch() {
    $("#searchOverlay").classList.add("open");
    const input = $("#searchInput");
    input.value = "";
    input.focus();
    renderSearchResults([]);
    if (!searchIndex) await buildSearchIndex();
  }
  function closeSearch() {
    $("#searchOverlay").classList.remove("open");
  }

  async function buildSearchIndex() {
    const list = $("#searchResults");
    list.innerHTML = '<div class="search-empty">Indexing…</div>';
    const pages = [];
    for (const [slug, p] of routes) {
      pages.push(p);
    }
    const built = await Promise.all(
      pages.map(async (p) => {
        let text = "",
          headings = [];
        try {
          const md = stripFrontmatter(await fetchText(BASE + p.file));
          headings = (md.match(/^#{1,4}\s+.+$/gm) || []).map((h) =>
            h.replace(/^#{1,4}\s+/, "").replace(/<[^>]+>/g, "").trim(),
          );
          text = toPlainText(md);
        } catch (e) {}
        return {
          slug: p.slug,
          title: p.title,
          section: p.section || "",
          description: p.description || "",
          headings,
          text,
        };
      }),
    );
    searchIndex = built;
    const q = $("#searchInput").value;
    if (q.trim()) runSearch(q);
    else renderSearchResults([]);
  }

  function toPlainText(md) {
    return md
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`[^`]*`/g, " ")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/<[^>]+>/g, " ")
      .replace(/[#>*_~|]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function runSearch(query) {
    const q = query.trim().toLowerCase();
    if (!q) return renderSearchResults([]);
    if (!searchIndex) {
      renderSearchResults(
        manifestQuickResults(q),
      );
      return;
    }
    const tokens = q.split(/\s+/).filter(Boolean);
    renderSearchResults(rankAndSort(tokens).slice(0, 12));
  }

  // Score every indexed page against the query tokens, best first.
  function rankAndSort(tokens) {
    const out = [];
    for (const page of searchIndex) {
      const title = page.title.toLowerCase();
      const section = page.section.toLowerCase();
      const desc = page.description.toLowerCase();
      const text = page.text.toLowerCase();
      let score = 0;
      let hitHeading = "";
      for (const t of tokens) {
        if (title.includes(t)) score += title.startsWith(t) ? 12 : 8;
        if (section.includes(t)) score += 2;
        if (desc.includes(t)) score += 4;
        const hi = page.headings.find((h) => h.toLowerCase().includes(t));
        if (hi) {
          score += 6;
          hitHeading = hitHeading || hi;
        }
        score += Math.min(text.split(t).length - 1, 5);
      }
      if (score > 0)
        out.push({
          score,
          slug: page.slug,
          title: page.title,
          section: page.section,
          snippet: snippet(
            hitHeading ? hitHeading + " — " + page.text : page.description || page.text,
            tokens,
          ),
        });
    }
    out.sort((a, b) => b.score - a.score);
    return out;
  }

  function manifestQuickResults(q) {
    const out = [];
    for (const [slug, p] of routes) {
      if (
        p.title.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.section || "").toLowerCase().includes(q)
      )
        out.push({
          slug: p.slug,
          title: p.title,
          section: p.section || "",
          snippet: esc(p.description || ""),
        });
    }
    return out.slice(0, 12);
  }

  function snippet(text, tokens) {
    if (!text) return "";
    const lower = text.toLowerCase();
    let idx = -1;
    for (const t of tokens) {
      const i = lower.indexOf(t);
      if (i !== -1 && (idx === -1 || i < idx)) idx = i;
    }
    let start = idx > 60 ? idx - 50 : 0;
    let frag = text.slice(start, start + 140);
    if (start > 0) frag = "…" + frag;
    frag = esc(frag);
    for (const t of tokens) {
      frag = frag.replace(
        new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"),
        "<mark>$1</mark>",
      );
    }
    return frag;
  }

  function renderSearchResults(results) {
    searchResults = results;
    searchActive = results.length ? 0 : -1;
    const list = $("#searchResults");
    if (!results.length) {
      const q = $("#searchInput").value.trim();
      list.innerHTML =
        '<div class="search-empty">' +
        (q ? "No results for “" + esc(q) + "”." : "Type to search the documentation.") +
        "</div>";
      return;
    }
    list.innerHTML = "";
    results.forEach((r, i) => {
      const a = el("a", "search-result" + (i === 0 ? " is-active" : ""));
      a.href = slugToPath(r.slug);
      a.innerHTML =
        '<div class="sr-crumb">' +
        (r.section ? esc(r.section) : "Overview") +
        '</div><div class="sr-title">' +
        esc(r.title) +
        "</div>" +
        (r.snippet ? '<div class="sr-snippet">' + r.snippet + "</div>" : "");
      a.addEventListener("click", (e) => {
        e.preventDefault();
        pickResult(i);
      });
      a.addEventListener("mousemove", () => setActiveResult(i));
      list.appendChild(a);
    });
  }
  function setActiveResult(i) {
    searchActive = i;
    document
      .querySelectorAll(".search-result")
      .forEach((n, j) => n.classList.toggle("is-active", j === i));
  }
  function pickResult(i) {
    const r = searchResults[i];
    if (!r) return;
    closeSearch();
    navigate(r.slug, true);
  }
  function onSearchKey(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveResult(Math.min(searchActive + 1, searchResults.length - 1));
      scrollActiveIntoView();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveResult(Math.max(searchActive - 1, 0));
      scrollActiveIntoView();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (searchActive >= 0) pickResult(searchActive);
    }
  }
  function scrollActiveIntoView() {
    const n = document.querySelectorAll(".search-result")[searchActive];
    if (n) n.scrollIntoView({ block: "nearest" });
  }

  /* --- helpers ----------------------------------------------------------- */
  function slugify(s) {
    return s
      .toLowerCase()
      .replace(/#$/, "")
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }
  function setMeta(desc) {
    let m = document.querySelector('meta[name="description"]');
    if (!m) {
      m = document.createElement("meta");
      m.name = "description";
      document.head.appendChild(m);
    }
    m.content = desc;
  }
  function copyIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  }
  function checkIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  }
})();
