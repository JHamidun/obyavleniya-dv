// Renders the listing feed and wires the search box and filters.
(function () {
  'use strict';

  const { filterListings } = window.Search;

  const els = {
    query: document.getElementById('query'),
    category: document.getElementById('category'),
    city: document.getElementById('city'),
    priceFrom: document.getElementById('price-from'),
    priceTo: document.getElementById('price-to'),
    count: document.getElementById('count'),
    list: document.getElementById('list'),
  };

  const priceFormat = new Intl.NumberFormat('ru-RU');
  const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });

  function plural(n, one, few, many) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[ch]);
  }

  function formatPrice(item) {
    const value = priceFormat.format(item.price) + ' ₽';
    return item.category === 'Работа' ? 'от ' + value : value;
  }

  function cardHtml(item) {
    return `
      <article class="card">
        <div class="card__photo" style="--hue: ${item.hue}"><span>${escapeHtml(item.category)}</span></div>
        <div class="card__body">
          <div class="card__price">${formatPrice(item)}</div>
          <h3 class="card__title">${escapeHtml(item.title)}</h3>
          <div class="card__meta">${escapeHtml(item.city)} · ${dateFormat.format(new Date(item.date))}</div>
        </div>
      </article>`;
  }

  function emptyStateHtml() {
    return `
      <div class="empty">
        <div class="empty__title">Ничего не найдено</div>
        <p class="empty__hint">Попробуйте изменить запрос, выбрать другую категорию или город, либо расширить диапазон цены.</p>
        <button type="button" id="reset" class="empty__reset">Сбросить фильтры</button>
      </div>`;
  }

  function resetFilters() {
    els.query.value = '';
    els.category.value = '';
    els.city.value = '';
    els.priceFrom.value = '';
    els.priceTo.value = '';
    render();
  }

  function currentFilters() {
    return {
      query: els.query.value,
      category: els.category.value,
      city: els.city.value,
      priceFrom: els.priceFrom.value,
      priceTo: els.priceTo.value,
    };
  }

  function render() {
    const items = filterListings(window.LISTINGS, currentFilters());
    els.count.textContent = `Найдено ${items.length} ${plural(items.length, 'объявление', 'объявления', 'объявлений')}`;
    els.list.innerHTML = items.length ? items.map(cardHtml).join('') : emptyStateHtml();
  }

  document.querySelectorAll('.header input, .filters input, .filters select').forEach((el) => {
    el.addEventListener('input', render);
  });
  els.list.addEventListener('click', (event) => {
    if (event.target.id === 'reset') resetFilters();
  });
  render();
})();
