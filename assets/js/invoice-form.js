// Gestion dynamique des items dans le formulaire de devis

let itemIndex = 0;

function addItem(itemData = null) {
    const container = document.getElementById('items-container');
    const index = itemIndex++;
    
    const itemHtml = `
        <div class="item-row bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6">
            <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div class="xl:col-span-3">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Nom du service</label>
                    <input type="text" name="items[${index}][name]" value="${itemData?.name || ''}" required
                           class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 item-name">
                </div>
                <div class="xl:col-span-3">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea name="items[${index}][description]" rows="2"
                              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 resize-none">${itemData?.description || ''}</textarea>
                </div>
                <div class="xl:col-span-1">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Quantité</label>
                    <input type="number" name="items[${index}][quantity]" value="${itemData?.quantity || 1}" min="1" required
                           class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-center item-quantity"
                           onchange="calculateItemTotal(this)">
                </div>
                <div class="xl:col-span-2">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Prix unitaire HT</label>
                    <input type="number" name="items[${index}][price]" value="${itemData?.price || 0}" min="0" step="0.01" required
                           class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 item-price"
                           onchange="calculateItemTotal(this)">
                </div>
                <div class="xl:col-span-1">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Remise (%)</label>
                    <input type="number" name="items[${index}][discount]" value="${itemData?.discount || 0}" min="0" max="100" step="0.1"
                           class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-center item-discount"
                           onchange="calculateItemTotal(this)">
                </div>
                <div class="xl:col-span-1">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Total HT</label>
                    <div class="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-bold text-center item-total">
                        0.00
                    </div>
                </div>
                <div class="xl:col-span-1">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Actions</label>
                    <div class="flex flex-col gap-3">
                        <label class="flex items-center gap-2 text-sm bg-green-50 p-2 rounded-xl">
                            <input type="checkbox" name="items[${index}][is_included]" value="1" class="item-included">
                            <span class="text-green-700 font-medium">Inclus</span>
                        </label>
                        <button type="button" onclick="removeItem(this)" class="text-red-600 hover:text-red-800 p-2 rounded-xl hover:bg-red-50">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', itemHtml);
    
    // Calculer le total initial
    const row = container.lastElementChild;
    calculateItemTotal(row.querySelector('.item-quantity'));
}

function removeItem(button) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
        button.closest('.item-row').remove();
    }
}

function calculateItemTotal(input) {
    const row = input.closest('.item-row');
    const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
    const price = parseFloat(row.querySelector('.item-price').value) || 0;
    const discount = parseFloat(row.querySelector('.item-discount').value) || 0;
    const isIncluded = row.querySelector('.item-included').checked;
    
    if (isIncluded) {
        row.querySelector('.item-total').textContent = 'Inclus';
        row.querySelector('.item-total').classList.add('text-green-600');
    } else {
        const discountedPrice = price * (1 - discount / 100);
        const total = discountedPrice * quantity;
        row.querySelector('.item-total').textContent = total.toFixed(2).replace('.', ',');
        row.querySelector('.item-total').classList.remove('text-green-600');
    }
}

function loadServices() {
    // Charger les services depuis l'API
    fetch('api/services.php?action=list')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.services) {
                // Afficher une modal pour sélectionner les services
                showServiceModal(data.services);
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            alert('Erreur lors du chargement des services');
        });
}

function showServiceModal(services) {
    // Créer une modal simple pour sélectionner les services
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div class="p-6 border-b">
                <h2 class="text-2xl font-bold">Sélectionner des services</h2>
            </div>
            <div class="p-6 overflow-y-auto max-h-[60vh]">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${services.map(service => `
                        <div class="border rounded-xl p-4 cursor-pointer hover:bg-gray-50 service-item" 
                             onclick="selectService(${JSON.stringify(service).replace(/"/g, '&quot;')})">
                            <h3 class="font-bold">${service.name}</h3>
                            <p class="text-sm text-gray-600">${service.description}</p>
                            <p class="text-lg font-bold text-green-600 mt-2">${service.price.toFixed(2)} €</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="p-6 border-t flex justify-end">
                <button onclick="closeServiceModal()" class="px-4 py-2 bg-gray-200 rounded-lg">Fermer</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    window.currentModal = modal;
}

function selectService(service) {
    addItem({
        name: service.name,
        description: service.description,
        price: service.price,
        quantity: 1,
        discount: 0
    });
    closeServiceModal();
}

function closeServiceModal() {
    if (window.currentModal) {
        window.currentModal.remove();
        window.currentModal = null;
    }
}

// Initialiser avec un item vide si le conteneur est vide
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('items-container');
    if (container && container.children.length === 0) {
        addItem();
    }
    
    // Initialiser les totaux pour les items existants
    container.querySelectorAll('.item-row').forEach(row => {
        const quantityInput = row.querySelector('.item-quantity');
        if (quantityInput) {
            calculateItemTotal(quantityInput);
        }
    });
});
