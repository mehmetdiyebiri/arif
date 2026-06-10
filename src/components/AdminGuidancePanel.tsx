import React, { useState } from 'react';
import { FileText, Download, CheckCircle, Clock, Search, Send, CheckSquare, FileEdit, PlusCircle, Trash2, User, Eye, X } from 'lucide-react';
import { INITIAL_GUIDANCE_FORMS_CONFIG } from '../lib/guidanceForms';
import { formatClassLabel } from '../lib/utils';
import { AdminSurveysPanel } from './AdminSurveysPanel';

const PreviewModal = ({ config, onClose }: { config: any, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
      <div className="bg-[#F8FAFC] rounded-[40px] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-3 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl shadow-lg transition-all z-10"
        >
          <X size={24}/>
        </button>

        <div className="p-8 md:p-12">
            <div className="mb-10 text-center">
                <span className="bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">Öğrenci Ekranı Önizlemesi</span>
                <h1 className="text-4xl font-black text-blue-900 tracking-tight">{config.title || 'Başlıksız Form'}</h1>
                <p className="text-gray-400 font-bold mt-2 max-w-2xl mx-auto">{config.desc || 'Açıklama bulunmuyor.'}</p>
            </div>

            <div className="space-y-8 max-w-4xl mx-auto">
                {config.type === 'yes_no' && (
                    <div className="space-y-4">
                        {config.questions.map((q: any, idx: number) => {
                            const qText = typeof q === 'string' ? q : (q.text || q.a || q.title || `Soru ${idx + 1}`);
                            return (
                                <div key={idx} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                                    <p className="font-bold text-gray-800 mb-6 text-lg tracking-tight">
                                        <span className="text-blue-600 font-black mr-3">{idx + 1}.</span>
                                        {qText}
                                    </p>
                                    <div className="flex gap-4">
                                        <div className="flex-1 p-5 rounded-2xl border-2 border-gray-100 text-gray-400 font-black text-xs uppercase tracking-widest text-center">EVET</div>
                                        <div className="flex-1 p-5 rounded-2xl border-2 border-gray-100 text-gray-400 font-black text-xs uppercase tracking-widest text-center">HAYIR</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {config.type === 'multiple_choice' && (
                    <div className="space-y-4">
                        {config.questions.map((q: any, idx: number) => {
                            const qText = typeof q === 'string' ? q : (q.text || q.a || q.title || `Soru ${idx + 1}`);
                            return (
                                <div key={idx} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                                    <p className="font-bold text-gray-800 mb-6 text-lg tracking-tight">
                                        <span className="text-blue-600 font-black mr-3">{idx + 1}.</span>
                                        {qText}
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {['Seçenek 1', 'Seçenek 2', 'Seçenek 3', 'Seçenek 4'].map(opt => (
                                            <div key={opt} className="p-4 rounded-2xl border-2 border-gray-100 text-gray-400 font-bold text-xs text-center">{opt}</div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {(config.type !== 'yes_no' && config.type !== 'multiple_choice') && (
                    <div className="p-12 bg-white rounded-[40px] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center text-center opacity-60">
                        <FileText size={64} className="text-gray-200 mb-6"/>
                        <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">Özel Şablon Önizlemesi</h3>
                        <p className="text-gray-300 font-bold mt-2">Bu şablon tipi ({config.type}) için dinamik önizleme yakında eklenecektir.<br/>Form kaydedildikten sonra öğrenci ekranında doğru şablonda görünecektir.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export const AdminGuidancePanel = ({ state, actions }: any) => {
  const { 
    guidanceForms, users, classes, guidanceFilterForm, guidanceFilterClass, guidanceFilterStatus, guidanceSearchQuery, 
    guidanceTab, guidanceAssignments, selectedClass, selectedStudent, guidanceFormConfigs
  } = state;
  
  const { 
    setGuidanceFilterForm, setGuidanceFilterClass, setGuidanceFilterStatus, setGuidanceSearchQuery, setGuidanceTab,
    handleDownloadGuidancePDF, handleAssignGuidanceForm, handleDeleteGuidanceAssignment,
    handleSaveGuidanceConfig, handleDeleteGuidanceConfig
  } = actions;

  const [isCreating, setIsCreating] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [editorData, setEditorData] = useState({
    title: '',
    desc: '',
    type: 'yes_no',
    questions: ['']
  });

  const newAssignmentInitialState = {
    formId: '',
    targetType: 'class', // 'class' or 'student'
    targetClass: '',
    targetStudent: ''
  };
  const [newAssignment, setNewAssignment] = useState(newAssignmentInitialState);

  const allConfigs = React.useMemo(() => {
     const map = new Map();
     INITIAL_GUIDANCE_FORMS_CONFIG.forEach(c => map.set(c.id, c));
     guidanceFormConfigs.forEach((c: any) => map.set(c.id, c));
     return Array.from(map.values());
  }, [guidanceFormConfigs]);

  const handleStartCreate = () => {
    setEditorData({ title: '', desc: '', type: 'yes_no', questions: [''] });
    setEditingConfig(null);
    setIsCreating(true);
  };

  const handleStartEdit = (config: any) => {
    // Only allow editing custom ones for now to keep it simple, or clone static ones
    setEditorData({
      title: config.title,
      desc: config.desc || '',
      type: config.type,
      questions: config.questions || ['']
    });
    setEditingConfig(config);
    setIsCreating(true);
  };

  const handleAddQuestion = () => {
    setEditorData(prev => ({ ...prev, questions: [...prev.questions, ''] }));
  };

  const handleRemoveQuestion = (index: number) => {
    setEditorData(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== index) }));
  };

  const handleQuestionChange = (index: number, val: string) => {
    const newQs = [...editorData.questions];
    if (typeof newQs[index] === 'object' && newQs[index] !== null) {
        // If it's the specific devamsızlık format or general object format:
        if (newQs[index].hasOwnProperty('text')) {
           newQs[index] = { ...newQs[index], text: val };
        } else if (newQs[index].hasOwnProperty('a')) {
           newQs[index] = { ...newQs[index], a: val };
        } else if (newQs[index].hasOwnProperty('title')) {
           newQs[index] = { ...newQs[index], title: val };
        } else {
           newQs[index] = val; 
        }
    } else {
        newQs[index] = val;
    }
    setEditorData(prev => ({ ...prev, questions: newQs }));
  };

  const handleSave = async () => {
    const dataToSave = {
      ...editorData,
      id: editingConfig?.id // will be undefined for new ones
    };
    await handleSaveGuidanceConfig(dataToSave);
    setIsCreating(false);
  };

  const students = users.filter((u: any) => u.role === 'student');

  const renderAssignView = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
      {/* New Assignment Form */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-black text-blue-900 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <PlusCircle size={20}/>
          </div>
          Yeni Form Ata
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">FORM SEÇİMİ</label>
            <select 
              value={newAssignment.formId} 
              onChange={e => setNewAssignment({...newAssignment, formId: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 py-3 px-4 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer appearance-none"
            >
              <option value="">-- Form Seçiniz --</option>
              {allConfigs.map(f => (
                <option key={f.id} value={f.id}>{f.title}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">HEDEF KİTLE</label>
            <select 
              value={newAssignment.targetType} 
              onChange={e => setNewAssignment({...newAssignment, targetType: e.target.value, targetStudent: ''})}
              className="w-full bg-gray-50 border border-gray-200 py-3 px-4 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer appearance-none"
            >
              <option value="class">Tüm Sınıf</option>
              <option value="student">Belirli Öğrenci</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">SINIF</label>
            <select 
              value={newAssignment.targetClass} 
              onChange={e => setNewAssignment({...newAssignment, targetClass: e.target.value, targetStudent: ''})}
              className="w-full bg-gray-50 border border-gray-200 py-3 px-4 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer appearance-none disabled:opacity-50"
            >
              <option value="">Seçiniz</option>
              {Object.keys(classes).sort().map(c => (
                <option key={c} value={c}>{formatClassLabel(c)}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">ÖĞRENCİ</label>
            <select 
              value={newAssignment.targetStudent} 
              onChange={e => setNewAssignment({...newAssignment, targetStudent: e.target.value})}
              disabled={newAssignment.targetType !== 'student' || !newAssignment.targetClass}
              className="w-full bg-gray-50 border border-gray-200 py-3 px-4 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer appearance-none disabled:opacity-50"
            >
              <option value="">Öğrenci Seçiniz</option>
              {newAssignment.targetClass && classes[newAssignment.targetClass]?.map((s: string) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => {
              handleAssignGuidanceForm(newAssignment.formId, newAssignment.targetType, newAssignment.targetClass, newAssignment.targetStudent);
              setNewAssignment({ formId: '', targetType: 'class', targetClass: '', targetStudent: '' });
            }}
            disabled={!newAssignment.formId || !newAssignment.targetClass || (newAssignment.targetType === 'student' && !newAssignment.targetStudent)}
            className="bg-blue-600 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:shadow-none"
          >
            Ata
          </button>
        </div>
      </div>

      {/* Active Assignments Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50">
          <h3 className="text-lg font-black text-blue-900 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
              <FileText size={20}/>
            </div>
            Aktif Form Atamaları
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#FBFCFE] text-[10px] font-black text-gray-400 uppercase tracking-widest border-y border-gray-50">
              <tr>
                <th className="px-8 py-5">FORM ADI</th>
                <th className="px-8 py-5">HEDEF SINIF</th>
                <th className="px-8 py-5">HEDEF ÖĞRENCİ</th>
                <th className="px-8 py-5">ATAMA TARİHİ</th>
                <th className="px-8 py-5 text-right font-bold uppercase tracking-widest">İŞLEM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {guidanceAssignments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-gray-400 font-bold">Henüz atanmış bir form bulunmuyor.</td>
                </tr>
              ) : (
                guidanceAssignments.map(asgn => (
                  <tr key={asgn.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5 font-bold text-gray-900">{allConfigs.find(f => f.id === asgn.formId)?.title || asgn.formId}</td>
                    <td className="px-8 py-5 text-sm font-bold text-gray-500">{formatClassLabel(asgn.targetClass)}</td>
                    <td className="px-8 py-5">
                      {asgn.targetType === 'class' ? (
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest leading-none block w-max">TÜM SINIF</span>
                      ) : (
                        <span className="text-sm font-bold text-gray-700">{asgn.targetStudent}</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-gray-500">{new Date(asgn.createdAt).toLocaleDateString('tr-TR')}</td>
                    <td className="px-8 py-5 text-right">
                      <button onClick={() => handleDeleteGuidanceAssignment(asgn.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={18}/>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderResponsesView = () => {
    // If a student is selected in the global header, show their specific responses
    if (selectedStudent) {
      const studentForms = guidanceForms.filter((f: any) => f.studentId === selectedStudent || f.fullName === selectedStudent);
      
      return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col items-center justify-center p-12 text-center animate-in slide-in-from-bottom-4 duration-300">
          {studentForms.length === 0 ? (
            <>
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 mb-6">
                <FileText size={40}/>
              </div>
              <p className="text-gray-400 font-bold text-sm">Bu öğrenci henüz bir rehberlik formu/anketi doldurmamış.</p>
            </>
          ) : (
            <div className="w-full text-left">
               <h3 className="text-lg font-black text-blue-900 mb-6 px-4">{selectedStudent} - Form Yanıtları</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {studentForms.map((form: any) => (
                   <div key={form.id} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 hover:border-blue-300 transition-all group">
                     <div className="flex items-center gap-4 mb-6">
                       <div className="p-3 bg-white text-blue-600 rounded-2xl shadow-sm">
                         <FileText size={20}/>
                       </div>
                       <h4 className="font-bold text-gray-900 leading-tight">
                         {allConfigs.find(f => f.id === form.formType)?.title || form.formType}
                       </h4>
                     </div>
                     <div className="flex items-center justify-between mt-auto">
                        <span className="text-[10px] font-bold text-gray-400">{new Date(form.createdAt).toLocaleDateString('tr-TR')}</span>
                        <button onClick={() => handleDownloadGuidancePDF(form, selectedStudent)} className="p-2 bg-white text-blue-600 rounded-xl shadow-sm hover:bg-blue-600 hover:text-white transition-all">
                          <Download size={18}/>
                        </button>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>
      );
    }

    // Default responses view with filters
    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 block mb-2">Form Türü</label>
                  <select value={guidanceFilterForm} onChange={e=>setGuidanceFilterForm(e.target.value)} className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all cursor-pointer">
                      <option value="">Tüm Formlar</option>
                      {allConfigs.map((config) => (
                          <option key={config.id} value={config.id}>{config.title}</option>
                      ))}
                  </select>
              </div>
              <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 block mb-2">Sınıf</label>
                  <select value={guidanceFilterClass} onChange={e=>setGuidanceFilterClass(e.target.value)} className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all cursor-pointer">
                      <option value="">Tüm Sınıflar</option>
                      {Object.keys(classes).sort().map(c => <option key={c} value={c}>{formatClassLabel(c)}</option>)}
                  </select>
              </div>
              <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 block mb-2">Öğrenci Ara</label>
                  <div className="relative">
                      <input type="text" value={guidanceSearchQuery} onChange={e=>setGuidanceSearchQuery(e.target.value)} placeholder="İsim ile ara..." className="w-full border border-gray-200 bg-gray-50 p-3 pl-10 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all"/>
                      <Search className="absolute left-3.5 top-3.5 text-gray-400" size={16}/>
                  </div>
              </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#FBFCFE] text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
              <tr>
                <th className="px-8 py-5">ÖĞRENCİ</th>
                <th className="px-8 py-5">SINIF</th>
                <th className="px-8 py-5">FORM ADI</th>
                <th className="px-8 py-5">DURUM</th>
                <th className="px-8 py-5">TARİH</th>
                <th className="px-8 py-5 text-right">İŞLEM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
                {students
                  .filter((s: any) => !guidanceFilterClass || s.classLevel === guidanceFilterClass)
                  .filter((s: any) => !guidanceSearchQuery || (s.name && s.name.toLowerCase().includes(guidanceSearchQuery?.toLowerCase() || '')))
                  .flatMap((student: any) => {
                      // 1. Identify all forms that are actually assigned to this student
                      const assignedFormIds = guidanceAssignments.filter((asgn: any) => {
                          if (!asgn.formId) return false;
                          // If assigned to their class
                          if (asgn.targetType === 'class' && asgn.targetClass && student.classLevel) {
                              return asgn.targetClass === student.classLevel;
                          }
                          // If assigned to them individually (by name, username, or id)
                          if (asgn.targetType === 'student') {
                              return asgn.targetStudent === student.name || 
                                     asgn.targetStudent === student.username || 
                                     asgn.targetStudent === student.id;
                          }
                          return false;
                      }).map((asgn: any) => asgn.formId);

                      // 2. Identify all forms that this student has actually filled out
                      const completedFormIds = guidanceForms.filter((f: any) => {
                          const sId = student.id;
                          const sName = student.name;
                          return (f.studentId && f.studentId === sId) || (f.fullName && f.fullName === sName);
                      }).map((f: any) => f.formType);

                      // 3. Union of assigned and completed
                      const allStudentFormKeys = Array.from(new Set([...assignedFormIds, ...completedFormIds])).filter(Boolean);

                      // 4. Apply form type filter
                      const formsToDisplay = guidanceFilterForm 
                        ? (allStudentFormKeys.includes(guidanceFilterForm) ? [guidanceFilterForm] : []) 
                        : allStudentFormKeys;

                      return formsToDisplay.map(formKey => {
                          const formConfig = allConfigs.find(f => f.id === formKey);
                          if (!formConfig) return null;

                          const formRecord = guidanceForms.find((f: any) => 
                              (f.studentId === student.id || f.fullName === student.name) && 
                              f.formType === formKey
                          );
                          const isCompleted = !!formRecord;
                          
                          if (guidanceFilterStatus === 'completed' && !isCompleted) return null;
                          if (guidanceFilterStatus === 'pending' && isCompleted) return null;

                          return {
                              id: `${student.id}-${formKey}`,
                              student,
                              formConfig,
                              formRecord,
                              isCompleted
                          };
                      }).filter(Boolean);
                  })
                  .map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5 font-bold text-gray-900">{item.student.name}</td>
                      <td className="px-8 py-5 font-bold text-gray-500">{formatClassLabel(item.student.classLevel)}</td>
                      <td className="px-8 py-5 font-bold text-gray-700">{item.formConfig.title}</td>
                      <td className="px-8 py-5">
                          {item.isCompleted ? (
                              <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-[10px] font-black uppercase w-max tracking-tighter"><CheckCircle size={12}/> DOLDURULDU</span>
                          ) : (
                              <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-md text-[10px] font-black uppercase w-max tracking-tighter"><Clock size={12}/> BEKLİYOR</span>
                          )}
                      </td>
                      <td className="px-8 py-5 font-medium text-gray-400">
                          {item.isCompleted ? new Date(item.formRecord.createdAt).toLocaleDateString('tr-TR') : '-'}
                      </td>
                      <td className="px-8 py-5 text-right">
                          {item.isCompleted && (
                              <button onClick={() => handleDownloadGuidancePDF(item.formRecord, item.student.name)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                                <Download size={18}/>
                              </button>
                          )}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderEditView = () => {
    if (isCreating) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-300">
          {/* Left Column: Form Settings */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-full">
              <h3 className="text-lg font-black text-blue-900 mb-8 flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <FileEdit size={18}/>
                </div>
                Form Ayarları
              </h3>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">FORM BAŞLIĞI</label>
                  <input 
                    type="text" 
                    value={editorData.title}
                    onChange={e => setEditorData({...editorData, title: e.target.value})}
                    placeholder="Yeni Form"
                    className="w-full bg-gray-50 border border-gray-200 py-3 px-4 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">AÇIKLAMA / YÖNERGE</label>
                  <textarea 
                    value={editorData.desc}
                    onChange={e => setEditorData({...editorData, desc: e.target.value})}
                    placeholder="Açıklama"
                    rows={4}
                    className="w-full bg-gray-50 border border-gray-200 py-3 px-4 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">ŞABLON TİPİ</label>
                  <select 
                    value={editorData.type}
                    onChange={e => setEditorData({...editorData, type: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 py-3 px-4 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer appearance-none"
                  >
                    <option value="yes_no">Evet / Hayır Seçenekli Form</option>
                    <option value="multiple_choice">Çoktan Seçmeli (Örn: Devamsızlık)</option>
                    <option value="checklist_with_inputs">Çoklu Seçim + Açıklamalı</option>
                    <option value="riba">A / B İkili Seçenek (RİBA)</option>
                    <option value="open_ended">Klasik Açık Uçlu (Otobiyografi)</option>
                    <option value="matrix">Matris / Tablo (Kime Göre...)</option>
                    <option value="problem_tarama">Karma (Başarısızlık Nedenleri)</option>
                    <option value="sosyometri">Sosyometri (Arkadaş Seçimi)</option>
                    <option value="timetable">Zaman Çizelgesi / Program</option>
                    <option value="story_matrix">Hikayeli Matris (ŞMA)</option>
                    <option value="calisma_davranisi">Çalışma Davranışı Değerlendirme Ölçeği</option>
                    <option value="holland">Holland Mesleki Tercih Envanteri</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => setShowPreview(true)}
                    className="w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all flex items-center justify-center gap-2 border border-emerald-100"
                  >
                    <Eye size={18}/> Ön İzleme Yap
                  </button>
                </div>

                <div className="pt-6 grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setIsCreating(false)}
                    className="w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 bg-gray-50 hover:bg-gray-100 transition-all"
                  >
                    Vazgeç
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={!editorData.title}
                    className="w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-blue-600 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Question & Content Management */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-h-full">
              <h3 className="text-lg font-black text-blue-900 mb-8 flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <CheckSquare size={18}/>
                </div>
                Soru ve İçerik Yönetimi
              </h3>

              <div className="space-y-4">
                            {editorData.questions.map((q, idx) => {
                              const qText = typeof q === 'string' ? q : (q.text || q.a || q.title || `Soru ${idx + 1}`);
                              return (
                                <div key={idx} className="group relative">
                                  <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[10px] font-black text-gray-400 shadow-sm border border-gray-100">
                                      {idx + 1}
                                    </div>
                                    <input 
                                      type="text" 
                                      value={qText}
                                      onChange={e => handleQuestionChange(idx, e.target.value)}
                                      placeholder="Örnek Soru/Madde Metni"
                                      className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-gray-700"
                                    />
                                    <button 
                                      onClick={() => handleRemoveQuestion(idx)}
                                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                      <Trash2 size={18}/>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}

                <button 
                  onClick={handleAddQuestion}
                  className="w-full py-6 mt-4 border-2 border-dashed border-blue-100 rounded-2xl flex items-center justify-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest hover:bg-blue-50 hover:border-blue-200 transition-all"
                >
                  <PlusCircle size={18}/> Yeni Soru/Madde Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-black text-blue-900">Sistemdeki Formlar & Anketler</h3>
            <p className="text-gray-400 font-bold text-sm mt-1 tracking-tight">Öğrencilere atanabilir tüm formların listesi.</p>
          </div>
          <button 
            onClick={handleStartCreate}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
          >
            <PlusCircle size={20}/> Yeni Form Oluştur
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allConfigs.map((form) => (
            <div key={form.id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:border-blue-300 transition-all group cursor-pointer relative overflow-hidden">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <FileText size={24}/>
              </div>
              
              <h4 className="text-lg font-black text-blue-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors tracking-tight">{form.title}</h4>
              <p className="text-gray-500 text-[15px] font-medium line-clamp-3 mb-8 leading-relaxed tracking-tight">{form.desc || 'Açıklama bulunmuyor.'}</p>
              
              <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-auto">
                <div className="flex flex-wrap gap-3">
                  <span className="bg-blue-50 text-blue-600 px-5 py-2.5 rounded-xl text-[15px] font-bold tracking-tight">
                    {form.type === 'checklist_with_inputs' ? 'Karma Form' : 
                     form.type === 'yes_no' ? 'Evet/Hayır' : 
                     form.type === 'riba' ? 'İkili Seçenek (RİBA)' : 
                     form.type === 'matrix' ? 'Matris' : 
                     form.type === 'problem_tarama' ? 'Seçim/Açıklama' : 
                     form.type === 'multiple_choice' ? 'Çoktan Seçmeli' : 
                     form.type === 'open_ended' ? 'Açık Uçlu' : 'Anket'}
                  </span>
                  <span className="bg-orange-50 text-orange-600 px-5 py-2.5 rounded-xl text-[15px] font-bold tracking-tight">
                    {form.questions?.length || 0} Soru
                  </span>
                </div>
                
                {/* Actions overlay or bottom buttons */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleStartEdit(form); }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl"
                  >
                    <FileEdit size={18}/>
                  </button>
                  {form.createdBy && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteGuidanceConfig(form.id); }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 size={18}/>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Sub Navbar */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button 
          onClick={() => setGuidanceTab('assign')}
          className={`flex items-center gap-2.5 px-6 py-4 text-sm font-bold transition-all border-b-2 tracking-tight ${guidanceTab === 'assign' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <Send size={18} className={guidanceTab === 'assign' ? 'text-blue-600' : 'text-gray-400'}/> Form Ata / Gönder
        </button>
        <button 
          onClick={() => setGuidanceTab('responses')}
          className={`flex items-center gap-2.5 px-6 py-4 text-sm font-bold transition-all border-b-2 tracking-tight ${guidanceTab === 'responses' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <CheckSquare size={18} className={guidanceTab === 'responses' ? 'text-blue-600' : 'text-gray-400'}/> Öğrenci Yanıtları
        </button>
        <button 
          onClick={() => setGuidanceTab('edit')}
          className={`flex items-center gap-2.5 px-6 py-4 text-sm font-bold transition-all border-b-2 tracking-tight ${guidanceTab === 'edit' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <FileEdit size={18} className={guidanceTab === 'edit' ? 'text-blue-600' : 'text-gray-400'}/> Form Oluştur & Düzenle
        </button>
        <button 
          onClick={() => setGuidanceTab('surveys')}
          className={`flex items-center gap-2.5 px-6 py-4 text-sm font-bold transition-all border-b-2 tracking-tight ${guidanceTab === 'surveys' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <FileText size={18} className={guidanceTab === 'surveys' ? 'text-blue-600' : 'text-gray-400'}/> Anketler
        </button>
      </div>

      {guidanceTab === 'assign' && renderAssignView()}
      {guidanceTab === 'responses' && renderResponsesView()}
      {guidanceTab === 'edit' && renderEditView()}
      {guidanceTab === 'surveys' && <AdminSurveysPanel state={state} actions={actions} />}

      {showPreview && (
        <PreviewModal 
          config={editorData} 
          onClose={() => setShowPreview(false)} 
        />
      )}
    </div>
  );
};
