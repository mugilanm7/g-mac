/* ==========================================================================
   Pict-o-view — progressive enhancement only.
   Every page works with this file blocked: the search field is created here
   rather than sitting dead in the markup, and nothing else hides content.
   ========================================================================== */
(function () {
  "use strict";

  var doc = document;

  /* --- Filter the questions / features on this page ---------------------- */

  function initSearch() {
    var slot = doc.querySelector("[data-search]");
    if (!slot) return;

    var scope = doc.querySelector("[data-searchable]") || doc.body;
    var items = [].slice.call(scope.querySelectorAll(".faq-item, .feature, .krow"));
    if (!items.length) return;

    var sections = [].slice.call(scope.querySelectorAll(".section"));
    var pills = doc.querySelector(".pills");

    slot.className = "search";
    slot.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" aria-hidden="true">' +
      '<circle cx="11" cy="11" r="7"></circle><path d="M20 20l-4.2-4.2"></path></svg>' +
      '<label class="visually-hidden" for="site-search">' +
      (slot.getAttribute("data-search") || "Search this page") +
      "</label>" +
      '<input id="site-search" type="search" autocomplete="off" spellcheck="false" placeholder="' +
      (slot.getAttribute("data-search") || "Search this page") +
      '">';

    var empty = doc.createElement("p");
    empty.className = "search-empty";
    empty.hidden = true;
    empty.textContent = "";
    slot.parentNode.insertBefore(empty, slot.nextSibling);

    // Cache the searchable text once — re-reading textContent on every
    // keystroke is what makes naive filters feel sticky on long pages.
    var haystacks = items.map(function (el) {
      return (el.textContent || "").toLowerCase();
    });

    var input = slot.querySelector("input");

    function apply() {
      var q = input.value.trim().toLowerCase();
      var hits = 0;

      items.forEach(function (el, i) {
        var show = !q || haystacks[i].indexOf(q) !== -1;
        el.hidden = !show;
        if (show) hits++;
      });

      // A heading with nothing left under it is just noise.
      sections.forEach(function (sec) {
        if (!q) {
          sec.hidden = false;
          return;
        }
        sec.hidden = !sec.querySelector(
          ".faq-item:not([hidden]), .feature:not([hidden]), .krow:not([hidden])"
        );
      });

      if (pills) pills.hidden = !!q;

      if (q && !hits) {
        empty.hidden = false;
        empty.textContent = 'Nothing on this page matches “' + input.value.trim() + '”.';
      } else {
        empty.hidden = true;
      }
    }

    input.addEventListener("input", apply);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && input.value) {
        input.value = "";
        apply();
      }
    });
  }

  /* --- Highlight the section pill you are currently reading -------------- */

  function initPills() {
    var pills = doc.querySelector(".pills");
    if (!pills || !("IntersectionObserver" in window)) return;

    var links = {};
    [].forEach.call(pills.querySelectorAll('a[href^="#"]'), function (a) {
      links[a.getAttribute("href").slice(1)] = a;
    });

    var targets = Object.keys(links)
      .map(function (id) {
        return doc.getElementById(id);
      })
      .filter(Boolean);
    if (!targets.length) return;

    var visible = {};

    function paint() {
      var current = null;
      targets.forEach(function (t) {
        if (visible[t.id] && !current) current = t.id;
      });
      Object.keys(links).forEach(function (id) {
        links[id].classList.toggle("is-active", id === current);
      });
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          visible[entry.target.id] = entry.isIntersecting;
        });
        paint();
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: 0 }
    );

    targets.forEach(function (t) {
      io.observe(t);
    });
  }

  /* --- Back to top ------------------------------------------------------- */

  function initToTop() {
    if (doc.body.hasAttribute("data-no-totop")) return;

    var btn = doc.createElement("button");
    btn.type = "button";
    btn.className = "to-top";
    btn.setAttribute("aria-label", "Back to top");
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M12 19V5"></path><path d="M5 12l7-7 7 7"></path></svg>';
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    doc.body.appendChild(btn);

    var ticking = false;
    function update() {
      btn.classList.toggle("is-visible", window.pageYOffset > 600);
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(update);
      },
      { passive: true }
    );
    update();
  }

  function ready(fn) {
    if (doc.readyState !== "loading") fn();
    else doc.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    initSearch();
    initPills();
    initToTop();
  });
})();
