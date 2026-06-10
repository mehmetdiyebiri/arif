const fs = require('fs');

const text = `
1. Bir yazı yazarken, bir ödev yaparken, yazım (imla) kurallarına dikkat eder misiniz?
2. Bir hikaye kitabını hızlı ve doğru okuyabilir misiniz?
3. Çarpım tablosunu, bölme işlemini kolay öğrenebildiniz mi?
4. Birbirine çok benzeyen iki resmin arasındaki küçük farkları hemen görebilir misiniz?
5. Kelimeleri doğru bir biçimde yazabiliyor ve söyleyebiliyor musunuz?
6. Bir dairenin merkezini doğru bir biçimde tahmin ederek işaretleyebilir misiniz?
7. İki çizgi arsında çok az bir uzunluk farkı olduğunda, bunu kolaylıkla algılayabilir misiniz?
8. Bir parçayı bir kere okuduktan sonra hemen özetleyebiliyor musunuz?
9. Dört işlemle akıldan, hızlı problem çözebilir misiniz?
10. Bir doğru parçasının kaç santimetre olduğunu doğru tahmin edebilir misiniz?
11. Yeni duyduğunuz kelimelerin anlamlarını öğrenmeye çalışır mısınız?
12. Okuduğunuz bir parçada belirten fikirler arsında ilişki kurabiliyor musunuz?
13. Bir matematik probleminin çözüm yolunu öğrendikten sonra, ona benzer problemleri çözebiliyor musunuz?
14. İlk defa gittiğiniz binada yönünüzü bulabiliyor musunuz?
15. Bir defa başkaları ile birlikte gittiğiniz bir yeri, ikinci defa yalnız başına gittiğinizde, kolaylıkla bulabilir misiniz?
16. Gelişigüzel parçaları ayrılmış bir şeklin veya cismin parçalarını eski yerlerine kolaylıkla yerleştirebilir misiniz?
17. Bir makinanın şemasına bakarak makineyi kurabilir misiniz?
18. Açılmış hali verilen geometrik bir cismin, kapandığı zaman açılacağı şekli göz önünde canlandırabilir misiniz?
19. Bir konuda edindiğiniz bilgileri, kendi sözcüklerinizle başkalarına aktarabiliyor musunuz?
20. Sizin düzeyinizde bir matematik kitabını okuyarak bir problemin çözüm yolunu bulabiliyor musunuz?
21. Boş zamanlarınızda, zevk için matematik problemleri çözmeye çalışır mısınız?
22. Bir konuyu söz ve yazı ile anlatırken, fikirleri doğru bir sıra ile verebiliyor musunuz?
23. Matematik dersinde, özel bir yardım (ders) almadan başarılı olabiliyor musunuz?
24. Bir yazıdaki fikir ve ifade hatalarını kolaylıkla görebilir misiniz?
25. Boş bir kesme şeker kutusu, kısa kenarlarından kesilip açılınca hangi yüzeyin nereye geleceğini gözönünde canlandırabilir misiniz?
26. Öğrendiğiniz matematik kurallarına fen bilgisi derslerindeki problemlere uygulayabiliyor musunuz?
27. Bir kağıda, cetvel kullanmadan düzgün paralel çizgiler çizebiliyor musunuz?
28. Karmaşık bir geometrik şeklin, sağa ve sola döndürülmesi ile alacağı durumu gözönünde canlandırabilir misiniz?
29. Bir problemin, size öğretilen çözüm yollarından farklı çözüm yollarını bulabilir misiniz?
30. Akıcı bir üslupla güzel yazı (örneğin bir mektup) yazabilir misiniz?
31. Okuduğunuz bir parçada anlatılan fikirleri bulup özetleyebiliyor musunuz?
32. Sizin düzeyinde, ama daha önce hiç görmediğiniz bir matematik kitabını rahatlıkla okuyabilir misiniz?
33. Bir evin planına baktığınızda, evin yapılmış halini gözönünde canlandırabilir misiniz?
34. Bir kağıda çizilen yıldız biçimindeki bir şekli makasla, düzgün bir biçimde kesip çıkarabilir misiniz?
35. Alet kullanmadan düzgün geometrik şekiller çizebilir misiniz?
36. Attığınız bir bilyeyi veya bir taşı istediğiniz hedefe gönderebilir misiniz?
37. Satranç öğrenmek için çaba sarfediyor musunuz?
38. Fen dersleri ile ilgili konuları kolay öğrenebiliyor musunuz?
39. Desenli kağıtları, şekilleri birbirine tamamlayacak şekilde, yanyana yapıştırabilir misiniz?
40. Bir aletin (örneğin, saatin) çok küçük bir parçasını (vidasını) yerine kolayca yerleştirebilir misiniz?
41. Gelecekte kendinizi, laboratuarda araştırmacı olarak düşlediğiniz oldumu?
42. Bir kente gittiğinizde, müzeleri, tarihi yerleri gezer misiniz? (gezmek ister misiniz)
43. Çeşitli atasözlerinin ve özdeyişlerin nereden çıktığını araştırmak ister misiniz?
44. İnsanların ne düşündüklerini ve ne hissettiklerini incelemekten hoşlanır mısınız?
45. Fen derslerinde öğrendiğiniz ilke ve kuralları evinizdeki sorunların çözümünde kullanır mısınız?
46. Fen dersleri ile ilgili konularda sınıfta öğretilenlerden daha fazla bilgi edinmek için başka kaynaklara başvurduğunuz oluyor mu?
47. Evcil hayvanların veya bitkilerin gelişmelerini incelemekten hoşlanır mısınız?
48. Yeni öğrendiğiniz yabancı dildeki sözcükleri bir cümlede kullanmaya çalışır mısınız?
49. Fen bilgisi ile ilgili problemleri çözmekten hoşlanır mısınız?
50. Deniz dibindeki hayatı gösteren bir filmi ilgi ve dikkatle izler misiniz?
51. Yabancı dildeki kelimeleri kolaylıkla ezberleyebiliyor musunuz?
52. Bir bilyeyi, başka bir bilye ile vurarak, istediğiniz hedefe gönderebilir misiniz?
53. Büyük coğrafya keşiflerini anlatan bir televizyon dizisini izlemekten hoşlanır mısınız?
54. Tarih ve coğrafya derslerinde okutulan konuları kolay öğrenebiliyor musunuz?
55. Bilimsel proje sergilerini gezer misiniz? (Gezmek ister misiniz)
56. İnsanların gazetelerde hangi haberleri merakla okuduklarını araştırmak ister misiniz?
57. Tarih romanları okumaktan hoşlanır mısınız?
58. Televizyonda bilimsel buluşları anlatan belgesel programları izler misiniz?
59. Ünlü bilim adamlarının hayatını anlatan televizyon dizilerini izler misiniz?
60. bir pastayı veya böreği, eşit olarak ve düzgün biçimde kesebilir misiniz?
61. “Çocuklarda yaratıcılık” başlıklı bir makaleyi okumak ister misiniz?
62. Çevrenizdeki insanların davranışlarının nedenlerini merak edip araştırır mısınız?
63. Uzay araçlarının, roketlerin evrimini gösteren bir sergiyi izlemek ister misiniz?
64. Ünlü toplum liderlerinin hayatını anlatan eserleri okumak veya filmleri izlemek ister misiniz?
65. “İnsan hakları” konulu bir ödev hazırlayıp sınıfta sunmak ister misiniz?
66. Küçük bir deliğe, ince bir çubuğu, deliğin kenarına değdirmeden sokabilir misiniz?
67. Küçük bir şeklin (örneğin bir çiçek resminin) içini, dışarı taşırmadan sulu boya ile boyayabilir misiniz?
68. Orta Asya’daki eski uygarlık eserlerini gösteren bir belgesel filmi izlemekten hoşlanır mısınız?
69. Evinizde ipekböceği yetiştirip bakımını üstlenebilir misiniz?
70. Kapı zili, kilit gibi ev aletlerini onarmaya çalışır mısınız?
71. Tahtadan veya metalden oyuncaklar yapabilir misiniz?
72. Yeni çiçek türleri yetiştirmeyi denemek ister misiniz?
73. Bir yabancı turistle, bildiğiniz yabancı dille konuşmaya çalışır mısınız?
74. Gelecekte yabancı dilinizi ilerletip o dilde yazılmış dergi ve kitapları okumayı düşünür müsünüz?
75. “Hayvanat bahçesine getirilen hayvanların yeni çevreye uyum sorunları” konulu bir belgesel filmi ilgi ile izler misiniz?
76. Bir çiftliğin yöneticisi olmayı düşünür müsünüz?
77. Yeni öğrendiğiniz yabancı dildeki sözcükleri doğru biçimde söylemeye gayret eder misiniz?
78. Kaliteli meyve yetiştiren bir üretici olmayı düşünür müsünüz?
79. Bir aleti parçalara ayırıp tekrar birleştirebilir misiniz?
80. Evcil hayvanların hangi koşullarda ve ortamda daha iyi geliştiklerini incelemekten hoşlanır mısınız?
81. Yeni bir alet veya makine ile karşılaştığınızda, hemen onun nasıl çalıştığını öğrenmeye çalışır mısınız?
82. Evde bir hayvan (kuş) besler, bakımını yapar mısınız?
83. Saksıda ve bahçede çiçek yetiştirip bakımını üstlenir misiniz?
84. Elektrikli aletlerin nasıl işlediklerini inceler misiniz?
85. Havuzlarda balık üretme yöntemlerini gösteren bir filmi ilgi ile izler misiniz?
86. Her türlü araç ve gereç sağlansa, bir kafes yapmayı dener misiniz?
87. İnanç ve düşüncelerinizi başkalarına kolaylıkla aktarabilir misiniz?
88. Tartışmalarda güçlü kanıtlar bularak, görüşünüzü karşınızdakilere kabul ettirebilir misiniz?
89. Belleğiniz kuvvetli midir?
90. İnsanların daha çok hangi malları almak istediklerini öğrenmeye çalışır mısınız?
91. Model uçak yapmaya çalışır mısınız?
92. Arkadaşlarınız arasındaki çatışmaların çözümünde arabuluculuk yapar mısınız?
93. Bir yazıdaki hataları düzeltmekten, bir hesabı kontrol etmekten hoşlanır mısınız?
94. Yaptığınız herhangi bir işin temiz ve özenli olması için gereken özeni gösterir misiniz?
95. Bir makinanın, örneğin bir elektrik motorunun, evrimini gösteren bir sergiyi gezmek ister misiniz?
96. Çevrenizde “Hazırcevap” bir kişi olarak tanınır mısınız?
97. Okul kantini ya da kooperatifini yönetmek ister misiniz?
98. Bir işin ince ayrıntıları ile uğraşır mısınız?
99. Paranızı nerelerde harcadığınızın kaydını tutar mısınız?
100. Anılarınızı yazar mısınız?
101. Yaz aylarında bir dükkanda ya da ticarethanede çalışmak ister misiniz?
102. Derslerinize günü gününe çalışır mısınız?
103. Okulda şiir okuma yarışmaları düzenleyen bir grubun üyesi olmak ister misiniz?
104. Mektuplarınızı eski okul karnelerinizi tarih sırasına koyup saklar mısınız?
105. Aldığınız her şeyin ya da yaptığınız her işin düzenli bir biçimde kaydını tutar mısınız?
106. Yabancı dil kurslarına gitmek ister misiniz?
107. Bir makinanın çalışmasını geliştirici yöntemler düşünür müsünüz?
108. Söz ve davranışlarınızın başkaları üzerindeki etkilerini öğrenmeye çalışır mısınız?
109. Konuşurken çevrenizdeki insanların ilgisini çekebilir ve görüşlerinizi onlara kabul ettirebilir misiniz?
110. Televizyondaki reklamların daha iyi nasıl yapılabileceği üzerinde araştırma yapan bir grubun içinde yer almak ister misiniz?
111. Evleri dolaşıp bir malın tanıtımını yapmaktan hoşlanır mısınız?
112. Ödevlerinizi zamanında ve düzgün biçimde yapar mısınız?
113. Televizyonda veya radyoda şiir saatlerini izler misiniz?
114. Kendini gelecekte bir yazar olarak düşlediğiniz olur mu?
115. Yaptığınız her hangi bir şeyi özenle süsler misiniz?
116. Küçük hikayeler yazmayı dener misiniz?
117. Ünlü sanatçıların, ressamların hayatını merak eder misiniz?
118. Çevrenizdeki çeşitli makinaların bakımını yapar, onları bozmadan kullanabilir misiniz?
119. Sizin gibi düşünmeyen insanları ikna etmek için uzun tartışmalara girer misiniz?
120. Çevrenizdeki eşyaların, ürünlerin, satılsalar kaç lira edeceklerini düşünür müsünüz?
121. Eşyalarınızı yerli yerine koyar, çevrenizi düzenli tutar mısınız?
122. Bir malı satmak için neler yapmak gerektiğini öğreten bir kursa katılmak ister misiniz?
123. Gazete, boş şişe gibi kullanılmış şeyleri satarak para kazanmayı düşünür müsünüz?
124. Yabancı dilde şarkı söylemeye özenir misiniz?
125. Mektupları zamanında cevaplandırır mısınız?
126. Bir şeyi satın alacağınız zaman çeşitli dükkanları dolaşıp fiyatları karşılaştırarak gereğini duyar mısınız?
127. Bir aleti, tarifesine ve şemasına bakarak çalıştırabilir misiniz?
128. Güzel konuşma ve başkalarını ikna edebilme gücünü geliştirici kurslara katılmak ister misiniz?
129. Arkadaşlarınıza ciklet, çikolata, bilye vb. şeyler sattınız mı?
130. Gelecekte kendinizi bir tüccar olarak düşlediğiniz olur mu?
131. Roman, hikaye veya şiir okur musunuz?
132. Boş vakitlerinizde çiçek, nakış, resim, heykel vb. yapar mısınız?
133. Radyo ve televizyonda müzik programlarını isler misiniz?
134. Müzik yarışmalarına katılmak ister misiniz?
135. Televizyonda resim sanatı ile ilgili haberleri ilgi ile izler misiniz?
136. Gittiğiniz bir kentte sanat galerilerini, resim sergilerini gezmek ister misiniz?
137. Ağlayan bir çocuğu oyalayabilir misiniz?
138. Yaşlılar yurdunda eğlence günleri düzenlemekten hoşlanır mısınız?
139. Başkalarına kişisel sorunların çözümünde yardımcı olabiliyor musunuz?
140. Çocuk gürültüsüne katlanabilir misiniz?
141. Belli bir anda pek çok şeye birden dikkat edebilir misiniz?
142. Kompozisyon derslerinde başarılı mısınız?
143. Okul gazetesine yazı yazar mısınız? (Yazmak ister misiniz?)
144. Müzik dersleri alıyor musunuz veya almak ister misiniz?
145. Bir müzik aleti çalar mısınız?
146. Bir hastaya bakabilir, ilaçlarını zamanında verebilir misiniz?
147. Resim ve mimarlık sanatının gelişimini anlatan bir kitabı zevkle okur musunuz?
148. Bir hastanede, yaz aylarında gönüllü olarak çalışmak ister misiniz?
149. Boş vakitlerinizi resim veya el işleri yaparak geçirmeye çalışır mısınız?
150. Konuştuğunuz zaman kendinizi çevrenizdeki insanlara dinletebiliyor musunuz?
151. Karşınızdaki insanların ne düşündükleri ve ne hissettiklerini anlayabilir misiniz.
152. Müzik aletleri sergisini gezmek ister misiniz?
153. Çeşitli ülkelerin halk şarkılarını tanıtan bir program izler misiniz?
154. Hastalar ve yaşlılara kitap okumaktan hoşlanır mısınız?
155. Küçük çocuklara oyun öğretmekten, onlara şarkı söylemekten hoşlanır mısınız?
156. İmkanlarınız ölçüsünde konserlere gitmeye çalışır mısınız?
157. Yabancı dil dersinde başarılı mısınız?
158. Ayakta ve hareketli olarak çalışmaktan hoşlanır mısınız?
159. Ufak tefek besteler yapmaya çalışır mısınız?
160. Bir evi ya da salonu süslemekten hoşlanır mısınız?
161. Başkalarına dinletecek düzeyde bir müzik aleti çalıyor musunuz?
162. Odanızı, yaptığınız resim veya el işleri ile süsler misiniz?
163. El sanatları ya da resim kurslarına gitmek ister misiniz?
164. Yeni duyduğunuz bir müzik parçasını çalmaya veya söylemeye çalışır mısınız?
165. Gazete ve dergilerdeki edebiyat sütunlarını okur musunuz?
166. Okul kitaplığına gider ve kitap alır mısınız?
167. Dilbilgisi kurallarını öğrenip uygulayabiliyor musunuz?
168. Görüşlerinize karşı çıkıldığında bunu soğukkanlılıkla karşılar mısınız?
169. Açık havada çalışmaktan hoşlanır mısınız?
170. Gelecekte kendinizi çeşitli dillerin yapı ve özellikleri üzerinde çalışan bir araştırmacı olarak düşünebilir misiniz?
`;

const questions = [];
const lines = text.split('\n');

for (let line of lines) {
    line = line.trim();
    if (line === '') continue;
    
    questions.push({
        text: line,
        type: "likert",
        options: ["Hiçbir zaman", "Ara sıra", "Sık sık", "Her zaman"]
    });
}

const obj = {
    id: "abko",
    title: "AKADEMİK BENLİK KAVRAMI ÖLÇEĞİ",
    desc: "Bu ölçek yetenek ve ilgilerinizi daha iyi tanımanıza ve bu yolla okul ve ders seçiminize yardımcı olmak amacı ile geliştirilmiştir. Ölçekte yetenek ve ilgi alanlarını yansıtan faaliyetleri ne kadar başarı ile ve ne derece sıklıkla yaptığınızı ya da o işi yapmaktan ne derece hoşlandığınızı soran sorular bulunmaktadır.",
    type: "mixed",
    questions: questions
};

const output = `export const abkoConfig = ${JSON.stringify(obj, null, 2)};\n`;
fs.writeFileSync('src/lib/abko.ts', output);
