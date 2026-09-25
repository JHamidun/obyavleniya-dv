// Run: node test.js
// Checks search and filters from search.js on the demo data. Exit code 1 if anything fails.
const { filterListings } = require('./search.js');
const LISTINGS = require('./data.js');

let passed = 0;
let failed = 0;

function check(name, fn) {
  let ok = false;
  let note = '';
  try {
    ok = fn() === true;
  } catch (err) {
    note = ' - ' + err.message;
  }
  console.log((ok ? 'PASS  ' : 'FAIL  ') + name + note);
  if (ok) passed++; else failed++;
}

const all = (items, pred) => items.length > 0 && items.every(pred);

check('без фильтров видны все 60 объявлений', () =>
  filterListings(LISTINGS, {}).length === 60);

check('поиск не зависит от регистра и пробелов: "  ШИНЫ "', () => {
  const a = filterListings(LISTINGS, { query: '  ШИНЫ ' });
  const b = filterListings(LISTINGS, { query: 'шины' });
  return a.length === 3 && a.length === b.length;
});

check('поиск по названию: "айфон" находит только айфоны', () =>
  all(filterListings(LISTINGS, { query: 'айфон' }), (x) => x.title.startsWith('Айфон')));

check('поиск по городу в строке: "находка" находит объявления из Находки', () =>
  all(filterListings(LISTINGS, { query: 'находка' }), (x) => x.city === 'Находка'));

check('фильтр по категории: только "Электроника", все 15', () => {
  const r = filterListings(LISTINGS, { category: 'Электроника' });
  return r.length === 15 && all(r, (x) => x.category === 'Электроника');
});

check('фильтр по городу: только Хабаровск', () =>
  all(filterListings(LISTINGS, { city: 'Хабаровск' }), (x) => x.city === 'Хабаровск'));

check('цена от 1000 до 5000 включительно', () =>
  all(filterListings(LISTINGS, { priceFrom: '1000', priceTo: '5000' }), (x) => x.price >= 1000 && x.price <= 5000));

check('поиск + категория + город вместе', () =>
  all(filterListings(LISTINGS, { query: 'шины', category: 'Автозапчасти', city: 'Владивосток' }),
    (x) => x.city === 'Владивосток' && /шины/i.test(x.title)));

check('бессмыслица "qwerty": пустой результат без ошибки', () =>
  filterListings(LISTINGS, { query: 'qwerty' }).length === 0);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
