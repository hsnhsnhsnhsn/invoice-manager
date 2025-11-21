import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Zap, Building, User, Package, Sparkles, Users, FileText, MapPin, Phone, Mail, Globe, UserCheck, Building2, Percent, TrendingUp } from 'lucide-react';
import { Invoice, InvoiceItem, ClientInfo, CompanyInfo, Currency } from '../types/Invoice';
import { useTranslation, getCurrencySymbol, formatCurrency } from '../utils/translations';
import { generateInvoiceSummary } from '../utils/aiDescriptionGenerator';
import AIServiceGenerator from './AIServiceGenerator';

interface InvoiceFormProps {
  invoice: Invoice | null;
  onSave: (invoice: Invoice) => void;
  onCancel: () => void;
  isEdit: boolean;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, onSave, onCancel, isEdit }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Invoice>({
    id: '',
    number: '',
    date: new Date().toISOString().split('T')[0],
    clientInfo: {
      name: '',
      email: '',
      address: '',
      city: '',
      postalCode: '',
      country: t('france')
    },
    companyInfo: {
      name: '',
      address: '',
      city: '',
      postalCode: '',
      country: t('france'),
      email: '',
      phone: '',
      logo: ''
    },
    items: [],
    subtotal: 0,
    tax: 0,
    taxRate: 20,
    total: 0,
    notes: '',
    additionalInfo: '',
    isPublic: true,
    currency: 'EUR', // Devise par défaut
    globalDiscount: 0 // Remise globale par défaut
  });

  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [isGeneratingAISummary, setIsGeneratingAISummary] = useState(false);

  useEffect(() => {
    if (invoice) {
      setFormData({
        ...invoice,
        currency: invoice.currency || 'EUR', // Assurer qu'il y a toujours une devise
        globalDiscount: invoice.globalDiscount || 0 // Assurer qu'il y a toujours une remise globale
      });
    } else {
      // Générer un numéro de devis automatiquement pour les nouveaux devis
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      
      setFormData(prev => ({
        ...prev,
        number: `DV${year}${month}${day}${random}`
      }));
    }
  }, [invoice]);

  const calculateTotals = (items: InvoiceItem[], taxRate: number, globalDiscount: number = 0) => {
    // Calculer le sous-total HT avec les remises par article
    const subtotalBeforeGlobalDiscount = items
      .filter(item => !item.isIncluded)
      .reduce((sum, item) => {
        const itemDiscount = item.discount || 0;
        const discountedPrice = item.price * (1 - itemDiscount / 100);
        return sum + (discountedPrice * item.quantity);
      }, 0);
    
    // Appliquer la remise globale
    const subtotal = subtotalBeforeGlobalDiscount * (1 - globalDiscount / 100);
    
    // Calculer la TVA sur le sous-total après remises
    const tax = (subtotal * taxRate) / 100;
    
    // Total TTC
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };

  const updateFormData = (updates: Partial<Invoice>) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      
      if (updates.items || updates.taxRate !== undefined || updates.globalDiscount !== undefined) {
        const { subtotal, tax, total } = calculateTotals(
          newData.items, 
          newData.taxRate, 
          newData.globalDiscount || 0
        );
        newData.subtotal = subtotal;
        newData.tax = tax;
        newData.total = total;
      }
      
      return newData;
    });
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculer le total de l'article avec la remise
    if (field === 'quantity' || field === 'price' || field === 'discount') {
      const item = newItems[index];
      const discount = item.discount || 0;
      const discountedPrice = item.price * (1 - discount / 100);
      newItems[index].total = discountedPrice * item.quantity;
    }
    
    updateFormData({ items: newItems });
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      name: '',
      description: '',
      quantity: 1,
      price: 0,
      total: 0,
      isIncluded: false,
      discount: 0
    };
    updateFormData({ items: [...formData.items, newItem] });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    updateFormData({ items: newItems });
  };

  const handleGenerateAIServices = (services: Omit<InvoiceItem, 'id' | 'quantity' | 'total'>[]) => {
    const newItems = services.map(service => ({
      id: Date.now().toString() + Math.random(),
      ...service,
      quantity: 1,
      total: service.price,
      isIncluded: false,
      discount: 0
    }));
    updateFormData({ items: [...formData.items, ...newItems] });
  };

  const generateAISummary = async () => {
    if (formData.items.length === 0) {
      alert('Ajoutez au moins un service pour générer un résumé IA');
      return;
    }

    setIsGeneratingAISummary(true);
    try {
      // Simuler un délai d'API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const summary = generateInvoiceSummary(
        formData.items.map(item => ({
          name: item.name,
          description: item.description,
          price: item.price,
          quantity: item.quantity
        })),
        formData.clientInfo.name || 'Client'
      );
      
      updateFormData({ notes: summary });
    } catch (error) {
      console.error('Erreur lors de la génération du résumé IA:', error);
      alert('Erreur lors de la génération du résumé IA');
    } finally {
      setIsGeneratingAISummary(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Le fichier est trop volumineux. Taille maximale : 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const logoUrl = event.target?.result as string;
        updateFormData({
          companyInfo: { ...formData.companyInfo, logo: logoUrl }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header moderne */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={onCancel}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all duration-200 p-2 rounded-xl hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">{t('back')}</span>
              </button>
              <div className="h-8 w-px bg-gray-200"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {isEdit ? t('editInvoiceTitle') : t('newInvoiceTitle')}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {isEdit ? 'Modifier les informations du devis' : 'Créer un nouveau devis professionnel'}
                  </p>
                </div>
              </div>
            </div>
            <button
              type="submit"
              form="invoice-form"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Save className="w-4 h-4" />
              {isEdit ? t('update') : t('save')}
            </button>
          </div>
        </div>
      </header>

      {/* Formulaire avec largeur maximale */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form id="invoice-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Informations générales - Design moderne */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t('generalInformation')}</h2>
                <p className="text-gray-600">Informations de base du devis</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {t('quoteNumber')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.number}
                    onChange={(e) => updateFormData({ number: e.target.value })}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-lg font-medium"
                    required
                    placeholder="DV240101001"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {t('date')}
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => updateFormData({ date: e.target.value })}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-lg"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {t('selectCurrency')}
                </label>
                <div className="relative">
                  <select
                    value={formData.currency}
                    onChange={(e) => updateFormData({ currency: e.target.value as Currency })}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-lg font-medium appearance-none"
                    required
                  >
                    <option value="EUR">{t('euro')}</option>
                    <option value="CHF">{t('swissFranc')}</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  {t('vat')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.taxRate}
                    onChange={(e) => updateFormData({ taxRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm text-lg font-medium"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <span className="text-gray-500 font-medium">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informations entreprise - Design amélioré */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{t('companyInformation')}</h2>
                  <p className="text-gray-600">Informations de votre entreprise</p>
                </div>
              </div>
            </div>

            {/* Logo section améliorée */}
            <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                {t('companyLogo')}
              </label>
              <div className="flex items-center gap-6">
                {formData.companyInfo.logo ? (
                  <div className="relative group">
                    <img
                      src={formData.companyInfo.logo}
                      alt="Logo"
                      className="w-20 h-20 object-contain border-2 border-gray-200 rounded-2xl bg-white p-3 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => updateFormData({ companyInfo: { ...formData.companyInfo, logo: '' } })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-lg"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center bg-white">
                    <Building className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 px-6 py-3 rounded-2xl font-medium cursor-pointer transition-all duration-200 inline-flex items-center gap-2 shadow-sm hover:shadow-md"
                  >
                    <Building className="w-4 h-4" />
                    {formData.companyInfo.logo ? t('changeLogo') : t('addLogo')}
                  </label>
                  <p className="text-sm text-gray-500 mt-2">{t('logoFormats')}</p>
                </div>
              </div>
            </div>

            {/* Coordonnées complètes de l'entreprise */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  {t('companyName')}
                </label>
                <input
                  type="text"
                  value={formData.companyInfo.name}
                  onChange={(e) => updateFormData({
                    companyInfo: { ...formData.companyInfo, name: e.target.value }
                  })}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                  required
                  placeholder="Nom de votre entreprise"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  {t('email')}
                </label>
                <input
                  type="email"
                  value={formData.companyInfo.email}
                  onChange={(e) => updateFormData({
                    companyInfo: { ...formData.companyInfo, email: e.target.value }
                  })}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                  required
                  placeholder="contact@entreprise.com"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  {t('phone')}
                </label>
                <input
                  type="tel"
                  value={formData.companyInfo.phone || ''}
                  onChange={(e) => updateFormData({
                    companyInfo: { ...formData.companyInfo, phone: e.target.value }
                  })}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  {t('address')}
                </label>
                <input
                  type="text"
                  value={formData.companyInfo.address}
                  onChange={(e) => updateFormData({
                    companyInfo: { ...formData.companyInfo, address: e.target.value }
                  })}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                  required
                  placeholder="123 Rue de la Paix"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {t('city')}
                </label>
                <input
                  type="text"
                  value={formData.companyInfo.city}
                  onChange={(e) => updateFormData({
                    companyInfo: { ...formData.companyInfo, city: e.target.value }
                  })}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                  required
                  placeholder="Paris"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {t('postalCode')}
                </label>
                <input
                  type="text"
                  value={formData.companyInfo.postalCode}
                  onChange={(e) => updateFormData({
                    companyInfo: { ...formData.companyInfo, postalCode: e.target.value }
                  })}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                  required
                  placeholder="75001"
                />
              </div>
              
              <div className="space-y-2 lg:col-span-2 xl:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  Pays
                </label>
                <input
                  type="text"
                  value={formData.companyInfo.country}
                  onChange={(e) => updateFormData({
                    companyInfo: { ...formData.companyInfo, country: e.target.value }
                  })}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                  required
                  placeholder="France"
                />
              </div>
            </div>
          </div>

          {/* Informations client - Design amélioré */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{t('clientInformation')}</h2>
                  <p className="text-gray-600">Coordonnées complètes du client</p>
                </div>
              </div>
            </div>

            {/* Coordonnées complètes du client */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-600" />
                  Nom et Prénom
                </label>
                <input
                  type="text"
                  value={formData.clientInfo.name}
                  onChange={(e) => updateFormData({
                    clientInfo: { ...formData.clientInfo, name: e.target.value }
                  })}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                  required
                  placeholder="Jean Dupont"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-600" />
                  {t('email')}
                </label>
                <input
                  type="email"
                  value={formData.clientInfo.email}
                  onChange={(e) => updateFormData({
                    clientInfo: { ...formData.clientInfo, email: e.target.value }
                  })}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                  required
                  placeholder="jean.dupont@email.com"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-purple-600" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.clientInfo.phone || ''}
                  onChange={(e) => updateFormData({
                    clientInfo: { ...formData.clientInfo, phone: e.target.value }
                  })}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  {t('address')}
                </label>
                <input
                  type="text"
                  value={formData.clientInfo.address}
                  onChange={(e) => updateFormData({
                    clientInfo: { ...formData.clientInfo, address: e.target.value }
                  })}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                  required
                  placeholder="456 Avenue des Champs"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {t('city')}
                </label>
                <input
                  type="text"
                  value={formData.clientInfo.city}
                  onChange={(e) => updateFormData({
                    clientInfo: { ...formData.clientInfo, city: e.target.value }
                  })}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                  required
                  placeholder="Lyon"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {t('postalCode')}
                </label>
                <input
                  type="text"
                  value={formData.clientInfo.postalCode}
                  onChange={(e) => updateFormData({
                    clientInfo: { ...formData.clientInfo, postalCode: e.target.value }
                  })}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                  required
                  placeholder="69000"
                />
              </div>
              
              <div className="space-y-2 lg:col-span-2 xl:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-600" />
                  Pays
                </label>
                <input
                  type="text"
                  value={formData.clientInfo.country}
                  onChange={(e) => updateFormData({
                    clientInfo: { ...formData.clientInfo, country: e.target.value }
                  })}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                  required
                  placeholder="France"
                />
              </div>
            </div>
          </div>

          {/* Articles/Services - Design moderne */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{t('articlesServices')}</h2>
                  <p className="text-gray-600">Services et produits proposés</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAIGenerator(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Zap className="w-4 h-4" />
                  {t('aiCompleteProject')}
                </button>
                <button
                  type="button"
                  onClick={addItem}
                  className="bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 text-green-700 px-6 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  {t('add')}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {formData.items.map((item, index) => (
                <div key={item.id} className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-200">
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    <div className="xl:col-span-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        {t('serviceName')}
                      </label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                        required
                        placeholder="Nom du service"
                      />
                    </div>
                    <div className="xl:col-span-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        {t('description')}
                      </label>
                      <textarea
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none bg-white"
                        rows={2}
                        required
                        placeholder="Description détaillée"
                      />
                    </div>
                    <div className="xl:col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        {t('quantity')}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-center font-medium"
                        required
                      />
                    </div>
                    <div className="xl:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Prix unitaire HT ({getCurrencySymbol(formData.currency)})
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                        required
                      />
                    </div>
                    <div className="xl:col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Remise (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={item.discount || 0}
                        onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-center"
                      />
                    </div>
                    <div className="xl:col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Total HT ({getCurrencySymbol(formData.currency)})
                      </label>
                      <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-bold text-center">
                        {item.total.toFixed(2)}
                      </div>
                    </div>
                    <div className="xl:col-span-1 flex flex-col gap-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Actions
                      </label>
                      <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-2 text-sm bg-green-50 p-2 rounded-xl">
                          <input
                            type="checkbox"
                            checked={item.isIncluded || false}
                            onChange={(e) => handleItemChange(index, 'isIncluded', e.target.checked)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-green-700 font-medium">{t('included')}</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800 transition-colors p-2 rounded-xl hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {formData.items.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun service ajouté</h3>
                  <p className="text-gray-500 mb-6">Commencez par ajouter vos premiers services</p>
                  <button
                    type="button"
                    onClick={addItem}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-medium transition-all duration-200 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Plus className="w-5 h-5" />
                    Ajouter le premier service
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Récapitulatif financier - Design moderne */}
          {formData.items.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{t('financialSummary')}</h2>
                  <p className="text-gray-600">Récapitulatif des montants</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Services payants */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-4 text-lg">{t('paidServices')}</h3>
                  <div className="space-y-3">
                    {formData.items.filter(item => !item.isIncluded).map((item) => {
                      const discount = item.discount || 0;
                      const discountedPrice = item.price * (1 - discount / 100);
                      const itemTotal = discountedPrice * item.quantity;
                      
                      return (
                        <div key={item.id} className="flex justify-between items-center bg-white/50 p-3 rounded-xl">
                          <div className="flex-1">
                            <span className="text-blue-700 font-medium">{item.name} (×{item.quantity})</span>
                            {discount > 0 && (
                              <div className="text-xs text-green-600 flex items-center gap-1">
                                <Percent className="w-3 h-3" />
                                Remise {discount}%
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            {discount > 0 && (
                              <div className="text-xs text-gray-500 line-through">
                                {(item.price * item.quantity).toFixed(2)} {getCurrencySymbol(formData.currency)}
                              </div>
                            )}
                            <span className="font-bold text-blue-900">{itemTotal.toFixed(2)} {getCurrencySymbol(formData.currency)} HT</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Services inclus */}
                {formData.items.some(item => item.isIncluded) && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200">
                    <h3 className="font-bold text-green-900 mb-4 text-lg">{t('includedServices')}</h3>
                    <div className="space-y-3">
                      {formData.items.filter(item => item.isIncluded).map((item) => (
                        <div key={item.id} className="flex justify-between items-center bg-white/50 p-3 rounded-xl">
                          <span className="text-green-700 font-medium">{item.name} (×{item.quantity})</span>
                          <span className="font-bold text-green-800">{t('included').toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Remise globale */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-100 rounded-2xl p-6 border border-purple-200 mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Percent className="w-6 h-6 text-purple-600" />
                    <h3 className="font-bold text-purple-900 text-lg">Remise globale</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.globalDiscount || 0}
                      onChange={(e) => updateFormData({ globalDiscount: parseFloat(e.target.value) || 0 })}
                      className="w-24 px-3 py-2 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-center font-medium"
                    />
                    <span className="text-purple-700 font-medium">%</span>
                  </div>
                </div>
              </div>

              {/* Totaux */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
                <div className="flex justify-end">
                  <div className="w-full max-w-md space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-300">
                      <span className="text-gray-700 font-semibold text-lg">Sous-total HT</span>
                      <span className="font-bold text-xl">{formData.subtotal.toFixed(2)} {getCurrencySymbol(formData.currency)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-300">
                      <span className="text-gray-700 font-semibold text-lg">{t('vat')} ({formData.taxRate}%):</span>
                      <span className="font-bold text-xl">{formData.tax.toFixed(2)} {getCurrencySymbol(formData.currency)}</span>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-2xl">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold">{t('totalTTC')}:</span>
                        <span className="text-2xl font-bold">
                          {formData.total.toFixed(2)} {getCurrencySymbol(formData.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes et informations supplémentaires - Design moderne */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{t('notesAdditionalInfo')}</h2>
                  <p className="text-gray-600">Informations complémentaires</p>
                </div>
              </div>
              {formData.items.length > 0 && (
                <button
                  type="button"
                  onClick={generateAISummary}
                  disabled={isGeneratingAISummary}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                >
                  {isGeneratingAISummary ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Génération...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {t('generateAISummary')}
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {t('commercialNotes')}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => updateFormData({ notes: e.target.value })}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-white/70 backdrop-blur-sm"
                  rows={8}
                  placeholder="Notes commerciales, conditions de vente, garanties..."
                />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {t('additionalInformation')}
                </label>
                <textarea
                  value={formData.additionalInfo}
                  onChange={(e) => updateFormData({ additionalInfo: e.target.value })}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-white/70 backdrop-blur-sm"
                  rows={8}
                  placeholder={t('paymentConditions')}
                />
              </div>
            </div>
          </div>

          {/* Option Roadmap - Section dédiée */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Générer une Roadmap</h2>
                <p className="text-gray-600 mb-4">Créez une roadmap de projet basée sur ce devis</p>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.generateRoadmap || false}
                    onChange={(e) => updateFormData({
                      generateRoadmap: e.target.checked,
                      roadmapData: e.target.checked ? (formData.roadmapData || {
                        projectName: '',
                        startDate: '',
                        endDate: '',
                        totalDuration: '',
                        objectives: ''
                      }) : undefined
                    })}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-base font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                    Inclure une roadmap de projet avec ce devis
                  </span>
                </label>
              </div>
            </div>

            {formData.generateRoadmap && (
              <div className="space-y-6 mt-6 pl-16 border-l-4 border-purple-500">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Nom du projet
                  </label>
                  <input
                    type="text"
                    value={formData.roadmapData?.projectName || ''}
                    onChange={(e) => updateFormData({
                      roadmapData: {
                        ...formData.roadmapData!,
                        projectName: e.target.value
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ex: Refonte site web"
                    required={formData.generateRoadmap}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Date de début
                    </label>
                    <input
                      type="date"
                      value={formData.roadmapData?.startDate || ''}
                      onChange={(e) => updateFormData({
                        roadmapData: {
                          ...formData.roadmapData!,
                          startDate: e.target.value
                        }
                      })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required={formData.generateRoadmap}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      value={formData.roadmapData?.endDate || ''}
                      onChange={(e) => updateFormData({
                        roadmapData: {
                          ...formData.roadmapData!,
                          endDate: e.target.value
                        }
                      })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required={formData.generateRoadmap}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Durée totale
                    </label>
                    <input
                      type="text"
                      value={formData.roadmapData?.totalDuration || ''}
                      onChange={(e) => updateFormData({
                        roadmapData: {
                          ...formData.roadmapData!,
                          totalDuration: e.target.value
                        }
                      })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Ex: 3 mois"
                      required={formData.generateRoadmap}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Objectifs du projet
                  </label>
                  <textarea
                    value={formData.roadmapData?.objectives || ''}
                    onChange={(e) => updateFormData({
                      roadmapData: {
                        ...formData.roadmapData!,
                        objectives: e.target.value
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px]"
                    placeholder="Décrivez les objectifs principaux du projet..."
                    required={formData.generateRoadmap}
                  />
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <p className="text-sm text-purple-800">
                    <strong>Note :</strong> La roadmap sera automatiquement générée avec vos services en tant que phases du projet. Vous pourrez la télécharger après la création du devis.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Boutons d'action - Design moderne */}
          <div className="flex justify-end gap-4 pt-8">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 rounded-2xl font-medium transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Save className="w-5 h-5" />
              {isEdit ? t('update') : t('createQuote')}
            </button>
          </div>
        </form>
      </div>

      {/* Modals */}
      {showAIGenerator && (
        <AIServiceGenerator
          onGenerateServices={handleGenerateAIServices}
          onClose={() => setShowAIGenerator(false)}
        />
      )}
    </div>
  );
};

export default InvoiceForm;