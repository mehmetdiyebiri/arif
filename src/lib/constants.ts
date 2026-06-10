export const INITIAL_CLASS_DATA = {
  "5A": [ "Ali Çil", "Cemalullah Berksoy", "Akel Özdemir", "Koçay Ömrüuzun", "Belik Beşirik", "Müslime Dulkadir", "Muhaccel Tekerek", "Kaman Öğüt", "Uğurhan Akan", "Şabeddin Deniz yılmaz", "Tahiyye Komi" ],
  "6A": [ "Berat Soy", "Efe Ersöz", "Efe Tunçdoğan", "Ensar Çelik", "Furkan Yiğit Sağlamöz", "Melih Emre Özkaya", "Miraç Erol", "Muhammed Zahid Kahraman", "Mustafa Aykut Cansız", "Onur Kazan", "Osman Talha Aktaş", "Ömer Faruk Nural", "Sefa Tunca", "Yekta Fırat", "Emir Ekrem Akgüğn", "Ensar Baler" ],
  "7A": [ "Abdülkadir Aygün", "Aykut Açgın", "Abdülkadir Yeşilorman", "Behram Ay", "Berat Ata", "Elif Tunçdoğan", "Elif Saliha Güz", "Erkan Arık", "Harun Acarer", "Cahit Kenç", "Kaan Aktı", "Mehmet Ali Genç", "Mehmet Efe Ay", "Şeyma Gündüz", "Umut Karayel" ],
  "8A": [ "Ahmet Berat Çay", "Anıl Özkan Doğru", "Azra Nur Karakaş", "Elif Çetinkaya", "Emine Nur Kadriye Gökaslan", "Ensar Ergezeroğlu", "Hümeyra Tunca", "Muhammed Emin Atik", "Muhammed Selim Karakoç", "Muhammet Ali Meriç", "Mustafa Kavas", "Ravza Nur Yılmaz", "Yiğit Taşkın", "Talha Erdi Aksu" ]
};

export const INITIAL_CATEGORIES = [ "İLETİŞİM", "SORUMLULUK", "VERİMLİ ZAMAN KULLANIMI", "SABIR VE AZİM", "GİRİŞİMCİLİK", "DÜRÜSTLÜK", "ELEŞTİREL DÜŞÜNME", "VATANSEVERLİK VE KÜLTÜREL BAĞLILIK" ];

export const INITIAL_USERS = [ { name: "Sistem Yöneticisi", username: "erdem", password: "123", role: "admin", allowedClasses: [] } ];

export const INITIAL_DEV_CARD_CONFIG = {
    levels: [
        { id: 1, name: "Seviye 1 (Okul İçi)", score: 2, desc: "Kulüp çalışmaları, pano hazırlama, küçük görevler." },
        { id: 2, name: "Seviye 2 (Sosyal & Akademik)", score: 5, desc: "Toplum hizmeti, akran mentorluğu, okul temsilciliği." },
        { id: 3, name: "Seviye 3 (Yerel Yarışmalar)", score: 8, desc: "İlçe ve İl bazlı yarışmalara katılım (spor, sanat, bilim)." },
        { id: 4, name: "Seviye 4 (Ulusal & Prestij)", score: 15, desc: "TEKNOFEST, TÜBİTAK, Türkiye geneli derece." }
    ],
    rubrics: [
        { id: 1, name: "Katılım (Standart)", multiplier: 1, desc: "Görevi yerine getirdi / Yarışmaya katıldı." },
        { id: 2, name: "Başarı (Etkili)", multiplier: 2, desc: "Derece aldı / Görevi dikkat çekici şekilde tamamladı." },
        { id: 3, name: "Öncülük (Mükemmel)", multiplier: 3, desc: "Bir projeyi başlattı / Ekibine liderlik etti." }
    ],
    badges: [
        { id: 1, name: "Toplum Kahramanı", threshold: 15 },
        { id: 2, name: "Geleceğin Mucidi", threshold: 30 },
        { id: 3, name: "Okul Elçisi", threshold: 50 }
    ],
    titles: [
        { id: 1, name: "Yeni Başlayan", threshold: 0, right: "Gelişim yolculuğu başladı." },
        { id: 2, name: "Girişimci Adayı", threshold: 20, right: "Sertifika (Sınıf içi takdir)" },
        { id: 3, name: "Okul Değer Elçisi", threshold: 50, right: "Rozet (Törende takdim)" },
        { id: 4, name: "Altın Katma Değer Sertifikası", threshold: 100, right: "Altın Sertifika ve Okul Onur Kütüğü adaylığı." }
    ]
};

export const INITIAL_FORM_CONFIGS = {
  oralWarning: {
    title: "SÖZLÜ UYARI FORMU",
    content: "Ben {studentName}, {date} tarihinde öğretmenlerim tarafından uygunsuz davranışlarım nedeniyle uyarıldım. Bu davranışlarımın hatalı olduğunu anladım. Olumsuz davranışlarımın yinelenmesi durumunda uygulanabilecek yaptırımlar konusunda Müdür Yardımcımız tarafından bilgilendirildim. Aynı tür davranışlarımı tekrardan yapmayacağıma söz veriyorum."
  },
  tripartite: {
    title: "ÖĞRENCİ-VELİ-OKUL SÖZLEŞMESİ",
    description: "Bu sözleşme; veliyi ve öğrenciyi okulun işleyişi, kuralları, öğrencilere ve velilere sağlayacağı imkânlar ve tarafların karşılıklı hak ve sorumlulukları konusunda bilgilendirmek amacıyla hazırlanmıştır.",
    schoolRights: [
      "Destekleyici, güvenli ve etkili bir ortamda çalışmak",
      "Okul toplumundan ve çevreden saygı ve destek görmek",
      "Okulda alınan tüm kararlara ve okul kurallarına uyulmasını istemek"
    ],
    schoolResponsibilities: [
      "Öğrencilerin akademik ve sosyal gelişimlerini destekleyecek materyal, ekipman ve teknolojik donanım sağlamak.",
      "Okulda olumlu bir kültür yaratmak.",
      "Öğrenci, veli ve çalışanlar arasında hiçbir nedenden dolayı ayrım yapmamak.",
      "Eğitim ve öğretim sürecini okulun duvarlarıyla sınırlamamak.",
      "Öğrencilerin, velilerin ve okul çalışanlarının kendilerini ve fikirlerini ifade edebilecekleri fırsatlar yaratmak.",
      "Okun güvenilir ve temiz olmasını sağlamak.",
      "Öğrenciler için iyi bir model olmak.",
      "Okulun ve öğrencinin ihtiyaçları doğrultusunda sürekli gelişmek.",
      "Okulda etkili öğrenmeyi destekleyecek bir ortam yaratmak.",
      "Okulun işleyişine ait kararların ve kuralların uygulanmasını takip etmek.",
      "Okul - toplum ilişkisini geliştirmek.",
      "Öğretmen, öğrenci ve veli görüşmelerini düzenlemek ve ilgilileri zamanında bilgilendirmek.",
      "Okul çalışanlarının ihtiyaçları doğrultusunda eğitim seminerleri düzenlemek.",
      "Okul çalışanlarının ihtiyaçlarını belirleyerek giderilmesi için çözümler üretmek.",
      "Okulun işleyişi ve yönetimi konusunda ilgili tarafları düzenli aralıklarla bilgilendirmek.",
      "Veli ve öğrenci hakkında ihtiyaç duyulan bilgileri toplamak, değerlendirmek, sonuçlarını ilgililerle paylaşmak ve gizliliğini sağlamak.",
      "Veli toplantılarının belirli aralıklarla ve düzenli olarak yapılmasını sağlamak.",
      "Okul ve çevresinde şiddet içeren davranışlara kesinlikle izin vermemek."
    ],
    studentRights: [
      "Düşüncelerini özgürce ifade etme",
      "Güvenli ve sağlıklı bir okul ve sınıf ortamında bulunma",
      "Bireysel farklılıklarına saygı gösterilmesi",
      "Kendisine ait değerlendirme sonuçlarını zamanında öğrenme ve sonuçlar üzerindeki fikirlerini ilgililerle tartışabilme",
      "Kendisine ait özel bilgilerin gizliliğinin sağlanması",
      "Okulun işleyişi, kuralları, alınan kararlar hakkında bilgilendirilme",
      "Okul kurallarının uygulanmasında tüm öğrencilere eşit davranılması",
      "Kendini ve diğer öğrencileri tanıma, kariyer planlama, karar verme ve ihtiyaç duyduğu benzer konularda danışmanlık alma",
      "Akademik ve kişisel gelişimini destekleyecek ders dışı etkinliklere katılma",
      "Okul yönetiminde temsil etme ve edilme"
    ],
    studentResponsibilities: [
      "Okulda bulunan kişilerin haklarına ve kişisel farklılıklarına saygı göstereceğim.",
      "Ders dışı etkinliklere katılarak ve bu etkinliklerden en iyi şekilde yararlanacağım.",
      "Arkadaşlarımın ve okulun eşyalarına zarar vermeyeceğim; zarar verdiğim takdirde bu zararın bedelini karşılayacağım.",
      "Sınıfça belirlediğimiz kurallara uyacağım.",
      "Okul kurallarına uyacağım.",
      "Okul yönetimine (fikir, eleştiri, öneri ve çalışmalarımla) katkıda bulunacağım.",
      "Arkadaşlarıma, öğretmenlerime ve tüm okul çalışanlarına saygılı davranacağım.",
      "Hiçbir şekilde kaba kuvvete ve baskıya başvurmayacağım."
    ],
    parentRights: [
      "Çocuğumun eğitimiyle ilgili tüm konularda bilgilendirilmek.",
      "Adil ve saygılı davranışlarla karşılanmak",
      "Çocuğuma okul ortamında nitelikli kaynaklar, eğitim ve fırsatlar sunulacağını bilmek.",
      "Düzenli aralıklarla okulun işleyişi hakkında bilgilendirilmek.",
      "Okul yönetimine katılmak.",
      "Çocuğumun okuldaki gelişim süreciyle ilgili olarak düzenli aralıklarla bilgilendirilmek."
    ],
    parentResponsibilities: [
      "Çocuğumun her gün okula zamanında, öğrenmeye hazır, okulun kılık-kıyafet kurallarına uygun bir şekilde gitmesine yardımcı olacağım.",
      "Okulun öğrenciler için düzenleyeceği ders dışı etkinliklerden en az iki tanesinde görev alacağım.",
      "Okulun duyuru ve yayınlarını takip edeceğim.",
      "Bilgi edinmek ve toplamak amacıyla gönderilen her tür anket ve formu doldurup zamanında geri göndereceğim.",
      "Okul Gelişim Yönetim Ekibi (OGYE) ve Okul-Aile Birliği seçimlerine ve toplantılarına katılacağım.",
      "İhtiyaç duyduğunda öğrencimin ödevlerine katkı sağlayacağım, gerekli açıklamaları yapacağım, ancak; kendi yapması gereken ödevleri asla yapmayacağım.",
      "Okumaya, araştırmaya daha fazla zaman ayırması için televizyon seyretme ve oyun oynama saatlerini düzenlemesine yardımcı olacağım.",
      "Evde, o gün okulda yaptıklarını paylaşarak günün değerlendirmesini çocuğumla birlikte yapacağım.",
      "Çocuğumun uyku ve dinlenme saatlerine dikkat edeceğim.",
      "Okulun düzenleyeceği aile eğitim seminerlerine katılacağım.",
      "Çocuğuma yaşına uygun sorumluluklar vereceğim (Örneğin odasını toplama, ev işlerine yardım etme, alışveriş yapma gibi).",
      "Okul yönetiminin okul-aile ilişkilerini geliştirmek amacıyla yapacakları ev ziyaretlerini kabul edeceğim.",
      "Çocuğumun, disiplin kurallarına uyması için gerekli önlemleri alacağım.",
      "Çocuğumun ruhsal ve fiziksel durumundaki değişmeler hakkında okulu zamanında bilgilendireceğim.",
      "Aile ortamında fiziksel ve psikolojik şiddete izin vermeyeceğim."
    ],
    footer: "Sözleşmenin tarafı olarak yukarıda sunulan hak ve sorumluluklarımı okudum. Haklarıma sahip çıkacağıma ve sorumluluklarımı yerine getireceğime söz veririm."
  },
  studentContract: {
    title: "ÖĞRENCİ SÖZLEŞMESİ",
    content: "Ben {studentName}; {date} tarihinde, Öğretmenim....................................................... tarafından bilgilendirildim. Hatalı olduğumu anladım. Olumsuz davranışlarımın yinelenmesi durumunda uygulanabilecek yaptırımlar konusunda bilgilendirildim. Aynı tür davranışı bir kez daha yapmayacağıma söz veriyorum.",
    page2: `
      <div style="font-size: 10px; line-height: 1.2; font-family: 'Times New Roman', Times, serif;">
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid black; padding-bottom: 2px; margin-bottom: 2px;">
          <span>26 Temmuz 2014 CUMARTESİ</span>
          <span style="font-weight: bold; font-size: 14px; color: #800040;">Resmî Gazete</span>
          <span>Sayı : 29072</span>
        </div>
        <div style="text-align: center; border-bottom: 1px solid black; padding-bottom: 5px; margin-bottom: 10px;">
          <h2 style="margin: 5px 0; font-size: 14px;">YÖNETMELİK</h2>
        </div>
        <div style="text-align: center; margin-bottom: 15px;">
          <h3 style="margin: 5px 0; font-size: 12px;">MİLLİ EĞİTİM BAKANLIĞI OKUL ÖNCESİ EĞİTİM VE İLKÖĞRETİM KURUMLARI YÖNETMELİĞİ</h3>
        </div>

        <div style="text-align: center; font-weight: bold; margin-bottom: 10px;">
          YAPTIRIM GEREKTİREN DAVRANIŞLAR<br/>
          Öğrencilerin olumsuz davranışları ve uygulanacak yaptırımlar
        </div>

        <p><strong>MADDE 54 –</strong> (3) (Ek fıkra: 23/10/2014 tarihli ve 29154 sayılı R.G.) Öğrencilerin gelişim dönemleri de dikkate alınarak bilinçlendirme ile düzeltilebilecek davranışlar için “Uyarma” süreci uygulanır. Uyarma bir süreç olup bu süreç aşağıdaki şekilde işler.</p>
        <div style="margin-left: 20px;">
          <p><strong>a) Sözlü uyarma;</strong> öğretmenin öğrenciyle görüşme sürecini oluşturur. Öğrenciden beklenen olumlu davranışın neler olabileceği anlatılır. Olumsuz davranışlarının devamı hâlinde kendisine uygulanabilecek yaptırımlar konusunda uyarılır.</p>
          <p><strong>b) Öğrenci ile sözleşme imzalama;</strong> öğrencinin sözlü uyarılmasına rağmen olumsuz davranışlarını sürdürmesi hâlinde öğrenci ve öğretmen arasında bir görüşme gerçekleştirilir. Bu görüşme sonucunda öğrenci sergilediği olumsuz davranışlarını değiştirmeyi kabul edeceğine ilişkin <strong>Öğrenci Sözleşme Örneği EK-9</strong>’u imzalar.</p>
          <p><strong>c) Veli ile görüşme;</strong> öğretmen, öğrencinin bu olumsuz davranışları sürdürmesi hâlinde veliyi okula davet eder. Okul yöneticilerinden birinin ve varsa rehber öğretmenin de katılımı ile yapılan görüşmede, öğrencinin olumsuz davranışları ve uygulanabilecek yaptırımları veliye bildirilir. Velinin toplantıya gelmemesi durumunda tutanak tutulur. Bu aşamalardan sonra öğrencinin olumsuz davranışlarını sürdürmesi durumunda; öğretmen, yazılı belgelerin bulunduğu dosyayı hazırlayacağı raporla birlikte görüşülmek üzere öğrenci davranışlarını değerlendirme kuruluna verir.</p>
        </div>
        <p>(4) (Ek fıkra: 23/10/2014 tarihli ve 29154 sayılı R.G.) <strong>Kınama;</strong> öğrenciye, yaptırım gerektiren davranışta bulunduğunu ve tekrarından kaçınması gerektiğinin okul yönetimince yazılı olarak bildirilmesidir.</p>
        <p>(5) (Ek fıkra: 23/10/2014 tarihli ve 29154 sayılı R.G.) <strong>Okul değiştirme;</strong> öğrencinin, bir başka okulda öğrenimini sürdürmek üzere bulunduğu okuldan naklen gönderilmesidir.</p>

        <p style="text-align: center; font-weight: bold; margin-top: 15px;">MADDE 55 – (1) Yaptırım gerektiren davranışlar aşağıda belirtilmiştir.</p>
        
        <p><strong>a) Uyarma yaptırımını gerektiren davranışlar:</strong></p>
        <ol style="margin-top: 2px;">
          <li>Derse ve diğer etkinliklere vaktinde gelmemek ve geçerli bir neden olmaksızın bu davranışı tekrar etmek,</li>
          <li>Okula özürsüz devamsızlığını, özür bildirim formu ya da raporla belgelendirmemek, bunu alışkanlık hâline getirmek, okul yönetimi tarafından verilen izin süresini özürsüz uzatmak,</li>
          <li>Yatılı bölge ortaokullarında öğrenci dolaplarını amacı dışında kullanmak, yasaklanmış malzemeyi dolapta bulundurmak ve yönetime bilgi vermeden dolabını başka arkadaşına devretmek,</li>
          <li>Okula, yönetimce yasaklanmış malzeme getirmek ve bunları kullanmak,</li>
          <li>Yalan söylemek,</li>
          <li>Duvarları, sıraları ve okul çevresini kirletmek,</li>
          <li>Görgü kurallarına uymamak,</li>
          <li>Okul kütüphanesinden veya laboratuvarlardan aldığı kitap, araç, gereç ve malzemeyi zamanında teslim etmemek veya geri vermemek,</li>
          <li>Derslerde cep telefonunu açık bulundurmak.</li>
        </ol>

        <p><strong>b) Kınama yaptırımını gerektiren davranışlar:</strong></p>
        <ol style="margin-top: 2px;">
          <li>Yöneticilere, öğretmenlere, görevlilere ve arkadaşlarına kaba ve saygısız davranmak,</li>
          <li>Okulun kurallarını dikkate almayarak kuralları ve ders ortamını bozmak, ders ve ders dışı etkinliklerin yapılmasını engellemek,</li>
          <li>Okul yönetimini yanlış bilgilendirmek, yalan söylemeyi alışkanlık hâline getirmek,</li>
          <li>Okulda bulunduğu hâlde törenlere özürsüz olarak katılmamak ve törenlerde uygun olmayan davranışlarda bulunmak,</li>
          <li>Okulda ya da okul dışında sigara içmek,</li>
          <li>Resmî evrakta değişiklik yapmak,</li>
          <li>Okulda kavga etmek,</li>
          <li>Okul içinde izinsiz görüntü ve ses kaydetmek,</li>
          <li>Başkasının malını haberi olmadan almak,</li>
          <li>Okulun ve öğrencilerin eşya, araç ve gerecine kasıtlı olarak zarar vermek,</li>
          <li>(Değişik: 25/06/2015 tarihli ve 29397 sayılı R.G.) 11) Kılık kıyafetle ilgili kurallara uymamak.</li>
          <li>Okul ile ilgili mekân ve malzemeyi izinsiz ve eğitimin amaçları dışında kullanmak,</li>
          <li>Yatılı bölge ortaokullarında, izinsiz olarak okulu terk etmek ve gece dışarıda kalmak,</li>
          <li>Sınavda kopya çekmek veya kopya vermek.</li>
        </ol>

        <p><strong>c) Okul Değiştirme yaptırımını gerektiren davranışlar:</strong></p>
        <ol style="margin-top: 2px;">
          <li>Anayasanın başlangıcında belirtilen temel ilkelere dayalı millî, demokratik, lâik, sosyal ve hukuk devleti niteliklerine aykırı davranışlarda bulunmak veya başkalarını da bu tür davranışlara zorlamak,</li>
          <li>Sarkıntılık, hakaret, iftira, tehdit ve taciz etmek veya başkalarını bu gibi davranışlara kışkırtmak,</li>
          <li>Okula yaralayıcı, öldürücü aletler getirmek ve bunları bulundurmak,</li>
          <li>Okul ve çevresinde kasıtlı olarak yangın çıkarmak,</li>
          <li>Okul ile ilgili mekân ve malzemeyi izinsiz ve eğitim amaçları dışında kullanmayı alışkanlık hâline getirmek,</li>
          <li>Okul içinde ve dışında; siyasi parti ve sendikaların propagandasını yapmak ve bunlarla ilgili eylemlere katılmak,</li>
          <li>Herhangi bir kurum ve örgüt adına yardım ve para toplamak,</li>
          <li>Kişi veya grupları dil, ırk, cinsiyet, siyasi düşünce ve inançlarına göre ayırmak, kınamak, kötülemek ve bu tür eylemlere katılmak,</li>
          <li>Başkasının malına zarar vermek, haberi olmadan almayı alışkanlık hâline getirmek,</li>
          <li>Okulun bina, eklenti ve donanımlarını, taşınır ve taşınmaz mallarını kasıtlı olarak tahrip etmeyi alışkanlık hâline getirmek,</li>
          <li>Okula, derslere, sınavlara girilmesine, derslerin ve sınavların sağlıklı yapılmasına engel olmak,</li>
          <li>Okul içinde ve dışında okul yöneticilerine, öğretmenlere ve diğer personele ve arkadaşlarına şiddet uygulamak ve saldırıda bulunmak, bu gibi hareketleri düzenlemek veya kışkırtmak,</li>
          <li>Yatılı bölge ortaokullarında, gece izinsiz olarak dışarıda kalmayı alışkanlık hâline getirmek,</li>
          <li>Okul ile ilişiği olmayan kişileri okulda veya okula ait yerlerde barındırmak,</li>
          <li>Kendi yerine başkasının sınava girmesini sağlamak, başkasının yerine sınava girmek,</li>
          <li>Alkol veya bağımlılık yapan maddeleri kullanmak veya başkalarını kullanmaya teşvik etmek,</li>
          <li>Kılık ve kıyafetle ilgili kurallara uymamakta ısrar etmek.</li>
        </ol>
        <div style="text-align: right; margin-top: 10px; font-style: italic;">
          http://mevzuat.meb.gov.tr/dosyalar/1703.pdf
        </div>
      </div>
    `
  }
};

export const INITIAL_BEHAVIOR_CONFIG = {
    forms: INITIAL_FORM_CONFIGS,
    cards: [
        { id: 'white', name: 'BEYAZ KART', score: 10, color: 'bg-white text-gray-800', border: 'border-blue-200', icon: 'Award', compensation: 0, desc: "Üstün başarı ve model davranışlar" },
        { id: 'struggle_pos', name: 'OLUMLU ÖZELLİK', score: 1, color: 'bg-blue-50 text-blue-800', border: 'border-blue-300', icon: 'PlusCircle', compensation: 0, desc: "Sınıf Mücadelesi: Olumlu özellikler" },
        { id: 'struggle_neg', name: 'OLUMSUZ ÖZELLİK', score: -1, color: 'bg-orange-50 text-orange-800', border: 'border-orange-300', icon: 'MinusCircle', compensation: 0, desc: "Sınıf Mücadelesi: Olumsuz özellikler" },
        { id: 'green', name: 'YEŞİL KART', score: -1, color: 'bg-emerald-50 text-emerald-800', border: 'border-emerald-400', icon: 'Meh', compensation: 1, desc: "Küçük ihlal / düzeni bozan davranışlar" },
        { id: 'yellow', name: 'SARI KART', score: -3, color: 'bg-yellow-50 text-yellow-800', border: 'border-yellow-400', icon: 'AlertTriangle', compensation: 3, desc: "Tekrarlayan davranışlar / akışı bozanlar" },
        { id: 'red', name: 'KIRMIZI KART', score: -10, color: 'bg-red-50 text-red-800', border: 'border-red-400', icon: 'AlertOctagon', compensation: 10, desc: "Ciddi ihlal / güvenlik riski / kasıtlı eylemler" }
    ],
    behaviors: {
        'white': [
            { id: 1, text: "Haftalık +20 Puan Başarısı", points: 10, task: "Otomatik Alır", isAuto: true },
            { id: 2, text: "Aylık +50 Puan Başarısı", points: 10, task: "Otomatik Alır", isAuto: true },
            { id: 3, text: "Öğretmen Takdiri", points: 10, task: "Onurlandırma" },
            { id: 4, text: "Görevi Üstün Performansla Yerine Getirme", points: 10, task: "Ödül" },
            { id: 5, text: "Sınıfa/Okula Model Davranış", points: 10, task: "Model Olma" }
        ],
        'struggle_pos': [
            { id: 1, text: "Ayın Değeri Başarısı", points: 1, task: "Ayda maks 3 puan" },
            { id: 2, text: "Başarma Çabası", points: 2, task: "Ders Öğretmeni" },
            { id: 3, text: "Deneme Sınav Başarısı", points: 2, task: "Sıralama Yükseltme" },
            { id: 4, text: "Derse Hazırlıklı Gelme", points: 2, task: "Tam Ekipman" },
            { id: 5, text: "Etkin Katılım", points: 1, task: "Aktif Katılım" },
            { id: 6, text: "Okuma Başarısı (>100 Sayfa)", points: 1, task: "Haftalık Takip" },
            { id: 7, text: "Yönergelere Uyup Kendini Geliştirme", points: 2, task: "Gelişim Takibi" },
            { id: 8, text: "Ödevlerini Özenerek Yapma", points: 1, task: "Özenli Ödev" },
            { id: 9, text: "Öğretmen Puanı", points: 1, task: "Kanaat" }
        ],
        'struggle_neg': [
            { id: 1, text: "Araç Gereç Getirmeme", points: -1, task: "Eksik Malzeme" },
            { id: 2, text: "Ayın Değerine Uyumsuzluk", points: -1, task: "Ayda maks -3" },
            { id: 3, text: "Deneme Sınavı Başarısızlık", points: -2, task: "Sıralama Düşüşü" },
            { id: 4, text: "Devlet Malına Zarar Verme", points: -2, task: "Zarar Tazmini" },
            { id: 5, text: "Derste Başka İşlerle İlgilenme", points: -1, task: "Odak Dağınıklığı" },
            { id: 6, text: "Gayrı Ahlaki Tutumlar", points: -3, task: "Tutum Uyarısı" },
            { id: 7, text: "Okuma İhmali (<40 Sayfa)", points: -1, task: "Zayıf Okuma" },
            { id: 8, text: "Özensiz Ödev", points: -1, task: "Yetersiz Ödev" },
            { id: 9, text: "Saygısızlık", points: -2, task: "Adaba Aykırılık" },
            { id: 10, text: "Sorumsuzluk", points: -2, task: "Görev İhmali" },
            { id: 11, text: "Uyarıları Dikkate Almama", points: -2, task: "Tekrarlanan Hata" },
            { id: 12, text: "Yalan / Yanıltıcı Davranış", points: -2, task: "Dürüstlük İhlali" },
            { id: 13, text: "Zorbalık", points: -2, task: "Akran Baskısı" }
        ],
        'green': [
            { id: 1, text: "Bilerek Derse Geç Kalma", points: -1, task: "Geç Çıkma Cezası" },
            { id: 2, text: "Sırada Başkasının Önüne Geçme", points: -1, task: "Arkaya Geçme" },
            { id: 3, text: "Koridorda Koşma / Gürültü", points: -1, task: "Sözlü Uyarı" },
            { id: 4, text: "Ödevi İlk Kez Yapmama", points: -1, task: "Tahtada Soru Çözme" }
        ],
        'yellow': [
            { id: 1, text: "Yanlışı Herkesin İçinde Tekrar Etme", points: -3, task: "Sunum Yaptırma" },
            { id: 2, text: "Törende Olumsuz Davranış", points: -3, task: "Aktif Görev" },
            { id: 3, text: "Ödevi 2. Kez Yapmama", points: -3, task: "Kütüphane Ödevi" },
            { id: 4, text: "Koridorda Top Sektirme (3. Kez)", points: -3, task: "1 Hafta Men" },
            { id: 5, text: "Ders Zili Sonrası Sınıfa Gelmeme", points: -3, task: "Beden Dersi Kısıtı" }
        ],
        'red': [
            { id: 1, text: "Zorbalık (Ciddi)", points: -10, task: "Çevre Temizliği" },
            { id: 2, text: "Şiddet / Tehdit", points: -10, task: "Veli Bilgilendirme" },
            { id: 3, text: "Uyarılara Rağmen Problem Çıkarma", points: -10, task: "Gezi Kısıtı" },
            { id: 4, text: "Ahlak Dışı Uygunsuz Davranış", points: -10, task: "Disiplin Sevki" }
        ]
    }
};

export const INITIAL_TEACHER_TASK_TYPES = [
    { id: 1, name: "Kurul, Komisyon, İdari Görevler", score: 1, desc: "Toplantı, nöbet vb." },
    { id: 2, name: "Etkinlik, Tören, Gezi", score: 2, desc: "Okul içi sosyal faaliyetler." },
    { id: 3, name: "Proje, Yarışma, Mentörlük", score: 3, desc: "Tübitak, Teknofest, LGS Koçluğu vb." }
];

export const INITIAL_TEACHER_RUBRICS = [
    { id: 1, name: "Yüzeysel", multiplier: 1, desc: "Standart katılım." },
    { id: 2, name: "Etkili", multiplier: 2, desc: "Özenli ve sonuç odaklı." },
    { id: 3, name: "Mükemmel", multiplier: 3, desc: "Örnek teşkil eden, liderlik içeren." }
];

import { YEARLY_TASKS } from './yearlyTasks';

export const INITIAL_TEACHER_YEARLY_TASKS = YEARLY_TASKS.map(task => ({
    id: parseInt(task.id),
    month: task.month,
    task: task.title,
    dateRange: task.date
}));

export const INITIAL_ASSIGNMENT_GROUPS = [
    { id: 'GROUP_OKUL_MUDURU_YRD', name: 'Okul Müdürü, Müdür Yrd.' },
    { id: 'GROUP_OKUL_MUDURU', name: 'Okul Müdürü' },
    { id: 'GROUP_MUDUR_YRD', name: 'Müdür Yrd.' },
    { id: 'GROUP_TUM_SINIF_OGR', name: 'Tüm Sınıf Öğretmenleri' },
    { id: 'GROUP_TUM_OGR', name: 'Tüm Öğretmenler' },
    { id: 'GROUP_TUM_BRANS_OGR', name: 'Tüm Branş Öğretmenler' },
    { id: 'GROUP_TUM_SERVIS_OGR', name: 'Tüm Servis Öğretmenleri' },
    { id: 'GROUP_TUM_KULUP_OGR', name: 'Tüm Kulüp Öğretmenleri' },
    { id: 'GROUP_WEB_YAYIN', name: 'Web Yayın Komisyonu' },
    { id: 'GROUP_SUBE_REHBER_OGR', name: 'Şube Rehber Öğretmenleri' }
];

export const INITIAL_CATEGORY_TASKS = {
  "İLETİŞİM": [ "Selam Verme ve Tanışma: Bir hafta boyunca her gün okulda 5 kişiye selam ver.", "Misafir Karşılama: Sınıfta misafir karşılama senaryosu canlandır.", "Sunum Yapma: Sınıf seviyesine göre bir konuda video sunum hazırla." ],
  "SORUMLULUK": [ "Kişisel Bilgi Formu: Kişisel bilgi formunu eksiksiz doldur ve teslim et.", "Ödev/Neden Defteri Tutma: Bir hafta boyunca ödev defteri tut.", "Sınıf İçi Görev Bilinci: Sınıf nöbeti veya temizlik görevini aksatmadan yap." ],
  "VERİMLİ ZAMAN KULLANIMI": [ "Haftalık Plan Hazırlama: Gerçekçi bir haftalık plan hazırla ve uyumunu takip et.", "Öncelik Belirleme: Günlük yapılacaklar listesi hazırla ve önem sırasına koy.", "Zamanlayıcı ile Çalışma: Bir görevi yaparken zamanlayıcı kullan ve odaklan." ],
  "SABIR VE AZİM": [ "Zorlu Görevde Sebat: Başarısız olduğun konuda pes etmeden tekrar dene.", "Uzun Vadeli Proje: En az bir hafta sürecek bir projeyi tamamla.", "Bekleme Becerisi: Sıra beklerken sabır göster." ],
  "GİRİŞİMCİLİK": [ "Sorun Çözme Önerisi: Okulda gördüğün bir soruna çözüm önerisi geliştir.", "Kaynak Yönetimi: Sınırlı malzemelerle bir ürün ortaya koy.", "Etkinlik Liderliği: Bir grup oyununu veya etkinliği organize et." ],
  "DÜRÜSTLÜK": [ "Öz Eleştiri Yapma: Hatanı kabul et ve telafi etmeye çalış.", "Sözünde Durma: Verdiğin bir sözü yerine getir.", "Akademik Dürüstlük: Ödevlerinde kendi emeğinle üretim yap." ],
  "ELEŞTİREL DÜŞÜNME": [ "Metindeki Çelişkileri Bulma: Bir metni oku ve çelişkili ifadeleri belirle.", "Kanıt Temelli Analiz: Bir konuda bulguları destekleyen kanıtları listele.", "Sorun Analizi Raporu: Bir sorunu analiz et ve çözüm raporu yaz." ],
  "VATANSEVERLİK VE KÜLTÜREL BAĞLILIK": [ "Vatansever Kahraman Tanıtımı: Tarihten bir kahramanı araştır ve tanıt.", "Bölge Tarih ve Kültür Sunumu: Yöresel bir tarih ve kültür sunumu hazırla.", "Kültürel Mirasa Saygı: Bir geleneksel değerimizi araştır ve yaz." ]
};

export const INITIAL_SUCCESS_DESCRIPTIONS = {
  1: "Görevi yüzeysel olarak yerine getirdi.",
  2: "Görevi bilişsel farkındalık oluşma derecesinde yerine getirdi.",
  3: "Uygulama düzeyinde yerine getirdi ama eksikleri var.",
  4: "Uygulama yaptı ama özümseme eksikleri var.",
  5: "Görevi başarıyla gerçekleştirdi. (Tam Başarı)"
};

export const INITIAL_REMEDIAL_PROBLEMS: any = {
  1: "Temel bilgi ve istek eksikliği (Görev hiç başlatılamadı).",
  2: "Yönergeyi tam anlamama (Yanlış veya eksik uygulama yapıldı).",
  3: "Zaman yönetimi hatası (Görev yarım bırakıldı).",
  4: "Özen ve dikkat eksikliği (Sonuç tatmin edici değil).",
  5: "Motivasyon düşüklüğü."
};

export const INITIAL_REMEDIAL_TASKS: any = {
  1: "Konuyla ilgili temel kavramları içeren 1 sayfalık araştırma yap.",
  2: "Konuyla ilgili örnek bir olay incelemesi yap ve raporla.",
  3: "Eksik olunan adımı belirle ve tekrar uygula.",
  4: "Konuyu bilen bir arkadaşınla çalışarak eksiklerini gider.",
  5: "Kendi cümlelerinle konuyu özetleyen bir sunum hazırla."
};

export const INITIAL_UNCOMPLETED_REASONS: any = {
  1: "Görevi unuttuğu veya takip etmediği için yerine getirmedi.",
  2: "Görev için gerekli materyal, zaman veya uygun ev ortamını bulamadığı için yerine getirmedi.",
  3: "Zamanını doğru planlayamadığı ve son ana kadar ertelediği için yerine getirmedi.",
  4: "Göreve karşı ilgi duymadığı ve tamamen isteksiz davrandığı için yerine getirmedi.",
  5: "Görevi umursamadığı ve bilinçli olarak yapmayı reddettiği için yerine getirmedi."
};


