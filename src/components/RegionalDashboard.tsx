import React, { useState, useEffect, useRef } from 'react';
import { 
    Shield, School, ArrowRight, Users, GraduationCap, LayoutList, LogOut, 
    BarChart3, AlertTriangle, Activity, AlertCircle, Award, Target, TrendingUp, CheckCircle 
} from 'lucide-react';

export const RegionalDashboard = ({ state, actions }: any) => {
    const { currentUser, schools, schoolStats, activeSchoolId } = state;
    const { setCurrentUser } = actions;

    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
    const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
    const [expandedDistrictId, setExpandedDistrictId] = useState<string | null>(null);
    const selectedSchoolRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedSchoolId && selectedSchoolRef.current) {
            selectedSchoolRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedSchoolId]);

    const currentOrg = schools.find((s: any) => s.id === activeSchoolId);
    const displayTitle = currentOrg ? `${currentUser.name} (${currentOrg.name})` : currentUser.name;

    const myDistricts = schools.filter((s: any) => s.type === 'ilce' && s.parentId === activeSchoolId);

    const mySchools = schools.filter((s: any) => {
        if (currentUser.role === 'provincial_admin') {
            if (s.type && s.type !== 'okul') return false;
            
            const isDirectlyAttached = s.parentId === activeSchoolId;
            const isViaDistrict = s.districtId && schools.find((d: any) => d.id === s.districtId)?.parentId === activeSchoolId;

            const belongsToProvince = isDirectlyAttached || isViaDistrict;
            
            if (selectedDistrictId && selectedDistrictId !== '') {
                return belongsToProvince && s.districtId === selectedDistrictId;
            }
            return belongsToProvince;
        }
        if (currentUser.role === 'district_admin') {
            return (!s.type || s.type === 'okul') && (s.parentId === activeSchoolId || s.districtId === activeSchoolId);
        }
        return false;
    });

    // We can simulate fetching cross-school stats for MEM here (mocking aggregated data for the UI)
    const aggregatedStats = {
        totalStudents: mySchools.reduce((acc: number, s: any) => acc + (schoolStats[s.id]?.studentCount || 0), 0),
        totalTeachers: mySchools.reduce((acc: number, s: any) => acc + (schoolStats[s.id]?.teacherCount || 0), 0),
        avgErdemScore: mySchools.length > 0 ? 88.4 : 0,
        homeworkCompletion: mySchools.length > 0 ? 76.2 : 0
    };

    const riskData = mySchools.map((s: any, idx: number) => {
        const score = 85 - (idx * 20);
        return {
            id: s.id,
            school: s.name,
            riskScore: score > 0 ? score : 15,
            topReason: idx === 0 ? 'Şiddet Eğilimi' : idx === 1 ? 'Devamsızlık' : 'Akademik',
            description: idx === 0 ? '"Okulda dövülme" vakaları yüksek.' : idx === 1 ? 'Ulaşım sorunları sebebiyle devamsızlık.' : 'Ev ödevi tamamlama oranları düşüşte.'
        };
    }).slice(0, 3); // Only show top 3 risks

    const renderSidebar = () => (
        <div className="w-72 bg-white h-screen fixed left-0 top-0 border-r border-gray-100 flex flex-col shadow-sm">
            <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shrink-0">
                    <Shield size={24} />
                </div>
                <div className="overflow-hidden">
                    <h2 className="font-black text-blue-900 leading-tight truncate">{displayTitle}</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{currentUser.role === 'provincial_admin' ? 'İl MEM Paneli' : 'İlçe MEM Paneli'}</p>
                </div>
            </div>

            {currentUser.role === 'provincial_admin' && myDistricts.length > 0 && (
                <div className="px-4 pt-4">
                    <select
                        value={selectedDistrictId || ''}
                        onChange={(e) => {
                            setSelectedDistrictId(e.target.value || null);
                            setSelectedSchoolId(null);
                            setExpandedDistrictId(null);
                        }}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer shadow-sm"
                    >
                        <option value="">Tüm İlçeler & Merkez</option>
                        {myDistricts.map((d: any) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                </div>
            )}

            <nav className="flex-1 p-4 space-y-2">
                <button 
                    onClick={() => { setActiveTab('dashboard'); setSelectedSchoolId(null); setExpandedDistrictId(null); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                    <BarChart3 size={20} /> Yönetici Özeti
                </button>
                <button 
                    onClick={() => { setActiveTab('risk_map'); setSelectedSchoolId(null); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'risk_map' ? 'bg-rose-50 text-rose-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                    <AlertTriangle size={20} className={activeTab === 'risk_map' ? '' : 'text-rose-400'}/> Rehberlik Risk Haritası
                </button>
                <button 
                    onClick={() => { setActiveTab('behavior'); setSelectedSchoolId(null); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'behavior' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                    <Award size={20} className={activeTab === 'behavior' ? '' : 'text-emerald-400'}/> Değerler ve Davranış
                </button>
                <button 
                    onClick={() => { setActiveTab('academic'); setSelectedSchoolId(null); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'academic' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                    <TrendingUp size={20} className={activeTab === 'academic' ? '' : 'text-purple-400'}/> Akademik Eğilim
                </button>
                <button 
                    onClick={() => { setActiveTab('performance'); setSelectedSchoolId(null); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'performance' ? 'bg-amber-50 text-amber-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                    <Users size={20} className={activeTab === 'performance' ? '' : 'text-amber-400'}/> Öğretmen Performans
                </button>
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button 
                    onClick={() => setCurrentUser(null)} 
                    className="w-full flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-red-600 transition-colors bg-gray-50 py-3 rounded-xl border border-gray-200 hover:bg-red-50 hover:border-red-100"
                >
                    <LogOut size={18}/> Güvenli Çıkış
                </button>
            </div>
        </div>
    );

    const renderDashboard = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black text-blue-900">Yönetici Özeti (Makro Dashboard)</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-2 flex items-center gap-2"><School size={14}/> Aktif Okul</div>
                    <div className="text-4xl font-black text-blue-900">{mySchools.length}</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-2 flex items-center gap-2"><GraduationCap size={14}/> Toplam Öğrenci</div>
                    <div className="text-4xl font-black text-blue-900">{aggregatedStats.totalStudents}</div>
                </div>
                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 shadow-sm flex flex-col justify-between">
                    <div className="text-emerald-600 font-bold uppercase tracking-widest text-[10px] mb-2 flex items-center gap-2"><Award size={14}/> Ortalama Erdem Puanı</div>
                    <div className="text-4xl font-black text-emerald-700">{aggregatedStats.avgErdemScore}</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100 shadow-sm flex flex-col justify-between">
                    <div className="text-purple-600 font-bold uppercase tracking-widest text-[10px] mb-2 flex items-center gap-2"><CheckCircle size={14}/> Ödev Tamamlama</div>
                    <div className="text-4xl font-black text-purple-700">%{aggregatedStats.homeworkCompletion}</div>
                </div>
            </div>

            {/* Kritik Alarmlar */}
            <div className="mt-8 bg-rose-50 border border-rose-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-black text-rose-800 mb-4 flex items-center gap-2"><AlertCircle size={20}/> Sistem Alarmları (Otomatik Tespit)</h3>
                <div className="flex flex-col gap-3">
                    <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center shrink-0"><AlertTriangle size={18}/></div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">Şiddet Vakası Artışı</h4>
                            <p className="text-sm text-gray-600">{mySchools[0]?.name || 'Göynük Ortaokulu'}'nda son 1 haftada "akran zorbalığı" bildirimleri %40 arttı.</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0"><AlertCircle size={18}/></div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">Devamsızlık Uyarısı</h4>
                            <p className="text-sm text-gray-600">{mySchools[1]?.name || 'Mudurnu Lisesi'}'nde taşımalı eğitim kaynaklı devamsızlıklar kritik eşiği geçti.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 space-y-8">
                {currentUser.role === 'provincial_admin' && (!selectedDistrictId || selectedDistrictId === '') && myDistricts.length > 0 && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {myDistricts.map((district: any) => {
                            const isExpanded = expandedDistrictId === district.id;
                            const districtSchools = schools.filter((s:any) => s.districtId === district.id && (!s.type || s.type === 'okul') && s.parentId === activeSchoolId);
                            
                            return (
                                <div key={district.id} className="flex flex-col">
                                    <div 
                                        onClick={() => setExpandedDistrictId(isExpanded ? null : district.id)}
                                        className={`p-6 bg-white rounded-3xl border transition-all cursor-pointer flex items-center gap-4 ${isExpanded ? 'border-emerald-300 shadow-md ring-4 ring-emerald-50' : 'border-gray-100 shadow-sm hover:border-emerald-200'}`}
                                    >
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-50 text-emerald-600 shrink-0">
                                            <LayoutList size={24}/>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <h3 className="font-black text-gray-900 text-lg">{district.name}</h3>
                                                <span className="text-[10px] uppercase tracking-widest font-bold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">İLÇE MEM</span>
                                            </div>
                                            <div className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1">
                                                <ArrowRight size={12}/> {currentOrg?.name}
                                            </div>
                                            <div className="text-[11px] text-gray-500 flex flex-wrap items-center gap-x-3 gap-y-1 font-medium">
                                                <span className="flex items-center gap-1"><Users size={14} className="text-gray-400"/> {schoolStats[district.id]?.studentCount || 0} Öğr.</span>
                                                <span className="text-gray-300">•</span>
                                                <span className="flex items-center gap-1"><GraduationCap size={14} className="text-gray-400"/> {schoolStats[district.id]?.teacherCount || 0} Öğrt.</span>
                                                <span className="text-gray-300">•</span>
                                                <span className="flex items-center gap-1"><LayoutList size={14} className="text-gray-400"/> {schoolStats[district.id]?.classCount || 0} Şube</span>
                                                <span className="text-gray-300">•</span>
                                                <span className="flex items-center gap-1"><School size={14} className="text-gray-400"/> {schoolStats[district.id]?.schoolCount || 0} Okul</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {isExpanded && (
                                        <div className="mt-4 ml-6 pl-6 border-l-2 border-emerald-100 space-y-3">
                                            {districtSchools.length === 0 && <div className="text-sm text-gray-400 font-medium py-2">Bu ilçeye kayıtlı okul bulunmuyor.</div>}
                                            {districtSchools.map((school: any) => (
                                                <div key={school.id} onClick={() => setSelectedSchoolId(school.id)} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-colors cursor-pointer">
                                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 shrink-0">
                                                        <School size={20}/>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <h3 className="font-bold text-gray-900">{school.name}</h3>
                                                            <span className="text-[10px] uppercase tracking-widest font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">OKUL</span>
                                                        </div>
                                                        <div className="text-[10px] font-bold text-gray-400 mb-1.5 flex items-center gap-1">
                                                            <ArrowRight size={10}/> {district.name}
                                                        </div>
                                                        <div className="text-[11px] text-gray-500 flex flex-wrap items-center gap-x-2 gap-y-1 font-medium">
                                                            <span className="flex items-center gap-1"><Users size={12} className="text-gray-400"/> {schoolStats[school.id]?.studentCount || 0} Öğr.</span>
                                                            <span className="text-gray-300">•</span>
                                                            <span className="flex items-center gap-1"><GraduationCap size={12} className="text-gray-400"/> {schoolStats[school.id]?.teacherCount || 0} Öğrt.</span>
                                                            <span className="text-gray-300">•</span>
                                                            <span className="flex items-center gap-1"><LayoutList size={12} className="text-gray-400"/> {schoolStats[school.id]?.classCount || 0} Şube</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
                
                {mySchools.length > 0 && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {mySchools.filter((s:any) => {
                            if (currentUser.role === 'provincial_admin') {
                                if (selectedDistrictId && selectedDistrictId !== '') return s.districtId === selectedDistrictId;
                                return !s.districtId; // Merkez okullar
                            }
                            return true;
                        }).map((school: any) => {
                            const parentName = school.districtId ? schools.find((x:any)=>x.id===school.districtId)?.name : currentOrg?.name;
                            return (
                                <div key={school.id} onClick={() => setSelectedSchoolId(school.id)} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:border-blue-200 transition-all flex items-center gap-4 cursor-pointer">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600 shrink-0">
                                        <School size={24}/>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="font-black text-gray-900 text-lg">{school.name}</h3>
                                            <span className="text-[10px] uppercase tracking-widest font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">OKUL</span>
                                        </div>
                                        <div className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1">
                                            <ArrowRight size={12}/> {parentName}
                                        </div>
                                        <div className="text-[11px] text-gray-500 flex flex-wrap items-center gap-x-3 gap-y-1 font-medium">
                                            <span className="flex items-center gap-1"><Users size={14} className="text-gray-400"/> {schoolStats[school.id]?.studentCount || 0} Öğr.</span>
                                            <span className="text-gray-300">•</span>
                                            <span className="flex items-center gap-1"><GraduationCap size={14} className="text-gray-400"/> {schoolStats[school.id]?.teacherCount || 0} Öğrt.</span>
                                            <span className="text-gray-300">•</span>
                                            <span className="flex items-center gap-1"><LayoutList size={14} className="text-gray-400"/> {schoolStats[school.id]?.classCount || 0} Şube</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );

    const renderBehavior = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black text-emerald-900 mb-8 flex items-center gap-3"><Award className="text-emerald-600"/> Değerler Eğitimi ve Davranış Raporları</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex items-center gap-3 bg-emerald-50/50">
                        <TrendingUp size={20} className="text-emerald-600"/>
                        <h3 className="font-extrabold text-emerald-900">En Yüksek Erdem Puanlı Okullar</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {mySchools.map((school: any, i: number) => {
                            const dummyScore = 100 - (i * 8.5); // Mock metric
                            return (
                                <div key={school.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedSchoolId(school.id)}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-600'}`}>{i + 1}</div>
                                        <span className="font-bold text-gray-700">{school.name}</span>
                                    </div>
                                    <div className="font-black text-emerald-600">{dummyScore.toFixed(1)}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2"><CheckCircle size={20} className="text-emerald-500"/> En Çok Sergilenen Olumlu Davranışlar</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                <span className="font-medium text-gray-700">Çevre Temizliğine Katkı</span>
                                <span className="font-bold text-emerald-600 text-sm">342 Bildirim</span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                <span className="font-medium text-gray-700">Arkadaşına Yardım Etme</span>
                                <span className="font-bold text-emerald-600 text-sm">285 Bildirim</span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                <span className="font-medium text-gray-700">Sorumluluklarını Yerine Getirme</span>
                                <span className="font-bold text-emerald-600 text-sm">194 Bildirim</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2"><AlertCircle size={20} className="text-rose-500"/> En Sık Karşılaşılan Disiplin Sorunları</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                <span className="font-medium text-gray-700">Derse Geç Kalma</span>
                                <span className="font-bold text-rose-600 text-sm">156 Vaka</span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                <span className="font-medium text-gray-700">Okul Eşyasına Zarar Verme</span>
                                <span className="font-bold text-rose-600 text-sm">82 Vaka</span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                <span className="font-medium text-gray-700">Sınıf Düzenini Bozma</span>
                                <span className="font-bold text-rose-600 text-sm">64 Vaka</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAcademic = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black text-purple-900 mb-8 flex items-center gap-3"><TrendingUp className="text-purple-600"/> Akademik Eğilim ve Ödev İstatistikleri</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex items-center gap-3 bg-purple-50/50">
                        <CheckCircle size={20} className="text-purple-600"/>
                        <h3 className="font-extrabold text-purple-900">Ödev Tamamlama Oranları</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {mySchools.map((school: any, i: number) => {
                            const dummyRate = 85 - (i * 12.3); // Mock metric
                            return (
                                <div key={school.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedSchoolId(school.id)}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-50 text-purple-600 font-bold text-xs">{i + 1}</div>
                                        <span className="font-bold text-gray-700">{school.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3 w-1/3">
                                        <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                                            <div className="bg-purple-500 h-full" style={{ width: `${dummyRate}%` }}></div>
                                        </div>
                                        <span className="font-black text-purple-600 text-sm">%{dummyRate.toFixed(1)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2"><Target size={24} className="text-blue-500"/> Başarısızlık Nedenleri Kök Analizi</h3>
                    <p className="text-gray-500 text-sm mb-6">"Başarısızlık Nedenleri Anketi" sonuçlarına göre ilçe genelindeki akademik düşüşlerin temel sebepleri.</p>
                    
                    <div className="space-y-5">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-gray-700 font-medium text-sm">Ders Çalışma Ortamım Yok</span>
                                <span className="font-bold text-gray-900 text-sm">%38</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width: '38%'}}></div></div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-gray-700 font-medium text-sm">Sınav Kaygısı Yaşıyorum</span>
                                <span className="font-bold text-gray-900 text-sm">%26</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-indigo-500 h-2 rounded-full" style={{width: '26%'}}></div></div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-gray-700 font-medium text-sm">Temel Bilgi Eksikliğim Var</span>
                                <span className="font-bold text-gray-900 text-sm">%21</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-amber-500 h-2 rounded-full" style={{width: '21%'}}></div></div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-gray-700 font-medium text-sm">Motivasyon Kırıklığı</span>
                                <span className="font-bold text-gray-900 text-sm">%15</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-rose-400 h-2 rounded-full" style={{width: '15%'}}></div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderRiskMap = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3"><AlertTriangle className="text-rose-500"/> Rehberlik ve Psikolojik Risk Haritası</h1>
                <div className="bg-rose-50 text-rose-600 px-4 py-2 rounded-full font-bold text-sm">3 Kritik Bildirim</div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2"><Activity size={20} className="text-rose-500"/> Şiddet ve Akran Zorbalığı Isı Haritası (ŞSA)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {riskData.map(risk => (
                    <div key={risk.id} className={`p-6 rounded-3xl shadow-sm border ${risk.riskScore > 80 ? 'bg-rose-500 border-rose-600 text-white' : risk.riskScore > 50 ? 'bg-orange-50 border-orange-200 text-orange-900' : 'bg-white border-gray-200'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className={`font-black text-xl ${risk.riskScore > 80 ? 'text-white' : 'text-gray-900'}`}>{risk.school}</h3>
                            <div className={`p-2 rounded-xl flex items-center justify-center font-black ${risk.riskScore > 80 ? 'bg-rose-600 text-white' : risk.riskScore > 50 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                                {risk.riskScore}
                            </div>
                        </div>
                        <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${risk.riskScore > 80 ? 'text-rose-200' : 'text-gray-400'}`}>Öncelikli Risk: {risk.topReason}</div>
                        <p className={`font-medium leading-relaxed ${risk.riskScore > 80 ? 'text-rose-100' : 'text-gray-600'}`}>{risk.description}</p>
                        
                        <button onClick={() => { setSelectedSchoolId(risk.id); }} className={`mt-6 w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${risk.riskScore > 80 ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-inner' : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'}`}>
                            Detaylı Raporu İncele <ArrowRight size={16}/>
                        </button>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2"><Target size={24} className="text-blue-500"/> Bölgesel Devamsızlık Nedenleri</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700 font-medium">Ailevi/Tarımsal İşlere Yardım Etme</span>
                            <span className="font-bold text-gray-900">%42</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-4"><div className="bg-blue-500 h-2 rounded-full" style={{width: '42%'}}></div></div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700 font-medium">Okul Yolu Güvenliği Sorunu</span>
                            <span className="font-bold text-gray-900">%28</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-4"><div className="bg-amber-500 h-2 rounded-full" style={{width: '28%'}}></div></div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700 font-medium">Sağlık Sorunları</span>
                            <span className="font-bold text-gray-900">%15</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-gray-400 h-2 rounded-full" style={{width: '15%'}}></div></div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2"><Activity size={24} className="text-indigo-500"/> RİBA (Rehberlik İhtiyacı) Dağılımı</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700 font-medium">Sınav Kaygısı</span>
                            <span className="font-bold text-gray-900">%45</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-4"><div className="bg-indigo-500 h-2 rounded-full" style={{width: '45%'}}></div></div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700 font-medium">Meslek Seçimi Kararsızlığı</span>
                            <span className="font-bold text-gray-900">%30</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-4"><div className="bg-indigo-400 h-2 rounded-full" style={{width: '30%'}}></div></div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700 font-medium">Öfke Kontrolü</span>
                            <span className="font-bold text-gray-900">%25</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-indigo-300 h-2 rounded-full" style={{width: '25%'}}></div></div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPerformance = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black text-amber-900 mb-8 flex items-center gap-3"><Users className="text-amber-600"/> Öğretmen ve Personel Performans Faaliyet Raporu</h1>
            
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="p-4 border-b border-gray-100 font-bold text-gray-400 text-xs uppercase tracking-widest pl-8">Okul Adı</th>
                                <th className="p-4 border-b border-gray-100 font-bold text-gray-400 text-xs uppercase tracking-widest">TÜBİTAK / TEKNOFEST</th>
                                <th className="p-4 border-b border-gray-100 font-bold text-gray-400 text-xs uppercase tracking-widest">Sosyal & Kültürel Faaliyet</th>
                                <th className="p-4 border-b border-gray-100 font-bold text-gray-400 text-xs uppercase tracking-widest">Veli Toplantısı</th>
                                <th className="p-4 border-b border-gray-100 font-bold text-gray-400 text-xs uppercase tracking-widest">Performans Özeti</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {mySchools.map((school: any, idx: number) => {
                                const projects = Math.floor(Math.random() * 5);
                                const events = Math.floor(Math.random() * 12);
                                const meetings = Math.floor(Math.random() * 8);
                                const total = projects * 20 + events * 5 + meetings * 2;
                                return (
                                    <tr key={school.id} className="hover:bg-amber-50/30 transition-colors">
                                        <td className="p-4 pl-8 border-b border-gray-50">
                                            <div className="font-bold text-gray-900">{school.name}</div>
                                        </td>
                                        <td className="p-4 border-b border-gray-50">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                                <span className="font-bold text-gray-700">{projects} Proje Katılımı</span>
                                            </div>
                                        </td>
                                        <td className="p-4 border-b border-gray-50 font-bold text-gray-600">{events} Etkinlik</td>
                                        <td className="p-4 border-b border-gray-50 font-bold text-gray-600">{meetings} Toplantı</td>
                                        <td className="p-4 border-b border-gray-50">
                                            <div className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg inline-block font-black text-sm">
                                                {total} Puan
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                 <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-8 rounded-3xl text-white shadow-lg">
                     <h3 className="font-black text-2xl mb-2">Ayın Okulu: {mySchools.length > 0 ? mySchools[0].name : 'Belirlenmedi'}</h3>
                     <p className="text-white/80 leading-relaxed mb-6">TÜBİTAK projelerinde gösterilen %120'lik artış ve öğretmen sosyal faaliyetlerindeki üstün başarı nedeniyle.</p>
                     <button className="bg-white text-orange-600 font-bold py-3 px-6 rounded-xl shadow-sm hover:scale-105 active:scale-95 transition-all">
                         Tebrik Mesajı Gönder
                     </button>
                 </div>
            </div>
        </div>
    );

    const renderSelectedSchool = () => {
        if (!selectedSchoolId) return null;
        return (
            <div ref={selectedSchoolRef} className="mt-8 bg-blue-50/50 p-8 rounded-3xl border border-blue-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-blue-900">Seçilen Okul: {schools.find((s:any)=>s.id === selectedSchoolId)?.name} </h3>
                </div>
                {schoolStats[selectedSchoolId] ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="p-4 rounded-xl bg-blue-50 text-blue-600">
                                <Users size={24}/>
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-400">Toplam Öğrenci</div>
                                <div className="text-2xl font-black text-gray-900">{schoolStats[selectedSchoolId].studentCount || 0}</div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="p-4 rounded-xl bg-emerald-50 text-emerald-600">
                                <GraduationCap size={24}/>
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-400">Öğretmen Sayısı</div>
                                <div className="text-2xl font-black text-gray-900">{schoolStats[selectedSchoolId].teacherCount || 0}</div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="p-4 rounded-xl bg-purple-50 text-purple-600">
                                <LayoutList size={24}/>
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-400">Şube Sayısı</div>
                                <div className="text-2xl font-black text-gray-900">{schoolStats[selectedSchoolId].classCount || 0}</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-gray-500 flex items-center gap-2 animate-pulse"><Activity size={16}/> Veriler yükleniyor...</div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-inter text-gray-800 flex">
            {renderSidebar()}
            <div className="ml-72 flex-1 p-10 min-h-screen">
                <div className="max-w-6xl mx-auto">
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'behavior' && renderBehavior()}
                    {activeTab === 'academic' && renderAcademic()}
                    {activeTab === 'risk_map' && renderRiskMap()}
                    {activeTab === 'performance' && renderPerformance()}
                    {renderSelectedSchool()}
                </div>
            </div>
        </div>
    );
};

