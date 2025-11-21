<?php
require_once 'includes/config.php';
require_once 'includes/auth.php';
require_once 'includes/functions.php';

requireLogin();

$pdo = getDBConnection();
$userId = getUserId();
$invoiceId = $_GET['id'] ?? null;

if (!$invoiceId) {
    redirectWithMessage('index.php', t('invoiceNotFound'), 'error');
}

// Vérifier que le devis appartient à l'utilisateur
$stmt = $pdo->prepare("SELECT * FROM invoices WHERE id = ? AND user_id = ?");
$stmt->execute([$invoiceId, $userId]);
$invoice = $stmt->fetch();

if (!$invoice) {
    redirectWithMessage('index.php', t('invoiceNotFound'), 'error');
}

$clientInfo = json_decode($invoice['client_info'], true);
$companyInfo = json_decode($invoice['company_info'], true);

// Récupérer les items
$stmt = $pdo->prepare("SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY order_index");
$stmt->execute([$invoiceId]);
$items = $stmt->fetchAll();

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $invoiceData = [
        'number' => $_POST['number'] ?? $invoice['number'],
        'date' => $_POST['date'] ?? $invoice['date'],
        'currency' => $_POST['currency'] ?? $invoice['currency'],
        'tax_rate' => floatval($_POST['tax_rate'] ?? $invoice['tax_rate']),
        'global_discount' => floatval($_POST['global_discount'] ?? $invoice['global_discount']),
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
            'logo' => $companyInfo['logo'] ?? ''
        ]),
        'notes' => $_POST['notes'] ?? '',
        'additional_info' => $_POST['additional_info'] ?? ''
    ];
    
    // Gérer l'upload du logo
    if (isset($_FILES['company_logo']) && $_FILES['company_logo']['error'] === UPLOAD_ERR_OK) {
        $uploadResult = uploadLogo($_FILES['company_logo'], $invoiceId);
        if ($uploadResult['success']) {
            $companyInfo = json_decode($invoiceData['company_info'], true);
            $companyInfo['logo'] = $uploadResult['path'];
            $invoiceData['company_info'] = json_encode($companyInfo);
        }
    }
    
    // Traiter les items
    $newItems = [];
    if (isset($_POST['items']) && is_array($_POST['items'])) {
        foreach ($_POST['items'] as $index => $item) {
            if (!empty($item['name'])) {
                $quantity = floatval($item['quantity'] ?? 1);
                $price = floatval($item['price'] ?? 0);
                $discount = floatval($item['discount'] ?? 0);
                $total = calculateItemTotal($quantity, $price, $discount);
                
                $newItems[] = [
                    'id' => $item['id'] ?? null,
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
    $totals = calculateInvoiceTotals($newItems, $invoiceData['tax_rate'], $invoiceData['global_discount']);
    $invoiceData['subtotal'] = $totals['subtotal'];
    $invoiceData['tax'] = $totals['tax'];
    $invoiceData['total'] = $totals['total'];
    
    // Mettre à jour le devis
    try {
        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare("
            UPDATE invoices SET 
                number = ?, date = ?, currency = ?, tax_rate = ?, global_discount = ?, 
                subtotal = ?, tax = ?, total = ?, 
                client_info = ?, company_info = ?, notes = ?, additional_info = ?, updated_at = NOW()
            WHERE id = ? AND user_id = ?
        ");
        $stmt->execute([
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
            $invoiceData['additional_info'],
            $invoiceId,
            $userId
        ]);
        
        // Supprimer les anciens items
        $stmt = $pdo->prepare("DELETE FROM invoice_items WHERE invoice_id = ?");
        $stmt->execute([$invoiceId]);
        
        // Insérer les nouveaux items
        $stmt = $pdo->prepare("
            INSERT INTO invoice_items (invoice_id, name, description, quantity, price, discount, total, is_included, order_index)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        foreach ($newItems as $item) {
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
        redirectWithMessage('invoice_preview.php?id=' . $invoiceId, t('invoiceUpdatedSuccessfully'), 'success');
    } catch (Exception $e) {
        $pdo->rollBack();
        $error = t('errorUpdatingInvoice') . ': ' . $e->getMessage();
    }
}

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
            <h1 class="text-2xl font-bold text-gray-900"><?php echo e(t('editInvoiceTitle')); ?></h1>
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
                        <input type="text" name="number" value="<?php echo e($invoice['number']); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('date')); ?></label>
                        <input type="date" name="date" value="<?php echo e($invoice['date']); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('selectCurrency')); ?></label>
                        <select name="currency" required
                                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="EUR" <?php echo $invoice['currency'] === 'EUR' ? 'selected' : ''; ?>><?php echo e(t('euro')); ?></option>
                            <option value="CHF" <?php echo $invoice['currency'] === 'CHF' ? 'selected' : ''; ?>><?php echo e(t('swissFranc')); ?></option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('vat')); ?> (%)</label>
                        <input type="number" name="tax_rate" value="<?php echo e($invoice['tax_rate']); ?>" min="0" max="100" step="0.1" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                </div>
            </div>

            <!-- Informations entreprise -->
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-6"><?php echo e(t('companyInformation')); ?></h2>
                
                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('companyLogo')); ?></label>
                    <?php if (!empty($companyInfo['logo'])): ?>
                        <div class="mb-2">
                            <img src="<?php echo e($companyInfo['logo']); ?>" alt="Logo" class="h-20 object-contain">
                        </div>
                    <?php endif; ?>
                    <input type="file" name="company_logo" accept="image/*"
                           class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('companyName')); ?></label>
                        <input type="text" name="company_name" value="<?php echo e($companyInfo['name'] ?? ''); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('email')); ?></label>
                        <input type="email" name="company_email" value="<?php echo e($companyInfo['email'] ?? ''); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('phone')); ?></label>
                        <input type="tel" name="company_phone" value="<?php echo e($companyInfo['phone'] ?? ''); ?>"
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('address')); ?></label>
                        <input type="text" name="company_address" value="<?php echo e($companyInfo['address'] ?? ''); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('city')); ?></label>
                        <input type="text" name="company_city" value="<?php echo e($companyInfo['city'] ?? ''); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('postalCode')); ?></label>
                        <input type="text" name="company_postal_code" value="<?php echo e($companyInfo['postalCode'] ?? ''); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('country')); ?></label>
                        <input type="text" name="company_country" value="<?php echo e($companyInfo['country'] ?? t('france')); ?>" required
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
                        <input type="text" name="client_name" value="<?php echo e($clientInfo['name'] ?? ''); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('email')); ?></label>
                        <input type="email" name="client_email" value="<?php echo e($clientInfo['email'] ?? ''); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('phone')); ?></label>
                        <input type="tel" name="client_phone" value="<?php echo e($clientInfo['phone'] ?? ''); ?>"
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('address')); ?></label>
                        <input type="text" name="client_address" value="<?php echo e($clientInfo['address'] ?? ''); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('city')); ?></label>
                        <input type="text" name="client_city" value="<?php echo e($clientInfo['city'] ?? ''); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('postalCode')); ?></label>
                        <input type="text" name="client_postal_code" value="<?php echo e($clientInfo['postalCode'] ?? ''); ?>" required
                               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('country')); ?></label>
                        <input type="text" name="client_country" value="<?php echo e($clientInfo['country'] ?? t('france')); ?>" required
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
                    <?php foreach ($items as $index => $item): ?>
                    <div class="item-row bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6">
                        <input type="hidden" name="items[<?php echo $index; ?>][id]" value="<?php echo $item['id']; ?>">
                        <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
                            <div class="xl:col-span-3">
                                <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('serviceName')); ?></label>
                                <input type="text" name="items[<?php echo $index; ?>][name]" value="<?php echo e($item['name']); ?>" required
                                       class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500">
                            </div>
                            <div class="xl:col-span-3">
                                <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('description')); ?></label>
                                <textarea name="items[<?php echo $index; ?>][description]" rows="2"
                                          class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 resize-none"><?php echo e($item['description']); ?></textarea>
                            </div>
                            <div class="xl:col-span-1">
                                <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('quantity')); ?></label>
                                <input type="number" name="items[<?php echo $index; ?>][quantity]" value="<?php echo e($item['quantity']); ?>" min="1" required
                                       class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-center">
                            </div>
                            <div class="xl:col-span-2">
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Prix unitaire HT</label>
                                <input type="number" name="items[<?php echo $index; ?>][price]" value="<?php echo e($item['price']); ?>" min="0" step="0.01" required
                                       class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500">
                            </div>
                            <div class="xl:col-span-1">
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Remise (%)</label>
                                <input type="number" name="items[<?php echo $index; ?>][discount]" value="<?php echo e($item['discount']); ?>" min="0" max="100" step="0.1"
                                       class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-center">
                            </div>
                            <div class="xl:col-span-1">
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Total HT</label>
                                <div class="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-bold text-center">
                                    <?php echo number_format($item['total'], 2, ',', ' '); ?>
                                </div>
                            </div>
                            <div class="xl:col-span-1">
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Actions</label>
                                <div class="flex flex-col gap-3">
                                    <label class="flex items-center gap-2 text-sm bg-green-50 p-2 rounded-xl">
                                        <input type="checkbox" name="items[<?php echo $index; ?>][is_included]" value="1" <?php echo $item['is_included'] ? 'checked' : ''; ?>>
                                        <span class="text-green-700 font-medium"><?php echo e(t('included')); ?></span>
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
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- Remise globale -->
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-4"><?php echo e(t('globalDiscount')); ?></h2>
                <div class="flex items-center gap-4">
                    <input type="number" name="global_discount" value="<?php echo e($invoice['global_discount']); ?>" min="0" max="100" step="0.1"
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
                                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"><?php echo e($invoice['notes']); ?></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2"><?php echo e(t('additionalInformation')); ?></label>
                        <textarea name="additional_info" rows="8"
                                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"><?php echo e($invoice['additional_info']); ?></textarea>
                    </div>
                </div>
            </div>

            <!-- Boutons -->
            <div class="flex justify-end gap-4">
                <a href="index.php" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-medium">
                    <?php echo e(t('cancel')); ?>
                </a>
                <button type="submit" class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 rounded-2xl font-medium">
                    <?php echo e(t('update')); ?>
                </button>
            </div>
        </form>
    </div>
</div>

<script src="assets/js/invoice-form.js"></script>

<?php include 'includes/footer.php'; ?>
