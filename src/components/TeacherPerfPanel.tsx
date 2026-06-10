import React, { useState, useEffect } from 'react';
import { LineChart, ChevronDown, PlusCircle, Trash2, Trophy, ListTodo, CheckCircle2, Circle, Calendar } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

export const TeacherPerfPanel = ({ state, actions }: any) => {
  const { users, selectedTeacherForPerf, newTeacherActivity, teacherPerfConfig, teacherPerfData, activeSchoolId, currentUser } = state;
  const { setSelectedTeacherForPerf, setNewTeacherActivity, handleAddTeacherActivity, handleDeleteTeacherActivity } = actions;
  
  const assignmentGroups = teacherPerfConfig?.assignmentGroups || [];

  const [activeTab, setActiveTab] = useState('perf');
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskStats, setTaskStats] = useState<any>({});
  
  const staffList = users.filter((u: any) => u.role === 'teacher' || u.role === 'admin');
  const teachersOnly = users.filter((u: any) => u.role === 'teacher');

  useEffect(() => {
      if (!activeSchoolId) return;
      const sysColName = activeSchoolId === 'default' ? 'systemConfig' : `systemConfig_${activeSchoolId}`;
      const docRef = doc(db, sysColName, 'teacherTasksConfig');
      
      const unsubscribe = onSnapshot(docRef, (snap) => {
          if (snap.exists()) {
              setTasks(snap.data().tasks || []);
          }
      });
      return () => unsubscribe();
  }, [activeSchoolId, currentUser]);

  const baseTasks = teacherPerfConfig?.yearlyTasks || [];
  const displayTasks = baseTasks.map((bt: any) => {
      const dbTask = tasks.find((t: any) => t.id === bt.id || t.id === String(bt.id) || Number(t.id) === bt.id);
      return {
          id: bt.id,
          month: bt.month,
          title: bt.task,
          date: dbTask?.date || bt.dateRange,
          status: dbTask?.status || 'pending',
          assignedTo: dbTask?.assignedTo || ''
      };
  });

  useEffect(() => {
      const stats: any = {};
      staffList.forEach((t: any) => {
          stats[t.id] = { total: 0, completed: 0, name: t.name || t.username };
      });
      assignmentGroups.forEach((g: any) => {
          stats[g.id] = { total: 0, completed: 0, name: g.name };
      });
      displayTasks.forEach((t: any) => {
          if (t.assignedTo && stats[t.assignedTo]) {
              stats[t.assignedTo].total += 1;
              if (t.status === 'completed') {
                  stats[t.assignedTo].completed += 1;
              }
          }
      });
      setTaskStats(stats);
  }, [tasks, users, teacherPerfConfig]);

  const updateTaskInDbSafe = async (modifiedTaskId: string, changes: any) => {
      if (!activeSchoolId || (currentUser?.role !== 'admin' && currentUser?.role !== 'superadmin')) {
          actions.setAppToast({ message: "Bu işlemi yapmak için yönetici yetkisine sahip olmalısınız.", type: "error" });
          return;
      }
      let newTasks = [...tasks];
      const taskIndex = newTasks.findIndex((t: any) => String(t.id) === String(modifiedTaskId));
      if (taskIndex >= 0) {
          newTasks[taskIndex] = { ...newTasks[taskIndex], ...changes };
      } else {
          const bt = baseTasks.find((b: any) => String(b.id) === String(modifiedTaskId));
          if (bt) {
              newTasks.push({ id: bt.id, month: bt.month, title: bt.task, date: bt.dateRange, status: 'pending', assignedTo: '', ...changes });
          }
      }
      const sysColName = activeSchoolId === 'default' ? 'systemConfig' : `systemConfig_${activeSchoolId}`;
      await setDoc(doc(db, sysColName, 'teacherTasksConfig'), { tasks: newTasks }, { merge: true });
      actions.setAppToast({ message: "Görev kaydedildi.", type: "success" });
  };

  const handleAssignTask = (taskId: string, teacherId: string) => updateTaskInDbSafe(taskId, { assignedTo: teacherId });
  const handleToggleTaskStatus = (taskId: string) => {
      const t = displayTasks.find((t: any) => t.id === taskId || String(t.id) === String(taskId));
      updateTaskInDbSafe(taskId, { status: t?.status === 'completed' ? 'pending' : 'completed' });
  };
  const handleUpdateTaskDate = (taskId: string, newDate: string) => updateTaskInDbSafe(taskId, { date: newDate });

  return (
     <div className="space-y-6 animate-in fade-in pb-12">
        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-gray-200">
            <button 
                onClick={() => setActiveTab('perf')} 
                className={`pb-4 px-3 md:px-6 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'perf' ? 'border-blue-600 text-blue-800' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                <LineChart size={18} /> Öğretmen Performans
            </button>
            <button 
                onClick={() => setActiveTab('tasks')} 
                className={`pb-4 px-3 md:px-6 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'tasks' ? 'border-blue-600 text-blue-800' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                <ListTodo size={18} /> Görev Dağılımları
            </button>
        </div>

        {activeTab === 'perf' && (
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-black text-blue-900 mb-6 flex items-center gap-3"><LineChart className="text-blue-600"/> Öğretmen Performans Değerlendirme</h2>
                <div className="mb-8">
                    <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">Öğretmen Seçiniz</label>
                    <div className="relative max-w-md">
                        <select value={selectedTeacherForPerf} onChange={e => setSelectedTeacherForPerf(e.target.value)} className="w-full border border-gray-200 bg-gray-50 p-3.5 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer">
                            <option value="">Seçiniz</option>
                            {staffList.map((t: any) => <option key={t.id} value={t.name}>{t.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-4 text-gray-400 pointer-events-none" size={16}/>
                    </div>
                </div>
                
                {selectedTeacherForPerf && (
                    <div className="animate-in fade-in slide-in-from-bottom-2">
                        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 mb-8">
                            <h3 className="font-bold text-sm text-blue-800 mb-5 flex items-center gap-2"><PlusCircle size={16}/> Yeni Görev / Faaliyet Ekle</h3>
                            <div className="flex flex-col lg:flex-row gap-4 items-end">
                                <div className="flex-1 w-full">
                                    <label className="text-[10px] font-bold text-blue-600 uppercase block mb-1.5 tracking-wider">Faaliyet Açıklaması</label>
                                    <input type="text" value={newTeacherActivity.description} onChange={e => setNewTeacherActivity({...newTeacherActivity, description: e.target.value})} className="w-full border border-blue-200 bg-white p-3 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" placeholder="Örn: Veli toplantısı düzenledi, zümre toplantısına katıldı" />
                                </div>
                                <div className="w-full lg:w-56">
                                    <label className="text-[10px] font-bold text-blue-600 uppercase block mb-1.5 tracking-wider">Görev Tipi (Katsayı)</label>
                                    <select value={newTeacherActivity.taskTypeId} onChange={e => setNewTeacherActivity({...newTeacherActivity, taskTypeId: e.target.value})} className="w-full border border-blue-200 bg-white p-3 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer">
                                        <option value="">Seçiniz</option>
                                        {teacherPerfConfig.taskTypes.map((t: any) => <option key={t.id} value={t.id}>{t.name} (x{t.score})</option>)}
                                    </select>
                                </div>
                                <div className="w-full lg:w-48">
                                    <label className="text-[10px] font-bold text-blue-600 uppercase block mb-1.5 tracking-wider">Nitelik / Başarı</label>
                                    <select value={newTeacherActivity.rubricId} onChange={e => setNewTeacherActivity({...newTeacherActivity, rubricId: e.target.value})} className="w-full border border-blue-200 bg-white p-3 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer">
                                        <option value="">Seçiniz</option>
                                        {teacherPerfConfig.rubrics.map((r: any) => <option key={r.id} value={r.id}>{r.name} (x{r.multiplier})</option>)}
                                    </select>
                                </div>
                                <button onClick={handleAddTeacherActivity} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition w-full lg:w-auto h-[46px] shadow-sm shadow-blue-200 flex items-center justify-center">Ekle</button>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <span className="font-bold text-gray-800 text-sm">Faaliyet Geçmişi</span>
                                <span className="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-lg text-sm font-black border border-blue-200 shadow-sm">
                                    Toplam Puan: {(teacherPerfData[selectedTeacherForPerf]?.activities || []).reduce((acc: number, act: any) => {
                                        const tType = teacherPerfConfig.taskTypes.find((t: any) => t.id === parseInt(act.taskTypeId));
                                        const rub = teacherPerfConfig.rubrics.find((r: any) => r.id === parseInt(act.rubricId));
                                        return acc + ((tType?.score || 0) * (rub?.multiplier || 0));
                                    }, 0)}
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-white text-gray-400 border-b border-gray-100 text-[11px] uppercase tracking-wider">
                                        <tr>
                                            <th className="p-4 font-bold">Tarih</th>
                                            <th className="p-4 font-bold">Açıklama</th>
                                            <th className="p-4 font-bold">Görev Tipi</th>
                                            <th className="p-4 font-bold">Nitelik</th>
                                            <th className="p-4 font-bold text-center">Puan</th>
                                            <th className="p-4 font-bold text-right">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {(teacherPerfData[selectedTeacherForPerf]?.activities || []).map((act: any) => {
                                            const tType = teacherPerfConfig.taskTypes.find((t: any) => t.id === parseInt(act.taskTypeId));
                                            const rub = teacherPerfConfig.rubrics.find((r: any) => r.id === parseInt(act.rubricId));
                                            const pts = (tType?.score || 0) * (rub?.multiplier || 0);
                                            return (
                                                <tr key={act.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-4 text-gray-500 font-medium whitespace-nowrap">{new Date(act.date).toLocaleDateString('tr-TR')}</td>
                                                    <td className="p-4 font-semibold text-gray-800">{act.description}</td>
                                                    <td className="p-4 text-gray-600">{tType?.name}</td>
                                                    <td className="p-4 text-gray-600">{rub?.name}</td>
                                                    <td className="p-4 font-black text-blue-600 text-center">+{pts}</td>
                                                    <td className="p-4 text-right">
                                                        <button onClick={() => handleDeleteTeacherActivity(act.id)} className="text-gray-400 hover:text-red-500 bg-white border border-gray-200 p-2 rounded-lg hover:border-red-200 hover:bg-red-50 transition-all shadow-sm" title="Sil"><Trash2 size={16}/></button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {(teacherPerfData[selectedTeacherForPerf]?.activities || []).length === 0 && (
                                            <tr><td colSpan={6} className="p-8 text-center text-gray-400 font-medium">Bu öğretmene ait performans kaydı bulunmuyor.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Teacher Performance Rankings */}
                <div className="mt-12 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold font-display text-gray-800 mb-8 flex items-center gap-3">
                        <Trophy className="text-yellow-500" size={24} /> Personel Performans Sıralaması
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Top 10 Personnel */}
                        <div className="space-y-3">
                            {staffList
                                .map((staff: any) => {
                                    const activities = teacherPerfData[staff.name]?.activities || [];
                                    const score = activities.reduce((acc: number, act: any) => {
                                        const tType = teacherPerfConfig.taskTypes.find((t: any) => t.id === parseInt(act.taskTypeId));
                                        const rub = teacherPerfConfig.rubrics.find((r: any) => r.id === parseInt(act.rubricId));
                                        return acc + ((tType?.score || 0) * (rub?.multiplier || 0));
                                    }, 0);
                                    return { ...staff, score };
                                })
                                .sort((a: any, b: any) => b.score - a.score)
                                .slice(0, 10)
                                .map((staff: any, idx: number) => (
                                    <div key={staff.id} className={`flex items-center justify-between p-4 rounded-2xl border ${staff.name === selectedTeacherForPerf ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'} transition-all`}>
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-200 text-gray-700' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-white text-gray-400'}`}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <span className={`font-bold block ${staff.name === selectedTeacherForPerf ? 'text-blue-800' : 'text-gray-800'}`}>{staff.name}</span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{staff.role === 'admin' ? 'Yönetici' : 'Öğretmen'}</span>
                                            </div>
                                        </div>
                                        <span className="font-black text-blue-600 px-3 py-1 bg-blue-50 rounded-lg">{staff.score} Puan</span>
                                    </div>
                                ))}
                        </div>

                        {/* Fun Stats or Info */}
                        <div className="bg-gray-50/50 rounded-3xl p-8 border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4">
                                <LineChart className="text-blue-500" size={32} />
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2">Performans Odaklı Yönetim</h4>
                            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                                Personel performans puanları, girilen faaliyetlerin katsayıları ve nitelik çarpanları hesaplanarak otomatik olarak güncellenir.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'tasks' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {Object.values(taskStats).sort((a: any, b: any) => b.total - a.total).map((stat: any, idx: number) => (
                        <div key={idx} className="bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-blue-300 transition-all">
                            <span className="font-bold text-xs text-gray-800 truncate mr-3" title={stat.name}>{stat.name}</span>
                            <div className="font-black text-xs flex items-center gap-1 whitespace-nowrap">
                                <span className={stat.completed === stat.total && stat.total > 0 ? "text-green-600" : "text-gray-900"}>{stat.completed}</span>
                                <span className="text-gray-400">/ {stat.total}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
                                <Calendar className="text-blue-600" /> Yıllık Çalışma Planı Görevleri
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Eğitim-öğretim yılı boyunca yapılacak idari ve eğitim görevlerini personele atayın</p>
                        </div>

                    </div>

                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto max-h-[600px]">
                            <table className="w-full text-sm text-left relative">
                                <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 text-xs uppercase tracking-wider sticky top-0 z-10">
                                    <tr>
                                        <th className="p-4 font-black w-14">No</th>
                                        <th className="p-4 font-black w-24">Ay</th>
                                        <th className="p-4 font-black min-w-[300px]">Yapılacak İş</th>
                                        <th className="p-4 font-black min-w-[150px]">Tarih</th>
                                        <th className="p-4 font-black min-w-[200px]">Sorumlu Öğretmen</th>
                                        <th className="p-4 font-black text-center w-24">Durum</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {displayTasks.map((task: any, index: number) => (
                                        <tr key={task.id || index} className={`transition-colors text-sm ${task.status === 'completed' ? 'bg-green-50/30' : 'hover:bg-gray-50'}`}>
                                            <td className="px-4 py-2 font-bold text-gray-400">{task.id || index + 1}</td>
                                            <td className="px-4 py-2 font-bold text-gray-600">{task.month}</td>
                                            <td className="px-4 py-2 text-gray-800 leading-relaxed">{task.title}</td>
                                            <td className="px-4 py-2">
                                                {(currentUser?.role === 'admin' || currentUser?.role === 'superadmin') ? (
                                                    <input 
                                                        type="text" 
                                                        value={task.date || ''} 
                                                        onChange={(e) => handleUpdateTaskDate(task.id, e.target.value)}
                                                        className="w-full bg-white border border-gray-200 py-1.5 px-2 rounded-lg text-xs text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                                                    />
                                                ) : (
                                                    <span className="text-gray-600 font-medium text-xs">{task.date}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                {(currentUser?.role === 'admin' || currentUser?.role === 'superadmin') ? (
                                                    <select 
                                                        value={task.assignedTo || ''} 
                                                        onChange={(e) => handleAssignTask(task.id, e.target.value)}
                                                        className="w-full bg-white border border-gray-200 py-1.5 px-3 rounded-lg text-xs font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                                                    >
                                                        <option value="">Atanmadı</option>
                                                        {assignmentGroups.map((g: any) => (
                                                           <option key={g.id} value={g.id} className="font-bold text-blue-700">{g.name}</option>
                                                        ))}
                                                        <option disabled>──────────</option>
                                                        {teachersOnly.map((t: any) => (
                                                            <option key={t.id} value={t.id}>{t.name || t.username}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className={`font-semibold text-xs ${task.assignedTo ? 'text-blue-700' : 'text-gray-400'}`}>
                                                        {task.assignedTo ? (assignmentGroups.find((g: any) => g.id === task.assignedTo)?.name || users.find((u: any) => u.id === task.assignedTo)?.name || 'Bilinmiyor') : 'Atanmadı'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-center align-middle">                                      </td>
                                            <td className="px-4 py-3 text-center align-middle">
                                                <button 
                                                    onClick={() => {
                                                        if (currentUser?.role === 'admin' || currentUser?.role === 'superadmin') {
                                                            handleToggleTaskStatus(task.id);
                                                        }
                                                    }}
                                                    className={`p-1.5 rounded-full outline-none transition-all ${(currentUser?.role === 'admin' || currentUser?.role === 'superadmin') ? 'hover:scale-110 active:scale-95' : 'cursor-default'} ${task.status === 'completed' ? 'text-green-500 bg-green-100/50' : 'text-gray-300 hover:text-gray-400'}`}
                                                    title={task.status === 'completed' ? 'Yapıldı' : 'Bekliyor'}
                                                >
                                                    {task.status === 'completed' ? <CheckCircle2 size={28} className="drop-shadow-sm" /> : <Circle size={28} />}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {displayTasks.length === 0 && (
                                        <tr><td colSpan={6} className="p-8 text-center text-gray-400 font-medium tracking-wide">Görev listesi bulunamadı.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )}
     </div>
  );
};

