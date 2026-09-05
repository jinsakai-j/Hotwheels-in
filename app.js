const grid = document.getElementById('product-grid');
const emptyState = document.getElementById('empty-state');
const totalItems = document.getElementById('total-items');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const modalInfo = document.getElementById('modal-info');

function render(filter = 'all') {
  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);

  if (items.length > 0 && totalItems) {
    totalItems.textContent = items.filter(i => i.status === 'available').length;
  }

  grid.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
    grid.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  grid.classList.remove('hidden');

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card bg-white border border-stone-200 rounded-lg overflow-hidden cursor-pointer';

    const placeholderColor = ['bg-stone-200', 'bg-stone-300', 'bg-stone-100'][item.name.length % 3];

    card.innerHTML = `
      ${item.image
        ? `<div class="aspect-square bg-stone-100 overflow-hidden">
             <img src="${item.image}" alt="${item.name}" loading="lazy" class="w-full h-full object-cover">
           </div>`
        : `<div class="aspect-square ${placeholderColor} flex items-center justify-center">
             <span class="text-sm text-stone-400">no photo</span>
           </div>`}
      <div class="p-3">
        <h3 class="font-medium text-sm truncate">${item.name}</h3>
        <p class="text-xs text-stone-400 mt-0.5 truncate">${item.series || ''}</p>
        <div class="mt-2 flex items-center justify-between">
          ${item.status === 'available'
            ? `<span class="text-sm font-semibold">${item.price || ''}</span>`
            : `<span class="text-xs text-stone-400 line-through">${item.price || ''}</span>`}
          ${item.status === 'sold'
            ? '<span class="text-[10px] uppercase tracking-wide text-stone-400 border border-stone-200 px-1.5 py-0.5 rounded-full">sold</span>'
            : ''}
        </div>
      </div>
    `;

    card.addEventListener('click', () => openModal(item, card));
    grid.appendChild(card);
  });
}

function openModal(item, card) {
  const img = card.querySelector('img');
  if (!img) return;

  modalImg.src = img.src;
  modalImg.alt = item.name;
  modalInfo.textContent = `${item.name} - ${item.price || 'belum ada harga'} (${item.status === 'sold' ? 'sold' : 'available'})`;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeModal(event) {
  if (event && event.target !== modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function filterItems(filter) {
  render(filter);
  document.querySelectorAll('.filter-btn').forEach(btn => {
    const active = btn.dataset.filter === filter;
    btn.className = `filter-btn px-3 py-1.5 rounded-md text-xs font-medium transition ${
      active ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500 hover:text-stone-900'
    }`;
  });
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

render('all');