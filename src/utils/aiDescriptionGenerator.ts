// Générateur de descriptions commerciales avec IA
export interface ServiceDescription {
  commercialDescription: string;
  benefits: string[];
  callToAction: string;
}

const serviceTemplates: Record<string, ServiceDescription> = {
  // Développement Web
  'développement web': {
    commercialDescription: "Transformez votre vision en réalité digitale avec notre expertise en développement web. Nous créons des sites web modernes, rapides et optimisés qui captent l'attention de vos visiteurs et convertissent vos prospects en clients.",
    benefits: [
      "Design responsive adapté à tous les appareils",
      "Optimisation SEO pour un meilleur référencement",
      "Performance et vitesse de chargement optimales",
      "Interface utilisateur intuitive et moderne"
    ],
    callToAction: "Donnez vie à votre projet web dès aujourd'hui !"
  },
  'site web': {
    commercialDescription: "Créez une présence en ligne professionnelle qui vous démarque de la concurrence. Notre équipe conçoit des sites web sur mesure qui reflètent parfaitement votre identité de marque et engagent votre audience.",
    benefits: [
      "Design unique et personnalisé",
      "Gestion de contenu simplifiée",
      "Sécurité renforcée et maintenance incluse",
      "Analytics et suivi des performances"
    ],
    callToAction: "Lancez votre site web professionnel maintenant !"
  },
  
  // Développement Mobile
  'application mobile': {
    commercialDescription: "Atteignez vos clients où qu'ils soient avec une application mobile native performante. Nous développons des apps iOS et Android qui offrent une expérience utilisateur exceptionnelle et fidélisent votre clientèle.",
    benefits: [
      "Interface native pour iOS et Android",
      "Synchronisation cloud en temps réel",
      "Notifications push personnalisées",
      "Intégration avec vos systèmes existants"
    ],
    callToAction: "Révolutionnez votre business avec votre app mobile !"
  },
  'app mobile': {
    commercialDescription: "Boostez votre présence mobile avec une application qui marque les esprits. Notre expertise technique garantit une app fluide, intuitive et parfaitement adaptée aux besoins de vos utilisateurs.",
    benefits: [
      "Performance optimisée sur tous les appareils",
      "Design UX/UI centré utilisateur",
      "Fonctionnalités offline disponibles",
      "Mises à jour automatiques et support continu"
    ],
    callToAction: "Téléchargez le succès avec votre app mobile !"
  },

  // Design
  'design ui/ux': {
    commercialDescription: "Créez des expériences utilisateur mémorables qui convertissent. Notre approche design thinking transforme vos idées en interfaces élégantes et fonctionnelles qui enchantent vos utilisateurs.",
    benefits: [
      "Recherche utilisateur approfondie",
      "Prototypage interactif et tests utilisateurs",
      "Design system cohérent et évolutif",
      "Optimisation du taux de conversion"
    ],
    callToAction: "Séduisez vos utilisateurs avec un design exceptionnel !"
  },
  'design': {
    commercialDescription: "Donnez une identité visuelle forte à votre marque avec nos services de design professionnel. Nous créons des visuels impactants qui racontent votre histoire et marquent les esprits.",
    benefits: [
      "Identité visuelle cohérente et mémorable",
      "Supports print et digital harmonisés",
      "Créativité au service de votre message",
      "Différenciation concurrentielle garantie"
    ],
    callToAction: "Révélez le potentiel visuel de votre marque !"
  },

  // Consulting
  'formation': {
    commercialDescription: "Développez les compétences de vos équipes avec nos formations sur mesure. Nos experts transmettent leur savoir-faire pour accélérer votre transformation digitale et optimiser vos performances.",
    benefits: [
      "Programmes personnalisés selon vos besoins",
      "Formateurs experts certifiés",
      "Méthodes pédagogiques innovantes",
      "Suivi post-formation et certification"
    ],
    callToAction: "Investissez dans l'avenir de vos équipes !"
  },
  'conseil': {
    commercialDescription: "Bénéficiez de l'expertise de nos consultants pour optimiser vos processus et accélérer votre croissance. Nous analysons vos défis et proposons des solutions concrètes et mesurables.",
    benefits: [
      "Audit complet de vos processus actuels",
      "Recommandations stratégiques personnalisées",
      "Accompagnement dans la mise en œuvre",
      "ROI mesurable et objectifs atteints"
    ],
    callToAction: "Transformez vos défis en opportunités !"
  },
  'audit': {
    commercialDescription: "Identifiez les opportunités d'amélioration avec notre audit technique complet. Nos experts analysent en profondeur vos systèmes pour révéler leur potentiel d'optimisation.",
    benefits: [
      "Analyse technique approfondie",
      "Rapport détaillé avec recommandations",
      "Priorisation des actions à mener",
      "Plan de mise en œuvre structuré"
    ],
    callToAction: "Révélez le potentiel caché de vos systèmes !"
  },

  // Maintenance
  'maintenance': {
    commercialDescription: "Assurez la pérennité de vos systèmes avec notre service de maintenance proactive. Nous surveillons, optimisons et sécurisons vos plateformes pour garantir leur performance continue.",
    benefits: [
      "Surveillance 24/7 de vos systèmes",
      "Mises à jour de sécurité automatiques",
      "Sauvegardes régulières et sécurisées",
      "Support technique réactif"
    ],
    callToAction: "Sécurisez votre tranquillité d'esprit !"
  },
  'hébergement': {
    commercialDescription: "Hébergez vos projets sur une infrastructure haute performance et sécurisée. Notre solution d'hébergement garantit disponibilité, rapidité et protection optimales pour vos applications.",
    benefits: [
      "Infrastructure cloud haute disponibilité",
      "Certificats SSL inclus",
      "CDN mondial pour des performances optimales",
      "Support technique expert 24/7"
    ],
    callToAction: "Propulsez vos projets vers les sommets !"
  },

  // Marketing
  'seo': {
    commercialDescription: "Dominez les résultats de recherche avec notre expertise SEO avancée. Nous optimisons votre visibilité en ligne pour attirer plus de trafic qualifié et augmenter vos conversions.",
    benefits: [
      "Audit SEO complet et stratégie personnalisée",
      "Optimisation technique et contenu",
      "Suivi des positions et reporting détaillé",
      "Croissance du trafic organique mesurable"
    ],
    callToAction: "Grimpez en tête des résultats Google !"
  },
  'marketing': {
    commercialDescription: "Amplifiez votre impact avec nos stratégies marketing digitales sur mesure. Nous créons des campagnes qui touchent votre audience cible et génèrent des résultats concrets.",
    benefits: [
      "Stratégie multicanal personnalisée",
      "Création de contenu engageant",
      "Optimisation continue des performances",
      "ROI transparent et mesurable"
    ],
    callToAction: "Boostez votre croissance dès maintenant !"
  }
};

// Fonction pour générer une description commerciale basée sur le nom et la description du service
export const generateCommercialDescription = (serviceName: string, serviceDescription: string, price: number): ServiceDescription => {
  const name = serviceName.toLowerCase();
  const description = serviceDescription.toLowerCase();
  
  // Recherche de correspondances dans les templates
  for (const [key, template] of Object.entries(serviceTemplates)) {
    if (name.includes(key) || description.includes(key)) {
      return {
        ...template,
        commercialDescription: `${template.commercialDescription}\n\n💰 Prix HT: ${price.toFixed(2)}€ - Un investissement qui se rentabilise rapidement !`
      };
    }
  }
  
  // Template générique si aucune correspondance
  return {
    commercialDescription: `Découvrez notre service "${serviceName}" conçu pour répondre parfaitement à vos besoins. ${serviceDescription}\n\n💰 Prix exceptionnel HT: ${price.toFixed(2)}€ - Qualité professionnelle garantie !`,
    benefits: [
      "Service professionnel et personnalisé",
      "Expertise technique reconnue",
      "Accompagnement tout au long du projet",
      "Résultats mesurables et durables"
    ],
    callToAction: "Contactez-nous pour transformer votre projet en succès !"
  };
};

// Fonction optimisée pour générer un résumé commercial détaillé de tous les services d'un devis (LIMITÉ À 2000 CARACTÈRES)
export const generateInvoiceSummary = (items: Array<{name: string, description: string, price: number, quantity: number}>, clientName: string): string => {
  const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const serviceCount = items.length;
  
  // Calculer la durée estimée basée sur le nombre de services
  let estimatedDuration = '';
  if (serviceCount <= 2) {
    estimatedDuration = '2-3 semaines';
  } else if (serviceCount <= 4) {
    estimatedDuration = '4-5 semaines';
  } else if (serviceCount <= 6) {
    estimatedDuration = '6-7 semaines';
  } else {
    estimatedDuration = '7-8 semaines';
  }
  
  // Version courte et concise pour respecter la limite de 2000 caractères
  const summary = [
    `🎯 **Proposition commerciale pour ${clientName}**`,
    ``,
    `Forte de 25 ans d'expérience avec Amen.fr, notre équipe vous propose une solution complète comprenant ${serviceCount} service${serviceCount > 1 ? 's' : ''} premium pour votre projet digital.`,
    ``,
    `📋 **Services proposés (prix HT) :**`,
    ...items.slice(0, 5).map(item => `• ${item.name} - ${item.price.toFixed(2)}€ HT`),
    ...(items.length > 5 ? [`• ... et ${items.length - 5} autre${items.length - 5 > 1 ? 's' : ''} service${items.length - 5 > 1 ? 's' : ''}`] : []),
    ``,
    `✨ **Pourquoi nous choisir ?**`,
    `• 25 ans d'expertise avec Amen.fr`,
    `• Technologies modernes et performantes`,
    `• Accompagnement personnalisé de A à Z`,
    `• Support technique inclus`,
    `• ROI optimisé et résultats mesurables`,
    ``,
    `💎 **Valeur totale : ${totalValue.toFixed(2)}€ HT**`,
    ``,
    `🚀 **Bénéfices concrets :**`,
    `• Présence digitale professionnelle`,
    `• Visibilité et notoriété renforcées`,
    `• Génération de leads qualifiés`,
    `• Avantage concurrentiel durable`,
    ``,
    `📅 **Roadmap projet : ${estimatedDuration}**`,
    `*Plus il y a de services, plus la durée s'étend (2-8 semaines max)*`,
    ``,
    `🎁 **Inclus dans cette offre :**`,
    `• Formation utilisateur personnalisée`,
    `• Documentation technique complète`,
    `• 30 jours de support gratuit`,
    `• Conseils stratégiques`,
    ``,
    `🤝 **Prêt à démarrer ?**`,
    `Cette proposition est valable 15 jours. Contactez-nous pour concrétiser votre projet !`,
    ``,
    `*"Votre succès digital commence aujourd'hui avec 25 ans d'expertise !"*`
  ];
  
  const fullSummary = summary.join('\n');
  
  // Limiter strictement à 2000 caractères
  if (fullSummary.length > 2000) {
    return fullSummary.substring(0, 1997) + '...';
  }
  
  return fullSummary;
};

// Fonction pour générer des suggestions de services complémentaires
export const generateComplementaryServices = (currentServices: string[]): string[] => {
  const suggestions: Record<string, string[]> = {
    'web': ['SEO et référencement', 'Maintenance et support', 'Formation utilisateurs', 'Analytics et reporting'],
    'mobile': ['API Backend', 'Tests utilisateurs', 'Publication sur stores', 'Marketing app mobile'],
    'design': ['Développement web', 'Identité de marque', 'Support print', 'Animation et motion design'],
    'formation': ['Support post-formation', 'Certification', 'Matériel pédagogique', 'Évaluation des acquis'],
    'seo': ['Création de contenu', 'Audit technique', 'Stratégie réseaux sociaux', 'Google Ads'],
    'maintenance': ['Monitoring avancé', 'Optimisation performance', 'Sauvegardes premium', 'Support prioritaire']
  };
  
  const currentCategories = currentServices.map(service => {
    const lower = service.toLowerCase();
    if (lower.includes('web') || lower.includes('site')) return 'web';
    if (lower.includes('mobile') || lower.includes('app')) return 'mobile';
    if (lower.includes('design') || lower.includes('ui')) return 'design';
    if (lower.includes('formation')) return 'formation';
    if (lower.includes('seo') || lower.includes('référencement')) return 'seo';
    if (lower.includes('maintenance') || lower.includes('support')) return 'maintenance';
    return 'general';
  });
  
  const complementary: string[] = [];
  currentCategories.forEach(category => {
    if (suggestions[category]) {
      complementary.push(...suggestions[category]);
    }
  });
  
  // Retourner des suggestions uniques
  return [...new Set(complementary)].slice(0, 4);
};