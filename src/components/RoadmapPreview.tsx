import React, { useRef } from 'react';
import { ArrowLeft, Edit, Download, Printer, Calendar, Target, TrendingUp, CheckCircle } from 'lucide-react';
import { Roadmap } from '../types/Roadmap';

interface RoadmapPreviewProps {
  roadmap: Roadmap;
  onBack: () => void;
  onEdit: () => void;
}

const RoadmapPreview: React.FC<RoadmapPreviewProps> = ({ roadmap, onBack, onEdit }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const element = printRef.current;
    if (!element) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

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

      const pages = element.querySelectorAll('.pdf-page');

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

      pdf.save(`roadmap-${roadmap.number}.pdf`);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 print:hidden sticky top-0 z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium hidden sm:inline">Retour</span>
              </button>

              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold text-gray-900 truncate">
                    Roadmap #{roadmap.number}
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onEdit}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Modifier</span>
              </button>
              <button
                onClick={handlePrint}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Imprimer</span>
              </button>
              <button
                onClick={handleDownload}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">PDF</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div ref={printRef} className="max-w-[1000px] mx-auto p-8">
        <div className="pdf-page bg-white rounded-xl shadow-lg p-12 mb-8">
          <div className="mb-8">
            {roadmap.info.companyLogo && (
              <img
                src={roadmap.info.companyLogo}
                alt="Logo"
                className="h-16 object-contain mb-6"
              />
            )}
            <div className="border-b-4 border-purple-600 pb-4">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Roadmap de projet</h1>
              <p className="text-xl text-gray-600">{roadmap.info.projectName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Numéro de roadmap</p>
              <p className="text-lg font-bold text-gray-900">{roadmap.number}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Date de création</p>
              <p className="text-lg font-bold text-gray-900">{formatDate(roadmap.date)}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Client</p>
              <p className="text-lg font-bold text-gray-900">{roadmap.info.clientName}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Entreprise</p>
              <p className="text-lg font-bold text-gray-900">{roadmap.info.companyName}</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-600" />
              Calendrier du projet
            </h2>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Date de début</p>
                <p className="text-lg font-bold text-gray-900">{formatDate(roadmap.info.startDate)}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Date de fin</p>
                <p className="text-lg font-bold text-gray-900">{formatDate(roadmap.info.endDate)}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Durée totale</p>
                <p className="text-lg font-bold text-gray-900">{roadmap.info.totalDuration}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-purple-600" />
              Objectifs du projet
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{roadmap.info.objectives}</p>
          </div>

          {roadmap.info.keyStakeholders && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Parties prenantes</h2>
              <p className="text-gray-700">{roadmap.info.keyStakeholders}</p>
            </div>
          )}

          {roadmap.info.budget && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Budget</h2>
              <p className="text-2xl font-bold text-purple-600">{roadmap.info.budget}</p>
            </div>
          )}
        </div>

        {roadmap.phases.map((phase, index) => (
          <div key={phase.id} className="pdf-page bg-white rounded-xl shadow-lg p-12 mb-8">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {index + 1}
                </div>
                <h2 className="text-3xl font-bold text-gray-900">{phase.title}</h2>
              </div>
              <div className="border-l-4 border-purple-600 pl-6">
                <p className="text-gray-700 leading-relaxed mb-4">{phase.description}</p>

                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Durée</p>
                    <p className="text-lg font-bold text-gray-900">{phase.duration}</p>
                  </div>
                  {phase.startDate && (
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-1">Début</p>
                      <p className="text-lg font-bold text-gray-900">{formatDate(phase.startDate)}</p>
                    </div>
                  )}
                  {phase.endDate && (
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-1">Fin</p>
                      <p className="text-lg font-bold text-gray-900">{formatDate(phase.endDate)}</p>
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Livrables
                  </h3>
                  <ul className="space-y-3">
                    {phase.deliverables.map((deliverable, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}

        {(roadmap.notes || roadmap.additionalInfo) && (
          <div className="pdf-page bg-white rounded-xl shadow-lg p-12">
            {roadmap.notes && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Notes</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{roadmap.notes}</p>
              </div>
            )}

            {roadmap.additionalInfo && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Informations supplémentaires</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{roadmap.additionalInfo}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body {
            background: white;
          }
          .pdf-page {
            page-break-after: always;
            box-shadow: none;
            margin: 0;
            padding: 20mm;
          }
          .pdf-page:last-child {
            page-break-after: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default RoadmapPreview;
