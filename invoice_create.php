<?php
require_once 'includes/config.php';
require_once 'includes/auth.php';
require_once 'includes/functions.php';

requireLogin();

$pdo = getDBConnection();
$userId = getUserId();
$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $invoiceData = [
        'number' => $_POST['number'] ?? generateInvoiceNumber(),
        'date' => $_POST['date'] ?? date('Y-m-d'),
        'currency' => $_POST['currency'] ?? 'EUR',
        'tax_rate' => floatval($_POST['tax_rate'] ?? 20),
        'global_discount' => floatval($_POST['global_discount'] ?? 0),
        'client_info' => json_encode([
            'name' => $_POST['client_name'] ?? '',
            'email' => $_POST['client_email'] ?? '',
            'address' => $_POST['client_address'] ?? '',
            'city' => $_POST['client_city'] ?? '',
            'postalCode' => $_POST['client_postal_code'] ?? '',
            'country' => $_POST['client_country'] ?? t('france'),
            'phone' => $_POST['client_phone'] ?? ''
        ]),
        'company_info' => json_encode([
            'name' => $_POST['company_name'] ?? '',
            'email' => $_POST['company_email'] ?? '',
            'address' => $_POST['company_address'] ?? '',
            'city' => $_POST['company_city'] ?? '',
            'postalCode' => $_POST['company_postal_code'] ?? '',
            'country' => $_POST['company_country'] ?? t('france'),
            'phone' => $_POST['company_phone'] ?? '',
            'logo' => ''
        ]),
        'notes' => $_POST['notes'] ?? '',
        'additional_info' => $_POST['additional_info'] ?? ''
    ];
    
    // Gérer l'upload du logo
    if (isset($_FILES['company_logo']) && $_FILES['company_logo']['error'] === UPLOAD_ERR_OK) {
        $uploadResult = uploadLogo($_FILES['company_logo']);
        if ($uploadResult['success']) {
            $companyInfo = json_decode($invoiceData['company_info'], true);
            $companyInfo['logo'] = $uploadResult['path'];
            $invoiceData['company_info'] = json_encode($companyInfo);
        }
    }
    
    // Traiter les items
    $items = [];
    if (isset($_POST['items']) && is_array($_POST['items'])) {
        foreach ($_POST['items'] as $index => $item) {
            if (!empty($item['name'])) {
                $quantity = floatval($item['quantity'] ?? 1);
                $price = floatval($item['price'] ?? 0);
                $discount = floatval($item['discount'] ?? 0);
                $total = calculateItemTotal($quantity, $price, $discount);
                
                $items[] = [
                    'name' => $item['name'],
                    'description' => $item['description'] ?? '',
                    'quantity' => $quantity,
                    'price' => $price,
                    'discount' => $discount,
                    'total' => $total,
                    'is_included' => isset($item['is_included']) ? 1 : 0,
                    'order_index' => $index
                ];
            }
        }
    }
    
    // Calculer les totaux
    $totals = calculateInvoiceTotals($items, $invoiceData['tax_rate'], $invoiceData['global_discount']);
    $invoiceData['subtotal'] = $totals['subtotal'];
    $invoiceData['tax'] = $totals['tax'];
    $invoiceData['total'] = $totals['total'];
    
    // Insérer le devis
    try {
        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare("
            INSERT INTO invoices (user_id, number, date, currency, tax_rate, global_discount, subtotal, tax, total, 
                                 client_info, company_info, notes, additional_info, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ");
        $stmt->execute([
            $userId,
            $invoiceData['number'],
            $invoiceData['date'],
            $invoiceData['currency'],
            $invoiceData['tax_rate'],
            $invoiceData['global_discount'],
            $invoiceData['subtotal'],
            $invoiceData['tax'],
            $invoiceData['total'],
            $invoiceData['client_info'],
            $invoiceData['company_info'],
            $invoiceData['notes'],
            $invoiceData['additional_info']
        ]);
        
        $invoiceId = $pdo->lastInsertId();
        
        // Insérer les items
        $stmt = $pdo->prepare("
            INSERT INTO invoice_items (invoice_id, name, description, quantity, price, discount, total, is_included, order_index)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        foreach ($items as $item) {
            $stmt->execute([
                $invoiceId,
                $item['name'],
                $item['description'],
                $item['quantity'],
                $item['price'],
                $item['discount'],
                $item['total'],
                $item['is_included'],
                $item['order_index']
            ]);
        }
        
        $pdo->commit();
        redirectWithMessage('invoice_preview.php?id=' . $invoiceId, t('invoiceCreatedSuccessfully'), 'success');
    } catch (Exception $e) {
        $pdo->rollBack();
        $error = t('errorCreatingInvoice') . ': ' . $e->getMessage();
    }
}

// Valeurs par défaut
$defaultDate = date('Y-m-d');
$defaultNumber = generateInvoiceNumber();
$defaultCompanyInfo = [
    'name' => '',
    'email' => '',
    'address' => '',
    'city' => '',
    'postalCode' => '',
    'country' => t('france'),
    'phone' => '',
    'logo' => ''
];
$defaultClientInfo = [
    'name' => '',
    'email' => '',
    'address' => '',
    'city' => '',
    'postalCode' => '',
    'country' => t('france'),
    'phone' => ''
];

include 'includes/header.php';
?>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-6">
            <a href="index.php" class="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <?php echo e(t('back')); ?>
            </a>
            <h1 class="text-2xl font-bold text-gray-900"><?php echo e(t('newInvoiceTitle')); ?></h1>
        </div>

        <?php if ($error): ?>
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <?php echo e($error); ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="" enctype="multipart/form-data" id="invoice-form" class="space-y-8">
            <!-- Informations générales -->
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-6"><?php echo e(t('generalInformation')); ?></h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('quoteNumber')); ?></label>
                        <input type="text" name="number" value="<?php echo e($defaultNumber); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('date')); ?></label>
                        <input type="date" name="date" value="<?php echo e($defaultDate); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('selectCurrency')); ?></label>
                        <select name="currency" required
                                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="EUR"><?php echo e(t('euro')); ?></option>
                            <option value="CHF"><?php echo e(t('swissFranc')); ?></option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('vat')); ?> (%)</label>
                        <input type="number" name="tax_rate" value="20" min="0" max="100" step="0.1" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                </div>
            </div>

            <!-- Informations entreprise -->
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-6"><?php echo e(t('companyInformation')); ?></h2>
                
                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('companyLogo')); ?></label>
                    <input type="file" name="company_logo" accept="image/*"
                           class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('companyName')); ?></label>
                        <input type="text" name="company_name" value="<?php echo e($defaultCompanyInfo['name']); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('email')); ?></label>
                        <input type="email" name="company_email" value="<?php echo e($defaultCompanyInfo['email']); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('phone')); ?></label>
                        <input type="tel" name="company_phone" value="<?php echo e($defaultCompanyInfo['phone']); ?>"
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('address')); ?></label>
                        <input type="text" name="company_address" value="<?php echo e($defaultCompanyInfo['address']); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('city')); ?></label>
                        <input type="text" name="company_city" value="<?php echo e($defaultCompanyInfo['city']); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('postalCode')); ?></label>
                        <input type="text" name="company_postal_code" value="<?php echo e($defaultCompanyInfo['postalCode']); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('country')); ?></label>
                        <input type="text" name="company_country" value="<?php echo e($defaultCompanyInfo['country']); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                </div>
            </div>

            <!-- Informations client -->
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-6"><?php echo e(t('clientInformation')); ?></h2>
                <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('clientName')); ?></label>
                        <input type="text" name="client_name" value="<?php echo e($defaultClientInfo['name']); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('email')); ?></label>
                        <input type="email" name="client_email" value="<?php echo e($defaultClientInfo['email']); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('phone')); ?></label>
                        <input type="tel" name="client_phone" value="<?php echo e($defaultClientInfo['phone']); ?>"
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('address')); ?></label>
                        <input type="text" name="client_address" value="<?php echo e($defaultClientInfo['address']); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('city')); ?></label>
                        <input type="text" name="client_city" value="<?php echo e($defaultClientInfo['city']); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('postalCode')); ?></label>
                        <input type="text" name="client_postal_code" value="<?php echo e($defaultClientInfo['postalCode']); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('country')); ?></label>
                        <input type="text" name="client_country" value="<?php echo e($defaultClientInfo['country']); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    </div>
                </div>
            </div>

            <!-- Articles/Services -->
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-900"><?php echo e(t('articlesServices')); ?></h2>
                    <div class="flex gap-3">
                        <button type="button" onclick="loadServices()" class="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-2 rounded-xl font-medium">
                            <?php echo e(t('loadServices')); ?>
                        </button>
                        <button type="button" onclick="addItem()" class="bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 text-green-700 px-4 py-2 rounded-xl font-medium">
                            <?php echo e(t('add')); ?>
                        </button>
                    </div>
                </div>
                <div id="items-container" class="space-y-4">
                    <!-- Les items seront ajoutés ici dynamiquement -->
                </div>
            </div>

            <!-- Remise globale -->
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-4"><?php echo e(t('globalDiscount')); ?></h2>
                <div class="flex items-center gap-4">
                    <input type="number" name="global_discount" value="0" min="0" max="100" step="0.1"
                           class="w-24 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                    <span class="text-gray-700 font-medium">%</span>
                </div>
            </div>

            <!-- Notes -->
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-6"><?php echo e(t('notesAdditionalInfo')); ?></h2>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('commercialNotes')); ?></label>
                        <textarea name="notes" rows="8"
                                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"><?php echo e($_POST['notes'] ?? ''); ?></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('additionalInformation')); ?></label>
                        <textarea name="additional_info" rows="8"
                                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"><?php echo e($_POST['additional_info'] ?? ''); ?></textarea>
                    </div>
                </div>
            </div>

            <!-- Boutons -->
            <div class="flex justify-end gap-4">
                <a href="index.php" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-medium">
                    <?php echo e(t('cancel')); ?>
                </a>
                <button type="submit" class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 rounded-2xl font-medium">
                    <?php echo e(t('createQuote')); ?>
                </button>
            </div>
        </form>
    </div>
</div>

<script src="assets/js/invoice-form.js"></script>

<?php include 'includes/footer.php'; ?>
