import React, { useState } from 'react';
import { Users, Plus, Edit2, Trash2, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import { doc, setDoc, deleteDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const SOCIAL_CLUBS_LIST = [
    { category: 'Bilim ve Teknoloji', clubs: ['Bilim-Fen ve Teknoloji Kulübü', 'Robotik Kulübü', 'Bilişim ve İnternet Kulübü', 'Havacılık Kulübü', 'Astronomi ve Uzay Kulübü'] },
    { category: 'Kültür ve Sanat', clubs: ['Kültür ve Edebiyat Kulübü', 'Tiyatro Kulübü', 'Müzik Kulübü', 'Görsel Sanatlar Kulübü', 'Fotoğrafçılık Kulübü', 'Halk Oyunları Kulübü', 'Geleneksel Sanatlar Kulübü'] },
    { category: 'Sosyal Sorumluluk ve Toplum Hizmeti', clubs: ['Kızılay ve Kan Bağışı Kulübü', 'Yeşilay Kulübü', 'Çocuk Hakları Kulübü', 'Engellilerle Dayanışma Kulübü', 'Hayvanları Koruma Kulübü', 'Değerler Kulübü'] },
    { category: 'Kişisel Gelişim ve Çevre', clubs: ['Gezi, Tanıtma ve Turizm Kulübü', 'Münazara Kulübü', 'Felsefe veya Düşünce Eğitimi Kulübü', 'Çevre Koruma Kulübü', 'Enerji Verimliliği Kulübü', 'Satranç Kulübü'] },
    { category: 'Spor ve Yaşam', clubs: ['Spor Kulübü', 'Sağlık, Temizlik ve Beslenme Kulübü', 'Trafik Güvenliği ve İlkyardım Kulübü', 'İzcilik Kulübü'] }
];

export function SocialClubsPanel({ state, actions }: { state: any, actions: any }) {
    const { activeSchoolId, socialClubs, users, currentUser } = state;
    
    const showToast = (message: string, type: string = 'info') => {
        actions.setAppToast({ message, type });
        setTimeout(() => actions.setAppToast({ message: null, type: 'info' }), 4000);
    };

    const confirmAction = (message: string, onConfirm: () => void) => {
        actions.requestConfirm(message, onConfirm);
    };
    
    const [selectedClub, setSelectedClub] = useState<any>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newClubName, setNewClubName] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const [memberForm, setMemberForm] = useState({ studentId: '', role: 'Üye' });
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const getTeachers = () => users.filter((u: any) => u.role === 'teacher' || u.role === 'admin');
    const getStudents = () => users.filter((u: any) => u.role === 'student');

    const filteredTeachers = getTeachers().filter((u: any) => (u.name || u.username).toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredStudents = getStudents().filter((u: any) => ((u.name || u.username) + ' ' + (u.classLevel || '')).toLowerCase().includes(searchTerm.toLowerCase()));

    const handleAddClub = async (name: string, custom?: boolean) => {
        if (!name) return;
        try {
            const clubId = 'club_' + Date.now();
            const colName = activeSchoolId === 'default' ? 'social_clubs' : `social_clubs_${activeSchoolId}`;
            await setDoc(doc(collection(db, colName), clubId), {
                id: clubId,
                name: name,
                members: [],
                createdAt: serverTimestamp()
            });
            showToast('Kulüp başarıyla eklendi', 'success');
            setIsAdding(false);
            setNewClubName('');
        } catch (e) {
            showToast('Hata oluştu', 'error');
        }
    };

    const handleDeleteClub = (clubId: string) => {
        confirmAction('Bu kulübü silmek istediğinize emin misiniz?', async () => {
            try {
                const colName = activeSchoolId === 'default' ? 'social_clubs' : `social_clubs_${activeSchoolId}`;
                await deleteDoc(doc(db, colName, clubId));
                if (selectedClub?.id === clubId) setSelectedClub(null);
                showToast('Kulüp başarıyla silindi', 'success');
            } catch (e) {
                showToast('Hata oluştu', 'error');
            }
        });
    };

    const handleAddMemberDirect = async (userId: string, role: string) => {
        if (!selectedClub) return;
        
        try {
            const updatedMembers = [...(selectedClub.members || [])];
            const existingIdx = updatedMembers.findIndex((m: any) => m.userId === userId);
            if (existingIdx > -1) {
                updatedMembers[existingIdx].role = role;
            } else {
                updatedMembers.push({ userId, role, joinedAt: new Date().toISOString() });
            }

            const colName = activeSchoolId === 'default' ? 'social_clubs' : `social_clubs_${activeSchoolId}`;
            await setDoc(doc(db, colName, selectedClub.id), {
                ...selectedClub,
                members: updatedMembers
            });
            showToast('Üye eklendi', 'success');
        } catch (e) {
            showToast('Hata oluştu', 'error');
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (!selectedClub) return;
        try {
            const updatedMembers = [...(selectedClub.members || [])];
            const existingIdx = updatedMembers.findIndex((m: any) => m.userId === userId);
            if (existingIdx > -1) {
                updatedMembers[existingIdx].role = newRole;
                const colName = activeSchoolId === 'default' ? 'social_clubs' : `social_clubs_${activeSchoolId}`;
                await setDoc(doc(db, colName, selectedClub.id), {
                    ...selectedClub,
                    members: updatedMembers
                });
                showToast('Görev güncellendi', 'success');
            }
        } catch (e) {
            showToast('Hata oluştu', 'error');
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!selectedClub) return;
        confirmAction('Bu üyeyi kulüpten çıkarmak istediğinize emin misiniz?', async () => {
            try {
                const updatedMembers = (selectedClub.members || []).filter((m: any) => m.userId !== userId);
                const colName = activeSchoolId === 'default' ? 'social_clubs' : `social_clubs_${activeSchoolId}`;
                await setDoc(doc(db, colName, selectedClub.id), {
                    ...selectedClub,
                    members: updatedMembers
                });
                showToast('Üye kulüpten çıkarıldı', 'success');
            } catch (e) {
                showToast('Hata oluştu', 'error');
            }
        });
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'Danışman Öğretmen': return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">{role}</span>;
            case 'Kulüp Başkanı': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">{role}</span>;
            case 'Başkan Yardımcısı': return <span className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded text-xs font-bold">{role}</span>;
            case 'Sekreter/Muhasip Üye': return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">Sekreter/Muhasip</span>;
            default: return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">{role}</span>;
        }
    };

    // Auto-update selected club data if changed
    const currentClubData = selectedClub ? socialClubs.find((c: any) => c.id === selectedClub.id) : null;
    if (selectedClub && currentClubData && JSON.stringify(selectedClub) !== JSON.stringify(currentClubData)) {
        setSelectedClub(currentClubData);
    }

    if (currentUser.role === 'student' || currentUser.role === 'parent') {
        const myClubs = socialClubs.filter((c: any) => (c.members || []).some((m: any) => m.userId === currentUser.id));
        return (
            <div className="bg-white p-6 md:p-12 rounded-[40px] shadow-sm border border-gray-100 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center transform rotate-3">
                        <Users size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-800 tracking-tight">Sosyal Kulüplerim</h2>
                        <p className="text-gray-500 font-medium mt-1">Üye olduğunuz sosyal kulüpler ve yönetim kurulu bilgileri.</p>
                    </div>
                </div>

                {myClubs.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
                        <Users size={48} className="mx-auto text-gray-300 mb-4"/>
                        <p className="text-gray-500 font-bold text-lg">Henüz bir kulübe üye değilsiniz.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myClubs.map((club: any) => {
                            const myMembership = club.members.find((m: any) => m.userId === currentUser.id);
                            const boardMembers = club.members.filter((m: any) => m.role !== 'Üye');
                            return (
                                <div key={club.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6 rounded-[32px] shadow-sm">
                                    <h3 className="font-black text-xl text-blue-900 mb-2">{club.name}</h3>
                                    <div className="mb-4">
                                        <span className="text-sm font-bold text-gray-600">Göreviniz: </span>
                                        {getRoleBadge(myMembership?.role || 'Üye')}
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-blue-100">
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Yönetim Kurulu</h4>
                                        <div className="space-y-3">
                                            {boardMembers.length > 0 ? boardMembers.map((bm: any, idx: number) => {
                                                const u = users.find((usr: any) => usr.id === bm.userId);
                                                return (
                                                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded-xl">
                                                        <span className="font-bold text-sm text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis mr-2">{u ? (u.name || u.username) : 'Bilinmeyen'}</span>
                                                        <span className="shrink-0">{getRoleBadge(bm.role)}</span>
                                                    </div>
                                                );
                                            }) : <span className="text-sm font-medium text-gray-400 italic">Henüz yönetim kurulu belirlenmemiş.</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white p-6 md:p-12 rounded-[40px] shadow-sm border border-gray-100 animate-in slide-in-from-bottom-4 duration-500 min-h-[600px]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-blue-200 transform hover:rotate-6 transition-all">
                        <Users size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-800 tracking-tight">Sosyal Kulüpler</h2>
                        <p className="text-gray-500 font-medium mt-1">Okul sosyal kulüplerini ve üyelerini yönetin.</p>
                    </div>
                </div>
                {!isAdding ? (
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-md"
                    >
                        <Plus size={18}/> Kulüp Ekle
                    </button>
                ) : (
                    <button 
                        onClick={() => setIsAdding(false)}
                        className="bg-gray-100 text-gray-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-all"
                    >
                        Vazgeç
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="mb-12 bg-gray-50 border border-gray-200 rounded-[32px] p-8 animate-in fade-in zoom-in-95 duration-300">
                    <h3 className="font-black text-xl text-gray-800 mb-6">Yeni Kulüp Ekle</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Hazır Listeden Seç</h4>
                            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                                {SOCIAL_CLUBS_LIST.map(cat => (
                                    <div key={cat.category}>
                                        <h5 className="font-bold text-blue-600 mb-3 text-sm">{cat.category}</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {cat.clubs.map(club => {
                                                const exists = socialClubs.some((c: any) => c.name === club);
                                                return (
                                                    <button
                                                        key={club}
                                                        onClick={() => handleAddClub(club)}
                                                        disabled={exists}
                                                        className={`text-sm px-4 py-2 rounded-xl border transition-all text-left ${exists ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60' : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold shadow-sm'}`}
                                                    >
                                                        {club} {exists && <CheckCircle size={14} className="inline ml-1"/>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="lg:border-l border-gray-200 lg:pl-8 flex flex-col justify-center">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Veya Özel Kulüp Yaz</h4>
                            <div className="flex gap-3">
                                <input 
                                    type="text" 
                                    value={newClubName}
                                    onChange={e => setNewClubName(e.target.value)}
                                    placeholder="Kulüp adı giriniz..."
                                    className="flex-1 bg-white border border-gray-300 px-5 py-4 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-bold transition-all text-gray-700"
                                />
                                <button 
                                    onClick={() => handleAddClub(newClubName, true)}
                                    className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:translate-y-[-2px] disabled:opacity-50"
                                    disabled={!newClubName.trim()}
                                >
                                    Ekle
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!selectedClub ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {socialClubs.length === 0 ? (
                        <div className="col-span-full text-center py-20">
                            <Users size={48} className="mx-auto text-gray-300 mb-4"/>
                            <p className="text-gray-500 font-bold text-lg">Henüz kulüp eklenmemiş.</p>
                            <p className="text-gray-400 text-sm mt-2">Yukarıdaki "Kulüp Ekle" butonunu kullanarak kulüp oluşturabilirsiniz.</p>
                        </div>
                    ) : (
                        socialClubs.map((club: any) => (
                            <div key={club.id} 
                                className="bg-white border-2 border-gray-100 p-6 rounded-[24px] hover:border-blue-300 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                                onClick={() => setSelectedClub(club)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Users size={24}/>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteClub(club.id); }}
                                        className="text-gray-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                                    >
                                        <Trash2 size={18}/>
                                    </button>
                                </div>
                                <h3 className="font-black text-xl text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">{club.name}</h3>
                                <div className="flex items-center gap-2 text-gray-500 text-sm font-bold">
                                    <span className="bg-gray-100 px-3 py-1 rounded-lg">{(club.members || []).length} Üye</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="animate-in fade-in duration-300">
                    <button 
                        onClick={() => setSelectedClub(null)}
                        className="mb-8 text-blue-600 font-bold flex items-center gap-2 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all w-max"
                    >
                        ← Kulüplere Dön
                    </button>
                    
                    <div className="bg-gray-50 rounded-[32px] p-8 border border-gray-200">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                                {selectedClub.name}
                                <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-xl">{(selectedClub.members || []).length} Üye</span>
                            </h3>
                            <button onClick={() => handleDeleteClub(selectedClub.id)} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl shadow-sm hover:bg-red-100 transition-all font-bold text-sm flex items-center gap-2">
                                <Trash2 size={16}/> Kulübü Sil
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
// ... Inside SocialClubsPanel component ...
                            <div className="lg:col-span-1 border-r border-gray-200 pr-8">
                                <h4 className="font-black text-gray-800 mb-4 flex items-center gap-2"><UserPlus size={20}/> Hızlı Üye Ekle</h4>
                                
                                <div className="space-y-4">
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="İsim veya sınıf ara..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full bg-white border border-gray-300 px-4 py-3 rounded-xl text-sm outline-none focus:border-blue-500 font-bold transition-all"
                                        />
                                    </div>
                                    
                                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-inner h-[400px] flex flex-col">
                                        <div className="bg-gray-100 p-2 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200">
                                            Arama Sonuçları
                                        </div>
                                        <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
                                            {searchTerm.length < 2 && filteredTeachers.length + filteredStudents.length > 50 ? (
                                                <div className="text-center p-4 text-sm font-bold text-gray-400 mt-10">Aramayı daraltmak için en az 2 karakter girin...</div>
                                            ) : (
                                                <>
                                                    {filteredTeachers.filter(u => !(selectedClub.members || []).some((m: any) => m.userId === u.id)).map((u: any) => (
                                                        <div key={u.id} className="flex justify-between items-center p-2 hover:bg-blue-50 rounded-lg transition-colors group">
                                                            <div className="overflow-hidden">
                                                                <div className="font-bold text-sm text-gray-800 truncate">{u.name || u.username}</div>
                                                                <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Öğretmen</div>
                                                            </div>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    setMemberForm({ studentId: u.id, role: 'Üye' });
                                                                    handleAddMemberDirect(u.id, 'Üye');
                                                                }}
                                                                className="bg-gray-100 text-gray-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0"
                                                            >
                                                                Ekle
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {filteredStudents.filter(u => !(selectedClub.members || []).some((m: any) => m.userId === u.id)).map((u: any) => (
                                                        <div key={u.id} className="flex justify-between items-center p-2 hover:bg-green-50 rounded-lg transition-colors group">
                                                            <div className="overflow-hidden">
                                                                <div className="font-bold text-sm text-gray-800 truncate">{u.name || u.username}</div>
                                                                <div className="text-[10px] font-bold text-green-600 uppercase tracking-widest">{u.classLevel || 'Sınıfsız'}</div>
                                                            </div>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    setMemberForm({ studentId: u.id, role: 'Üye' });
                                                                    handleAddMemberDirect(u.id, 'Üye');
                                                                }}
                                                                className="bg-gray-100 text-gray-600 hover:bg-green-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0"
                                                            >
                                                                Ekle
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {filteredTeachers.filter(u => !(selectedClub.members || []).some((m: any) => m.userId === u.id)).length === 0 && 
                                                     filteredStudents.filter(u => !(selectedClub.members || []).some((m: any) => m.userId === u.id)).length === 0 && (
                                                         <div className="text-center p-4 text-sm font-bold text-gray-400 mt-10">Sonuç bulunamadı veya herkes bu kulüpte.</div>
                                                     )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-2">
                                <h4 className="font-black text-gray-800 mb-6 border-b border-gray-200 pb-4 flex justify-between items-center">
                                    <span>Yönetim Kurulu ve Üyeler</span>
                                    <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">{(selectedClub.members || []).length} Üye</span>
                                </h4>
                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {(selectedClub.members || []).length === 0 ? (
                                        <div className="text-center py-10">
                                            <p className="text-gray-500 font-bold text-sm">Kulüpte henüz kayıtlı üye bulunmamaktadır.</p>
                                        </div>
                                    ) : (
                                        (selectedClub.members || []).map((m: any, idx: number) => {
                                            const u = users.find((usr: any) => usr.id === m.userId);
                                            if (!u) return null;
                                            return (
                                                <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-gray-200 hover:border-blue-300 transition-all shadow-sm">
                                                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-black text-gray-600 text-lg">
                                                            {(u.name || u.username).substring(0, 1).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-800 text-sm">{u.name || u.username}</p>
                                                            <p className="font-medium text-gray-400 text-xs mt-0.5">{u.role === 'student' ? `${u.classLevel || 'Sınıf Belirtilmemiş'} - Öğrenci` : 'Öğretmen'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                                        <select
                                                            value={m.role}
                                                            onChange={(e) => handleRoleChange(m.userId, e.target.value)}
                                                            className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                                                        >
                                                            <option value="Üye">Standard Üye</option>
                                                            <option value="Danışman Öğretmen">Danışman Öğretmen</option>
                                                            <option value="Kulüp Başkanı">Kulüp Başkanı</option>
                                                            <option value="Başkan Yardımcısı">Başkan Yardımcısı</option>
                                                            <option value="Sekreter/Muhasip Üye">Sekreter/Muhasip Üye</option>
                                                        </select>
                                                        <button 
                                                            onClick={() => handleRemoveMember(m.userId)}
                                                            className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-xl transition-all"
                                                            title="Üyeyi Çıkar"
                                                        >
                                                            <Trash2 size={16}/>
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
