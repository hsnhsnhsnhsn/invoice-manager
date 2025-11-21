import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Calendar, Target, Building2, User, FileText, TrendingUp } from 'lucide-react';
import { Roadmap, RoadmapPhase, RoadmapInfo } from '../types/Roadmap';

interface RoadmapFormProps {
  roadmap: Roadmap | null;
  onSave: (roadmap: Roadmap) => void;
  onCancel: () => void;
  isEdit: boolean;
}

const RoadmapForm: React.FC<RoadmapFormProps> = ({ roadmap, onSave, onCancel, isEdit }) => {
  const [formData, setFormData] = useState<Roadmap>({
    id: '',
    number: '',
    date: new Date().toISOString().split('T')[0],
    info: {
      projectName: '',
      clientName: '',
      companyName: '',
      companyLogo: '',
      startDate: '',
      endDate: '',
      totalDuration: '',
      objectives: '',
      keyStakeholders: '',
      budget: ''
    },
    phases: [],
    notes: '',
    additionalInfo: ''
  });

  useEffect(() => {
    if (roadmap) {
      setFormData(roadmap);
    } else {
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

      setFormData(prev => ({
        ...prev,
        number: `RM${year}${month}${day}${random}`
      }));
    }
  }, [roadmap]);

  const updateFormData = (updates: Partial<Roadmap>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const updateInfo = (updates: Partial<RoadmapInfo>) => {
    setFormData(prev => ({
      ...prev,
      info: { ...prev.info, ...updates }
    }));
  };

  const handlePhaseChange = (index: number, field: keyof RoadmapPhase, value: any) => {
    const newPhases = [...formData.phases];
    if (field === 'deliverables' && typeof value === 'string') {
      newPhases[index] = {
        ...newPhases[index],
        deliverables: value.split('\n').filter(d => d.trim() !== '')
      };
    } else {
      newPhases[index] = { ...newPhases[index], [field]: value };
    }
    updateFormData({ phases: newPhases });
  };

  const addPhase = () => {
    const newPhase: RoadmapPhase = {
      id: Date.now().toString(),
      title: '',
      description: '',
      duration: '',
      deliverables: [],
      startDate: '',
      endDate: ''
    };
    updateFormData({ phases: [...formData.phases, newPhase] });
  };

  const removePhase = (index: number) => {
    const newPhases = formData.phases.filter((_, i) => i !== index);
    updateFormData({ phases: newPhases });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateInfo({ companyLogo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={onCancel}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Retour</span>
              </button>
              <div className="hidden sm:block h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">
                {isEdit ? 'Modifier la roadmap' : 'Nouvelle roadmap'}
              </h1>
            </div>

            <button
              type="submit"
              form="roadmap-form"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Save className="w-4 h-4" />
              {isEdit ? 'Mettre à jour' : 'Générer le PDF'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form id="roadmap-form" onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Informations générales</h2>
                <p className="text-gray-600">Détails de la roadmap</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Numéro de roadmap
                </label>
                <input
                  type="text"
                  value={formData.number}
                  onChange={(e) => updateFormData({ number: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  placeholder="RM240101001"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Date de création
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => updateFormData({ date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Détails du projet</h2>
                <p className="text-gray-600">Informations sur le projet et les parties prenantes</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Nom du projet
                  </label>
                  <input
                    type="text"
                    value={formData.info.projectName}
                    onChange={(e) => updateInfo({ projectName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Nom du client
                  </label>
                  <input
                    type="text"
                    value={formData.info.clientName}
                    onChange={(e) => updateInfo({ clientName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Nom de votre entreprise
                  </label>
                  <input
                    type="text"
                    value={formData.info.companyName}
                    onChange={(e) => updateInfo({ companyName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Logo de l'entreprise
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={formData.info.startDate}
                    onChange={(e) => updateInfo({ startDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={formData.info.endDate}
                    onChange={(e) => updateInfo({ endDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Durée totale
                  </label>
                  <input
                    type="text"
                    value={formData.info.totalDuration}
                    onChange={(e) => updateInfo({ totalDuration: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ex: 6 mois"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Objectifs du projet
                </label>
                <textarea
                  value={formData.info.objectives}
                  onChange={(e) => updateInfo({ objectives: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Parties prenantes (optionnel)
                  </label>
                  <input
                    type="text"
                    value={formData.info.keyStakeholders || ''}
                    onChange={(e) => updateInfo({ keyStakeholders: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Budget (optionnel)
                  </label>
                  <input
                    type="text"
                    value={formData.info.budget || ''}
                    onChange={(e) => updateInfo({ budget: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ex: 50 000€"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Phases du projet</h2>
                  <p className="text-gray-600">Définissez les différentes étapes de votre projet</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addPhase}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Ajouter une phase
              </button>
            </div>

            {formData.phases.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Aucune phase ajoutée</p>
                <p className="text-sm">Cliquez sur "Ajouter une phase" pour commencer</p>
              </div>
            ) : (
              <div className="space-y-6">
                {formData.phases.map((phase, index) => (
                  <div key={phase.id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Phase {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removePhase(index)}
                        className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Titre de la phase
                        </label>
                        <input
                          type="text"
                          value={phase.title}
                          onChange={(e) => handlePhaseChange(index, 'title', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Description
                        </label>
                        <textarea
                          value={phase.description}
                          onChange={(e) => handlePhaseChange(index, 'description', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white min-h-[80px]"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Durée
                          </label>
                          <input
                            type="text"
                            value={phase.duration}
                            onChange={(e) => handlePhaseChange(index, 'duration', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                            placeholder="Ex: 2 semaines"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Date de début
                          </label>
                          <input
                            type="date"
                            value={phase.startDate || ''}
                            onChange={(e) => handlePhaseChange(index, 'startDate', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Date de fin
                          </label>
                          <input
                            type="date"
                            value={phase.endDate || ''}
                            onChange={(e) => handlePhaseChange(index, 'endDate', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Livrables (un par ligne)
                        </label>
                        <textarea
                          value={phase.deliverables.join('\n')}
                          onChange={(e) => handlePhaseChange(index, 'deliverables', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white min-h-[100px]"
                          placeholder="Livrable 1&#10;Livrable 2&#10;Livrable 3"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Notes et informations supplémentaires</h2>
                <p className="text-gray-600">Ajoutez des détails complémentaires</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Notes
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => updateFormData({ notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px]"
                  placeholder="Ajoutez vos notes ici..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Informations supplémentaires
                </label>
                <textarea
                  value={formData.additionalInfo || ''}
                  onChange={(e) => updateFormData({ additionalInfo: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px]"
                  placeholder="Conditions, risques, hypothèses..."
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoadmapForm;
