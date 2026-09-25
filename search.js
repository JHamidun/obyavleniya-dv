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

  // Every word of the query must occur in the title or the city.
  function matchesQuery(item, query) {
    if (!query) return true;
    const haystack = normalize(item.title + ' ' + item.city);
    return query.split(' ').every((word) => haystack.includes(word));
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
    return listings.filter((item) => {
      if (!matchesQuery(item, query)) return false;
      if (f.category && item.category !== f.category) return false;
      if (f.city && item.city !== f.city) return false;
      if (priceFrom !== null && item.price < priceFrom) return false;
      if (priceTo !== null && item.price > priceTo) return false;
      return true;
    });
  }

  return { normalize, matchesQuery, toNumber, filterListings };
});
