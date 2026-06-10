import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { Users, UserPlus, Shield, GraduationCap, Edit2, Trash2, Key, Upload, FileText, CheckCircle, X, Save, LayoutGrid, Layers, Trophy, Smile, ClipboardList, MessageSquare, Activity, ArrowLeft, Plus, AlertCircle, AlertTriangle, Award, Star, ChevronUp, ChevronDown, Zap, RefreshCw, Calendar } from 'lucide-react';
import { formatClassLabel } from '../lib/utils';
import { INITIAL_FORM_CONFIGS } from '../lib/constants';

import { AuditLogsPanel } from './AuditLogsPanel';

export const AdminPanel = ({ state, actions }: any) => {
  const { users, classes, adminTab, newUser, editUser, excelFile, excelPreview, activeSchoolId, categories, tasks, successDescriptions, remedialTasks, remedialProblems, uncompletedReasons, devCardConfig, tickets, teacherPerfConfig, behaviorConfig } = state;
  const { setAdminTab, setNewUser, handleAddUser, setEditUser, handleUpdateUser, handleDeleteUser, handleResetPassword, handleExcelUpload, handleImportExcel, setExcelFile, setExcelPreview, setActiveTab, handleAddClass, handleDeleteClass, handleAddCategory, handleDeleteCategory, handleAddTask, handleDeleteTask, handleBulkAddStudents, handleUpdateSuccessDescription, handleUpdateRemedialTask, handleUpdateRemedialProblem, handleUpdateUncompletedReason, handleUpdateCategory, handleUpdateTask, handleUpdateDevCardConfig, handleUpdateBehaviorConfig } = actions;

  const [selectedAdminClass, setSelectedAdminClass] = useState<string | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newTask, setNewTask] = useState({ title: '', category: '', points: 10 });
  const [bulkStudentInput, setBulkStudentInput] = useState('');
  const [editingField, setEditingField] = useState<{ type: 'success' | 'remedial' | 'problem' | 'uncompleted' | 'category' | 'task', level?: number, id?: string | number, category?: string } | null>(null);
  const [behaviorSubTab, setBehaviorSubTab] = useState<'cards' | 'forms'>('cards');

  const schoolUsers = users;

  const tabs = [
    { id: 'classes', label: 'Sınıflar', icon: LayoutGrid },
    { id: 'tasks', label: 'Görev & Değerlendirme', icon: Layers },
    { id: 'users', label: 'Kullanıcılar', icon: Users },
    { id: 'devcard', label: 'Gelişim Kartı Ayarları', icon: Trophy },
    { id: 'behavior', label: 'Davranış Modülü Ayarları', icon: Smile },
    { id: 'teacherperf', label: 'Öğretmen Performans', icon: Activity },
    { id: 'support', label: 'Destek Talepleri', icon: MessageSquare },
    { id: 'logs', label: 'Sistem Logları', icon: ClipboardList },
  ];

  const activeTicketsCount = tickets?.filter((t: any) => t.schoolId === activeSchoolId && t.status !== 'closed').length || 0;

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
        <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden">
            {/* Admin Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 border-b border-gray-100 bg-[#FBFBFC]">
                <h2 className="text-lg font-black text-blue-900 tracking-tight">Yönetim Paneli</h2>
                <button 
                    onClick={() => setActiveTab('eval')}
                    className="flex items-center gap-2 px-3.5 py-2 bg-white text-gray-700 rounded-xl border border-gray-200 font-bold text-xs hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm w-fit"
                >
                    <ArrowLeft size={12} /> Panele Dön
                </button>
            </div>

            {/* Admin Tabs */}
            <div className="flex gap-8 border-b border-gray-200 px-6 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setAdminTab(tab.id)}
                        className={`flex items-center gap-2.5 py-4 text-sm font-bold transition-all whitespace-nowrap border-b-2 ${
                            adminTab === tab.id || (adminTab === 'list' && tab.id === 'users') || (adminTab === 'add' && tab.id === 'users') || (adminTab === 'import' && tab.id === 'users')
                                ? 'border-blue-600 text-blue-700'
                                : 'border-transparent text-gray-400 hover:text-gray-800 hover:border-gray-300'
                        }`}
                    >
                        <tab.icon size={18} className={adminTab === tab.id || (adminTab === 'list' && tab.id === 'users') || (adminTab === 'add' && tab.id === 'users') || (adminTab === 'import' && tab.id === 'users') ? 'text-blue-600' : 'text-gray-400'} />
                        {tab.label}
                        {tab.id === 'support' && activeTicketsCount > 0 && (
                            <span className="bg-[#FF3B30] text-white text-[10px] font-black min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5 shadow-lg shadow-red-100 ml-1">
                                {activeTicketsCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="p-6">
                {(adminTab === 'users' || adminTab === 'list' || adminTab === 'add' || adminTab === 'import') && (
                    <div className="space-y-10 animate-in fade-in duration-500">
                        {/* Inline Add User Form */}
                        <div className="bg-white p-10 rounded-[40px] border border-gray-200 shadow-sm">
                            <div className="flex flex-col md:flex-row items-end gap-6">
                                <div className="w-full md:w-40 space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Rol</label>
                                    <select 
                                        value={newUser.role} 
                                        onChange={e => setNewUser({...newUser, role: e.target.value})}
                                        className="w-full bg-gray-50/50 border border-gray-200 px-5 py-3 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer appearance-none"
                                    >
                                        <option value="teacher">Öğretmen</option>
                                        <option value="admin">Yönetici</option>
                                    </select>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Ad Soyad</label>
                                    <input 
                                        type="text" 
                                        value={newUser.name} 
                                        onChange={e => setNewUser({...newUser, name: e.target.value})}
                                        placeholder="Ad Soyad giriniz..."
                                        className="w-full bg-gray-50/50 border border-gray-100 px-5 py-3 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Kullanıcı Adı</label>
                                    <input 
                                        type="text" 
                                        value={newUser.username} 
                                        onChange={e => setNewUser({...newUser, username: e.target.value})}
                                        placeholder="Oto. Üretilir"
                                        className="w-full bg-gray-50/50 border border-gray-100 px-5 py-3 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Şifre</label>
                                    <input 
                                        type="text" 
                                        value={newUser.password} 
                                        onChange={e => setNewUser({...newUser, password: e.target.value})}
                                        placeholder="Oto. Üretilir"
                                        className="w-full bg-gray-50/50 border border-gray-100 px-5 py-3 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    />
                                </div>
                                <button 
                                    onClick={handleAddUser}
                                    className="bg-blue-600 text-white px-10 py-3.5 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                                >
                                    Kaydet
                                </button>
                            </div>
                        </div>

                        {/* User List Table */}
                        <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50/50 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">
                                        <tr>
                                            <th className="px-8 py-5">AD SOYAD</th>
                                            <th className="px-8 py-5">KULLANICI ADI</th>
                                            <th className="px-8 py-5">ŞİFRE</th>
                                            <th className="px-8 py-5">ROL</th>
                                            <th className="px-8 py-5 text-right">İŞLEM</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {schoolUsers
                                            .filter((u: any) => u.role !== 'student')
                                            .map((u: any) => (
                                            <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-8 py-5 font-bold text-gray-900">{u.name}</td>
                                                <td className="px-8 py-5 text-gray-500 font-medium">{u.username}</td>
                                                <td className="px-8 py-5 text-gray-300 font-medium tracking-widest">••••••</td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                                                        u.role === 'admin' 
                                                            ? 'bg-purple-50 text-purple-600 border-purple-100' 
                                                            : 'bg-blue-50 text-blue-600 border-blue-100'
                                                    }`}>
                                                        {u.role === 'admin' ? 'ADMIN' : 'ÖĞRETMEN'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={() => setEditUser(u)} 
                                                            className="text-gray-400 hover:text-blue-600 transition-colors"
                                                            title="Düzenle"
                                                        >
                                                            <Edit2 size={18}/>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleResetPassword(u)} 
                                                            className="text-gray-400 hover:text-orange-500 transition-colors"
                                                            title="Şifreyi Sıfırla"
                                                        >
                                                            <Zap size={18}/>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteUser(u.id)} 
                                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                                            title="Sil"
                                                        >
                                                            <Trash2 size={18}/>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {schoolUsers.filter((u: any) => u.role !== 'student').length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="p-16 text-center text-gray-400 font-medium bg-gray-50/50">
                                                    <Users size={48} className="mx-auto mb-4 opacity-10" />
                                                    Kayıtlı yönetici veya öğretmen bulunmuyor.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Import Section (Optional/Hidden in main view but logic kept) */}
                        {adminTab === 'import' && (
                            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm mt-8">
                                <h3 className="font-black text-lg text-blue-900 mb-6 flex items-center gap-2 uppercase tracking-tight"><Upload size={20}/> Toplu Kullanıcı İçe Aktar</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div>
                                        <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 mb-6">
                                            <h4 className="font-bold text-blue-800 text-sm mb-2 flex items-center gap-1.5"><FileText size={16}/> Excel Formatı Nasıl Olmalı?</h4>
                                            <p className="text-xs text-blue-600/80 mb-3 leading-relaxed">Yükleyeceğiniz Excel dosyasının ilk satırı başlık olmalı ve aşağıdaki sütunları içermelidir:</p>
                                            <ul className="text-xs text-blue-700 space-y-1.5 font-medium bg-white p-3 rounded-xl border border-blue-100">
                                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> 1. Sütun: <strong className="text-blue-900">Ad Soyad</strong></li>
                                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> 2. Sütun: <strong className="text-blue-900">Kullanıcı Adı</strong> (İsteğe bağlı, boş bırakılırsa otomatik üretilir)</li>
                                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> 3. Sütun: <strong className="text-blue-900">Şifre</strong> (İsteğe bağlı, boş bırakılırsa otomatik üretilir)</li>
                                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> 4. Sütun: <strong className="text-blue-900">Rol</strong> (ogretmen, yonetici)</li>
                                            </ul>
                                        </div>

                                        <label className="relative flex flex-col items-center justify-center w-full h-40 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group">
                                            <Upload className="text-gray-400 group-hover:text-blue-500 mb-3" size={32}/>
                                            <span className="text-sm font-bold text-gray-600 group-hover:text-blue-700">Excel dosyasını seçin veya sürükleyin</span>
                                            <span className="text-xs text-gray-400 mt-1 font-medium">Sadece .xlsx veya .xls formatları</span>
                                            <input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} className="hidden" />
                                        </label>
                                    </div>

                                    <div>
                                        {excelPreview.length > 0 ? (
                                            <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden flex flex-col h-full">
                                                <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
                                                    <span className="font-bold text-sm text-gray-800 flex items-center gap-2"><CheckCircle size={16} className="text-green-500"/> Önizleme ({excelPreview.length} Kayıt)</span>
                                                    <button onClick={handleImportExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors shadow-sm">İçe Aktar</button>
                                                </div>
                                                <div className="overflow-y-auto flex-1 max-h-[300px] p-4">
                                                    <div className="space-y-2">
                                                        {excelPreview.slice(0, 10).map((row: any, idx: number) => (
                                                            <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100 text-xs flex justify-between items-center shadow-sm">
                                                                <span className="font-bold text-gray-800">{row.name}</span>
                                                                <div className="flex gap-2">
                                                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-semibold uppercase tracking-wider text-[10px]">{row.role}</span>
                                                                    {row.classLevel && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-semibold uppercase tracking-wider text-[10px]">{row.classLevel}</span>}
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {excelPreview.length > 10 && (
                                                            <div className="text-center text-xs text-gray-400 font-medium pt-2">... ve {excelPreview.length - 10} kayıt daha</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-full border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50/50">
                                                <FileText size={48} className="mb-4 opacity-20"/>
                                                <p className="text-sm font-medium">Dosya yüklendiğinde önizleme burada görünecektir.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {adminTab === 'classes' && (
                    <div className="space-y-10">
                        {/* Class Selection & Add Class */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex flex-wrap gap-3">
                                {Object.keys(classes).sort().map(cls => (
                                    <button
                                        key={cls}
                                        onClick={() => setSelectedAdminClass(cls)}
                                        className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all border shadow-sm ${
                                            selectedAdminClass === cls
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-blue-100'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                                        }`}
                                    >
                                        {formatClassLabel(cls)} Sınıfı
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-3 bg-white p-2.5 rounded-[24px] border border-gray-100 shadow-sm w-full md:w-auto">
                                <input
                                    type="text"
                                    value={newClassName}
                                    onChange={e => setNewClassName(e.target.value)}
                                    placeholder="Sınıf Adı (Örn: 5A)"
                                    className="bg-gray-50 border-none px-5 py-2.5 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 w-full md:w-48"
                                />
                                <button
                                    onClick={() => {
                                        handleAddClass(newClassName);
                                        setNewClassName('');
                                    }}
                                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-blue-100"
                                >
                                    Sınıf Ekle
                                </button>
                            </div>
                        </div>

                        {selectedAdminClass ? (
                            <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                                <div className="p-8 border-b border-gray-100 bg-[#FBFBFC] flex justify-between items-center">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-[20px] bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-200">
                                            <Users className="text-white" size={28} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-blue-900 text-2xl tracking-tight">{formatClassLabel(selectedAdminClass)} Sınıf Listesi</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">{classes[selectedAdminClass]?.length || 0} ÖĞRENCİ MEVCUDU</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if(confirm(`${formatClassLabel(selectedAdminClass)} sınıfını ve tüm öğrenci verilerini silmek istediğinize emin misiniz?`)) {
                                                handleDeleteClass(selectedAdminClass);
                                                setSelectedAdminClass(null);
                                            }
                                        }}
                                        className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all group"
                                    >
                                        <Trash2 size={16} className="group-hover:scale-110 transition-transform" /> Sınıfı Sil
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-white text-gray-400 font-bold text-[11px] uppercase tracking-wider border-b border-gray-200">
                                            <tr>
                                                <th className="p-6">OKUL NO</th>
                                                <th className="p-6">AD SOYAD</th>
                                                <th className="p-6">KULLANICI ADI</th>
                                                <th className="p-6">ROL</th>
                                                <th className="p-6">SINIF</th>
                                                <th className="p-6">ŞİFRE</th>
                                                <th className="p-6 text-right">İŞLEMLER</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {classes[selectedAdminClass]?.map((studentName: string) => {
                                                const studentUser = schoolUsers.find((u: any) => u.name === studentName && u.role === 'student');
                                                const match = studentName.match(/^(\d+)\s*[-]\s*(.+)$/);
                                                const okulNo = match ? match[1] : '-';
                                                const pureName = match ? match[2] : studentName;
                                                return (
                                                    <tr key={studentName} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="p-6 font-bold text-gray-400">{okulNo}</td>
                                                        <td className="p-6 font-bold text-gray-900">{pureName}</td>
                                                        <td className="p-6 text-gray-500 font-medium">{studentUser?.username || '-'}</td>
                                                        <td className="p-6">
                                                            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                                                Öğrenci
                                                            </span>
                                                        </td>
                                                        <td className="p-6 text-gray-600 font-bold">{formatClassLabel(selectedAdminClass)}</td>
                                                        <td className="p-6 font-mono text-gray-400 font-bold">{studentUser?.password || '****'}</td>
                                                        <td className="p-6 text-right">
                                                            <div className="flex items-center justify-end gap-3">
                                                                <button onClick={() => setEditUser(studentUser)} className="text-orange-400 hover:text-orange-600 transition-colors p-2 hover:bg-orange-50 rounded-lg" title="Düzenle"><Edit2 size={18}/></button>
                                                                <button onClick={() => handleDeleteUser(studentUser?.id)} className="text-red-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg" title="Sil"><Trash2 size={18}/></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {(!classes[selectedAdminClass] || classes[selectedAdminClass].length === 0) && (
                                                <tr>
                                                    <td colSpan={7} className="p-12 text-center text-gray-400 font-medium bg-gray-50/30 italic">
                                                        Bu sınıfta henüz kayıtlı öğrenci bulunmuyor.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Bulk Add Students */}
                                <div className="p-6 bg-gray-50/30 border-t border-gray-100">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <textarea
                                            value={bulkStudentInput}
                                            onChange={e => setBulkStudentInput(e.target.value)}
                                            placeholder="Örn: 123 - Ad Soyad (Virgülle veya alt alta ayırarak girin)"
                                            className="flex-1 bg-white border border-gray-200 px-4 py-3 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[80px] resize-none"
                                        />
                                        <div className="flex flex-col gap-2 md:self-end">
                                            <input 
                                                type="file" 
                                                id="excel-upload" 
                                                className="hidden" 
                                                accept=".xlsx, .xls"
                                                onChange={(e) => {
                                                    handleExcelUpload(e, selectedAdminClass);
                                                }}
                                            />
                                            <label 
                                                htmlFor="excel-upload"
                                                className="bg-white text-blue-600 border-2 border-dashed border-blue-100 px-8 py-3 rounded-2xl font-black text-sm hover:bg-blue-50 transition-all flex items-center justify-center gap-2 cursor-pointer h-fit"
                                            >
                                                <Upload size={18} /> Excel'den Yükle
                                            </label>
                                            <button
                                                onClick={() => {
                                                    handleBulkAddStudents(selectedAdminClass, bulkStudentInput);
                                                    setBulkStudentInput('');
                                                }}
                                                className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 h-fit"
                                            >
                                                <Plus size={18} /> Toplu Ekle
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <LayoutGrid size={40} className="text-blue-200" />
                                </div>
                                <h3 className="text-xl font-black text-blue-900 mb-2">Sınıf Seçiniz</h3>
                                <p className="text-gray-400 font-medium max-w-xs mx-auto">Öğrenci listesini görüntülemek ve yönetmek için yukarıdan bir sınıf seçin.</p>
                            </div>
                        )}
                    </div>
                )}

                {adminTab === 'tasks' && (
                    <div className="space-y-12 pb-10">
                        {/* Top Cards: Success Descriptions, Uncompleted Reasons, and Remedial Tasks */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 md:grid-cols-2 gap-10">
                            {/* Success Descriptions Card */}
                            <div className="bg-white p-10 rounded-[40px] border border-gray-200 shadow-sm space-y-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100">
                                            <Award size={32} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-blue-900 text-2xl tracking-tight leading-none mb-1">Başarı Seviyeleri</h3>
                                            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">"YAPTI" Durumu Açıklamaları</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if (confirm('Tüm başarı seviyesi açıklamalarını varsayılan değerlere döndürmek istediğinize emin misiniz?')) {
                                                [1, 2, 3, 4, 5].forEach(level => {
                                                    const { INITIAL_SUCCESS_DESCRIPTIONS } = require('../lib/constants');
                                                    handleUpdateSuccessDescription(level, INITIAL_SUCCESS_DESCRIPTIONS[level]);
                                                });
                                            }
                                        }}
                                        className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-xl transition-all"
                                    >
                                        Varsayılanları Yükle
                                    </button>
                                </div>
                                <div className="space-y-8">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <div key={level} className="group">
                                            <div className="flex items-start gap-6">
                                                <div className="w-10 h-10 rounded-full border-2 border-green-100 bg-green-50 flex items-center justify-center text-green-600 font-black text-sm shrink-0 mt-0.5 group-hover:border-green-400 transition-colors">
                                                    {level}
                                                </div>
                                                
                                                <div className="flex-1">
                                                    {editingField?.type === 'success' && editingField?.level === level ? (
                                                        <textarea
                                                            autoFocus
                                                            value={successDescriptions?.[level] || ''}
                                                            onChange={(e) => handleUpdateSuccessDescription(level, e.target.value)}
                                                            onBlur={() => setEditingField(null)}
                                                            className="w-full bg-white border-2 border-green-500/30 px-4 py-3 rounded-2xl text-base font-medium text-gray-700 outline-none transition-all min-h-[80px] resize-y shadow-sm"
                                                        />
                                                    ) : (
                                                        <div 
                                                            onClick={() => setEditingField({ type: 'success', level })}
                                                            className="w-full px-2 py-2 rounded-xl text-base font-medium text-gray-700 cursor-pointer hover:bg-green-50/50 transition-all border border-transparent flex items-center min-h-[40px]"
                                                        >
                                                            {successDescriptions?.[level] || <span className="text-gray-300 italic">Açıklama ekle...</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Uncompleted Reasons Card */}
                            <div className="bg-white p-10 rounded-[40px] border border-gray-200 shadow-sm space-y-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 shadow-sm border border-red-100">
                                            <AlertTriangle size={32} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-blue-900 text-2xl tracking-tight leading-none mb-1">Mazeret Sebepleri</h3>
                                            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">"YAPMADI" Durumu Açıklamaları</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if (confirm('Tüm "YAPMADI" mazeret açıklamalarını varsayılan değerlere döndürmek istediğinize emin misiniz?')) {
                                                [1, 2, 3, 4, 5].forEach(level => {
                                                    const { INITIAL_UNCOMPLETED_REASONS } = require('../lib/constants');
                                                    handleUpdateUncompletedReason(level, INITIAL_UNCOMPLETED_REASONS[level]);
                                                });
                                            }
                                        }}
                                        className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-xl transition-all"
                                    >
                                        Varsayılanları Yükle
                                    </button>
                                </div>
                                <div className="space-y-8">
                                    {[1, 2, 3, 4, 5].map((level) => {
                                        let levelTitle = "";
                                        if (level === 1) levelTitle = "Seviye 1 (Unutkanlık / Dikkatsizlik)";
                                        if (level === 2) levelTitle = "Seviye 2 (İmkan / Ortam Yetersizliği)";
                                        if (level === 3) levelTitle = "Seviye 3 (Erteleme / Zaman Yönetimi)";
                                        if (level === 4) levelTitle = "Seviye 4 (İsteksizlik / Motivasyon Kaybı)";
                                        if (level === 5) levelTitle = "Seviye 5 (Bilinçli Reddetme / Önemsememe)";

                                        return (
                                            <div key={level} className="group">
                                                <div className="flex items-start gap-6">
                                                    <div className="w-10 h-10 rounded-full border-2 border-red-100 bg-red-50 flex items-center justify-center text-red-600 font-black text-sm shrink-0 mt-0.5 group-hover:border-red-400 transition-colors animate-fade-in">
                                                        {level}
                                                    </div>
                                                    
                                                    <div className="flex-1 space-y-1">
                                                        <div className="text-[11px] font-black text-red-500 uppercase tracking-wider">{levelTitle}</div>
                                                        {editingField?.type === 'uncompleted' && editingField?.level === level ? (
                                                            <textarea
                                                                autoFocus
                                                                value={uncompletedReasons?.[level] || ''}
                                                                onChange={(e) => handleUpdateUncompletedReason(level, e.target.value)}
                                                                onBlur={() => setEditingField(null)}
                                                                className="w-full bg-white border-2 border-red-500/30 px-4 py-3 rounded-2xl text-base font-medium text-gray-700 outline-none transition-all min-h-[80px] resize-y shadow-sm"
                                                            />
                                                        ) : (
                                                            <div 
                                                                onClick={() => setEditingField({ type: 'uncompleted', level })}
                                                                className="w-full px-2 py-2 rounded-xl text-base font-medium text-gray-700 cursor-pointer hover:bg-red-50/50 transition-all border border-transparent flex items-center min-h-[40px]"
                                                            >
                                                                {uncompletedReasons?.[level] || <span className="text-gray-300 italic">Mazeret sebebi ekle...</span>}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Remedial Tasks Card */}
                            <div className="bg-white p-10 rounded-[40px] border border-gray-200 shadow-sm space-y-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-sm border border-orange-100">
                                            <AlertCircle size={32} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-blue-900 text-2xl tracking-tight leading-none mb-1">Telafi Görevleri</h3>
                                            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">"YAPAMADI" Durumu İçerikleri</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if (confirm('Tüm telafi ödevlerini ve sorun açıklamalarını varsayılan değerlere döndürmek istediğinize emin misiniz?')) {
                                                [1, 2, 3, 4, 5].forEach(level => {
                                                    const { INITIAL_REMEDIAL_TASKS, INITIAL_REMEDIAL_PROBLEMS } = require('../lib/constants');
                                                    handleUpdateRemedialTask(level, INITIAL_REMEDIAL_TASKS[level]);
                                                    handleUpdateRemedialProblem(level, INITIAL_REMEDIAL_PROBLEMS[level]);
                                                });
                                            }
                                        }}
                                        className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-xl transition-all"
                                    >
                                        Varsayılanları Yükle
                                    </button>
                                </div>
                                <div className="space-y-8">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <div key={level} className="group">
                                            <div className="flex items-start gap-6">
                                                <div className="w-10 h-10 rounded-full border-2 border-orange-200 bg-orange-50 flex items-center justify-center text-orange-600 font-black text-sm shrink-0 mt-0.5 group-hover:border-orange-400 transition-colors">
                                                    {level}
                                                </div>
                                                
                                                <div className="flex-1 space-y-3">
                                                    {/* Remedial Task */}
                                                    <div className="space-y-1">
                                                        {editingField?.type === 'remedial' && editingField?.level === level ? (
                                                            <textarea
                                                                autoFocus
                                                                value={remedialTasks?.[level] || ''}
                                                                onChange={(e) => handleUpdateRemedialTask(level, e.target.value)}
                                                                onBlur={() => setEditingField(null)}
                                                                className="w-full bg-white border-2 border-orange-500/30 px-4 py-3 rounded-2xl text-base font-medium text-gray-700 outline-none transition-all min-h-[80px] resize-y shadow-sm"
                                                            />
                                                        ) : (
                                                            <div 
                                                                onClick={() => setEditingField({ type: 'remedial', level })}
                                                                className="w-full px-2 py-2 rounded-xl text-base font-medium text-gray-700 cursor-pointer hover:bg-orange-50/50 transition-all border border-transparent flex items-center min-h-[40px]"
                                                            >
                                                                {remedialTasks?.[level] || <span className="text-gray-300 italic">Ödev ekle...</span>}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Problem Description (Subtle) */}
                                                    <div className="pl-2">
                                                        {editingField?.type === 'problem' && editingField?.level === level ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[9px] font-black text-orange-400 uppercase shrink-0">SORUN:</span>
                                                                <input
                                                                    autoFocus
                                                                    type="text"
                                                                    value={remedialProblems?.[level] || ''}
                                                                    onChange={(e) => handleUpdateRemedialProblem(level, e.target.value)}
                                                                    onBlur={() => setEditingField(null)}
                                                                    className="flex-1 bg-white border-b border-orange-200 px-1 py-0.5 text-[11px] font-bold text-orange-600 outline-none"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div 
                                                                onClick={() => setEditingField({ type: 'problem', level })}
                                                                className="text-[11px] font-bold text-orange-400/70 hover:text-orange-600 cursor-pointer transition-colors flex items-center gap-2"
                                                            >
                                                                <span className="uppercase text-[9px] font-black tracking-tighter">NEDEN:</span>
                                                                {remedialProblems?.[level] || "Belirtilmemiş"}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Categories and Tasks Section */}
                        <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-[#FBFBFC]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
                                        <LayoutGrid size={28} />
                                    </div>
                                    <h3 className="font-black text-blue-900 text-2xl tracking-tight">Kategoriler ve Görevler</h3>
                                </div>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        value={newCategory}
                                        onChange={e => setNewCategory(e.target.value)}
                                        placeholder="Yeni Kategori Adı"
                                        className="bg-white border border-gray-200 px-6 py-2.5 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 w-64 transition-all"
                                    />
                                    <button
                                        onClick={() => {
                                            handleAddCategory(newCategory);
                                            setNewCategory('');
                                        }}
                                        className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                                    >
                                        Kategori Ekle
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                {categories.map((cat: string) => {
                                    const catTasks = Array.isArray(tasks) 
                                        ? tasks.filter((t: any) => t.category === cat)
                                        : (tasks[cat] || []);

                                    return (
                                        <div key={cat} className="border border-gray-200 rounded-2xl overflow-hidden">
                                            <div className="bg-gray-50/50 p-4 border-b border-gray-200 flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    {editingField?.type === 'category' && editingField?.id === cat ? (
                                                        <input
                                                            autoFocus
                                                            type="text"
                                                            defaultValue={cat}
                                                            onBlur={(e) => {
                                                                const newName = e.target.value;
                                                                if (newName && newName !== cat) handleUpdateCategory(cat, newName);
                                                                setEditingField(null);
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    const newName = (e.target as HTMLInputElement).value;
                                                                    if (newName && newName !== cat) handleUpdateCategory(cat, newName);
                                                                    setEditingField(null);
                                                                }
                                                            }}
                                                            className="bg-white border border-blue-400 px-2 py-1 rounded-lg text-sm font-black uppercase tracking-wider outline-none"
                                                        />
                                                    ) : (
                                                        <>
                                                            <h4 className="font-black text-blue-900 uppercase tracking-wider">{cat}</h4>
                                                            <button 
                                                                onClick={() => setEditingField({ type: 'category', id: cat })}
                                                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                                <button 
                                                    onClick={() => handleDeleteCategory(cat)}
                                                    className="text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <div className="p-4 space-y-4">
                                                <div className="space-y-3">
                                                    {catTasks.map((task: any, idx: number) => {
                                                        const taskTitle = typeof task === 'string' ? task : task.title;
                                                        const isEditing = editingField?.type === 'task' && editingField?.category === cat && editingField?.id === idx;

                                                        return (
                                                            <div key={idx} className={`flex items-start justify-between group p-2 rounded-xl transition-all ${isEditing ? 'bg-blue-50/30' : 'hover:bg-gray-50/50'}`}>
                                                                <div className="flex items-start gap-4 flex-1">
                                                                    <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-black text-[10px] shrink-0 mt-1">
                                                                        {idx + 1}
                                                                    </div>
                                                                    {isEditing ? (
                                                                        <textarea
                                                                            autoFocus
                                                                            defaultValue={taskTitle}
                                                                            onBlur={(e) => {
                                                                                const newTitle = e.target.value;
                                                                                if (newTitle && newTitle !== taskTitle) handleUpdateTask(task, newTitle);
                                                                                setEditingField(null);
                                                                            }}
                                                                            className="flex-1 bg-white border-2 border-blue-400 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 outline-none shadow-sm min-h-[60px] resize-y"
                                                                        />
                                                                    ) : (
                                                                        <span 
                                                                            onClick={() => setEditingField({ type: 'task', category: cat, id: idx })}
                                                                            className="text-sm font-medium text-gray-700 cursor-pointer flex-1 py-1"
                                                                        >
                                                                            {taskTitle}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <button 
                                                                    onClick={() => handleDeleteTask(task)}
                                                                    className={`text-gray-300 hover:text-red-500 transition-all p-1.5 hover:bg-red-50 rounded-lg shrink-0 ${isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                    {catTasks.length === 0 && (
                                                        <div className="text-center py-4 text-gray-400 italic text-xs">Bu kategoride henüz görev yok.</div>
                                                    )}
                                                </div>
                                                
                                                <div className="pt-4 border-t border-gray-50 flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Bu kategoriye yeni bir görev ekle..."
                                                        className="flex-1 bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleAddTask({ title: (e.target as HTMLInputElement).value, category: cat, points: 10 });
                                                                (e.target as HTMLInputElement).value = '';
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        onClick={(e) => {
                                                            const input = (e.currentTarget.previousSibling as HTMLInputElement);
                                                            if (input.value) {
                                                                handleAddTask({ title: input.value, category: cat, points: 10 });
                                                                input.value = '';
                                                            }
                                                        }}
                                                        className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-blue-700 transition-all"
                                                    >
                                                        Görev Ekle
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {adminTab === 'devcard' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Levels (Seviyeler) */}
                            <div className="bg-white p-10 rounded-[40px] border border-gray-200 shadow-sm space-y-8">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Trophy size={28} />
                                    </div>
                                    <h3 className="text-2xl font-black text-blue-900 tracking-tight">Seviyeler (Kapsam)</h3>
                                </div>

                                <div className="space-y-6">
                                    {devCardConfig.levels.map((level: any, idx: number) => (
                                        <div key={level.id} className="flex items-start gap-4 group">
                                            <div className="text-sm font-black text-gray-300 mt-4 w-4">{idx + 1}.</div>
                                            <div className="flex-1 bg-gray-50/50 border border-gray-200 p-6 rounded-[32px] space-y-4 group-hover:bg-white group-hover:border-blue-100 transition-all">
                                                <div className="flex gap-4">
                                                    <input 
                                                        type="text" 
                                                        value={level.name}
                                                        onChange={(e) => {
                                                            const newLevels = [...devCardConfig.levels];
                                                            newLevels[idx] = { ...newLevels[idx], name: e.target.value };
                                                            handleUpdateDevCardConfig({ ...devCardConfig, levels: newLevels });
                                                        }}
                                                        className="flex-1 bg-white border border-gray-200 px-5 py-3 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all shadow-sm"
                                                    />
                                                    <div className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-2 rounded-2xl shadow-sm">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase">Puan</span>
                                                        <input 
                                                            type="number" 
                                                            value={level.score}
                                                            onChange={(e) => {
                                                                const newLevels = [...devCardConfig.levels];
                                                                newLevels[idx] = { ...newLevels[idx], score: parseInt(e.target.value) || 0 };
                                                                handleUpdateDevCardConfig({ ...devCardConfig, levels: newLevels });
                                                            }}
                                                            className="w-10 text-center text-base font-black text-blue-600 outline-none"
                                                        />
                                                        <div className="flex flex-col text-gray-400">
                                                            <button onClick={() => {
                                                                const newLevels = [...devCardConfig.levels];
                                                                newLevels[idx] = { ...newLevels[idx], score: (newLevels[idx].score || 0) + 1 };
                                                                handleUpdateDevCardConfig({ ...devCardConfig, levels: newLevels });
                                                            }} className="hover:text-blue-500 transition-colors"><ChevronUp size={14}/></button>
                                                            <button onClick={() => {
                                                                const newLevels = [...devCardConfig.levels];
                                                                newLevels[idx] = { ...newLevels[idx], score: Math.max(0, (newLevels[idx].score || 0) - 1) };
                                                                handleUpdateDevCardConfig({ ...devCardConfig, levels: newLevels });
                                                            }} className="hover:text-blue-500 transition-colors"><ChevronDown size={14}/></button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <textarea 
                                                    value={level.desc}
                                                    placeholder="Seviye açıklaması..."
                                                    onChange={(e) => {
                                                        const newLevels = [...devCardConfig.levels];
                                                        newLevels[idx] = { ...newLevels[idx], desc: e.target.value };
                                                        handleUpdateDevCardConfig({ ...devCardConfig, levels: newLevels });
                                                    }}
                                                    className="w-full bg-transparent text-xs font-medium text-gray-500 outline-none px-1 resize-none border-none focus:ring-0"
                                                />
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    const newLevels = devCardConfig.levels.filter((_: any, i: number) => i !== idx);
                                                    handleUpdateDevCardConfig({ ...devCardConfig, levels: newLevels });
                                                }}
                                                className="mt-6 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-red-50 rounded-xl"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button 
                                    onClick={() => {
                                        const newLevels = [...devCardConfig.levels, { id: Date.now(), name: 'Yeni Seviye', score: 1, desc: '' }];
                                        handleUpdateDevCardConfig({ ...devCardConfig, levels: newLevels });
                                    }}
                                    className="w-full py-5 border-2 border-dashed border-blue-100 rounded-[32px] text-blue-600 font-black text-sm hover:bg-blue-50 hover:border-blue-200 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={20} /> Yeni Seviye Ekle
                                </button>
                            </div>

                            {/* Rubrics (Çarpanlar) */}
                            <div className="bg-white p-10 rounded-[40px] border border-gray-200 shadow-sm space-y-8">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <Star size={28} />
                                    </div>
                                    <h3 className="text-2xl font-black text-blue-900 tracking-tight">Başarı Çarpanları (Rubrik)</h3>
                                </div>

                                <div className="space-y-6">
                                    {devCardConfig.rubrics.map((rubric: any, idx: number) => (
                                        <div key={rubric.id} className="flex items-start gap-4 group">
                                            <div className="text-sm font-black text-gray-300 mt-4 w-4">{idx + 1}.</div>
                                            <div className="flex-1 bg-gray-50/50 border border-gray-100 p-6 rounded-[32px] space-y-4 group-hover:bg-white group-hover:border-blue-100 transition-all">
                                                <div className="flex gap-4">
                                                    <input 
                                                        type="text" 
                                                        value={rubric.name}
                                                        onChange={(e) => {
                                                            const newRubrics = [...devCardConfig.rubrics];
                                                            newRubrics[idx] = { ...newRubrics[idx], name: e.target.value };
                                                            handleUpdateDevCardConfig({ ...devCardConfig, rubrics: newRubrics });
                                                        }}
                                                        className="flex-1 bg-white border border-gray-200 px-5 py-3 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all shadow-sm"
                                                    />
                                                    <div className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-2 rounded-2xl shadow-sm">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase">x</span>
                                                        <input 
                                                            type="number" 
                                                            value={rubric.multiplier}
                                                            onChange={(e) => {
                                                                const newRubrics = [...devCardConfig.rubrics];
                                                                newRubrics[idx] = { ...newRubrics[idx], multiplier: parseInt(e.target.value) || 1 };
                                                                handleUpdateDevCardConfig({ ...devCardConfig, rubrics: newRubrics });
                                                            }}
                                                            className="w-10 text-center text-base font-black text-emerald-600 outline-none"
                                                        />
                                                        <div className="flex flex-col text-gray-400">
                                                            <button onClick={() => {
                                                                const newRubrics = [...devCardConfig.rubrics];
                                                                newRubrics[idx] = { ...newRubrics[idx], multiplier: (newRubrics[idx].multiplier || 1) + 1 };
                                                                handleUpdateDevCardConfig({ ...devCardConfig, rubrics: newRubrics });
                                                            }} className="hover:text-emerald-500 transition-colors"><ChevronUp size={14}/></button>
                                                            <button onClick={() => {
                                                                const newRubrics = [...devCardConfig.rubrics];
                                                                newRubrics[idx] = { ...newRubrics[idx], multiplier: Math.max(1, (newRubrics[idx].multiplier || 1) - 1) };
                                                                handleUpdateDevCardConfig({ ...devCardConfig, rubrics: newRubrics });
                                                            }} className="hover:text-emerald-500 transition-colors"><ChevronDown size={14}/></button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <textarea 
                                                    value={rubric.desc}
                                                    placeholder="Çarpan açıklaması..."
                                                    onChange={(e) => {
                                                        const newRubrics = [...devCardConfig.rubrics];
                                                        newRubrics[idx] = { ...newRubrics[idx], desc: e.target.value };
                                                        handleUpdateDevCardConfig({ ...devCardConfig, rubrics: newRubrics });
                                                    }}
                                                    className="w-full bg-transparent text-xs font-medium text-gray-500 outline-none px-1 resize-none border-none focus:ring-0"
                                                />
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    const newRubrics = devCardConfig.rubrics.filter((_: any, i: number) => i !== idx);
                                                    handleUpdateDevCardConfig({ ...devCardConfig, rubrics: newRubrics });
                                                }}
                                                className="mt-6 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-red-50 rounded-xl"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button 
                                    onClick={() => {
                                        const newRubrics = [...devCardConfig.rubrics, { id: Date.now(), name: 'Yeni Çarpan', multiplier: 1, desc: '' }];
                                        handleUpdateDevCardConfig({ ...devCardConfig, rubrics: newRubrics });
                                    }}
                                    className="w-full py-5 border-2 border-dashed border-emerald-100 rounded-[32px] text-emerald-600 font-black text-sm hover:bg-emerald-50 hover:border-emerald-200 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={20} /> Yeni Çarpan Ekle
                                </button>
                            </div>
                        </div>

                        {/* Bottom Section: Achievements & Titles */}
                        <div className="bg-white p-10 rounded-[40px] border border-gray-200 shadow-sm space-y-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                                    <Award size={28} />
                                </div>
                                <h3 className="text-2xl font-black text-blue-900 tracking-tight">Kazanımlar & Unvanlar</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {devCardConfig.titles.map((title: any, idx: number) => (
                                    <div key={title.id} className="bg-blue-50/30 border border-blue-100 p-8 rounded-[40px] space-y-6 relative group hover:bg-white hover:border-blue-300 transition-all">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">AŞAMA {idx + 1}</span>
                                            <div className="flex items-center gap-2 bg-white border border-gray-100 px-3 py-1.5 rounded-2xl shadow-sm">
                                                <span className="text-[10px] font-black text-gray-400">≥</span>
                                                <input 
                                                    type="number" 
                                                    value={title.threshold}
                                                    onChange={(e) => {
                                                        const newTitles = [...devCardConfig.titles];
                                                        newTitles[idx] = { ...newTitles[idx], threshold: parseInt(e.target.value) || 0 };
                                                        handleUpdateDevCardConfig({ ...devCardConfig, titles: newTitles });
                                                    }}
                                                    className="w-10 text-center text-xs font-black text-blue-600 outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <input 
                                                type="text" 
                                                value={title.name}
                                                onChange={(e) => {
                                                    const newTitles = [...devCardConfig.titles];
                                                    newTitles[idx] = { ...newTitles[idx], name: e.target.value };
                                                    handleUpdateDevCardConfig({ ...devCardConfig, titles: newTitles });
                                                }}
                                                className="w-full bg-transparent text-xl font-black text-gray-900 outline-none placeholder-gray-300"
                                                placeholder="Unvan Adı"
                                            />
                                            <div className="w-full h-1 bg-gradient-to-r from-blue-100 to-transparent rounded-full"></div>
                                            <textarea 
                                                value={title.right}
                                                placeholder="Kazanım hakları ve açıklaması..."
                                                onChange={(e) => {
                                                    const newTitles = [...devCardConfig.titles];
                                                    newTitles[idx] = { ...newTitles[idx], right: e.target.value };
                                                    handleUpdateDevCardConfig({ ...devCardConfig, titles: newTitles });
                                                }}
                                                className="w-full bg-transparent text-[13px] font-medium text-gray-500 outline-none resize-none min-h-[60px] border-none focus:ring-0 leading-relaxed"
                                            />
                                        </div>

                                        <button 
                                            onClick={() => {
                                                const newTitles = devCardConfig.titles.filter((_: any, i: number) => i !== idx);
                                                handleUpdateDevCardConfig({ ...devCardConfig, titles: newTitles });
                                            }}
                                            className="absolute -top-3 -right-3 w-10 h-10 bg-white border border-red-100 text-red-500 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:bg-red-50 z-20"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}

                                <button 
                                    onClick={() => {
                                        const newTitles = [...devCardConfig.titles, { id: Date.now(), name: 'Yeni Unvan', threshold: 0, right: '' }];
                                        handleUpdateDevCardConfig({ ...devCardConfig, titles: newTitles });
                                    }}
                                    className="border-2 border-dashed border-blue-100 rounded-[40px] p-8 flex flex-col items-center justify-center gap-4 text-blue-400 hover:bg-blue-50 hover:border-blue-200 transition-all min-h-[220px]"
                                >
                                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                        <Plus size={32} />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest">Yeni Aşama Ekle</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {adminTab === 'behavior' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <div className="flex bg-gray-50 p-2 rounded-2xl w-max border border-gray-100 mb-8 mx-auto xl:mx-0">
                            <button
                                onClick={() => setBehaviorSubTab('cards')}
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${behaviorSubTab === 'cards' ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'}`}
                            >
                                <Smile size={16} /> Davranış Kart Ayarları
                            </button>
                            <button
                                onClick={() => setBehaviorSubTab('forms')}
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${behaviorSubTab === 'forms' ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'}`}
                            >
                                <FileText size={16} /> Davranış Formları
                            </button>
                        </div>

                        {behaviorSubTab === 'cards' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                {/* 1. Üst Kısım: Kart Genel Ayarları */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {behaviorConfig?.cards?.map((card: any, idx: number) => {
                                        const IconComp = (Icons as any)[card.icon] || Award;
                                        return (
                                    <div key={card.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col space-y-6 relative overflow-hidden group hover:border-blue-200 transition-all">
                                        <div className="flex items-center justify-between z-10">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-4 rounded-[20px] border shadow-sm ${card.id === 'white' ? 'border-gray-200 text-gray-700 bg-gray-50' : card.id === 'struggle_pos' ? 'border-blue-200 text-blue-600 bg-blue-50' : card.id === 'struggle_neg' ? 'border-orange-200 text-orange-600 bg-orange-50' : card.id === 'green' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' : card.id === 'yellow' ? 'border-yellow-200 text-yellow-600 bg-yellow-50' : 'border-red-200 text-red-600 bg-red-50'}`}>
                                                    <IconComp size={28} />
                                                </div>
                                                <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">{card.name}</h3>
                                            </div>
                                            <IconComp size={82} className="text-gray-50/50 absolute -right-4 -top-4 rotate-12 group-hover:text-blue-50 group-hover:rotate-0 transition-all duration-500" />
                                        </div>

                                        <div className="space-y-5 pt-6 border-t border-gray-50 z-10 w-full">
                                            <div className="flex items-center justify-between bg-gray-50/50 p-2 rounded-xl">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Taban Puan</span>
                                                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 py-1 bg-white">
                                                    <input 
                                                        type="number" 
                                                        value={card.score}
                                                        onChange={(e) => {
                                                            const newCards = [...behaviorConfig.cards];
                                                            newCards[idx] = { ...newCards[idx], score: parseInt(e.target.value) || 0 };
                                                            handleUpdateBehaviorConfig({ ...behaviorConfig, cards: newCards });
                                                        }}
                                                        className={`w-12 text-center text-sm font-black outline-none ${card.score > 0 ? 'text-green-600' : card.score < 0 ? 'text-red-600' : 'text-gray-800'}`}
                                                    />
                                                    <div className="flex flex-col text-gray-400">
                                                        <button onClick={() => {
                                                            const newCards = [...behaviorConfig.cards];
                                                            newCards[idx] = { ...newCards[idx], score: (newCards[idx].score || 0) + 1 };
                                                            handleUpdateBehaviorConfig({ ...behaviorConfig, cards: newCards });
                                                        }}><ChevronUp size={12}/></button>
                                                        <button onClick={() => {
                                                            const newCards = [...behaviorConfig.cards];
                                                            newCards[idx] = { ...newCards[idx], score: (newCards[idx].score || 0) - 1 };
                                                            handleUpdateBehaviorConfig({ ...behaviorConfig, cards: newCards });
                                                        }}><ChevronDown size={12}/></button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Açıklama</span>
                                                <textarea
                                                    rows={2}
                                                    value={card.desc || ''}
                                                    onChange={(e) => {
                                                        const newCards = [...behaviorConfig.cards];
                                                        newCards[idx] = { ...newCards[idx], desc: e.target.value };
                                                        handleUpdateBehaviorConfig({ ...behaviorConfig, cards: newCards });
                                                    }}
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs text-gray-600 font-medium outline-none resize-none"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between bg-orange-50/50 p-2 rounded-xl border border-orange-100">
                                                <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2 pl-2">
                                                    <RefreshCw size={14}/> Telafi Puanı
                                                </span>
                                                <div className="flex items-center gap-2 border border-orange-200 rounded-lg px-2 py-1 bg-white">
                                                    <span className="text-orange-600 font-black text-sm">+</span>
                                                    <input 
                                                        type="number" 
                                                        value={card.compensation || 0}
                                                        onChange={(e) => {
                                                            const newCards = [...behaviorConfig.cards];
                                                            newCards[idx] = { ...newCards[idx], compensation: parseInt(e.target.value) || 0 };
                                                            handleUpdateBehaviorConfig({ ...behaviorConfig, cards: newCards });
                                                        }}
                                                        className="w-8 text-center text-sm font-black text-orange-600 outline-none"
                                                    />
                                                    <div className="flex flex-col text-orange-400">
                                                        <button onClick={() => {
                                                            const newCards = [...behaviorConfig.cards];
                                                            newCards[idx] = { ...newCards[idx], compensation: (newCards[idx].compensation || 0) + 1 };
                                                            handleUpdateBehaviorConfig({ ...behaviorConfig, cards: newCards });
                                                        }}><ChevronUp size={12}/></button>
                                                        <button onClick={() => {
                                                            const newCards = [...behaviorConfig.cards];
                                                            newCards[idx] = { ...newCards[idx], compensation: Math.max(0, (newCards[idx].compensation || 0) - 1) };
                                                            handleUpdateBehaviorConfig({ ...behaviorConfig, cards: newCards });
                                                        }}><ChevronDown size={12}/></button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* 2. Alt Kısım: Davranış Listeleri */}
                        <div className="bg-white p-10 rounded-[40px] border border-gray-200 shadow-sm space-y-12">
                            {behaviorConfig?.cards?.map((card: any) => {
                                const items = behaviorConfig.behaviors[card.id] || [];
                                return (
                                    <div key={card.id} className="space-y-4">
                                        <h4 className={`text-[15px] font-black uppercase tracking-wider ${card.id === 'white' ? 'text-blue-600' : card.id === 'struggle_pos' ? 'text-blue-800' : card.id === 'struggle_neg' ? 'text-gray-800' : card.id === 'green' ? 'text-emerald-600' : card.id === 'yellow' ? 'text-yellow-600' : 'text-red-600'} pb-3 border-b border-gray-200`}>
                                            {card.name} Davranışları
                                        </h4>
                                        <div className="space-y-2">
                                            {items.map((item: any, itemIdx: number) => (
                                                <div key={item.id || itemIdx} className="flex flex-col md:flex-row md:items-center gap-4 py-2 border-b border-gray-50 hover:bg-gray-50/50 transition-all group">
                                                    <input 
                                                        type="text" 
                                                        value={item.text}
                                                        onChange={(e) => {
                                                            const newBehaviors = { ...behaviorConfig.behaviors };
                                                            newBehaviors[card.id][itemIdx] = { ...newBehaviors[card.id][itemIdx], text: e.target.value };
                                                            handleUpdateBehaviorConfig({ ...behaviorConfig, behaviors: newBehaviors });
                                                        }}
                                                        className="flex-[2] bg-transparent outline-none text-[13px] font-bold text-gray-700 px-3 py-2 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                                                        placeholder="Davranış Tanımı"
                                                    />
                                                    <input 
                                                        type="text" 
                                                        value={item.task || ''}
                                                        onChange={(e) => {
                                                            const newBehaviors = { ...behaviorConfig.behaviors };
                                                            newBehaviors[card.id][itemIdx] = { ...newBehaviors[card.id][itemIdx], task: e.target.value };
                                                            handleUpdateBehaviorConfig({ ...behaviorConfig, behaviors: newBehaviors });
                                                        }}
                                                        className="flex-1 bg-transparent outline-none text-xs font-semibold text-gray-400 md:border-l border-gray-200 px-3 py-2 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                                                        placeholder="Telafi / Ödül"
                                                    />
                                                    <div className="flex items-center gap-4 md:border-l border-gray-200 px-4">
                                                        <div className="flex items-center gap-2 bg-white border border-gray-200 px-2 py-1.5 rounded-xl shadow-sm">
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Puan:</span>
                                                            <input 
                                                                type="number" 
                                                                value={item.points ?? card.score}
                                                                onChange={(e) => {
                                                                    const newBehaviors = { ...behaviorConfig.behaviors };
                                                                    newBehaviors[card.id][itemIdx] = { ...newBehaviors[card.id][itemIdx], points: parseInt(e.target.value) || 0 };
                                                                    handleUpdateBehaviorConfig({ ...behaviorConfig, behaviors: newBehaviors });
                                                                }}
                                                                className="w-8 text-center text-[13px] font-black outline-none"
                                                            />
                                                            <div className="flex flex-col text-gray-400">
                                                                <button onClick={() => {
                                                                    const newBehaviors = { ...behaviorConfig.behaviors };
                                                                    newBehaviors[card.id][itemIdx] = { ...newBehaviors[card.id][itemIdx], points: (newBehaviors[card.id][itemIdx].points ?? card.score) + 1 };
                                                                    handleUpdateBehaviorConfig({ ...behaviorConfig, behaviors: newBehaviors });
                                                                }}><ChevronUp size={12}/></button>
                                                                <button onClick={() => {
                                                                    const newBehaviors = { ...behaviorConfig.behaviors };
                                                                    newBehaviors[card.id][itemIdx] = { ...newBehaviors[card.id][itemIdx], points: (newBehaviors[card.id][itemIdx].points ?? card.score) - 1 };
                                                                    handleUpdateBehaviorConfig({ ...behaviorConfig, behaviors: newBehaviors });
                                                                }}><ChevronDown size={12}/></button>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => {
                                                                const newBehaviors = { ...behaviorConfig.behaviors };
                                                                newBehaviors[card.id] = newBehaviors[card.id].filter((_: any, i: number) => i !== itemIdx);
                                                                handleUpdateBehaviorConfig({ ...behaviorConfig, behaviors: newBehaviors });
                                                            }}
                                                            className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            <button 
                                                onClick={() => {
                                                    const newBehaviors = { ...behaviorConfig.behaviors };
                                                    if (!newBehaviors[card.id]) newBehaviors[card.id] = [];
                                                    newBehaviors[card.id].push({ id: Date.now(), text: '', points: card.score, task: '' });
                                                    handleUpdateBehaviorConfig({ ...behaviorConfig, behaviors: newBehaviors });
                                                }}
                                                className="flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-800 transition-colors pt-4 pl-2 inline-block w-max"
                                            >
                                                <Plus size={14} className="inline"/> Yeni {card.name} Davranışı Ekle
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        </div>
                        )}

                        {behaviorSubTab === 'forms' && (
                        <div className="bg-white p-10 rounded-[40px] border border-gray-200 shadow-sm space-y-10 animate-in fade-in slide-in-from-bottom-4">
                            {/* 3. Alt Kısım: Davranış Formları */}
                            <div className="flex items-center gap-4 pb-4 border-b border-gray-50">
                                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
                                    <FileText size={28} />
                                </div>
                                <h4 className="text-2xl font-black text-blue-900 tracking-tight">Form Şablonları</h4>
                            </div>
                            <div className="grid grid-cols-1 gap-12">
                                {Object.entries(behaviorConfig?.forms || INITIAL_FORM_CONFIGS).map(([key, form]: [string, any]) => (
                                    <div key={key} className="p-10 rounded-[40px] border-2 border-gray-200 bg-[#FBFBFC] space-y-8 shadow-sm hover:border-blue-100 transition-all">
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-black text-blue-600/50 uppercase tracking-widest pl-1">Form Başlığı ({key})</span>
                                            <input
                                                type="text"
                                                value={form.title || ''}
                                                onChange={(e) => {
                                                    const newForms = { ...(behaviorConfig.forms || INITIAL_FORM_CONFIGS) };
                                                    newForms[key] = { ...newForms[key], title: e.target.value };
                                                    handleUpdateBehaviorConfig({ ...behaviorConfig, forms: newForms });
                                                }}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-sm font-bold text-gray-800 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                        {form.description !== undefined && (
                                            <div className="space-y-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Açıklama</span>
                                                <textarea
                                                    rows={2}
                                                    value={form.description || ''}
                                                    onChange={(e) => {
                                                        const newForms = { ...(behaviorConfig.forms || INITIAL_FORM_CONFIGS) };
                                                        newForms[key] = { ...newForms[key], description: e.target.value };
                                                        handleUpdateBehaviorConfig({ ...behaviorConfig, forms: newForms });
                                                    }}
                                                    className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-sm text-gray-600 font-medium outline-none resize-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
                                                />
                                            </div>
                                        )}
                                        {form.content !== undefined && (
                                            <div className="space-y-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">İçerik Şablonu</span>
                                                <textarea
                                                    rows={4}
                                                    value={form.content || ''}
                                                    onChange={(e) => {
                                                        const newForms = { ...(behaviorConfig.forms || INITIAL_FORM_CONFIGS) };
                                                        newForms[key] = { ...newForms[key], content: e.target.value };
                                                        handleUpdateBehaviorConfig({ ...behaviorConfig, forms: newForms });
                                                    }}
                                                    className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-sm text-gray-600 font-medium outline-none resize-y focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
                                                />
                                                <p className="text-[10px] text-gray-400 mt-1 pl-1">Kullanılabilir değişkenler: {"{studentName}"}, {"{date}"}, {"{teacherName}"}</p>
                                            </div>
                                        )}
                                        {['schoolResponsibilities', 'parentResponsibilities', 'studentResponsibilities'].map(arrKey => {
                                            if (form[arrKey] === undefined) return null;
                                            return (
                                                <div key={arrKey} className="space-y-2">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                                                        {arrKey === 'schoolResponsibilities' ? 'Okul Sorumlulukları' :
                                                         arrKey === 'parentResponsibilities' ? 'Veli Sorumlulukları' : 'Öğrenci Sorumlulukları'}
                                                    </span>
                                                    {(form[arrKey] || []).map((item: string, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                value={item}
                                                                onChange={(e) => {
                                                                    const newForms = { ...(behaviorConfig.forms || INITIAL_FORM_CONFIGS) };
                                                                    const newArr = [...newForms[key][arrKey]];
                                                                    newArr[idx] = e.target.value;
                                                                    newForms[key] = { ...newForms[key], [arrKey]: newArr };
                                                                    handleUpdateBehaviorConfig({ ...behaviorConfig, forms: newForms });
                                                                }}
                                                                className="flex-1 bg-white border border-gray-200 rounded-xl px-5 py-3 text-sm text-gray-600 font-medium outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
                                                            />
                                                            <button 
                                                                onClick={() => {
                                                                    const newForms = { ...(behaviorConfig.forms || INITIAL_FORM_CONFIGS) };
                                                                    const newArr = newForms[key][arrKey].filter((_: any, i: number) => i !== idx);
                                                                    newForms[key] = { ...newForms[key], [arrKey]: newArr };
                                                                    handleUpdateBehaviorConfig({ ...behaviorConfig, forms: newForms });
                                                                }}
                                                                className="text-gray-300 hover:text-red-500 p-2"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button 
                                                        onClick={() => {
                                                            const newForms = { ...(behaviorConfig.forms || INITIAL_FORM_CONFIGS) };
                                                            const newArr = [...(newForms[key][arrKey] || []), ''];
                                                            newForms[key] = { ...newForms[key], [arrKey]: newArr };
                                                            handleUpdateBehaviorConfig({ ...behaviorConfig, forms: newForms });
                                                        }}
                                                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 pl-1"
                                                    >
                                                        <Plus size={14}/> Madde Ekle
                                                    </button>
                                                </div>
                                            );
                                        })}
                                        {form.footer !== undefined && (
                                            <div className="space-y-2 mt-4">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Alt Bilgi (Footer)</span>
                                                <textarea
                                                    rows={2}
                                                    value={form.footer || ''}
                                                    onChange={(e) => {
                                                        const newForms = { ...(behaviorConfig.forms || INITIAL_FORM_CONFIGS) };
                                                        newForms[key] = { ...newForms[key], footer: e.target.value };
                                                        handleUpdateBehaviorConfig({ ...behaviorConfig, forms: newForms });
                                                    }}
                                                    className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-sm text-gray-600 font-medium outline-none resize-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
                                                />
                                            </div>
                                        )}
                                        {key === 'studentContract' && form.page2 !== undefined && (
                                            <div className="space-y-2 mt-4">
                                                <span className="text-[10px] font-black text-blue-600/50 uppercase tracking-widest pl-1">Sözleşme 2. Sayfa (HTML İçerik)</span>
                                                <textarea
                                                    rows={10}
                                                    value={form.page2 || ''}
                                                    onChange={(e) => {
                                                        const newForms = { ...(behaviorConfig.forms || INITIAL_FORM_CONFIGS) };
                                                        newForms[key] = { ...newForms[key], page2: e.target.value };
                                                        handleUpdateBehaviorConfig({ ...behaviorConfig, forms: newForms });
                                                    }}
                                                    className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-[10px] font-mono text-gray-500 outline-none resize-y focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
                                                />
                                            </div>
                                        )}
                                        <hr className="my-6 border-gray-100" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        )}

                    </div>
                )}

                {adminTab === 'support' && (
                    <div className="animate-in fade-in">
                        {actions.renderSupportContent(false)}
                    </div>
                )}

                {adminTab === 'logs' && (
                    <AuditLogsPanel activeSchoolId={activeSchoolId} />
                )}

                {adminTab === 'teacherperf' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Görev Tipleri */}
                            <div className="bg-white p-10 rounded-[40px] border border-gray-200 shadow-sm space-y-8">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Layers size={28} />
                                    </div>
                                    <h3 className="text-2xl font-black text-blue-900 tracking-tight">Görev Tipleri</h3>
                                </div>

                                <div className="space-y-4">
                                    {teacherPerfConfig?.taskTypes?.map((task: any, idx: number) => (
                                        <div key={task.id} className="flex items-start gap-4 group">
                                            <div className="text-sm font-black text-gray-400 mt-3 w-4">{idx + 1}.</div>
                                            <div className="flex-1 bg-gray-50/50 border border-gray-100 p-4 rounded-2xl space-y-3 group-hover:bg-white group-hover:border-blue-100 transition-all">
                                                <div className="flex gap-3">
                                                    <input 
                                                        type="text" 
                                                        value={task.name}
                                                        onChange={(e) => {
                                                            const newTaskTypes = [...teacherPerfConfig.taskTypes];
                                                            newTaskTypes[idx] = { ...newTaskTypes[idx], name: e.target.value };
                                                            actions.handleUpdateTeacherPerfConfig({ ...teacherPerfConfig, taskTypes: newTaskTypes });
                                                        }}
                                                        className="flex-1 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-blue-500 transition-all"
                                                    />
                                                    <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-xl">
                                                        <span className="text-[10px] font-black text-gray-400">Puan:</span>
                                                        <input 
                                                            type="number" 
                                                            value={task.score}
                                                            onChange={(e) => {
                                                                const newTaskTypes = [...teacherPerfConfig.taskTypes];
                                                                newTaskTypes[idx] = { ...newTaskTypes[idx], score: parseInt(e.target.value) || 0 };
                                                                actions.handleUpdateTeacherPerfConfig({ ...teacherPerfConfig, taskTypes: newTaskTypes });
                                                            }}
                                                            className="w-8 text-center text-sm font-black text-blue-600 outline-none"
                                                        />
                                                        <div className="flex flex-col text-gray-400">
                                                            <button onClick={() => {
                                                                const newTaskTypes = [...teacherPerfConfig.taskTypes];
                                                                newTaskTypes[idx] = { ...newTaskTypes[idx], score: (newTaskTypes[idx].score || 0) + 1 };
                                                                actions.handleUpdateTeacherPerfConfig({ ...teacherPerfConfig, taskTypes: newTaskTypes });
                                                            }}><ChevronUp size={12}/></button>
                                                            <button onClick={() => {
                                                                const newTaskTypes = [...teacherPerfConfig.taskTypes];
                                                                newTaskTypes[idx] = { ...newTaskTypes[idx], score: Math.max(0, (newTaskTypes[idx].score || 0) - 1) };
                                                                actions.handleUpdateTeacherPerfConfig({ ...teacherPerfConfig, taskTypes: newTaskTypes });
                                                            }}><ChevronDown size={12}/></button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <input 
                                                    type="text" 
                                                    value={task.desc}
                                                    placeholder="Açıklama..."
                                                    onChange={(e) => {
                                                        const newTaskTypes = [...teacherPerfConfig.taskTypes];
                                                        newTaskTypes[idx] = { ...newTaskTypes[idx], desc: e.target.value };
                                                        actions.handleUpdateTeacherPerfConfig({ ...teacherPerfConfig, taskTypes: newTaskTypes });
                                                    }}
                                                    className="w-full bg-transparent text-[11px] font-medium text-gray-400 outline-none px-1"
                                                />
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    const newTaskTypes = teacherPerfConfig.taskTypes.filter((_: any, i: number) => i !== idx);
                                                    actions.handleUpdateTeacherPerfConfig({ ...teacherPerfConfig, taskTypes: newTaskTypes });
                                                }}
                                                className="mt-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button 
                                    onClick={() => {
                                        const newTaskTypes = [...(teacherPerfConfig?.taskTypes || []), { id: Date.now(), name: 'Yeni Görev', score: 1, desc: '' }];
                                        actions.handleUpdateTeacherPerfConfig({ ...teacherPerfConfig, taskTypes: newTaskTypes });
                                    }}
                                    className="w-full py-4 border-2 border-dashed border-blue-100 rounded-2xl text-blue-600 font-black text-sm hover:bg-blue-50 hover:border-blue-200 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} /> Yeni Görev Ekle
                                </button>
                            </div>

                            {/* Çarpanlar */}
                            <div className="bg-white p-10 rounded-[40px] border border-gray-200 shadow-sm space-y-8">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <Star size={28} />
                                    </div>
                                    <h3 className="text-2xl font-black text-blue-900 tracking-tight">Nitelik Çarpanları</h3>
                                </div>

                                <div className="space-y-4">
                                    {teacherPerfConfig?.rubrics?.map((rubric: any, idx: number) => (
                                        <div key={rubric.id} className="flex items-start gap-4 group">
                                            <div className="text-sm font-black text-gray-400 mt-3 w-4">{idx + 1}.</div>
                                            <div className="flex-1 bg-gray-50/50 border border-gray-100 p-4 rounded-2xl space-y-3 group-hover:bg-white group-hover:border-blue-100 transition-all">
                                                <div className="flex gap-3">
                                                    <input 
                                                        type="text" 
                                                        value={rubric.name}
                                                        onChange={(e) => {
                                                            const newRubrics = [...teacherPerfConfig.rubrics];
                                                            newRubrics[idx] = { ...newRubrics[idx], name: e.target.value };
                                                            actions.handleUpdateTeacherPerfConfig({ ...teacherPerfConfig, rubrics: newRubrics });
                                                        }}
                                                        className="flex-1 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-blue-500 transition-all"
                                                    />
                                                    <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-xl">
                                                        <span className="text-[10px] font-black text-gray-400">Çarpan: x</span>
                                                        <input 
                                                            type="number" 
                                                            value={rubric.multiplier}
                                                            onChange={(e) => {
                                                                const newRubrics = [...teacherPerfConfig.rubrics];
                                                                newRubrics[idx] = { ...newRubrics[idx], multiplier: parseInt(e.target.value) || 1 };
                                                                actions.handleUpdateTeacherPerfConfig({ ...teacherPerfConfig, rubrics: newRubrics });
                                                            }}
                                                            className="w-8 text-center text-sm font-black text-green-600 outline-none"
                                                        />
                                                        <div className="flex flex-col text-gray-400">
                                                            <button onClick={() => {
                                                                const newRubrics = [...teacherPerfConfig.rubrics];
                                                                newRubrics[idx] = { ...newRubrics[idx], multiplier: (newRubrics[idx].multiplier || 1) + 1 };
                                                                actions.handleUpdateTeacherPerfConfig({ ...teacherPerfConfig, rubrics: newRubrics });
                                                            }}><ChevronUp size={12}/></button>
                                                            <button onClick={() => {
                                                                const newRubrics = [...teacherPerfConfig.rubrics];
                                                                newRubrics[idx] = { ...newRubrics[idx], multiplier: Math.max(1, (newRubrics[idx].multiplier || 1) - 1) };
                                                                actions.handleUpdateTeacherPerfConfig({ ...teacherPerfConfig, rubrics: newRubrics });
                                                            }}><ChevronDown size={12}/></button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <input 
                                                    type="text" 
                                                    value={rubric.desc}
                                                    placeholder="Açıklama..."
                                                    onChange={(e) => {
                                                        const newRubrics = [...teacherPerfConfig.rubrics];
                                                        newRubrics[idx] = { ...newRubrics[idx], desc: e.target.value };
                                                        actions.handleUpdateTeacherPerfConfig({ ...teacherPerfConfig, rubrics: newRubrics });
                                                    }}
                                                    className="w-full bg-transparent text-[11px] font-medium text-gray-400 outline-none px-1"
                                                />
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    const newRubrics = teacherPerfConfig.rubrics.filter((_: any, i: number) => i !== idx);
                                                    actions.handleUpdateTeacherPerfConfig({ ...teacherPerfConfig, rubrics: newRubrics });
                                                }}
                                                className="mt-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button 
                                    onClick={() => {
                                        const newRubrics = [...(teacherPerfConfig?.rubrics || []), { id: Date.now(), name: 'Yeni Nitelik', multiplier: 1, desc: '' }];
                                        actions.handleUpdateTeacherPerfConfig({ ...teacherPerfConfig, rubrics: newRubrics });
                                    }}
                                    className="w-full py-4 border-2 border-dashed border-blue-100 rounded-2xl text-blue-600 font-black text-sm hover:bg-blue-50 hover:border-blue-200 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} /> Yeni Nitelik Ekle
                                </button>
                            </div>
                        </div>

                        {/* Yıllık Görevler */}
                        <div className="bg-white p-10 rounded-[40px] border border-gray-200 shadow-sm space-y-8 mt-8 col-span-1 lg:col-span-2">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                                    <Calendar size={28} />
                                </div>
                                <h3 className="text-2xl font-black text-blue-900 tracking-tight">Yıllık Görevler</h3>
                            </div>
                            <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <table className="w-full text-left border-collapse min-w-[700px]">
                                    <thead>
                                        <tr>
                                            <th className="p-4 border-b border-gray-200 bg-gray-50 text-[10px] text-gray-400 uppercase font-black tracking-widest w-16">NO</th>
                                            <th className="p-4 border-b border-gray-200 bg-gray-50 text-[10px] text-gray-400 uppercase font-black tracking-widest w-32 border-l border-white">AY</th>
                                            <th className="p-4 border-b border-gray-200 bg-gray-50 text-[10px] text-gray-400 uppercase font-black tracking-widest border-l border-white">YAPILACAK İŞ</th>
                                            <th className="p-4 border-b border-gray-200 bg-gray-50 text-[10px] text-gray-400 uppercase font-black tracking-widest w-48 border-l border-white">TARİH</th>
                                            <th className="p-4 border-b border-gray-200 bg-gray-50 text-[10px] text-gray-400 uppercase font-black tracking-widest w-16 text-center border-l border-white">İŞLEM</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {teacherPerfConfig?.yearlyTasks?.map((task: any, idx: number) => (
                                            <tr key={task.id} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="p-4 text-sm font-black text-gray-400">{idx + 1}</td>
                                                <td className="p-4">
                                                    <select
                                                        value={task.month}
                                                        onChange={(e) => {
                                                            const newTasks = [...teacherPerfConfig.yearlyTasks];
                                                            newTasks[idx] = { ...newTasks[idx], month: e.target.value };
                                                            actions.handleUpdateTeacherPerfConfig({ ...teacherPerfConfig, yearlyTasks: newTasks });
                                                        }}
                                                        className="w-full bg-transparent border border-transparent hover:border-gray-200 focus:border-blue-500 rounded-lg px-2 py-1 text-sm font-bold text-gray-700 outline-none transition-all"
                                                    >
                                                        {['EYLÜL', 'EKİM', 'KASIM', 'ARALIK', 'OCAK', 'ŞUBAT', 'MART', 'NİSAN', 'MAYIS', 'HAZİRAN', 'TEMMUZ', 'AĞUSTOS'].map(m => (
                                                            <option key={m} value={m}>{m}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="p-4">
                                                    <textarea 
                                                        value={task.task}
                                                        onChange={(e) => {
                                                            const newTasks = [...teacherPerfConfig.yearlyTasks];
                                                            newTasks[idx] = { ...newTasks[idx], task: e.target.value };
                                                            actions.handleUpdateTeacherPerfConfig({ ...teacherPerfConfig, yearlyTasks: newTasks });
                                                        }}
                                                        rows={1}
                                                        className="w-full bg-transparent border border-transparent hover:border-gray-200 focus:border-blue-500 rounded-lg px-2 py-1 text-sm font-medium text-gray-600 outline-none transition-all resize-none"
                                                        placeholder="Yapılacak İş..."
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <input 
                                                        type="text" 
                                                        value={task.dateRange}
                                                        onChange={(e) => {
                                                            const newTasks = [...teacherPerfConfig.yearlyTasks];
                                                            newTasks[idx] = { ...newTasks[idx], dateRange: e.target.value };
                                                            actions.handleUpdateTeacherPerfConfig({ ...teacherPerfConfig, yearlyTasks: newTasks });
                                                        }}
                                                        className="w-full bg-transparent border border-transparent hover:border-gray-200 focus:border-blue-500 rounded-lg px-2 py-1 text-sm font-bold text-gray-700 outline-none transition-all"
                                                        placeholder="Tarih"
                                                    />
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button 
                                                        onClick={() => {
                                                            const newTasks = teacherPerfConfig.yearlyTasks.filter((_: any, i: number) => i !== idx);
                                                            actions.handleUpdateTeacherPerfConfig({ ...teacherPerfConfig, yearlyTasks: newTasks });
                                                        }}
                                                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 bg-red-50 hover:bg-red-100 rounded-lg"
                                                        title="Sil"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button 
                                onClick={() => {
                                    const newTasks = [...(teacherPerfConfig?.yearlyTasks || []), { id: Date.now(), month: 'EYLÜL', task: '', dateRange: '' }];
                                    actions.handleUpdateTeacherPerfConfig({ ...teacherPerfConfig, yearlyTasks: newTasks });
                                }}
                                className="w-full py-4 border-2 border-dashed border-blue-100 rounded-2xl text-blue-600 font-black text-sm hover:bg-blue-50 hover:border-blue-200 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={18} /> Yeni Yıllık Görev Ekle
                            </button>
                        </div>
                        
                        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 mt-6">
                            <h3 className="text-xl font-black text-gray-900 mb-6 tracking-tight flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 flex items-center justify-center text-indigo-600 border border-indigo-100/50">
                                    <Users size={20} />
                                </div>
                                Görevi Yapacak Sorumlu Birim Ekle
                            </h3>
                            <div className="space-y-4">
                                {teacherPerfConfig?.assignmentGroups?.map((group: any, idx: number) => (
                                    <div key={idx} className="flex gap-4 items-center">
                                        <div className="flex-1">
                                            <input 
                                                value={group.name} 
                                                onChange={(e) => {
                                                    const newGroups = [...teacherPerfConfig.assignmentGroups];
                                                    newGroups[idx] = { ...newGroups[idx], name: e.target.value };
                                                    actions.handleUpdateTeacherPerfConfig({ ...teacherPerfConfig, assignmentGroups: newGroups });
                                                }}
                                                className="w-full bg-white border border-gray-200 py-3 px-4 rounded-xl text-sm font-semibold text-gray-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all hover:border-gray-300"
                                                placeholder="Birim Adı (Örn: Okul Müdürü, Tüm Öğretmenler)"
                                            />
                                        </div>
                                        <button 
                                            onClick={() => {
                                                const newGroups = teacherPerfConfig.assignmentGroups.filter((_: any, i: number) => i !== idx);
                                                actions.handleUpdateTeacherPerfConfig({ ...teacherPerfConfig, assignmentGroups: newGroups });
                                            }}
                                            className="text-gray-400 hover:text-red-600 p-3 bg-gray-50 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                            title="Birimi Sil"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button 
                                onClick={() => {
                                    const newGroups = [...(teacherPerfConfig?.assignmentGroups || []), { id: `GROUP_${Date.now()}`, name: '' }];
                                    actions.handleUpdateTeacherPerfConfig({ ...teacherPerfConfig, assignmentGroups: newGroups });
                                }}
                                className="w-full mt-6 py-4 border-2 border-dashed border-indigo-100 rounded-2xl text-indigo-600 font-black text-sm hover:bg-indigo-50 hover:border-indigo-200 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={18} /> Yeni Sorumlu Birim Ekle
                            </button>
                        </div>
                    </div>
                )}

                {/* Excel İçe Aktarma Önizleme Modalı (Sınıflar sekmesi için) */}
                {adminTab !== 'import' && excelPreview.length > 0 && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                        <div className="bg-white rounded-[32px] shadow-2xl p-8 max-w-2xl w-full animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-500">
                                        <CheckCircle size={28} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl text-gray-900 uppercase tracking-tight">Excel Önizleme</h3>
                                        <p className="text-sm font-medium text-gray-400">{excelPreview.length} öğrenci başarıyla tespit edildi.</p>
                                    </div>
                                </div>
                                <button onClick={() => setExcelPreview([])} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-50 rounded-xl"><X size={24}/></button>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-8 custom-scrollbar">
                                {excelPreview.map((row: any, idx: number) => {
                                    const match = row.name.match(/^(\d+)\s*[-]\s*(.+)$/);
                                    const no = match ? match[1] : '-';
                                    const name = match ? match[2] : row.name;
                                    return (
                                        <div key={idx} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between group hover:bg-white hover:border-blue-100 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="text-xs font-black text-gray-300 w-6">{idx + 1}.</div>
                                                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-blue-600 font-black text-xs shadow-sm">
                                                    {no}
                                                </div>
                                                <span className="font-bold text-gray-800">{name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                                    {formatClassLabel(row.classLevel)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex justify-end gap-4 p-2">
                                <button 
                                    onClick={() => setExcelPreview([])} 
                                    className="px-8 py-4 text-gray-500 hover:bg-gray-50 rounded-2xl text-sm font-black uppercase tracking-widest transition-all"
                                >
                                    Vazgeç
                                </button>
                                <button 
                                    onClick={() => {
                                        handleImportExcel();
                                        setAdminTab('classes'); // Ensure we stay/return to classes
                                    }} 
                                    className="px-10 py-4 bg-green-600 text-white hover:bg-green-700 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-green-100 flex items-center gap-2"
                                >
                                    <Plus size={18}/> Hepsini İçe Aktar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Kullanıcı Düzenleme Modalı */}
        {editUser && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-md w-full animate-in zoom-in-95 duration-200 space-y-6">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-xl text-gray-900">Kullanıcıyı Düzenle</h3>
                        <button onClick={() => setEditUser(null)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20}/></button>
                    </div>

                    <div className="space-y-5">
                        {editUser.role === 'student' ? (
                            <>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-1">
                                        <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wide">Okul No</label>
                                        <input 
                                            type="text" 
                                            value={editUser.name.match(/^(\d+)\s*[-]\s*(.+)$/)?.[1] || ''} 
                                            onChange={e => {
                                                const no = e.target.value.trim();
                                                const match = editUser.name.match(/^(\d+)\s*[-]\s*(.+)$/);
                                                const pure = match ? match[2] : editUser.name;
                                                setEditUser({...editUser, name: no ? `${no} - ${pure}` : pure});
                                            }}
                                            className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-sm bg-gray-50 focus:bg-white text-gray-800"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wide">Ad Soyad</label>
                                        <input 
                                            type="text" 
                                            value={editUser.name.match(/^(\d+)\s*[-]\s*(.+)$/)?.[2] || editUser.name} 
                                            onChange={e => {
                                                const name = e.target.value;
                                                const match = editUser.name.match(/^(\d+)\s*[-]\s*(.+)$/);
                                                const no = match ? match[1] : '';
                                                setEditUser({...editUser, name: no ? `${no} - ${name}` : name});
                                            }}
                                            className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-sm bg-gray-50 focus:bg-white text-gray-800"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wide">Ad Soyad</label>
                                <input type="text" value={editUser.name || ''} onChange={e=>setEditUser({...editUser, name: e.target.value})} className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-sm bg-gray-50 focus:bg-white text-gray-800"/>
                            </div>
                        )}
                        <div>
                            <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wide">Kullanıcı Adı</label>
                            <input type="text" value={editUser.username || ''} onChange={e=>setEditUser({...editUser, username: e.target.value})} className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-sm bg-gray-50 focus:bg-white text-gray-800"/>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wide">Şifre</label>
                            <input type="text" value={editUser.password || ''} onChange={e=>setEditUser({...editUser, password: e.target.value})} className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-sm bg-gray-50 focus:bg-white text-gray-800"/>
                        </div>
                        {editUser.role === 'student' && (
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wide">Sınıf</label>
                                <select value={editUser.classLevel || ''} onChange={e=>setEditUser({...editUser, classLevel: e.target.value})} className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-sm bg-gray-50 focus:bg-white cursor-pointer appearance-none text-gray-800">
                                    {Object.keys(classes).sort().map(c => <option key={c} value={c}>{formatClassLabel(c)}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                        <button onClick={() => setEditUser(null)} className="px-5 py-2.5 text-gray-500 hover:bg-gray-50 rounded-xl text-sm font-bold transition-colors">İptal</button>
                        <button onClick={handleUpdateUser} className="px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-sm font-bold transition-colors shadow-sm shadow-blue-200 flex items-center gap-2">
                            <Save size={16}/> Kaydet
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
