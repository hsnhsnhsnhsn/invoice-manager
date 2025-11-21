import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Eye, Trash2, Sparkles, Zap, ArrowRight, Users, TrendingUp, Calendar, MapIcon, Shield, Lock, Trash } from 'lucide-react';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import RoadmapForm from './components/RoadmapForm';
import RoadmapPreview from './components/RoadmapPreview';
import AIServiceGenerator from './components/AIServiceGenerator';
import { Invoice, InvoiceItem, Currency } from './types/Invoice';
import { Roadmap } from './types/Roadmap';
import { useTranslation, LanguageSelector, getCurrencySymbol } from './utils/translations';

function App() {
  const { t, currentLanguage, changeLanguage } = useTranslation();
  const [currentView, setCurrentView] = useState<'home' | 'create' | 'edit' | 'preview' | 'roadmap-create' | 'roadmap-edit' | 'roadmap-preview'>('home');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [currentRoadmap, setCurrentRoadmap] = useState<Roadmap | null>(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  useEffect(() => {
    // Initialiser avec un tableau vide - pas de persistance
    setInvoices([]);
  }, []);

  const handleCreateNew = () => {
    setCurrentInvoice(null);
    setCurrentView('create');
  };

  const handleCreateWithAI = () => {
    setShowAIGenerator(true);
  };

  const handleGenerateAIServices = (services: Omit<InvoiceItem, 'id' | 'quantity' | 'total'>[]) => {
    // Créer un nouveau devis avec les services générés par l'IA
    const newInvoice: Invoice = {
      id: '',
      number: generateInvoiceNumber(),
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
        name: 'Mon Entreprise',
        address: '123 Rue de la Paix',
        city: 'Paris',
        postalCode: '75001',
        country: t('france'),
        email: 'contact@monentreprise.fr',
        phone: '+33 1 23 45 67 89',
        logo: ''
      },
      items: services.map(service => ({
        id: Date.now().toString() + Math.random(),
        ...service,
        quantity: 1,
        total: service.price,
        isIncluded: false
      })),
      subtotal: 0,
      tax: 0,
      taxRate: 20,
      total: 0,
      notes: '',
      additionalInfo: '',
      currency: 'EUR' // Par défaut Euro
    };

    // Calculer les totaux
    const subtotal = newInvoice.items.reduce((sum, item) => sum + item.total, 0);
    const tax = (subtotal * newInvoice.taxRate) / 100;
    const total = subtotal + tax;

    newInvoice.subtotal = subtotal;
    newInvoice.tax = tax;
    newInvoice.total = total;

    setCurrentInvoice(newInvoice);
    setCurrentView('create');
    setShowAIGenerator(false);
  };

  const generateInvoiceNumber = (): string => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `DV${year}${month}${day}${random}`;
  };

  const handleEdit = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setCurrentView('edit');
  };

  const handlePreview = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setCurrentView('preview');
  };

  const handleSave = (invoice: Invoice) => {
    // Générer un ID si nouveau devis
    const savedInvoice = {
      ...invoice,
      id: invoice.id || Date.now().toString()
    };

    // Aller directement à la prévisualisation pour télécharger le PDF
    setCurrentInvoice(savedInvoice);
    setCurrentView('preview');
  };

  const handleDelete = (id: string) => {
    if (window.confirm(`${t('confirmDelete')} ?`)) {
      try {
        setInvoices(prev => prev.filter(invoice => invoice.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert(t('errorDeleting'));
      }
    }
  };

  const handleBack = () => {
    setCurrentView('home');
    setCurrentInvoice(null);
    setCurrentRoadmap(null);
  };

  const handleCreateRoadmap = () => {
    setCurrentRoadmap(null);
    setCurrentView('roadmap-create');
  };

  const handleSaveRoadmap = (roadmap: Roadmap) => {
    const savedRoadmap = {
      ...roadmap,
      id: roadmap.id || Date.now().toString()
    };

    setCurrentRoadmap(savedRoadmap);
    setCurrentView('roadmap-preview');
  };

  const handleEditRoadmap = (roadmap: Roadmap) => {
    setCurrentRoadmap(roadmap);
    setCurrentView('roadmap-edit');
  };

  if (currentView === 'create' || currentView === 'edit') {
    return (
      <InvoiceForm
        invoice={currentInvoice}
        onSave={handleSave}
        onCancel={handleBack}
        isEdit={currentView === 'edit'}
      />
    );
  }

  if (currentView === 'preview' && currentInvoice) {
    return (
      <InvoicePreview
        invoice={currentInvoice}
        onBack={handleBack}
        onEdit={() => handleEdit(currentInvoice)}
      />
    );
  }

  if (currentView === 'roadmap-create' || currentView === 'roadmap-edit') {
    return (
      <RoadmapForm
        roadmap={currentRoadmap}
        onSave={handleSaveRoadmap}
        onCancel={handleBack}
        isEdit={currentView === 'roadmap-edit'}
      />
    );
  }

  if (currentView === 'roadmap-preview' && currentRoadmap) {
    return (
      <RoadmapPreview
        roadmap={currentRoadmap}
        onBack={handleBack}
        onEdit={() => handleEditRoadmap(currentRoadmap)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Éléments décoratifs animés */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('invoiceGenerator')}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSelector
                currentLanguage={currentLanguage}
                onLanguageChange={changeLanguage}
              />
              <button
                onClick={handleCreateRoadmap}
                className="relative group bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 relative z-10" />
                <span className="hidden sm:inline relative z-10">Roadmap</span>
                <span className="sm:hidden relative z-10">RM</span>
              </button>
              <button
                onClick={handleCreateWithAI}
                className="relative group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 relative z-10 animate-pulse" />
                <span className="hidden sm:inline relative z-10">{t('aiGenerator')}</span>
                <span className="sm:hidden relative z-10">IA</span>
              </button>
              <button
                onClick={handleCreateNew}
                className="relative group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-1 sm:gap-2 shadow-lg hover:shadow-xl text-xs sm:text-sm transform hover:-translate-y-0.5 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 relative z-10" />
                <span className="hidden sm:inline relative z-10">{t('newInvoice')}</span>
                <span className="sm:hidden relative z-10">+</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight">
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
                {t('invoiceGenerator')}
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-12 leading-relaxed px-4 max-w-3xl mx-auto">
              {t('createProfessionalQuotes')}
              <span className="block mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent font-semibold">
                {t('generateManageShare')}
              </span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4 mb-8 sm:mb-12">
              <button
                onClick={handleCreateRoadmap}
                className="group relative bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-2 hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 relative z-10" />
                <span className="relative z-10">Créer une Roadmap</span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              </button>

              <button
                onClick={handleCreateWithAI}
                className="group relative bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl hover:shadow-emerald-500/25 transform hover:-translate-y-2 hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Zap className="w-6 h-6 sm:w-7 sm:h-7 relative z-10 animate-pulse" />
                <span className="relative z-10">{t('createWithAI')}</span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              </button>

              <button
                onClick={handleCreateNew}
                className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-2 hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Plus className="w-6 h-6 sm:w-7 sm:h-7 relative z-10" />
                <span className="relative z-10">{t('createManually')}</span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              {t('everythingYouNeed')}
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto px-4">
              {t('completeInvoiceSolution')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="group relative bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 border border-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                  <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{t('aiGeneratorFeature')}</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  {t('aiGeneratorDesc')}
                </p>
              </div>
            </div>
            
            <div className="group relative bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 border border-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                  <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{t('quickCreation')}</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  {t('quickCreationDesc')}
                </p>
              </div>
            </div>
            
            <div className="group relative bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 border border-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{t('integratedAI')}</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  {t('integratedAIDesc')}
                </p>
              </div>
            </div>
            
            <div className="group relative bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 border border-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                  <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{t('pdfExport')}</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  {t('pdfExportDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Privacy Section */}
      <section className="py-16 sm:py-20 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl shadow-2xl border-2 border-green-200 p-8 sm:p-12">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                100% Sécurisé et Confidentiel
              </h2>
              <p className="text-lg sm:text-xl text-gray-700 max-w-3xl">
                Votre confidentialité est notre priorité absolue
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Aucune sauvegarde</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Vos données ne sont <strong>jamais enregistrées</strong> dans notre base de données. Tout reste sur votre appareil.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">100% Privé</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Aucune information personnelle collectée. Vos devis et roadmaps restent <strong>strictement confidentiels</strong>.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Trash className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Aucune trace</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Dès que vous fermez votre navigateur, <strong>toutes vos données disparaissent</strong>. Zéro trace, zéro risque.
                </p>
              </div>
            </div>

            <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-green-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2 text-lg">Service 100% Gratuit et Open Source</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Aucun compte requis, aucun abonnement, aucune carte bancaire. Utilisez notre générateur de devis et roadmaps librement et en toute sécurité. Vos documents PDF sont générés directement dans votre navigateur, rien n'est envoyé à nos serveurs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Modal AI Generator */}
      {showAIGenerator && (
        <AIServiceGenerator
          onGenerateServices={handleGenerateAIServices}
          onClose={() => setShowAIGenerator(false)}
        />
      )}
    </div>
  );
}

export default App;