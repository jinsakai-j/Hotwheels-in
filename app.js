const IG_URL = 'https://ig.me/m/rajaazhrl';

const grid = document.getElementById('product-grid');
const newGrid = document.getElementById('new-grid');
const soldGrid = document.getElementById('sold-grid');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');
const modal = document.getElementById('modal');
const modalMedia = document.getElementById('modal-media');
const modalBody = document.getElementById('modal-body');

const STATE = { filter: 'all', search: '', sort: 'new' };

// ---------- helpers ----------
function normalizePrice(p) {
  const n = parseInt(String(p || '').replace(/\D/g, ''), 10);
  return isNaN(n) ? 0 : n;
}

function fmtPrice(p) { return p ? `Rp ${p.toLocaleString('id-ID')}` : 'harga menyusul'; }

function sortItems(list) {
  const arr = [...list];
  if (STATE.sort === 'price-asc') {
    arr.sort((a, b) => {
      const pa = normalizePrice(a.price), pb = normalizePrice(b.price);
      return (pa || Infinity) - (pb || Infinity);
    });
  } else if (STATE.sort === 'price-desc') {
    arr.sort((a, b) => {
      const pa = normalizePrice(a.price), pb = normalizePrice(b.price);
      return (pb || 0) - (pa || 0);
    });
  }
  return arr;
}

function applySearch(list) {
  const q = STATE.search.trim().toLowerCase();
  if (!q) return list;
  return list.filter(i => (i.name + ' ' + (i.series || '')).toLowerCase().includes(q));
}

function cardHtml(item) {
  const media = item.image
    ? `<div class="aspect-square bg-stone-100 overflow-hidden dark:bg-stone-800">
         <img src="${item.image}" alt="${item.name}" loading="lazy" class="zoom w-full h-full object-cover">
       </div>`
    : `<div class="aspect-square bg-stone-200 flex items-center justify-center dark:bg-stone-800">
         <span class="text-xs text-stone-400">no photo</span>
       </div>`;

  const price = item.status === 'available'
    ? (item.price ? `Rp ${normalizePrice(item.price).toLocaleString('id-ID')}` : '<span class="text-stone-400">harga menyusul</span>')
    : `<span class="text-xs text-stone-400 line-through dark:text-stone-500">${item.price ? `Rp ${normalizePrice(item.price).toLocaleString('id-ID')}` : 'sold'}</span>`;

  return `
    <div class="card relative bg-white border border-stone-200 rounded-xl overflow-hidden cursor-pointer dark:bg-stone-900 dark:border-stone-800">
      ${media}
      ${item.status === 'sold'
        ? `<div class="absolute inset-0 bg-stone-200/60 grid place-items-center dark:bg-stone-900/60">
             <span class="text-[10px] font-bold uppercase tracking-widest text-stone-500 border border-stone-400 px-2 py-1 rounded-full bg-white/80 dark:text-stone-300 dark:border-stone-600 dark:bg-stone-800/80">Sold</span>
           </div>`
        : ''}
      ${item.status === 'available'
        ? `<a href="${IG_URL}" target="_blank" onclick="event.stopPropagation()"
             class="ask-btn absolute bottom-2 right-2 bg-white/90 backdrop-blur text-stone-900 text-[11px] font-semibold px-3 py-1.5 rounded-lg shadow hover:bg-white">
             Tanya
           </a>`
        : ''}
      <div class="p-3">
        <h3 class="font-semibold text-sm truncate">${item.name}</h3>
        <p class="text-xs text-stone-400 mt-0.5 truncate dark:text-stone-500">${item.series || '—'}</p>
        <div class="mt-2 flex items-center justify-between">
          <span class="text-sm font-bold">${price}</span>
        </div>
      </div>
      ${item.new ? '<span class="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide text-white bg-stone-900 px-2 py-1 rounded-full dark:bg-white dark:text-stone-900">Baru</span>' : ''}
    </div>
  `;
}

function makeCard(item) {
  const el = document.createElement('div');
  el.innerHTML = cardHtml(item).trim();
  const card = el.firstElementChild;
  card.addEventListener('click', () => openModal(item));
  return card;
}

// ---------- skeleton ----------
function showSkeleton(container, count) {
  container.innerHTML = Array.from({ length: count }, () => `
    <div class="bg-white border border-stone-200 rounded-xl overflow-hidden dark:bg-stone-900 dark:border-stone-800">
      <div class="skeleton aspect-square"></div>
      <div class="p-3 space-y-2">
        <div class="skeleton h-3 w-2/3 rounded"></div>
        <div class="skeleton h-3 w-1/3 rounded"></div>
      </div>
    </div>`).join('');
}

// ---------- render ----------
function renderNew() {
  const available = items.filter(i => i.status === 'available');
  const newest = sortItems(available).slice(0, 4);
  newGrid.innerHTML = '';
  newest.forEach(i => newGrid.appendChild(makeCard(i)));
}

function renderSold() {
  const sold = items.filter(i => i.status === 'sold');
  soldGrid.innerHTML = '';
  sold.forEach(i => soldGrid.appendChild(makeCard(i)));
}

function renderGrid() {
  let list = items.filter(i => STATE.filter === 'all' || i.status === STATE.filter);
  list = applySearch(sortItems(list));

  grid.innerHTML = '';
  if (list.length === 0) {
    emptyState.classList.remove('hidden');
    grid.classList.add('hidden');
    return;
  }
  emptyState.classList.add('hidden');
  grid.classList.remove('hidden');
  list.forEach(i => grid.appendChild(makeCard(i)));
}

function renderAll() {
  renderNew();
  renderSold();
  renderGrid();
}

// ---------- modal ----------
function openModal(item) {
  modalMedia.innerHTML = item.image
    ? `<img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">`
    : '<div class="w-full h-full grid place-items-center text-stone-400 text-sm">no photo</div>';

  const price = item.status === 'available'
    ? `<span class="text-2xl font-extrabold text-stone-900 dark:text-white">${fmtPrice(normalizePrice(item.price))}</span>`
    : `<span class="text-xl font-bold text-stone-400 line-through">sold · ${fmtPrice(normalizePrice(item.price))}</span>`;

  const statusPill = item.status === 'sold'
    ? '<span class="text-[10px] font-bold uppercase tracking-widest text-stone-400 border border-stone-300 px-2 py-1 rounded-full dark:border-stone-600">Sold Out</span>'
    : '<span class="text-[10px] font-bold uppercase tracking-widest text-green-600 border border-green-300 px-2 py-1 rounded-full dark:text-green-400 dark:border-green-700">Available</span>';

  modalBody.innerHTML = `
    <div>
      <p class="text-xs font-semibold tracking-widest text-stone-400 dark:text-stone-500">${(item.series || 'HOT WHEELS').toUpperCase()}</p>
      <h3 class="text-2xl font-extrabold mt-1 leading-tight">${item.name}</h3>
      <div class="mt-2">${statusPill}</div>
      <div class="mt-4">${price}</div>

      <div class="mt-6 space-y-2.5 text-sm">
        <div class="flex justify-between border-b border-stone-100 pb-2 dark:border-stone-800">
          <span class="text-stone-400">Kondisi</span>
          <span class="font-semibold">${item.condition || 'Mint'}</span>
        </div>
        <div class="flex justify-between border-b border-stone-100 pb-2 dark:border-stone-800">
          <span class="text-stone-400">Tahun</span>
          <span class="font-semibold">${item.year || '—'}</span>
        </div>
        <div class="flex justify-between border-b border-stone-100 pb-2 dark:border-stone-800">
          <span class="text-stone-400">Stok</span>
          <span class="font-semibold">${item.stock != null ? item.stock : '1'}</span>
        </div>
      </div>
    </div>
    <div class="flex flex-col justify-end gap-3">
      ${item.status === 'available'
        ? `<a href="${IG_URL}" target="_blank"
             class="bg-stone-900 text-white text-sm font-bold py-3 rounded-lg text-center hover:bg-stone-700 transition dark:bg-white dark:text-stone-900">
             Tanya di Instagram
           </a>
           <button onclick="navigator.clipboard.writeText('Halo, apakah ${item.name} masih ada? ${item.price ? 'Harga: ' + item.price + ' — ' : ''}Boleh tanya-tanya dulu 🙏')"
             class="border border-stone-300 text-sm font-semibold py-3 rounded-lg hover:bg-stone-50 transition dark:border-stone-700 dark:hover:bg-stone-800">
             Salin pesan tanya
           </button>`
        : '<p class="text-sm text-stone-400 text-center">Sudah laku. Nanti ada lagi!</p>'}
    </div>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function closeModal(event) {
  if (event && event.target !== modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = '';
}

// ---------- controls ----------
function filterItems(filter) {
  STATE.filter = filter;
  renderGrid();
  document.querySelectorAll('.filter-btn').forEach(btn => {
    const active = btn.dataset.filter === filter;
    btn.className = `filter-btn px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
      active
        ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900'
        : 'bg-stone-200 text-stone-600 hover:bg-stone-300 dark:bg-stone-800 dark:text-stone-300'
    }`;
  });
}

searchInput.addEventListener('input', e => {
  STATE.search = e.target.value;
  renderGrid();
});

sortSelect.addEventListener('change', e => {
  STATE.sort = e.target.value;
  renderNew();
  renderGrid();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ---------- dark mode ----------
const darkToggle = document.getElementById('dark-toggle');
function applyTheme(dark) {
  document.documentElement.classList.toggle('dark', dark);
  document.getElementById('icon-sun').classList.toggle('hidden', !dark);
  document.getElementById('icon-moon').classList.toggle('hidden', dark);
}
darkToggle.addEventListener('click', () => {
  const dark = !document.documentElement.classList.contains('dark');
  applyTheme(dark);
  localStorage.setItem('theme', dark ? 'dark' : 'light');
});
applyTheme(localStorage.getItem('theme') === 'dark');

// ---------- init ----------
showSkeleton(grid, 10);
showSkeleton(newGrid, 4);
showSkeleton(soldGrid, 2);
setTimeout(() => {
  renderAll();
  filterItems('all');
}, 600);