import React, { useRef, useState } from 'react';
import { Trophy, Download, PlusCircle, Trash2, CheckCircle, Activity, Award, Star, Check, Loader2, Users, X } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export const DevCardPanel = ({ state, actions }: any) => {
  const { selectedStudent, selectedClass, classes, devCardConfig, devCardData, newActivity, schoolPortfolios, users, assignments, hwProgress, classPerformances, currentUser } = state;
  const { setNewActivity, handleAddActivity, handleDeleteActivity, handleUpdateClassPerformances } = actions;
  
  const [activeSubTab, setActiveSubTab] = useState<'student' | 'class'>('student');
  const devCardRef = useRef<HTMLDivElement>(null);
  const pdfDevCardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Form state for Manual Class Performance
  const [perfForm, setPerfForm] = useState({
     classId: '',
     period: '',
     competitions: 0,
     tasks: 0,
     cleanliness: 0
  });

  const handleAddClassPerformance = () => {
      if (!perfForm.classId || !perfForm.period) {
          alert("Lütfen sınıf ve dönem seçiniz.");
          return;
      }
      
      const newRecord = {
          id: Math.random().toString(36).substring(2, 9),
          classId: perfForm.classId,
          period: perfForm.period,
          competitions: perfForm.competitions,
          tasks: perfForm.tasks,
          cleanliness: perfForm.cleanliness,
          evaluator: currentUser?.name || currentUser?.username || 'Bilinmiyor',
          date: new Date().toISOString()
      };
      
      handleUpdateClassPerformances([newRecord, ...(classPerformances || [])]);
      
      setPerfForm({
         classId: '',
         period: '',
         competitions: 0,
         tasks: 0,
         cleanliness: 0
      });
  };

  const handleDeleteClassPerformance = (id: string) => {
      if (confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
          handleUpdateClassPerformances((classPerformances || []).filter((r: any) => r.id !== id));
      }
  };

  const localHandleDownloadDevCardPDF = async () => {
    if (!pdfDevCardRef.current || !selectedStudent) return;
    
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(pdfDevCardRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Gelisim_Karti_${selectedStudent}.pdf`);
    } catch (error) {
      console.error('PDF generate error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const totalScoreByActivities = (activities: any[]) => {
      return (activities || []).reduce((acc: number, act: any) => {
          const level = devCardConfig.levels.find((l: any) => l.id.toString() === act.levelId?.toString());
          const rubric = devCardConfig.rubrics.find((r: any) => r.id.toString() === act.rubricId?.toString());
          const pts = act.score || (level?.score || 0) * (rubric?.multiplier || 0);
          return acc + pts;
      }, 0);
  };

  const totalScore = totalScoreByActivities(devCardData.activities || []);

  const rankedStudents = (schoolPortfolios || [])
    .filter((port: any) => users.some((u: any) => (u.role === 'student' || u.role === 'öğrenci') && u.name === (port.fullName || port.id)))
    .map((port: any) => {
      const acts = port.activities || port.developmentCard?.activities || [];
      const score = totalScoreByActivities(acts);
      return { id: port.id, fullName: port.fullName || port.id, score };
  }).sort((a: any, b: any) => b.score - a.score);

  const top10School = rankedStudents.filter((r: any) => r.score > 0).slice(0, 10);

  const classStudents = selectedClass && classes && classes[selectedClass] ? classes[selectedClass] : [];
  const top5Class = rankedStudents.filter((r: any) => classStudents.includes(r.fullName) && r.score > 0).slice(0, 5);

  const performRecords = classPerformances || [];
  
  // Class Scoring Logic (Manual Entries)
  const classScores = Object.keys(classes || {}).map((cName) => {
      const records = performRecords.filter((r: any) => r.classId === cName);
      
      let pCompetitions = 0;
      let pTasks = 0;
      let pCleanliness = 0;
      
      records.forEach((r: any) => {
          pCompetitions += (r.competitions || 0);
          pTasks += (r.tasks || 0);
          pCleanliness += (r.cleanliness || 0);
      });

      const score = pCompetitions + pTasks + pCleanliness;

      return { 
          name: cName, 
          score,
          pCompetitions,
          pTasks,
          pCleanliness,
          records
      };
  }).sort((a: any, b: any) => b.score - a.score);

  if (!selectedStudent && activeSubTab === 'student') {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl shadow-sm border border-gray-100 animate-in fade-in">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6"><Trophy className="text-gray-300" size={32} /></div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Öğrenci Seçiniz</h3>
        <p className="text-gray-500 text-sm">Gelişim kartını görüntülemek için bir öğrenci seçiniz.</p>
        
        {/* Tab Switcher even when no student selected */}
        <div className="mt-8 flex bg-gray-50 p-2 rounded-2xl border border-gray-100">
           <button onClick={() => setActiveSubTab('student')} className={`px-8 py-2 rounded-xl text-sm font-black transition-all ${activeSubTab === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Öğrenci</button>
           <button onClick={() => setActiveSubTab('class')} className={`px-8 py-2 rounded-xl text-sm font-black transition-all ${activeSubTab === 'class' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Sınıf</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-12 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden" data-html2canvas-ignore>
         <div className="flex items-center gap-6">
            <h2 className="text-2xl font-black text-blue-900">Gelişim Kartı</h2>
            <div className="flex bg-gray-100/80 p-1 rounded-2xl border border-gray-200/50">
               <button 
                  onClick={() => setActiveSubTab('student')} 
                  className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'student' ? 'bg-white text-blue-600 shadow-md shadow-blue-500/5 border border-blue-100' : 'text-gray-500 hover:text-gray-700'}`}
               >
                  Öğrenci
               </button>
               <button 
                  onClick={() => setActiveSubTab('class')} 
                  className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'class' ? 'bg-white text-blue-600 shadow-md shadow-blue-500/5 border border-blue-100' : 'text-gray-500 hover:text-gray-700'}`}
               >
                  Sınıf
               </button>
            </div>
         </div>

         {activeSubTab === 'student' && (
           <button 
               onClick={localHandleDownloadDevCardPDF} 
               disabled={isDownloading}
               className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm"
           >
              {isDownloading ? <><Loader2 size={16} className="animate-spin" /> Hazırlanıyor</> : <><Download size={16}/> PDF İndir</>}
           </button>
         )}
      </div>

      {activeSubTab === 'student' ? (
        <>
          <h2 className="text-3xl font-black text-center mb-8 hidden print:block text-blue-900">
            Gelişim Kartı: {selectedStudent}
          </h2>
          
          <div className="space-y-6">
            <div className="bg-blue-600 p-6 rounded-[32px] text-white flex justify-between items-center shadow-xl shadow-blue-200">
               <div>
                  <h3 className="text-2xl font-black">{selectedStudent}</h3>
                  <p className="text-blue-100 text-sm font-bold uppercase tracking-widest mt-1">Sınıf: {selectedClass || '-'}</p>
               </div>
               <div className="text-right">
                  <div className="text-4xl font-black">{totalScore}</div>
                  <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest">Toplam Puan</p>
               </div>
            </div>

            {/* Add Activity Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:hidden" data-html2canvas-ignore>
                <h3 className="font-bold mb-4 text-gray-800 flex items-center gap-2"><PlusCircle size={18} className="text-blue-600"/> Yeni Aktivite Ekle</h3>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                   <div className="flex-1 w-full">
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wider">Aktivite / Görev Açıklaması</label>
                      <input type="text" value={newActivity.description} onChange={e => setNewActivity({...newActivity, description: e.target.value})} className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" placeholder="Örn: 23 Nisan töreninde şiir okudu" />
                   </div>
                   <div className="w-full md:w-56">
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wider">Kapsam (Seviye)</label>
                      <select value={newActivity.levelId} onChange={e => setNewActivity({...newActivity, levelId: e.target.value})} className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer">
                         <option value="">Seçiniz</option>
                         {devCardConfig.levels.map((l: any) => <option key={l.id} value={l.id}>{l.name} ({l.score} Puan)</option>)}
                      </select>
                   </div>
                   <div className="w-full md:w-56">
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wider">Başarı (Çarpan)</label>
                      <select value={newActivity.rubricId} onChange={e => setNewActivity({...newActivity, rubricId: e.target.value})} className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer">
                         <option value="">Seçiniz</option>
                         {devCardConfig.rubrics.map((r: any) => <option key={r.id} value={r.id}>{r.name} (x{r.multiplier})</option>)}
                      </select>
                   </div>
                   <button onClick={handleAddActivity} className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 h-[46px] flex items-center justify-center">Ekle</button>
                </div>
            </div>

            {/* Achievements & Titles Section */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold font-display text-gray-800 mb-5 flex items-center gap-3">
                    <Award className="text-blue-600" size={20} /> Kazanımlar & Unvanlar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {devCardConfig.titles.map((title: any, idx: number) => {
                        const isEarned = totalScore >= title.threshold;
                        return (
                            <div key={idx} className={`relative p-4 rounded-[18px] border-2 transition-all duration-300 ${
                                isEarned 
                                ? 'bg-blue-50/30 border-blue-200 shadow-sm' 
                                : 'bg-gray-50/50 border-gray-100 opacity-60'
                            }`}>
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${isEarned ? 'text-blue-600' : 'text-gray-400'}`}>
                                        AŞAMA {idx + 1}
                                    </span>
                                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg border font-black text-[9px] ${
                                        isEarned ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-400 border-gray-100'
                                    }`}>
                                        <Star size={8} fill={isEarned ? "currentColor" : "none"} />
                                        {title.threshold}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h4 className={`font-black text-sm leading-tight ${isEarned ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {title.name}
                                    </h4>
                                    <p className={`text-[10px] font-medium leading-normal ${isEarned ? 'text-gray-600' : 'text-gray-400'}`}>
                                        {title.right}
                                    </p>
                                </div>
                                {isEarned && (
                                    <div className="absolute -top-1.5 -right-1.5 bg-green-500 text-white p-0.5 rounded-full shadow-md border-2 border-white">
                                        <Check size={10} strokeWidth={4} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Activity List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2"><Trophy size={18} className="text-gray-400"/> Aktivite Geçmişi</h3>
                    <span className="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-lg text-sm font-black border border-blue-200 shadow-sm">Toplam Puan: {totalScore}</span>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left">
                     <thead className="bg-white text-gray-500 border-b border-gray-100 text-[11px] uppercase tracking-wider">
                        <tr>
                          <th className="p-4 font-bold">Tarih</th>
                          <th className="p-4 font-bold">Aktivite</th>
                          <th className="p-4 font-bold">Kapsam</th>
                          <th className="p-4 font-bold">Başarı</th>
                          <th className="p-4 font-bold">Puan</th>
                          <th className="p-4 font-bold text-right print:hidden" data-html2canvas-ignore></th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {devCardData.activities.map((act: any) => {
                           const level = devCardConfig.levels.find((l: any) => l.id.toString() === act.levelId?.toString());
                           const rubric = devCardConfig.rubrics.find((r: any) => r.id.toString() === act.rubricId?.toString());
                           const pts = act.score || (level?.score || 0) * (rubric?.multiplier || 0);
                           return (
                             <tr key={act.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-gray-500 font-medium whitespace-nowrap">{new Date(act.date).toLocaleDateString('tr-TR')}</td>
                                <td className="p-4 font-semibold text-gray-800">{act.description}</td>
                                <td className="p-4 text-gray-600">{level?.name}</td>
                                <td className="p-4 text-gray-600">{rubric?.name}</td>
                                <td className="p-4 font-black text-green-600">+{pts}</td>
                                <td className="p-4 text-right print:hidden" data-html2canvas-ignore>
                                  <button onClick={() => handleDeleteActivity(act.id)} className="text-gray-400 hover:text-red-600 bg-white border border-gray-200 p-2 rounded-lg hover:border-red-200 hover:bg-red-50 transition-all shadow-sm" title="Sil"><Trash2 size={16}/></button>
                                </td>
                             </tr>
                           );
                        })}
                        {devCardData.activities.length === 0 && (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-400 font-medium">Öğrenciye ait aktivite kaydı bulunamadı.</td></tr>
                        )}
                     </tbody>
                   </table>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 mt-6">
              {/* School Ranking */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold font-display text-gray-800 mb-6 flex items-center">
                  <Trophy className="text-yellow-500 mr-3" size={24} /> Okul Sıralaması (İlk 10)
                </h3>
                {top10School.length > 0 ? (
                  <div className="space-y-3">
                    {top10School.map((student: any, idx: number) => (
                      <div key={student.id} className={`flex items-center justify-between p-4 rounded-2xl border ${student.fullName === selectedStudent ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-100'} transition-all`}>
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-200 text-gray-700' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-white text-gray-400'}`}>
                            {idx + 1}
                          </div>
                          <span className={`font-semibold ${student.fullName === selectedStudent ? 'text-indigo-800' : 'text-gray-700'}`}>{student.fullName}</span>
                        </div>
                        <span className="font-black text-green-600 px-3 py-1 bg-green-50 rounded-lg">{student.score} Puan</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    Henüz yeterli veri bulunamadı.
                  </div>
                )}
              </div>

              {/* Class Ranking */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold font-display text-gray-800 mb-6 flex items-center">
                  <Activity className="text-indigo-500 mr-3" size={24} /> Sınıf Sıralaması (İlk 5)
                </h3>
                {top5Class.length > 0 ? (
                  <div className="space-y-3">
                    {top5Class.map((student: any, idx: number) => (
                      <div key={student.id} className={`flex items-center justify-between p-4 rounded-2xl border ${student.fullName === selectedStudent ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-100'} transition-all`}>
                        <div className="flex items-center space-x-4">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-200 text-gray-700' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-white text-gray-400'}`}>
                            {idx + 1}
                          </div>
                          <span className={`font-semibold ${student.fullName === selectedStudent ? 'text-indigo-800' : 'text-gray-700'}`}>{student.fullName}</span>
                        </div>
                        <span className="font-black text-green-600 px-3 py-1 bg-green-50 rounded-lg">{student.score} Puan</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    Henüz yeterli veri bulunamadı.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-500">
           {/* Add Class Performance Form */}
           <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 print:hidden">
               <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
                   <PlusCircle className="text-blue-600" /> Manuel Sınıf Puanı Ekle
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                   <div className="col-span-1">
                       <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wider">Sınıf</label>
                       <select value={perfForm.classId} onChange={e => setPerfForm({...perfForm, classId: e.target.value})} className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer">
                           <option value="">Seçiniz</option>
                           {Object.keys(classes || {}).map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                   </div>
                   <div className="col-span-1">
                       <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wider">Hafta / Ay</label>
                       <input type="text" value={perfForm.period} onChange={e => setPerfForm({...perfForm, period: e.target.value})} className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all" placeholder="Örn: 1. Hafta" />
                   </div>
                   <div className="col-span-1">
                       <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wider text-center" title="Yarışmalara Katılım">Yarışma P. (1-3)</label>
                       <select value={perfForm.competitions?.toString()} onChange={e => setPerfForm({...perfForm, competitions: parseInt(e.target.value)})} className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer">
                           {[0,1,2,3].map(n => <option key={n} value={n}>{n} Puan</option>)}
                       </select>
                   </div>
                   <div className="col-span-1">
                       <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wider text-center" title="Sınıf içi görevlerin düzenli yerine getirilmesi">Görev P. (1-3)</label>
                       <select value={perfForm.tasks?.toString()} onChange={e => setPerfForm({...perfForm, tasks: parseInt(e.target.value)})} className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer">
                           {[0,1,2,3].map(n => <option key={n} value={n}>{n} Puan</option>)}
                       </select>
                   </div>
                   <div className="col-span-1">
                       <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wider text-center" title="Sınıf düzen ve temizlik">Temizlik P. (1-3)</label>
                       <select value={perfForm.cleanliness?.toString()} onChange={e => setPerfForm({...perfForm, cleanliness: parseInt(e.target.value)})} className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer">
                           {[0,1,2,3].map(n => <option key={n} value={n}>{n} Puan</option>)}
                       </select>
                   </div>
                   <div className="col-span-1">
                       <button onClick={handleAddClassPerformance} className="w-full bg-blue-600 text-white font-bold h-[46px] rounded-xl shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"><PlusCircle size={18}/> Ekle</button>
                   </div>
               </div>
           </div>

           {/* Class Dashboard Stats */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                 <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6"><Award size={24}/></div>
                 <h4 className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">En Başarılı Sınıf</h4>
                 <div className="text-3xl font-black text-gray-900">{classScores[0]?.name || '-'}</div>
                 <div className="mt-2 text-xs font-bold text-emerald-600 bg-emerald-50 w-max px-2 py-1 rounded-lg">+{classScores[0]?.score || 0} Toplam Puan</div>
              </div>
              <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                 <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6"><Activity size={24}/></div>
                 <h4 className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">En Düzenli Sınıf</h4>
                 <div className="text-3xl font-black text-gray-900">{classScores.sort((a,b) => b.pCleanliness - a.pCleanliness)[0]?.name || '-'}</div>
                 <div className="mt-2 text-xs font-bold text-blue-600 bg-blue-50 w-max px-2 py-1 rounded-lg">Temizlik Lideri</div>
              </div>
              <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                 <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-6"><Trophy size={24}/></div>
                 <h4 className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">Okul Ortalaması</h4>
                 <div className="text-3xl font-black text-gray-900">
                    {(classScores.reduce((acc, c) => acc + c.score, 0) / (classScores.length || 1)).toFixed(1)}
                 </div>
                 <div className="mt-2 text-xs font-bold text-gray-400">Genel Puan Ortalaması</div>
              </div>
           </div>

           {/* Detailed Class Scores Table */}
           <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-100 bg-[#FBFBFC] flex justify-between items-center">
                 <div>
                    <h3 className="text-xl font-black text-gray-900">Sınıf Gelişim Kartı</h3>
                    <p className="text-gray-500 text-sm font-medium mt-1">Sınıfların parametrelere göre performans detayları.</p>
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                       <tr>
                          <th className="px-6 py-6">Sıra</th>
                          <th className="px-6 py-6">Sınıf</th>
                          <th className="px-6 py-6">Yarışmalara Katılım</th>
                          <th className="px-6 py-6">Görevlerin İfası</th>
                          <th className="px-6 py-6">Düzen & Temizlik</th>
                          <th className="px-6 py-6 text-right">Toplam Puan</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {classScores.sort((a,b) => b.score - a.score).map((cls, idx) => (
                          <React.Fragment key={cls.name}>
                             <tr className="hover:bg-gray-50 transition-all group cursor-pointer" onClick={(e) => {
                                 const nextRow = e.currentTarget.nextElementSibling;
                                 if(nextRow) nextRow.classList.toggle('hidden');
                             }}>
                                <td className="px-6 py-6">
                                   <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-100 text-gray-700' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-400'}`}>
                                      {idx + 1}
                                   </div>
                                </td>
                                <td className="px-6 py-6">
                                   <div className="font-black text-gray-900 text-base">{cls.name}</div>
                                </td>
                                <td className="px-6 py-6 text-blue-600 font-bold">{cls.pCompetitions} Puan</td>
                                <td className="px-6 py-6 text-emerald-600 font-bold">{cls.pTasks} Puan</td>
                                <td className="px-6 py-6 text-indigo-600 font-bold">{cls.pCleanliness} Puan</td>
                                <td className="px-6 py-6 text-right">
                                   <span className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-black text-lg shadow-lg shadow-blue-200">
                                      {cls.score}
                                   </span>
                                </td>
                             </tr>
                             <tr className="hidden bg-gray-50">
                                <td colSpan={6} className="px-6 py-4">
                                   <div className="text-sm font-bold text-gray-800 mb-3">Tarihsel Kayıtlar</div>
                                   {cls.records.length > 0 ? (
                                     <table className="w-full text-xs text-left ring-1 ring-gray-200 rounded-lg overflow-hidden bg-white">
                                        <thead className="bg-gray-100 text-gray-500 uppercase tracking-widest">
                                           <tr>
                                              <th className="px-4 py-2">Dönem</th>
                                              <th className="px-4 py-2">Yarışmalar</th>
                                              <th className="px-4 py-2">Görevler</th>
                                              <th className="px-4 py-2">Temizlik</th>
                                              <th className="px-4 py-2">Puanlama Tarihi</th>
                                              <th className="px-4 py-2">Puanı Veren Kişi</th>
                                              <th className="px-4 py-2 text-right"></th>
                                           </tr>
                                        </thead>
                                        <tbody>
                                           {cls.records.map((r: any) => (
                                              <tr key={r.id} className="border-t border-gray-100">
                                                 <td className="px-4 py-2 font-bold">{r.period}</td>
                                                 <td className="px-4 py-2">+{r.competitions}</td>
                                                 <td className="px-4 py-2">+{r.tasks}</td>
                                                 <td className="px-4 py-2">+{r.cleanliness}</td>
                                                 <td className="px-4 py-2">{r.date ? new Date(r.date).toLocaleDateString('tr-TR') : '-'}</td>
                                                 <td className="px-4 py-2">{r.evaluator || '-'}</td>
                                                 <td className="px-4 py-2 text-right">
                                                    <button onClick={() => handleDeleteClassPerformance(r.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"><Trash2 size={14}/></button>
                                                 </td>
                                              </tr>
                                           ))}
                                        </tbody>
                                     </table>
                                   ) : (
                                     <div className="text-gray-400 text-xs">Henüz kayıt eklenmemiş.</div>
                                   )}
                                </td>
                             </tr>
                          </React.Fragment>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Scoring Rules Legend */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50/50 p-8 rounded-[32px] border border-blue-100/50">
                 <h5 className="font-black text-blue-900 text-sm mb-4 flex items-center gap-2"><CheckCircle size={18}/> Yarışmalara Katılım</h5>
                 <p className="text-xs font-bold text-blue-700 leading-relaxed">
                    Sınıfın okul içi, ilçe veya il düzeyindeki yarışmalara katılımına göre haftalık veya aylık periyotlarda 1, 2 veya 3 puan verilir.
                 </p>
              </div>
              <div className="bg-emerald-50/50 p-8 rounded-[32px] border border-emerald-100/50">
                 <h5 className="font-black text-emerald-900 text-sm mb-4 flex items-center gap-2"><Award size={18}/> Görevlerin İfası</h5>
                 <p className="text-xs font-bold text-emerald-700 leading-relaxed">
                    Sınıf içi görevlerin, panoların vs. düzenli yerine getirilmesine dönük rehberlik servisince ya da sınıf öğretmenince 1, 2, 3 puan üzerinden değerlendirme yapılır.
                 </p>
              </div>
              <div className="bg-indigo-50/50 p-8 rounded-[32px] border border-indigo-100/50">
                 <h5 className="font-black text-indigo-900 text-sm mb-4 flex items-center gap-2"><Activity size={18}/> Düzen & Temizlik</h5>
                 <p className="text-xs font-bold text-indigo-700 leading-relaxed">
                    Sınıfın düzeni ve temizlik hassasiyetine göre ilgili öğretmenler ya da idare tarafından 1, 2 veya 3 puan verilir.
                 </p>
              </div>
           </div>
        </div>
      )}

      {/* PDF Export Section (Keep hidden for student PDF only) */}
      {activeSubTab === 'student' && (
        <div className="absolute top-0 right-full w-[210mm] opacity-0 pointer-events-none -z-50" style={{ left: '-9999px' }}>
         <div ref={pdfDevCardRef} className="bg-white w-[210mm] min-h-[297mm]">
            <div className="bg-[#1e5cdc] text-white p-12 w-full h-48 flex items-center justify-between relative overflow-hidden">
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-24 h-24 bg-white/10 border border-white/20 rounded-3xl flex items-center justify-center shrink-0">
                        <Award size={40} className="text-white" strokeWidth={2} />
                    </div>
                    <div>
                       <h1 className="text-4xl font-black tracking-tight mb-2">{selectedStudent}</h1>
                       <div className="text-sm font-bold uppercase tracking-widest text-[#a5c0ff] flex items-center gap-2">
                           <span>SINIF: {selectedClass || '-'}</span>
                           <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span>
                           <span>KİŞİSEL GELİŞİM VE BAŞARI KARTI</span>
                       </div>
                    </div>
                </div>
                <div className="text-right relative z-10">
                    <div className="text-6xl font-black">{totalScore}</div>
                    <div className="text-xs font-bold uppercase tracking-widest text-[#a5c0ff] mt-1">TOPLAM PUAN</div>
                </div>
            </div>

            <div className="p-12 space-y-8">
                <div>
                   <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 mb-6 uppercase tracking-wider">
                       <Star className="text-blue-500 fill-blue-500" size={20} /> KAZANILAN UNVANLAR
                   </h2>
                   <div className="grid grid-cols-4 gap-3">
                       {devCardConfig.titles.map((title: any, idx: number) => {
                           const isEarned = totalScore >= title.threshold;
                           return (
                               <div key={idx} className={`p-4 rounded-xl border flex flex-col justify-between ${isEarned ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 bg-gray-50'}`}>
                                   <div className="flex items-center gap-3 mb-2">
                                       <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${isEarned ? 'bg-[#1e5cdc] text-white' : 'bg-gray-200 text-gray-400'}`}>
                                           {isEarned ? <Check size={16} strokeWidth={3} /> : title.id}
                                       </div>
                                       <div className={`font-black text-xs leading-tight ${isEarned ? 'text-gray-900' : 'text-gray-500'}`}>{title.name}</div>
                                   </div>
                                   <div>
                                       <div className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${isEarned ? 'text-gray-500' : 'text-gray-400'}`}>{title.threshold} PUAN</div>
                                       <div className={`text-[10px] leading-tight ${isEarned ? 'text-gray-600' : 'text-gray-400'}`}>{title.right}</div>
                                   </div>
                               </div>
                           );
                       })}
                   </div>
                </div>

                <div>
                   <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 mb-6 uppercase tracking-wider">
                       <Activity className="text-blue-500" size={20} /> AKTİVİTE GEÇMİŞİ
                   </h2>
                   <table className="w-full text-left border-collapse">
                       <thead>
                           <tr className="border-b-2 border-gray-100 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                               <th className="py-4 pl-4 rounded-l-xl w-32">TARİH</th>
                               <th className="py-4">AKTİVİTE / GÖREV</th>
                               <th className="py-4 w-40">KAPSAM</th>
                               <th className="py-4 w-40">BAŞARI</th>
                               <th className="py-4 pr-4 rounded-r-xl w-24 text-center">PUAN</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                           {(devCardData.activities || []).map((act: any, idx: number) => {
                               const level = devCardConfig.levels.find((l: any) => l.id.toString() === act.levelId?.toString());
                               const rubric = devCardConfig.rubrics.find((r: any) => r.id.toString() === act.rubricId?.toString());
                               const pts = act.score || (level?.score || 0) * (rubric?.multiplier || 0);

                               return (
                                   <tr key={idx}>
                                       <td className="py-5 pl-4 text-gray-500 text-sm font-medium">{new Date(act.date).toLocaleDateString('tr-TR')}</td>
                                       <td className="py-5 font-black text-gray-800 text-sm">{act.description}</td>
                                       <td className="py-5 text-gray-600 text-xs pr-2">{level?.name || '-'}</td>
                                       <td className="py-5 text-gray-600 text-xs pr-2">{rubric?.name || '-'}</td>
                                       <td className="py-5 pr-4 text-center font-black text-[#1e5cdc] text-base">+{pts}</td>
                                   </tr>
                               );
                           })}
                       </tbody>
                   </table>
                </div>

                <div className="pt-24 flex justify-between px-12">
                    <div className="text-center w-64">
                        <div className="border-b-2 border-gray-200 mb-3 w-full"></div>
                        <div className="font-bold text-gray-800 text-sm">Sınıf Rehber Öğretmeni</div>
                    </div>
                    <div className="text-center w-64">
                        <div className="border-b-2 border-gray-200 mb-3 w-full"></div>
                        <div className="font-bold text-gray-800 text-sm">Okul Müdürü</div>
                    </div>
                </div>
            </div>
         </div>
        </div>
      )}
    </div>
  );
};
