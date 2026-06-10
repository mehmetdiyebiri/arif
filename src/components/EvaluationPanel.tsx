import React, { useRef, useState } from 'react';
import { User, Download, PenTool, School, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export const EvaluationPanel = ({ state, actions }: any) => {
  const { selectedStudent, categories, tasks, evaluations, successDescriptions, remedialTasks, remedialProblems, uncompletedReasons, currentUser, activeSchoolId, schools, selectedClass, users } = state;
  const { handleTaskChange } = actions;
  
  const [isDownloading, setIsDownloading] = useState(false);
  const pdfReportRef = useRef<HTMLDivElement>(null);

  const activeSchool = schools?.find((s: any) => s.id === activeSchoolId);
  const schoolName = activeSchool?.name || "DEĞERLER EĞİTİMİ";

  const getEvaluatorName = (evalStr: string) => {
      if (!evalStr) return currentUser.name || currentUser.username;
      // Resolve from legacy username
      const matchedUser = users?.find((u: any) => u.username === evalStr || u.id === evalStr);
      if (matchedUser) return matchedUser.name || matchedUser.username;
      return evalStr;
  };

  const localHandleDownloadPDF = async () => {
      if (!pdfReportRef.current) return;
      
      setIsDownloading(true);
      try {
          const dataUrl = await toPng(pdfReportRef.current, { 
              quality: 1.0,
              pixelRatio: 2,
              filter: (node: any) => {
                  return !node.hasAttribute?.('data-html2canvas-ignore');
              }
          });
          
          const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
          const imgProps = pdf.getImageProperties(dataUrl);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          
          let position = 0;
          const pageHeight = pdf.internal.pageSize.getHeight();
          let heightLeft = pdfHeight;

          pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;

          while (heightLeft > 0) {
              position -= pageHeight;
              pdf.addPage();
              pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
              heightLeft -= pageHeight;
          }
          
          pdf.save(`${selectedStudent}_Karne.pdf`);
      } catch (error) {
          console.error('Error generating PDF:', error);
      } finally {
          setIsDownloading(false);
      }
  };

  const getTaskEvalData = (cat: string, idx: number) => evaluations[selectedStudent]?.[cat]?.[idx] || { status: null, score: 1 };

  const getStatusColors = (status: string) => {
        if (status === 'YAPTI') return { 
            border: 'border-green-400 shadow-sm shadow-green-100', 
            btnYapti: 'bg-green-500 text-white shadow-sm', 
            btnYapmadi: 'bg-white text-gray-400 hover:bg-gray-50', 
            btnYapamadi: 'bg-white text-gray-400 hover:bg-gray-50', 
            activeCircle: 'bg-green-500 text-white border-green-500 shadow-sm',
            dot: 'bg-green-500', divider: 'border-gray-100'
        };
        if (status === 'YAPMADI') return { 
            border: 'border-red-400 shadow-sm shadow-red-100', 
            btnYapti: 'bg-white text-gray-400 hover:bg-gray-50', 
            btnYapmadi: 'bg-red-500 text-white shadow-sm', 
            btnYapamadi: 'bg-white text-gray-400 hover:bg-gray-50', 
            activeCircle: 'bg-red-500 text-white border-red-500 shadow-sm',
            dot: 'bg-red-500', divider: 'border-gray-100'
        };
        if (status === 'YAPAMADI') return { 
            border: 'border-orange-300 bg-orange-50/50 shadow-sm', 
            btnYapti: 'bg-white text-gray-400 hover:bg-gray-50 border-gray-200', 
            btnYapmadi: 'bg-white text-gray-400 hover:bg-gray-50 border-gray-200', 
            btnYapamadi: 'bg-orange-500 text-white shadow-sm border-orange-500', 
            activeCircle: 'bg-orange-500 text-white border-orange-500 shadow-sm',
            dot: 'bg-orange-500', divider: 'border-orange-100'
        };
        return { 
            border: 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white', 
            btnYapti: 'bg-white text-gray-500 hover:bg-gray-50 border-gray-200', 
            btnYapmadi: 'bg-white text-gray-500 hover:bg-gray-50 border-gray-200', 
            btnYapamadi: 'bg-white text-gray-500 hover:bg-gray-50 border-gray-200', 
            activeCircle: 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50',
            dot: 'bg-gray-300', divider: 'border-gray-100'
        };
  };

  if (!selectedStudent) {
      return (
          <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl shadow-sm border border-gray-100 animate-in fade-in">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <User className="text-gray-300" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Öğrenci Seçiniz</h3>
              <p className="text-gray-500 text-sm max-w-sm text-center">Değerlendirme formunu görüntülemek için yukarıdaki menüden önce sınıf, ardından öğrenci seçimi yapınız.</p>
          </div>
      );
  }

  return (
      <div className="space-y-8 animate-in fade-in pb-12 relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                  <p className="text-gray-400 text-[11px] font-black uppercase tracking-[0.2em] mb-1">DEĞERLENDİRME PANELİ</p>
                  <h2 className="font-black text-4xl text-blue-900 tracking-tight lowercase">{selectedStudent}</h2>
              </div>
              <button 
                  onClick={localHandleDownloadPDF} 
                  disabled={isDownloading}
                  className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm text-sm print:hidden"
              >
                  {isDownloading ? <><Loader2 size={16} className="animate-spin" /> Hazırlanıyor</> : <><Download size={16} /> Raporu PDF İndir</>}
              </button>
          </div>

          <div className="space-y-12">
              {categories.map((cat: string, cIdx: number) => (
                  <div key={cIdx} className="space-y-6">
                      <h2 className="text-2xl font-black text-blue-900 uppercase tracking-wider">{cat}</h2>
                      <div className="space-y-6">
                          {(tasks[cat] || []).map((task: any, tIdx: number) => {
                              const data = getTaskEvalData(cat, tIdx);
                              const colors = getStatusColors(data.status);
                              const taskText = typeof task === 'string' ? task : task.title;
                              const parts = taskText.split(':');
                              const title = parts[0];
                              const desc = parts.length > 1 ? parts.slice(1).join(':').trim() : '';

                              return (
                                  <div key={tIdx} className={`p-8 rounded-[2rem] border-2 transition-all duration-500 bg-white ${colors.border}`}>
                                      <div className="flex flex-col lg:flex-row justify-between gap-8">
                                          <div className="flex-1 space-y-3">
                                              <div className="flex items-center gap-2">
                                                  <span className={`w-2 h-2 rounded-full ${colors.dot}`}></span>
                                                  <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.15em]">GÖREV {tIdx + 1}</span>
                                              </div>
                                              <h3 className="font-black text-xl text-gray-900 leading-tight">{title}</h3>
                                              {desc && <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-3xl">{desc}</p>}
                                          </div>
                                          
                                          <div className="flex gap-2 shrink-0 h-fit bg-gray-50 p-2 rounded-2xl border border-gray-100">
                                              <button 
                                                  onClick={() => handleTaskChange(cat, tIdx, 'status', data.status === 'YAPTI' ? null : 'YAPTI')} 
                                                  className={`px-8 py-3 rounded-xl text-xs font-black transition-all border-2 ${data.status === 'YAPTI' ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-100' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'}`}
                                              >
                                                  YAPTI
                                              </button>
                                              <button 
                                                  onClick={() => handleTaskChange(cat, tIdx, 'status', data.status === 'YAPMADI' ? null : 'YAPMADI')} 
                                                  className={`px-8 py-3 rounded-xl text-xs font-black transition-all border-2 ${data.status === 'YAPMADI' ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-100' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'}`}
                                              >
                                                  YAPMADI
                                              </button>
                                              <button 
                                                  onClick={() => handleTaskChange(cat, tIdx, 'status', data.status === 'YAPAMADI' ? null : 'YAPAMADI')} 
                                                  className={`px-8 py-3 rounded-xl text-xs font-black transition-all border-2 ${data.status === 'YAPAMADI' ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-100' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'}`}
                                              >
                                                  YAPAMADI
                                              </button>
                                          </div>
                                      </div>
                                      
                                      <div className={`mt-8 pt-8 flex flex-col md:flex-row gap-6 items-center border-t-2 transition-colors ${colors.divider}`}>
                                          <div className="flex gap-2.5 shrink-0">
                                              {[1, 2, 3, 4, 5].map(s => (
                                                  <button 
                                                      key={s} 
                                                      onClick={() => handleTaskChange(cat, tIdx, 'score', s)} 
                                                      className={`w-11 h-11 rounded-full flex items-center justify-center font-black border-2 transition-all text-sm ${data.score === s && data.status ? colors.activeCircle : 'bg-white text-gray-300 border-gray-100 hover:border-gray-300 hover:text-gray-600'}`}
                                                  >
                                                      {s}
                                                  </button>
                                              ))}
                                          </div>
                                          <div className="flex-1 text-sm italic text-gray-500 font-semibold space-y-1">
                                              {data.status === 'YAPTI' ? (
                                                  <div>{successDescriptions[data.score || 1]}</div>
                                              ) : data.status === 'YAPAMADI' ? (
                                                  <div className="space-y-1">
                                                      <div className="text-orange-600 font-bold text-[10px] uppercase tracking-wider">Sorun: {remedialProblems?.[data.score || 1]}</div>
                                                      <div className="text-blue-600">Telafi Görevi: {remedialTasks[data.score || 1]}</div>
                                                  </div>
                                              ) : data.status === 'YAPMADI' ? (
                                                  <div className="space-y-1">
                                                      <div className="text-red-600 font-bold text-[10px] uppercase tracking-wider">Sebep (Seviye {data.score || 1}):</div>
                                                      <div className="text-red-500 font-semibold">{uncompletedReasons?.[data.score || 1] || "Görevi yerine getirmedi."}</div>
                                                  </div>
                                              ) : null}
                                          </div>
                                          <div className="text-[10px] font-black text-gray-300 flex items-center gap-2 shrink-0 ml-auto bg-gray-50/50 px-4 py-2 rounded-xl border border-gray-100 uppercase tracking-widest">
                                              <PenTool size={14} className="text-gray-300"/> Değerlendiren: {getEvaluatorName(data.evaluator)}
                                          </div>
                                      </div>
                                  </div>
                              )
                          })}
                      </div>
                  </div>
              ))}
          </div>

          <div className="absolute top-0 right-full w-[210mm] opacity-0 pointer-events-none -z-50" style={{ left: '-9999px' }}>
             <div ref={pdfReportRef} className="bg-white p-12 w-[210mm] min-h-[297mm]">
                  <div className="h-4 bg-blue-500 w-full mb-10 rounded-full"></div>
                  
                  <div className="flex justify-between items-center border-b border-gray-100 pb-8 mb-10">
                      <div className="flex items-center gap-6">
                          <div className="w-20 h-20 bg-blue-50/80 border border-blue-100 rounded-2xl flex items-center justify-center shrink-0 shadow-sm text-blue-600">
                              <School size={36} strokeWidth={2.5} />
                          </div>
                          <div>
                              <h1 className="text-[32px] font-black text-gray-900 tracking-tight leading-none mb-2">{selectedStudent}</h1>
                              <div className="text-sm text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                  <span>SINIF: {selectedClass || '-'}</span>
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                  <span>DEĞERLER EĞİTİMİ RAPORU</span>
                              </div>
                          </div>
                      </div>
                      <div className="text-right shrink-0">
                          <div className="text-base font-black text-gray-800">{new Date().toLocaleDateString('tr-TR')}</div>
                          <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1.5">{schoolName}</div>
                      </div>
                  </div>

                  <div className="space-y-8">
                     {categories.map((cat: string, cIdx: number) => {
                         const catTasks = tasks[cat] || [];
                         const countYapti = catTasks.filter((_: any, i: number) => getTaskEvalData(cat, i).status === 'YAPTI').length;
                         const successPercentage = catTasks.length > 0 ? Math.round((countYapti / catTasks.length) * 100) : 0;
                         
                         return (
                             <div key={cIdx} className="border border-gray-100 rounded-[1.5rem] p-8 bg-white shadow-sm shrink-0" style={{ pageBreakInside: 'avoid' }}>
                                 <div className="flex justify-between items-center mb-6">
                                     <h2 className="text-2xl font-black text-blue-900 tracking-tight uppercase">{cat}</h2>
                                     <div className="bg-blue-50 text-blue-700 font-bold px-4 py-2 rounded-xl text-sm border border-blue-100">
                                         Başarı: %{successPercentage}
                                     </div>
                                 </div>
                                 <table className="w-full text-left border-collapse">
                                     <thead>
                                         <tr className="border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                             <th className="py-4 w-12 text-center">NO</th>
                                             <th className="py-4 pl-4">GÖREV / AÇIKLAMA</th>
                                             <th className="py-4 text-center w-32">DURUM</th>
                                         </tr>
                                     </thead>
                                     <tbody className="divide-y divide-gray-50">
                                         {catTasks.map((task: any, tIdx: number) => {
                                             const data = getTaskEvalData(cat, tIdx);
                                             const taskText = typeof task === 'string' ? task : task.title;
                                             const [title, ...descParts] = taskText.split(':');
                                             const desc = descParts.join(':').trim();

                                             let statusBadge = <span className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">-</span>;
                                             if (data.status === 'YAPTI') statusBadge = <span className="bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9] px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">YAPTI</span>;
                                             if (data.status === 'YAPMADI') statusBadge = <span className="bg-[#ffebee] text-[#c62828] border border-[#ffcdd2] px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">YAPMADI</span>;
                                             if (data.status === 'YAPAMADI') statusBadge = <span className="bg-[#fff3e0] text-[#ef6c00] border border-[#ffe0b2] px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">YAPAMADI</span>;

                                             return (
                                                 <tr key={tIdx}>
                                                     <td className="py-5 text-center font-black text-gray-300 text-lg">{tIdx + 1}</td>
                                                     <td className="py-5 pl-4 pr-6">
                                                         <div className="font-bold text-gray-900 text-[14px] leading-tight">{title}</div>
                                                         {desc && <div className="text-gray-400 text-[12px] font-medium mt-1.5 leading-snug">{desc}</div>}
                                                         {data.status === 'YAPTI' && (
                                                             <div className="text-emerald-700 text-[11px] font-semibold mt-1.5 bg-emerald-50/50 border border-emerald-100/20 px-2 py-1 rounded-md">
                                                                 Seviye {data.score || 1}: {successDescriptions?.[data.score || 1]}
                                                             </div>
                                                         )}
                                                         {data.status === 'YAPAMADI' && (
                                                             <div className="text-orange-700 text-[11px] font-semibold mt-1.5 bg-orange-50/50 border border-orange-100/20 px-2 py-1 rounded-md">
                                                                 Sorun: {remedialProblems?.[data.score || 1]} | Telafi: {remedialTasks?.[data.score || 1]}
                                                             </div>
                                                         )}
                                                         {data.status === 'YAPMADI' && (
                                                             <div className="text-[#c62828] text-[11px] font-semibold mt-1.5 bg-[#ffebee]/30 border border-[#ffcdd2]/25 px-2 py-1 rounded-md">
                                                                 Sebep (Seviye {data.score || 1}): {uncompletedReasons?.[data.score || 1] || "Görevi yerine getirmedi."}
                                                             </div>
                                                         )}
                                                     </td>
                                                     <td className="py-5 text-center">{statusBadge}</td>
                                                 </tr>
                                             );
                                         })}
                                     </tbody>
                                 </table>
                             </div>
                         );
                     })}
                  </div>
             </div>
          </div>
      </div>
  );
};
