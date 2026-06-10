import React from 'react';
import { Shield, LogOut, School, MessageSquare, User, CheckCircle, Users, GraduationCap, LayoutList, ArrowRight, Ban, Edit2, Trash2, Plus, Lock, Link as LinkIcon } from 'lucide-react';

export const SuperAdminPanel = ({ state, actions }: any) => {
  const { currentUser, schools, schoolStats, superAdmins, superAdminTab, newSchoolName, newSa, saPasswordForm, tickets } = state;
  const { setCurrentUser, setSuperAdminTab, setSupportView, setNewSchoolName, handleCreateSchool, handleImpersonate, handleToggleSchoolStatus, requestPrompt, handleDeleteSchool, setNewSa, handleAddSuperAdmin, handleDeleteSuperAdmin, setSaPasswordForm, handleSaPasswordChange, renderSupportContent, handleUpdateSchoolLinks } = actions;

  const [creationType, setCreationType] = React.useState('okul');
  const [parentIlId, setParentIlId] = React.useState('');
  const [parentIlceId, setParentIlceId] = React.useState('');
  const [editingLinks, setEditingLinks] = React.useState<string | null>(null);
  const [editLinkIlId, setEditLinkIlId] = React.useState('');
  const [editLinkIlceId, setEditLinkIlceId] = React.useState('');

  const ilList = schools.filter((s: any) => s.type === 'il');
  const ilceList = schools.filter((s: any) => s.type === 'ilce' && (!parentIlId || s.parentId === parentIlId));

  const onCreateOrganization = () => {
    handleCreateSchool({
        name: newSchoolName,
        type: creationType,
        parentId: parentIlId || null,
        districtId: creationType === 'okul' ? parentIlceId || null : null
    });
    setParentIlId('');
    setParentIlceId('');
    setNewSchoolName('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-inter text-gray-800 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-5xl mx-auto mt-4">
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                <h2 className="text-2xl font-black text-blue-900 flex items-center gap-3"><Shield className="text-blue-600"/> Süper Yönetici Paneli</h2>
                <div className="flex items-center gap-6">
                    <div className="text-sm font-semibold text-gray-600 hidden md:block">{currentUser.name}</div>
                    <button onClick={() => setCurrentUser(null)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-100"><LogOut size={16}/> Çıkış</button>
                </div>
            </div>
            
            <div className="flex gap-8 mb-10 border-b border-gray-200 overflow-x-auto pb-px">
                <button onClick={()=>setSuperAdminTab('schools')} className={`pb-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${superAdminTab==='schools'?'border-blue-600 text-blue-600':'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'}`}><School size={18}/> Kurumlar</button>
                <button onClick={()=>setSuperAdminTab('admins')} className={`pb-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${superAdminTab==='admins'?'border-blue-600 text-blue-600':'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'}`}><Shield size={18}/> Yöneticiler</button>
                <button onClick={()=>{setSuperAdminTab('support'); setSupportView('list');}} className={`pb-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${superAdminTab==='support'?'border-blue-600 text-blue-600':'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'}`}>
                    <MessageSquare size={18}/> Destek Talepleri
                    {tickets.filter((t: any) => t.status !== 'closed').length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm shadow-red-200 animate-pulse ml-1">
                            {tickets.filter((t: any) => t.status !== 'closed').length}
                        </span>
                    )}
                </button>
                <button onClick={()=>setSuperAdminTab('profile')} className={`pb-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${superAdminTab==='profile'?'border-blue-600 text-blue-600':'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'}`}><User size={18}/> Profilim</button>
            </div>

            {superAdminTab === 'schools' && (
                <div className="animate-in fade-in space-y-10">
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <h3 className="font-bold text-blue-900 mb-4 tracking-tight">Kurum Yönetimi</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <button onClick={() => setCreationType('il')} className={`p-4 rounded-xl border-2 transition-all text-sm font-bold flex flex-col items-center gap-2 ${creationType === 'il' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
                                <LayoutList size={20}/> Yeni İl Ekle
                            </button>
                            <button onClick={() => setCreationType('ilce')} className={`p-4 rounded-xl border-2 transition-all text-sm font-bold flex flex-col items-center gap-2 ${creationType === 'ilce' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
                                <LayoutList size={20}/> Yeni İlçe Ekle
                            </button>
                            <button onClick={() => setCreationType('okul')} className={`p-4 rounded-xl border-2 transition-all text-sm font-bold flex flex-col items-center gap-2 ${creationType === 'okul' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
                                <School size={20}/> Yeni Okul Ekle
                            </button>
                        </div>

                        <div className="space-y-4 max-w-2xl">
                            <div className="flex flex-col md:flex-row gap-3">
                                <input type="text" placeholder={`${creationType === 'okul' ? 'Okul' : creationType === 'ilce' ? 'İlçe' : 'İl'} Adı`} value={newSchoolName} onChange={e=>setNewSchoolName(e.target.value)} className="border border-gray-200 p-3 rounded-xl flex-1 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-semibold"/>
                                
                                {creationType !== 'il' && (
                                    <div className="flex-1 space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1">İl MEM (Opsiyonel)</label>
                                        <select value={parentIlId} onChange={e => { setParentIlId(e.target.value); setParentIlceId(''); }} className="w-full border border-gray-200 p-3 rounded-xl outline-none text-sm font-semibold bg-white focus:border-blue-500">
                                            <option value="">-- İl Seçin --</option>
                                            {ilList.map((il: any) => <option key={il.id} value={il.id}>{il.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                {creationType === 'okul' && (
                                    <div className="flex-1 space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1">İlçe MEM (Opsiyonel)</label>
                                        <select value={parentIlceId} onChange={e => setParentIlceId(e.target.value)} className="w-full border border-gray-200 p-3 rounded-xl outline-none text-sm font-semibold bg-white focus:border-blue-500">
                                            <option value="">-- İlçe Seçin --</option>
                                            {schools.filter((s: any) => s.type === 'ilce' && (!parentIlId || s.parentId === parentIlId)).map((ic: any) => <option key={ic.id} value={ic.id}>{ic.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                <div className="flex items-end">
                                    <button onClick={onCreateOrganization} className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 shadow-sm shadow-blue-200 transition text-sm whitespace-nowrap">Oluştur</button>
                                </div>
                            </div>
                            
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                {creationType === 'il' && <p className="text-xs text-blue-700 font-medium flex items-center gap-2"><CheckCircle size={14}/> Yeni İl Müdürlüğü için varsayılan giriş: <b>ilrapor / ilrapor</b></p>}
                                {creationType === 'ilce' && <p className="text-xs text-blue-700 font-medium flex items-center gap-2"><CheckCircle size={14}/> Yeni İlçe Müdürlüğü için varsayılan giriş: <b>ilcerapor / ilcerapor</b></p>}
                                {creationType === 'okul' && <p className="text-xs text-blue-700 font-medium flex items-center gap-2"><CheckCircle size={14}/> Yeni Okul için varsayılan giriş: <b>okul / okul</b> (veya belirlenen ad)</p>}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-6 text-blue-900 flex items-center gap-2 uppercase tracking-tighter">Kayıtlı Kurumlar <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-xs">{schools.length}</span></h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[...schools].sort((a, b) => {
                                const getPriority = (type: string) => {
                                    if (type === 'il') return 1;
                                    if (type === 'ilce') return 2;
                                    return 3;
                                };
                                const pA = getPriority(a.type);
                                const pB = getPriority(b.type);
                                if (pA !== pB) return pA - pB;

                                const aActive = a.isActive !== false;
                                const bActive = b.isActive !== false;
                                if (aActive !== bActive) return aActive ? -1 : 1;
                                
                                return a.name.localeCompare(b.name);
                            }).map(school => {
                                const isActive = school.isActive !== false;
                                const parentOrg = school.parentId ? schools.find(s => s.id === school.parentId) : null;
                                const districtOrg = school.districtId ? schools.find(s => s.id === school.districtId) : null;
                                return (
                                <div key={school.id} className={`border p-5 rounded-2xl flex flex-col gap-4 transition-all duration-200 ${isActive ? 'bg-white border-gray-200 hover:border-gray-300 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-70 grayscale-[30%]'}`}>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3.5 rounded-xl ${isActive ? (school.type === 'il' ? 'bg-orange-50 text-orange-600' : school.type === 'ilce' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600') : 'bg-gray-200 text-gray-400'}`}>
                                                {school.type === 'il' ? <LayoutList size={20}/> : school.type === 'ilce' ? <LayoutList size={20}/> : <School size={20}/>}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 flex items-center gap-2 mb-1">
                                                    {school.name}
                                                    <span className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest ${school.type === 'il' ? 'bg-orange-100 text-orange-700' : school.type === 'ilce' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {school.type === 'il' ? 'İL MEM' : school.type === 'ilce' ? 'İLÇE MEM' : 'OKUL'}
                                                    </span>
                                                    {!isActive && <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Pasif</span>}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    {(parentOrg || districtOrg) && (
                                                        <div className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-tight">
                                                            <ArrowRight size={10}/> 
                                                            {parentOrg && <span>{parentOrg.name}</span>}
                                                            {parentOrg && districtOrg && <span className="text-gray-300">/</span>}
                                                            {districtOrg && <span>{districtOrg.name}</span>}
                                                        </div>
                                                    )}
                                                    {schoolStats[school.id] ? (
                                                        <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-gray-500">
                                                            <span className="flex items-center gap-1"><Users size={12}/> {schoolStats[school.id].studentCount} Öğr.</span>
                                                            <span className="text-gray-300">•</span>
                                                            <span className="flex items-center gap-1"><GraduationCap size={12}/> {schoolStats[school.id].teacherCount} Öğrt.</span>
                                                            <span className="text-gray-300">•</span>
                                                            <span className="flex items-center gap-1"><LayoutList size={12}/> {schoolStats[school.id].classCount} Snf.</span>
                                                            {schoolStats[school.id].schoolCount !== undefined && (
                                                                <>
                                                                    <span className="text-gray-300">•</span>
                                                                    <span className="flex items-center gap-1"><School size={12}/> {schoolStats[school.id].schoolCount} Okul</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    ) : (!school.type || school.type === 'okul') && (
                                                        <div className="text-[11px] text-gray-400 flex items-center gap-1 animate-pulse">Yükleniyor...</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 border-l border-gray-200 pl-5 shrink-0 ml-auto">
                                            <button onClick={() => handleImpersonate(school)} className="bg-purple-50 text-purple-700 hover:bg-purple-100 px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                                                <ArrowRight size={14}/> Panele Geç
                                            </button>
                                            <div className="grid grid-cols-2 gap-y-2 gap-x-3 place-items-center shrink-0">
                                                {school.id !== 'default' && (
                                                    <button onClick={() => handleToggleSchoolStatus(school.id, school.isActive)} className={`p-1 text-gray-400 transition-colors ${isActive ? 'hover:text-gray-600' : 'hover:text-green-600'}`} title={isActive ? "Pasife Al" : "Aktifleştir"}>
                                                        {isActive ? <Ban size={16}/> : <CheckCircle size={16}/>}
                                                    </button>
                                                )}
                                                {school.type !== 'il' && (
                                                    <button onClick={() => { setEditingLinks(editingLinks === school.id ? null : school.id); setEditLinkIlId(school.parentId || ''); setEditLinkIlceId(school.districtId || ''); }} className={`p-1 transition-colors ${editingLinks === school.id ? 'text-blue-600' : 'text-gray-400 hover:text-blue-500'}`} title="Bağlantıları Düzenle">
                                                        <LinkIcon size={16}/>
                                                    </button>
                                                )}
                                                <button onClick={()=>requestPrompt("Kurumun yeni adını giriniz:", school.name, async (newName: string) => { if(newName && newName.trim() !== school.name) { actions.handleEditSchoolName(school.id, newName.trim()); } })} className="p-1 text-gray-400 hover:text-blue-600 transition" title="Düzenle">
                                                    <Edit2 size={16}/>
                                                </button>
                                                {school.id !== 'default' && (
                                                    <button onClick={()=>handleDeleteSchool(school.id)} className="p-1 text-gray-400 hover:text-red-600 transition" title="Sil">
                                                        <Trash2 size={16}/>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {editingLinks === school.id && (
                                        <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 mt-2 animate-in slide-in-from-top-2 duration-200">
                                            <div className="flex flex-col gap-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-blue-900 uppercase tracking-widest ml-1">İl MEM Bağlantısı</label>
                                                        <select value={editLinkIlId} onChange={e => { setEditLinkIlId(e.target.value); setEditLinkIlceId(''); }} className="w-full bg-white border border-blue-200 p-3 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10">
                                                            <option value="">-- Bağlı Değil --</option>
                                                            {ilList.map((il: any) => <option key={il.id} value={il.id}>{il.name}</option>)}
                                                        </select>
                                                    </div>
                                                    {(!school.type || school.type === 'okul') && (
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] font-black text-blue-900 uppercase tracking-widest ml-1">İlçe MEM Bağlantısı</label>
                                                            <select value={editLinkIlceId} onChange={e => setEditLinkIlceId(e.target.value)} className="w-full bg-white border border-blue-200 p-3 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10">
                                                                <option value="">-- Bağlı Değil --</option>
                                                                {schools.filter((s: any) => s.type === 'ilce' && (!editLinkIlId || s.parentId === editLinkIlId)).map((ic: any) => <option key={ic.id} value={ic.id}>{ic.name}</option>)}
                                                            </select>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex justify-end gap-2 pt-2">
                                                    <button onClick={() => setEditingLinks(null)} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors">Vazgeç</button>
                                                    <button onClick={async () => {
                                                        await handleUpdateSchoolLinks(school.id, { 
                                                            parentId: editLinkIlId || null,
                                                            districtId: (!school.type || school.type === 'okul') ? (editLinkIlceId || null) : null
                                                        });
                                                        setEditingLinks(null);
                                                    }} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">Bağlantıları Güncelle</button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {superAdminTab === 'admins' && (
                <div className="animate-in fade-in space-y-8">
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <h3 className="font-bold text-blue-900 mb-4">Süper Yönetici Ekle</h3>
                        <div className="flex flex-wrap gap-3">
                            <input placeholder="Ad Soyad" value={newSa.name} onChange={e=>setNewSa({...newSa, name:e.target.value})} className="border border-gray-200 p-3 rounded-xl flex-1 min-w-[200px] outline-none text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"/>
                            <input placeholder="Kullanıcı Adı" value={newSa.username} onChange={e=>setNewSa({...newSa, username:e.target.value})} className="border border-gray-200 p-3 rounded-xl flex-1 min-w-[200px] outline-none text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"/>
                            <input placeholder="Şifre" type="password" value={newSa.password} onChange={e=>setNewSa({...newSa, password:e.target.value})} className="border border-gray-200 p-3 rounded-xl flex-1 min-w-[200px] outline-none text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"/>
                            <button onClick={handleAddSuperAdmin} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-sm shadow-blue-200 transition text-sm">Kaydet</button>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[11px] font-bold">
                                <tr><th className="p-5 border-b border-gray-100">Ad Soyad</th><th className="p-5 border-b border-gray-100">Kullanıcı Adı</th><th className="p-5 border-b border-gray-100 text-right">İşlem</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {superAdmins.map((sa: any) => (
                                    <tr key={sa.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-5 font-semibold text-gray-900">{sa.name} {sa.id === currentUser.id && <span className="ml-2 text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md uppercase tracking-wider">Sen</span>}</td>
                                        <td className="p-5 text-gray-500">{sa.username}</td>
                                        <td className="p-5 text-right">
                                            {sa.id !== currentUser.id && (
                                                <button onClick={()=>handleDeleteSuperAdmin(sa.id)} className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition" title="Yöneticiyi Sil"><Trash2 size={18}/></button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {superAdminTab === 'support' && renderSupportContent(true)}

            {superAdminTab === 'profile' && (
                <div className="animate-in fade-in max-w-md mx-auto py-8">
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                            <Lock size={28}/>
                        </div>
                        <h3 className="font-bold text-xl mb-6 text-gray-900">Güvenlik Ayarları</h3>
                        <div className="space-y-4 text-left">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Mevcut Şifre</label>
                                <input type="password" value={saPasswordForm.current} onChange={e=>setSaPasswordForm({...saPasswordForm, current:e.target.value})} className="w-full border border-gray-200 bg-gray-50 p-3.5 rounded-xl mt-1.5 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition text-sm"/>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Yeni Şifre</label>
                                <input type="password" value={saPasswordForm.new} onChange={e=>setSaPasswordForm({...saPasswordForm, new:e.target.value})} className="w-full border border-gray-200 bg-gray-50 p-3.5 rounded-xl mt-1.5 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition text-sm"/>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Yeni Şifre (Tekrar)</label>
                                <input type="password" value={saPasswordForm.confirm} onChange={e=>setSaPasswordForm({...saPasswordForm, confirm:e.target.value})} className="w-full border border-gray-200 bg-gray-50 p-3.5 rounded-xl mt-1.5 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition text-sm"/>
                            </div>
                            <button onClick={handleSaPasswordChange} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-sm hover:bg-blue-700 shadow-sm shadow-blue-200 transition mt-6">Şifreyi Güncelle</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
