import React, { useRef, useState } from 'react';
import { ArrowLeft, Edit, Download, Printer, FileText, Percent, Zap, Check, Share2, TrendingUp } from 'lucide-react';
import { Invoice } from '../types/Invoice';
import { Roadmap, RoadmapPhase } from '../types/Roadmap';
import { useTranslation, getCurrencySymbol } from '../utils/translations';

interface InvoicePreviewProps {
  invoice: Invoice;
  onBack: () => void;
  onEdit: () => void;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, onBack, onEdit }) => {
  const { t, currentLanguage } = useTranslation();
  const printRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const element = printRef.current;
    if (!element) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      // Créer le PDF avec 3 pages distinctes - OPTIMISÉ POUR QUALITÉ AMÉLIORÉE
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = 297;

      // Configuration optimisée pour améliorer la qualité et réduire l'étirement
      const canvasOptions = {
        scale: 2, // Augmenté de 1.2 à 2 pour une meilleure qualité
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 0,
        removeContainer: true
        // Suppression de foreignObjectRendering: false qui peut causer des problèmes
      };

      // PAGE 1 - Services et prix avec légère description
      const page1Element = element.querySelector('.pdf-page-1') as HTMLElement;
      if (page1Element) {
        const canvas1 = await html2canvas(page1Element, {
          ...canvasOptions,
          width: page1Element.scrollWidth,
          height: page1Element.scrollHeight
        });

        const imgData1 = canvas1.toDataURL('image/jpeg', 0.8);
        const imgWidth1 = pdfWidth;
        const imgHeight1 = (canvas1.height * pdfWidth) / canvas1.width;
        
        const finalHeight1 = Math.min(imgHeight1, pdfHeight);
        pdf.addImage(imgData1, 'JPEG', 0, 0, imgWidth1, finalHeight1);
      }

      // PAGE 2 - Détails complets et prix (CORRIGÉ POUR ÉVITER L'ÉTIREMENT)
      const page2Element = element.querySelector('.pdf-page-2') as HTMLElement;
      if (page2Element) {
        pdf.addPage();
        
        // Suppression de la manipulation directe du style width qui causait l'étirement
        const canvas2 = await html2canvas(page2Element, {
          ...canvasOptions,
          width: page2Element.scrollWidth,
          height: page2Element.scrollHeight
        });

        const imgData2 = canvas2.toDataURL('image/jpeg', 0.8);
        const imgWidth2 = pdfWidth;
        const imgHeight2 = (canvas2.height * pdfWidth) / canvas2.width;
        
        pdf.addImage(imgData2, 'JPEG', 0, 0, imgWidth2, Math.min(imgHeight2, pdfHeight));
      }

      // PAGE 3 - Notes (seulement si elles existent)
      const page3Element = element.querySelector('.pdf-page-3') as HTMLElement;
      if (page3Element && (invoice.notes || invoice.additionalInfo)) {
        pdf.addPage();
        
        const canvas3 = await html2canvas(page3Element, {
          ...canvasOptions,
          width: page3Element.scrollWidth,
          height: page3Element.scrollHeight
        });

        const imgData3 = canvas3.toDataURL('image/jpeg', 0.8);
        const imgWidth3 = pdfWidth;
        const imgHeight3 = (canvas3.height * pdfWidth) / canvas3.width;
        
        pdf.addImage(imgData3, 'JPEG', 0, 0, imgWidth3, Math.min(imgHeight3, pdfHeight));
      }

      // Vérifier la taille du PDF et ajuster si nécessaire
      const pdfOutput = pdf.output('blob');
      const fileSizeMB = pdfOutput.size / (1024 * 1024);
      
      if (fileSizeMB > 5) {
        console.warn(`PDF size (${fileSizeMB.toFixed(2)}MB) exceeds 5MB limit. Consider further optimization.`);
      }

      pdf.save(`${t('quoteNo').replace(':', '').toLowerCase()}-${invoice.number}.pdf`);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSharePublicLink = () => {
    if (invoice.publicUrl) {
      copyToClipboard(invoice.publicUrl);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = currentLanguage === 'en' ? 'en-US' : 
                   currentLanguage === 'de' ? 'de-DE' : 
                   currentLanguage === 'es' ? 'es-ES' : 
                   currentLanguage === 'it' ? 'it-IT' : 'fr-FR';
    return date.toLocaleDateString(locale);
  };

  const currencySymbol = getCurrencySymbol(invoice.currency || 'EUR');

  const handleDownloadRoadmap = async () => {
    if (!invoice.generateRoadmap || !invoice.roadmapData) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const roadmap: Roadmap = {
        id: Date.now().toString(),
        number: invoice.number.replace('DV', 'RM'),
        date: invoice.date,
        info: {
          projectName: invoice.roadmapData.projectName,
          clientName: invoice.clientInfo.name,
          companyName: invoice.companyInfo.name,
          companyLogo: invoice.companyInfo.logo,
          startDate: invoice.roadmapData.startDate,
          endDate: invoice.roadmapData.endDate,
          totalDuration: invoice.roadmapData.totalDuration,
          objectives: invoice.roadmapData.objectives,
        },
        phases: invoice.items
          .filter(item => !item.isIncluded)
          .map((item, index) => ({
            id: item.id,
            title: item.name,
            description: item.description,
            duration: `${item.quantity} ${item.quantity > 1 ? 'jours' : 'jour'}`,
            deliverables: item.description.split('\n').filter(d => d.trim()),
          })),
        notes: invoice.notes,
        additionalInfo: invoice.additionalInfo,
      };

      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '1000px';
      document.body.appendChild(tempDiv);

      const RoadmapPreview = (await import('./RoadmapPreview')).default;
      const { createRoot } = await import('react-dom/client');

      const root = createRoot(tempDiv);

      await new Promise<void>((resolve) => {
        root.render(
          React.createElement(RoadmapPreview, {
            roadmap,
            onBack: () => {},
            onEdit: () => {},
          })
        );
        setTimeout(resolve, 1000);
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = 297;

      const canvasOptions = {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 0,
        removeContainer: true
      };

      const pages = tempDiv.querySelectorAll('.pdf-page');

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const pageElement = pages[i] as HTMLElement;
        const canvas = await html2canvas(pageElement, {
          ...canvasOptions,
          width: pageElement.scrollWidth,
          height: pageElement.scrollHeight
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, Math.min(imgHeight, pdfHeight));
      }

      pdf.save(`roadmap-${invoice.number.replace('DV', 'RM')}.pdf`);

      root.unmount();
      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error('Erreur lors de la génération de la roadmap:', error);
      alert('Erreur lors de la génération de la roadmap. Veuillez réessayer.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec actions - OPTIMISÉ MOBILE */}
      <header className="bg-white border-b border-gray-100 print:hidden sticky top-0 z-10">
        <div className="w-full px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-16 gap-1 sm:gap-4">
            {/* Section gauche - Bouton retour + Logo/Titre compact */}
            <div className="flex items-center gap-1 sm:gap-3 min-w-0 flex-1">
              <button
                onClick={onBack}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium text-xs sm:text-base hidden xs:inline">{t('back')}</span>
              </button>
              
              <div className="flex items-center gap-1 sm:gap-3 min-w-0 flex-1">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-sm sm:text-xl font-bold text-gray-900 truncate">
                    <span className="sm:hidden">{t('quoteNo').replace(':', '')}</span>
                    <span className="hidden sm:inline">{t('quoteNo')} #{invoice.number}</span>
                  </h1>
                </div>
              </div>
            </div>

            {/* Section droite - Boutons d'action compacts */}
            <div className="flex gap-1 sm:gap-3 flex-shrink-0">
              {invoice.publicUrl && (
                <button
                  onClick={handleSharePublicLink}
                  className="bg-green-100 hover:bg-green-200 text-green-700 px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-1 text-xs sm:text-sm flex-shrink-0"
                >
                  {copied ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />}
                  <span className="hidden sm:inline">{copied ? t('copied') : t('share')}</span>
                </button>
              )}
              <button
                onClick={onEdit}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-1 text-xs sm:text-sm flex-shrink-0"
              >
                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('edit')}</span>
              </button>
              <button
                onClick={handlePrint}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-1 text-xs sm:text-sm flex-shrink-0"
              >
                <Printer className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('print')}</span>
              </button>
              <button
                onClick={handleDownload}
                className="bg-green-600 hover:bg-green-700 text-white px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-1 shadow-lg hover:shadow-xl text-xs sm:text-sm flex-shrink-0"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('pdf')}</span>
              </button>
              {invoice.generateRoadmap && (
                <button
                  onClick={handleDownloadRoadmap}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-1 shadow-lg hover:shadow-xl text-xs sm:text-sm flex-shrink-0"
                >
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Roadmap</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Contenu de la facture */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 print:p-0 print:max-w-none">
        <div 
          ref={printRef}
          className="bg-white shadow-lg print:shadow-none rounded-2xl overflow-hidden print:rounded-none"
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            lineHeight: '1.5'
          }}
        >
          {/* Styles CSS intégrés pour l'impression et PDF */}
          <style>{`
            @media print {
              body { 
                margin: 0; 
                padding: 0; 
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
              .print\\:hidden { display: none !important; }
              .print\\:p-0 { padding: 0 !important; }
              .print\\:shadow-none { box-shadow: none !important; }
              .print\\:max-w-none { max-width: none !important; }
              .print\\:rounded-none { border-radius: 0 !important; }
              
              .pdf-page-1, .pdf-page-2, .pdf-page-3 {
                page-break-after: always;
                break-after: page;
                height: 100vh;
                overflow: hidden;
                max-width: 794px; /* Largeur A4 fixe */
                margin: 0 auto;
              }
              
              .pdf-page-3:last-child {
                page-break-after: auto;
                break-after: auto;
              }
              
              .pdf-no-break {
                page-break-inside: avoid;
                break-inside: avoid;
              }

              /* Masquer les boutons de copie dans le PDF */
              .copy-button {
                display: none !important;
              }
            }
            
            /* Styles pour optimiser le PDF */
            .pdf-optimized {
              font-size: 14px;
              line-height: 1.4;
              max-width: 794px; /* Largeur A4 fixe pour éviter l'étirement */
              margin: 0 auto;
            }
            
            .pdf-optimized h1 { font-size: 24px; margin-bottom: 8px; }
            .pdf-optimized h2 { font-size: 20px; margin-bottom: 6px; }
            .pdf-optimized h3 { font-size: 18px; margin-bottom: 4px; }
            .pdf-optimized p { margin-bottom: 4px; }
            
            /* Styles spécifiques pour la page 2 pour éviter l'étirement */
            .pdf-page-2 {
              width: 794px !important;
              max-width: 794px !important;
              box-sizing: border-box;
            }
            
            .pdf-page-2 .grid {
              display: block !important;
            }
            
            .pdf-page-2 .grid > div {
              width: 100% !important;
              margin-bottom: 1rem;
            }
          `}</style>

          {/* PAGE 1 - Services et prix avec légère description */}
          <div className="pdf-page-1 pdf-optimized">
            <div className="p-6 sm:p-12 h-full flex flex-col">
              {/* Header avec logo et informations principales */}
              <div className="pdf-no-break mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-4 sm:mb-6 gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {invoice.companyInfo.logo ? (
                      <div className="w-16 h-12 sm:w-20 sm:h-20 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 p-2">
                        <img 
                          src={invoice.companyInfo.logo} 
                          alt={`Logo ${invoice.companyInfo.name}`}
                          className="max-w-full max-h-full object-contain"
                          style={{
                            width: 'auto',
                            height: 'auto',
                            maxWidth: '48px',
                            maxHeight: '48px'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-12 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg sm:text-xl">
                          {invoice.companyInfo.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                        {t('quoteNo')} #{invoice.number}
                      </h1>
                      <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span className="font-bold">{t('date')}: {formatDate(invoice.date)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations client et entreprise */}
              <div className="pdf-no-break mb-4 sm:mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-4 sm:mb-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">{t('quoteFrom')}</h3>
                    <div className="text-gray-600 space-y-1 text-sm sm:text-base">
                      <p className="font-medium text-gray-900">{invoice.companyInfo.name}</p>
                      <p>{invoice.companyInfo.address}</p>
                      <p>{invoice.companyInfo.postalCode} {invoice.companyInfo.city}</p>
                      <p>{invoice.companyInfo.country}</p>
                      <p>{invoice.companyInfo.email}</p>
                      {invoice.companyInfo.phone && <p>{invoice.companyInfo.phone}</p>}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">{t('quoteFor')}</h3>
                    <div className="text-gray-600 space-y-1 text-sm sm:text-base">
                      <p className="font-medium text-gray-900">{invoice.clientInfo.name}</p>
                      <p>{invoice.clientInfo.address}</p>
                      <p>{invoice.clientInfo.postalCode} {invoice.clientInfo.city}</p>
                      <p>{invoice.clientInfo.country}</p>
                      <p>{invoice.clientInfo.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations de référence */}
              <div className="pdf-no-break mb-4 sm:mb-6">
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <span className="text-gray-600 font-medium text-sm sm:text-base">{t('reference')}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-gray-900 text-sm sm:text-base">#{invoice.number}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <span className="text-gray-600 font-medium text-sm sm:text-base">{t('projectDuration')}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 text-sm sm:text-base">{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(currentLanguage === 'en' ? 'en-US' : currentLanguage === 'de' ? 'de-DE' : currentLanguage === 'es' ? 'es-ES' : currentLanguage === 'it' ? 'it-IT' : 'fr-FR')}</span>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                          30 {t('days')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tableau des services - VERSION SIMPLIFIÉE */}
              <div className="flex-1 mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">{t('proposedServices')}</h3>
                <div className="overflow-hidden border border-gray-200 rounded-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-semibold text-gray-900 text-sm sm:text-base">{t('service')}</th>
                          <th className="text-center py-3 sm:py-4 px-3 sm:px-6 font-semibold text-gray-900 text-sm sm:text-base">{t('qty')}</th>
                          <th className="text-right py-3 sm:py-4 px-3 sm:px-6 font-semibold text-gray-900 text-sm sm:text-base">Prix HT</th>
                          <th className="text-right py-3 sm:py-4 px-3 sm:px-6 font-semibold text-gray-900 text-sm sm:text-base">Total HT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.items.map((item, index) => {
                          const discount = item.discount || 0;
                          const discountedPrice = item.price * (1 - discount / 100);
                          const itemTotal = discountedPrice * item.quantity;
                          
                          return (
                            <tr key={index} className="border-b border-gray-100 last:border-b-0 pdf-no-break">
                              <td className="py-3 sm:py-4 px-3 sm:px-6">
                                <div>
                                  <p className="font-medium text-gray-900 text-sm sm:text-base">{item.name}</p>
                                  {discount > 0 && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <Percent className="w-3 h-3 text-green-600" />
                                      <span className="text-xs text-green-600 font-medium">Remise {discount}%</span>
                                    </div>
                                  )}
                                  {item.isIncluded && (
                                    <span className="inline-flex items-center gap-1 mt-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                      <Check className="w-3 h-3" />
                                      {t('serviceIncluded')}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 sm:py-4 px-3 sm:px-6 text-center text-gray-900 text-sm sm:text-base">{item.quantity.toString().padStart(2, '0')}</td>
                              <td className="py-3 sm:py-4 px-3 sm:px-6 text-right text-gray-900 text-sm sm:text-base">
                                {item.isIncluded ? (
                                  <span className="text-green-600 font-medium">{t('included').toUpperCase()}</span>
                                ) : (
                                  <div>
                                    {discount > 0 && (
                                      <div className="text-xs text-gray-500 line-through">
                                        {item.price.toFixed(2)} {currencySymbol}
                                      </div>
                                    )}
                                    <div>{discountedPrice.toFixed(2)} {currencySymbol}</div>
                                  </div>
                                )}
                              </td>
                              <td className="py-3 sm:py-4 px-3 sm:px-6 text-right font-medium text-gray-900 text-sm sm:text-base">
                                {item.isIncluded ? (
                                  <span className="text-green-600 font-medium">{t('included').toUpperCase()}</span>
                                ) : (
                                  `${itemTotal.toFixed(2)} ${currencySymbol}`
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Totaux - En bas de page 1 */}
              <div className="pdf-no-break mt-auto">
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                  <div className="flex justify-end">
                    <div className="w-full max-w-sm space-y-2 sm:space-y-3">
                      {(invoice.globalDiscount || 0) > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium text-sm sm:text-base">Sous-total avant remise:</span>
                          <span className="font-bold text-base sm:text-lg">
                            {(invoice.subtotal / (1 - (invoice.globalDiscount || 0) / 100)).toFixed(2)} {currencySymbol}
                          </span>
                        </div>
                      )}
                      {(invoice.globalDiscount || 0) > 0 && (
                        <div className="flex justify-between items-center text-green-600">
                          <span className="font-medium text-sm sm:text-base flex items-center gap-1">
                            <Percent className="w-4 h-4" />
                            Remise globale ({invoice.globalDiscount}%):
                          </span>
                          <span className="font-bold text-base sm:text-lg">
                            -{((invoice.subtotal / (1 - (invoice.globalDiscount || 0) / 100)) - invoice.subtotal).toFixed(2)} {currencySymbol}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium text-sm sm:text-base">Sous-total HT:</span>
                        <span className="font-bold text-base sm:text-lg">{invoice.subtotal.toFixed(2)} {currencySymbol}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium text-sm sm:text-base">{t('vat')} ({invoice.taxRate}%):</span>
                        <span className="font-bold text-base sm:text-lg">{invoice.tax.toFixed(2)} {currencySymbol}</span>
                      </div>
                      <div className="border-t border-gray-300 pt-2 sm:pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-lg sm:text-xl font-bold text-gray-900">{t('totalTTC')}:</span>
                          <span className="text-xl sm:text-2xl font-bold text-blue-600">
                            {invoice.total.toFixed(2)} {currencySymbol}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PAGE 2 - Détails complets et prix */}
          <div className="pdf-page-2 pdf-optimized">
            <div className="p-6 sm:p-12 min-h-screen">
              {/* Header de la page 2 */}
              <div className="pdf-no-break mb-6 sm:mb-8">
                <div className="text-center border-b border-gray-200 pb-4 sm:pb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    {t('quoteNo')} #{invoice.number} - {t('completeDetails')}
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {invoice.companyInfo.name} - {formatDate(invoice.date)}
                  </p>
                </div>
              </div>

              {/* Descriptions détaillées des services avec prix */}
              <div className="pdf-no-break mb-6 sm:mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 sm:p-8">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs sm:text-sm">📋</span>
                    </div>
                    {t('detailedFinancialSummary')}
                  </h3>
                  <div className="space-y-4 sm:space-y-6">
                    {invoice.items.map((item, index) => {
                      const discount = item.discount || 0;
                      const discountedPrice = item.price * (1 - discount / 100);
                      const itemTotal = discountedPrice * item.quantity;
                      
                      return (
                        <div key={index} className="border-b border-blue-200 last:border-b-0 pb-4 sm:pb-6 last:pb-0">
                          <div className="flex items-start justify-between mb-2 sm:mb-3">
                            <h4 className="font-semibold text-gray-900 text-base sm:text-lg flex-1">{item.name}</h4>
                            <div className="text-right ml-4 flex-shrink-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm text-gray-600">Quantité: {item.quantity}</span>
                                <span className="text-sm text-gray-600">×</span>
                                <span className="text-sm text-gray-600">
                                  {item.isIncluded ? t('included').toUpperCase() : `${discountedPrice.toFixed(2)} ${currencySymbol} HT`}
                                </span>
                              </div>
                              {discount > 0 && !item.isIncluded && (
                                <div className="text-xs text-green-600 mb-1 flex items-center gap-1">
                                  <Percent className="w-3 h-3" />
                                  Remise {discount}% (prix initial: {item.price.toFixed(2)} {currencySymbol})
                                </div>
                              )}
                              <span className="font-bold text-blue-600 text-base sm:text-lg">
                                {item.isIncluded ? t('serviceIncluded').toUpperCase() : `${itemTotal.toFixed(2)} ${currencySymbol} HT`}
                              </span>
                              {item.isIncluded && (
                                <span className="block text-xs sm:text-sm text-green-600 font-medium">{t('offeredInProposal')}</span>
                              )}
                            </div>
                          </div>
                          {item.description && (
                            <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-100">
                              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{item.description}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Récapitulatif financier détaillé */}
              <div className="pdf-no-break">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 sm:p-8">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs sm:text-sm">💰</span>
                    </div>
                    {t('detailedFinancialSummary')}
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Services payants */}
                    <div className="bg-white rounded-lg p-4 sm:p-6">
                      <h4 className="font-semibold text-gray-900 mb-3">{t('billedServices')}</h4>
                      <div className="space-y-2">
                        {invoice.items.filter(item => !item.isIncluded).map((item, index) => {
                          const discount = item.discount || 0;
                          const discountedPrice = item.price * (1 - discount / 100);
                          const itemTotal = discountedPrice * item.quantity;
                          
                          return (
                            <div key={item.id} className="flex justify-between text-sm">
                              <div className="flex-1">
                                <span className="text-gray-600">{item.name} (×{item.quantity})</span>
                                {discount > 0 && (
                                  <div className="text-xs text-green-600 flex items-center gap-1">
                                    <Percent className="w-3 h-3" />
                                    Remise {discount}%
                                  </div>
                                )}
                              </div>
                              <span className="font-medium">{itemTotal.toFixed(2)} {currencySymbol} HT</span>
                            </div>
                          );
                        })}
                        <div className="border-t pt-2 mt-3">
                          {(invoice.globalDiscount || 0) > 0 && (
                            <>
                              <div className="flex justify-between font-semibold">
                                <span>Sous-total avant remise globale:</span>
                                <span>{(invoice.subtotal / (1 - (invoice.globalDiscount || 0) / 100)).toFixed(2)} {currencySymbol}</span>
                              </div>
                              <div className="flex justify-between text-sm text-green-600">
                                <span className="flex items-center gap-1">
                                  <Percent className="w-3 h-3" />
                                  Remise globale ({invoice.globalDiscount}%):
                                </span>
                                <span>-{((invoice.subtotal / (1 - (invoice.globalDiscount || 0) / 100)) - invoice.subtotal).toFixed(2)} {currencySymbol}</span>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between font-semibold">
                            <span>{t('subtotalHT')}</span>
                            <span>{invoice.subtotal.toFixed(2)} {currencySymbol}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>{t('vat')} ({invoice.taxRate}%):</span>
                            <span>{invoice.tax.toFixed(2)} {currencySymbol}</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg text-green-600 border-t pt-2 mt-2">
                            <span>{t('totalTTC')}:</span>
                            <span>{invoice.total.toFixed(2)} {currencySymbol}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Services inclus */}
                    {invoice.items.some(item => item.isIncluded) && (
                      <div className="bg-green-100 rounded-lg p-4 sm:p-6 border border-green-300">
                        <h4 className="font-semibold text-green-800 mb-3">{t('offeredServices')}</h4>
                        <div className="space-y-2">
                          {invoice.items.filter(item => item.isIncluded).map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-green-700">{item.name} (×{item.quantity})</span>
                              <span className="font-medium text-green-800">{t('included').toUpperCase()}</span>
                            </div>
                          ))}
                          <div className="border-t border-green-300 pt-2 mt-3">
                            <p className="text-xs text-green-700 font-medium">
                              {t('offeredInProposal')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PAGE 3 - Notes et informations supplémentaires UNIQUEMENT */}
          {(invoice.notes || invoice.additionalInfo) && (
            <div className="pdf-page-3 pdf-optimized">
              <div className="p-6 sm:p-12 min-h-screen">
                {/* Header de la page 3 */}
                <div className="pdf-no-break mb-6 sm:mb-8">
                  <div className="text-center border-b border-gray-200 pb-4 sm:pb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                      {t('quoteNo')} #{invoice.number} - {t('notesAndInformation')}
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {invoice.companyInfo.name} - {formatDate(invoice.date)}
                    </p>
                  </div>
                </div>

                {/* Notes commerciales */}
                {invoice.notes && (
                  <div className="pdf-no-break mb-6 sm:mb-8">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 sm:p-8">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs sm:text-sm">💼</span>
                        </div>
                        {t('commercialNotes')}
                      </h3>
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                        {invoice.notes}
                      </div>
                    </div>
                  </div>
                )}

                {/* Informations supplémentaires */}
                {invoice.additionalInfo && (
                  <div className="pdf-no-break mb-6 sm:mb-8">
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 sm:p-8">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs sm:text-sm">ℹ️</span>
                        </div>
                        {t('additionalInformation')}
                      </h3>
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                        {invoice.additionalInfo}
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer avec informations légales */}
                <div className="pdf-no-break mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
                  <div className="text-center text-xs sm:text-sm text-gray-500 space-y-2 sm:space-y-3">
                    <p className="text-sm sm:text-base font-medium text-gray-700">
                      {t('quoteValidFor30Days')}
                    </p>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <p className="font-medium text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">{invoice.companyInfo.name}</p>
                      <p className="text-xs sm:text-sm">{invoice.companyInfo.address}</p>
                      <p className="text-xs sm:text-sm">{invoice.companyInfo.postalCode} {invoice.companyInfo.city}, {invoice.companyInfo.country}</p>
                      <p className="mt-1 sm:mt-2 text-xs sm:text-sm">
                        <span className="font-medium">{t('email')}:</span> {invoice.companyInfo.email}
                        {invoice.companyInfo.phone && (
                          <span className="ml-2 sm:ml-4"><span className="font-medium">{t('tel')}</span> {invoice.companyInfo.phone}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;