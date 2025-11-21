import React, { createContext, useContext, useState, useEffect } from 'react';

// Types pour les langues supportées
export type Language = 'fr' | 'en' | 'de' | 'es' | 'it';

// Interface pour les traductions
interface Translations {
  [key: string]: {
    [K in Language]: string;
  };
}

// Toutes les traductions pour l'application
const translations: Translations = {
  // Navigation et interface générale
  invoiceGenerator: {
    fr: 'Générateur de Devis',
    en: 'Invoice Generator',
    de: 'Angebotsgenerator',
    es: 'Generador de Presupuestos',
    it: 'Generatore di Preventivi'
  },
  backToHome: {
    fr: 'Retour à l\'accueil',
    en: 'Back to Home',
    de: 'Zurück zur Startseite',
    es: 'Volver al Inicio',
    it: 'Torna alla Home'
  },
  back: {
    fr: 'Retour',
    en: 'Back',
    de: 'Zurück',
    es: 'Volver',
    it: 'Indietro'
  },
  ranking: {
    fr: 'Classement',
    en: 'Ranking',
    de: 'Rangliste',
    es: 'Clasificación',
    it: 'Classifica'
  },
  gallery: {
    fr: 'Galerie',
    en: 'Gallery',
    de: 'Galerie',
    es: 'Galería',
    it: 'Galleria'
  },
  aiGenerator: {
    fr: 'IA',
    en: 'AI',
    de: 'KI',
    es: 'IA',
    it: 'IA'
  },
  newInvoice: {
    fr: 'Nouveau',
    en: 'New',
    de: 'Neu',
    es: 'Nuevo',
    it: 'Nuovo'
  },

  // Page d'accueil
  createProfessionalQuotes: {
    fr: 'Créez des devis professionnels avec l\'intelligence artificielle.',
    en: 'Create professional quotes with artificial intelligence.',
    de: 'Erstellen Sie professionelle Angebote mit künstlicher Intelligenz.',
    es: 'Crea presupuestos profesionales con inteligencia artificial.',
    it: 'Crea preventivi professionali con intelligenza artificiale.'
  },
  generateManageShare: {
    fr: 'Générez, gérez et partagez vos devis avec une interface moderne et intuitive.',
    en: 'Generate, manage and share your quotes with a modern and intuitive interface.',
    de: 'Generieren, verwalten und teilen Sie Ihre Angebote mit einer modernen und intuitiven Benutzeroberfläche.',
    es: 'Genera, gestiona y comparte tus presupuestos con una interfaz moderna e intuitiva.',
    it: 'Genera, gestisci e condividi i tuoi preventivi con un\'interfaccia moderna e intuitiva.'
  },
  createWithAI: {
    fr: 'Créer avec l\'IA',
    en: 'Create with AI',
    de: 'Mit KI erstellen',
    es: 'Crear con IA',
    it: 'Crea con IA'
  },
  createManually: {
    fr: 'Créer manuellement',
    en: 'Create manually',
    de: 'Manuell erstellen',
    es: 'Crear manualmente',
    it: 'Crea manualmente'
  },
  viewPublicGallery: {
    fr: 'Voir la galerie publique',
    en: 'View public gallery',
    de: 'Öffentliche Galerie anzeigen',
    es: 'Ver galería pública',
    it: 'Visualizza galleria pubblica'
  },
  connectedToSupabase: {
    fr: 'Connecté à Supabase - Tous les devis sont automatiquement publics et partagés',
    en: 'Connected to Supabase - All quotes are automatically public and shared',
    de: 'Mit Supabase verbunden - Alle Angebote sind automatisch öffentlich und geteilt',
    es: 'Conectado a Supabase - Todos los presupuestos son automáticamente públicos y compartidos',
    it: 'Connesso a Supabase - Tutti i preventivi sono automaticamente pubblici e condivisi'
  },
  everythingYouNeed: {
    fr: 'Tout ce dont vous avez besoin',
    en: 'Everything you need',
    de: 'Alles was Sie brauchen',
    es: 'Todo lo que necesitas',
    it: 'Tutto ciò di cui hai bisogno'
  },
  completeInvoiceSolution: {
    fr: 'Une solution complète pour gérer vos devis et factures avec style et efficacité',
    en: 'A complete solution to manage your quotes and invoices with style and efficiency',
    de: 'Eine vollständige Lösung zur stilvollen und effizienten Verwaltung Ihrer Angebote und Rechnungen',
    es: 'Una solución completa para gestionar tus presupuestos y facturas con estilo y eficiencia',
    it: 'Una soluzione completa per gestire i tuoi preventivi e fatture con stile ed efficienza'
  },

  // Création rapide
  quickCreateTitle: {
    fr: 'Créer un devis rapidement',
    en: 'Create a quote quickly',
    de: 'Schnell ein Angebot erstellen',
    es: 'Crear un presupuesto rápidamente',
    it: 'Crea un preventivo velocemente'
  },
  quickCreatePlaceholder: {
    fr: 'Décrivez votre projet... (ex: Site web e-commerce avec paiement en ligne)',
    en: 'Describe your project... (e.g.: E-commerce website with online payment)',
    de: 'Beschreiben Sie Ihr Projekt... (z.B.: E-Commerce-Website mit Online-Zahlung)',
    es: 'Describe tu proyecto... (ej: Sitio web de comercio electrónico con pago en línea)',
    it: 'Descrivi il tuo progetto... (es: Sito web e-commerce con pagamento online)'
  },
  quickCreateButton: {
    fr: 'Créer le devis',
    en: 'Create quote',
    de: 'Angebot erstellen',
    es: 'Crear presupuesto',
    it: 'Crea preventivo'
  },

  // Devises
  currency: {
    fr: '€',
    en: '€',
    de: '€',
    es: '€',
    it: '€'
  },
  currencyEUR: {
    fr: '€',
    en: '€',
    de: '€',
    es: '€',
    it: '€'
  },
  currencyCHF: {
    fr: 'CHF',
    en: 'CHF',
    de: 'CHF',
    es: 'CHF',
    it: 'CHF'
  },
  selectCurrency: {
    fr: 'Devise',
    en: 'Currency',
    de: 'Währung',
    es: 'Moneda',
    it: 'Valuta'
  },
  euro: {
    fr: 'Euro (€)',
    en: 'Euro (€)',
    de: 'Euro (€)',
    es: 'Euro (€)',
    it: 'Euro (€)'
  },
  swissFranc: {
    fr: 'Franc Suisse (CHF)',
    en: 'Swiss Franc (CHF)',
    de: 'Schweizer Franken (CHF)',
    es: 'Franco Suizo (CHF)',
    it: 'Franco Svizzero (CHF)'
  },

  // Fonctionnalités
  aiGeneratorFeature: {
    fr: 'Générateur IA',
    en: 'AI Generator',
    de: 'KI-Generator',
    es: 'Generador IA',
    it: 'Generatore IA'
  },
  aiGeneratorDesc: {
    fr: 'Générez des projets complets en décrivant simplement vos besoins. L\'IA propose tous les services nécessaires',
    en: 'Generate complete projects by simply describing your needs. AI suggests all necessary services',
    de: 'Generieren Sie vollständige Projekte, indem Sie einfach Ihre Bedürfnisse beschreiben. KI schlägt alle notwendigen Dienstleistungen vor',
    es: 'Genera proyectos completos simplemente describiendo tus necesidades. La IA sugiere todos los servicios necesarios',
    it: 'Genera progetti completi semplicemente descrivendo le tue esigenze. L\'IA suggerisce tutti i servizi necessari'
  },
  quickCreation: {
    fr: 'Création rapide',
    en: 'Quick creation',
    de: 'Schnelle Erstellung',
    es: 'Creación rápida',
    it: 'Creazione rapida'
  },
  quickCreationDesc: {
    fr: 'Interface intuitive pour créer des devis professionnels en quelques minutes avec des modèles prêts à l\'emploi',
    en: 'Intuitive interface to create professional quotes in minutes with ready-to-use templates',
    de: 'Intuitive Benutzeroberfläche zur Erstellung professioneller Angebote in wenigen Minuten mit gebrauchsfertigen Vorlagen',
    es: 'Interfaz intuitiva para crear presupuestos profesionales en minutos con plantillas listas para usar',
    it: 'Interfaccia intuitiva per creare preventivi professionali in pochi minuti con modelli pronti all\'uso'
  },
  integratedAI: {
    fr: 'IA intégrée',
    en: 'Integrated AI',
    de: 'Integrierte KI',
    es: 'IA integrada',
    it: 'IA integrata'
  },
  integratedAIDesc: {
    fr: 'Suggestions intelligentes pour vos services et descriptions grâce à l\'intelligence artificielle avancée',
    en: 'Smart suggestions for your services and descriptions thanks to advanced artificial intelligence',
    de: 'Intelligente Vorschläge für Ihre Dienstleistungen und Beschreibungen dank fortschrittlicher künstlicher Intelligenz',
    es: 'Sugerencias inteligentes para tus servicios y descripciones gracias a la inteligencia artificial avanzada',
    it: 'Suggerimenti intelligenti per i tuoi servizi e descrizioni grazie all\'intelligenza artificiale avanzata'
  },
  pdfExport: {
    fr: 'Export PDF',
    en: 'PDF Export',
    de: 'PDF-Export',
    es: 'Exportar PDF',
    it: 'Esporta PDF'
  },
  pdfExportDesc: {
    fr: 'Générez et partagez vos devis au format PDF professionnel en un seul clic avec mise en page optimisée',
    en: 'Generate and share your quotes in professional PDF format with one click and optimized layout',
    de: 'Generieren und teilen Sie Ihre Angebote im professionellen PDF-Format mit einem Klick und optimiertem Layout',
    es: 'Genera y comparte tus presupuestos en formato PDF profesional con un clic y diseño optimizado',
    it: 'Genera e condividi i tuoi preventivi in formato PDF professionale con un clic e layout ottimizzato'
  },

  // Section des devis
  myInvoices: {
    fr: 'Mes devis',
    en: 'My quotes',
    de: 'Meine Angebote',
    es: 'Mis presupuestos',
    it: 'I miei preventivi'
  },
  manageTrackInvoices: {
    fr: 'Gérez et suivez tous vos devis',
    en: 'Manage and track all your quotes',
    de: 'Verwalten und verfolgen Sie alle Ihre Angebote',
    es: 'Gestiona y rastrea todos tus presupuestos',
    it: 'Gestisci e traccia tutti i tuoi preventivi'
  },
  viewAllPublicInvoices: {
    fr: 'Voir tous les devis publics',
    en: 'View all public quotes',
    de: 'Alle öffentlichen Angebote anzeigen',
    es: 'Ver todos los presupuestos públicos',
    it: 'Visualizza tutti i preventivi pubblici'
  },
  newQuote: {
    fr: 'Nouveau devis',
    en: 'New quote',
    de: 'Neues Angebot',
    es: 'Nuevo presupuesto',
    it: 'Nuovo preventivo'
  },
  client: {
    fr: 'Client',
    en: 'Client',
    de: 'Kunde',
    es: 'Cliente',
    it: 'Cliente'
  },
  viewQuote: {
    fr: 'Voir',
    en: 'View',
    de: 'Anzeigen',
    es: 'Ver',
    it: 'Visualizza'
  },
  modify: {
    fr: 'Modifier',
    en: 'Edit',
    de: 'Bearbeiten',
    es: 'Modificar',
    it: 'Modifica'
  },

  // Messages d'erreur et confirmations
  errorSaving: {
    fr: 'Erreur lors de la sauvegarde du devis. Veuillez réessayer.',
    en: 'Error saving the quote. Please try again.',
    de: 'Fehler beim Speichern des Angebots. Bitte versuchen Sie es erneut.',
    es: 'Error al guardar el presupuesto. Por favor, inténtalo de nuevo.',
    it: 'Errore nel salvare il preventivo. Riprova.'
  },
  confirmDelete: {
    fr: 'Êtes-vous sûr de vouloir supprimer ce devis',
    en: 'Are you sure you want to delete this quote',
    de: 'Sind Sie sicher, dass Sie dieses Angebot löschen möchten',
    es: '¿Estás seguro de que quieres eliminar este presupuesto',
    it: 'Sei sicuro di voler eliminare questo preventivo'
  },
  errorDeleting: {
    fr: 'Erreur lors de la suppression du devis. Veuillez réessayer.',
    en: 'Error deleting the quote. Please try again.',
    de: 'Fehler beim Löschen des Angebots. Bitte versuchen Sie es erneut.',
    es: 'Error al eliminar el presupuesto. Por favor, inténtalo de nuevo.',
    it: 'Errore nell\'eliminare il preventivo. Riprova.'
  },

  // Pays
  france: {
    fr: 'France',
    en: 'France',
    de: 'Frankreich',
    es: 'Francia',
    it: 'Francia'
  },

  // Formulaire de devis
  newInvoiceTitle: {
    fr: 'Nouveau devis',
    en: 'New quote',
    de: 'Neues Angebot',
    es: 'Nuevo presupuesto',
    it: 'Nuovo preventivo'
  },
  editInvoiceTitle: {
    fr: 'Modifier le devis',
    en: 'Edit quote',
    de: 'Angebot bearbeiten',
    es: 'Editar presupuesto',
    it: 'Modifica preventivo'
  },
  save: {
    fr: 'Enregistrer',
    en: 'Save',
    de: 'Speichern',
    es: 'Guardar',
    it: 'Salva'
  },
  generalInformation: {
    fr: 'Informations générales',
    en: 'General information',
    de: 'Allgemeine Informationen',
    es: 'Información general',
    it: 'Informazioni generali'
  },
  quoteNumber: {
    fr: 'Numéro de devis',
    en: 'Quote number',
    de: 'Angebotsnummer',
    es: 'Número de presupuesto',
    it: 'Numero preventivo'
  },
  date: {
    fr: 'Date',
    en: 'Date',
    de: 'Datum',
    es: 'Fecha',
    it: 'Data'
  },
  companyInformation: {
    fr: 'Informations entreprise',
    en: 'Company information',
    de: 'Unternehmensinformationen',
    es: 'Información de la empresa',
    it: 'Informazioni azienda'
  },
  chooseCompany: {
    fr: 'Choisir une entreprise',
    en: 'Choose a company',
    de: 'Unternehmen wählen',
    es: 'Elegir una empresa',
    it: 'Scegli un\'azienda'
  },
  recentCompanies: {
    fr: 'Entreprises récentes:',
    en: 'Recent companies:',
    de: 'Aktuelle Unternehmen:',
    es: 'Empresas recientes:',
    it: 'Aziende recenti:'
  },
  companyLogo: {
    fr: 'Logo de l\'entreprise',
    en: 'Company logo',
    de: 'Firmenlogo',
    es: 'Logo de la empresa',
    it: 'Logo aziendale'
  },
  changeLogo: {
    fr: 'Changer le logo',
    en: 'Change logo',
    de: 'Logo ändern',
    es: 'Cambiar logo',
    it: 'Cambia logo'
  },
  addLogo: {
    fr: 'Ajouter un logo',
    en: 'Add logo',
    de: 'Logo hinzufügen',
    es: 'Añadir logo',
    it: 'Aggiungi logo'
  },
  logoFormats: {
    fr: 'Formats: JPG, PNG, SVG (max 2MB)',
    en: 'Formats: JPG, PNG, SVG (max 2MB)',
    de: 'Formate: JPG, PNG, SVG (max 2MB)',
    es: 'Formatos: JPG, PNG, SVG (máx 2MB)',
    it: 'Formati: JPG, PNG, SVG (max 2MB)'
  },
  companyName: {
    fr: 'Nom de l\'entreprise',
    en: 'Company name',
    de: 'Firmenname',
    es: 'Nombre de la empresa',
    it: 'Nome azienda'
  },
  email: {
    fr: 'Email',
    en: 'Email',
    de: 'E-Mail',
    es: 'Email',
    it: 'Email'
  },
  address: {
    fr: 'Adresse',
    en: 'Address',
    de: 'Adresse',
    es: 'Dirección',
    it: 'Indirizzo'
  },
  city: {
    fr: 'Ville',
    en: 'City',
    de: 'Stadt',
    es: 'Ciudad',
    it: 'Città'
  },
  postalCode: {
    fr: 'Code postal',
    en: 'Postal code',
    de: 'Postleitzahl',
    es: 'Código postal',
    it: 'Codice postale'
  },
  phone: {
    fr: 'Téléphone',
    en: 'Phone',
    de: 'Telefon',
    es: 'Teléfono',
    it: 'Telefono'
  },
  clientInformation: {
    fr: 'Informations client',
    en: 'Client information',
    de: 'Kundeninformationen',
    es: 'Información del cliente',
    it: 'Informazioni cliente'
  },
  chooseClient: {
    fr: 'Choisir un client',
    en: 'Choose a client',
    de: 'Kunde wählen',
    es: 'Elegir un cliente',
    it: 'Scegli un cliente'
  },
  recentClients: {
    fr: 'Clients récents:',
    en: 'Recent clients:',
    de: 'Aktuelle Kunden:',
    es: 'Clientes recientes:',
    it: 'Clienti recenti:'
  },
  clientName: {
    fr: 'Nom du client',
    en: 'Client name',
    de: 'Kundenname',
    es: 'Nombre del cliente',
    it: 'Nome cliente'
  },
  articlesServices: {
    fr: 'Articles / Services',
    en: 'Articles / Services',
    de: 'Artikel / Dienstleistungen',
    es: 'Artículos / Servicios',
    it: 'Articoli / Servizi'
  },
  aiCompleteProject: {
    fr: 'IA Projet Complet',
    en: 'AI Complete Project',
    de: 'KI Vollständiges Projekt',
    es: 'IA Proyecto Completo',
    it: 'IA Progetto Completo'
  },
  chooseService: {
    fr: 'Choisir un service',
    en: 'Choose a service',
    de: 'Service wählen',
    es: 'Elegir un servicio',
    it: 'Scegli un servizio'
  },
  add: {
    fr: 'Ajouter',
    en: 'Add',
    de: 'Hinzufügen',
    es: 'Añadir',
    it: 'Aggiungi'
  },
  recentServices: {
    fr: 'Services récents:',
    en: 'Recent services:',
    de: 'Aktuelle Services:',
    es: 'Servicios recientes:',
    it: 'Servizi recenti:'
  },
  service: {
    fr: 'Service',
    en: 'Service',
    de: 'Service',
    es: 'Servicio',
    it: 'Servizio'
  },
  included: {
    fr: 'Inclus',
    en: 'Included',
    de: 'Inbegriffen',
    es: 'Incluido',
    it: 'Incluso'
  },
  aiService: {
    fr: 'IA Service',
    en: 'AI Service',
    de: 'KI Service',
    es: 'IA Servicio',
    it: 'IA Servizio'
  },
  aiDesc: {
    fr: 'IA Desc',
    en: 'AI Desc',
    de: 'KI Besch',
    es: 'IA Desc',
    it: 'IA Desc'
  },
  serviceName: {
    fr: 'Nom du service',
    en: 'Service name',
    de: 'Service-Name',
    es: 'Nombre del servicio',
    it: 'Nome servizio'
  },
  description: {
    fr: 'Description',
    en: 'Description',
    de: 'Beschreibung',
    es: 'Descripción',
    it: 'Descrizione'
  },
  quantity: {
    fr: 'Quantité',
    en: 'Quantity',
    de: 'Menge',
    es: 'Cantidad',
    it: 'Quantità'
  },
  unitPrice: {
    fr: 'Prix unitaire',
    en: 'Unit price',
    de: 'Stückpreis',
    es: 'Precio unitario',
    it: 'Prezzo unitario'
  },
  total: {
    fr: 'Total',
    en: 'Total',
    de: 'Gesamt',
    es: 'Total',
    it: 'Totale'
  },
  financialSummary: {
    fr: 'Récapitulatif Financier',
    en: 'Financial Summary',
    de: 'Finanzielle Zusammenfassung',
    es: 'Resumen Financiero',
    it: 'Riepilogo Finanziario'
  },
  paidServices: {
    fr: 'Services payants',
    en: 'Paid services',
    de: 'Kostenpflichtige Services',
    es: 'Servicios de pago',
    it: 'Servizi a pagamento'
  },
  includedServices: {
    fr: 'Services inclus',
    en: 'Included services',
    de: 'Inbegriffene Services',
    es: 'Servicios incluidos',
    it: 'Servizi inclusi'
  },
  subtotal: {
    fr: 'Sous-total:',
    en: 'Subtotal:',
    de: 'Zwischensumme:',
    es: 'Subtotal:',
    it: 'Subtotale:'
  },
  vat: {
    fr: 'TVA:',
    en: 'VAT:',
    de: 'MwSt:',
    es: 'IVA:',
    it: 'IVA:'
  },
  totalTTC: {
    fr: 'Total TTC',
    en: 'Total incl. VAT',
    de: 'Gesamt inkl. MwSt',
    es: 'Total con IVA',
    it: 'Totale IVA incl.'
  },
  notesAdditionalInfo: {
    fr: 'Notes et informations supplémentaires',
    en: 'Notes and additional information',
    de: 'Notizen und zusätzliche Informationen',
    es: 'Notas e información adicional',
    it: 'Note e informazioni aggiuntive'
  },
  generateAISummary: {
    fr: 'Générer résumé IA',
    en: 'Generate AI summary',
    de: 'KI-Zusammenfassung generieren',
    es: 'Generar resumen IA',
    it: 'Genera riassunto IA'
  },
  commercialNotes: {
    fr: 'Notes commerciales',
    en: 'Commercial notes',
    de: 'Kommerzielle Notizen',
    es: 'Notas comerciales',
    it: 'Note commerciali'
  },
  additionalInformation: {
    fr: 'Informations supplémentaires',
    en: 'Additional information',
    de: 'Zusätzliche Informationen',
    es: 'Información adicional',
    it: 'Informazioni aggiuntive'
  },
  paymentConditions: {
    fr: 'Conditions de paiement, délais, etc...',
    en: 'Payment conditions, deadlines, etc...',
    de: 'Zahlungsbedingungen, Fristen, etc...',
    es: 'Condiciones de pago, plazos, etc...',
    it: 'Condizioni di pagamento, scadenze, ecc...'
  },
  cancel: {
    fr: 'Annuler',
    en: 'Cancel',
    de: 'Abbrechen',
    es: 'Cancelar',
    it: 'Annulla'
  },
  update: {
    fr: 'Mettre à jour',
    en: 'Update',
    de: 'Aktualisieren',
    es: 'Actualizar',
    it: 'Aggiorna'
  },
  createQuote: {
    fr: 'Créer le devis',
    en: 'Create quote',
    de: 'Angebot erstellen',
    es: 'Crear presupuesto',
    it: 'Crea preventivo'
  },

  // Aperçu du devis
  edit: {
    fr: 'Modifier',
    en: 'Edit',
    de: 'Bearbeiten',
    es: 'Editar',
    it: 'Modifica'
  },
  print: {
    fr: 'Imprimer',
    en: 'Print',
    de: 'Drucken',
    es: 'Imprimir',
    it: 'Stampa'
  },
  pdf: {
    fr: 'PDF',
    en: 'PDF',
    de: 'PDF',
    es: 'PDF',
    it: 'PDF'
  },
  share: {
    fr: 'Partager',
    en: 'Share',
    de: 'Teilen',
    es: 'Compartir',
    it: 'Condividi'
  },
  copied: {
    fr: 'Copié !',
    en: 'Copied!',
    de: 'Kopiert!',
    es: '¡Copiado!',
    it: 'Copiato!'
  },
  publicLinkGenerated: {
    fr: 'Lien public généré - Partagez ce devis avec votre client',
    en: 'Public link generated - Share this quote with your client',
    de: 'Öffentlicher Link generiert - Teilen Sie dieses Angebot mit Ihrem Kunden',
    es: 'Enlace público generado - Comparte este presupuesto con tu cliente',
    it: 'Link pubblico generato - Condividi questo preventivo con il tuo cliente'
  },
  copy: {
    fr: 'Copier',
    en: 'Copy',
    de: 'Kopieren',
    es: 'Copiar',
    it: 'Copia'
  },

  // PDF - Contenu du devis
  quoteNo: {
    fr: 'Devis N°:',
    en: 'Quote No:',
    de: 'Angebot Nr.:',
    es: 'Presupuesto N°:',
    it: 'Preventivo N°:'
  },
  quoteFrom: {
    fr: 'Devis de:',
    en: 'Quote from:',
    de: 'Angebot von:',
    es: 'Presupuesto de:',
    it: 'Preventivo da:'
  },
  quoteFor: {
    fr: 'Devis pour:',
    en: 'Quote for:',
    de: 'Angebot für:',
    es: 'Presupuesto para:',
    it: 'Preventivo per:'
  },
  reference: {
    fr: 'Référence:',
    en: 'Reference:',
    de: 'Referenz:',
    es: 'Referencia:',
    it: 'Riferimento:'
  },
  projectDuration: {
    fr: 'Durée du projet:',
    en: 'Project duration:',
    de: 'Projektdauer:',
    es: 'Duración del proyecto:',
    it: 'Durata progetto:'
  },
  days: {
    fr: 'jours',
    en: 'days',
    de: 'Tage',
    es: 'días',
    it: 'giorni'
  },
  proposedServices: {
    fr: 'Services proposés',
    en: 'Proposed services',
    de: 'Vorgeschlagene Dienstleistungen',
    es: 'Servicios propuestos',
    it: 'Servizi proposti'
  },
  qty: {
    fr: 'QTÉ',
    en: 'QTY',
    de: 'MENGE',
    es: 'CANT',
    it: 'QTÀ'
  },
  price: {
    fr: 'Prix',
    en: 'Price',
    de: 'Preis',
    es: 'Precio',
    it: 'Prezzo'
  },
  serviceIncluded: {
    fr: 'Service inclus',
    en: 'Service included',
    de: 'Service inbegriffen',
    es: 'Servicio incluido',
    it: 'Servizio incluso'
  },
  completeDetails: {
    fr: 'Détails complets',
    en: 'Complete details',
    de: 'Vollständige Details',
    es: 'Detalles completos',
    it: 'Dettagli completi'
  },
  detailedFinancialSummary: {
    fr: 'Récapitulatif financier détaillé',
    en: 'Detailed financial summary',
    de: 'Detaillierte Finanzübersicht',
    es: 'Resumen financiero detallado',
    it: 'Riepilogo finanziario dettagliato'
  },
  billedServices: {
    fr: 'Services facturés',
    en: 'Billed services',
    de: 'Abgerechnete Services',
    es: 'Servicios facturados',
    it: 'Servizi fatturati'
  },
  subtotalHT: {
    fr: 'Sous-total HT:',
    en: 'Subtotal excl. VAT:',
    de: 'Zwischensumme ohne MwSt:',
    es: 'Subtotal sin IVA:',
    it: 'Subtotale escl. IVA:'
  },
  offeredServices: {
    fr: 'Services inclus (offerts)',
    en: 'Included services (offered)',
    de: 'Inbegriffene Services (angeboten)',
    es: 'Servicios incluidos (ofrecidos)',
    it: 'Servizi inclusi (offerti)'
  },
  offeredInProposal: {
    fr: 'Ces services sont offerts dans le cadre de cette proposition commerciale',
    en: 'These services are offered as part of this commercial proposal',
    de: 'Diese Services werden im Rahmen dieses Geschäftsvorschlags angeboten',
    es: 'Estos servicios se ofrecen como parte de esta propuesta comercial',
    it: 'Questi servizi sono offerti come parte di questa proposta commerciale'
  },
  notesAndInformation: {
    fr: 'Notes et informations',
    en: 'Notes and information',
    de: 'Notizen und Informationen',
    es: 'Notas e información',
    it: 'Note e informazioni'
  },
  quoteValidFor30Days: {
    fr: 'Ce devis est valable 30 jours à compter de la date d\'émission.',
    en: 'This quote is valid for 30 days from the date of issue.',
    de: 'Dieses Angebot ist 30 Tage ab Ausstellungsdatum gültig.',
    es: 'Este presupuesto es válido por 30 días desde la fecha de emisión.',
    it: 'Questo preventivo è valido per 30 giorni dalla data di emissione.'
  },
  tel: {
    fr: 'Tél:',
    en: 'Tel:',
    de: 'Tel:',
    es: 'Tel:',
    it: 'Tel:'
  },

  // Galerie publique
  publicQuoteGallery: {
    fr: 'Galerie Publique des Devis',
    en: 'Public Quote Gallery',
    de: 'Öffentliche Angebotsgalerie',
    es: 'Galería Pública de Presupuestos',
    it: 'Galleria Pubblica Preventivi'
  },
  discoverAllQuotes: {
    fr: 'Découvrez tous les devis créés avec notre plateforme. Transparence et inspiration pour vos projets.',
    en: 'Discover all quotes created with our platform. Transparency and inspiration for your projects.',
    de: 'Entdecken Sie alle mit unserer Plattform erstellten Angebote. Transparenz und Inspiration für Ihre Projekte.',
    es: 'Descubre todos los presupuestos creados con nuestra plataforma. Transparencia e inspiración para tus proyectos.',
    it: 'Scopri tutti i preventivi creati con la nostra piattaforma. Trasparenza e ispirazione per i tuoi progetti.'
  },
  quotesCreated: {
    fr: 'Devis créés',
    en: 'Quotes created',
    de: 'Angebote erstellt',
    es: 'Presupuestos creados',
    it: 'Preventivi creati'
  },
  totalAmount: {
    fr: 'Montant total',
    en: 'Total amount',
    de: 'Gesamtbetrag',
    es: 'Monto total',
    it: 'Importo totale'
  },
  averageAmount: {
    fr: 'Montant moyen',
    en: 'Average amount',
    de: 'Durchschnittsbetrag',
    es: 'Monto promedio',
    it: 'Importo medio'
  },
  thisMonth: {
    fr: 'Ce mois-ci',
    en: 'This month',
    de: 'Diesen Monat',
    es: 'Este mes',
    it: 'Questo mese'
  },
  searchByClient: {
    fr: 'Rechercher par client, numéro...',
    en: 'Search by client, number...',
    de: 'Nach Kunde, Nummer suchen...',
    es: 'Buscar por cliente, número...',
    it: 'Cerca per cliente, numero...'
  },
  noQuotesFound: {
    fr: 'Aucun devis trouvé',
    en: 'No quotes found',
    de: 'Keine Angebote gefunden',
    es: 'No se encontraron presupuestos',
    it: 'Nessun preventivo trovato'
  },
  tryOtherTerms: {
    fr: 'Essayez avec d\'autres termes de recherche',
    en: 'Try with other search terms',
    de: 'Versuchen Sie es mit anderen Suchbegriffen',
    es: 'Prueba con otros términos de búsqueda',
    it: 'Prova con altri termini di ricerca'
  },
  noPublicQuotes: {
    fr: 'Aucun devis public',
    en: 'No public quotes',
    de: 'Keine öffentlichen Angebote',
    es: 'No hay presupuestos públicos',
    it: 'Nessun preventivo pubblico'
  },
  quotesWillAppear: {
    fr: 'Les devis créés apparaîtront ici automatiquement',
    en: 'Created quotes will appear here automatically',
    de: 'Erstellte Angebote werden hier automatisch angezeigt',
    es: 'Los presupuestos creados aparecerán aquí automáticamente',
    it: 'I preventivi creati appariranno qui automaticamente'
  },
  public: {
    fr: 'Public',
    en: 'Public',
    de: 'Öffentlich',
    es: 'Público',
    it: 'Pubblico'
  },
  company: {
    fr: 'Entreprise:',
    en: 'Company:',
    de: 'Unternehmen:',
    es: 'Empresa:',
    it: 'Azienda:'
  },
  viewQuoteButton: {
    fr: 'Voir le devis',
    en: 'View quote',
    de: 'Angebot anzeigen',
    es: 'Ver presupuesto',
    it: 'Visualizza preventivo'
  },

  // Classement
  championRanking: {
    fr: 'Classement des Champions',
    en: 'Champions Ranking',
    de: 'Champions-Rangliste',
    es: 'Clasificación de Campeones',
    it: 'Classifica Campioni'
  },
  discoverTopCompanies: {
    fr: 'Découvrez les entreprises qui génèrent le plus de chiffre d\'affaires avec notre plateforme',
    en: 'Discover the companies that generate the most revenue with our platform',
    de: 'Entdecken Sie die Unternehmen, die mit unserer Plattform den höchsten Umsatz erzielen',
    es: 'Descubre las empresas que generan más ingresos con nuestra plataforma',
    it: 'Scopri le aziende che generano più fatturato con la nostra piattaforma'
  },
  totalRevenue: {
    fr: 'Chiffre d\'affaires total',
    en: 'Total revenue',
    de: 'Gesamtumsatz',
    es: 'Ingresos totales',
    it: 'Fatturato totale'
  },
  activeCompanies: {
    fr: 'Entreprises actives',
    en: 'Active companies',
    de: 'Aktive Unternehmen',
    es: 'Empresas activas',
    it: 'Aziende attive'
  },
  quotesGenerated: {
    fr: 'Devis générés',
    en: 'Quotes generated',
    de: 'Angebote generiert',
    es: 'Presupuestos generados',
    it: 'Preventivi generati'
  },
  championsPodium: {
    fr: 'Podium des Champions',
    en: 'Champions Podium',
    de: 'Champions-Podium',
    es: 'Podio de Campeones',
    it: 'Podio Campioni'
  },
  topThreeCompanies: {
    fr: 'Les 3 entreprises qui dominent le classement',
    en: 'The 3 companies that dominate the ranking',
    de: 'Die 3 Unternehmen, die die Rangliste dominieren',
    es: 'Las 3 empresas que dominan la clasificación',
    it: 'Le 3 aziende che dominano la classifica'
  },
  viceChampion: {
    fr: 'Vice-Champion',
    en: 'Vice-Champion',
    de: 'Vize-Champion',
    es: 'Subcampeón',
    it: 'Vice-Campione'
  },
  champion: {
    fr: 'Champion',
    en: 'Champion',
    de: 'Champion',
    es: 'Campeón',
    it: 'Campione'
  },
  thirdPlace: {
    fr: '3ème Place',
    en: '3rd Place',
    de: '3. Platz',
    es: '3er Lugar',
    it: '3° Posto'
  },
  quotes: {
    fr: 'devis',
    en: 'quotes',
    de: 'Angebote',
    es: 'presupuestos',
    it: 'preventivi'
  },
  completeRanking: {
    fr: 'Classement Complet',
    en: 'Complete Ranking',
    de: 'Vollständige Rangliste',
    es: 'Clasificación Completa',
    it: 'Classifica Completa'
  },
  allCompaniesByRevenue: {
    fr: 'Toutes les entreprises classées par chiffre d\'affaires',
    en: 'All companies ranked by revenue',
    de: 'Alle Unternehmen nach Umsatz geordnet',
    es: 'Todas las empresas clasificadas por ingresos',
    it: 'Tutte le aziende classificate per fatturato'
  },
  noDataAvailable: {
    fr: 'Aucune donnée disponible',
    en: 'No data available',
    de: 'Keine Daten verfügbar',
    es: 'No hay datos disponibles',
    it: 'Nessun dato disponibile'
  },
  rankingWillAppear: {
    fr: 'Le classement apparaîtra dès que des devis seront créés',
    en: 'The ranking will appear as soon as quotes are created',
    de: 'Die Rangliste wird angezeigt, sobald Angebote erstellt werden',
    es: 'La clasificación aparecerá tan pronto como se creen presupuestos',
    it: 'La classifica apparirà non appena verranno creati i preventivi'
  },
  average: {
    fr: 'Moyenne',
    en: 'Average',
    de: 'Durchschnitt',
    es: 'Promedio',
    it: 'Media'
  },

  // Messages de chargement
  loadingQuote: {
    fr: 'Chargement du devis...',
    en: 'Loading quote...',
    de: 'Angebot wird geladen...',
    es: 'Cargando presupuesto...',
    it: 'Caricamento preventivo...'
  },
  preparingProposal: {
    fr: 'Préparation de votre proposition commerciale',
    en: 'Preparing your commercial proposal',
    de: 'Vorbereitung Ihres Geschäftsvorschlags',
    es: 'Preparando tu propuesta comercial',
    it: 'Preparazione della tua proposta commerciale'
  },
  quoteNotFound: {
    fr: 'Devis non trouvé',
    en: 'Quote not found',
    de: 'Angebot nicht gefunden',
    es: 'Presupuesto no encontrado',
    it: 'Preventivo non trovato'
  },
  quoteNotAccessible: {
    fr: 'Ce devis n\'existe pas ou n\'est plus accessible.',
    en: 'This quote does not exist or is no longer accessible.',
    de: 'Dieses Angebot existiert nicht oder ist nicht mehr zugänglich.',
    es: 'Este presupuesto no existe o ya no es accesible.',
    it: 'Questo preventivo non esiste o non è più accessibile.'
  },
  loadingPublicQuotes: {
    fr: 'Chargement des devis publics...',
    en: 'Loading public quotes...',
    de: 'Öffentliche Angebote werden geladen...',
    es: 'Cargando presupuestos públicos...',
    it: 'Caricamento preventivi pubblici...'
  },
  calculatingRanking: {
    fr: 'Calcul du classement...',
    en: 'Calculating ranking...',
    de: 'Rangliste wird berechnet...',
    es: 'Calculando clasificación...',
    it: 'Calcolo classifica...'
  },
  
  // Notes et informations supplémentaires - Exemples
  noteExample1: {
    fr: 'Conditions de paiement : 30% à la commande, 70% à la livraison. Délai de réalisation : 4-6 semaines.',
    en: 'Payment terms: 30% on order, 70% on delivery. Completion time: 4-6 weeks.',
    de: 'Zahlungsbedingungen: 30% bei Bestellung, 70% bei Lieferung. Fertigstellungszeit: 4-6 Wochen.',
    es: 'Condiciones de pago: 30% al pedido, 70% a la entrega. Tiempo de realización: 4-6 semanas.',
    it: 'Condizioni di pagamento: 30% all\'ordine, 70% alla consegna. Tempo di realizzazione: 4-6 settimane.'
  },
  noteExample2: {
    fr: 'Garantie 1 an sur tous nos développements. Support technique inclus pendant 3 mois.',
    en: '1-year warranty on all our developments. Technical support included for 3 months.',
    de: '1 Jahr Garantie auf alle unsere Entwicklungen. Technischer Support für 3 Monate inbegriffen.',
    es: 'Garantía de 1 año en todos nuestros desarrollos. Soporte técnico incluido durante 3 meses.',
    it: 'Garanzia di 1 anno su tutti i nostri sviluppi. Supporto tecnico incluso per 3 mesi.'
  },
  noteExample3: {
    fr: 'Formation utilisateur de 2h incluse. Documentation complète fournie.',
    en: '2-hour user training included. Complete documentation provided.',
    de: '2-stündige Benutzerschulung inbegriffen. Vollständige Dokumentation bereitgestellt.',
    es: 'Formación de usuario de 2h incluida. Documentación completa proporcionada.',
    it: 'Formazione utente di 2h inclusa. Documentazione completa fornita.'
  },
  noteExample4: {
    fr: 'Hébergement et maintenance non inclus dans cette offre. Devis séparé disponible sur demande.',
    en: 'Hosting and maintenance not included in this offer. Separate quote available on request.',
    de: 'Hosting und Wartung nicht in diesem Angebot enthalten. Separates Angebot auf Anfrage verfügbar.',
    es: 'Alojamiento y mantenimiento no incluidos en esta oferta. Presupuesto separado disponible bajo petición.',
    it: 'Hosting e manutenzione non inclusi in questa offerta. Preventivo separato disponibile su richiesta.'
  },
  noteExample5: {
    fr: 'Révisions illimitées pendant la phase de développement. Validation client requise à chaque étape.',
    en: 'Unlimited revisions during development phase. Client validation required at each stage.',
    de: 'Unbegrenzte Überarbeitungen während der Entwicklungsphase. Kundenvalidierung bei jedem Schritt erforderlich.',
    es: 'Revisiones ilimitadas durante la fase de desarrollo. Validación del cliente requerida en cada etapa.',
    it: 'Revisioni illimitate durante la fase di sviluppo. Validazione del cliente richiesta ad ogni fase.'
  }
};

// Interface pour le contexte de traduction
interface TranslationContextType {
  currentLanguage: Language;
  changeLanguage: (language: Language) => void;
  t: (key: string) => string;
}

// Contexte de traduction
const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Hook pour utiliser les traductions
export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

// Provider de traduction
export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'fr';
  });

  const changeLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('language', language);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[currentLanguage] || translation.fr || key;
  };

  return (
    <TranslationContext.Provider value={{ currentLanguage, changeLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

// Fonction utilitaire pour obtenir le symbole de devise
export const getCurrencySymbol = (currency: string): string => {
  switch (currency) {
    case 'EUR':
      return '€';
    case 'CHF':
      return 'CHF';
    default:
      return '€';
  }
};

// Fonction utilitaire pour formater un montant avec la devise
export const formatCurrency = (amount: number, currency: string): string => {
  const symbol = getCurrencySymbol(currency);
  return `${amount.toFixed(2)} ${symbol}`;
};

// Composant sélecteur de langue avec drapeaux
export const LanguageSelector: React.FC<{
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  className?: string;
}> = ({ currentLanguage, onLanguageChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
    { code: 'en' as Language, name: 'English', flag: '🇬🇧' },
    { code: 'de' as Language, name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
    { code: 'it' as Language, name: 'Italiano', flag: '🇮🇹' }
  ];

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
      >
        <span className="text-lg">{currentLang?.flag}</span>
        <span className="hidden sm:inline">{currentLang?.name}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => {
                  onLanguageChange(language.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${
                  currentLanguage === language.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <span className="font-medium">{language.name}</span>
                {currentLanguage === language.code && (
                  <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};