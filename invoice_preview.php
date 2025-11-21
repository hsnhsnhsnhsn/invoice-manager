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

$currencySymbol = getCurrencySymbol($invoice['currency']);

include 'includes/header.php';
?>

<div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16 gap-4">
                <div class="flex items-center gap-3">
                    <a href="index.php" class="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span class="font-medium"><?php echo e(t('back')); ?></span>
                    </a>
                </div>
                <div class="flex gap-3">
                    <a href="invoice_edit.php?id=<?php echo $invoiceId; ?>" class="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium">
                        <?php echo e(t('edit')); ?>
                    </a>
                    <a href="invoice_pdf.php?id=<?php echo $invoiceId; ?>" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium">
                        <?php echo e(t('pdf')); ?>
                    </a>
                </div>
            </div>
        </div>
    </header>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white shadow-lg rounded-2xl overflow-hidden">
            <!-- En-tête -->
            <div class="p-6 sm:p-12">
                <div class="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                    <div class="flex items-center gap-4">
                        <?php if (!empty($companyInfo['logo'])): ?>
                            <img src="<?php echo e($companyInfo['logo']); ?>" alt="Logo" class="h-16 object-contain">
                        <?php endif; ?>
                        <div>
                            <h1 class="text-2xl font-bold text-gray-900">
                                <?php echo e(t('quoteNo')); ?> #<?php echo e($invoice['number']); ?>
                            </h1>
                            <p class="text-gray-600"><?php echo e(t('date')); ?>: <?php echo formatDate($invoice['date']); ?></p>
                        </div>
                    </div>
                </div>

                <!-- Informations client et entreprise -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-3"><?php echo e(t('quoteFrom')); ?></h3>
                        <div class="text-gray-600 space-y-1">
                            <p class="font-medium text-gray-900"><?php echo e($companyInfo['name'] ?? ''); ?></p>
                            <p><?php echo e($companyInfo['address'] ?? ''); ?></p>
                            <p><?php echo e($companyInfo['postalCode'] ?? ''); ?> <?php echo e($companyInfo['city'] ?? ''); ?></p>
                            <p><?php echo e($companyInfo['country'] ?? ''); ?></p>
                            <p><?php echo e($companyInfo['email'] ?? ''); ?></p>
                            <?php if (!empty($companyInfo['phone'])): ?>
                                <p><?php echo e($companyInfo['phone']); ?></p>
                            <?php endif; ?>
                        </div>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-3"><?php echo e(t('quoteFor')); ?></h3>
                        <div class="text-gray-600 space-y-1">
                            <p class="font-medium text-gray-900"><?php echo e($clientInfo['name'] ?? ''); ?></p>
                            <p><?php echo e($clientInfo['address'] ?? ''); ?></p>
                            <p><?php echo e($clientInfo['postalCode'] ?? ''); ?> <?php echo e($clientInfo['city'] ?? ''); ?></p>
                            <p><?php echo e($clientInfo['country'] ?? ''); ?></p>
                            <p><?php echo e($clientInfo['email'] ?? ''); ?></p>
                        </div>
                    </div>
                </div>

                <!-- Tableau des services -->
                <div class="mb-8">
                    <h3 class="text-xl font-bold text-gray-900 mb-4"><?php echo e(t('proposedServices')); ?></h3>
                    <div class="overflow-x-auto border border-gray-200 rounded-xl">
                        <table class="w-full min-w-full">
                            <thead>
                                <tr class="bg-gray-50 border-b border-gray-200">
                                    <th class="text-left py-4 px-6 font-semibold text-gray-900"><?php echo e(t('service')); ?></th>
                                    <th class="text-center py-4 px-6 font-semibold text-gray-900"><?php echo e(t('qty')); ?></th>
                                    <th class="text-right py-4 px-6 font-semibold text-gray-900">Prix HT</th>
                                    <th class="text-right py-4 px-6 font-semibold text-gray-900">Total HT</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($items as $item): 
                                    $discount = $item['discount'] ?? 0;
                                    $discountedPrice = $item['price'] * (1 - $discount / 100);
                                    $itemTotal = $discountedPrice * $item['quantity'];
                                ?>
                                <tr class="border-b border-gray-100">
                                    <td class="py-4 px-6">
                                        <div>
                                            <p class="font-medium text-gray-900"><?php echo e($item['name']); ?></p>
                                            <?php if ($discount > 0): ?>
                                                <div class="text-xs text-green-600">Remise <?php echo $discount; ?>%</div>
                                            <?php endif; ?>
                                            <?php if ($item['is_included']): ?>
                                                <span class="inline-flex items-center gap-1 mt-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                                    <?php echo e(t('serviceIncluded')); ?>
                                                </span>
                                            <?php endif; ?>
                                        </div>
                                    </td>
                                    <td class="py-4 px-6 text-center text-gray-900"><?php echo $item['quantity']; ?></td>
                                    <td class="py-4 px-6 text-right text-gray-900">
                                        <?php if ($item['is_included']): ?>
                                            <span class="text-green-600 font-medium"><?php echo e(t('included')); ?></span>
                                        <?php else: ?>
                                            <?php if ($discount > 0): ?>
                                                <div class="text-xs text-gray-500 line-through"><?php echo number_format($item['price'], 2, ',', ' '); ?> <?php echo $currencySymbol; ?></div>
                                            <?php endif; ?>
                                            <div><?php echo number_format($discountedPrice, 2, ',', ' '); ?> <?php echo $currencySymbol; ?></div>
                                        <?php endif; ?>
                                    </td>
                                    <td class="py-4 px-6 text-right font-medium text-gray-900">
                                        <?php if ($item['is_included']): ?>
                                            <span class="text-green-600 font-medium"><?php echo e(t('included')); ?></span>
                                        <?php else: ?>
                                            <?php echo number_format($itemTotal, 2, ',', ' '); ?> <?php echo $currencySymbol; ?>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Totaux -->
                <div class="bg-gray-50 rounded-xl p-6">
                    <div class="flex justify-end">
                        <div class="w-full max-w-sm space-y-3">
                            <?php if ($invoice['global_discount'] > 0): ?>
                                <div class="flex justify-between items-center text-green-600">
                                    <span class="font-medium flex items-center gap-1">
                                        Remise globale (<?php echo $invoice['global_discount']; ?>%):
                                    </span>
                                    <span class="font-bold">
                                        -<?php echo formatCurrency(($invoice['subtotal'] / (1 - $invoice['global_discount'] / 100)) - $invoice['subtotal'], $invoice['currency']); ?>
                                    </span>
                                </div>
                            <?php endif; ?>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600 font-medium">Sous-total HT:</span>
                                <span class="font-bold"><?php echo formatCurrency($invoice['subtotal'], $invoice['currency']); ?></span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600 font-medium"><?php echo e(t('vat')); ?> (<?php echo $invoice['tax_rate']; ?>%):</span>
                                <span class="font-bold"><?php echo formatCurrency($invoice['tax'], $invoice['currency']); ?></span>
                            </div>
                            <div class="border-t border-gray-300 pt-3">
                                <div class="flex justify-between items-center">
                                    <span class="text-xl font-bold text-gray-900"><?php echo e(t('totalTTC')); ?>:</span>
                                    <span class="text-2xl font-bold text-blue-600">
                                        <?php echo formatCurrency($invoice['total'], $invoice['currency']); ?>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Notes -->
                <?php if (!empty($invoice['notes']) || !empty($invoice['additional_info'])): ?>
                <div class="mt-8 space-y-6">
                    <?php if (!empty($invoice['notes'])): ?>
                        <div>
                            <h3 class="text-lg font-bold text-gray-900 mb-4"><?php echo e(t('commercialNotes')); ?></h3>
                            <div class="text-gray-700 whitespace-pre-line"><?php echo nl2br(e($invoice['notes'])); ?></div>
                        </div>
                    <?php endif; ?>
                    <?php if (!empty($invoice['additional_info'])): ?>
                        <div>
                            <h3 class="text-lg font-bold text-gray-900 mb-4"><?php echo e(t('additionalInformation')); ?></h3>
                            <div class="text-gray-700 whitespace-pre-line"><?php echo nl2br(e($invoice['additional_info'])); ?></div>
                        </div>
                    <?php endif; ?>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<?php include 'includes/footer.php'; ?>
