import React, { useState } from 'react';
import { Send, CheckSquare, PlusCircle, Trash2, BarChart2, Sparkles, Calendar, Clipboard, Check, Clock } from 'lucide-react';
import { INITIAL_SURVEY_FORMS_CONFIG } from '../lib/surveyForms';

export const AdminSurveysPanel = ({ state, actions }: any) => {
  const { activeSchoolId } = state;

  const [surveyTab, setSurveyTab] = useState('assign');
  const [newAssignment, setNewAssignment] = useState({
    formId: '',
  });
  const [expiryDate, setExpiryDate] = useState('');
  const [latestGeneratedLink, setLatestGeneratedLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<any | null>(null);
  const [selectedFormType, setSelectedFormType] = useState<string | null>(null);
  const [reportViewMode, setReportViewMode] = useState<'list' | 'aggregate'>('list');

  const generateUniqueTimestampSuffix = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const hh = pad(now.getHours());
    const mm = pad(now.getMinutes());
    const ss = pad(now.getSeconds());
    const DD = pad(now.getDate());
    const MM = pad(now.getMonth() + 1); // 0-indexed
    const YYYY = now.getFullYear();
    return `${hh}${mm}${ss}${DD}${MM}${YYYY}`;
  };

  const handleCreatePublicSurvey = async () => {
    if (!newAssignment.formId) {
      actions.setAppToast({ message: "Lütfen bir anket seçiniz.", type: 'error' });
      return;
    }
    if (!expiryDate) {
      actions.setAppToast({ message: "Lütfen bir bitiş tarihi belirleyiniz.", type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      const suffix = generateUniqueTimestampSuffix();
      const { collection, addDoc, doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      
      const targetSchoolId = activeSchoolId || 'default';

      // 1. Add to global public_surveys so anonymous users can load it
      await setDoc(doc(db, 'public_surveys', suffix), {
        formId: newAssignment.formId,
        schoolId: targetSchoolId,
        expiryDate,
        createdAt: new Date().toISOString()
      });
      
      // 2. Add as an assignment for this school
      const assignmentsCol = targetSchoolId === 'default' ? 'form_assignments' : `form_assignments_${targetSchoolId}`;
      await addDoc(collection(db, assignmentsCol), {
        formId: newAssignment.formId,
        targetType: 'public',
        targetClass: 'all',
        targetStudent: '',
        expiryDate,
        urlSuffix: suffix,
        createdAt: new Date().toISOString(),
        createdBy: state.currentUser?.username || 'Rehberlik Servisi'
      });
      
      const generatedLink = `${window.location.origin}/#/anketler/${suffix}`;
      setLatestGeneratedLink(generatedLink);
      
      // Clear inputs
      setNewAssignment({ formId: '' });
      setExpiryDate('');
      
      actions.setAppToast({ message: "Anket başarıyla yayınlandı ve benzersiz dış link oluşturuldu!", type: 'success' });
    } catch (err) {
      console.error(err);
      actions.setAppToast({ message: "Anket yayınlanırken hata oluştu.", type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderAssignView = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-black text-blue-900 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <PlusCircle size={20}/>
          </div>
          Yeni Anket Yayına Al (Link Oluştur)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">ÇOĞUL ANKET SEÇİMİ</label>
            <select 
              value={newAssignment.formId} 
              onChange={e => setNewAssignment({...newAssignment, formId: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 py-3 px-4 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer appearance-none"
            >
              <option value="">-- Anket Seçiniz --</option>
              {INITIAL_SURVEY_FORMS_CONFIG.map((f: any) => (
                <option key={f.id} value={f.id}>{f.title}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">ANKET BİTİŞ TARİHİ</label>
            <div className="relative">
              <input 
                type="date"
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-gray-50 border border-gray-200 py-3 px-4 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
              />
            </div>
          </div>

          <button 
            type="button"
            disabled={isLoading || !newAssignment.formId || !expiryDate}
            onClick={handleCreatePublicSurvey}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer h-[46px]"
          >
            <Send size={18}/> {isLoading ? 'Yayınlanıyor...' : 'Gönder & Link Oluştur'}
          </button>
        </div>

        {/* Success Card presenting the generated unique link */}
        {latestGeneratedLink && (
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl mt-6 flex flex-col items-start gap-3 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-emerald-800">
              <Sparkles size={18} className="text-emerald-600 animate-pulse"/>
              <span className="font-extrabold text-sm uppercase tracking-wider">Benzersiz Anket Linki Oluşturuldu!</span>
            </div>
            <p className="text-gray-600 text-[13px] leading-relaxed">
              Aşağıdaki linki kopyalayıp hedef kitleye (veliler, öğrenciler, öğretmenler veya dış katılım her kimse) gönderebilirsiniz. 
              Giriş şifresi gerekmeden dileyen herkes tarayıcısından anketi doldurabilir:
            </p>
            <div className="w-full flex flex-col sm:flex-row gap-3 mt-1">
              <input 
                readOnly 
                value={latestGeneratedLink} 
                className="flex-1 bg-white border border-emerald-200 py-3 px-4 rounded-xl text-xs font-mono font-medium text-emerald-950 select-all outline-none"
              />
              <button 
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(latestGeneratedLink);
                  actions.setAppToast({ message: "Link başarıyla panoya kopyalandı!", type: 'success' });
                }}
                className="bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all text-xs uppercase tracking-wider active:scale-95 cursor-pointer flex items-center gap-2 shrink-0 justify-center"
              >
                <Clipboard size={14}/> Kopyala
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-3">
          Aktif Benzersiz Dış Linkler
        </h3>
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Anket Adı</th>
                <th className="p-4 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Oluşturulma Tarihi</th>
                <th className="p-4 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Son Katılım Bitiş</th>
                <th className="p-4 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Anket Linki</th>
                <th className="p-4 font-bold text-gray-400 uppercase tracking-widest text-[10px] text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {state.guidanceAssignments
                .filter((a: any) => a.targetType === 'public' || INITIAL_SURVEY_FORMS_CONFIG.some(f => f.id === a.formId))
                .map((asgn: any) => {
                  const config = INITIAL_SURVEY_FORMS_CONFIG.find(c => c.id === asgn.formId);
                  const displayLink = asgn.urlSuffix 
                    ? `${window.location.origin}/#/anketler/${asgn.urlSuffix}`
                    : `${window.location.origin}/?anket=${asgn.formId}`;
                  
                  return (
                    <tr key={asgn.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-gray-900 leading-snug">{config?.title || asgn.formId}</div>
                        <div className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mt-1">Dış Katılıma Açık Link</div>
                      </td>
                      <td className="p-4 text-xs font-semibold text-gray-500">
                        {asgn.createdAt ? new Date(asgn.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="p-4">
                        <div className="text-xs font-bold text-rose-600 bg-rose-50 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg">
                          <Calendar size={13}/> {asgn.expiryDate ? new Date(asgn.expiryDate).toLocaleDateString('tr-TR') : 'Sınırsız'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-gray-400 max-w-[180px] truncate">{displayLink}</span>
                          <button 
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(displayLink);
                              actions.setAppToast({ message: "Link kopyalandı!", type: 'success' });
                            }}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Linki Kopyala"
                          >
                            <Clipboard size={14}/>
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          type="button"
                          onClick={async () => {
                            actions.requestConfirm("Bu anket linkini silmek ve dış katılıma kapatmak istediğinize emin misiniz?", async () => {
                              try {
                                const { doc, deleteDoc } = await import('firebase/firestore');
                                const { db } = await import('../lib/firebase');
                                if (asgn.urlSuffix) {
                                  await deleteDoc(doc(db, 'public_surveys', asgn.urlSuffix));
                                }
                                await actions.handleDeleteGuidanceAssignment(asgn.id);
                                actions.setAppToast({ message: "Anket dış bağlantısı silindi.", type: 'success' });
                              } catch (e) {
                                console.error(e);
                                actions.setAppToast({ message: "Hata oluştu.", type: 'error' });
                              }
                            });
                          }} 
                          className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={18}/>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              {state.guidanceAssignments.filter((a: any) => a.targetType === 'public' || INITIAL_SURVEY_FORMS_CONFIG.some(f => f.id === a.formId)).length === 0 && (
                 <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400 font-bold">Henüz oluşturulmuş anket bağlantısı bulunmuyor.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderResponsesView = () => {
    // Collect all survey responses
    const surveyResponses = state.guidanceForms.filter((f: any) => INITIAL_SURVEY_FORMS_CONFIG.some(c => c.id === f.formType));
    
    // Automatically select the first form type if none is selected
    if (!selectedFormType && INITIAL_SURVEY_FORMS_CONFIG.length > 0) {
       setSelectedFormType(INITIAL_SURVEY_FORMS_CONFIG[0].id);
    }
    
    // Responses for the currently selected form type
    const activeResponses = surveyResponses.filter((r: any) => r.formType === selectedFormType);
    const activeConf = INITIAL_SURVEY_FORMS_CONFIG.find(c => c.id === selectedFormType);

    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Response List Column */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 lg:col-span-1 flex flex-col h-full">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-3 mb-2">
              <BarChart2 className="text-indigo-600"/> Gelen Yanıt Listesi
            </h3>
            <div className="text-gray-400 text-xs font-bold leading-normal mb-6">
              Gönderilen anket dış bağlantısı üzerinden doldurulmuş anketlerin son yanıtlarıdır.
            </div>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {INITIAL_SURVEY_FORMS_CONFIG.map((conf: any) => {
                const itemsCount = surveyResponses.filter((r: any) => r.formType === conf.id).length;
                const isSelected = selectedFormType === conf.id;
                return (
                    <div 
                      key={conf.id} 
                      onClick={() => { setSelectedFormType(conf.id); setSelectedResponse(null); }}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${isSelected ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-50 bg-gray-50/50 hover:border-indigo-200'}`}
                    >
                      <h4 className={`text-xs font-black uppercase tracking-wider ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                        {conf.title}
                      </h4>
                      <div className={`mt-2 text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`}>
                        {itemsCount} Yanıt Geldi
                      </div>
                    </div>
                );
              })}
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-3">
            {selectedResponse ? (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5 gap-4">
                  <div>
                    <span className="bg-indigo-50 text-indigo-700 font-extrabold text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-md">
                      {activeConf?.title || "Anket Yanıtı"}
                    </span>
                    <h3 className="text-xl font-black text-gray-900 mt-2">Anonim Katılımcı</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1 flex items-center gap-1.5">
                      <Clock size={12}/> Tarih: {selectedResponse.createdAt ? new Date(selectedResponse.createdAt).toLocaleString('tr-TR') : '-'}
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setSelectedResponse(null)}
                    className="bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-600 text-xs px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all cursor-pointer select-none flex items-center gap-2"
                  >
                     Geri Dön
                  </button>
                </div>

                <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                  {(() => {
                    if (!activeConf) return <p className="text-gray-400 font-bold text-xs">Form şablonu bulunamadı.</p>;
                    
                    return (
                      <div className="space-y-4.5">
                        {activeConf.questions.map((q: any, qIdx: number) => {
                          const answerKey = `q_${qIdx}`;
                          const ansVal = selectedResponse.answers?.[answerKey];
                          return (
                            <div key={qIdx} className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm hover:border-gray-200 transition-all">
                              <div className="space-y-1.5 pr-2">
                                <span className="bg-gray-200/50 text-gray-500 text-[9px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-sm inline-block">{q.category}</span>
                                <div className="text-[13px] font-bold text-gray-800 leading-relaxed pr-2">{q.text}</div>
                              </div>
                              <span className="text-[11px] font-extrabold px-3 py-1.5 rounded-xl bg-indigo-600 text-white shadow-sm shrink-0 self-start sm:self-center uppercase text-center min-w-[100px]">
                                {ansVal || 'Cevaplanmadı'}
                              </span>
                            </div>
                          );
                        })}

                        {activeConf.openQuestions?.map((oq: string, oqIdx: number) => {
                          const answerKey = `open_${oqIdx}`;
                          const ansVal = selectedResponse.answers?.[answerKey];
                          return (
                            <div key={oqIdx} className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 space-y-2.5 shadow-sm">
                              <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider block">Görüş ve Öneriler (Açık Uçlu)</span>
                              <div className="text-[13px] font-bold text-gray-800 leading-relaxed">{oq}</div>
                              <div className="p-4 bg-white border border-gray-100 rounded-xl text-xs text-gray-600 leading-relaxed italic shadow-sm whitespace-pre-wrap">
                                {ansVal || 'Cevap girilmemiş.'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : selectedFormType ? (
               <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col">
                  {/* Tabs for "Tüm Yanıtlar" and "Toplu Rapor" */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-6 mb-6 gap-4">
                     <div>
                        <h3 className="text-xl font-black text-gray-900">{activeConf?.title}</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                           Toplam {activeResponses.length} Yanıt
                        </p>
                     </div>
                     <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100 shrink-0">
                        <button
                           onClick={() => setReportViewMode('list')}
                           className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${reportViewMode === 'list' ? 'bg-white shadow-sm text-indigo-700 border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                           Bireysel Yanıtlar
                        </button>
                        <button
                           onClick={() => setReportViewMode('aggregate')}
                           className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${reportViewMode === 'aggregate' ? 'bg-white shadow-sm text-indigo-700 border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                           Toplu Rapor
                        </button>
                     </div>
                  </div>

                  {reportViewMode === 'list' && (
                     <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2">
                        {activeResponses.length === 0 ? (
                           <div className="text-center py-12 px-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                              <p className="text-gray-500 font-bold text-sm">Bu anket için henüz yanıt bulunmuyor.</p>
                           </div>
                        ) : (
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {activeResponses.map((r: any, idx: number) => (
                                 <div 
                                    key={r.id} 
                                    onClick={() => setSelectedResponse(r)}
                                    className="p-5 border border-gray-100 bg-white rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
                                  >
                                    <div className="flex items-center justify-between">
                                       <div>
                                          <div className="text-sm font-black text-gray-800">Yanıt #{idx + 1} (Anonim)</div>
                                          <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                                             <Clock size={10} className="inline mr-1 -mt-0.5"/>
                                             {r.createdAt ? new Date(r.createdAt).toLocaleString('tr-TR') : 'Tarih Yok'}
                                          </div>
                                       </div>
                                       <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <Check size={16}/>
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                  )}

                  {reportViewMode === 'aggregate' && (
                     <div className="space-y-8 overflow-y-auto max-h-[500px] pr-2 pb-4">
                        {activeResponses.length === 0 ? (
                           <div className="text-center py-12 px-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                              <p className="text-gray-500 font-bold text-sm">Rapor oluşturulabilmesi için yanıt gerekli.</p>
                           </div>
                        ) : (
                           // Render aggregate view for activeConf
                           <div className="space-y-6">
                              {activeConf?.questions.map((q: any, qIdx: number) => {
                                 // Calculate frequency
                                 const stats: Record<string, number> = {};
                                 activeConf.columns.forEach((col: string) => stats[col] = 0); // initialize columns with 0
                                 
                                 activeResponses.forEach((r: any) => {
                                    const val = r.answers?.[`q_${qIdx}`];
                                    if (val) {
                                       stats[val] = (stats[val] || 0) + 1;
                                    }
                                 });

                                 return (
                                    <div key={qIdx} className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm">
                                       <div className="space-y-1.5 mb-4">
                                          <span className="bg-indigo-50 text-indigo-600 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md">{q.category}</span>
                                          <h4 className="text-[13px] font-bold text-gray-800 leading-relaxed max-w-2xl">{q.text}</h4>
                                       </div>
                                       <div className="space-y-3">
                                          {activeConf.columns.map((col: string) => {
                                             const count = stats[col] || 0;
                                             const percentage = activeResponses.length > 0 ? Math.round((count / activeResponses.length) * 100) : 0;
                                             return (
                                                <div key={col} className="flex items-center gap-4">
                                                   <div className="w-48 text-[11px] font-extrabold text-gray-600 tracking-wider truncate" title={col}>{col}</div>
                                                   <div className="flex-1 bg-gray-50 h-3.5 rounded-full overflow-hidden border border-gray-100 flex shadow-inner">
                                                      <div 
                                                         style={{ width: `${percentage}%` }} 
                                                         className="bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out"
                                                      />
                                                   </div>
                                                   <div className="w-16 text-right text-[11px] font-black text-gray-800">{percentage}% <span className="text-[9px] text-gray-400 font-bold ml-1">({count})</span></div>
                                                </div>
                                             );
                                          })}
                                       </div>
                                    </div>
                                 );
                              })}
                           </div>
                        )}
                     </div>
                  )}
               </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button 
          onClick={() => { setSurveyTab('assign'); setSelectedResponse(null); }}
          className={`flex items-center gap-2.5 px-6 py-4 text-sm font-bold transition-all border-b-2 tracking-tight ${surveyTab === 'assign' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <Send size={18} className={surveyTab === 'assign' ? 'text-indigo-600' : 'text-gray-400'}/> Anket Gönder
        </button>
        <button 
          onClick={() => { setSurveyTab('responses'); setSelectedResponse(null); }}
          className={`flex items-center gap-2.5 px-6 py-4 text-sm font-bold transition-all border-b-2 tracking-tight ${surveyTab === 'responses' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <CheckSquare size={18} className={surveyTab === 'responses' ? 'text-indigo-600' : 'text-gray-400'}/> Sonuçlar & Yanıtlar
        </button>
      </div>
      
      {surveyTab === 'assign' && renderAssignView()}
      {surveyTab === 'responses' && renderResponsesView()}
    </div>
  );
};
