import React from 'react';
import { School, AlertTriangle, X, BookOpen, Heart, Award, Compass, LayoutGrid, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export const Login = ({ state, actions }: any) => {
  const { loginSchoolId, loginCategory, schools, loginUsername, loginPassword, loginError, appTheme, themeColors, appToast } = state;
  const { setLoginSchoolId, setLoginCategory, setLoginUsername, setLoginPassword, handleLogin, setAppTheme, setAppToast } = actions;

  const [isAboutModalOpen, setIsAboutModalOpen] = React.useState(false);
  const [activeAboutTab, setActiveAboutTab] = React.useState('general');

  const filteredChoices = React.useMemo(() => {
    if (loginCategory === 'superadmin') return [{ id: 'superadmin', name: 'Sistem Yöneticisi' }];
    return schools.filter((s: any) => {
      if (loginCategory === 'il') return s.type === 'il';
      if (loginCategory === 'ilce') return s.type === 'ilce';
      return s.type === 'okul' || !s.type; // Fallback for schools without type
    });
  }, [loginCategory, schools]);

  React.useEffect(() => {
    if (loginCategory === 'superadmin') {
      setLoginSchoolId('superadmin');
    } else {
      setLoginSchoolId('');
    }
  }, [loginCategory, setLoginSchoolId]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 selection:bg-blue-100 selection:text-blue-900 font-inter">
      <div className="bg-white p-6 md:p-14 rounded-[48px] shadow-[0_24px_80px_rgba(0,0,0,0.06)] border border-gray-100 w-full max-w-xl animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/15 transition-all hover:scale-110 active:scale-95 cursor-pointer ring-4 ring-white" style={{ backgroundColor: themeColors[appTheme][600] }}>
            <School className="text-white" size={36} />
          </div>
          <h1 className="text-4xl font-[900] tracking-tight mb-2" style={{ color: themeColors[appTheme][900] }}>Arif</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] opacity-80">Maarif Asistanınız</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-gray-500 ml-1">Giriş Kategorisi</label>
              <div className="relative group">
                <select 
                  value={loginCategory} 
                  onChange={(e) => setLoginCategory(e.target.value)} 
                  className="w-full h-14 bg-gray-50 border border-gray-100 px-5 rounded-2xl outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all text-[15px] text-gray-700 font-bold cursor-pointer appearance-none shadow-sm group-hover:bg-gray-100/50"
                >
                  <option value="okul">OKUL GİRİŞİ</option>
                  <option value="ilce">İLÇE MİLLİ EĞİTİM GİRİŞİ</option>
                  <option value="il">İL MİLLİ EĞİTİM GİRİŞİ</option>
                  <option value="superadmin">SİSTEM YÖNETİCİSİ</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-bold text-gray-500 ml-1">Okul / Kurum Seçimi</label>
              <div className="relative group">
                <select 
                  value={loginSchoolId} 
                  onChange={(e) => setLoginSchoolId(e.target.value)} 
                  disabled={loginCategory === 'superadmin'}
                  className={`w-full h-14 border px-5 rounded-2xl outline-none transition-all text-[15px] font-bold appearance-none shadow-sm ${loginCategory === 'superadmin' ? 'bg-gray-100 border-transparent text-gray-400 cursor-not-allowed' : 'bg-gray-50 border-gray-100 text-gray-700 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 cursor-pointer group-hover:bg-gray-100/50'}`}
                >
                  <option value="">-- Seçim Yapınız --</option>
                  {filteredChoices.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  {loginCategory === 'superadmin' && <option value="superadmin">Sistem Yöneticisi</option>}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-gray-500 ml-1">Kullanıcı Adı</label>
                <input 
                  type="text" 
                  value={loginUsername} 
                  onChange={e=>setLoginUsername(e.target.value)} 
                  className="w-full h-14 bg-gray-50 border border-gray-100 px-5 rounded-2xl outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all text-[15px] font-bold text-gray-800 shadow-sm hover:bg-gray-100/50" 
                  autoCapitalize="none" 
                  placeholder="Kullanıcı adınız"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-gray-500 ml-1">Şifre</label>
                <input 
                  type="password" 
                  value={loginPassword} 
                  onChange={e=>setLoginPassword(e.target.value)} 
                  className="w-full h-14 bg-gray-50 border border-gray-100 px-5 rounded-2xl outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all text-[15px] font-bold text-gray-800 shadow-sm hover:bg-gray-100/50" 
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            {loginError && (
              <div className="text-red-500 text-[13px] font-bold bg-red-50 p-4 rounded-2xl flex items-center gap-3 border border-red-100 animate-shake mb-4">
                <AlertTriangle size={18}/> {loginError}
              </div>
            )}
            <button 
              type="submit" 
              className="w-full text-white font-[950] text-sm py-5 rounded-2xl hover:shadow-2xl hover:shadow-blue-500/30 transition-all active:scale-[0.98] shadow-xl shadow-blue-500/15 uppercase tracking-widest" 
              style={{ backgroundColor: themeColors[appTheme][600] }}
            >
              SİSTEME GİRİŞ YAP
            </button>
          </div>
        </form>

        <div className="mt-12 pt-8 border-t border-gray-50">
          <p className="text-center text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Görünüm Teması</p>
          <div className="flex justify-center gap-4 w-max mx-auto p-2 bg-gray-100/50 rounded-full border border-gray-100 shadow-inner">
              {Object.keys(themeColors).map(t => (
                  <button key={t} type="button" onClick={() => setAppTheme(t)} style={{backgroundColor: themeColors[t][600]}} className={`w-8 h-8 rounded-full transition-all relative ${appTheme === t ? 'scale-110 ring-4 ring-white shadow-lg' : 'hover:scale-110 opacity-70 hover:opacity-100'}`} title={t}>
                    {appTheme === t && <div className="absolute inset-0 rounded-full ring-2 ring-blue-500/20 scale-150 animate-pulse"></div>}
                  </button>
              ))}
          </div>
          <div className="mt-6 text-center">
            <button 
              type="button" 
              onClick={() => setIsAboutModalOpen(true)}
              className="text-[14px] font-[800] tracking-wide transition-all duration-300 transform hover:scale-105 select-none hover:underline inline-flex items-center gap-1.5 focus:outline-none cursor-pointer"
              style={{ color: themeColors[appTheme][600] }}
            >
              <Sparkles size={14} />
              <span>Arif Nedir?</span>
            </button>
          </div>
        </div>
      </div>

      {/* Arif Nedir Modal */}
      {isAboutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-[0_32px_96px_rgba(0,0,0,0.16)] border border-gray-100 w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100" style={{ backgroundColor: themeColors[appTheme][50] + '30' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md text-white" style={{ backgroundColor: themeColors[appTheme][600] }}>
                  <School size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-[900] tracking-tight" style={{ color: themeColors[appTheme][900] }}>Arif - Maarif Asistanınız</h2>
                  <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Eğitim & Değerler Gelişim Portalı</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsAboutModalOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-all cursor-pointer border border-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Navigation (Tabs) */}
            <div className="flex border-b border-gray-100 overflow-x-auto bg-gray-50/50 px-4 scrollbar-none">
              {[
                { id: 'general', label: 'Genel Bakış', icon: Sparkles },
                { id: 'necessity', label: 'Neden Gerekli?', icon: Compass },
                { id: 'maarif', label: 'Maarif Modeli Uyumu', icon: ShieldCheck },
                { id: 'modules', label: 'Modüller ve Faydaları', icon: LayoutGrid }
              ].map(tab => {
                const TabIcon = tab.icon;
                const isActive = activeAboutTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveAboutTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-xs font-bold tracking-wide border-b-2 transition-all cursor-pointer whitespace-nowrap focus:outline-none ${
                      isActive 
                        ? 'border-b-4 text-blue-600 font-[850]' 
                        : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                    style={isActive ? { borderColor: themeColors[appTheme][600], color: themeColors[appTheme][600] } : {}}
                  >
                    <TabIcon size={15} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-6">
              {activeAboutTab === 'general' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="max-w-3xl">
                    <h3 className="text-2xl font-[900] tracking-tight mb-4" style={{ color: themeColors[appTheme][900] }}>
                      Eğitimin Yeni Akıllı Asistanı: Arif 
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      <strong>Arif</strong>, çağdaş pedagojik yaklaşımları dijital kolaylıklarla harmanlayan, idarecilerden velilere kadar tüm eğitim paydaşlarını tek çatı altında buluşturan vizyoner bir <strong>Maarif Asistanı</strong> sistemidir. 
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Sadece ders notlarını ve devamsızlığı takip eden geleneksel yazılımların aksine Arif; öğrencilerin ahlaki gelişimini, bireysel yeteneklerini, çoklu zeka profillerini, sosyal sorumluluklarını ve ders dışı kulüp faaliyetlerini yaşayan derinlikli bir <strong>bütüncül gelişim portfolyosuna</strong> dönüştürür.
                    </p>
                  </div>

                  {/* Benefit highlights */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-3">
                      <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                        <CheckCircle2 size={20} />
                      </div>
                      <h4 className="font-extrabold text-[15px] text-gray-900">Bürokrasiyi Sıfırlar</h4>
                      <p className="text-gray-500 text-xs leading-relaxed">
                        Yıllık planlar, kurullar, toplantı karar takipleri ve idari görev atamaları saniyeler içinde planlanır ve otomatik hatırlatıcılarla kontrol edilir.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-3">
                      <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                        <Heart size={20} />
                      </div>
                      <h4 className="font-extrabold text-[15px] text-gray-900 font-inter">Karakter Eğitimini Canlandırır</h4>
                      <p className="text-gray-500 text-xs leading-relaxed">
                        Saygı, dürüstlük, sabır ve vatanseverlik gibi evrensel ve milli değerleri öğrencilere erdem puanları ve sürekli geri bildirimlerle aşılar.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Sparkles size={20} />
                      </div>
                      <h4 className="font-extrabold text-[15px] text-gray-900">Bireysel Odaklı Öğrenme</h4>
                      <p className="text-gray-500 text-xs leading-relaxed">
                        Öğrencilerin baskın zeka eğilimini belirleyip öğretmenlerle paylaşarak ders anlatımını kişiselleştirmeye olanak tanır.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeAboutTab === 'necessity' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <h3 className="text-2xl font-[900] tracking-tight mb-4" style={{ color: themeColors[appTheme][900] }}>
                    Neden Arif'e İhtiyacımız Var?
                  </h3>
                  
                  <div className="border-l-4 pl-4 border-yellow-500 py-1 bg-yellow-50/30 rounded-r-xl">
                    <p className="text-gray-700 text-sm leading-relaxed italic">
                      "Geleneksel eğitim süreçleri, öğrencilerin yalnızca sayısal test skorlarını ölçerek onların ruhsal, ahlaki ve karakteristik potansiyellerini göz ardı edebilmektedir."
                    </p>
                  </div>

                  <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
                    <p>
                      Günümüz eğitim dünyasında okullar sadece birer "bilgi depolama merkezi" olamaz. Öğrencilerin kalbi, zihni ve sosyal becerileri birlikte büyütülmelidir. 
                    </p>
                    <p>
                      <strong>Arif, şu kritik eksiklikleri gidermek amacıyla geliştirilmiştir:</strong>
                    </p>
                    <ul className="list-disc leading-loose pl-6 space-y-2 text-gray-700 font-medium">
                      <li>
                        <strong className="text-gray-900 font-bold">Pasif Veri Tutma Sorunu:</strong> Rehberlik testleri çoğunlukla dosyalanıp rafa kaldırılır. Arif ile öğrencilerin Çoklu Zeka verileri her an branş öğretmenlerinin görebileceği şekilde aktiftir.
                      </li>
                      <li>
                        <strong className="text-gray-900 font-bold">Değerler Eğitiminin Ölçülememesi:</strong> Ahlaki gelişimi somut bir takip mekanizmasına bağlayarak öğrencilerin günlük davranış kalıplarını erdem puanları ile ödüllendirir.
                      </li>
                      <li>
                        <strong className="text-gray-900 font-bold">Veli - Okul Kopukluğu:</strong> Veliler öğrencinin okuldaki sosyal/duygusal yolculuğundan ancak dönem sonu karne gününde haberdar olur. Arif velileri sürecin her anına şeffaf anketler, gelişim kanalları ve ödev takip akışlarıyla entegre eder.
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeAboutTab === 'maarif' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-1 space-y-4">
                      <h3 className="text-2xl font-[900] tracking-tight mb-2" style={{ color: themeColors[appTheme][900] }}>
                        Türkiye Yüzyılı Maarif Modeli ile Kusursuz Uyum
                      </h3>
                      <p className="text-gray-500 text-xs font-extrabold uppercase tracking-widest leading-none mb-4">
                        T.C. Milli Eğitim Bakanlığı Vizyonuyla %100 Uyumlu Dijital Altyapı
                      </p>
                      
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Milli Eğitim Bakanlığı'mızın hayata geçirdiği <strong>"Türkiye Yüzyılı Maarif Modeli"</strong>, insanı ahlaki, zihni, bedeni ve ruhi bütünlüğü içinde ele alan; bilgiyi beceriye dönüştüren ve köklü değerleri evrensel kazanımlarla harmanlayan bir felsefeye dayanır. 
                      </p>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        <strong>Arif, bu modele doğrudan can suyu olan somut bir uygulamadır:</strong>
                      </p>
                    </div>
                    <div className="w-full md:w-64 p-6 rounded-3xl bg-blue-50/50 border border-blue-100 flex flex-col items-center text-center">
                      <Award size={48} className="text-blue-600 mb-3 animate-bounce duration-1000" />
                      <span className="font-black text-xs text-blue-900 uppercase tracking-wider block mb-2">Maarif felsefesi</span>
                      <p className="text-[11px] text-blue-700 leading-normal">
                        "Köklerinden beslenen, göklere uzanan, erdemli ve donanımlı nesiller."
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm space-y-2">
                      <span className="text-xs font-black text-blue-600 tracking-wider uppercase block">1. Kalb-i ve Akl-ı Selim Gelişim (Bütüncül)</span>
                      <p className="text-gray-600 text-[12.5px] leading-relaxed">
                        Sistemdeki <strong>"Değerler Eğitimi ve Davranış Raporları"</strong>, öğrencilerin dürüstlük, vatanseverlik, merhamet ve adaleti birer eyleme dökerek erdemli bireyler olmalarını teşvik eder.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm space-y-2">
                      <span className="text-xs font-black text-blue-600 tracking-wider uppercase block">2. Bireysel Mizaç ve Eğilimlere Saygı</span>
                      <p className="text-gray-600 text-[12.5px] leading-relaxed">
                        Maarif Modelinin "öğrenenin mizaç özelliklerini tanıma" ilkesi, Arif'in barındırdığı <strong>"Öğrenme Stili (Çoklu Zeka)"</strong> modülüyle tam uyumludur. Her çocuğun öğrenme ritmi onurlandırılır.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm space-y-2">
                      <span className="text-xs font-black text-blue-600 tracking-wider uppercase block">3. Okul-Aile Birliği & Etkin Veli Katılımı</span>
                      <p className="text-gray-600 text-[12.5px] leading-relaxed">
                        Ailenin eğitimdeki rolünü güçlendiren model prensibi, sistemin şeffaf <strong>"Veli Memnuniyet Anketi"</strong> ve davranış izleme tablolarıyla somut iş birliğine dönüşür.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm space-y-2">
                      <span className="text-xs font-black text-blue-600 tracking-wider uppercase block">4. Eylem Odaklılık & Sosyal Projeler</span>
                      <p className="text-gray-600 text-[12.5px] leading-relaxed">
                        <strong>"Okul Sosyal Kulüpleri"</strong> modülü, öğrencinin sadece sınıf içinde kalmayıp topluma ve çevreye faydalı değer projeleriyle eyleme geçmesini izler ve belgeler.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeAboutTab === 'modules' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <h3 className="text-2xl font-[900] tracking-tight mb-2" style={{ color: themeColors[appTheme][900] }}>
                    Arif Eko-Sistem Modülleri ve Faydaları
                  </h3>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest leading-none mb-6">
                    Her biri belirli pedagojik hedeflere hizmet eden zengin modül yapısı
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Modül 1 */}
                    <div className="flex gap-4 p-5 rounded-3xl bg-violet-50/40 border border-violet-100">
                      <span className="p-3.5 h-12 w-12 rounded-2xl bg-violet-100 text-violet-700 font-bold flex items-center justify-center shrink-0">1</span>
                      <div className="space-y-1.5">
                        <h4 className="font-extrabold text-[15px] text-violet-950">Öğrenme Stili & Çoklu Zeka</h4>
                        <p className="text-gray-600 text-xs leading-relaxed">
                          Öğrencinin sözel, sayısal, görsel, ritmik, kinestetik, sosyal, içsel ve doğacı zeka eğilimlerini detaylı analiz eder.
                        </p>
                        <span className="text-[10px] font-black text-violet-700 tracking-wider uppercase block pt-1">
                          🎁 FAYDA: Öğretmene sınıfın potansiyel haritasını sunarak doğru yöntemle eğitim yapmasını sağlar.
                        </span>
                      </div>
                    </div>

                    {/* Modül 2 */}
                    <div className="flex gap-4 p-5 rounded-3xl bg-emerald-50/40 border border-emerald-100">
                      <span className="p-3.5 h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">2</span>
                      <div className="space-y-1.5">
                        <h4 className="font-extrabold text-[15px] text-emerald-950">Ödevlendirme & Akademik Takip</h4>
                        <p className="text-gray-600 text-xs leading-relaxed">
                          Dinamik olarak tüm sınıflara veya seçilmiş tek bir öğrenciye özel akademik ödevler verir ve Excel yükleme desteğiyle gelişim karnesi sunar.
                        </p>
                        <span className="text-[10px] font-black text-emerald-700 tracking-wider uppercase block pt-1">
                          🎁 FAYDA: Öğrenme açıklarını kapatıp anlık dijital değerlendirme sunarak sınav başarısını arttırır.
                        </span>
                      </div>
                    </div>

                    {/* Modül 3 */}
                    <div className="flex gap-4 p-5 rounded-3xl bg-blue-50/40 border border-blue-100">
                      <span className="p-3.5 h-12 w-12 rounded-2xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">3</span>
                      <div className="space-y-1.5">
                        <h4 className="font-extrabold text-[15px] text-blue-950">Değerler Eğitimi ve Davranış Takibi</h4>
                        <p className="text-gray-600 text-xs leading-relaxed">
                          Öğrencilerin ahlaki, vatani ve milli değerlerini olumlu pekiştireçler ve "Erdem Puanları" eşliğinde kayıt altına alıp genel panolarda raporlar.
                        </p>
                        <span className="text-[10px] font-black text-blue-700 tracking-wider uppercase block pt-1">
                          🎁 FAYDA: Okuldaki akran çatışmalarını önleyip hoşgörülü ve yardımsever bir eğitim iklimi oluşturur.
                        </span>
                      </div>
                    </div>

                    {/* Modül 4 */}
                    <div className="flex gap-4 p-5 rounded-3xl bg-amber-50/40 border border-amber-100">
                      <span className="p-3.5 h-12 w-12 rounded-2xl bg-amber-100 text-amber-700 font-bold flex items-center justify-center shrink-0">4</span>
                      <div className="space-y-1.5">
                        <h4 className="font-extrabold text-[15px] text-amber-950">Okul Kulüpleri & Toplum Hizmeti</h4>
                        <p className="text-gray-600 text-xs leading-relaxed">
                          Öğrencilerin sosyal yardımlaşma, satranç, çevre, gezi ve sanat kulüplerindeki katılımını, liderlik becerilerini ve sosyal eylemlerini listeler.
                        </p>
                        <span className="text-[10px] font-black text-amber-700 tracking-wider uppercase block pt-1">
                          🎁 FAYDA: Öğrencilerin sosyalleşmesini ve yeteneklerini sahada sergileyebilmesini sağlar.
                        </span>
                      </div>
                    </div>

                    {/* Modül 5 */}
                    <div className="flex gap-4 p-5 rounded-3xl bg-teal-50/40 border border-teal-100">
                      <span className="p-3.5 h-12 w-12 rounded-2xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center shrink-0">5</span>
                      <div className="space-y-1.5">
                        <h4 className="font-extrabold text-[15px] text-teal-950">Veli Anketleri & Katılımcı Yönetim</h4>
                        <p className="text-gray-600 text-xs leading-relaxed">
                          Velilerden yemek kalitesi, eğitim, güvenlik ve ahlaki gelişim başlıklarında şeffaf ve düzenli anketlerle veri toplar.
                        </p>
                        <span className="text-[10px] font-black text-teal-700 tracking-wider uppercase block pt-1">
                          🎁 FAYDA: Okul yönetiminin eksik yönlerini hızla saptayıp veli güvenini tazelemesine imkan tanır.
                        </span>
                      </div>
                    </div>

                    {/* Modül 6 */}
                    <div className="flex gap-4 p-5 rounded-3xl bg-pink-50/40 border border-pink-100">
                      <span className="p-3.5 h-12 w-12 rounded-2xl bg-pink-100 text-pink-700 font-bold flex items-center justify-center shrink-0">6</span>
                      <div className="space-y-1.5">
                        <h4 className="font-extrabold text-[15px] text-pink-950">İdari Planlama & Öğretmen Performansı</h4>
                        <p className="text-gray-600 text-xs leading-relaxed">
                          Yıllık rehberlik faaliyet takvimini dijitalleştirir, toplantı gündemlerini belirler ve idare tarafından öğretmenlere atanan görevleri takip eder.
                        </p>
                        <span className="text-[10px] font-black text-pink-700 tracking-wider uppercase block pt-1">
                          🎁 FAYDA: Adil bir görev dağılımı sağlayarak eğitim kadrosunu koordine ve motive eder.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-end bg-gray-50/50">
              <button
                type="button"
                onClick={() => setIsAboutModalOpen(false)}
                className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-md active:scale-95 transition-all cursor-pointer"
                style={{ backgroundColor: themeColors[appTheme][600] }}
              >
                Anladım, Harika!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
