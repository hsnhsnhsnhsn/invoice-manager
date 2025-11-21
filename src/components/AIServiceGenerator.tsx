import React, { useState, useEffect } from 'react';
import { X, Sparkles, Wand2, Globe, Server, ShoppingCart, Calendar, Utensils, Search, TrendingUp, Shield, Zap, Palette, Camera, Video, Mail } from 'lucide-react';
import { InvoiceItem } from '../types/Invoice';
import { useTranslation } from '../utils/translations';

interface AIServiceGeneratorProps {
  onGenerateServices: (services: Omit<InvoiceItem, 'id' | 'quantity' | 'total'>[]) => void;
  onClose: () => void;
}

interface ServiceTemplate {
  name: string;
  description: string;
  price: number;
  category: string;
  icon: React.ReactNode;
  isRecommended?: boolean;
}

const AIServiceGenerator: React.FC<AIServiceGeneratorProps> = ({ onGenerateServices, onClose }) => {
  const { t, currentLanguage } = useTranslation();
  const [projectDescription, setProjectDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedServices, setGeneratedServices] = useState<ServiceTemplate[]>([]);
  const [selectedServices, setSelectedServices] = useState<Set<number>>(new Set());

  // Base de données enrichie des services avec les prix demandés
  const getServiceDatabase = (): Record<string, ServiceTemplate[]> => {
    // Base de données par langue
    const databases: Record<string, Record<string, ServiceTemplate[]>> = {
      fr: {
        'one-page': [
          {
            name: 'Nom de domaine .fr',
            description: 'Réservation et configuration du nom de domaine .fr pour 1 an',
            price: 12,
            category: 'Infrastructure',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Hébergement Web',
            description: 'Hébergement mutualisé avec SSL, 1 an',
            price: 60,
            category: 'Infrastructure',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Site Web One Page',
            description: 'Site moderne sur une seule page avec design responsive et animations',
            price: 200,
            category: 'Développement',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Design Premium',
            description: 'Design graphique haut de gamme avec identité visuelle complète',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO One Page',
            description: 'Optimisation SEO complète pour site one page avec suivi mensuel',
            price: 600,
            category: 'Marketing',
            icon: <Search className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          }
        ],
        'vitrine': [
          {
            name: 'Nom de domaine .fr',
            description: 'Réservation et configuration du nom de domaine .fr pour 1 an',
            price: 15,
            category: 'Infrastructure',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Hébergement Premium',
            description: 'Hébergement professionnel 100GB SSD, certificat SSL inclus, 1 an',
            price: 120,
            category: 'Infrastructure',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Site Web Vitrine',
            description: 'Site vitrine professionnel 5-8 pages avec CMS et optimisation SEO',
            price: 1800,
            category: 'Développement',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Design Premium',
            description: 'Design graphique haut de gamme avec identité visuelle complète',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Keyword + Backlinks',
            description: 'Positionnement sur 1 mot-clé avec création de backlinks de qualité',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          }
        ],
        'ecommerce': [
          {
            name: 'Nom de domaine .com',
            description: 'Réservation et configuration du nom de domaine .com pour 1 an',
            price: 18,
            category: 'Infrastructure',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Hébergement E-commerce',
            description: 'Hébergement dédié virtuel, 200GB SSD, SSL premium, 1 an',
            price: 300,
            category: 'Infrastructure',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Site Web E-commerce',
            description: 'Boutique en ligne complète avec paiement sécurisé et gestion des stocks',
            price: 2300,
            category: 'Développement',
            icon: <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Design Premium',
            description: 'Design graphique haut de gamme avec identité visuelle complète',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Keyword + Backlinks',
            description: 'Positionnement sur 1 mot-clé avec création de backlinks de qualité',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'Passerelle de paiement',
            description: 'Intégration Stripe/PayPal, configuration sécurisée',
            price: 400,
            category: 'Développement',
            icon: <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
          }
        ],
        'sur-mesure': [
          {
            name: 'Nom de domaine Premium',
            description: 'Réservation nom de domaine premium avec protection WHOIS',
            price: 35,
            category: 'Infrastructure',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Hébergement Dédié',
            description: 'Serveur dédié virtuel, 500GB SSD, monitoring 24/7, 1 an',
            price: 600,
            category: 'Infrastructure',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Plateforme Sur Mesure',
            description: 'Application web personnalisée selon vos besoins spécifiques',
            price: 3500,
            category: 'Développement',
            icon: <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Design Premium',
            description: 'Design graphique haut de gamme avec identité visuelle complète',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Keyword + Backlinks',
            description: 'Positionnement sur 1 mot-clé avec création de backlinks de qualité',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          }
        ],
        'saas': [
          {
            name: 'Infrastructure Cloud',
            description: 'Serveurs cloud scalables avec load balancer et CDN',
            price: 800,
            category: 'Infrastructure',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Solution SaaS',
            description: 'Plateforme SaaS complète avec abonnements et tableau de bord',
            price: 5500,
            category: 'Développement',
            icon: <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Design Premium',
            description: 'Design graphique haut de gamme avec identité visuelle complète',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Keyword + Backlinks',
            description: 'Positionnement sur 1 mot-clé avec création de backlinks de qualité',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'API et Intégrations',
            description: 'Développement API REST et intégrations tierces',
            price: 2000,
            category: 'Développement',
            icon: <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
          }
        ],
        'location': [
          {
            name: 'Nom de domaine .com',
            description: 'Réservation et configuration du nom de domaine .com pour 1 an',
            price: 18,
            category: 'Infrastructure',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Hébergement Business',
            description: 'Hébergement haute performance, 250GB SSD, backup quotidien, 1 an',
            price: 250,
            category: 'Infrastructure',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Site de Location',
            description: 'Plateforme de location avec réservations et paiements en ligne',
            price: 3500,
            category: 'Développement',
            icon: <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Design Premium',
            description: 'Design graphique haut de gamme avec identité visuelle complète',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Keyword + Backlinks',
            description: 'Positionnement sur 1 mot-clé avec création de backlinks de qualité',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          }
        ],
        'coiffure': [
          {
            name: 'Nom de domaine .fr',
            description: 'Réservation et configuration du nom de domaine .fr pour 1 an',
            price: 15,
            category: 'Infrastructure',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Hébergement Salon',
            description: 'Hébergement optimisé avec réservations, 150GB SSD, 1 an',
            price: 180,
            category: 'Infrastructure',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Site Web Coiffure',
            description: 'Site spécialisé coiffure avec prise de rendez-vous et galerie',
            price: 2500,
            category: 'Développement',
            icon: <Utensils className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Design Premium',
            description: 'Design graphique haut de gamme avec identité visuelle complète',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Keyword + Backlinks',
            description: 'Positionnement sur 1 mot-clé avec création de backlinks de qualité',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'Shooting Photo Salon',
            description: 'Séance photo professionnelle du salon et des réalisations',
            price: 400,
            category: 'Design',
            icon: <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
          }
        ],
        'artisan': [
          {
            name: 'Nom de domaine .fr',
            description: 'Réservation et configuration du nom de domaine .fr pour 1 an',
            price: 15,
            category: 'Infrastructure',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Hébergement Artisan',
            description: 'Hébergement avec galerie photos optimisée, 150GB SSD, 1 an',
            price: 150,
            category: 'Infrastructure',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Site Web Artisan',
            description: 'Site professionnel artisan avec portfolio et demande de devis',
            price: 2500,
            category: 'Développement',
            icon: <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Design Premium',
            description: 'Design graphique haut de gamme avec identité visuelle complète',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Keyword + Backlinks',
            description: 'Positionnement sur 1 mot-clé avec création de backlinks de qualité',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'Shooting Photo Réalisations',
            description: 'Séance photo professionnelle de vos réalisations',
            price: 500,
            category: 'Design',
            icon: <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
          }
        ]
      },
      en: {
        'one-page': [
          {
            name: 'Domain name .com',
            description: 'Registration and configuration of .com domain name for 1 year',
            price: 12,
            category: 'Infrastructure',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Web Hosting',
            description: 'Shared hosting with SSL, 1 year',
            price: 60,
            category: 'Infrastructure',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'One Page Website',
            description: 'Modern single-page website with responsive design and animations',
            price: 200,
            category: 'Development',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Premium Design',
            description: 'High-end graphic design with complete visual identity',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'One Page SEO',
            description: 'Complete SEO optimization for one-page site with monthly tracking',
            price: 600,
            category: 'Marketing',
            icon: <Search className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          }
        ],
        'showcase': [
          {
            name: 'Domain name .com',
            description: 'Registration and configuration of .com domain name for 1 year',
            price: 15,
            category: 'Infrastructure',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Premium Hosting',
            description: 'Professional hosting 100GB SSD, SSL certificate included, 1 year',
            price: 120,
            category: 'Infrastructure',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Showcase Website',
            description: 'Professional showcase website 5-8 pages with CMS and SEO optimization',
            price: 1800,
            category: 'Development',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Premium Design',
            description: 'High-end graphic design with complete visual identity',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Keyword + Backlinks',
            description: 'Positioning on 1 keyword with quality backlink creation',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          }
        ],
        'ecommerce': [
          {
            name: 'Domain name .com',
            description: 'Registration and configuration of .com domain name for 1 year',
            price: 18,
            category: 'Infrastructure',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'E-commerce Hosting',
            description: 'Virtual dedicated hosting, 200GB SSD, premium SSL, 1 year',
            price: 300,
            category: 'Infrastructure',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'E-commerce Website',
            description: 'Complete online store with secure payment and inventory management',
            price: 2300,
            category: 'Development',
            icon: <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Premium Design',
            description: 'High-end graphic design with complete visual identity',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Keyword + Backlinks',
            description: 'Positioning on 1 keyword with quality backlink creation',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'Payment Gateway',
            description: 'Stripe/PayPal integration, secure configuration',
            price: 400,
            category: 'Development',
            icon: <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
          }
        ],
        'custom': [
          {
            name: 'Premium Domain Name',
            description: 'Premium domain name reservation with WHOIS protection',
            price: 35,
            category: 'Infrastructure',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Dedicated Hosting',
            description: 'Virtual dedicated server, 500GB SSD, 24/7 monitoring, 1 year',
            price: 600,
            category: 'Infrastructure',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Custom Platform',
            description: 'Custom web application according to your specific needs',
            price: 3500,
            category: 'Development',
            icon: <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Premium Design',
            description: 'High-end graphic design with complete visual identity',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Keyword + Backlinks',
            description: 'Positioning on 1 keyword with quality backlink creation',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          }
        ],
        'saas': [
          {
            name: 'Cloud Infrastructure',
            description: 'Scalable cloud servers with load balancer and CDN',
            price: 800,
            category: 'Infrastructure',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'SaaS Solution',
            description: 'Complete SaaS platform with subscriptions and dashboard',
            price: 5500,
            category: 'Development',
            icon: <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Premium Design',
            description: 'High-end graphic design with complete visual identity',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Keyword + Backlinks',
            description: 'Positioning on 1 keyword with quality backlink creation',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'API and Integrations',
            description: 'REST API development and third-party integrations',
            price: 2000,
            category: 'Development',
            icon: <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
          }
        ],
        'rental': [
          {
            name: 'Domain name .com',
            description: 'Registration and configuration of .com domain name for 1 year',
            price: 18,
            category: 'Infrastructure',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Business Hosting',
            description: 'High-performance hosting, 250GB SSD, daily backup, 1 year',
            price: 250,
            category: 'Infrastructure',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Rental Website',
            description: 'Rental platform with reservations and online payments',
            price: 3500,
            category: 'Development',
            icon: <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Premium Design',
            description: 'High-end graphic design with complete visual identity',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Keyword + Backlinks',
            description: 'Positioning on 1 keyword with quality backlink creation',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          }
        ],
        'salon': [
          {
            name: 'Domain name .com',
            description: 'Registration and configuration of .com domain name for 1 year',
            price: 15,
            category: 'Infrastructure',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Salon Hosting',
            description: 'Optimized hosting with reservations, 150GB SSD, 1 year',
            price: 180,
            category: 'Infrastructure',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Hair Salon Website',
            description: 'Specialized hair salon website with appointment booking and gallery',
            price: 2500,
            category: 'Development',
            icon: <Utensils className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Premium Design',
            description: 'High-end graphic design with complete visual identity',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Keyword + Backlinks',
            description: 'Positioning on 1 keyword with quality backlink creation',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'Salon Photo Shoot',
            description: 'Professional photo session of the salon and achievements',
            price: 400,
            category: 'Design',
            icon: <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
          }
        ],
        'craftsman': [
          {
            name: 'Domain name .com',
            description: 'Registration and configuration of .com domain name for 1 year',
            price: 15,
            category: 'Infrastructure',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Craftsman Hosting',
            description: 'Hosting with optimized photo gallery, 150GB SSD, 1 year',
            price: 150,
            category: 'Infrastructure',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Craftsman Website',
            description: 'Professional craftsman website with portfolio and quote requests',
            price: 2500,
            category: 'Development',
            icon: <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Premium Design',
            description: 'High-end graphic design with complete visual identity',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Keyword + Backlinks',
            description: 'Positioning on 1 keyword with quality backlink creation',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'Product Photo Shoot',
            description: 'Professional photo session of your achievements',
            price: 500,
            category: 'Design',
            icon: <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
          }
        ]
      },
      de: {
        'one-page': [
          {
            name: 'Domainname .de',
            description: 'Reservierung und Konfiguration des .de Domainnamens für 1 Jahr',
            price: 12,
            category: 'Infrastruktur',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Web-Hosting',
            description: 'Shared Hosting mit SSL, 1 Jahr',
            price: 60,
            category: 'Infrastruktur',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'One-Page-Website',
            description: 'Moderne einseitige Website mit responsivem Design und Animationen',
            price: 200,
            category: 'Entwicklung',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Premium-Design',
            description: 'Hochwertiges Grafikdesign mit vollständiger visueller Identität',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'One-Page-SEO',
            description: 'Vollständige SEO-Optimierung für One-Page-Site mit monatlichem Tracking',
            price: 600,
            category: 'Marketing',
            icon: <Search className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          }
        ],
        'showcase': [
          {
            name: 'Domainname .de',
            description: 'Reservierung und Konfiguration des .de Domainnamens für 1 Jahr',
            price: 15,
            category: 'Infrastruktur',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Premium-Hosting',
            description: 'Professionelles Hosting 100GB SSD, SSL-Zertifikat inklusive, 1 Jahr',
            price: 120,
            category: 'Infrastruktur',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Showcase-Website',
            description: 'Professionelle Showcase-Website 5-8 Seiten mit CMS und SEO-Optimierung',
            price: 1800,
            category: 'Entwicklung',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Premium-Design',
            description: 'Hochwertiges Grafikdesign mit vollständiger visueller Identität',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Keyword + Backlinks',
            description: 'Positionierung auf 1 Keyword mit Erstellung hochwertiger Backlinks',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          }
        ],
        'ecommerce': [
          {
            name: 'Domainname .com',
            description: 'Reservierung und Konfiguration des .com Domainnamens für 1 Jahr',
            price: 18,
            category: 'Infrastruktur',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'E-Commerce-Hosting',
            description: 'Virtuelles dediziertes Hosting, 200GB SSD, Premium-SSL, 1 Jahr',
            price: 300,
            category: 'Infrastruktur',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'E-Commerce-Website',
            description: 'Kompletter Online-Shop mit sicherer Zahlung und Lagerverwaltung',
            price: 2300,
            category: 'Entwicklung',
            icon: <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Premium-Design',
            description: 'Hochwertiges Grafikdesign mit vollständiger visueller Identität',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Keyword + Backlinks',
            description: 'Positionierung auf 1 Keyword mit Erstellung hochwertiger Backlinks',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'Zahlungs-Gateway',
            description: 'Stripe/PayPal-Integration, sichere Konfiguration',
            price: 400,
            category: 'Entwicklung',
            icon: <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
          }
        ],
        'custom': [
          {
            name: 'Premium-Domainname',
            description: 'Reservierung von Premium-Domainnamen mit WHOIS-Schutz',
            price: 35,
            category: 'Infrastruktur',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Dediziertes Hosting',
            description: 'Virtueller dedizierter Server, 500GB SSD, 24/7-Überwachung, 1 Jahr',
            price: 600,
            category: 'Infrastruktur',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Maßgeschneiderte Plattform',
            description: 'Maßgeschneiderte Webanwendung nach Ihren spezifischen Bedürfnissen',
            price: 3500,
            category: 'Entwicklung',
            icon: <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Premium-Design',
            description: 'Hochwertiges Grafikdesign mit vollständiger visueller Identität',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Keyword + Backlinks',
            description: 'Positionierung auf 1 Keyword mit Erstellung hochwertiger Backlinks',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          }
        ],
        'saas': [
          {
            name: 'Cloud-Infrastruktur',
            description: 'Skalierbare Cloud-Server mit Load Balancer und CDN',
            price: 800,
            category: 'Infrastruktur',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'SaaS-Lösung',
            description: 'Komplette SaaS-Plattform mit Abonnements und Dashboard',
            price: 5500,
            category: 'Entwicklung',
            icon: <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Premium-Design',
            description: 'Hochwertiges Grafikdesign mit vollständiger visueller Identität',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Keyword + Backlinks',
            description: 'Positionierung auf 1 Keyword mit Erstellung hochwertiger Backlinks',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'API und Integrationen',
            description: 'REST-API-Entwicklung und Drittanbieter-Integrationen',
            price: 2000,
            category: 'Entwicklung',
            icon: <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
          }
        ],
        'vermietung': [
          {
            name: 'Domainname .de',
            description: 'Reservierung und Konfiguration des .de Domainnamens für 1 Jahr',
            price: 18,
            category: 'Infrastruktur',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Business-Hosting',
            description: 'Hochleistungs-Hosting, 250GB SSD, tägliches Backup, 1 Jahr',
            price: 250,
            category: 'Infrastruktur',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Vermietungs-Website',
            description: 'Vermietungsplattform mit Reservierungen und Online-Zahlungen',
            price: 3500,
            category: 'Entwicklung',
            icon: <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Premium-Design',
            description: 'Hochwertiges Grafikdesign mit vollständiger visueller Identität',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Keyword + Backlinks',
            description: 'Positionierung auf 1 Keyword mit Erstellung hochwertiger Backlinks',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          }
        ],
        'friseur': [
          {
            name: 'Domainname .de',
            description: 'Reservierung und Konfiguration des .de Domainnamens für 1 Jahr',
            price: 15,
            category: 'Infrastruktur',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Salon-Hosting',
            description: 'Optimiertes Hosting mit Reservierungen, 150GB SSD, 1 Jahr',
            price: 180,
            category: 'Infrastruktur',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Friseursalon-Website',
            description: 'Spezialisierte Friseursalon-Website mit Terminbuchung und Galerie',
            price: 2500,
            category: 'Entwicklung',
            icon: <Utensils className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Premium-Design',
            description: 'Hochwertiges Grafikdesign mit vollständiger visueller Identität',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Keyword + Backlinks',
            description: 'Positionierung auf 1 Keyword mit Erstellung hochwertiger Backlinks',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'Salon-Fotoshooting',
            description: 'Professionelles Fotoshooting des Salons und der Arbeiten',
            price: 400,
            category: 'Design',
            icon: <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
          }
        ],
        'handwerker': [
          {
            name: 'Domainname .de',
            description: 'Reservierung und Konfiguration des .de Domainnamens für 1 Jahr',
            price: 15,
            category: 'Infrastruktur',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Handwerker-Hosting',
            description: 'Hosting mit optimierter Fotogalerie, 150GB SSD, 1 Jahr',
            price: 150,
            category: 'Infrastruktur',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Handwerker-Website',
            description: 'Professionelle Handwerker-Website mit Portfolio und Angebotsanfragen',
            price: 2500,
            category: 'Entwicklung',
            icon: <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Premium-Design',
            description: 'Hochwertiges Grafikdesign mit vollständiger visueller Identität',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Keyword + Backlinks',
            description: 'Positionierung auf 1 Keyword mit Erstellung hochwertiger Backlinks',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'Produkt-Fotoshooting',
            description: 'Professionelles Fotoshooting Ihrer Arbeiten',
            price: 500,
            category: 'Design',
            icon: <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
          }
        ]
      },
      es: {
        'one-page': [
          {
            name: 'Nombre de dominio .es',
            description: 'Reserva y configuración del nombre de dominio .es por 1 año',
            price: 12,
            category: 'Infraestructura',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Alojamiento Web',
            description: 'Alojamiento compartido con SSL, 1 año',
            price: 60,
            category: 'Infraestructura',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Sitio Web de Una Página',
            description: 'Sitio web moderno de una sola página con diseño responsive y animaciones',
            price: 200,
            category: 'Desarrollo',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Diseño Premium',
            description: 'Diseño gráfico de alta gama con identidad visual completa',
            price: 700,
            category: 'Diseño',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO Una Página',
            description: 'Optimización SEO completa para sitio de una página con seguimiento mensual',
            price: 600,
            category: 'Marketing',
            icon: <Search className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          }
        ],
        'corporativo': [
          {
            name: 'Nombre de dominio .es',
            description: 'Reserva y configuración del nombre de dominio .es por 1 año',
            price: 15,
            category: 'Infraestructura',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Alojamiento Premium',
            description: 'Alojamiento profesional 100GB SSD, certificado SSL incluido, 1 año',
            price: 120,
            category: 'Infraestructura',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Sitio Web Corporativo',
            description: 'Sitio web corporativo profesional 5-8 páginas con CMS y optimización SEO',
            price: 1800,
            category: 'Desarrollo',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Diseño Premium',
            description: 'Diseño gráfico de alta gama con identidad visual completa',
            price: 700,
            category: 'Diseño',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Palabra Clave + Backlinks',
            description: 'Posicionamiento en 1 palabra clave con creación de backlinks de calidad',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          }
        ],
        'ecommerce': [
          {
            name: 'Nombre de dominio .com',
            description: 'Reserva y configuración del nombre de dominio .com por 1 año',
            price: 18,
            category: 'Infraestructura',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Alojamiento E-commerce',
            description: 'Alojamiento dedicado virtual, 200GB SSD, SSL premium, 1 año',
            price: 300,
            category: 'Infraestructura',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Sitio Web E-commerce',
            description: 'Tienda en línea completa con pago seguro y gestión de inventario',
            price: 2300,
            category: 'Desarrollo',
            icon: <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Diseño Premium',
            description: 'Diseño gráfico de alta gama con identidad visual completa',
            price: 700,
            category: 'Diseño',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Palabra Clave + Backlinks',
            description: 'Posicionamiento en 1 palabra clave con creación de backlinks de calidad',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'Pasarela de Pago',
            description: 'Integración Stripe/PayPal, configuración segura',
            price: 400,
            category: 'Desarrollo',
            icon: <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
          }
        ],
        'personalizado': [
          {
            name: 'Nombre de Dominio Premium',
            description: 'Reserva de nombre de dominio premium con protección WHOIS',
            price: 35,
            category: 'Infraestructura',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Alojamiento Dedicado',
            description: 'Servidor dedicado virtual, 500GB SSD, monitoreo 24/7, 1 año',
            price: 600,
            category: 'Infraestructura',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Plataforma Personalizada',
            description: 'Aplicación web personalizada según sus necesidades específicas',
            price: 3500,
            category: 'Desarrollo',
            icon: <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Diseño Premium',
            description: 'Diseño gráfico de alta gama con identidad visual completa',
            price: 700,
            category: 'Diseño',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Palabra Clave + Backlinks',
            description: 'Posicionamiento en 1 palabra clave con creación de backlinks de calidad',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          }
        ],
        'saas': [
          {
            name: 'Infraestructura Cloud',
            description: 'Servidores cloud escalables con balanceador de carga y CDN',
            price: 800,
            category: 'Infraestructura',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Solución SaaS',
            description: 'Plataforma SaaS completa con suscripciones y panel de control',
            price: 5500,
            category: 'Desarrollo',
            icon: <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Diseño Premium',
            description: 'Diseño gráfico de alta gama con identidad visual completa',
            price: 700,
            category: 'Diseño',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Palabra Clave + Backlinks',
            description: 'Posicionamiento en 1 palabra clave con creación de backlinks de calidad',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'API e Integraciones',
            description: 'Desarrollo API REST e integraciones de terceros',
            price: 2000,
            category: 'Desarrollo',
            icon: <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
          }
        ],
        'alquiler': [
          {
            name: 'Nombre de dominio .es',
            description: 'Reserva y configuración del nombre de dominio .es por 1 año',
            price: 18,
            category: 'Infraestructura',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Alojamiento Business',
            description: 'Alojamiento de alto rendimiento, 250GB SSD, backup diario, 1 año',
            price: 250,
            category: 'Infraestructura',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Sitio Web de Alquiler',
            description: 'Plataforma de alquiler con reservas y pagos en línea',
            price: 3500,
            category: 'Desarrollo',
            icon: <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Diseño Premium',
            description: 'Diseño gráfico de alta gama con identidad visual completa',
            price: 700,
            category: 'Diseño',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Palabra Clave + Backlinks',
            description: 'Posicionamiento en 1 palabra clave con creación de backlinks de calidad',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          }
        ],
        'peluqueria': [
          {
            name: 'Nombre de dominio .es',
            description: 'Reserva y configuración del nombre de dominio .es por 1 año',
            price: 15,
            category: 'Infraestructura',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Alojamiento Salón',
            description: 'Alojamiento optimizado con reservas, 150GB SSD, 1 año',
            price: 180,
            category: 'Infraestructura',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Sitio Web de Peluquería',
            description: 'Sitio web especializado en peluquería con reserva de citas y galería',
            price: 2500,
            category: 'Desarrollo',
            icon: <Utensils className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Diseño Premium',
            description: 'Diseño gráfico de alta gama con identidad visual completa',
            price: 700,
            category: 'Diseño',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Palabra Clave + Backlinks',
            description: 'Posicionamiento en 1 palabra clave con creación de backlinks de calidad',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'Sesión de Fotos Salón',
            description: 'Sesión de fotos profesional del salón y los trabajos',
            price: 400,
            category: 'Diseño',
            icon: <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
          }
        ],
        'artesano': [
          {
            name: 'Nombre de dominio .es',
            description: 'Reserva y configuración del nombre de dominio .es por 1 año',
            price: 15,
            category: 'Infraestructura',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Alojamiento Artesano',
            description: 'Alojamiento con galería de fotos optimizada, 150GB SSD, 1 año',
            price: 150,
            category: 'Infraestructura',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Sitio Web de Artesano',
            description: 'Sitio web profesional de artesano con portfolio y solicitudes de presupuesto',
            price: 2500,
            category: 'Desarrollo',
            icon: <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Diseño Premium',
            description: 'Diseño gráfico de alta gama con identidad visual completa',
            price: 700,
            category: 'Diseño',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Palabra Clave + Backlinks',
            description: 'Posicionamiento en 1 palabra clave con creación de backlinks de calidad',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'Sesión de Fotos Productos',
            description: 'Sesión de fotos profesional de sus trabajos',
            price: 500,
            category: 'Diseño',
            icon: <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
          }
        ]
      },
      it: {
        'one-page': [
          {
            name: 'Nome dominio .it',
            description: 'Registrazione e configurazione del nome dominio .it per 1 anno',
            price: 12,
            category: 'Infrastruttura',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Hosting Web',
            description: 'Hosting condiviso con SSL, 1 anno',
            price: 60,
            category: 'Infrastruttura',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Sito Web One Page',
            description: 'Sito web moderno a pagina singola con design responsive e animazioni',
            price: 200,
            category: 'Sviluppo',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Design Premium',
            description: 'Design grafico di alta gamma con identità visiva completa',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO One Page',
            description: 'Ottimizzazione SEO completa per sito one page con monitoraggio mensile',
            price: 600,
            category: 'Marketing',
            icon: <Search className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          }
        ],
        'vetrina': [
          {
            name: 'Nome dominio .it',
            description: 'Registrazione e configurazione del nome dominio .it per 1 anno',
            price: 15,
            category: 'Infrastruttura',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Hosting Premium',
            description: 'Hosting professionale 100GB SSD, certificato SSL incluso, 1 anno',
            price: 120,
            category: 'Infrastruttura',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Sito Web Vetrina',
            description: 'Sito web vetrina professionale 5-8 pagine con CMS e ottimizzazione SEO',
            price: 1800,
            category: 'Sviluppo',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Design Premium',
            description: 'Design grafico di alta gamma con identità visiva completa',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Keyword + Backlinks',
            description: 'Posizionamento su 1 parola chiave con creazione backlink di qualità',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          }
        ],
        'ecommerce': [
          {
            name: 'Nome dominio .com',
            description: 'Registrazione e configurazione del nome dominio .com per 1 anno',
            price: 18,
            category: 'Infrastruttura',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Hosting E-commerce',
            description: 'Hosting dedicato virtuale, 200GB SSD, SSL premium, 1 anno',
            price: 300,
            category: 'Infrastruttura',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Sito Web E-commerce',
            description: 'Negozio online completo con pagamento sicuro e gestione inventario',
            price: 2300,
            category: 'Sviluppo',
            icon: <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Design Premium',
            description: 'Design grafico di alta gamma con identità visiva completa',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Keyword + Backlinks',
            description: 'Posizionamento su 1 parola chiave con creazione backlink di qualità',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'Gateway di Pagamento',
            description: 'Integrazione Stripe/PayPal, configurazione sicura',
            price: 400,
            category: 'Sviluppo',
            icon: <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
          }
        ],
        'su-misura': [
          {
            name: 'Nome Dominio Premium',
            description: 'Registrazione nome dominio premium con protezione WHOIS',
            price: 35,
            category: 'Infrastruttura',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Hosting Dedicato',
            description: 'Server dedicato virtuale, 500GB SSD, monitoraggio 24/7, 1 anno',
            price: 600,
            category: 'Infrastruttura',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Piattaforma Su Misura',
            description: 'Applicazione web personalizzata secondo le vostre esigenze specifiche',
            price: 3500,
            category: 'Sviluppo',
            icon: <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Design Premium',
            description: 'Design grafico di alta gamma con identità visiva completa',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Keyword + Backlinks',
            description: 'Posizionamento su 1 parola chiave con creazione backlink di qualità',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          }
        ],
        'saas': [
          {
            name: 'Infrastruttura Cloud',
            description: 'Server cloud scalabili con load balancer e CDN',
            price: 800,
            category: 'Infrastruttura',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Soluzione SaaS',
            description: 'Piattaforma SaaS completa con abbonamenti e dashboard',
            price: 5500,
            category: 'Sviluppo',
            icon: <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Design Premium',
            description: 'Design grafico di alta gamma con identità visiva completa',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Keyword + Backlinks',
            description: 'Posizionamento su 1 parola chiave con creazione backlink di qualità',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'API e Integrazioni',
            description: 'Sviluppo API REST e integrazioni terze parti',
            price: 2000,
            category: 'Sviluppo',
            icon: <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
          }
        ],
        'noleggio': [
          {
            name: 'Nome dominio .it',
            description: 'Registrazione e configurazione del nome dominio .it per 1 anno',
            price: 18,
            category: 'Infrastruttura',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Hosting Business',
            description: 'Hosting ad alte prestazioni, 250GB SSD, backup giornaliero, 1 anno',
            price: 250,
            category: 'Infrastruttura',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Sito Web di Noleggio',
            description: 'Piattaforma di noleggio con prenotazioni e pagamenti online',
            price: 3500,
            category: 'Sviluppo',
            icon: <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Design Premium',
            description: 'Design grafico di alta gamma con identità visiva completa',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Keyword + Backlinks',
            description: 'Posizionamento su 1 parola chiave con creazione backlink di qualità',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          }
        ],
        'parrucchiere': [
          {
            name: 'Nome dominio .it',
            description: 'Registrazione e configurazione del nome dominio .it per 1 anno',
            price: 15,
            category: 'Infrastruttura',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Hosting Salone',
            description: 'Hosting ottimizzato con prenotazioni, 150GB SSD, 1 anno',
            price: 180,
            category: 'Infrastruttura',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Sito Web Parrucchiere',
            description: 'Sito web specializzato parrucchiere con prenotazione appuntamenti e galleria',
            price: 2500,
            category: 'Sviluppo',
            icon: <Utensils className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Design Premium',
            description: 'Design grafico di alta gamma con identità visiva completa',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Keyword + Backlinks',
            description: 'Posizionamento su 1 parola chiave con creazione backlink di qualità',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'Shooting Foto Salone',
            description: 'Sessione fotografica professionale del salone e delle realizzazioni',
            price: 400,
            category: 'Design',
            icon: <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
          }
        ],
        'artigiano': [
          {
            name: 'Nome dominio .it',
            description: 'Registrazione e configurazione del nome dominio .it per 1 anno',
            price: 15,
            category: 'Infrastruttura',
            icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Hosting Artigiano',
            description: 'Hosting con galleria foto ottimizzata, 150GB SSD, 1 anno',
            price: 150,
            category: 'Infrastruttura',
            icon: <Server className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Sito Web Artigiano',
            description: 'Sito web professionale artigiano con portfolio e richieste preventivo',
            price: 2500,
            category: 'Sviluppo',
            icon: <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
          },
          {
            name: 'Design Premium',
            description: 'Design grafico di alta gamma con identità visiva completa',
            price: 700,
            category: 'Design',
            icon: <Palette className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'SEO 1 Keyword + Backlinks',
            description: 'Posizionamento su 1 parola chiave con creazione backlink di qualità',
            price: 350,
            category: 'Marketing',
            icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
            isRecommended: true
          },
          {
            name: 'Shooting Foto Realizzazioni',
            description: 'Sessione fotografica professionale delle vostre realizzazioni',
            price: 500,
            category: 'Design',
            icon: <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
          }
        ]
      }
    };

    return databases[currentLanguage] || databases.fr;
  };

  const serviceDatabase = getServiceDatabase();

  // Exemples de projets prédéfinis selon la langue
  const getProjectExamples = (): string[] => {
    const examples: Record<string, string[]> = {
      fr: [
        "Site e-commerce pour vendre des vêtements avec paiement en ligne",
        "Site vitrine pour salon de coiffure avec prise de rendez-vous",
        "Plateforme de location de véhicules avec réservation en ligne",
        "Site artisan menuisier avec portfolio et demande de devis",
        "Landing page pour lancement de produit avec newsletter",
        "Solution SaaS de gestion de projet avec abonnements"
      ],
      en: [
        "E-commerce website to sell clothes with online payment",
        "Showcase website for hair salon with appointment booking",
        "Vehicle rental platform with online reservation",
        "Carpenter craftsman website with portfolio and quote request",
        "Landing page for product launch with newsletter",
        "Project management SaaS solution with subscriptions"
      ],
      de: [
        "E-Commerce-Website zum Verkauf von Kleidung mit Online-Zahlung",
        "Showcase-Website für Friseursalon mit Terminbuchung",
        "Fahrzeugvermietungsplattform mit Online-Reservierung",
        "Tischler-Handwerker-Website mit Portfolio und Angebotsanfrage",
        "Landing Page für Produkteinführung mit Newsletter",
        "Projektmanagement-SaaS-Lösung mit Abonnements"
      ],
      es: [
        "Sitio e-commerce para vender ropa con pago en línea",
        "Sitio web corporativo para peluquería con reserva de citas",
        "Plataforma de alquiler de vehículos con reserva en línea",
        "Sitio web de carpintero artesano con portfolio y solicitud de presupuesto",
        "Landing page para lanzamiento de producto con newsletter",
        "Solución SaaS de gestión de proyectos con suscripciones"
      ],
      it: [
        "Sito e-commerce per vendere abbigliamento con pagamento online",
        "Sito web vetrina per salone parrucchiere con prenotazione appuntamenti",
        "Piattaforma di noleggio veicoli con prenotazione online",
        "Sito web artigiano falegname con portfolio e richiesta preventivo",
        "Landing page per lancio prodotto con newsletter",
        "Soluzione SaaS di gestione progetti con abbonamenti"
      ]
    };

    return examples[currentLanguage] || examples.fr;
  };

  const projectExamples = getProjectExamples();

  const analyzeProject = (description: string): ServiceTemplate[] => {
    const lowerDesc = description.toLowerCase();
    let services: ServiceTemplate[] = [];

    // Détection du type de projet avec les nouveaux services
    if (lowerDesc.includes('one page') || lowerDesc.includes('landing') || 
        lowerDesc.includes('one-page') || lowerDesc.includes('página única') || 
        lowerDesc.includes('pagina unica')) {
      services = [...(serviceDatabase['one-page'] || [])];
    } else if (lowerDesc.includes('e-commerce') || lowerDesc.includes('boutique') || 
               lowerDesc.includes('vente') || lowerDesc.includes('shop') || 
               lowerDesc.includes('tienda') || lowerDesc.includes('negozio')) {
      services = [...(serviceDatabase['ecommerce'] || [])];
    } else if (lowerDesc.includes('saas') || lowerDesc.includes('abonnement') || 
               lowerDesc.includes('subscription') || lowerDesc.includes('abonnement') || 
               lowerDesc.includes('suscripción') || lowerDesc.includes('abbonamento')) {
      services = [...(serviceDatabase['saas'] || [])];
    } else if (lowerDesc.includes('location') || lowerDesc.includes('réservation') || 
               lowerDesc.includes('booking') || lowerDesc.includes('vermietung') || 
               lowerDesc.includes('buchung') || lowerDesc.includes('alquiler') || 
               lowerDesc.includes('reserva') || lowerDesc.includes('noleggio') || 
               lowerDesc.includes('prenotazione')) {
      services = [...(serviceDatabase['location'] || serviceDatabase['rental'] || serviceDatabase['vermietung'] || serviceDatabase['alquiler'] || serviceDatabase['noleggio'] || [])];
    } else if (lowerDesc.includes('coiffure') || lowerDesc.includes('salon') || 
               lowerDesc.includes('coiffeur') || lowerDesc.includes('hair') || 
               lowerDesc.includes('friseur') || lowerDesc.includes('peluquería') || 
               lowerDesc.includes('parrucchiere')) {
      services = [...(serviceDatabase['coiffure'] || serviceDatabase['salon'] || serviceDatabase['friseur'] || serviceDatabase['peluqueria'] || serviceDatabase['parrucchiere'] || [])];
    } else if (lowerDesc.includes('artisan') || lowerDesc.includes('menuisier') || 
               lowerDesc.includes('plombier') || lowerDesc.includes('électricien') || 
               lowerDesc.includes('craftsman') || lowerDesc.includes('carpenter') || 
               lowerDesc.includes('plumber') || lowerDesc.includes('electrician') || 
               lowerDesc.includes('handwerker') || lowerDesc.includes('tischler') || 
               lowerDesc.includes('klempner') || lowerDesc.includes('elektriker') || 
               lowerDesc.includes('artesano') || lowerDesc.includes('carpintero') || 
               lowerDesc.includes('fontanero') || lowerDesc.includes('electricista') || 
               lowerDesc.includes('artigiano') || lowerDesc.includes('falegname') || 
               lowerDesc.includes('idraulico') || lowerDesc.includes('elettricista')) {
      services = [...(serviceDatabase['artisan'] || serviceDatabase['craftsman'] || serviceDatabase['handwerker'] || serviceDatabase['artesano'] || serviceDatabase['artigiano'] || [])];
    } else if (lowerDesc.includes('sur mesure') || lowerDesc.includes('personnalisé') || 
               lowerDesc.includes('spécifique') || lowerDesc.includes('complexe') || 
               lowerDesc.includes('custom') || lowerDesc.includes('personalized') || 
               lowerDesc.includes('specific') || lowerDesc.includes('complex') || 
               lowerDesc.includes('maßgeschneidert') || lowerDesc.includes('personalisiert') || 
               lowerDesc.includes('spezifisch') || lowerDesc.includes('komplex') || 
               lowerDesc.includes('personalizado') || lowerDesc.includes('específico') || 
               lowerDesc.includes('complejo') || lowerDesc.includes('su misura') || 
               lowerDesc.includes('personalizzato') || lowerDesc.includes('specifico') || 
               lowerDesc.includes('complesso')) {
      services = [...(serviceDatabase['sur-mesure'] || serviceDatabase['custom'] || serviceDatabase['personalizado'] || serviceDatabase['su-misura'] || [])];
    } else {
      // Site vitrine par défaut
      services = [...(serviceDatabase['vitrine'] || serviceDatabase['showcase'] || serviceDatabase['corporativo'] || serviceDatabase['vetrina'] || [])];
    }

    // Ajout de services supplémentaires selon les mots-clés
    const additionalServices: ServiceTemplate[] = [];

    if (lowerDesc.includes('blog') || lowerDesc.includes('actualité') || 
        lowerDesc.includes('news') || lowerDesc.includes('nachrichten') || 
        lowerDesc.includes('noticias') || lowerDesc.includes('notizie')) {
      additionalServices.push({
        name: currentLanguage === 'fr' ? 'Module Blog' :
              currentLanguage === 'en' ? 'Blog Module' :
              currentLanguage === 'de' ? 'Blog-Modul' :
              currentLanguage === 'es' ? 'Módulo Blog' :
              currentLanguage === 'it' ? 'Modulo Blog' : 'Module Blog',
        description: currentLanguage === 'fr' ? 'Système de blog intégré avec éditeur WYSIWYG et SEO' :
                    currentLanguage === 'en' ? 'Integrated blog system with WYSIWYG editor and SEO' :
                    currentLanguage === 'de' ? 'Integriertes Blog-System mit WYSIWYG-Editor und SEO' :
                    currentLanguage === 'es' ? 'Sistema de blog integrado con editor WYSIWYG y SEO' :
                    currentLanguage === 'it' ? 'Sistema blog integrato con editor WYSIWYG e SEO' : 'Système de blog intégré avec éditeur WYSIWYG et SEO',
        price: 500,
        category: currentLanguage === 'fr' ? 'Développement' :
                 currentLanguage === 'en' ? 'Development' :
                 currentLanguage === 'de' ? 'Entwicklung' :
                 currentLanguage === 'es' ? 'Desarrollo' :
                 currentLanguage === 'it' ? 'Sviluppo' : 'Développement',
        icon: <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
      });
    }

    if (lowerDesc.includes('multilingue') || lowerDesc.includes('traduction') || 
        lowerDesc.includes('langue') || lowerDesc.includes('multilingual') || 
        lowerDesc.includes('translation') || lowerDesc.includes('language') || 
        lowerDesc.includes('mehrsprachig') || lowerDesc.includes('übersetzung') || 
        lowerDesc.includes('sprache') || lowerDesc.includes('multilingüe') || 
        lowerDesc.includes('traducción') || lowerDesc.includes('idioma') || 
        lowerDesc.includes('multilingue') || lowerDesc.includes('traduzione') || 
        lowerDesc.includes('lingua')) {
      additionalServices.push({
        name: currentLanguage === 'fr' ? 'Site Multilingue' :
              currentLanguage === 'en' ? 'Multilingual Website' :
              currentLanguage === 'de' ? 'Mehrsprachige Website' :
              currentLanguage === 'es' ? 'Sitio Multilingüe' :
              currentLanguage === 'it' ? 'Sito Multilingue' : 'Site Multilingue',
        description: currentLanguage === 'fr' ? 'Gestion multilingue avec traduction automatique' :
                    currentLanguage === 'en' ? 'Multilingual management with automatic translation' :
                    currentLanguage === 'de' ? 'Mehrsprachige Verwaltung mit automatischer Übersetzung' :
                    currentLanguage === 'es' ? 'Gestión multilingüe con traducción automática' :
                    currentLanguage === 'it' ? 'Gestione multilingue con traduzione automatica' : 'Gestion multilingue avec traduction automatique',
        price: 800,
        category: currentLanguage === 'fr' ? 'Développement' :
                 currentLanguage === 'en' ? 'Development' :
                 currentLanguage === 'de' ? 'Entwicklung' :
                 currentLanguage === 'es' ? 'Desarrollo' :
                 currentLanguage === 'it' ? 'Sviluppo' : 'Développement',
        icon: <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
      });
    }

    if (lowerDesc.includes('mobile') || lowerDesc.includes('app') || 
        lowerDesc.includes('application') || lowerDesc.includes('aplicación') || 
        lowerDesc.includes('applicazione')) {
      additionalServices.push({
        name: currentLanguage === 'fr' ? 'Application Mobile' :
              currentLanguage === 'en' ? 'Mobile Application' :
              currentLanguage === 'de' ? 'Mobile Anwendung' :
              currentLanguage === 'es' ? 'Aplicación Móvil' :
              currentLanguage === 'it' ? 'Applicazione Mobile' : 'Application Mobile',
        description: currentLanguage === 'fr' ? 'Application mobile native iOS/Android' :
                    currentLanguage === 'en' ? 'Native iOS/Android mobile application' :
                    currentLanguage === 'de' ? 'Native iOS/Android mobile Anwendung' :
                    currentLanguage === 'es' ? 'Aplicación móvil nativa iOS/Android' :
                    currentLanguage === 'it' ? 'Applicazione mobile nativa iOS/Android' : 'Application mobile native iOS/Android',
        price: 3500,
        category: currentLanguage === 'fr' ? 'Développement' :
                 currentLanguage === 'en' ? 'Development' :
                 currentLanguage === 'de' ? 'Entwicklung' :
                 currentLanguage === 'es' ? 'Desarrollo' :
                 currentLanguage === 'it' ? 'Sviluppo' : 'Développement',
        icon: <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
      });
    }

    if (lowerDesc.includes('formation') || lowerDesc.includes('accompagnement') || 
        lowerDesc.includes('training') || lowerDesc.includes('support') || 
        lowerDesc.includes('schulung') || lowerDesc.includes('begleitung') || 
        lowerDesc.includes('formación') || lowerDesc.includes('acompañamiento') || 
        lowerDesc.includes('formazione') || lowerDesc.includes('accompagnamento')) {
      additionalServices.push({
        name: currentLanguage === 'fr' ? 'Formation Utilisateur' :
              currentLanguage === 'en' ? 'User Training' :
              currentLanguage === 'de' ? 'Benutzerschulung' :
              currentLanguage === 'es' ? 'Formación de Usuario' :
              currentLanguage === 'it' ? 'Formazione Utente' : 'Formation Utilisateur',
        description: currentLanguage === 'fr' ? 'Formation à l\'administration du site (4h)' :
                    currentLanguage === 'en' ? 'Website administration training (4h)' :
                    currentLanguage === 'de' ? 'Website-Administrations-Schulung (4h)' :
                    currentLanguage === 'es' ? 'Formación en administración del sitio (4h)' :
                    currentLanguage === 'it' ? 'Formazione all\'amministrazione del sito (4h)' : 'Formation à l\'administration du site (4h)',
        price: 400,
        category: currentLanguage === 'fr' ? 'Service' :
                 currentLanguage === 'en' ? 'Service' :
                 currentLanguage === 'de' ? 'Service' :
                 currentLanguage === 'es' ? 'Servicio' :
                 currentLanguage === 'it' ? 'Servizio' : 'Service',
        icon: <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
      });
    }

    if (lowerDesc.includes('maintenance') || lowerDesc.includes('support') || 
        lowerDesc.includes('wartung') || lowerDesc.includes('unterstützung') || 
        lowerDesc.includes('mantenimiento') || lowerDesc.includes('soporte') || 
        lowerDesc.includes('manutenzione') || lowerDesc.includes('supporto')) {
      additionalServices.push({
        name: currentLanguage === 'fr' ? 'Maintenance Annuelle' :
              currentLanguage === 'en' ? 'Annual Maintenance' :
              currentLanguage === 'de' ? 'Jährliche Wartung' :
              currentLanguage === 'es' ? 'Mantenimiento Anual' :
              currentLanguage === 'it' ? 'Manutenzione Annuale' : 'Maintenance Annuelle',
        description: currentLanguage === 'fr' ? 'Maintenance préventive, mises à jour sécurité, support' :
                    currentLanguage === 'en' ? 'Preventive maintenance, security updates, support' :
                    currentLanguage === 'de' ? 'Präventive Wartung, Sicherheitsupdates, Support' :
                    currentLanguage === 'es' ? 'Mantenimiento preventivo, actualizaciones de seguridad, soporte' :
                    currentLanguage === 'it' ? 'Manutenzione preventiva, aggiornamenti sicurezza, supporto' : 'Maintenance préventive, mises à jour sécurité, support',
        price: 600,
        category: currentLanguage === 'fr' ? 'Service' :
                 currentLanguage === 'en' ? 'Service' :
                 currentLanguage === 'de' ? 'Service' :
                 currentLanguage === 'es' ? 'Servicio' :
                 currentLanguage === 'it' ? 'Servizio' : 'Service',
        icon: <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
      });
    }

    if (lowerDesc.includes('video') || lowerDesc.includes('vidéo') || 
        lowerDesc.includes('présentation') || lowerDesc.includes('presentation') || 
        lowerDesc.includes('präsentation') || lowerDesc.includes('presentación') || 
        lowerDesc.includes('presentazione')) {
      additionalServices.push({
        name: currentLanguage === 'fr' ? 'Vidéo Présentation' :
              currentLanguage === 'en' ? 'Presentation Video' :
              currentLanguage === 'de' ? 'Präsentationsvideo' :
              currentLanguage === 'es' ? 'Video Presentación' :
              currentLanguage === 'it' ? 'Video Presentazione' : 'Vidéo Présentation',
        description: currentLanguage === 'fr' ? 'Création vidéo promotionnelle 2-3 minutes avec motion design' :
                    currentLanguage === 'en' ? '2-3 minute promotional video creation with motion design' :
                    currentLanguage === 'de' ? 'Erstellung eines 2-3-minütigen Werbevideos mit Motion Design' :
                    currentLanguage === 'es' ? 'Creación de video promocional de 2-3 minutos con motion design' :
                    currentLanguage === 'it' ? 'Creazione video promozionale 2-3 minuti con motion design' : 'Création vidéo promotionnelle 2-3 minutes avec motion design',
        price: 1200,
        category: currentLanguage === 'fr' ? 'Design' :
                 currentLanguage === 'en' ? 'Design' :
                 currentLanguage === 'de' ? 'Design' :
                 currentLanguage === 'es' ? 'Diseño' :
                 currentLanguage === 'it' ? 'Design' : 'Design',
        icon: <Video className="w-3 h-3 sm:w-4 sm:h-4" />
      });
    }

    if (lowerDesc.includes('email') || lowerDesc.includes('newsletter') || 
        lowerDesc.includes('mailing') || lowerDesc.includes('e-mail') || 
        lowerDesc.includes('correo') || lowerDesc.includes('boletín') || 
        lowerDesc.includes('posta') || lowerDesc.includes('newsletter')) {
      additionalServices.push({
        name: currentLanguage === 'fr' ? 'Email Marketing' :
              currentLanguage === 'en' ? 'Email Marketing' :
              currentLanguage === 'de' ? 'E-Mail-Marketing' :
              currentLanguage === 'es' ? 'Email Marketing' :
              currentLanguage === 'it' ? 'Email Marketing' : 'Email Marketing',
        description: currentLanguage === 'fr' ? 'Mise en place campagnes email avec automation' :
                    currentLanguage === 'en' ? 'Email campaign setup with automation' :
                    currentLanguage === 'de' ? 'Einrichtung von E-Mail-Kampagnen mit Automatisierung' :
                    currentLanguage === 'es' ? 'Configuración de campañas de email con automatización' :
                    currentLanguage === 'it' ? 'Configurazione campagne email con automazione' : 'Mise en place campagnes email avec automation',
        price: 450,
        category: currentLanguage === 'fr' ? 'Marketing' :
                 currentLanguage === 'en' ? 'Marketing' :
                 currentLanguage === 'de' ? 'Marketing' :
                 currentLanguage === 'es' ? 'Marketing' :
                 currentLanguage === 'it' ? 'Marketing' : 'Marketing',
        icon: <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
      });
    }

    return [...services, ...additionalServices];
  };

  const handleGenerate = async () => {
    if (!projectDescription.trim()) {
      alert(t('pleaseDescribeProject'));
      return;
    }

    setIsGenerating(true);
    
    // Simulation d'un délai d'IA
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const services = analyzeProject(projectDescription);
    setGeneratedServices(services);
    
    // Sélectionner automatiquement les services essentiels et recommandés
    const essentialIndices = new Set<number>();
    services.forEach((service, index) => {
      if (service.category === 'Infrastructure' || 
          service.category === 'Infrastruktur' || 
          service.category === 'Infraestructura' || 
          service.category === 'Infrastruttura' || 
          service.name.includes('Site') || 
          service.name.includes('Website') || 
          service.name.includes('Webseite') || 
          service.name.includes('Sitio') || 
          service.name.includes('Sito') || 
          service.name.includes('Boutique') || 
          service.name.includes('Store') || 
          service.name.includes('Shop') || 
          service.name.includes('Tienda') || 
          service.name.includes('Negozio') || 
          service.name.includes('Plateforme') || 
          service.name.includes('Platform') || 
          service.name.includes('Plattform') || 
          service.name.includes('Plataforma') || 
          service.name.includes('Piattaforma') ||
          service.isRecommended) {
        essentialIndices.add(index);
      }
    });
    setSelectedServices(essentialIndices);
    
    setIsGenerating(false);
  };

  const toggleService = (index: number) => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedServices(newSelected);
  };

  const handleConfirm = () => {
    const selectedServicesList = Array.from(selectedServices).map(index => ({
      name: generatedServices[index].name,
      description: generatedServices[index].description,
      price: generatedServices[index].price
    }));
    
    onGenerateServices(selectedServicesList);
    onClose();
  };

  const totalPrice = Array.from(selectedServices).reduce((sum, index) => {
    return sum + generatedServices[index].price;
  }, 0);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Infrastructure':
      case 'Infrastruktur':
      case 'Infraestructura':
      case 'Infrastruttura':
        return 'bg-blue-100 text-blue-800';
      case 'Développement':
      case 'Development':
      case 'Entwicklung':
      case 'Desarrollo':
      case 'Sviluppo':
        return 'bg-green-100 text-green-800';
      case 'Marketing':
        return 'bg-purple-100 text-purple-800';
      case 'Design':
      case 'Diseño':
        return 'bg-pink-100 text-pink-800';
      case 'Service':
      case 'Servicio':
      case 'Servizio':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold">{t('aiProjectGeneratorTitle')}</h2>
                <p className="text-purple-100 text-sm sm:text-base">{t('aiProjectGeneratorSubtitle')}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 transition-colors rounded-lg"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Zone de description */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
              {t('describeYourProject')}
            </label>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder={t('projectDescriptionPlaceholder')}
              rows={4}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none text-sm sm:text-base"
              disabled={isGenerating}
            />
            
            {/* Exemples de projets */}
            <div className="mt-2 sm:mt-3">
              <p className="text-xs sm:text-sm text-gray-600 mb-2">💡 {t('projectExamples')} :</p>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {projectExamples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setProjectDescription(example)}
                    className="text-xs bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700 px-2 sm:px-3 py-1 rounded-full transition-colors"
                    disabled={isGenerating}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !projectDescription.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isGenerating ? (
                  <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
                <span className="sm:hidden">{isGenerating ? t('generating') : t('generate')}</span>
                <span className="hidden sm:inline">{isGenerating ? t('generatingInProgress') : t('generateCompleteProject')}</span>
              </button>
              
              {generatedServices.length > 0 && (
                <div className="flex items-center justify-between sm:justify-start gap-4 text-sm">
                  <span className="text-gray-600">
                    {Array.from(selectedServices).length} {t('servicesSelected')}
                  </span>
                  <span className="font-bold text-green-600 text-base sm:text-lg">
                    {totalPrice.toFixed(2)} {t('currency')} TTC
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Services générés */}
          {generatedServices.length > 0 && (
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                <span className="sm:hidden">{t('generatedProject')}</span>
                <span className="hidden sm:inline">{t('aiGeneratedCompleteProject')}</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {generatedServices.map((service, index) => (
                  <div
                    key={index}
                    onClick={() => toggleService(index)}
                    className={`p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 relative ${
                      selectedServices.has(index)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                    }`}
                  >
                    {service.isRecommended && (
                      <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-bold">
                        ⭐ <span className="hidden sm:inline">{t('recommended')}</span>
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <div className="flex items-center gap-1 sm:gap-2">
                        {service.icon}
                        <h4 className="font-semibold text-gray-900 text-xs sm:text-sm">{service.name}</h4>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium ${getCategoryColor(service.category)}`}>
                          {service.category}
                        </span>
                        <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedServices.has(index)
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedServices.has(index) && (
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs leading-relaxed text-gray-600 mb-2 sm:mb-3">
                      {service.description}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-base sm:text-lg font-bold text-green-600">
                        {service.price.toFixed(2)} {t('currency')} TTC
                      </span>
                      <span className="text-xs text-gray-500">
                        {service.category === 'Infrastructure' || 
                         service.category === 'Infrastruktur' || 
                         service.category === 'Infraestructura' || 
                         service.category === 'Infrastruttura' ? '🔧 ' + t('essential') : ''}
                        {(service.category === 'Développement' || 
                          service.category === 'Development' || 
                          service.category === 'Entwicklung' || 
                          service.category === 'Desarrollo' || 
                          service.category === 'Sviluppo') ? '💻 Core' : ''}
                        {service.category === 'Marketing' ? '📈 Growth' : ''}
                        {(service.category === 'Design' || 
                          service.category === 'Diseño') ? '🎨 Premium' : ''}
                        {(service.category === 'Service' || 
                          service.category === 'Servicio' || 
                          service.category === 'Servizio') ? '🛠️ Support' : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {generatedServices.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">
                  {Array.from(selectedServices).length} {Array.from(selectedServices).length > 1 ? t('servicesSelected') : t('serviceSelected')}
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {t('total')}: <span className="text-green-600">{totalPrice.toFixed(2)} {t('currency')} TTC</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {t('recommendedServicesIncluded')}
                </p>
              </div>
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 text-sm sm:text-base"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={selectedServices.size === 0}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  <Zap className="w-3 h-3 sm:w-5 sm:h-5" />
                  <span className="sm:hidden">{t('add')} ({Array.from(selectedServices).length})</span>
                  <span className="hidden sm:inline">{t('addToQuote')} ({Array.from(selectedServices).length})</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIServiceGenerator;