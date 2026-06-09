(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var nav = document.querySelector(".nav-links");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var isOpen = nav.classList.toggle("is-open");
        document.body.classList.toggle("menu-open", isOpen);
        toggle.setAttribute("aria-expanded", String(isOpen));
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));

    if (slides.length > 1) {
      var current = 0;

      function showSlide(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
        });
      });

      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var filterInput = document.querySelector(".js-live-filter");
    var typeFilter = document.querySelector(".js-type-filter");
    var yearFilter = document.querySelector(".js-year-filter");
    var filterCards = Array.prototype.slice.call(document.querySelectorAll(".js-filter-card"));

    function applyCardFilter() {
      var keyword = normalize(filterInput && filterInput.value);
      var typeValue = normalize(typeFilter && typeFilter.value);
      var yearValue = normalize(yearFilter && yearFilter.value);

      filterCards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre")
        ].join(" "));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesType = !typeValue || cardType === typeValue;
        var matchesYear = !yearValue || cardYear === yearValue;
        card.classList.toggle("hidden-card", !(matchesKeyword && matchesType && matchesYear));
      });
    }

    [filterInput, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyCardFilter);
        control.addEventListener("change", applyCardFilter);
      }
    });

    var globalSearch = document.getElementById("global-search");
    var searchResults = document.getElementById("search-results");

    function renderSearchResults(query) {
      if (!searchResults || !window.SITE_SEARCH_INDEX) {
        return;
      }

      var keyword = normalize(query);
      if (!keyword) {
        searchResults.innerHTML = "";
        return;
      }

      var matches = window.SITE_SEARCH_INDEX.filter(function (item) {
        return normalize([
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.tags,
          item.oneLine
        ].join(" ")).indexOf(keyword) !== -1;
      }).slice(0, 24);

      if (!matches.length) {
        searchResults.innerHTML = '<div class="empty-state">暂无匹配影片</div>';
        return;
      }

      searchResults.innerHTML = matches.map(function (item) {
        return [
          '<a class="search-result" href="' + item.url + '">',
          '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '">',
          '<span>',
          '<h3>' + escapeHtml(item.title) + '</h3>',
          '<p>' + escapeHtml(item.oneLine) + '</p>',
          '<span class="card-meta">' + escapeHtml(item.year + ' · ' + item.type) + '</span>',
          '</span>',
          '</a>'
        ].join("");
      }).join("");
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    if (globalSearch) {
      globalSearch.addEventListener("input", function () {
        renderSearchResults(globalSearch.value);
      });
    }
  });
})();
