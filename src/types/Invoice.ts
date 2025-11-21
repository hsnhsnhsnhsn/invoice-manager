export interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
  isIncluded?: boolean; // Nouveau champ pour les services inclus
  discount?: number; // Nouveau champ pour la remise en pourcentage (0-100)
}

export interface ClientInfo {
  name: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string; // Nouveau champ pour le téléphone
}

export interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  email: string;
  phone?: string;
  logo?: string; // URL ou base64 du logo
}

export type Currency = 'EUR' | 'CHF';

export interface Invoice {
  id: string;
  number: string;
  date: string;
  clientInfo: ClientInfo;
  companyInfo: CompanyInfo;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  notes: string;
  additionalInfo: string;
  currency: Currency; // Nouvelle propriété pour la devise
  globalDiscount?: number; // Nouvelle propriété pour la remise globale en pourcentage
  generateRoadmap?: boolean; // Option pour générer une roadmap
  roadmapData?: {
    projectName: string;
    startDate: string;
    endDate: string;
    totalDuration: string;
    objectives: string;
  };
}