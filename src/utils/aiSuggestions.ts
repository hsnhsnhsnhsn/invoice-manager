// Simulation d'une API IA pour générer des suggestions de services
export interface ServiceSuggestion {
  name: string;
  description: string;
  price: number;
}

// Base de données de services traduits selon la langue
const getServiceSuggestionsByLanguage = (language: string): ServiceSuggestion[] => {
  const serviceDatabase: Record<string, ServiceSuggestion[]> = {
    fr: [
      // Sites Web - Gamme complète avec prix exacts
      {
        name: "Site Web One Page",
        description: "Site moderne sur une seule page avec design responsive et animations",
        price: 200
      },
      {
        name: "Site Web Vitrine",
        description: "Site vitrine professionnel 5-8 pages avec CMS et optimisation SEO",
        price: 1800
      },
      {
        name: "Site Web E-commerce",
        description: "Boutique en ligne complète avec paiement sécurisé et gestion des stocks",
        price: 2300
      },
      {
        name: "Plateforme Sur Mesure",
        description: "Application web personnalisée selon vos besoins spécifiques",
        price: 3500
      },
      {
        name: "Solution SaaS",
        description: "Plateforme SaaS complète avec abonnements et tableau de bord",
        price: 5500
      },
      {
        name: "Site de Location",
        description: "Plateforme de location avec réservations et paiements en ligne",
        price: 3500
      },
      {
        name: "Site Web Coiffure",
        description: "Site spécialisé coiffure avec prise de rendez-vous et galerie",
        price: 2500
      },
      {
        name: "Site Web Artisan",
        description: "Site professionnel artisan avec portfolio et demande de devis",
        price: 2500
      },

      // Services Premium toujours proposés
      {
        name: "Design Premium",
        description: "Design graphique haut de gamme avec identité visuelle complète",
        price: 700
      },
      {
        name: "SEO One Page",
        description: "Optimisation SEO complète pour site one page avec suivi mensuel",
        price: 600
      },
      {
        name: "SEO 1 Keyword + Backlinks",
        description: "Positionnement sur 1 mot-clé avec création de backlinks de qualité",
        price: 350
      },

      // Services spécialisés métiers
      {
        name: "Site Restaurant avec Menu",
        description: "Site restaurant avec menu interactif, réservations et commande en ligne",
        price: 2800
      },
      {
        name: "Site Cabinet Médical",
        description: "Site médical avec prise de rendez-vous et espace patient sécurisé",
        price: 3200
      },
      {
        name: "Site Immobilier",
        description: "Plateforme immobilière avec recherche avancée et visite virtuelle",
        price: 4200
      },
      {
        name: "Site École/Formation",
        description: "Plateforme éducative avec cours en ligne et suivi des étudiants",
        price: 3800
      },
      {
        name: "Site Photographe",
        description: "Portfolio photographe avec galeries haute résolution et vente en ligne",
        price: 2200
      },
      {
        name: "Site Avocat/Juridique",
        description: "Site cabinet d'avocat avec prise de rendez-vous et blog juridique",
        price: 2900
      },
      {
        name: "Site Fitness/Sport",
        description: "Site salle de sport avec planning cours et abonnements en ligne",
        price: 3100
      },
      {
        name: "Site Vétérinaire",
        description: "Site clinique vétérinaire avec prise de rendez-vous et conseils",
        price: 2700
      },
      {
        name: "Site Garage Automobile",
        description: "Site garage avec prise de rendez-vous et devis en ligne",
        price: 2400
      },
      {
        name: "Site Agence Voyage",
        description: "Plateforme voyage avec réservations et paiements sécurisés",
        price: 4500
      },
      {
        name: "Site Architecte",
        description: "Portfolio architecte avec projets 3D et demande de devis",
        price: 2800
      },
      {
        name: "Site Consultant",
        description: "Site professionnel consultant avec blog et prise de rendez-vous",
        price: 2200
      },

      // Applications mobiles
      {
        name: "Application Mobile Native",
        description: "App mobile iOS/Android avec synchronisation cloud",
        price: 4500
      },
      {
        name: "App E-commerce Mobile",
        description: "Application mobile de vente avec notifications push",
        price: 5200
      },
      {
        name: "App Réservation Mobile",
        description: "Application de réservation avec géolocalisation",
        price: 3900
      },
      {
        name: "App Fitness Mobile",
        description: "Application fitness avec suivi d'activité et coaching",
        price: 4200
      },
      {
        name: "App Restaurant Mobile",
        description: "Application restaurant avec commande et livraison",
        price: 3800
      },

      // Services marketing avancés
      {
        name: "Campagne Google Ads",
        description: "Création et gestion campagne Google Ads avec optimisation ROI",
        price: 800
      },
      {
        name: "Stratégie Réseaux Sociaux",
        description: "Gestion complète réseaux sociaux avec création de contenu",
        price: 650
      },
      {
        name: "Email Marketing Automation",
        description: "Mise en place séquences email automatisées avec analytics",
        price: 450
      },
      {
        name: "Audit SEO Complet",
        description: "Analyse technique complète avec plan d'action détaillé",
        price: 750
      },
      {
        name: "Rédaction Web SEO",
        description: "Création de contenu optimisé SEO pour 10 pages",
        price: 500
      },
      {
        name: "Campagne Facebook Ads",
        description: "Création et gestion campagnes Facebook/Instagram Ads",
        price: 700
      },
      {
        name: "Stratégie Influence Marketing",
        description: "Campagne avec influenceurs et micro-influenceurs",
        price: 1200
      },
      {
        name: "Marketing Automation",
        description: "Mise en place workflows automatisés multi-canaux",
        price: 900
      },

      // Services techniques WordPress
      {
        name: "Site WordPress Custom",
        description: "Site WordPress sur mesure avec thème personnalisé",
        price: 2200
      },
      {
        name: "Plugin WordPress Custom",
        description: "Développement plugin WordPress spécifique à vos besoins",
        price: 1500
      },
      {
        name: "Migration WordPress",
        description: "Migration sécurisée vers nouveau serveur avec zéro downtime",
        price: 600
      },
      {
        name: "Optimisation WordPress",
        description: "Amélioration vitesse de chargement et Core Web Vitals",
        price: 550
      },
      {
        name: "Maintenance WordPress",
        description: "Maintenance préventive, mises à jour sécurité, support",
        price: 180
      },
      {
        name: "Sécurisation WordPress",
        description: "Mise en place sécurité renforcée avec monitoring 24/7",
        price: 400
      },
      {
        name: "WooCommerce Setup",
        description: "Configuration complète boutique WooCommerce",
        price: 800
      },
      {
        name: "Multisite WordPress",
        description: "Configuration réseau multisite WordPress",
        price: 1200
      },

      // Services Shopify
      {
        name: "Boutique Shopify",
        description: "Création boutique Shopify avec thème personnalisé",
        price: 1800
      },
      {
        name: "App Shopify Custom",
        description: "Développement application Shopify sur mesure",
        price: 2500
      },
      {
        name: "Migration vers Shopify",
        description: "Migration complète de votre boutique vers Shopify",
        price: 1200
      },
      {
        name: "Optimisation Shopify",
        description: "Optimisation conversion et performance Shopify",
        price: 800
      },

      // Services techniques avancés
      {
        name: "API Personnalisée",
        description: "Développement API REST avec documentation complète",
        price: 1200
      },
      {
        name: "Intégration CRM",
        description: "Connexion avec Salesforce, HubSpot ou CRM personnalisé",
        price: 900
      },
      {
        name: "Intégration ERP",
        description: "Synchronisation avec système de gestion d'entreprise",
        price: 1500
      },
      {
        name: "Chatbot IA",
        description: "Assistant virtuel intelligent avec apprentissage automatique",
        price: 800
      },
      {
        name: "Système de Réservation",
        description: "Plateforme de réservation avec calendrier et paiements",
        price: 2200
      },
      {
        name: "Plateforme E-learning",
        description: "LMS complet avec cours, quiz et certifications",
        price: 3800
      },
      {
        name: "Marketplace Custom",
        description: "Plateforme marketplace avec vendeurs multiples",
        price: 6500
      },

      // Services de formation
      {
        name: "Formation WordPress",
        description: "Formation complète administration WordPress (8h)",
        price: 800
      },
      {
        name: "Formation SEO",
        description: "Formation référencement naturel avec outils (6h)",
        price: 600
      },
      {
        name: "Formation Réseaux Sociaux",
        description: "Formation stratégie social media et outils (4h)",
        price: 400
      },
      {
        name: "Formation E-commerce",
        description: "Formation gestion boutique en ligne (6h)",
        price: 650
      },
      {
        name: "Formation Google Analytics",
        description: "Formation analyse web et tracking (4h)",
        price: 450
      },

      // Services créatifs
      {
        name: "Création Logo Professionnel",
        description: "Design de logo unique avec déclinaisons et charte graphique",
        price: 450
      },
      {
        name: "Identité Visuelle Complète",
        description: "Logo, charte graphique, cartes de visite, papeterie",
        price: 1200
      },
      {
        name: "Shooting Photo Produits",
        description: "Séance photo professionnelle pour 20 produits",
        price: 600
      },
      {
        name: "Shooting Photo Corporate",
        description: "Séance photo d'entreprise et portraits professionnels",
        price: 800
      },
      {
        name: "Vidéo Présentation",
        description: "Création vidéo promotionnelle 2-3 minutes avec motion design",
        price: 1200
      },
      {
        name: "Vidéo Produit",
        description: "Vidéo de présentation produit avec effets spéciaux",
        price: 900
      },
      {
        name: "Animation Logo",
        description: "Animation de logo pour vidéos et réseaux sociaux",
        price: 350
      },
      {
        name: "Brochure Commerciale",
        description: "Design brochure 8 pages avec impression haute qualité",
        price: 350
      },
      {
        name: "Catalogue Produits",
        description: "Catalogue professionnel 20 pages avec mise en page",
        price: 800
      },

      // Services d'hébergement et infrastructure
      {
        name: "Hébergement Premium",
        description: "Serveur dédié virtuel avec SSD NVMe et CDN mondial",
        price: 25
      },
      {
        name: "Nom de Domaine Premium",
        description: "Réservation domaine avec protection WHOIS et DNS premium",
        price: 35
      },
      {
        name: "Email Professionnel",
        description: "Boîtes email professionnelles 50GB avec antispam",
        price: 60
      },
      {
        name: "Certificat SSL Premium",
        description: "Certificat SSL EV avec garantie et support prioritaire",
        price: 120
      },
      {
        name: "CDN Global",
        description: "Réseau de diffusion de contenu mondial",
        price: 80
      },
      {
        name: "Sauvegarde Cloud",
        description: "Système de sauvegarde automatique quotidienne cloud",
        price: 40
      },
      {
        name: "Monitoring 24/7",
        description: "Surveillance continue avec alertes temps réel",
        price: 80
      },

      // Services de support
      {
        name: "Support Technique 24/7",
        description: "Support technique disponible 24h/24 avec hotline dédiée",
        price: 300
      },
      {
        name: "Maintenance Annuelle",
        description: "Maintenance préventive, mises à jour sécurité, support",
        price: 600
      },
      {
        name: "Audit de Sécurité",
        description: "Audit complet sécurité avec rapport et recommandations",
        price: 500
      },
      {
        name: "Optimisation Performance",
        description: "Amélioration vitesse et optimisation serveur",
        price: 400
      }
    ],
    en: [
      // Websites - Complete range with exact prices
      {
        name: "One Page Website",
        description: "Modern single-page website with responsive design and animations",
        price: 200
      },
      {
        name: "Showcase Website",
        description: "Professional showcase website 5-8 pages with CMS and SEO optimization",
        price: 1800
      },
      {
        name: "E-commerce Website",
        description: "Complete online store with secure payment and inventory management",
        price: 2300
      },
      {
        name: "Custom Platform",
        description: "Personalized web application according to your specific needs",
        price: 3500
      },
      {
        name: "SaaS Solution",
        description: "Complete SaaS platform with subscriptions and dashboard",
        price: 5500
      },
      {
        name: "Rental Website",
        description: "Rental platform with reservations and online payments",
        price: 3500
      },
      {
        name: "Hair Salon Website",
        description: "Specialized hair salon website with appointment booking and gallery",
        price: 2500
      },
      {
        name: "Craftsman Website",
        description: "Professional craftsman website with portfolio and quote requests",
        price: 2500
      },

      // Premium services always offered
      {
        name: "Premium Design",
        description: "High-end graphic design with complete visual identity",
        price: 700
      },
      {
        name: "One Page SEO",
        description: "Complete SEO optimization for one page website with monthly tracking",
        price: 600
      },
      {
        name: "SEO 1 Keyword + Backlinks",
        description: "Positioning on 1 keyword with quality backlink creation",
        price: 350
      },

      // Specialized business services
      {
        name: "Restaurant Website with Menu",
        description: "Restaurant website with interactive menu, reservations and online ordering",
        price: 2800
      },
      {
        name: "Medical Practice Website",
        description: "Medical website with appointment booking and secure patient area",
        price: 3200
      },
      {
        name: "Real Estate Website",
        description: "Real estate platform with advanced search and virtual tours",
        price: 4200
      },
      {
        name: "School/Training Website",
        description: "Educational platform with online courses and student tracking",
        price: 3800
      },
      {
        name: "Photographer Website",
        description: "Photographer portfolio with high-resolution galleries and online sales",
        price: 2200
      },
      {
        name: "Lawyer/Legal Website",
        description: "Law firm website with appointment booking and legal blog",
        price: 2900
      },
      {
        name: "Fitness/Sports Website",
        description: "Gym website with class schedule and online subscriptions",
        price: 3100
      },
      {
        name: "Veterinary Website",
        description: "Veterinary clinic website with appointment booking and advice",
        price: 2700
      },
      {
        name: "Auto Garage Website",
        description: "Garage website with appointment booking and online quotes",
        price: 2400
      },
      {
        name: "Travel Agency Website",
        description: "Travel platform with reservations and secure payments",
        price: 4500
      },
      {
        name: "Architect Website",
        description: "Architect portfolio with 3D projects and quote requests",
        price: 2800
      },
      {
        name: "Consultant Website",
        description: "Professional consultant website with blog and appointment booking",
        price: 2200
      },

      // Mobile applications
      {
        name: "Native Mobile Application",
        description: "iOS/Android mobile app with cloud synchronization",
        price: 4500
      },
      {
        name: "E-commerce Mobile App",
        description: "Mobile sales application with push notifications",
        price: 5200
      },
      {
        name: "Booking Mobile App",
        description: "Booking application with geolocation",
        price: 3900
      },
      {
        name: "Fitness Mobile App",
        description: "Fitness application with activity tracking and coaching",
        price: 4200
      },
      {
        name: "Restaurant Mobile App",
        description: "Restaurant application with ordering and delivery",
        price: 3800
      },

      // Advanced marketing services
      {
        name: "Google Ads Campaign",
        description: "Google Ads campaign creation and management with ROI optimization",
        price: 800
      },
      {
        name: "Social Media Strategy",
        description: "Complete social media management with content creation",
        price: 650
      },
      {
        name: "Email Marketing Automation",
        description: "Automated email sequence setup with analytics",
        price: 450
      },
      {
        name: "Complete SEO Audit",
        description: "Complete technical analysis with detailed action plan",
        price: 750
      },
      {
        name: "SEO Web Writing",
        description: "SEO-optimized content creation for 10 pages",
        price: 500
      },
      {
        name: "Facebook Ads Campaign",
        description: "Facebook/Instagram Ads campaign creation and management",
        price: 700
      },
      {
        name: "Influencer Marketing Strategy",
        description: "Campaign with influencers and micro-influencers",
        price: 1200
      },
      {
        name: "Marketing Automation",
        description: "Multi-channel automated workflow setup",
        price: 900
      },

      // WordPress technical services
      {
        name: "Custom WordPress Site",
        description: "Custom WordPress site with personalized theme",
        price: 2200
      },
      {
        name: "Custom WordPress Plugin",
        description: "WordPress plugin development specific to your needs",
        price: 1500
      },
      {
        name: "WordPress Migration",
        description: "Secure migration to new server with zero downtime",
        price: 600
      },
      {
        name: "WordPress Optimization",
        description: "Loading speed improvement and Core Web Vitals",
        price: 550
      },
      {
        name: "WordPress Maintenance",
        description: "Preventive maintenance, security updates, support",
        price: 180
      },
      {
        name: "WordPress Security",
        description: "Enhanced security setup with 24/7 monitoring",
        price: 400
      },
      {
        name: "WooCommerce Setup",
        description: "Complete WooCommerce store configuration",
        price: 800
      },
      {
        name: "WordPress Multisite",
        description: "WordPress multisite network configuration",
        price: 1200
      },

      // Shopify services
      {
        name: "Shopify Store",
        description: "Shopify store creation with custom theme",
        price: 1800
      },
      {
        name: "Custom Shopify App",
        description: "Custom Shopify application development",
        price: 2500
      },
      {
        name: "Shopify Migration",
        description: "Complete store migration to Shopify",
        price: 1200
      },
      {
        name: "Shopify Optimization",
        description: "Shopify conversion and performance optimization",
        price: 800
      },

      // Advanced technical services
      {
        name: "Custom API",
        description: "REST API development with complete documentation",
        price: 1200
      },
      {
        name: "CRM Integration",
        description: "Connection with Salesforce, HubSpot or custom CRM",
        price: 900
      },
      {
        name: "ERP Integration",
        description: "Synchronization with enterprise management system",
        price: 1500
      },
      {
        name: "AI Chatbot",
        description: "Intelligent virtual assistant with machine learning",
        price: 800
      },
      {
        name: "Booking System",
        description: "Booking platform with calendar and payments",
        price: 2200
      },
      {
        name: "E-learning Platform",
        description: "Complete LMS with courses, quizzes and certifications",
        price: 3800
      },
      {
        name: "Custom Marketplace",
        description: "Marketplace platform with multiple vendors",
        price: 6500
      },

      // Training services
      {
        name: "WordPress Training",
        description: "Complete WordPress administration training (8h)",
        price: 800
      },
      {
        name: "SEO Training",
        description: "Natural referencing training with tools (6h)",
        price: 600
      },
      {
        name: "Social Media Training",
        description: "Social media strategy and tools training (4h)",
        price: 400
      },
      {
        name: "E-commerce Training",
        description: "Online store management training (6h)",
        price: 650
      },
      {
        name: "Google Analytics Training",
        description: "Web analysis and tracking training (4h)",
        price: 450
      },

      // Creative services
      {
        name: "Professional Logo Creation",
        description: "Unique logo design with variations and brand guidelines",
        price: 450
      },
      {
        name: "Complete Visual Identity",
        description: "Logo, brand guidelines, business cards, stationery",
        price: 1200
      },
      {
        name: "Product Photo Shoot",
        description: "Professional photo session for 20 products",
        price: 600
      },
      {
        name: "Corporate Photo Shoot",
        description: "Corporate photo session and professional portraits",
        price: 800
      },
      {
        name: "Presentation Video",
        description: "2-3 minute promotional video creation with motion design",
        price: 1200
      },
      {
        name: "Product Video",
        description: "Product presentation video with special effects",
        price: 900
      },
      {
        name: "Logo Animation",
        description: "Logo animation for videos and social media",
        price: 350
      },
      {
        name: "Commercial Brochure",
        description: "8-page brochure design with high-quality printing",
        price: 350
      },
      {
        name: "Product Catalog",
        description: "Professional 20-page catalog with layout",
        price: 800
      },

      // Hosting and infrastructure services
      {
        name: "Premium Hosting",
        description: "Virtual dedicated server with NVMe SSD and global CDN",
        price: 25
      },
      {
        name: "Premium Domain Name",
        description: "Domain reservation with WHOIS protection and premium DNS",
        price: 35
      },
      {
        name: "Professional Email",
        description: "50GB professional email boxes with antispam",
        price: 60
      },
      {
        name: "Premium SSL Certificate",
        description: "EV SSL certificate with warranty and priority support",
        price: 120
      },
      {
        name: "Global CDN",
        description: "Global content delivery network",
        price: 80
      },
      {
        name: "Cloud Backup",
        description: "Daily automatic cloud backup system",
        price: 40
      },
      {
        name: "24/7 Monitoring",
        description: "Continuous monitoring with real-time alerts",
        price: 80
      },

      // Support services
      {
        name: "24/7 Technical Support",
        description: "24/7 technical support with dedicated hotline",
        price: 300
      },
      {
        name: "Annual Maintenance",
        description: "Preventive maintenance, security updates, support",
        price: 600
      },
      {
        name: "Security Audit",
        description: "Complete security audit with report and recommendations",
        price: 500
      },
      {
        name: "Performance Optimization",
        description: "Speed improvement and server optimization",
        price: 400
      }
    ],
    de: [
      // Websites - Vollständige Palette mit exakten Preisen
      {
        name: "One-Page-Website",
        description: "Moderne einseitige Website mit responsivem Design und Animationen",
        price: 200
      },
      {
        name: "Showcase-Website",
        description: "Professionelle Showcase-Website 5-8 Seiten mit CMS und SEO-Optimierung",
        price: 1800
      },
      {
        name: "E-Commerce-Website",
        description: "Vollständiger Online-Shop mit sicherer Zahlung und Lagerverwaltung",
        price: 2300
      },
      {
        name: "Maßgeschneiderte Plattform",
        description: "Personalisierte Webanwendung nach Ihren spezifischen Bedürfnissen",
        price: 3500
      },
      {
        name: "SaaS-Lösung",
        description: "Vollständige SaaS-Plattform mit Abonnements und Dashboard",
        price: 5500
      },
      {
        name: "Vermietungs-Website",
        description: "Vermietungsplattform mit Reservierungen und Online-Zahlungen",
        price: 3500
      },
      {
        name: "Friseursalon-Website",
        description: "Spezialisierte Friseursalon-Website mit Terminbuchung und Galerie",
        price: 2500
      },
      {
        name: "Handwerker-Website",
        description: "Professionelle Handwerker-Website mit Portfolio und Kostenvoranschlägen",
        price: 2500
      },

      // Premium-Services immer angeboten
      {
        name: "Premium-Design",
        description: "Hochwertiges Grafikdesign mit vollständiger visueller Identität",
        price: 700
      },
      {
        name: "One-Page-SEO",
        description: "Vollständige SEO-Optimierung für One-Page-Website mit monatlichem Tracking",
        price: 600
      },
      {
        name: "SEO 1 Keyword + Backlinks",
        description: "Positionierung auf 1 Keyword mit qualitativ hochwertiger Backlink-Erstellung",
        price: 350
      },

      // Spezialisierte Geschäftsdienste
      {
        name: "Restaurant-Website mit Menü",
        description: "Restaurant-Website mit interaktivem Menü, Reservierungen und Online-Bestellung",
        price: 2800
      },
      {
        name: "Arztpraxis-Website",
        description: "Medizinische Website mit Terminbuchung und sicherem Patientenbereich",
        price: 3200
      },
      {
        name: "Immobilien-Website",
        description: "Immobilienplattform mit erweiterter Suche und virtuellen Rundgängen",
        price: 4200
      },
      {
        name: "Schul-/Ausbildungs-Website",
        description: "Bildungsplattform mit Online-Kursen und Schülerverfolgung",
        price: 3800
      },
      {
        name: "Fotografen-Website",
        description: "Fotografen-Portfolio mit hochauflösenden Galerien und Online-Verkauf",
        price: 2200
      },
      {
        name: "Anwalts-/Rechts-Website",
        description: "Anwaltskanzlei-Website mit Terminbuchung und Rechtsblog",
        price: 2900
      },
      {
        name: "Fitness-/Sport-Website",
        description: "Fitnessstudio-Website mit Kursplan und Online-Abonnements",
        price: 3100
      },
      {
        name: "Tierarzt-Website",
        description: "Tierarztpraxis-Website mit Terminbuchung und Beratung",
        price: 2700
      },
      {
        name: "Auto-Werkstatt-Website",
        description: "Werkstatt-Website mit Terminbuchung und Online-Kostenvoranschlägen",
        price: 2400
      },
      {
        name: "Reisebüro-Website",
        description: "Reiseplattform mit Reservierungen und sicheren Zahlungen",
        price: 4500
      },
      {
        name: "Architekten-Website",
        description: "Architekten-Portfolio mit 3D-Projekten und Kostenvoranschlägen",
        price: 2800
      },
      {
        name: "Berater-Website",
        description: "Professionelle Berater-Website mit Blog und Terminbuchung",
        price: 2200
      },

      // Mobile Anwendungen
      {
        name: "Native Mobile Anwendung",
        description: "iOS/Android Mobile App mit Cloud-Synchronisation",
        price: 4500
      },
      {
        name: "E-Commerce Mobile App",
        description: "Mobile Verkaufsanwendung mit Push-Benachrichtigungen",
        price: 5200
      },
      {
        name: "Buchungs-Mobile App",
        description: "Buchungsanwendung mit Geolokalisierung",
        price: 3900
      },
      {
        name: "Fitness Mobile App",
        description: "Fitness-Anwendung mit Aktivitätsverfolgung und Coaching",
        price: 4200
      },
      {
        name: "Restaurant Mobile App",
        description: "Restaurant-Anwendung mit Bestellung und Lieferung",
        price: 3800
      },

      // Erweiterte Marketing-Services
      {
        name: "Google Ads Kampagne",
        description: "Google Ads Kampagnenerstellung und -verwaltung mit ROI-Optimierung",
        price: 800
      },
      {
        name: "Social Media Strategie",
        description: "Vollständige Social Media Verwaltung mit Content-Erstellung",
        price: 650
      },
      {
        name: "E-Mail Marketing Automation",
        description: "Automatisierte E-Mail-Sequenz-Einrichtung mit Analytics",
        price: 450
      },
      {
        name: "Vollständiges SEO-Audit",
        description: "Vollständige technische Analyse mit detailliertem Aktionsplan",
        price: 750
      },
      {
        name: "SEO Web-Texterstellung",
        description: "SEO-optimierte Content-Erstellung für 10 Seiten",
        price: 500
      },
      {
        name: "Facebook Ads Kampagne",
        description: "Facebook/Instagram Ads Kampagnenerstellung und -verwaltung",
        price: 700
      },
      {
        name: "Influencer Marketing Strategie",
        description: "Kampagne mit Influencern und Micro-Influencern",
        price: 1200
      },
      {
        name: "Marketing Automation",
        description: "Multi-Channel automatisierte Workflow-Einrichtung",
        price: 900
      },

      // WordPress technische Services
      {
        name: "Custom WordPress Site",
        description: "Maßgeschneiderte WordPress-Site mit personalisiertem Theme",
        price: 2200
      },
      {
        name: "Custom WordPress Plugin",
        description: "WordPress Plugin-Entwicklung spezifisch für Ihre Bedürfnisse",
        price: 1500
      },
      {
        name: "WordPress Migration",
        description: "Sichere Migration zu neuem Server mit null Ausfallzeit",
        price: 600
      },
      {
        name: "WordPress Optimierung",
        description: "Ladegeschwindigkeitsverbesserung und Core Web Vitals",
        price: 550
      },
      {
        name: "WordPress Wartung",
        description: "Präventive Wartung, Sicherheitsupdates, Support",
        price: 180
      },
      {
        name: "WordPress Sicherheit",
        description: "Erweiterte Sicherheitseinrichtung mit 24/7 Überwachung",
        price: 400
      },
      {
        name: "WooCommerce Setup",
        description: "Vollständige WooCommerce Shop-Konfiguration",
        price: 800
      },
      {
        name: "WordPress Multisite",
        description: "WordPress Multisite-Netzwerk-Konfiguration",
        price: 1200
      },

      // Shopify Services
      {
        name: "Shopify Shop",
        description: "Shopify Shop-Erstellung mit maßgeschneidertem Theme",
        price: 1800
      },
      {
        name: "Custom Shopify App",
        description: "Maßgeschneiderte Shopify-Anwendungsentwicklung",
        price: 2500
      },
      {
        name: "Shopify Migration",
        description: "Vollständige Shop-Migration zu Shopify",
        price: 1200
      },
      {
        name: "Shopify Optimierung",
        description: "Shopify Conversion- und Performance-Optimierung",
        price: 800
      },

      // Erweiterte technische Services
      {
        name: "Custom API",
        description: "REST API-Entwicklung mit vollständiger Dokumentation",
        price: 1200
      },
      {
        name: "CRM Integration",
        description: "Verbindung mit Salesforce, HubSpot oder maßgeschneidertem CRM",
        price: 900
      },
      {
        name: "ERP Integration",
        description: "Synchronisation mit Unternehmensverwaltungssystem",
        price: 1500
      },
      {
        name: "KI Chatbot",
        description: "Intelligenter virtueller Assistent mit maschinellem Lernen",
        price: 800
      },
      {
        name: "Buchungssystem",
        description: "Buchungsplattform mit Kalender und Zahlungen",
        price: 2200
      },
      {
        name: "E-Learning Plattform",
        description: "Vollständiges LMS mit Kursen, Quiz und Zertifizierungen",
        price: 3800
      },
      {
        name: "Custom Marketplace",
        description: "Marketplace-Plattform mit mehreren Anbietern",
        price: 6500
      },

      // Schulungsservices
      {
        name: "WordPress Schulung",
        description: "Vollständige WordPress-Verwaltungsschulung (8h)",
        price: 800
      },
      {
        name: "SEO Schulung",
        description: "Natürliche Referenzierungsschulung mit Tools (6h)",
        price: 600
      },
      {
        name: "Social Media Schulung",
        description: "Social Media Strategie- und Tools-Schulung (4h)",
        price: 400
      },
      {
        name: "E-Commerce Schulung",
        description: "Online-Shop-Verwaltungsschulung (6h)",
        price: 650
      },
      {
        name: "Google Analytics Schulung",
        description: "Web-Analyse- und Tracking-Schulung (4h)",
        price: 450
      },

      // Kreative Services
      {
        name: "Professionelle Logo-Erstellung",
        description: "Einzigartiges Logo-Design mit Variationen und Markenrichtlinien",
        price: 450
      },
      {
        name: "Vollständige visuelle Identität",
        description: "Logo, Markenrichtlinien, Visitenkarten, Briefpapier",
        price: 1200
      },
      {
        name: "Produkt-Fotoshooting",
        description: "Professionelle Fotosession für 20 Produkte",
        price: 600
      },
      {
        name: "Corporate Fotoshooting",
        description: "Unternehmens-Fotosession und professionelle Porträts",
        price: 800
      },
      {
        name: "Präsentationsvideo",
        description: "2-3 Minuten Werbevideo-Erstellung mit Motion Design",
        price: 1200
      },
      {
        name: "Produktvideo",
        description: "Produktpräsentationsvideo mit Spezialeffekten",
        price: 900
      },
      {
        name: "Logo-Animation",
        description: "Logo-Animation für Videos und soziale Medien",
        price: 350
      },
      {
        name: "Werbebroschüre",
        description: "8-seitiges Broschüren-Design mit hochwertigem Druck",
        price: 350
      },
      {
        name: "Produktkatalog",
        description: "Professioneller 20-seitiger Katalog mit Layout",
        price: 800
      },

      // Hosting- und Infrastruktur-Services
      {
        name: "Premium Hosting",
        description: "Virtueller dedizierter Server mit NVMe SSD und globalem CDN",
        price: 25
      },
      {
        name: "Premium Domain-Name",
        description: "Domain-Reservierung mit WHOIS-Schutz und Premium-DNS",
        price: 35
      },
      {
        name: "Professionelle E-Mail",
        description: "50GB professionelle E-Mail-Postfächer mit Antispam",
        price: 60
      },
      {
        name: "Premium SSL-Zertifikat",
        description: "EV SSL-Zertifikat mit Garantie und Priority-Support",
        price: 120
      },
      {
        name: "Globales CDN",
        description: "Globales Content-Delivery-Netzwerk",
        price: 80
      },
      {
        name: "Cloud-Backup",
        description: "Tägliches automatisches Cloud-Backup-System",
        price: 40
      },
      {
        name: "24/7 Überwachung",
        description: "Kontinuierliche Überwachung mit Echtzeit-Alarmen",
        price: 80
      },

      // Support-Services
      {
        name: "24/7 Technischer Support",
        description: "24/7 technischer Support mit dedizierter Hotline",
        price: 300
      },
      {
        name: "Jährliche Wartung",
        description: "Präventive Wartung, Sicherheitsupdates, Support",
        price: 600
      },
      {
        name: "Sicherheitsaudit",
        description: "Vollständiges Sicherheitsaudit mit Bericht und Empfehlungen",
        price: 500
      },
      {
        name: "Performance-Optimierung",
        description: "Geschwindigkeitsverbesserung und Server-Optimierung",
        price: 400
      }
    ],
    es: [
      // Sitios web - Gama completa con precios exactos
      {
        name: "Sitio Web de Una Página",
        description: "Sitio web moderno de una sola página con diseño responsivo y animaciones",
        price: 200
      },
      {
        name: "Sitio Web Corporativo",
        description: "Sitio web corporativo profesional de 5-8 páginas con CMS y optimización SEO",
        price: 1800
      },
      {
        name: "Sitio Web E-commerce",
        description: "Tienda en línea completa con pago seguro y gestión de inventario",
        price: 2300
      },
      {
        name: "Plataforma Personalizada",
        description: "Aplicación web personalizada según sus necesidades específicas",
        price: 3500
      },
      {
        name: "Solución SaaS",
        description: "Plataforma SaaS completa con suscripciones y panel de control",
        price: 5500
      },
      {
        name: "Sitio Web de Alquiler",
        description: "Plataforma de alquiler con reservas y pagos en línea",
        price: 3500
      },
      {
        name: "Sitio Web de Peluquería",
        description: "Sitio web especializado en peluquería con reserva de citas y galería",
        price: 2500
      },
      {
        name: "Sitio Web de Artesano",
        description: "Sitio web profesional de artesano con portafolio y solicitudes de presupuesto",
        price: 2500
      },

      // Servicios premium siempre ofrecidos
      {
        name: "Diseño Premium",
        description: "Diseño gráfico de alta gama con identidad visual completa",
        price: 700
      },
      {
        name: "SEO Una Página",
        description: "Optimización SEO completa para sitio web de una página con seguimiento mensual",
        price: 600
      },
      {
        name: "SEO 1 Palabra Clave + Backlinks",
        description: "Posicionamiento en 1 palabra clave con creación de backlinks de calidad",
        price: 350
      },

      // Servicios empresariales especializados
      {
        name: "Sitio Web de Restaurante con Menú",
        description: "Sitio web de restaurante con menú interactivo, reservas y pedidos en línea",
        price: 2800
      },
      {
        name: "Sitio Web de Consulta Médica",
        description: "Sitio web médico con reserva de citas y área de pacientes segura",
        price: 3200
      },
      {
        name: "Sitio Web Inmobiliario",
        description: "Plataforma inmobiliaria con búsqueda avanzada y tours virtuales",
        price: 4200
      },
      {
        name: "Sitio Web de Escuela/Formación",
        description: "Plataforma educativa con cursos en línea y seguimiento de estudiantes",
        price: 3800
      },
      {
        name: "Sitio Web de Fotógrafo",
        description: "Portafolio de fotógrafo con galerías de alta resolución y ventas en línea",
        price: 2200
      },
      {
        name: "Sitio Web de Abogado/Legal",
        description: "Sitio web de bufete de abogados con reserva de citas y blog legal",
        price: 2900
      },
      {
        name: "Sitio Web de Fitness/Deportes",
        description: "Sitio web de gimnasio con horario de clases y suscripciones en línea",
        price: 3100
      },
      {
        name: "Sitio Web Veterinario",
        description: "Sitio web de clínica veterinaria con reserva de citas y consejos",
        price: 2700
      },
      {
        name: "Sitio Web de Taller Automotriz",
        description: "Sitio web de taller con reserva de citas y presupuestos en línea",
        price: 2400
      },
      {
        name: "Sitio Web de Agencia de Viajes",
        description: "Plataforma de viajes con reservas y pagos seguros",
        price: 4500
      },
      {
        name: "Sitio Web de Arquitecto",
        description: "Portafolio de arquitecto con proyectos 3D y solicitudes de presupuesto",
        price: 2800
      },
      {
        name: "Sitio Web de Consultor",
        description: "Sitio web profesional de consultor con blog y reserva de citas",
        price: 2200
      },

      // Aplicaciones móviles
      {
        name: "Aplicación Móvil Nativa",
        description: "App móvil iOS/Android con sincronización en la nube",
        price: 4500
      },
      {
        name: "App Móvil E-commerce",
        description: "Aplicación móvil de ventas con notificaciones push",
        price: 5200
      },
      {
        name: "App Móvil de Reservas",
        description: "Aplicación de reservas con geolocalización",
        price: 3900
      },
      {
        name: "App Móvil de Fitness",
        description: "Aplicación de fitness con seguimiento de actividad y coaching",
        price: 4200
      },
      {
        name: "App Móvil de Restaurante",
        description: "Aplicación de restaurante con pedidos y entrega",
        price: 3800
      },

      // Servicios de marketing avanzados
      {
        name: "Campaña Google Ads",
        description: "Creación y gestión de campaña Google Ads con optimización ROI",
        price: 800
      },
      {
        name: "Estrategia de Redes Sociales",
        description: "Gestión completa de redes sociales con creación de contenido",
        price: 650
      },
      {
        name: "Automatización de Email Marketing",
        description: "Configuración de secuencias de email automatizadas con analytics",
        price: 450
      },
      {
        name: "Auditoría SEO Completa",
        description: "Análisis técnico completo con plan de acción detallado",
        price: 750
      },
      {
        name: "Redacción Web SEO",
        description: "Creación de contenido optimizado SEO para 10 páginas",
        price: 500
      },
      {
        name: "Campaña Facebook Ads",
        description: "Creación y gestión de campañas Facebook/Instagram Ads",
        price: 700
      },
      {
        name: "Estrategia de Marketing de Influencers",
        description: "Campaña con influencers y micro-influencers",
        price: 1200
      },
      {
        name: "Automatización de Marketing",
        description: "Configuración de flujos de trabajo automatizados multicanal",
        price: 900
      },

      // Servicios técnicos de WordPress
      {
        name: "Sitio WordPress Personalizado",
        description: "Sitio WordPress personalizado con tema personalizado",
        price: 2200
      },
      {
        name: "Plugin WordPress Personalizado",
        description: "Desarrollo de plugin WordPress específico para sus necesidades",
        price: 1500
      },
      {
        name: "Migración WordPress",
        description: "Migración segura a nuevo servidor con cero tiempo de inactividad",
        price: 600
      },
      {
        name: "Optimización WordPress",
        description: "Mejora de velocidad de carga y Core Web Vitals",
        price: 550
      },
      {
        name: "Mantenimiento WordPress",
        description: "Mantenimiento preventivo, actualizaciones de seguridad, soporte",
        price: 180
      },
      {
        name: "Seguridad WordPress",
        description: "Configuración de seguridad mejorada con monitoreo 24/7",
        price: 400
      },
      {
        name: "Configuración WooCommerce",
        description: "Configuración completa de tienda WooCommerce",
        price: 800
      },
      {
        name: "WordPress Multisitio",
        description: "Configuración de red multisitio WordPress",
        price: 1200
      },

      // Servicios de Shopify
      {
        name: "Tienda Shopify",
        description: "Creación de tienda Shopify con tema personalizado",
        price: 1800
      },
      {
        name: "App Shopify Personalizada",
        description: "Desarrollo de aplicación Shopify personalizada",
        price: 2500
      },
      {
        name: "Migración a Shopify",
        description: "Migración completa de tienda a Shopify",
        price: 1200
      },
      {
        name: "Optimización Shopify",
        description: "Optimización de conversión y rendimiento de Shopify",
        price: 800
      },

      // Servicios técnicos avanzados
      {
        name: "API Personalizada",
        description: "Desarrollo de API REST con documentación completa",
        price: 1200
      },
      {
        name: "Integración CRM",
        description: "Conexión con Salesforce, HubSpot o CRM personalizado",
        price: 900
      },
      {
        name: "Integración ERP",
        description: "Sincronización con sistema de gestión empresarial",
        price: 1500
      },
      {
        name: "Chatbot IA",
        description: "Asistente virtual inteligente con aprendizaje automático",
        price: 800
      },
      {
        name: "Sistema de Reservas",
        description: "Plataforma de reservas con calendario y pagos",
        price: 2200
      },
      {
        name: "Plataforma E-learning",
        description: "LMS completo con cursos, cuestionarios y certificaciones",
        price: 3800
      },
      {
        name: "Marketplace Personalizado",
        description: "Plataforma marketplace con múltiples vendedores",
        price: 6500
      },

      // Servicios de formación
      {
        name: "Formación WordPress",
        description: "Formación completa de administración WordPress (8h)",
        price: 800
      },
      {
        name: "Formación SEO",
        description: "Formación de referenciación natural con herramientas (6h)",
        price: 600
      },
      {
        name: "Formación Redes Sociales",
        description: "Formación de estrategia de redes sociales y herramientas (4h)",
        price: 400
      },
      {
        name: "Formación E-commerce",
        description: "Formación de gestión de tienda en línea (6h)",
        price: 650
      },
      {
        name: "Formación Google Analytics",
        description: "Formación de análisis web y seguimiento (4h)",
        price: 450
      },

      // Servicios creativos
      {
        name: "Creación de Logo Profesional",
        description: "Diseño de logo único con variaciones y directrices de marca",
        price: 450
      },
      {
        name: "Identidad Visual Completa",
        description: "Logo, directrices de marca, tarjetas de visita, papelería",
        price: 1200
      },
      {
        name: "Sesión de Fotos de Productos",
        description: "Sesión de fotos profesional para 20 productos",
        price: 600
      },
      {
        name: "Sesión de Fotos Corporativas",
        description: "Sesión de fotos corporativas y retratos profesionales",
        price: 800
      },
      {
        name: "Video de Presentación",
        description: "Creación de video promocional de 2-3 minutos con motion design",
        price: 1200
      },
      {
        name: "Video de Producto",
        description: "Video de presentación de producto con efectos especiales",
        price: 900
      },
      {
        name: "Animación de Logo",
        description: "Animación de logo para videos y redes sociales",
        price: 350
      },
      {
        name: "Folleto Comercial",
        description: "Diseño de folleto de 8 páginas con impresión de alta calidad",
        price: 350
      },
      {
        name: "Catálogo de Productos",
        description: "Catálogo profesional de 20 páginas con maquetación",
        price: 800
      },

      // Servicios de hosting e infraestructura
      {
        name: "Hosting Premium",
        description: "Servidor virtual dedicado con SSD NVMe y CDN global",
        price: 25
      },
      {
        name: "Nombre de Dominio Premium",
        description: "Reserva de dominio con protección WHOIS y DNS premium",
        price: 35
      },
      {
        name: "Email Profesional",
        description: "Buzones de email profesionales de 50GB con antispam",
        price: 60
      },
      {
        name: "Certificado SSL Premium",
        description: "Certificado SSL EV con garantía y soporte prioritario",
        price: 120
      },
      {
        name: "CDN Global",
        description: "Red de entrega de contenido global",
        price: 80
      },
      {
        name: "Respaldo en la Nube",
        description: "Sistema de respaldo automático diario en la nube",
        price: 40
      },
      {
        name: "Monitoreo 24/7",
        description: "Monitoreo continuo con alertas en tiempo real",
        price: 80
      },

      // Servicios de soporte
      {
        name: "Soporte Técnico 24/7",
        description: "Soporte técnico 24/7 con línea directa dedicada",
        price: 300
      },
      {
        name: "Mantenimiento Anual",
        description: "Mantenimiento preventivo, actualizaciones de seguridad, soporte",
        price: 600
      },
      {
        name: "Auditoría de Seguridad",
        description: "Auditoría completa de seguridad con informe y recomendaciones",
        price: 500
      },
      {
        name: "Optimización de Rendimiento",
        description: "Mejora de velocidad y optimización del servidor",
        price: 400
      }
    ],
    it: [
      // Siti web - Gamma completa con prezzi esatti
      {
        name: "Sito Web One Page",
        description: "Sito web moderno a pagina singola con design responsive e animazioni",
        price: 200
      },
      {
        name: "Sito Web Vetrina",
        description: "Sito web vetrina professionale 5-8 pagine con CMS e ottimizzazione SEO",
        price: 1800
      },
      {
        name: "Sito Web E-commerce",
        description: "Negozio online completo con pagamento sicuro e gestione inventario",
        price: 2300
      },
      {
        name: "Piattaforma Su Misura",
        description: "Applicazione web personalizzata secondo le vostre esigenze specifiche",
        price: 3500
      },
      {
        name: "Soluzione SaaS",
        description: "Piattaforma SaaS completa con abbonamenti e dashboard",
        price: 5500
      },
      {
        name: "Sito Web di Noleggio",
        description: "Piattaforma di noleggio con prenotazioni e pagamenti online",
        price: 3500
      },
      {
        name: "Sito Web Parrucchiere",
        description: "Sito web specializzato parrucchiere con prenotazione appuntamenti e galleria",
        price: 2500
      },
      {
        name: "Sito Web Artigiano",
        description: "Sito web professionale artigiano con portfolio e richieste preventivo",
        price: 2500
      },

      // Servizi premium sempre offerti
      {
        name: "Design Premium",
        description: "Design grafico di alta gamma con identità visiva completa",
        price: 700
      },
      {
        name: "SEO One Page",
        description: "Ottimizzazione SEO completa per sito one page con monitoraggio mensile",
        price: 600
      },
      {
        name: "SEO 1 Keyword + Backlinks",
        description: "Posizionamento su 1 parola chiave con creazione backlink di qualità",
        price: 350
      },

      // Servizi aziendali specializzati
      {
        name: "Sito Web Ristorante con Menu",
        description: "Sito web ristorante con menu interattivo, prenotazioni e ordini online",
        price: 2800
      },
      {
        name: "Sito Web Studio Medico",
        description: "Sito web medico con prenotazione appuntamenti e area pazienti sicura",
        price: 3200
      },
      {
        name: "Sito Web Immobiliare",
        description: "Piattaforma immobiliare con ricerca avanzata e tour virtuali",
        price: 4200
      },
      {
        name: "Sito Web Scuola/Formazione",
        description: "Piattaforma educativa con corsi online e monitoraggio studenti",
        price: 3800
      },
      {
        name: "Sito Web Fotografo",
        description: "Portfolio fotografo con gallerie alta risoluzione e vendita online",
        price: 2200
      },
      {
        name: "Sito Web Avvocato/Legale",
        description: "Sito web studio legale con prenotazione appuntamenti e blog legale",
        price: 2900
      },
      {
        name: "Sito Web Fitness/Sport",
        description: "Sito web palestra con planning corsi e abbonamenti online",
        price: 3100
      },
      {
        name: "Sito Web Veterinario",
        description: "Sito web clinica veterinaria con prenotazione appuntamenti e consigli",
        price: 2700
      },
      {
        name: "Sito Web Officina Auto",
        description: "Sito web officina con prenotazione appuntamenti e preventivi online",
        price: 2400
      },
      {
        name: "Sito Web Agenzia Viaggi",
        description: "Piattaforma viaggi con prenotazioni e pagamenti sicuri",
        price: 4500
      },
      {
        name: "Sito Web Architetto",
        description: "Portfolio architetto con progetti 3D e richieste preventivo",
        price: 2800
      },
      {
        name: "Sito Web Consulente",
        description: "Sito web professionale consulente con blog e prenotazione appuntamenti",
        price: 2200
      },

      // Applicazioni mobili
      {
        name: "Applicazione Mobile Nativa",
        description: "App mobile iOS/Android con sincronizzazione cloud",
        price: 4500
      },
      {
        name: "App Mobile E-commerce",
        description: "Applicazione mobile di vendita con notifiche push",
        price: 5200
      },
      {
        name: "App Mobile Prenotazioni",
        description: "Applicazione di prenotazione con geolocalizzazione",
        price: 3900
      },
      {
        name: "App Mobile Fitness",
        description: "Applicazione fitness con monitoraggio attività e coaching",
        price: 4200
      },
      {
        name: "App Mobile Ristorante",
        description: "Applicazione ristorante con ordini e consegna",
        price: 3800
      },

      // Servizi marketing avanzati
      {
        name: "Campagna Google Ads",
        description: "Creazione e gestione campagna Google Ads con ottimizzazione ROI",
        price: 800
      },
      {
        name: "Strategia Social Media",
        description: "Gestione completa social media con creazione contenuti",
        price: 650
      },
      {
        name: "Email Marketing Automation",
        description: "Configurazione sequenze email automatizzate con analytics",
        price: 450
      },
      {
        name: "Audit SEO Completo",
        description: "Analisi tecnica completa con piano d'azione dettagliato",
        price: 750
      },
      {
        name: "Redazione Web SEO",
        description: "Creazione contenuti ottimizzati SEO per 10 pagine",
        price: 500
      },
      {
        name: "Campagna Facebook Ads",
        description: "Creazione e gestione campagne Facebook/Instagram Ads",
        price: 700
      },
      {
        name: "Strategia Influencer Marketing",
        description: "Campagna con influencer e micro-influencer",
        price: 1200
      },
      {
        name: "Marketing Automation",
        description: "Configurazione workflow automatizzati multi-canale",
        price: 900
      },

      // Servizi tecnici WordPress
      {
        name: "Sito WordPress Custom",
        description: "Sito WordPress su misura con tema personalizzato",
        price: 2200
      },
      {
        name: "Plugin WordPress Custom",
        description: "Sviluppo plugin WordPress specifico per le vostre esigenze",
        price: 1500
      },
      {
        name: "Migrazione WordPress",
        description: "Migrazione sicura verso nuovo server con zero downtime",
        price: 600
      },
      {
        name: "Ottimizzazione WordPress",
        description: "Miglioramento velocità caricamento e Core Web Vitals",
        price: 550
      },
      {
        name: "Manutenzione WordPress",
        description: "Manutenzione preventiva, aggiornamenti sicurezza, supporto",
        price: 180
      },
      {
        name: "Sicurezza WordPress",
        description: "Configurazione sicurezza avanzata con monitoraggio 24/7",
        price: 400
      },
      {
        name: "Setup WooCommerce",
        description: "Configurazione completa negozio WooCommerce",
        price: 800
      },
      {
        name: "WordPress Multisite",
        description: "Configurazione rete multisite WordPress",
        price: 1200
      },

      // Servizi Shopify
      {
        name: "Negozio Shopify",
        description: "Creazione negozio Shopify con tema personalizzato",
        price: 1800
      },
      {
        name: "App Shopify Custom",
        description: "Sviluppo applicazione Shopify su misura",
        price: 2500
      },
      {
        name: "Migrazione a Shopify",
        description: "Migrazione completa del negozio verso Shopify",
        price: 1200
      },
      {
        name: "Ottimizzazione Shopify",
        description: "Ottimizzazione conversione e performance Shopify",
        price: 800
      },

      // Servizi tecnici avanzati
      {
        name: "API Personalizzata",
        description: "Sviluppo API REST con documentazione completa",
        price: 1200
      },
      {
        name: "Integrazione CRM",
        description: "Connessione con Salesforce, HubSpot o CRM personalizzato",
        price: 900
      },
      {
        name: "Integrazione ERP",
        description: "Sincronizzazione con sistema gestione aziendale",
        price: 1500
      },
      {
        name: "Chatbot IA",
        description: "Assistente virtuale intelligente con machine learning",
        price: 800
      },
      {
        name: "Sistema Prenotazioni",
        description: "Piattaforma prenotazioni con calendario e pagamenti",
        price: 2200
      },
      {
        name: "Piattaforma E-learning",
        description: "LMS completo con corsi, quiz e certificazioni",
        price: 3800
      },
      {
        name: "Marketplace Custom",
        description: "Piattaforma marketplace con venditori multipli",
        price: 6500
      },

      // Servizi di formazione
      {
        name: "Formazione WordPress",
        description: "Formazione completa amministrazione WordPress (8h)",
        price: 800
      },
      {
        name: "Formazione SEO",
        description: "Formazione posizionamento naturale con strumenti (6h)",
        price: 600
      },
      {
        name: "Formazione Social Media",
        description: "Formazione strategia social media e strumenti (4h)",
        price: 400
      },
      {
        name: "Formazione E-commerce",
        description: "Formazione gestione negozio online (6h)",
        price: 650
      },
      {
        name: "Formazione Google Analytics",
        description: "Formazione analisi web e tracking (4h)",
        price: 450
      },

      // Servizi creativi
      {
        name: "Creazione Logo Professionale",
        description: "Design logo unico con variazioni e linee guida brand",
        price: 450
      },
      {
        name: "Identità Visiva Completa",
        description: "Logo, linee guida brand, biglietti da visita, cancelleria",
        price: 1200
      },
      {
        name: "Shooting Foto Prodotti",
        description: "Sessione fotografica professionale per 20 prodotti",
        price: 600
      },
      {
        name: "Shooting Foto Corporate",
        description: "Sessione fotografica aziendale e ritratti professionali",
        price: 800
      },
      {
        name: "Video Presentazione",
        description: "Creazione video promozionale 2-3 minuti con motion design",
        price: 1200
      },
      {
        name: "Video Prodotto",
        description: "Video presentazione prodotto con effetti speciali",
        price: 900
      },
      {
        name: "Animazione Logo",
        description: "Animazione logo per video e social media",
        price: 350
      },
      {
        name: "Brochure Commerciale",
        description: "Design brochure 8 pagine con stampa alta qualità",
        price: 350
      },
      {
        name: "Catalogo Prodotti",
        description: "Catalogo professionale 20 pagine con impaginazione",
        price: 800
      },

      // Servizi hosting e infrastruttura
      {
        name: "Hosting Premium",
        description: "Server virtuale dedicato con SSD NVMe e CDN globale",
        price: 25
      },
      {
        name: "Nome Dominio Premium",
        description: "Prenotazione dominio con protezione WHOIS e DNS premium",
        price: 35
      },
      {
        name: "Email Professionale",
        description: "Caselle email professionali 50GB con antispam",
        price: 60
      },
      {
        name: "Certificato SSL Premium",
        description: "Certificato SSL EV con garanzia e supporto prioritario",
        price: 120
      },
      {
        name: "CDN Globale",
        description: "Rete distribuzione contenuti mondiale",
        price: 80
      },
      {
        name: "Backup Cloud",
        description: "Sistema backup automatico quotidiano cloud",
        price: 40
      },
      {
        name: "Monitoraggio 24/7",
        description: "Sorveglianza continua con alert tempo reale",
        price: 80
      },

      // Servizi di supporto
      {
        name: "Supporto Tecnico 24/7",
        description: "Supporto tecnico disponibile 24h/24 con hotline dedicata",
        price: 300
      },
      {
        name: "Manutenzione Annuale",
        description: "Manutenzione preventiva, aggiornamenti sicurezza, supporto",
        price: 600
      },
      {
        name: "Audit Sicurezza",
        description: "Audit completo sicurezza con report e raccomandazioni",
        price: 500
      },
      {
        name: "Ottimizzazione Performance",
        description: "Miglioramento velocità e ottimizzazione server",
        price: 400
      }
    ]
  };

  return serviceDatabase[language] || serviceDatabase.fr;
};

export const generateServiceSuggestions = async (language: string = 'fr'): Promise<ServiceSuggestion[]> => {
  // Simulation d'un délai d'API
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const serviceSuggestions = getServiceSuggestionsByLanguage(language);
  
  // Toujours inclure les services premium recommandés
  const premiumServices = serviceSuggestions.filter(s => 
    s.name.includes('Design Premium') || 
    s.name.includes('Premium Design') ||
    s.name.includes('Premium-Design') ||
    s.name.includes('Diseño Premium') ||
    s.name.includes('Design Premium') ||
    s.name.includes('SEO One Page') || 
    s.name.includes('One Page SEO') ||
    s.name.includes('One-Page-SEO') ||
    s.name.includes('SEO Una Página') ||
    s.name.includes('SEO One Page') ||
    s.name.includes('SEO 1 Keyword') ||
    s.name.includes('SEO 1 Palabra Clave') ||
    s.name.includes('SEO 1 Keyword')
  );
  
  // Ajouter des services aléatoires
  const otherServices = serviceSuggestions.filter(s => 
    !s.name.includes('Design Premium') && 
    !s.name.includes('Premium Design') &&
    !s.name.includes('Premium-Design') &&
    !s.name.includes('Diseño Premium') &&
    !s.name.includes('Design Premium') &&
    !s.name.includes('SEO One Page') && 
    !s.name.includes('One Page SEO') &&
    !s.name.includes('One-Page-SEO') &&
    !s.name.includes('SEO Una Página') &&
    !s.name.includes('SEO One Page') &&
    !s.name.includes('SEO 1 Keyword') &&
    !s.name.includes('SEO 1 Palabra Clave') &&
    !s.name.includes('SEO 1 Keyword')
  );
  
  const shuffledOthers = [...otherServices].sort(() => 0.5 - Math.random());
  const selectedOthers = shuffledOthers.slice(0, 4);
  
  return [...premiumServices, ...selectedOthers];
};

export const generateServiceByCategory = async (category: string, language: string = 'fr'): Promise<ServiceSuggestion[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const serviceSuggestions = getServiceSuggestionsByLanguage(language);
  
  const categoryMap: Record<string, (services: ServiceSuggestion[]) => ServiceSuggestion[]> = {
    'web': (services) => services.filter(s => 
      s.name.toLowerCase().includes('site') || 
      s.name.toLowerCase().includes('web') ||
      s.name.toLowerCase().includes('website') ||
      s.name.toLowerCase().includes('sitio') ||
      s.name.toLowerCase().includes('sito') ||
      s.name.toLowerCase().includes('plateforme') ||
      s.name.toLowerCase().includes('platform') ||
      s.name.toLowerCase().includes('plattform') ||
      s.name.toLowerCase().includes('plataforma') ||
      s.name.toLowerCase().includes('piattaforma') ||
      s.name.toLowerCase().includes('wordpress')
    ),
    'ecommerce': (services) => services.filter(s => 
      s.name.toLowerCase().includes('e-commerce') || 
      s.name.toLowerCase().includes('boutique') ||
      s.name.toLowerCase().includes('store') ||
      s.name.toLowerCase().includes('shop') ||
      s.name.toLowerCase().includes('tienda') ||
      s.name.toLowerCase().includes('negozio') ||
      s.name.toLowerCase().includes('vente') ||
      s.name.toLowerCase().includes('shopify') ||
      s.name.toLowerCase().includes('woocommerce')
    ),
    'mobile': (services) => services.filter(s => 
      s.name.toLowerCase().includes('mobile') || 
      s.name.toLowerCase().includes('app') ||
      s.name.toLowerCase().includes('application') ||
      s.name.toLowerCase().includes('aplicación') ||
      s.name.toLowerCase().includes('applicazione')
    ),
    'seo': (services) => services.filter(s => 
      s.name.toLowerCase().includes('seo') || 
      s.name.toLowerCase().includes('référencement') ||
      s.name.toLowerCase().includes('referencing') ||
      s.name.toLowerCase().includes('referenzierung') ||
      s.name.toLowerCase().includes('referenciación') ||
      s.name.toLowerCase().includes('posizionamento') ||
      s.name.toLowerCase().includes('google') ||
      s.name.toLowerCase().includes('marketing')
    ),
    'design': (services) => services.filter(s => 
      s.name.toLowerCase().includes('design') || 
      s.name.toLowerCase().includes('logo') ||
      s.name.toLowerCase().includes('graphique') ||
      s.name.toLowerCase().includes('graphic') ||
      s.name.toLowerCase().includes('grafik') ||
      s.name.toLowerCase().includes('gráfico') ||
      s.name.toLowerCase().includes('grafico') ||
      s.name.toLowerCase().includes('identité') ||
      s.name.toLowerCase().includes('identity') ||
      s.name.toLowerCase().includes('identität') ||
      s.name.toLowerCase().includes('identidad') ||
      s.name.toLowerCase().includes('identità') ||
      s.name.toLowerCase().includes('photo') ||
      s.name.toLowerCase().includes('foto') ||
      s.name.toLowerCase().includes('video') ||
      s.name.toLowerCase().includes('vidéo')
    ),
    'maintenance': (services) => services.filter(s => 
      s.name.toLowerCase().includes('maintenance') || 
      s.name.toLowerCase().includes('wartung') ||
      s.name.toLowerCase().includes('mantenimiento') ||
      s.name.toLowerCase().includes('manutenzione') ||
      s.name.toLowerCase().includes('support') ||
      s.name.toLowerCase().includes('soporte') ||
      s.name.toLowerCase().includes('supporto') ||
      s.name.toLowerCase().includes('hébergement') ||
      s.name.toLowerCase().includes('hosting') ||
      s.name.toLowerCase().includes('alojamiento') ||
      s.name.toLowerCase().includes('hosting') ||
      s.name.toLowerCase().includes('monitoring') ||
      s.name.toLowerCase().includes('monitoreo') ||
      s.name.toLowerCase().includes('monitoraggio') ||
      s.name.toLowerCase().includes('sécurité') ||
      s.name.toLowerCase().includes('security') ||
      s.name.toLowerCase().includes('sicherheit') ||
      s.name.toLowerCase().includes('seguridad') ||
      s.name.toLowerCase().includes('sicurezza')
    ),
    'formation': (services) => services.filter(s => 
      s.name.toLowerCase().includes('formation') || 
      s.name.toLowerCase().includes('training') ||
      s.name.toLowerCase().includes('schulung') ||
      s.name.toLowerCase().includes('formación') ||
      s.name.toLowerCase().includes('formazione') ||
      s.name.toLowerCase().includes('cours') ||
      s.name.toLowerCase().includes('course') ||
      s.name.toLowerCase().includes('kurs') ||
      s.name.toLowerCase().includes('curso') ||
      s.name.toLowerCase().includes('corso') ||
      s.name.toLowerCase().includes('apprentissage') ||
      s.name.toLowerCase().includes('learning') ||
      s.name.toLowerCase().includes('lernen') ||
      s.name.toLowerCase().includes('aprendizaje') ||
      s.name.toLowerCase().includes('apprendimento')
    )
  };
  
  const categoryFilter = categoryMap[category.toLowerCase()];
  return categoryFilter ? categoryFilter(serviceSuggestions) : serviceSuggestions.slice(0, 6);
};

// Fonction pour générer des services selon le type de business
export const generateServicesByBusiness = async (businessType: string, language: string = 'fr'): Promise<ServiceSuggestion[]> => {
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  const serviceSuggestions = getServiceSuggestionsByLanguage(language);
  
  const businessMap: Record<string, (services: ServiceSuggestion[]) => ServiceSuggestion[]> = {
    'restaurant': (services) => [
      services.find(s => s.name.toLowerCase().includes('restaurant'))!,
      services.find(s => s.name.toLowerCase().includes('design premium') || s.name.toLowerCase().includes('premium design'))!,
      services.find(s => s.name.toLowerCase().includes('seo one page') || s.name.toLowerCase().includes('one page seo'))!,
      services.find(s => s.name.toLowerCase().includes('social') || s.name.toLowerCase().includes('réseaux'))!,
      services.find(s => s.name.toLowerCase().includes('photo') && s.name.toLowerCase().includes('produit'))!,
      services.find(s => s.name.toLowerCase().includes('app') && s.name.toLowerCase().includes('restaurant'))!
    ].filter(Boolean),
    'coiffure': (services) => [
      services.find(s => s.name.toLowerCase().includes('coiffure') || s.name.toLowerCase().includes('hair') || s.name.toLowerCase().includes('friseur') || s.name.toLowerCase().includes('peluquería') || s.name.toLowerCase().includes('parrucchiere'))!,
      services.find(s => s.name.toLowerCase().includes('design premium') || s.name.toLowerCase().includes('premium design'))!,
      services.find(s => s.name.toLowerCase().includes('seo 1 keyword') || s.name.toLowerCase().includes('seo 1 palabra') || s.name.toLowerCase().includes('seo 1 parola'))!,
      services.find(s => s.name.toLowerCase().includes('app') && s.name.toLowerCase().includes('réservation'))!,
      services.find(s => s.name.toLowerCase().includes('photo') && s.name.toLowerCase().includes('corporate'))!
    ].filter(Boolean),
    'artisan': (services) => [
      services.find(s => s.name.toLowerCase().includes('artisan') || s.name.toLowerCase().includes('craftsman') || s.name.toLowerCase().includes('handwerker') || s.name.toLowerCase().includes('artesano') || s.name.toLowerCase().includes('artigiano'))!,
      services.find(s => s.name.toLowerCase().includes('design premium') || s.name.toLowerCase().includes('premium design'))!,
      services.find(s => s.name.toLowerCase().includes('seo one page') || s.name.toLowerCase().includes('one page seo'))!,
      services.find(s => s.name.toLowerCase().includes('photo') && s.name.toLowerCase().includes('produit'))!,
      services.find(s => s.name.toLowerCase().includes('identité') || s.name.toLowerCase().includes('identity') || s.name.toLowerCase().includes('identidad') || s.name.toLowerCase().includes('identità'))!
    ].filter(Boolean),
    'ecommerce': (services) => [
      services.find(s => s.name.toLowerCase().includes('e-commerce'))!,
      services.find(s => s.name.toLowerCase().includes('design premium') || s.name.toLowerCase().includes('premium design'))!,
      services.find(s => s.name.toLowerCase().includes('seo 1 keyword') || s.name.toLowerCase().includes('seo 1 palabra') || s.name.toLowerCase().includes('seo 1 parola'))!,
      services.find(s => s.name.toLowerCase().includes('google ads'))!,
      services.find(s => s.name.toLowerCase().includes('app') && s.name.toLowerCase().includes('e-commerce'))!,
      services.find(s => s.name.toLowerCase().includes('photo') && s.name.toLowerCase().includes('produit'))!
    ].filter(Boolean),
    'medical': (services) => [
      services.find(s => s.name.toLowerCase().includes('médical') || s.name.toLowerCase().includes('medical') || s.name.toLowerCase().includes('medizin') || s.name.toLowerCase().includes('médico') || s.name.toLowerCase().includes('medico'))!,
      services.find(s => s.name.toLowerCase().includes('design premium') || s.name.toLowerCase().includes('premium design'))!,
      services.find(s => s.name.toLowerCase().includes('seo 1 keyword') || s.name.toLowerCase().includes('seo 1 palabra') || s.name.toLowerCase().includes('seo 1 parola'))!,
      services.find(s => s.name.toLowerCase().includes('réservation') || s.name.toLowerCase().includes('booking') || s.name.toLowerCase().includes('buchung') || s.name.toLowerCase().includes('reserva') || s.name.toLowerCase().includes('prenotazione'))!
    ].filter(Boolean),
    'immobilier': (services) => [
      services.find(s => s.name.toLowerCase().includes('immobilier') || s.name.toLowerCase().includes('real estate') || s.name.toLowerCase().includes('immobilien') || s.name.toLowerCase().includes('inmobiliario') || s.name.toLowerCase().includes('immobiliare'))!,
      services.find(s => s.name.toLowerCase().includes('design premium') || s.name.toLowerCase().includes('premium design'))!,
      services.find(s => s.name.toLowerCase().includes('seo 1 keyword') || s.name.toLowerCase().includes('seo 1 palabra') || s.name.toLowerCase().includes('seo 1 parola'))!,
      services.find(s => s.name.toLowerCase().includes('photo') && s.name.toLowerCase().includes('corporate'))!
    ].filter(Boolean)
  };
  
  const businessFilter = businessMap[businessType.toLowerCase()];
  return businessFilter ? businessFilter(serviceSuggestions) : [
    serviceSuggestions.find(s => s.name.toLowerCase().includes('vitrine') || s.name.toLowerCase().includes('showcase') || s.name.toLowerCase().includes('vetrina'))!,
    serviceSuggestions.find(s => s.name.toLowerCase().includes('design premium') || s.name.toLowerCase().includes('premium design'))!,
    serviceSuggestions.find(s => s.name.toLowerCase().includes('seo one page') || s.name.toLowerCase().includes('one page seo'))!
  ].filter(Boolean);
};