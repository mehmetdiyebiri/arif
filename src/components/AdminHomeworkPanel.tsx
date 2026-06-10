import React from 'react';
import { PlusCircle, BarChart2, Upload, FileText, CheckCircle, Edit2, Trash2, X, Save, Award, Star, Download } from 'lucide-react';
import { formatClassLabel } from '../lib/utils';

export const AdminHomeworkPanel = ({ state, actions }: any) => {
  const { currentUser, assignments, selectedReportAssignment, reportFilterClass, users, classes, homeworkTab, assignmentType, adminHomeworkForm, editAssignmentData, hwProgress, badges } = state;
  const { setHomeworkTab, setAssignmentType, setAdminHomeworkForm, handleHomeworkClassToggle, handleHomeworkExcelUpload, handleCreateAssignment, setEditAssignmentData, handleDeleteAssignment, handleUpdateAssignment, setSelectedReportAssignment, setReportFilterClass, handleUpdateBadges } = actions;

  const visibleAssignments = (currentUser?.role === 'admin' || currentUser?.role === 'superadmin') 
      ? assignments 
      : assignments.filter((a: any) => a.createdBy === currentUser?.name || a.createdBy === currentUser?.username);

  const reportAssignment = visibleAssignments.find((a: any) => a.id === selectedReportAssignment);
  const normalize = (s: any) => String(s || '').replace(/[\s_\\/-]/g, '').toLowerCase();
  let assignedStudents = reportAssignment 
      ? users.filter((u: any) => {
          if (u.role !== 'student' || !u.classLevel) return false;
          const isClassMatch = reportAssignment.classes.some((c: string) => normalize(c) === normalize(u.classLevel));
          if (!isClassMatch) return false;
          if (reportAssignment.targetType === 'student') {
              return normalize(u.username) === normalize(reportAssignment.targetStudent) || 
                     normalize(u.name) === normalize(reportAssignment.targetStudent);
          }
          return true;
      })
      : [];

  const handleDownloadExcel = async (a: any) => {
      try {
          const { utils, writeFile } = await import('xlsx');
          let data: any[][] = [];
          let header: string[] = [];
          
          if (a.type === 'kelime') {
              header = ['Kelime', 'Anlamı'];
              data = (a.questions || a.words || []).map((q: any) => [q.word || q.Kelime || q.question || '', q.meaning || q['Anlamı'] || q.answer || '']);
          } else if (a.type === 'dogruYanlis') {
              header = ['Cümle', 'Cevap (Doğru/Yanlış)'];
              data = (a.questions || []).map((q: any) => [q.sentence || q.text || q.question || '', q.answer || '']);
          } else if (a.type === 'bosluk') {
              header = ['Cümle', 'Boşluğa Gelecek Kelime'];
              data = (a.questions || []).map((q: any) => [q.sentence || q.text || q.question || '', q.answer || '']);
          } else if (a.type === 'coktanSecmeli') {
              header = ['Soru', 'A Şıkkı', 'B Şıkkı', 'C Şıkkı', 'D Şıkkı', 'Doğru Cevabın Tam Metni'];
              data = (a.questions || []).map((q: any) => [q.question || q.text || '', q.a || '', q.b || '', q.c || '', q.d || '', q.answer || '']);
          } else {
              alert("Bilinmeyen ödev tipi. Excel indirilemiyor.");
              return;
          }

          const ws = utils.aoa_to_sheet([header, ...data]);
          const wb = utils.book_new();
          utils.book_append_sheet(wb, ws, "Öğeler");
          writeFile(wb, `${a.title || 'Odev'}.xlsx`);
      } catch (e) {
          console.error("Excel indirme hatası:", e);
          alert("Excel indirilirken bir hata oluştu.");
      }
  };

  if (reportFilterClass) {
      assignedStudents = assignedStudents.filter((u: any) => normalize(u.classLevel) === normalize(reportFilterClass));
  }

  return (
  <div className="space-y-8 animate-in fade-in">
      <div className="flex gap-6 border-b border-gray-200 pb-px scrollbar-hide overflow-x-auto">
          <button onClick={() => setHomeworkTab('new')} className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${homeworkTab === 'new' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}><PlusCircle size={16}/> Yeni Ödev Ata</button>
          <button onClick={() => setHomeworkTab('reports')} className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${homeworkTab === 'reports' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}><BarChart2 size={16}/> Raporlar</button>
          <button onClick={() => setHomeworkTab('badges')} className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${homeworkTab === 'badges' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}><Award size={16}/> Rozetler</button>
      </div>

      {homeworkTab === 'new' && (
          <>
              <div className="flex gap-2 border-b border-gray-200 pb-2 mb-4 text-sm overflow-x-auto scrollbar-hide">
                  {[
                      { id: 'kelime', label: '[Kelime Anlamı Bulma]' },
                      { id: 'dogruYanlis', label: '[Doğru/Yanlış]' },
                      { id: 'bosluk', label: '[Boşluk Doldurma]' },
                      { id: 'coktanSecmeli', label: '[Çoktan Seçmeli]' }
                  ].map(t => (
                      <button
                          key={t.id}
                          onClick={() => setAssignmentType(t.id)}
                          className={`font-bold whitespace-nowrap px-3 py-1.5 rounded-lg transition-colors ${assignmentType === t.id ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                          {t.label}
                      </button>
                  ))}
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <h3 className="font-bold text-lg text-orange-600 mb-6 uppercase tracking-wider">Yeni Ödev Ata</h3>
                  
                  <div className="space-y-6">
                      <div>
                          <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">Başlık</label>
                          <input type="text" value={adminHomeworkForm.title} onChange={e=>setAdminHomeworkForm({...adminHomeworkForm, title: e.target.value})} placeholder="Örn: Ünite 1 - Meyveler" className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-semibold text-sm bg-gray-50 focus:bg-white"/>
                      </div>
                      
                      <div>
                          <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">Hedef Kitle</label>
                          <select 
                              value={adminHomeworkForm.targetType || 'class'} 
                              onChange={e => {
                                  const tType = e.target.value;
                                  if (tType === 'class') {
                                      setAdminHomeworkForm({
                                          ...adminHomeworkForm,
                                          targetType: tType,
                                          targetStudent: '',
                                          targetClass: '',
                                          classes: []
                                      });
                                  } else {
                                      setAdminHomeworkForm({
                                          ...adminHomeworkForm,
                                          targetType: tType,
                                          targetStudent: '',
                                          targetClass: '',
                                          classes: []
                                      });
                                  }
                              }}
                              className="w-full md:max-w-md bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all cursor-pointer appearance-none"
                          >
                              <option value="class">Sınıf</option>
                              <option value="student">Öğrenci</option>
                          </select>
                      </div>

                      {(!adminHomeworkForm.targetType || adminHomeworkForm.targetType === 'class') ? (
                          <div>
                              <label className="text-xs font-bold text-gray-500 mb-3 block uppercase">Sınıfları Seç (Birden fazla seçilebilir)</label>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                  {Object.keys(classes).sort().map(cls => (
                                      <label key={cls} className="flex items-center gap-2 cursor-pointer group">
                                          <input type="checkbox" checked={adminHomeworkForm.classes.includes(cls)} onChange={() => handleHomeworkClassToggle(cls)} className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"/>
                                          <span className="text-sm font-semibold text-gray-700 group-hover:text-orange-600 transition-colors">{formatClassLabel(cls)}</span>
                                      </label>
                                  ))}
                              </div>
                          </div>
                      ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                  <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">Sınıf</label>
                                  <select 
                                      value={adminHomeworkForm.targetClass || ''} 
                                      onChange={e => {
                                          const cls = e.target.value;
                                          setAdminHomeworkForm({
                                              ...adminHomeworkForm,
                                              targetClass: cls,
                                              targetStudent: '',
                                              classes: cls ? [cls] : []
                                          });
                                      }}
                                      className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm font-semibold text-gray-700 outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all cursor-pointer appearance-none"
                                  >
                                      <option value="">Sınıf Seçiniz</option>
                                      {Object.keys(classes).sort().map(cls => (
                                          <option key={cls} value={cls}>{formatClassLabel(cls)}</option>
                                      ))}
                                  </select>
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">Öğrenci</label>
                                  <select 
                                      value={adminHomeworkForm.targetStudent || ''} 
                                      onChange={e => {
                                          setAdminHomeworkForm({
                                              ...adminHomeworkForm,
                                              targetStudent: e.target.value
                                          });
                                      }}
                                      disabled={!adminHomeworkForm.targetClass}
                                      className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm font-semibold text-gray-700 outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all cursor-pointer appearance-none disabled:opacity-50"
                                  >
                                      <option value="">Öğrenci Seçiniz</option>
                                      {adminHomeworkForm.targetClass && classes[adminHomeworkForm.targetClass]?.map((s: string) => (
                                          <option key={s} value={s}>{s}</option>
                                      ))}
                                  </select>
                              </div>
                          </div>
                      )}
                      
                      <div>
                          <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">Son Teslim Tarihi (İsteğe Bağlı)</label>
                          <input type="date" value={adminHomeworkForm.dueDate} onChange={e=>setAdminHomeworkForm({...adminHomeworkForm, dueDate: e.target.value})} className="w-full md:max-w-md border border-gray-200 p-3.5 rounded-xl outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-sm font-semibold bg-gray-50 focus:bg-white text-gray-700"/>
                          <p className="text-[10px] text-gray-400 mt-2 font-medium">Boş bırakırsanız ödev süresiz olur.</p>
                      </div>
                      
                      <div className="pt-6 border-t border-gray-100 border-dashed">
                          <label className="relative flex flex-col items-center justify-center w-full h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50/50 transition-all cursor-pointer group">
                              <Upload className="text-gray-400 group-hover:text-orange-500 mb-2" size={28}/>
                              <span className="text-sm font-semibold text-gray-600 group-hover:text-orange-700">Excel dosyasını yükle (.xlsx)</span>
                              <input type="file" accept=".xlsx, .xls" onChange={handleHomeworkExcelUpload} className="hidden" />
                          </label>
                          <div className="mt-3 text-xs text-gray-500 bg-blue-50/50 p-4 rounded-xl border border-blue-100 leading-relaxed">
                              <strong className="text-blue-800 flex items-center gap-1.5 mb-1.5"><FileText size={14}/> Excel Formatı Bilgisi:</strong>
                              {assignmentType === 'kelime' && "1. Sütun: Kelime | 2. Sütun: Anlamı"}
                              {assignmentType === 'dogruYanlis' && "1. Sütun: Cümle | 2. Sütun: 'Doğru' veya 'Yanlış' kelimesi"}
                              {assignmentType === 'bosluk' && "1. Sütun: Cümle (boşlukları ....... ile belirtin) | 2. Sütun: Boşluğa Gelecek Kelime"}
                              {assignmentType === 'coktanSecmeli' && "1. Sütun: Soru | 2. Sütun: A Şıkkı | 3. Sütun: B Şıkkı | 4. Sütun: C Şıkkı | 5. Sütun: D Şıkkı | 6. Sütun: Doğru Cevabın Tam Metni"}
                          </div>
                          {adminHomeworkForm.fileName && (
                              <div className="mt-3 text-sm font-bold text-green-600 flex items-center justify-center gap-2 bg-green-50 py-2.5 rounded-xl border border-green-100">
                                  <CheckCircle size={16}/> {adminHomeworkForm.fileName} ({adminHomeworkForm.questions.length} Soru Yüklendi)
                              </div>
                          )}
                      </div>
                      
                      <div className="flex justify-end pt-4">
                          <button onClick={handleCreateAssignment} className="bg-orange-500 text-white px-10 py-3.5 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200 text-sm">
                              Ödevi Ata
                          </button>
                      </div>
                  </div>
              </div>

              <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-4 mt-8">Mevcut Ödevler</h3>
                  {visibleAssignments.length === 0 ? (
                      <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-sm font-medium text-gray-400 shadow-sm">
                          {currentUser?.role === 'admin' ? 'Henüz oluşturulmuş bir ödev bulunmuyor.' : 'Henüz oluşturduğunuz bir ödev bulunmuyor.'}
                      </div>
                  ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {visibleAssignments.sort((a: any,b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((a: any) => (
                              <div key={a.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full relative overflow-hidden group">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                                  <div className="flex justify-between items-start mb-3">
                                      <h4 className="font-bold text-gray-900 text-base leading-tight pr-12">{a.title}</h4>
                                      <div className="absolute right-4 top-4 flex items-center gap-2">
                                          <button onClick={() => handleDownloadExcel(a)} className="text-gray-300 hover:text-green-600 transition-colors shrink-0" title="Excel İndir"><Download size={16}/></button>
                                          <button onClick={() => setEditAssignmentData(a)} className="text-gray-300 hover:text-orange-500 transition-colors shrink-0" title="Düzenle"><Edit2 size={16}/></button>
                                          <button onClick={() => handleDeleteAssignment(a.id)} className="text-gray-300 hover:text-red-500 transition-colors shrink-0" title="Sil"><Trash2 size={16}/></button>
                                      </div>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5 mb-4">
                                      {a.targetType === 'student' ? (
                                           <>
                                               <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-bold">👤 ÖĞRENCİ: {a.targetStudent}</span>
                                               {a.classes?.map((c: string) => <span key={c} className="bg-gray-100 text-gray-400 px-2 py-0.5 rounded text-[10px] font-bold">{formatClassLabel(c)}</span>)}
                                           </>
                                       ) : (
                                           a.classes?.map((c: string) => <span key={c} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">{formatClassLabel(c)}</span>)
                                       )}
                                  </div>
                                  <div className="mt-auto space-y-1.5 text-xs font-semibold text-gray-500">
                                      <div className="flex items-center justify-between">
                                          <span>{a.questions?.length || a.words?.length || 0} Soru ({a.type === 'dogruYanlis' ? 'D/Y' : a.type === 'bosluk' ? 'Boşluk' : a.type === 'coktanSecmeli' ? 'Test' : 'Kelime'})</span>
                                          <span className={a.dueDate ? 'text-orange-600' : 'text-green-600'}>{a.dueDate ? new Date(a.dueDate).toLocaleDateString('tr-TR') : 'Süresiz'}</span>
                                      </div>
                                      <div className="text-[10px] font-medium text-gray-400">Oluşturan: {a.createdBy}</div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </>
      )}

      {/* Ödev Düzenleme Modalı */}
      {editAssignmentData && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-lg w-full animate-in zoom-in-95 duration-200 space-y-6">
                  <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-xl text-gray-900">Ödevi Düzenle</h3>
                      <button onClick={() => setEditAssignmentData(null)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20}/></button>
                  </div>

                  <div className="space-y-5">
                      <div>
                          <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wide">Ödev Başlığı</label>
                          <input type="text" value={editAssignmentData.title} onChange={e=>setEditAssignmentData({...editAssignmentData, title: e.target.value})} className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-semibold text-sm bg-gray-50 focus:bg-white text-gray-800"/>
                      </div>

                      <div>
                          <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wide">Hedef Kitle</label>
                          <select 
                              value={editAssignmentData.targetType || 'class'} 
                              onChange={e => {
                                  const tType = e.target.value;
                                  setEditAssignmentData((prev) => ({
                                      ...prev,
                                      targetType: tType,
                                      targetStudent: '',
                                      targetClass: '',
                                      classes: []
                                  }));
                              }}
                              className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all cursor-pointer appearance-none"
                          >
                              <option value="class">Sınıf</option>
                              <option value="student">Öğrenci</option>
                          </select>
                      </div>

                      {(!editAssignmentData.targetType || editAssignmentData.targetType === 'class') ? (
                          <div>
                              <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wide">Atanan Sınıflar</label>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 max-h-40 overflow-y-auto">
                                  {Object.keys(classes).sort().map(cls => (
                                      <label key={cls} className="flex items-center gap-2 cursor-pointer group">
                                          <input type="checkbox" checked={editAssignmentData.classes.includes(cls)} onChange={() => {
                                              setEditAssignmentData((prev) => ({
                                                  ...prev,
                                                  classes: prev.classes.includes(cls) ? prev.classes.filter((c) => c !== cls) : [...prev.classes, cls]
                                              }));
                                          }} className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"/>
                                          <span className="text-sm font-semibold text-gray-700 group-hover:text-orange-600 transition-colors">{formatClassLabel(cls)}</span>
                                      </label>
                                  ))}
                              </div>
                          </div>
                      ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                  <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wide">Sınıf</label>
                                  <select 
                                      value={editAssignmentData.targetClass || editAssignmentData.classes?.[0] || ''} 
                                      onChange={e => {
                                          const cls = e.target.value;
                                          setEditAssignmentData((prev) => ({
                                              ...prev,
                                              targetClass: cls,
                                              targetStudent: '',
                                              classes: cls ? [cls] : []
                                          }));
                                      }}
                                      className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm font-semibold text-gray-700 outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all cursor-pointer appearance-none"
                                  >
                                      <option value="">Sınıf Seçiniz</option>
                                      {Object.keys(classes).sort().map(cls => (
                                          <option key={cls} value={cls}>{formatClassLabel(cls)}</option>
                                      ))}
                                  </select>
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wide">Öğrenci</label>
                                  <select 
                                      value={editAssignmentData.targetStudent || ''} 
                                      onChange={e => {
                                          const val = e.target.value;
                                          setEditAssignmentData((prev) => ({
                                              ...prev,
                                              targetStudent: val
                                          }));
                                      }}
                                      disabled={!(editAssignmentData.targetClass || editAssignmentData.classes?.[0])}
                                      className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm font-semibold text-gray-700 outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all cursor-pointer appearance-none disabled:opacity-50"
                                  >
                                      <option value="">Öğrenci Seçiniz</option>
                                      {(editAssignmentData.targetClass || editAssignmentData.classes?.[0]) && classes[editAssignmentData.targetClass || editAssignmentData.classes?.[0]]?.map((s) => (
                                          <option key={s} value={s}>{s}</option>
                                      ))}
                                  </select>
                               </div>
                          </div>
                      )}

                      <div>
                          <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wide">Son Teslim Tarihi</label>
                          <input type="date" value={editAssignmentData.dueDate || ''} onChange={e=>setEditAssignmentData({...editAssignmentData, dueDate: e.target.value})} className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-sm font-semibold bg-gray-50 focus:bg-white text-gray-700"/>
                      </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                      <button onClick={() => setEditAssignmentData(null)} className="px-5 py-2.5 text-gray-500 hover:bg-gray-50 rounded-xl text-sm font-bold transition-colors">İptal</button>
                      <button onClick={handleUpdateAssignment} className="px-6 py-2.5 bg-orange-500 text-white hover:bg-orange-600 rounded-xl text-sm font-bold transition-colors shadow-sm shadow-orange-200 flex items-center gap-2">
                          <Save size={16}/> Değişiklikleri Kaydet
                      </button>
                  </div>
              </div>
          </div>
      )}

      {homeworkTab === 'reports' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[500px]">
              <div className="p-6 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                      <h3 className="font-bold text-lg text-gray-900">Ödev Raporları</h3>
                      <p className="text-xs text-gray-500 mt-1">Öğrencilerin ödev ilerlemelerini takip edin.</p>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto flex-col md:flex-row">
                      <select value={selectedReportAssignment} onChange={e=>{setSelectedReportAssignment(e.target.value); setReportFilterClass("");}} className="w-full md:w-64 border border-gray-300 p-2.5 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold">
                          <option value="">-- Ödev Seçiniz --</option>
                          {visibleAssignments.map((a: any) => <option key={a.id} value={a.id}>{a.title}</option>)}
                      </select>
                      <select value={reportFilterClass} onChange={e=>setReportFilterClass(e.target.value)} className="w-full md:w-40 border border-gray-300 p-2.5 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold">
                          <option value="">Tüm Sınıflar</option>
                          {(reportAssignment ? reportAssignment.classes.sort() : Object.keys(classes).sort()).map((c: any) => <option key={c} value={c}>{formatClassLabel(c)}</option>)}
                      </select>
                  </div>
              </div>
              
              {reportAssignment ? (
                  <div className="overflow-x-auto flex-1">
                      <table className="w-full text-sm text-left">
                          <thead className="bg-white text-gray-500 font-bold text-[11px] uppercase tracking-wider border-b border-gray-100">
                              <tr>
                                  <th className="p-4 whitespace-nowrap">ÖĞRENCİ</th>
                                  <th className="p-4 whitespace-nowrap">SINIF</th>
                                  <th className="p-4 whitespace-nowrap">TAMAMLANMA</th>
                                  <th className="p-4 whitespace-nowrap">DOĞRULUK</th>
                                  <th className="p-4 whitespace-nowrap">DETAY (D|Y|T)</th>
                                  <th className="p-4 whitespace-nowrap">TAMAMLAMA DERECESİ (VERİMLİLİK)</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {assignedStudents.map((student: any) => {
                                  const progId = `${student.id}_${reportAssignment.id}`;
                                  const prog = hwProgress[progId];
                                  const totalQ = reportAssignment.questions?.length || 0;
                                  const isCompleted = prog?.completed;
                                  const remainingCount = prog?.remainingIndices?.length ?? (isCompleted ? 0 : totalQ);
                                  const completedCount = totalQ - remainingCount;
                                  const percent = totalQ > 0 ? Math.round((completedCount / totalQ) * 100) : 0;
                                  
                                  const correctAnswers = prog?.correctCount || 0;
                                  const incorrectAnswers = prog?.incorrectCount || 0;
                                  
                                  const hasStarted = !!prog && (
                                      prog.completed ||
                                      correctAnswers > 0 ||
                                      incorrectAnswers > 0 ||
                                      (prog.remainingIndices !== undefined && prog.remainingIndices.length < totalQ)
                                  );

                                  const accuracyPercent = totalQ > 0 ? Math.round((correctAnswers / totalQ) * 100) : 0;

                                  return (
                                      <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                          <td className="p-4 font-semibold text-gray-800">{student.name}</td>
                                          <td className="p-4 text-gray-600 font-medium">{formatClassLabel(student.classLevel)}</td>
                                          <td className="p-4 text-amber-700 font-bold text-sm">%{percent}</td>
                                          <td className="p-4">
                                              {hasStarted ? (
                                                  <span className={`font-bold text-sm ${
                                                      accuracyPercent >= 85 ? 'text-emerald-600' :
                                                      accuracyPercent >= 50 ? 'text-amber-500' : 'text-red-500'
                                                  }`}>
                                                      %{accuracyPercent}
                                                  </span>
                                              ) : (
                                                  <span className="text-gray-400 font-medium text-sm">-</span>
                                              )}
                                          </td>
                                          <td className="p-4">
                                              {hasStarted ? (
                                                  <div className="font-semibold text-xs flex items-center gap-1.5">
                                                      <span className="text-emerald-600">D:{correctAnswers}</span>
                                                      <span className="text-gray-300 font-normal">|</span>
                                                      <span className="text-red-500">Y:{incorrectAnswers}</span>
                                                      <span className="text-gray-300 font-normal">|</span>
                                                      <span className="text-blue-500">T:{totalQ}</span>
                                                  </div>
                                              ) : (
                                                  <span className="text-gray-400 font-medium text-[13px]">Başlamadı</span>
                                              )}
                                          </td>
                                           <td className="p-4">
                                               {hasStarted ? (() => {
                                                   const totalAttempts = correctAnswers + incorrectAnswers;
                                                   const efficiencyScore = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;
                                                   return (
                                                       <div className="flex flex-col gap-1">
                                                           <div className="flex items-center gap-2">
                                                               <span className={`font-black text-sm ${
                                                                   efficiencyScore >= 90 ? 'text-emerald-600' :
                                                                   efficiencyScore >= 75 ? 'text-teal-600' :
                                                                   efficiencyScore >= 50 ? 'text-amber-500' :
                                                                   'text-red-500'
                                                               }`}>
                                                                   %{efficiencyScore}
                                                               </span>
                                                               {incorrectAnswers === 0 && isCompleted ? (
                                                                   <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-black tracking-wider animate-pulse flex items-center gap-0.5">
                                                                       🏆 HATASIZ
                                                                   </span>
                                                               ) : (
                                                                   <span className="text-[10px] text-gray-400 font-mono">
                                                                       ({correctAnswers}/{totalAttempts})
                                                                   </span>
                                                               )}
                                                           </div>
                                                           <div className="w-28 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                               <div className={`h-full rounded-full ${
                                                                   efficiencyScore >= 90 ? 'bg-emerald-500' :
                                                                   efficiencyScore >= 75 ? 'bg-teal-500' :
                                                                   efficiencyScore >= 50 ? 'bg-amber-500' :
                                                                   'bg-red-500'
                                                               }`} style={{ width: `%{efficiencyScore}` }}></div>
                                                           </div>
                                                       </div>
                                                   );
                                               })() : (
                                                   <span className="text-gray-400 font-medium text-sm">-</span>
                                               )}
                                           </td>
                                      </tr>
                                  )
                              })}
                              {assignedStudents.length === 0 && (<tr><td colSpan={6} className="p-8 text-center text-gray-400 italic">Bu ödevin atandığı sınıflarda kayıtlı öğrenci bulunmuyor.</td></tr>)}
                          </tbody>
                      </table>
                  </div>
              ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-gray-400 text-center"><BarChart2 size={48} className="mb-4 opacity-50"/><p className="font-semibold">Raporları görüntülemek için yukarıdan bir ödev seçin.</p></div>
              )}
          </div>
      )}

      {homeworkTab === 'badges' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between">
                <div>
                   <h3 className="font-bold text-xl text-blue-900">Rozet Yönetimi</h3>
                   <p className="text-sm text-gray-500 mt-1">Öğrencileri ödüllendirmek için başarı rozetleri tanımlayın.</p>
                </div>
                <button 
                    onClick={() => handleUpdateBadges([...badges, { id: Date.now(), title: 'Yeni Rozet', threshold: 50, emoji: '🏆' }])}
                    className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-600 transition-all text-sm flex items-center gap-2"
                >
                    <PlusCircle size={18}/> Yeni Rozet Ekle
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(badges || []).map((badge: any, index: number) => (
                    <div key={badge.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-4 relative group">
                        <button 
                            onClick={() => handleUpdateBadges(badges.filter((_, i) => i !== index))}
                            className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <Trash2 size={16}/>
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-gray-100">
                                <input 
                                    className="w-full text-center bg-transparent outline-none"
                                    value={badge.emoji}
                                    onChange={e => {
                                        const newBadges = [...badges];
                                        newBadges[index].emoji = e.target.value;
                                        handleUpdateBadges(newBadges);
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <input 
                                    className="w-full bg-transparent font-bold text-gray-800 outline-none border-b border-transparent focus:border-blue-300"
                                    value={badge.title}
                                    placeholder="Rozet Adı"
                                    onChange={e => {
                                        const newBadges = [...badges];
                                        newBadges[index].title = e.target.value;
                                        handleUpdateBadges(newBadges);
                                    }}
                                />
                                <div className="mt-2 flex items-center gap-2">
                                    <Star size={14} className="text-orange-500"/>
                                    <input 
                                        type="number"
                                        className="w-16 bg-transparent text-xs font-black text-orange-600 outline-none border-b border-transparent focus:border-orange-300"
                                        value={badge.threshold}
                                        onChange={e => {
                                            const newBadges = [...badges];
                                            newBadges[index].threshold = parseInt(e.target.value) || 0;
                                            handleUpdateBadges(newBadges);
                                        }}
                                    />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">DOĞRU EŞİĞİ</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {(!badges || badges.length === 0) && (
                    <div className="col-span-full py-12 text-center text-gray-400 font-medium bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        Henüz hiç rozet tanımlanmamış.
                    </div>
                )}
              </div>
          </div>
      )}
  </div>
);
};
