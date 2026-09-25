// Search and filter logic for the listing feed.
// Works in the browser (window.Search) and in node (require('./search.js')).
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Search = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Lower case, ё -> е, collapse spaces: "  ШИНЫ  Ёж " -> "шины еж"
  function normalize(text) {
    return String(text == null ? '' : text)
      .toLowerCase()
      .replace(/ё/g, 'е')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // perf: normalize every listing once instead of on every keystroke
  const indexCache = new WeakMap();
  function buildIndex(listings) {
    if (!indexCache.has(listings)) {
      indexCache.set(listings, listings.map((item) => ({
        item,
        title: normalize(item.title),
        city: normalize(item.city),
      })));
    }
    return indexCache.get(listings);
  }

  function matchesQuery(entry, query) {
    if (!query) return true;
    return query.split(' ').every((word) => entry.title.includes(word));
  }

  // "" / null / "abc" -> null, "1500" -> 1500
  function toNumber(value) {
    if (value === '' || value == null) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  // filters: { query, category, city, priceFrom, priceTo } - every field is optional
  function filterListings(listings, filters) {
    const f = filters || {};
    const query = normalize(f.query);
    const priceFrom = toNumber(f.priceFrom);
    const priceTo = toNumber(f.priceTo);
    return buildIndex(listings)
      .filter((entry) => {
        if (!matchesQuery(entry, query)) return false;
        if (f.category && entry.item.category !== f.category) return false;
        if (f.city && entry.city !== f.city) return false;
        if (priceFrom !== null && entry.item.price < priceFrom) return false;
        if (priceTo !== null && entry.item.price > priceTo) return false;
        return true;
      })
      .map((entry) => entry.item);
  }

  return { normalize, matchesQuery, toNumber, filterListings };
});
