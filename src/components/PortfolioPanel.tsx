import React, { useState, useEffect, useRef } from 'react';
import { doc, updateDoc, addDoc, collection, onSnapshot, query, setDoc } from "firebase/firestore";
import { db } from '../lib/firebase';
import { Toast } from './ui/Modals';
import { 
  Users, BookOpen, Save, CheckCircle, RefreshCw, Edit2, Loader2, 
  RotateCcw, Search, Briefcase, Activity, ClipboardList, Star, 
  Music, Palette, Dumbbell, Scissors, Layers, Eye, User, Calculator, Leaf, MessageSquare, X, Plus,
  Shield, Brain, Lightbulb, Heart, Trophy, Award
} from 'lucide-react';

export const PortfolioPanel = ({ state, actions }: any) => {
  const { currentUser, classes, selectedStudent: preSelectedStudent, activeSchoolId, devCardData, behaviorLog, devCardConfig, hwProgress, assignments, getBehaviorScore, categories, tasks, evaluations, successDescriptions, remedialTasks, remedialProblems, uncompletedReasons } = state;
  const { setSelectedStudent } = actions;

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved'); 
  const [registeredStudents, setRegisteredStudents] = useState<any[]>([]);
  const [filteredStudentsList, setFilteredStudentsList] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<any>({ message: null, type: 'info' });
  const formChangedRef = useRef(false);
  const autoSaveTimerRef = useRef<any>(null);

  const portCol = activeSchoolId === 'default' ? 'portfolios' : `portfolios_${activeSchoolId}`;

  const showToast = (message: string, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: null, type: 'info' }), 4000);
  };

  const initialFormState = {
    academicYear: '2024-2025', fullName: '', studentNo: '', gender: '', classLevel: '',
    learningStyle: '', interest: '', bestSubject: '', multiIntelligence: '', academicModel: 'Model 2',
    readingRecords: [], totalPageSum: 0, calculatedWeeklyAvg: 0,
    groupCulture: '', groupLanguage: '', skillMusic: '', skillArt: '', skillSports: '', skillHand: '',
    obsPositive: '', obsNegative: '', guidanceNotes: ''
  };

  const [formData, setFormData] = useState<any>(initialFormState);
  const [currentReadingTerm, setCurrentReadingTerm] = useState("1. Hafta (08-12 Eylül)");
  const [currentReadingPage, setCurrentReadingPage] = useState("");
  const [searchQuery, setSearchQuery] = useState('');
  const [activeClassFilter, setActiveClassFilter] = useState('Tümü');
  
  const ratingCriteria = [ "Not Tutma", "Dinleme/Anlama", "Tekrar Yapma", "Soru Çözme", "Akran Çalışması", "Ek Kaynak Kullanımı", "Pekiştirme", "Başarma Çabası" ];
  const initialRatings = ratingCriteria.reduce((acc, item) => ({ ...acc, [item]: 0 }), {});
  const [ratings, setRatings] = useState<any>(initialRatings);

  const learningStyles = [
      { id: 'Sözel-Dilsel', icon: MessageSquare, color: 'blue', label: 'Sözel - Dilsel' },
      { id: 'Mantıksal-Matematiksel', icon: Calculator, color: 'red', label: 'Mantıksal - Mat.' },
      { id: 'Görsel-Uzamsal', icon: Eye, color: 'purple', label: 'Görsel - Uzamsal' },
      { id: 'Müziksel-Ritmik', icon: Music, color: 'pink', label: 'Müziksel - Ritmik' },
      { id: 'Bedensel-Kinestetik', icon: Dumbbell, color: 'orange', label: 'Bedensel - Kines.' },
      { id: 'Kişilerarası-Sosyal', icon: Users, color: 'indigo', label: 'Kişilerarası - Sos.' },
      { id: 'İçsel-Öze Dönük', icon: User, color: 'teal', label: 'İçsel - Öze Dönük' },
      { id: 'Doğacı', icon: Leaf, color: 'green', label: 'Doğacı' },
  ];

  const academicCalendar = [
    { group: "1. Dönem", options: [ "1. Hafta (08-12 Eylül)", "2. Hafta (15-19 Eylül)", "3. Hafta (22-26 Eylül)", "4. Hafta (29 Eylül - 03 Ekim)", "5. Hafta (06-10 Ekim)", "6. Hafta (13-17 Ekim)", "7. Hafta (20-24 Ekim)", "8. Hafta (27-31 Ekim)", "9. Hafta (03-07 Kasım)", "ARA TATİL (10-14 Kasım)", "10. Hafta (17-21 Kasım)", "11. Hafta (24-28 Kasım)", "12. Hafta (01-05 Aralık)", "13. Hafta (08-12 Aralık)", "14. Hafta (15-19 Aralık)", "15. Hafta (22-26 Aralık)", "16. Hafta (29 Aralık - 02 Ocak)", "17. Hafta (05-09 Ocak)", "18. Hafta (12-16 Ocak)" ]},
    { group: "2. Dönem", options: [ "1. Hafta (02-06 Şubat)", "2. Hafta (09-13 Şubat)", "3. Hafta (16-20 Şubat)", "4. Hafta (23-27 Şubat)", "5. Hafta (02-06 Mart)", "6. Hafta (09-13 Mart)", "7. Hafta (16-20 Mart)", "8. Hafta (23-27 Mart)", "ARA TATİL (30 Mart - 03 Nisan)", "9. Hafta (06-10 Nisan)", "10. Hafta (13-17 Nisan)", "11. Hafta (20-24 Nisan)", "12. Hafta (27 Nisan - 01 Mayıs)", "13. Hafta (04-08 Mayıs)", "14. Hafta (11-15 Mayıs)", "15. Hafta (18-22 Mayıs)", "16. Hafta (25-29 Mayıs)", "17. Hafta (01-05 Haziran)", "18. Hafta (08-12 Haziran)", "19. Hafta (15-19 Haziran)" ]}
  ];

  useEffect(() => {
    if (!activeSchoolId) return;
    const q = query(collection(db, portCol));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentsData: any[] = [];
      snapshot.forEach((doc) => studentsData.push({ id: doc.id, ...doc.data() }));
      setRegisteredStudents(studentsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [activeSchoolId]);

  useEffect(() => {
    const masterList: any[] = [];
    Object.entries(classes).forEach(([clsKey, studentNames]: any) => {
        const cleanClass = clsKey.replace('_', '');
        studentNames.forEach((name: string) => {
            masterList.push({ fullName: name, classLevel: cleanClass, source: 'master' });
        });
    });

    const combined = masterList.map(student => {
        const portfolioEntry = registeredStudents.find(p => p.fullName && p.fullName.toLowerCase().trim() === student.fullName?.toLowerCase().trim());
        if (portfolioEntry) return { ...portfolioEntry, ...student, id: portfolioEntry.id, hasData: true };
        return { ...student, hasData: false, studentNo: '' };
    });

    if (activeClassFilter === 'Tümü') setFilteredStudentsList(combined);
    else {
        const filtered = combined.filter(s => s.classLevel === activeClassFilter);
        setFilteredStudentsList(filtered);
    }
  }, [registeredStudents, activeClassFilter, classes]);

  useEffect(() => {
    if (preSelectedStudent && registeredStudents.length > 0) {
        const student = registeredStudents.find(s => s.fullName === preSelectedStudent) || filteredStudentsList.find(s => s.fullName === preSelectedStudent);
        if (student) loadStudentToForm(student);
        else {
            setFormData({ ...initialFormState, fullName: preSelectedStudent });
            showToast(`Yeni kayıt oluşturuluyor: ${preSelectedStudent}`, "info");
            setEditingId(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
  }, [preSelectedStudent]);

  const loadStudentToForm = (student: any) => {
    formChangedRef.current = false; 
    if (student.hasData) {
        const { ratings: studentRatings, id, readingRecords, ...studentData } = student;
        setFormData({ ...initialFormState, ...studentData, readingRecords: readingRecords || [] });
        setRatings(studentRatings || initialRatings);
        setEditingId(id);
        showToast(`✏️ Düzenleniyor: ${student.fullName}`, "info");
    } else {
        setFormData({ ...initialFormState, fullName: student.fullName, classLevel: student.classLevel });
        setRatings(initialRatings);
        setEditingId(null);
        showToast(`🆕 Yeni Kayıt: ${student.fullName}`, "info");
    }
    setCurrentReadingPage("");
    setSearchQuery(student.fullName); 
    setSelectedStudent(student.fullName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setRatings(initialRatings);
    setEditingId(null);
    setSearchQuery('');
    formChangedRef.current = false;
    showToast("Form temizlendi.", "info");
  };

  const handleChange = (e: any) => {
      setFormData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
      formChangedRef.current = true;
  };
  const handleRate = (key: string, val: number) => {
      setRatings((prev: any) => ({...prev, [key]: val}));
      formChangedRef.current = true;
  };

  const handleAddReadingRecord = () => {
      if (!currentReadingPage || parseInt(currentReadingPage) <= 0) {
          showToast("Lütfen geçerli bir sayfa sayısı girin.", "warning");
          return;
      }
      const newRecord = { term: currentReadingTerm, pages: parseInt(currentReadingPage), date: new Date().toISOString() };
      const updatedRecords = [...formData.readingRecords];
      const existingIndex = updatedRecords.findIndex((r: any) => r.term === currentReadingTerm);

      if (existingIndex >= 0) updatedRecords[existingIndex] = newRecord;
      else updatedRecords.push(newRecord);

      setFormData((prev: any) => ({ ...prev, readingRecords: updatedRecords }));
      setCurrentReadingPage("");
      showToast("Okuma kaydı eklendi.", "success");
      formChangedRef.current = true;
  };

  const handleDeleteReadingRecord = (term: string) => {
      setFormData((prev: any) => ({ ...prev, readingRecords: prev.readingRecords.filter((r: any) => r.term !== term) }));
      showToast("Kayıt silindi.", "warning");
      formChangedRef.current = true;
  };

  useEffect(() => {
      const records = formData.readingRecords || [];
      const totalSum = records.reduce((acc: number, curr: any) => acc + (curr.pages || 0), 0);
      const avg = records.length > 0 ? (totalSum / records.length).toFixed(1) : 0;
      setFormData((prev: any) => ({ ...prev, totalPageSum: totalSum, calculatedWeeklyAvg: avg }));
  }, [formData.readingRecords]);

  // --- MANUAL SAVE ---
  const handleSave = async () => {
    if (!formData.fullName) { showToast("❗ İsim bilgisi eksik!", "warning"); return; }
    setIsSaving(true);
    try {
        const userId = currentUser?.id || 'unknown';
        const completeData = { ...formData, ratings, updatedAt: new Date().toISOString(), updatedBy: userId };
        
        const docId = formData.fullName; // Use full name as ID for consistency
        await setDoc(doc(db, portCol, docId), completeData, { merge: true });
        setEditingId(docId);
        showToast("Başarıyla Kaydedildi!", "success");
        
        formChangedRef.current = false;
        setAutoSaveStatus('saved');
    } catch (error) {
        console.error("Kayıt hatası:", error);
        showToast("Bir hata oluştu.", "error");
    } finally { setIsSaving(false); }
  };

  // --- AUTO SAVE LOGIC ---
  useEffect(() => {
    if (!formChangedRef.current || !formData.fullName) return;

    setAutoSaveStatus('unsaved');

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(async () => {
        if (!formData.fullName) return;
        setAutoSaveStatus('saving');
        
        try {
            const userId = currentUser?.id || 'unknown';
            const completeData = { ...formData, ratings, updatedAt: new Date().toISOString(), updatedBy: userId };
            
            const docId = formData.fullName;
            await setDoc(doc(db, portCol, docId), completeData, { merge: true });
            setEditingId(docId);

            setAutoSaveStatus('saved');
            formChangedRef.current = false; 
        } catch (err) {
            console.error("Auto save failed", err);
            setAutoSaveStatus('unsaved');
        }
    }, 2000); 

    return () => clearTimeout(autoSaveTimerRef.current);
  }, [formData, ratings, currentUser, portCol]);

  const inputClasses = "w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all";

  const availableClasses = ['Tümü', ...Object.keys(classes).sort().map(k => k.replace('_', ''))];

  const getCategoryIcon = (category: string) => {
    const norm = (category || "").toUpperCase().trim();
    if (norm.includes("İLETİŞİM")) return MessageSquare;
    if (norm.includes("SORUMLULUK")) return ClipboardList;
    if (norm.includes("ZAMAN")) return Activity;
    if (norm.includes("SABIR") || norm.includes("AZİM")) return Star;
    if (norm.includes("GİRİŞİMCİLİK")) return Lightbulb;
    if (norm.includes("DÜRÜSTLÜK")) return Shield;
    if (norm.includes("DÜŞÜNME") || norm.includes("ELEŞTİREL")) return Brain;
    if (norm.includes("VATANSEVERLİK") || norm.includes("KÜLTÜREL")) return Heart;
    return Layers;
  };

  const getPsychologicalInsight = (category: string, studentName: string) => {
    if (!studentName) {
      return "Öğrenci seçildiğinde gelişim alanına dair analiz raporu burada görüntülenecektir.";
    }

    const studentEvals = evaluations?.[studentName] || {};
    const catEvals = studentEvals[category] || {};
    const catTasks = tasks?.[category] || [];
    
    let yaptiCount = 0;
    let yapmadiCount = 0;
    let yapamadiCount = 0;
    let totalScore = 0;
    let evaluatedCount = 0;
    
    catTasks.forEach((_task: any, idx: number) => {
        const evalData = catEvals[idx];
        if (evalData && evalData.status) {
            evaluatedCount++;
            if (evalData.status === 'YAPTI') yaptiCount++;
            else if (evalData.status === 'YAPMADI') yapmadiCount++;
            else if (evalData.status === 'YAPAMADI') yapamadiCount++;
            totalScore += (evalData.score || 1);
        }
    });
    
    const avgScore = evaluatedCount > 0 ? (totalScore / evaluatedCount) : 0;
    
    // Default fallback if no evaluation has been done yet
    if (evaluatedCount === 0) {
        return "Öğrencinin bu gelişim alanına dair henüz bir değerlendirme verisi bulunmamaktadır. Değerlendirme panelinden veri girildiğinde burada psikolojik eğilim analizi belirecektir.";
    }
    
    const catNorm = category.toUpperCase().trim();
    
    let sentence1 = "";
    let sentence2 = "";
    let sentence3 = "";
    
    // Sentence 1: General tendency description based on status distribution
    if (yaptiCount === evaluatedCount && avgScore >= 4) {
        // High success
        if (catNorm.includes("İLETİŞİM")) {
            sentence1 = `${studentName}, iletişim becerilerinde son derece yapıcı, proaktif ve uyumlu bir liderlik eğilimi sergilemektedir.`;
        } else if (catNorm.includes("SORUMLULUK")) {
            sentence1 = `${studentName}, verilen görevleri sahiplenme ve sorumluluk bilincinde mükemmel bir içsel motivasyon seviyesine sahiptir.`;
        } else if (catNorm.includes("ZAMAN")) {
            sentence1 = `${studentName}, zamanı planlama ve hedefe odaklanma konusunda son derece disiplinli ve öz denetimi yüksek bir profil çizmektedir.`;
        } else if (catNorm.includes("SABIR") || catNorm.includes("AZİM")) {
            sentence1 = `${studentName}, karşılaştığı zorluklar karşısında yılmazlık (resilience) göstererek yüksek bir içsel kararlılık ve azim sergilemektedir.`;
        } else if (catNorm.includes("GİRİŞİMCİLİK")) {
            sentence1 = `${studentName}, yenilikçi fikirler geliştirme ve inisiyatif alma konusunda cesur ve yüksek özgüvenli bir eğilime sahiptir.`;
        } else if (catNorm.includes("DÜRÜSTLÜK")) {
            sentence1 = `${studentName}, etik değerleri ve dürüstlüğü bir yaşam biçimi haline getirmiş, vicdani gelişim düzeyi çok yüksek bir öğrencidir.`;
        } else if (catNorm.includes("DÜŞÜNME") || catNorm.includes("ELEŞTİREL")) {
            sentence1 = `${studentName}, olayları sorgulama, neden-sonuç ilişkilerini analiz etme ve rasyonel muhakeme yeteneğinde çok başarılıdır.`;
        } else if (catNorm.includes("VATANSEVERLİK") || catNorm.includes("KÜLTÜREL")) {
            sentence1 = `${studentName}, toplumsal değerlere, kültürel mirasa ve aidiyet bilincine sahip çıkmada güçlü bir toplumsal duyarlılık sergilemektedir.`;
        } else {
            sentence1 = `${studentName}, ${category.toLowerCase()} değerinde sergilediği mükemmel performansla yüksek bir karakter olgunluğu göstermektedir.`;
        }
    } else if (yaptiCount > 0 && yapamadiCount === 0 && yapmadiCount === 0) {
        // Active participation with average rubrics
        if (catNorm.includes("İLETİŞİM")) {
            sentence1 = `${studentName}, sosyal ortamlarda kendini ifade etme eğiliminde olup, iletişim kanallarını açık tutmaya gayret etmektedir.`;
        } else if (catNorm.includes("SORUMLULUK")) {
            sentence1 = `${studentName}, kendisine verilen rol ve sorumlulukları yerine getirme gayretinde istikrarlı bir tutum izlemektedir.`;
        } else if (catNorm.includes("ZAMAN")) {
            sentence1 = `${studentName}, görevleri tamamlamada zaman sınırlarına uymaya çalışmakta ve temel bir planlama eğilimi taşımaktadır.`;
        } else if (catNorm.includes("SABIR") || catNorm.includes("AZİM")) {
            sentence1 = `${studentName}, önüne çıkan engelleri aşmak için çaba göstermekte ve hedefe ulaşmakta kararlı davranmaktadır.`;
        } else if (catNorm.includes("GİRİŞİMCİLİK")) {
            sentence1 = `${studentName}, yeni durumlara uyum sağlama ve fikirlerini paylaşma konusunda olumlu bir tutum sergilemektedir.`;
        } else if (catNorm.includes("DÜRÜSTLÜK")) {
            sentence1 = `${studentName}, sosyal ilişkilerinde güvenilirliği ön planda tutmakta ve ahlaki değerlere saygı duymaktadır.`;
        } else if (catNorm.includes("DÜŞÜNME") || catNorm.includes("ELEŞTİREL")) {
            sentence1 = `${studentName}, bilgi kaynaklarını analiz etmeye ve önyargısız şekilde yaklaşmaya özen göstermektedir.`;
        } else if (catNorm.includes("VATANSEVERLİK") || catNorm.includes("KÜLTÜREL")) {
            sentence1 = `${studentName}, kültürel ve milli değerlere ilgi duyarak bu konulardaki etkinliklere katılım eğilimi göstermektedir.`;
        } else {
            sentence1 = `${studentName}, ${category.toLowerCase()} alanındaki faaliyetlere uyum sağlamakta ve öğrenme isteği taşımaktadır.`;
        }
    } else if (yapamadiCount > yaptiCount + yapmadiCount) {
        // Mostly "YAPAMADI" (struggling, trying but has obstacles)
        sentence1 = `${studentName}, bu alandaki görevleri yerine getirmede istekli olsa da, çevresel faktörler veya yöntem yetersizliği nedeniyle engellerle karşılaşmaktadır.`;
    } else if (yapmadiCount > yaptiCount + yapamadiCount) {
        // Mostly "YAPMADI" (unwilling, avoidant)
        sentence1 = `${studentName}, bu gelişim alanına ait sorumlulukları üstlenmekten kaçınma veya kayıtsızlık (motivasyon azlığı) eğilimi içindedir.`;
    } else {
        // Mixed evaluation behavior
        sentence1 = `${studentName}, bu alanda dalgalı bir performans sergilemekte; bazı durumlarda yüksek performans gösterirken, bazen de gerileme yaşamaktadır.`;
    }
    
    // Sentence 2: Deeper psychological analysis based on rubric score levels or specific reasons
    if (avgScore >= 4.5) {
        sentence2 = "Üst düzey düşünme ve öz-düzenleme becerileri sayesinde akranlarına da rol model olabilecek bir nitelik taşımaktadır.";
    } else if (avgScore >= 3.5) {
        sentence2 = "Mevcut rubrik düzeyi, kapasitesini istikrarlı şekilde kullanabildiğini ve gelişimini olumlu yönde sürdürdüğünü göstermektedir.";
    } else if (avgScore > 2.0 && yapamadiCount > 0) {
        sentence2 = "Becerilerini sergileme esnasında karşılaştığı metodolojik veya teknik aksaklıklar, özgüvenini olumsuz etkileyebilir.";
    } else if (yapmadiCount > 0) {
        sentence2 = "Eyleme geçiş aşamasında yaşanan erteleme veya ilgi eksikliği, hedeflere ulaşmada bir direnç noktası oluşturmaktadır.";
    } else {
        sentence2 = "Gözlenen temel becerilerin kalıcı alışkanlıklara dönüşebilmesi adına daha fazla pekiştirilmeye ve rehberliğe gereksinimi vardır.";
    }
    
    // Sentence 3: Educational recommendation or psychological tip (actionable guidance)
    if (yapmadiCount > 0) {
        sentence3 = "Öğrenciyle birebir görüşülerek direnç kaynağının tespit edilmesi ve ilgi duyacağı küçük adımlarla göreve teşvik edilmesi önerilir.";
    } else if (yapamadiCount > 0) {
        sentence3 = "Başarısızlık kaygısını azaltmak adına görevlerin daha küçük parçalara bölünmesi ve akran desteğinden yararlanılması faydalı olacaktır.";
    } else if (avgScore >= 4.0) {
        sentence3 = "Gelişiminin devamı için liderlik rolleri verilerek ödüllendirilmesi ve kendisini daha da zorlayacak yeni hedeflerle desteklenmesi yararlıdır.";
    } else {
        sentence3 = "Pozitif geri bildirimlerle motive edilmesi ve düzenli takip mekanizmalarıyla gelişiminin sürdürülebilir kılınması tavsiye edilir.";
    }
    
    return `${sentence1} ${sentence2} ${sentence3}`;
  };

  return (
    <div className="bg-transparent animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
              <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                 <Briefcase size={24} className="text-blue-600"/> Portfolyo Paneli
              </h1>
              {/* Auto Save Indicator */}
              <div className="text-xs font-medium flex items-center gap-1 mt-1 text-gray-500">
                  {autoSaveStatus === 'saved' && <><CheckCircle size={12} className="text-green-500"/> Kaydedildi</>}
                  {autoSaveStatus === 'saving' && <><RefreshCw size={12} className="animate-spin text-blue-500"/> Kaydediliyor...</>}
                  {autoSaveStatus === 'unsaved' && <><Edit2 size={12}/> Değişiklikler var...</>}
              </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleReset} className="flex items-center gap-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                <RotateCcw size={16} /> Formu Temizle
            </button>
            <button onClick={handleSave} disabled={isSaving || loading} className="flex items-center gap-2 px-6 py-2.5 text-sm text-white bg-blue-600 hover:bg-blue-700 font-semibold rounded-xl shadow-sm shadow-blue-200 transition-colors disabled:bg-blue-400">
              {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16} />} {editingId ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </div>

        {/* LİSTELEME */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <div className="mb-5 pb-5 border-b border-gray-100 flex flex-wrap gap-2">
                {availableClasses.map(cls => (
                    <button key={cls} onClick={() => setActiveClassFilter(cls)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeClassFilter === cls ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                        {cls === 'Tümü' ? 'TÜMÜ' : `${cls}`}
                    </button>
                ))}
            </div>
            <div className="flex gap-2 mb-4">
                <div className="relative w-full">
                    <Search className="absolute left-4 top-3 text-gray-400" size={18}/>
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`${inputClasses} pl-11`} placeholder="Listeden öğrenci ara..." />
                </div>
            </div>
            {!loading && (
                <div className="border border-gray-100 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 sticky top-0 md:static">
                            <tr><th className="p-4 border-b border-gray-100">Durum</th><th className="p-4 border-b border-gray-100">Okul No</th><th className="p-4 border-b border-gray-100">Ad Soyad</th><th className="p-4 text-right border-b border-gray-100">İşlem</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                            {filteredStudentsList.filter(s => s.fullName && s.fullName.toLowerCase().includes(searchQuery?.toLowerCase() || '')).map((student, idx) => {
                                const match = student.fullName.match(/^(\d+)\s*[-]\s*(.+)$/);
                                const okulNo = match ? match[1] : '-';
                                const pureName = match ? match[2] : student.fullName;
                                return (
                                <tr key={idx} onClick={() => loadStudentToForm(student)} className={`hover:bg-gray-50 cursor-pointer transition-colors ${editingId === student.id ? 'bg-blue-50/50' : ''}`}>
                                    <td className="p-4">{student.hasData ? <CheckCircle size={16} className="text-green-500"/> : <span className="w-4 h-4 rounded-full bg-gray-200 block"></span>}</td>
                                    <td className="p-4 font-bold text-gray-400">{okulNo}</td>
                                    <td className="p-4 font-semibold text-gray-800">{pureName}</td>
                                    <td className="p-4 text-right text-xs font-bold text-blue-600">{student.hasData ? 'DÜZENLE' : 'OLUŞTUR'}</td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

        {/* SYSTEM DATA SUMMARY */}
        {formData.fullName && (
            <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 rounded-[32px] p-8 mb-8 shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                    <Activity size={240} className="transform rotate-12" />
                </div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                        <User size={28} className="text-blue-300" /> {formData.fullName} <span className="text-sm font-semibold opacity-60 uppercase tracking-widest ml-2 bg-white/10 px-3 py-1 rounded-full">Sistem Özeti</span>
                    </h2>
                    
                    {(() => {
                        const studentUsers = state.users?.filter((u: any) => u.role === 'student' || u.classLevel) || [];
                        const currentStudentUser = studentUsers.find((u: any) => (u.name || u.fullName || '').toLowerCase() === formData.fullName.toLowerCase());
                        const studentId = currentStudentUser ? currentStudentUser.id : null;

                        const totalDevTags = devCardData?.activities?.length || 0;
                        const totalDevScore = devCardData?.activities?.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0) || 0;

                        const totalBehaviorPositive = behaviorLog?.filter((l: any) => !l.isDeleted && l.score > 0).length || 0;
                        const totalBehaviorNegative = behaviorLog?.filter((l: any) => !l.isDeleted && l.score < 0).length || 0;
                        const behaviorScore = getBehaviorScore;

                        let hwCount = 0;
                        let hwCompleted = 0;
                        if (studentId || formData.classLevel) {
                            const classLevel = formData.classLevel;
                            const assignmentsForStudent = (assignments || []).filter((a: any) => {
                                if (!a || !a.classes) return false;
                                return a.classes.some((c: string) => String(c).trim().toLowerCase() === String(classLevel).trim().toLowerCase());
                            });
                            hwCount = assignmentsForStudent.length;
                            hwCompleted = assignmentsForStudent.filter((a: any) => studentId && hwProgress[`${studentId}_${a.id}`]?.completed).length;
                        }
                        
                        let totalEvals = 0;
                        let completedEvals = 0;
                        const studentEvals = state.evaluations?.[formData.fullName] || {};
                        Object.keys(studentEvals).forEach(cat => {
                            const tasksMap = studentEvals[cat] || {};
                            Object.keys(tasksMap).forEach(tId => {
                                totalEvals++;
                                if (tasksMap[tId]?.status === true || tasksMap[tId]?.status === false) {
                                    completedEvals++;
                                }
                            });
                        });

                        return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                                <div className="bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-md hover:bg-white/20 transition-colors">
                                    <div className="flex items-center gap-3 mb-3 text-blue-200">
                                        <Star size={20} />
                                        <h3 className="font-black uppercase tracking-widest text-xs">Gelişim Kartı</h3>
                                    </div>
                                    <div className="text-4xl font-black mb-2 tracking-tight flex items-baseline gap-2">
                                        {totalDevScore} <span className="text-sm font-bold opacity-60 uppercase tracking-wider">PUAN</span>
                                    </div>
                                    <div className="text-sm font-semibold text-blue-200/80">{totalDevTags} Aktivite Kaydı Bulundu</div>
                                </div>
                                
                                <div className="bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-md hover:bg-white/20 transition-colors">
                                    <div className="flex items-center gap-3 mb-3 text-emerald-200">
                                        <Activity size={20} />
                                        <h3 className="font-black uppercase tracking-widest text-xs">Davranış Notu</h3>
                                    </div>
                                    <div className="text-4xl font-black mb-2 tracking-tight flex items-baseline gap-2">
                                        {behaviorScore} <span className="text-sm font-bold opacity-60 uppercase tracking-wider">PUAN</span>
                                    </div>
                                    <div className="text-sm font-semibold text-emerald-200/80">{totalBehaviorPositive} Olumlu, {totalBehaviorNegative} İhlal Kaydı</div>
                                </div>

                                <div className="bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-md hover:bg-white/20 transition-colors">
                                    <div className="flex items-center gap-3 mb-3 text-orange-200">
                                        <BookOpen size={20} />
                                        <h3 className="font-black uppercase tracking-widest text-xs">Akademik Ödevler</h3>
                                    </div>
                                    <div className="text-4xl font-black mb-2 tracking-tight flex items-baseline gap-2">
                                        {hwCompleted} <span className="text-2xl opacity-50">/</span> {hwCount}
                                    </div>
                                    <div className="text-sm font-semibold text-orange-200/80">Tamamlanan Ödev Sayısı</div>
                                </div>

                                <div className="bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-md hover:bg-white/20 transition-colors">
                                    <div className="flex items-center gap-3 mb-3 text-purple-200">
                                        <Layers size={20} />
                                        <h3 className="font-black uppercase tracking-widest text-xs">Görev Değerlendirme</h3>
                                    </div>
                                    <div className="text-4xl font-black mb-2 tracking-tight flex items-baseline gap-2">
                                        {completedEvals} <span className="text-2xl opacity-50">/</span> {Math.max(totalEvals, completedEvals)}
                                    </div>
                                    <div className="text-sm font-semibold text-purple-200/80">Değerlendirilen Görev</div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>
        )}

        {/* FORM */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2"><Users className="text-gray-400" size={20} /><h2 className="font-bold text-gray-800">Kimlik & Akademik Bilgiler</h2></div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Ad Soyad</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className={inputClasses} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Eğitim Yılı</label><select name="academicYear" value={formData.academicYear} onChange={handleChange} className={inputClasses}><option>2024-2025</option><option>2025-2026</option></select></div>
                    <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Öğrenci No</label><input type="text" name="studentNo" value={formData.studentNo} onChange={handleChange} className={inputClasses} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Sınıf</label><select name="classLevel" value={formData.classLevel} onChange={handleChange} className={inputClasses}><option value="">Seçiniz</option>{Object.keys(classes).sort().map(k => <option key={k} value={k.replace('_','')} >{k.replace('_','')}</option>)}</select></div>
                    <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Cinsiyet</label><select name="gender" value={formData.gender} onChange={handleChange} className={inputClasses}><option value="">Seçiniz</option><option>Kız</option><option>Erkek</option></select></div>
                  </div>
                  
                  <div className="col-span-2 pt-4 mt-2 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-6">
                        <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">İlgi Alanları</label><input type="text" name="interest" value={formData.interest} onChange={handleChange} className={inputClasses} placeholder="Örn: Uzay, Futbol"/></div>
                        <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">En Başarılı Ders</label><input type="text" name="bestSubject" value={formData.bestSubject} onChange={handleChange} className={inputClasses} /></div>
                      </div>
                  </div>
                  
                  {/* ÖĞRENME STİLİ */}
                  <div className="col-span-2 pt-4 mt-2 border-t border-gray-100">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Öğrenme Stili (Çoklu Zeka)</label>
                    <div className="grid grid-cols-8 gap-1.5">
                        {learningStyles.map((style) => {
                            const isSelected = formData.learningStyle === style.id;
                            const Icon = style.icon;
                            let activeClass = "";
                            switch(style.color) {
                                case 'blue': activeClass = "border-blue-500 bg-blue-50 text-blue-700"; break;
                                case 'red': activeClass = "border-red-500 bg-red-50 text-red-700"; break;
                                case 'purple': activeClass = "border-purple-500 bg-purple-50 text-purple-700"; break;
                                case 'pink': activeClass = "border-pink-500 bg-pink-50 text-pink-700"; break;
                                case 'orange': activeClass = "border-orange-500 bg-orange-50 text-orange-700"; break;
                                case 'indigo': activeClass = "border-indigo-500 bg-indigo-50 text-indigo-700"; break;
                                case 'teal': activeClass = "border-teal-500 bg-teal-50 text-teal-700"; break;
                                case 'green': activeClass = "border-green-500 bg-green-50 text-green-700"; break;
                                default: activeClass = "border-blue-500 bg-blue-50 text-blue-700";
                            }
                            return (
                                <div 
                                    key={style.id}
                                    onClick={() => {
                                        setFormData((prev: any) => ({ ...prev, learningStyle: style.id }));
                                        formChangedRef.current = true;
                                    }}
                                    className={`cursor-pointer border rounded-[10px] p-1 flex flex-col items-center justify-center text-center transition-all min-h-[105px] h-auto py-2.5 ${isSelected ? `${activeClass} shadow-sm border-2` : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-500'}`}
                                >
                                    <div className={`mb-1.5 ${isSelected ? '' : 'text-gray-400'}`}>
                                        <Icon size={20}/>
                                    </div>
                                    <div className="flex flex-col items-center justify-center leading-snug">
                                        {style.label.split(/\s*-\s*/).map((part: string, idx: number) => (
                                            <span key={idx} className="font-bold text-[12px] sm:text-[13.5px] md:text-[15px] lg:text-[16.5px] xl:text-[17.5px] tracking-tight block">{part}</span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                  </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2"><ClipboardList className="text-gray-400" size={20} /><h2 className="font-bold text-gray-800">Gözlemler & Rehberlik</h2></div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2 block">Pozitif Gözlemler</label><textarea name="obsPositive" value={formData.obsPositive} onChange={handleChange} rows={3} className={`${inputClasses} bg-green-50/30 border-green-100 focus:border-green-400 focus:ring-green-400/10`}></textarea></div>
                        <div><label className="text-xs font-bold text-red-500 uppercase tracking-wide mb-2 block">Gelişim Alanları</label><textarea name="obsNegative" value={formData.obsNegative} onChange={handleChange} rows={3} className={`${inputClasses} bg-red-50/30 border-red-100 focus:border-red-400 focus:ring-red-400/10`}></textarea></div>
                    </div>
                    <div><label className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2 block">Rehberlik Notları</label><textarea name="guidanceNotes" value={formData.guidanceNotes} onChange={handleChange} rows={2} className={`${inputClasses} border-blue-100 focus:border-blue-400 focus:ring-blue-400/10`} placeholder="Öğrenci hakkında özel notlar..."></textarea></div>
                </div>
            </div>

            {/* DEĞERLER VE EĞİLİMLER */}
            {formData.fullName && (
              <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden mt-8">
                <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-pink-50/20 to-transparent">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-500">
                    <Brain size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-pink-950 text-lg leading-tight">Değerler ve Eğilimler (Pedagojik Analiz)</h2>
                    <p className="text-xs text-pink-800/60 font-medium">Değerlendirme rubrik verilerine dayalı psikolojik geri bildirimler ve eğilim notları</p>
                  </div>
                </div>
                
                <div className="p-8 space-y-8 divide-y divide-gray-100">
                  {categories && categories.length > 0 ? (
                    categories.map((cat: string, index: number) => {
                      const CatIcon = getCategoryIcon(cat);
                      const insight = getPsychologicalInsight(cat, formData.fullName);
                      
                      // Task stats for this category
                      const studentEvals = evaluations?.[formData.fullName] || {};
                      const catEvals = studentEvals[cat] || {};
                      const catTasks = tasks?.[cat] || [];
                      
                      let yapCount = 0;
                      let yapmadiCount = 0;
                      let yapamadiCount = 0;
                      let evalSum = 0;
                      let evalTotal = 0;
                      
                      catTasks.forEach((_t: any, idx: number) => {
                        const ev = catEvals[idx];
                        if (ev && ev.status) {
                          evalTotal++;
                          if (ev.status === 'YAPTI') yapCount++;
                          else if (ev.status === 'YAPMADI') yapmadiCount++;
                          else if (ev.status === 'YAPAMADI') yapamadiCount++;
                          evalSum += (ev.score || 1);
                        }
                      });
                      
                      const catAvgScore = evalTotal > 0 ? (evalSum / evalTotal).toFixed(1) : null;
                      const hasEvals = evalTotal > 0;
                      
                      return (
                        <div key={cat} className={`pt-6 first:pt-0 pb-2 ${index > 0 ? 'mt-6' : ''}`}>
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-blue-50/60 border border-blue-100/40 flex items-center justify-center text-blue-600 shrink-0 mt-0.5 shadow-sm">
                                <CatIcon size={22} />
                              </div>
                              <div>
                                <h3 className="font-bold text-[15px] text-gray-800 leading-tight uppercase tracking-wider">{cat}</h3>
                                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                  {hasEvals ? (
                                    <>
                                      <span className="text-[10px] font-black bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md uppercase tracking-wider border border-blue-100/30">
                                        Ort. Rubrik: {catAvgScore}
                                      </span>
                                      <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full border border-green-100/40">
                                        {yapCount} Yaptı
                                      </span>
                                      <span className="text-[10px] font-bold bg-red-50 text-red-700 px-2.5 py-0.5 rounded-full border border-red-100/40">
                                        {yapmadiCount} Yapmadı
                                      </span>
                                      <span className="text-[10px] font-bold bg-orange-50 text-orange-700 px-2.5 py-0.5 rounded-full border border-orange-100/40">
                                        {yapamadiCount} Yapamadı
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-[10px] font-bold bg-gray-50 text-gray-400 px-2 py-0.5 rounded-md uppercase tracking-wider border border-gray-100">
                                      Henüz Görev Değerlendirilmedi
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* QUICK ACTION: COPY INSIGHT TO GUIDANCE */}
                            {hasEvals && (
                              <button
                                onClick={() => {
                                  const currentNotes = formData.guidanceNotes || "";
                                  const textToAppend = `[${cat} Eğilim]: ${insight}`;
                                  if (currentNotes.includes(insight)) {
                                    showToast("Bu analiz zaten rehberlik notlarına eklenmiş.", "warning");
                                    return;
                                  }
                                  const separator = currentNotes ? "\n\n" : "";
                                  setFormData((prev: any) => ({
                                    ...prev,
                                    guidanceNotes: currentNotes + separator + textToAppend
                                  }));
                                  formChangedRef.current = true;
                                  showToast("Analiz başarıyla rehberlik notlarına eklendi! Portfolyoyu güncelleyerek kaydedebilirsiniz.", "success");
                                }}
                                className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest bg-indigo-50 border border-indigo-100/60 hover:border-indigo-200 px-3 py-1.5 rounded-xl transition-all shrink-0 self-start md:self-center cursor-pointer shadow-sm animate-pulse"
                              >
                                Rehberlik Notuna Ekle
                              </button>
                            )}
                          </div>
                          
                          {/* THE PSYCHOLOGICAL INSIGHT TEXT CARD */}
                          <div className={`p-5 rounded-2xl border text-sm leading-relaxed ${hasEvals ? 'bg-gradient-to-br from-amber-50/15 to-indigo-50/10 border-gray-100/80 text-gray-700 font-medium shadow-sm' : 'bg-gray-50 border-gray-100 text-gray-400 italic'}`}>
                            {insight}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-gray-400 text-sm">
                      Kategori ve değerlendirme verileri yüklenemedi.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2"><Activity className="text-gray-400" size={20} /><h2 className="font-bold text-gray-800">Ders İçi Tutum</h2></div>
                 <div className="p-6 space-y-4">
                    {ratingCriteria.map((rc) => (
                        <div key={rc} className="flex justify-between items-center text-sm border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                            <span className="text-gray-600 font-medium">{rc}</span>
                            <div className="flex gap-1">
                                {[1,2,3,4,5].map(s=><button key={s} onClick={()=>handleRate(rc,s)} className="focus:outline-none"><Star size={18} fill={ratings[rc]>=s?"#F59E0B":"none"} className={ratings[rc]>=s?"text-yellow-500":"text-gray-200 transition-colors hover:text-yellow-200"}/></button>)}
                            </div>
                        </div>
                    ))}
                 </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2"><Layers className="text-gray-400" size={20} /><h2 className="font-bold text-gray-800">Beceriler & Gruplar</h2></div>
                 <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Kültür Grubu</label><select name="groupCulture" value={formData.groupCulture} onChange={handleChange} className={inputClasses}><option value="">Seçiniz</option><option>Çırak</option><option>Kalfa</option><option>Usta</option></select></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Dil Grubu</label><select name="groupLanguage" value={formData.groupLanguage} onChange={handleChange} className={inputClasses}><option value="">Seçiniz</option><option>Çırak</option><option>Kalfa</option><option>Usta</option></select></div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100"><Music size={18} className="text-gray-400"/><input type="text" name="skillMusic" value={formData.skillMusic} onChange={handleChange} placeholder="Müzik Yeteneği" className="bg-transparent w-full outline-none text-sm font-medium"/></div>
                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100"><Palette size={18} className="text-gray-400"/><input type="text" name="skillArt" value={formData.skillArt} onChange={handleChange} placeholder="Resim Yeteneği" className="bg-transparent w-full outline-none text-sm font-medium"/></div>
                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100"><Dumbbell size={18} className="text-gray-400"/><input type="text" name="skillSports" value={formData.skillSports} onChange={handleChange} placeholder="Spor Yeteneği" className="bg-transparent w-full outline-none text-sm font-medium"/></div>
                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100"><Scissors size={18} className="text-gray-400"/><input type="text" name="skillHand" value={formData.skillHand} onChange={handleChange} placeholder="El Becerisi" className="bg-transparent w-full outline-none text-sm font-medium"/></div>
                    </div>
                 </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                     <div className="flex items-center gap-2"><BookOpen className="text-gray-400" size={20} /><h2 className="font-bold text-gray-800">Kitap Takibi</h2></div>
                     <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">Top: {formData.totalPageSum} syf</span>
                 </div>
                 <div className="p-4 bg-gray-50 space-y-3">
                    <select value={currentReadingTerm} onChange={(e) => setCurrentReadingTerm(e.target.value)} className={inputClasses}>{academicCalendar.map((t,i) => <optgroup key={i} label={t.group}>{t.options.map(o=><option key={o} value={o}>{o}</option>)}</optgroup>)}</select>
                    <div className="flex gap-2">
                        <input type="number" value={currentReadingPage} onChange={(e)=>setCurrentReadingPage(e.target.value)} placeholder="Sayfa Sayısı" className={`${inputClasses} flex-1`} />
                        <button onClick={handleAddReadingRecord} className="bg-gray-900 text-white px-4 rounded-xl hover:bg-gray-800 transition-colors font-bold"><Plus size={18}/></button>
                    </div>
                 </div>
                 <div className="max-h-[250px] overflow-y-auto">
                    {formData.readingRecords.length === 0 ? <div className="p-6 text-center text-sm text-gray-400">Kayıt yok.</div> : (
                        <table className="w-full text-sm text-left"><tbody className="divide-y divide-gray-50">{formData.readingRecords.map((r: any,i: number)=><tr key={i} className="hover:bg-gray-50 transition-colors"><td className="p-3 pl-6 text-gray-600">{r.term}</td><td className="p-3 font-bold text-gray-900">{r.pages}</td><td className="p-3 text-right pr-6"><button onClick={()=>handleDeleteReadingRecord(r.term)} className="text-gray-400 hover:text-red-500 p-1 transition-colors"><X size={16}/></button></td></tr>)}</tbody></table>
                    )}
                 </div>
              </div>

              {/* PERFORMANS GÖSTERGELERİ (GELİŞİM KARTI AKTİVİTE GEÇMİŞİ) */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
                  <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50/20 to-transparent">
                      <div className="flex items-center gap-2">
                        <Trophy className="text-amber-500 shrink-0" size={20} />
                        <h2 className="font-bold text-gray-800">Performans Göstergeleri</h2>
                      </div>
                      <span className="text-xs font-bold text-gray-400 shrink-0">Gelişim Geçmişi</span>
                  </div>
                  
                  {formData.fullName ? (
                    (() => {
                      const activities = devCardData?.activities || [];
                      
                      const totalDevScore = activities.reduce((acc: number, act: any) => {
                        const l = devCardConfig?.levels?.find((level: any) => level.id.toString() === act.levelId?.toString());
                        const r = devCardConfig?.rubrics?.find((rubric: any) => rubric.id.toString() === act.rubricId?.toString());
                        return acc + (act.score || (l?.score || 0) * (r?.multiplier || 0));
                      }, 0) || 0;

                      const currentTitle = devCardConfig?.titles
                        ? [...devCardConfig.titles]
                            .sort((a: any, b: any) => b.threshold - a.threshold)
                            .find((t: any) => totalDevScore >= t.threshold)
                        : null;

                      if (activities.length === 0) {
                        return (
                          <div className="p-8 text-center text-sm text-gray-400">
                            <Award className="text-gray-300 mx-auto mb-2" size={32} />
                            <p className="font-semibold text-gray-500 text-xs">Aktivite kaydı bulunamadı.</p>
                            <p className="text-[11px] text-gray-405 mt-1 leading-normal">Gelişim kartı panelinde henüz bu öğrenciye ait girilmiş bir performans geçmişi bulunmuyor.</p>
                          </div>
                        );
                      }

                      return (
                        <div className="p-4 space-y-4">
                          {/* Brief Stats Row */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-xl border border-amber-100/30 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-350">
                              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Top. Puan</span>
                              <span className="text-base font-black text-amber-900 mt-1">{totalDevScore} Puan</span>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-xl border border-blue-100/30 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-350">
                              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Aktiviteler</span>
                              <span className="text-base font-black text-blue-900 mt-1">{activities.length} Kayıt</span>
                            </div>
                            {currentTitle && (
                              <div className="col-span-2 p-3 bg-teal-50/30 border border-teal-100/30 rounded-xl flex items-center justify-between animate-in fade-in duration-300">
                                <span className="text-[10px] font-bold text-teal-850 uppercase tracking-wider">Mevcut Unvan</span>
                                <span className="text-xs font-black text-teal-900">{currentTitle.name}</span>
                              </div>
                            )}
                          </div>

                          {/* Beautiful compact activities feed */}
                          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                            {activities.map((act: any, idx: number) => {
                              const level = devCardConfig?.levels?.find((l: any) => l.id.toString() === act.levelId?.toString());
                              const rubric = devCardConfig?.rubrics?.find((r: any) => r.id.toString() === act.rubricId?.toString());
                              const pts = act.score || (level?.score || 0) * (rubric?.multiplier || 0);

                              let levelBadgeColor = "bg-gray-50 text-gray-500 border-gray-100";
                              if (act.levelId?.toString() === "1") levelBadgeColor = "bg-blue-50 text-blue-700 border-blue-100/20";
                              else if (act.levelId?.toString() === "2") levelBadgeColor = "bg-emerald-50 text-emerald-700 border-emerald-100/20";
                              else if (act.levelId?.toString() === "3") levelBadgeColor = "bg-amber-50 text-amber-700 border-amber-100/20";
                              else if (act.levelId?.toString() === "4") levelBadgeColor = "bg-rose-50 text-rose-700 border-rose-100/20";

                              return (
                                <div key={act.id || idx} className="p-3 bg-gray-50/40 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors flex flex-col gap-1.5 animate-in slide-in-from-bottom-2 duration-300">
                                  <div className="flex justify-between items-start gap-2">
                                    <span className="text-[10px] font-semibold text-gray-400 shrink-0">
                                      {act.date ? new Date(act.date).toLocaleDateString('tr-TR') : '-'}
                                    </span>
                                    <span className="text-xs font-black text-emerald-600 shrink-0">
                                      +{pts} Puan
                                    </span>
                                  </div>
                                  
                                  <div className="text-xs font-bold text-gray-800 leading-tight">
                                    {act.description}
                                  </div>

                                  <div className="flex gap-1 flex-wrap items-center mt-0.5">
                                    {level && (
                                      <span className={`text-[9px] font-black border px-1.5 py-0.5 rounded uppercase tracking-wider ${levelBadgeColor}`}>
                                        {level.name}
                                      </span>
                                    )}
                                    {rubric && (
                                      <span className="text-[9px] font-semibold text-gray-500 bg-white border border-gray-100 px-1.5 py-0.5 rounded max-w-[120px] truncate" title={rubric.name}>
                                        {rubric.name}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="p-8 text-center text-sm text-gray-400">
                      <Award className="text-gray-300 mx-auto mb-2" size={32} />
                      <p className="font-semibold text-gray-500 text-xs text-center">Öğrenci seçilmedi.</p>
                      <p className="text-[11px] text-gray-400 mt-1 leading-normal text-center">Bir öğrenci seçtiğinizde gelişim performansı burada listelenecektir.</p>
                    </div>
                  )}
              </div>
          </div>
        </div>

        {/* BOTTOM SAVE BUTTON */}
        <div className="flex justify-end mt-8 pb-8">
             <button onClick={handleSave} disabled={isSaving || loading} className="flex items-center gap-2 px-8 py-3.5 text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-200 transition-all disabled:bg-blue-400 font-bold text-base">
              {isSaving ? <Loader2 size={20} className="animate-spin"/> : <Save size={20} />} {editingId ? 'Portfolyoyu Güncelle' : 'Yeni Kayıt Oluştur'}
            </button>
        </div>

        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: null, type: 'info' })} />
    </div>
  );
};
