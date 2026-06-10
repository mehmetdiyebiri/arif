import React, { useState, useEffect, useMemo } from 'react';
import { 
    BookOpen, CheckCircle, FileText, Activity, Clock, Award, 
    PlayCircle, HelpCircle, FileQuestion, Save, ChevronRight,
    TrendingUp, Star, X
} from 'lucide-react';
import { INITIAL_GUIDANCE_FORMS_CONFIG } from '../lib/guidanceForms';
import { INITIAL_SURVEY_FORMS_CONFIG } from '../lib/surveyForms';
import { BurdonTest } from './BurdonTest';

export const StudentHomePanel = ({ state, actions, section = 'homework' }: any) => {
  const { 
      currentUser, assignments, hwProgress, guidanceForms, 
      studentGuidanceForm, studentGuidanceAnswers, guidanceAssignments, 
      guidanceFormConfigs, studentHomework, homeworkAnswers,
      badges
  } = state;

  const { 
      startHomework, setStudentGuidanceForm, setStudentGuidanceAnswers, 
      submitGuidanceForm, saveGuidanceDraft, setStudentHomework, setHomeworkAnswers, submitHomework, setAppToast
  } = actions;

  // Local state for the "Pool" algorithm
  const [currentPool, setCurrentPool] = useState<number[]>([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState<string | null>(null);
  const [boslukValue, setBoslukValue] = useState("");
  const [incorrectCount, setIncorrectCount] = useState(0);

  // Stats
  const totalCorrect = currentUser?.totalCorrect || 0;
  const myBadges = useMemo(() => {
    return (badges || []).filter((b: any) => totalCorrect >= (b.threshold || 0));
  }, [badges, totalCorrect]);

  // Solver Logic Initialization
  useEffect(() => {
    if (studentHomework) {
        const progId = `${currentUser.id}_${studentHomework.id}`;
        const prog = hwProgress[progId];
        
        setIncorrectCount(prog?.incorrectCount || 0);

        if (prog?.remainingIndices && prog.remainingIndices.length > 0) {
            setCurrentPool(prog.remainingIndices);
        } else if (!prog?.completed) {
            // New homework: initialize pool with all indices shuffled
            const indices = Array.from({ length: studentHomework.questions?.length || 0 }, (_, i) => i);
            setCurrentPool(indices.sort(() => Math.random() - 0.5));
        } else {
            // Already completed but re-solving?
            const indices = Array.from({ length: studentHomework.questions?.length || 0 }, (_, i) => i);
            setCurrentPool(indices.sort(() => Math.random() - 0.5));
        }
    } else {
        setCurrentPool([]);
        setFeedback(null);
        setIsAnswering(false);
        setIncorrectCount(0);
    }
  }, [studentHomework]);

  // Guidance Draft Auto-Save
  useEffect(() => {
      // Only auto-save if a form is currently open and active
      if (studentGuidanceForm && Object.keys(studentGuidanceAnswers).length > 0) {
          const timeoutId = setTimeout(() => {
              saveGuidanceDraft(studentGuidanceForm, studentGuidanceAnswers);
          }, 1000); // 1-second debounce
          return () => clearTimeout(timeoutId);
      }
  }, [studentGuidanceAnswers, studentGuidanceForm]);

  // Kelime Task Distractors
  const enrichedQuestions = React.useMemo(() => {
      if (!studentHomework?.questions) return [];
      return studentHomework.questions.map((q: any, index: number) => {
          let text = q.question || q.Question || q.text || q.sentence || q.word || (Array.isArray(q) && q[0]) || '';
          if (!text && typeof q === 'object') {
              const strings = Object.entries(q)
                  .filter(([k, v]) => typeof v === 'string' && v.trim() !== '')
                  .map(([k, v]) => v as string);
              let longest = '';
              for(let s of strings) {
                  if (s.length > longest.length && !['a','b','c','d','A','B','C','D'].includes(s.substring(0,1))) longest = s;
              }
              text = longest || 'Soru Metni Bulunamadı';
          }
          
          let answer = q.answer || q.meaning || q.cevap || q.Cevap || '';
          
          let a = q.a || q.A || q.optionA || q.secenekA || '';
          let b = q.b || q.B || q.optionB || q.secenekB || '';
          let c = q.c || q.C || q.optionC || q.secenekC || '';
          let d = q.d || q.D || q.optionD || q.secenekD || '';

          // Look for options array
          const optsArray = q.options || q.secenekler || q. choices || q.secenek || q.şıklar;
          if (Array.isArray(optsArray)) {
              if (!a && optsArray[0]) a = optsArray[0];
              if (!b && optsArray[1]) b = optsArray[1];
              if (!c && optsArray[2]) c = optsArray[2];
              if (!d && optsArray[3]) d = optsArray[3];
          }
          
          // Deep scan to ensure all missing A,B,C,D are filled if the object contains stray values
          if (!a || !b || !c || !d) {
              const usedValues = new Set([text, answer, a, b, c, d].filter(x => x).map(x => String(x).trim()));
              const allStrings: string[] = [];
              
              if (typeof q === 'object') {
                  Object.entries(q).forEach(([k, v]) => {
                      if (typeof v === 'string' && v.trim() !== '') allStrings.push(v.trim());
                      else if (Array.isArray(v)) {
                          v.forEach(item => {
                              if (typeof item === 'string' && item.trim() !== '') allStrings.push(item.trim());
                          });
                      }
                  });
              }

              const isMeta = (s: string) => ['coktanSecmeli', 'kelime', 'bosluk', 'dogruYanlis', 'id', 'question', 'answer'].includes(s);
              const availableStrings = allStrings.filter(v => !usedValues.has(v) && v.length < 200 && v !== text && v !== answer && !isMeta(v));
              
              let unusedIndex = 0;
              if (!a && unusedIndex < availableStrings.length) { a = availableStrings[unusedIndex++]; usedValues.add(a); }
              if (!b && unusedIndex < availableStrings.length) { b = availableStrings[unusedIndex++]; usedValues.add(b); }
              if (!c && unusedIndex < availableStrings.length) { c = availableStrings[unusedIndex++]; usedValues.add(c); }
              if (!d && unusedIndex < availableStrings.length) { d = availableStrings[unusedIndex++]; usedValues.add(d); }
          }
          
          return {
              ...q,
              _text: text,
              _answer: answer,
              _a: a,
              _b: b,
              _c: c,
              _d: d
          };
      });
  }, [studentHomework]);
  
  const getKelimeOptions = (questionIndex: number) => {
      const q = studentHomework.questions[questionIndex];
      const correct = q.meaning;
      // Pull other meanings from the same assignment
      const others = studentHomework.questions
          .filter((_: any, i: number) => i !== questionIndex)
          .map((q: any) => q.meaning || q.answer);
      
      const shuffledOthers = others.sort(() => Math.random() - 0.5);
      const distractors = shuffledOthers.slice(0, 3);
      
      // Fallback if not enough distractors
      const baseOptions = [correct, ...distractors];
      while (baseOptions.length < 2 && studentHomework.type === 'kelime') {
          baseOptions.push("Pekiştirme"); // Very simple fallback
      }
      
      return Array.from(new Set(baseOptions)).sort(() => Math.random() - 0.5);
  };

  const handleAnswer = (answer: string) => {
      if (isAnswering) return;
      
      const questionIndex = currentPool[0];
      const qOrig = studentHomework.questions[questionIndex];
      const q = enrichedQuestions[questionIndex];
      const clean = (s: string) => (s || '').trim().toLocaleLowerCase('tr-TR');
      
      let isCorrect = clean(answer) === clean(q._answer);

      // Smart check for Multiple Choice:
      if (studentHomework.type === 'coktanSecmeli' && !isCorrect) {
          // If option includes prefix like "A) ", strip it for comparison
          const stripPrefix = (s: string) => clean(s).replace(/^[a-d][) .:-]+/, '');
          const ansStripped = stripPrefix(answer);
          const correctStripped = stripPrefix(q._answer);
          
          if (ansStripped && correctStripped && ansStripped === correctStripped) {
              isCorrect = true;
          }
          
          // Also check if question.answer is just a single letter (a, b, c, d)
          const qAnsClean = clean(q._answer);
          if (qAnsClean.length === 1 && ['a', 'b', 'c', 'd'].includes(qAnsClean)) {
              if (clean(answer) === clean(q[`_${qAnsClean}`])) { // changed to _a, _b, etc
                  isCorrect = true;
              }
          }
      }

      setIsAnswering(true);
      setFeedback(isCorrect ? 'correct' : 'wrong');
      setLastCorrectAnswer(q._answer);

      const finalIncorrectCount = isCorrect ? incorrectCount : incorrectCount + 1;
      if (!isCorrect) {
          setIncorrectCount(finalIncorrectCount);
      }

      const shouldRestart = studentHomework.type === 'kelime' && !isCorrect && (finalIncorrectCount > studentHomework.questions.length * 0.5);

      setTimeout(() => {
          let nextPool = [...currentPool];
          let deltaCorrect = 0;
          
          if (isCorrect) {
              nextPool.shift(); // Remove from pool
              deltaCorrect = 1;
          } else {
              // Wrong: Move current q to the back
              const currentQ = nextPool.shift()!;
              nextPool.push(currentQ);
          }

          const isNowCompleted = nextPool.length === 0;

          if (shouldRestart) {
              // Reset from the beginning
              const allIndices = Array.from({ length: studentHomework.questions.length }, (_, i) => i);
              const restartedPool = allIndices.sort(() => Math.random() - 0.5);
              
              setIncorrectCount(0);
              setCurrentPool(restartedPool);
              setFeedback(null);
              setIsAnswering(false);

              submitHomework(studentHomework.id, {
                  completed: false,
                  remainingIndices: restartedPool,
                  deltaCorrect: 0,
                  correctCount: 0,
                  incorrectCount: 0
              });
          } else {
              submitHomework(studentHomework.id, {
                  completed: isNowCompleted,
                  remainingIndices: nextPool,
                  deltaCorrect,
                  correctCount: (hwProgress[`${currentUser.id}_${studentHomework.id}`]?.correctCount || 0) + deltaCorrect,
                  incorrectCount: finalIncorrectCount
              });

              if (!isNowCompleted) {
                  setCurrentPool(nextPool);
                  setFeedback(null);
                  setIsAnswering(false);
              }
          }
      }, shouldRestart ? 5000 : 1500);
  };

//...
  const myAssignments = assignments.filter((a: any) => {
      if (!a || !a.classes || !currentUser || !currentUser.classLevel) return false;
      const normalize = (s: any) => String(s || '').replace(/[\s_\\/-]/g, '').toLowerCase();
      const isClassMatch = a.classes.some((c: string) => normalize(c) === normalize(currentUser.classLevel));
      if (!isClassMatch) return false;
      if (a.targetType === 'student') {
          return normalize(a.targetStudent) === normalize(currentUser.username) || 
                 normalize(a.targetStudent) === normalize(currentUser.name);
      }
      return true;
  });
  
  const allConfigs = React.useMemo(() => {
     const map = new Map();
     INITIAL_GUIDANCE_FORMS_CONFIG.forEach(c => map.set(c.id, c));
     INITIAL_SURVEY_FORMS_CONFIG.forEach(c => map.set(c.id, c));
     guidanceFormConfigs.forEach((c: any) => map.set(c.id, c));
     return Array.from(map.values());
  }, [guidanceFormConfigs]);
  
  const myGuidanceForms = allConfigs.filter(config => {
      const normalize = (s: any) => String(s || '').replace(/[\s_\\/-]/g, '').toLowerCase();
      return guidanceAssignments.some((asgn: any) => 
          asgn.formId === config.id && 
          (
              (asgn.targetType === 'class' && normalize(asgn.targetClass) === normalize(currentUser.classLevel)) ||
              (asgn.targetType === 'student' && (asgn.targetStudent === currentUser.username || asgn.targetStudent === currentUser.name))
          )
      );
  });

  // Homework Solver Render
  if (section === 'homework' && studentHomework) {
      if (currentPool.length === 0 && !hwProgress[`${currentUser.id}_${studentHomework.id}`]?.completed) {
          return <div>Yükleniyor...</div>;
      }

      const isAllDone = currentPool.length === 0;
      const questionIndex = currentPool[0];
      const q = enrichedQuestions[questionIndex];

      return (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-500">
              <div className="bg-white p-8 md:p-12 rounded-[48px] shadow-2xl shadow-blue-100/50 border border-gray-100 relative overflow-hidden h-[700px] flex flex-col">
                  
                  {/* Feedback Overlay */}
                  {feedback && (
                      <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 ${feedback === 'correct' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                          <div className="bg-white/20 p-8 rounded-full mb-6">
                            {feedback === 'correct' ? <CheckCircle size={80} className="text-white"/> : <X size={80} className="text-white"/>}
                          </div>
                          <h2 className="text-4xl font-black text-white tracking-tight">{feedback === 'correct' ? 'HARİKA!' : 'ÜZGÜNÜM..'}</h2>
                          {feedback === 'wrong' && (
                              <div className="mt-8 text-center px-8">
                                  {studentHomework.type === 'kelime' ? (
                                      incorrectCount > studentHomework.questions.length * 0.5 ? (
                                          <p className="text-white text-lg font-bold bg-black/20 px-6 py-3 rounded-2xl animate-pulse">
                                              %50'den fazla yanlış yaptığınız için test en baştan başlatılıyor!
                                          </p>
                                      ) : (
                                          <p className="text-white/90 text-lg font-black bg-black/10 px-6 py-3 rounded-2xl">
                                              Sıradaki soruya geçiliyor, bu soruyu tekrar çözeceksiniz.
                                          </p>
                                      )
                                  ) : (
                                      <>
                                          <p className="text-white/80 font-bold text-sm uppercase tracking-widest mb-2">DOĞRU CEVAP ŞUYDU:</p>
                                          <p className="text-white text-2xl font-black">{lastCorrectAnswer}</p>
                                      </>
                                  )}
                              </div>
                          )}
                      </div>
                  )}

                  {!isAllDone ? (
                      <>
                        <div className="flex justify-between items-center mb-12 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black">
                                    {studentHomework.questions.length - currentPool.length + 1}
                                </div>
                                <span className="text-sm font-bold text-gray-400">/ {studentHomework.questions.length} Soru</span>
                            </div>
                            <button 
                                onClick={() => setStudentHomework(null)}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-50 text-gray-500 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all border border-gray-100"
                            >
                                <X size={18}/> Kapat ve Kaydet
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                            {studentHomework.type === 'kelime' && (
                                <div className="space-y-4 animate-in zoom-in duration-500">
                                    <div className="bg-orange-50 text-orange-600 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[3px] border border-orange-100 inline-block">Kelime Anlamı</div>
                                    <h1 className="text-6xl font-black text-blue-900 tracking-tighter lowercase">{q._text}</h1>
                                    <p className="text-gray-400 font-bold text-lg">Bu kelimenin anlamı hangisidir?</p>
                                </div>
                            )}

                            {studentHomework.type === 'coktanSecmeli' && (
                                <div className="space-y-6 animate-in zoom-in duration-500 w-full px-4 overflow-y-auto max-h-[300px]">
                                    <h2 className="text-3xl font-black text-blue-900 leading-tight tracking-tight">
                                        {q._text}
                                    </h2>
                                </div>
                            )}

                            {studentHomework.type === 'dogruYanlis' && (
                                <div className="space-y-6 animate-in zoom-in duration-500 w-full px-4 text-center">
                                    <div className="bg-blue-50 text-blue-600 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[3px] border border-blue-100 inline-block mb-4">Doğru mu Yanlış mı?</div>
                                    <p className="text-3xl font-bold text-blue-900 leading-relaxed italic">"{q._text}"</p>
                                </div>
                            )}

                            {studentHomework.type === 'bosluk' && (
                                <div className="space-y-8 animate-in zoom-in duration-500 w-full px-4">
                                    <div className="bg-emerald-50 text-emerald-600 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[3px] border border-emerald-100 inline-block mb-4">Boşluk Doldurma</div>
                                    <p className="text-3xl font-bold text-blue-900 leading-relaxed">{q._text}</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-12 w-full shrink-0">
                            {studentHomework.type === 'kelime' && (
                                <div className="grid grid-cols-2 gap-4">
                                    {getKelimeOptions(questionIndex).map((opt) => (
                                        <button 
                                            key={opt}
                                            onClick={() => handleAnswer(opt)}
                                            className="p-6 bg-white border-2 border-gray-100 rounded-3xl font-bold text-blue-900 hover:border-blue-500 hover:bg-blue-50/30 hover:scale-[1.02] active:scale-95 transition-all text-lg shadow-sm"
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {studentHomework.type === 'coktanSecmeli' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                                    {['a', 'b', 'c', 'd'].map((key) => {
                                        const optionText = q[`_${key}`];
                                        return (
                                            <button 
                                                key={key}
                                                onClick={() => handleAnswer(optionText || '')}
                                                className={`p-5 bg-white border-2 border-gray-100 rounded-3xl font-bold text-blue-900 hover:border-blue-500 hover:bg-blue-50/30 hover:scale-[1.02] active:scale-95 transition-all text-left flex items-center gap-4 group ${!optionText ? 'opacity-50 grayscale' : ''}`}
                                            >
                                                <span className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 text-gray-500 font-black uppercase group-hover:bg-blue-600 group-hover:text-white transition-colors">{key}</span>
                                                {optionText || <span className="text-gray-300 italic text-xs">Boş</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {studentHomework.type === 'dogruYanlis' && (
                                <div className="grid grid-cols-2 gap-6 max-w-xl mx-auto">
                                    <button 
                                        onClick={() => handleAnswer('Doğru')}
                                        className="p-10 bg-white border-2 border-emerald-100 rounded-[32px] text-emerald-600 font-black text-2xl hover:bg-emerald-600 hover:text-white hover:scale-[1.05] transition-all shadow-lg shadow-emerald-50"
                                    >
                                        DOĞRU
                                    </button>
                                    <button 
                                        onClick={() => handleAnswer('Yanlış')}
                                        className="p-10 bg-white border-2 border-rose-100 rounded-[32px] text-rose-600 font-black text-2xl hover:bg-rose-600 hover:text-white hover:scale-[1.05] transition-all shadow-lg shadow-rose-50"
                                    >
                                        YANLIŞ
                                    </button>
                                </div>
                            )}

                            {studentHomework.type === 'bosluk' && (
                                <div className="max-w-xl mx-auto space-y-4">
                                    <input 
                                        autoFocus
                                        value={boslukValue}
                                        onChange={(e) => setBoslukValue(e.target.value)}
                                        className="w-full p-8 bg-blue-50 border-4 border-blue-200 rounded-[32px] font-black text-3xl text-center text-blue-900 focus:border-blue-500 outline-none transition-all placeholder:text-blue-200 uppercase"
                                        placeholder="CEVABI BURAYA YAZIN..."
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                handleAnswer(boslukValue);
                                                setBoslukValue(""); // Clear input after answer
                                            }
                                        }}
                                    />
                                    <p className="text-gray-400 font-bold text-sm text-center">Onaylamak için Enter tuşuna basınız.</p>
                                </div>
                            )}
                        </div>
                      </>
                  ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                          <div className="w-24 h-24 bg-emerald-500 text-white rounded-3xl flex items-center justify-center mb-8 animate-bounce shadow-2xl shadow-emerald-200">
                              <Award size={60}/>
                          </div>
                          <h1 className="text-5xl font-black text-blue-900 mb-4 tracking-tighter leading-tight">TEBRİKLER!<br/>HEPSİ DOĞRU</h1>
                          <p className="text-gray-400 font-bold text-lg max-w-sm mb-12 leading-relaxed">Harika bir iş çıkardın. Bu ödevdeki tüm bilgileri başarıyla öğrendin.</p>
                          <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
                              <button 
                                onClick={() => setStudentHomework(null)}
                                className="flex-1 bg-blue-600 text-white py-5 rounded-[24px] font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
                              >
                                Panele Dön
                              </button>
                              <button 
                                onClick={async () => {
                                    // Reset in backend too
                                    const indices = Array.from({ length: studentHomework.questions?.length || 0 }, (_, i) => i);
                                    const shuffled = indices.sort(() => Math.random() - 0.5);
                                    await submitHomework(studentHomework.id, {
                                        completed: false,
                                        remainingIndices: shuffled,
                                        deltaCorrect: 0,
                                        correctCount: 0
                                    });
                                    setCurrentPool(shuffled);
                                    setFeedback(null);
                                    setIsAnswering(false);
                                }}
                                className="flex-1 bg-emerald-50 text-emerald-600 py-5 rounded-[24px] font-black text-lg hover:bg-emerald-100 transition-all border border-emerald-100 flex items-center justify-center gap-2"
                              >
                                <PlayCircle size={22}/> Tekrar Çöz
                              </button>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      );
  }

  // GUIDANCE FORM VIEW
  if (section === 'guidance' && studentGuidanceForm) {
    const config = allConfigs.find(f => f.id === studentGuidanceForm);
    return (
        <div className="bg-white p-6 md:p-12 rounded-[40px] shadow-sm border border-gray-100 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-10 border-b border-gray-50 pb-8">
                <div>
                    <h3 className="font-black text-2xl text-blue-900 tracking-tight">{config?.title}</h3>
                    <p className="text-gray-400 font-bold text-sm mt-1">Lütfen tüm soruları eksiksiz yanıtlayınız.</p>
                    {config?.desc && (
                        <p className="text-gray-600 font-medium text-sm mt-4 max-w-4xl leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">{config.desc}</p>
                    )}
                </div>
                <button onClick={() => setStudentGuidanceForm(null)} className="text-sm font-bold text-gray-400 hover:text-gray-600 bg-gray-50 px-6 py-3 rounded-2xl transition-all">Geri Dön</button>
            </div>
            
            <div className="space-y-10">
                {config?.type === 'timetable' && (
                    <div className="overflow-x-auto bg-white rounded-3xl border border-gray-100 shadow-sm p-2">
                        <table className="w-full text-left border-collapse min-w-max">
                            <thead>
                                {config.id === 'yol_haritam_2' ? (
                                    <>
                                        <tr>
                                            <th rowSpan={2} className="p-4 border-b border-r border-gray-300 bg-[#e6eed4]/50 text-xs text-[#5c6b3f] uppercase font-black rounded-tl-2xl w-40">Günler</th>
                                            <th colSpan={2} className="p-4 border-b border-r border-gray-300 bg-[#e6eed4]/50 text-xs text-[#5c6b3f] text-center uppercase font-black">Planladıklarım</th>
                                            <th rowSpan={2} className="p-4 border-b border-r border-gray-300 bg-[#e6eed4]/50 text-xs text-[#5c6b3f] text-center uppercase font-black">Yaptıklarım</th>
                                            <th rowSpan={2} className="p-4 border-b border-r border-gray-300 bg-[#e6eed4]/50 text-xs text-[#5c6b3f] text-center uppercase font-black">Kalanlar</th>
                                            <th rowSpan={2} className="p-4 border-b border-gray-300 bg-[#e6eed4]/50 text-xs text-[#5c6b3f] text-center uppercase font-black rounded-tr-2xl">Planım Dışında Yaptıklarım</th>
                                        </tr>
                                        <tr>
                                            <th className="p-4 border-b border-r border-gray-300 bg-[#e6eed4]/50 text-xs text-[#5c6b3f] text-center uppercase font-black">Ders</th>
                                            <th className="p-4 border-b border-r border-gray-300 bg-[#e6eed4]/50 text-xs text-[#5c6b3f] text-center uppercase font-black">Ders Dışı</th>
                                        </tr>
                                    </>
                                ) : (
                                    <tr>
                                        <th className="p-4 border-b border-gray-300 bg-gray-50 text-xs text-gray-400 uppercase font-black rounded-tl-2xl">Günler / Etkinlikler</th>
                                        {config.columns.map((col: string, idx: number) => <th key={col} className={`p-4 border-b border-gray-300 bg-gray-50 text-xs text-gray-400 uppercase font-black ${idx === config.columns.length - 1 ? 'rounded-tr-2xl' : ''}`}>{col}</th>)}
                                    </tr>
                                )}
                            </thead>
                                <tbody className="divide-y divide-gray-300">
                                {config.rows.map((row: string, rIdx: number) => {
                                    if (row === "Toplam Süre" && config.id === 'yol_haritam') {
                                        return (
                                        <tr key={row} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="p-4 font-black text-gray-700 text-sm whitespace-nowrap border-b border-gray-300 border-r">{row}</td>
                                            {config.columns.map((col: string, cIdx: number) => {
                                                // Calculate total minutes for this column
                                                let totalMinutes = 0;
                                                for (let i = 0; i < config.rows.length - 1; i++) {
                                                    const qId = `${i}_${cIdx}`;
                                                    const val = parseFloat(studentGuidanceAnswers[qId]?.replace(',', '.') || '0');
                                                    if (!isNaN(val)) {
                                                        const unit = studentGuidanceAnswers[`${qId}_unit`] || 'dk';
                                                        totalMinutes += unit === 'saat' ? val * 60 : val;
                                                    }
                                                }
                                                // Convert to hours and minutes string
                                                const hours = Math.floor(totalMinutes / 60);
                                                const mins = totalMinutes % 60;
                                                const totalStr = hours > 0 ? (mins > 0 ? `${hours}s ${mins}dk` : `${hours}s`) : (mins > 0 ? `${mins}dk` : '-');

                                                return (
                                                    <td key={col} className={`p-4 border-b border-gray-300 ${cIdx !== config.columns.length -1 ? 'border-r' : ''} text-center font-black text-blue-600`}>
                                                        {totalStr}
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                        )
                                    }
                                    if (row === "Haftalık değerlendirme" || row === "Toplam Süre") {
                                        return (
                                        <tr key={row} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="p-4 font-black text-gray-700 text-sm whitespace-nowrap border-b border-gray-300 border-r">{row}</td>
                                            <td colSpan={config.columns.length} className="p-2 border-b border-gray-300">
                                                <input 
                                                    type="text"
                                                    placeholder="Buraya yazınız..."
                                                    className="w-full text-sm font-bold text-gray-800 p-3 outline-none border border-transparent focus:border-blue-500 rounded-xl bg-gray-50 focus:bg-white transition-all shadow-sm"
                                                    value={studentGuidanceAnswers[`${rIdx}_span`] || ''}
                                                    onChange={e => setStudentGuidanceAnswers({...studentGuidanceAnswers, [`${rIdx}_span`]: e.target.value})}
                                                />
                                            </td>
                                        </tr>
                                        )
                                    }
                                    return (
                                    <tr key={row} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="p-4 font-black text-gray-700 text-sm whitespace-nowrap border-b border-gray-300 border-r">{row}</td>
                                        {config.columns.map((col: string, cIdx: number) => {
                                            const qId = `${rIdx}_${cIdx}`;
                                            return (
                                                <td key={col} className={`p-2 border-b border-gray-300 ${cIdx !== config.columns.length -1 ? 'border-r' : ''}`}>
                                                    {config.id === 'yol_haritam' ? (
                                                        <div className="flex bg-gray-50 rounded-xl focus-within:bg-white overflow-hidden shadow-sm transition-all border border-transparent focus-within:border-blue-500 w-32">
                                                            <input 
                                                                type="text"
                                                                placeholder="Süre..."
                                                                className="w-full text-sm font-bold text-gray-800 p-3 outline-none bg-transparent"
                                                                value={studentGuidanceAnswers[qId] || ''}
                                                                onChange={e => setStudentGuidanceAnswers({...studentGuidanceAnswers, [qId]: e.target.value})}
                                                            />
                                                            <div className="border-l border-gray-200">
                                                                <select
                                                                    className="h-full bg-transparent text-xs font-black text-gray-500 outline-none px-2 cursor-pointer appearance-none text-center"
                                                                    value={studentGuidanceAnswers[`${qId}_unit`] || 'dk'}
                                                                    onChange={e => setStudentGuidanceAnswers({...studentGuidanceAnswers, [`${qId}_unit`]: e.target.value})}
                                                                >
                                                                    <option value="dk">dk</option>
                                                                    <option value="saat">saat</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <input 
                                                            type="text"
                                                            placeholder="Buraya yazınız..."
                                                            className="w-full text-sm font-bold text-gray-800 p-3 outline-none border border-transparent focus:border-blue-500 rounded-xl bg-gray-50 focus:bg-white transition-all shadow-sm"
                                                            value={studentGuidanceAnswers[qId] || ''}
                                                            onChange={e => setStudentGuidanceAnswers({...studentGuidanceAnswers, [qId]: e.target.value})}
                                                        />
                                                    )}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                {config?.type === 'matrix' && (
                    <div className="overflow-x-auto bg-white border border-[#a3b86c] shadow-sm max-w-5xl mx-auto rounded-2xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th rowSpan={2} className="p-4 border-b border-r border-[#a3b86c] bg-[#a3b86c] text-white uppercase font-black text-center w-[50%] md:w-[60%]">
                                        {config.id === 'coklu_zeka' ? 'İFADELER' : (config.id === 'benlik_tasarimi' ? 'CÜMLELER' : (config.id === 'calisma_davranisi' ? 'İFADELER (CÜMLELER)' : (config.id === 'holland' ? 'MADDELER' : 'DURUM')))}
                                    </th>
                                    <th colSpan={config.columns?.length || 3} className="p-3 border-b border-[#a3b86c] bg-[#a3b86c] text-white text-center font-black">
                                        {config.id === 'saa' ? 'Bu sizce şiddet midir?' : (config.id === 'ssa' ? 'Siz bunu yaşadınız mı?' : (config.id === 'coklu_zeka' ? 'Uygunluk Derecesi' : 'Seçenekler'))}
                                    </th>
                                </tr>
                                <tr>
                                    {config.columns?.map((col: string, cIdx: number) => (
                                        <th key={col} className={`p-3 border-b border-[#a3b86c] bg-[#a3b86c]/90 text-white text-center font-black ${cIdx !== (config.columns?.length || 0) - 1 ? 'border-r' : ''}`}>{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#a3b86c]/50">
                                {config.questions?.map((qRow: any, rIdx: number) => {
                                    const text = typeof qRow === 'string' ? qRow : qRow.text;
                                    const qId = `q_${rIdx}`;
                                    return (
                                        <tr key={rIdx} className="hover:bg-[#a3b86c]/10 transition-colors">
                                            <td className="p-3 text-sm font-semibold text-gray-800 border-r border-[#a3b86c]/50">
                                                {rIdx + 1}. {text}
                                            </td>
                                            {config.columns?.map((col: string, cIdx: number) => {
                                                const isSelected = studentGuidanceAnswers[qId] === col;
                                                return (
                                                    <td key={col} className={`p-3 text-center border-[#a3b86c]/50 ${cIdx !== (config.columns?.length || 0) - 1 ? 'border-r' : ''}`}>
                                                        <label className="cursor-pointer flex items-center justify-center w-full h-full">
                                                            <input 
                                                                type="radio" 
                                                                name={qId} 
                                                                value={col}
                                                                checked={isSelected}
                                                                onChange={() => setStudentGuidanceAnswers({...studentGuidanceAnswers, [qId]: col})}
                                                                className="w-5 h-5 text-[#a3b86c] focus:ring-[#a3b86c] border-[#a3b86c]"
                                                            />
                                                        </label>
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                {config?.type === 'story_matrix' && config.stories?.map((story: any, sIdx: number) => (
                    <div key={sIdx} className="bg-white border text-[#a3b86c] border-[#a3b86c] rounded-2xl shadow-sm mb-12 overflow-hidden mx-auto max-w-5xl">
                        <div className="p-6 bg-[#a3b86c]/10 pb-8">
                            <h4 className="font-black text-xl mb-4 text-[#a3b86c]">{story.title}</h4>
                            <p className="text-gray-800 font-medium leading-relaxed">{story.text}</p>
                        </div>
                        <div className="overflow-x-auto bg-white border-t border-[#a3b86c]">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr>
                                        <th rowSpan={2} className="p-4 border-b border-r border-[#a3b86c] bg-[#a3b86c] text-white font-black text-center w-[50%] md:w-[60%]">{sIdx + 1}. ANKET</th>
                                        <th colSpan={config.columns?.length || 3} className="p-3 border-b border-[#a3b86c] bg-[#a3b86c] text-white text-center font-black">
                                            Bu davranış karşısında düşünceniz nedir?
                                        </th>
                                    </tr>
                                    <tr>
                                        {config.columns?.map((col: string, cIdx: number) => (
                                            <th key={col} className={`p-3 border-b border-[#a3b86c] bg-[#a3b86c]/90 text-white text-center font-black ${cIdx !== (config.columns?.length || 0) - 1 ? 'border-r' : ''}`}>{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#a3b86c]/50">
                                    {story.questions?.map((qText: string, rIdx: number) => {
                                        const qId = `story_${sIdx}_q_${rIdx}`;
                                        return (
                                            <tr key={rIdx} className="hover:bg-[#a3b86c]/10 transition-colors">
                                                <td className="p-3 text-sm font-semibold text-gray-800 border-r border-[#a3b86c]/50">
                                                    {rIdx + 1}. {qText}
                                                </td>
                                                {config.columns?.map((col: string, cIdx: number) => {
                                                    const isSelected = studentGuidanceAnswers[qId] === col;
                                                    return (
                                                        <td key={col} className={`p-3 text-center border-[#a3b86c]/50 ${cIdx !== (config.columns?.length || 0) - 1 ? 'border-r' : ''}`}>
                                                            <label className="cursor-pointer flex items-center justify-center w-full h-full">
                                                                <input 
                                                                    type="radio" 
                                                                    name={qId} 
                                                                    value={col}
                                                                    checked={isSelected}
                                                                    onChange={() => setStudentGuidanceAnswers({...studentGuidanceAnswers, [qId]: col})}
                                                                    className="w-5 h-5 text-[#a3b86c] focus:ring-[#a3b86c] border-[#a3b86c]"
                                                                />
                                                            </label>
                                                        </td>
                                                    )
                                                })}
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
                {config?.type === 'riba' && (
                    <div className="max-w-5xl mx-auto overflow-hidden rounded-2xl border border-white shadow-lg">
                        <div className="bg-[#E7F3F3] p-6 border-b border-white">
                            <p className="text-[13px] font-bold text-[#005C69] leading-relaxed text-center italic">
                                Sevgili Öğrenci, bu anketin amacı okulumuzda hangi rehberlik hizmetlerine ihtiyaç duyduğunuzu belirlemektir. 
                                İki hizmetten en çok ihtiyaç duyduğunuzu seçiniz.
                            </p>
                        </div>
                        <div className="bg-white overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-[#E7F3F3]">
                                        <th className="w-12 border-r border-white"></th>
                                        <th className="w-12 border-r border-white"></th>
                                        <th className="p-3 text-center text-[#005C69] font-black text-lg tracking-widest border-r border-white uppercase">MADDELER</th>
                                        <th className="w-24 p-3 text-center text-[#005C69] font-black text-lg tracking-widest uppercase">SEÇİM</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {config.questions?.map((q: any, idx: number) => {
                                        const qId = `q_${idx}`;
                                        const selected = studentGuidanceAnswers[qId];
                                        return (
                                            <React.Fragment key={idx}>
                                                {/* Option A Row */}
                                                <tr className="border-b border-[#E7F3F3] group/row">
                                                    <td rowSpan={2} className="bg-[#E7F3F3] text-center font-black text-[#005C69] border-r border-white w-12">
                                                        {idx + 1}
                                                    </td>
                                                    <td 
                                                        onClick={() => setStudentGuidanceAnswers({...studentGuidanceAnswers, [qId]: 'A'})}
                                                        className="bg-[#E7F3F3] text-center font-black text-[#005C69] border-r border-white p-3 w-12 cursor-pointer hover:bg-[#B7DBDB] transition-all duration-200"
                                                    >
                                                        A
                                                    </td>
                                                    <td 
                                                        onClick={() => setStudentGuidanceAnswers({...studentGuidanceAnswers, [qId]: 'A'})}
                                                        className="p-4 text-[#333] font-semibold text-[15px] border-r border-white bg-[#F9FCFC] cursor-pointer hover:bg-[#E1F0F0] transition-all duration-200"
                                                    >
                                                        {q.a}
                                                    </td>
                                                    <td 
                                                        onClick={() => setStudentGuidanceAnswers({...studentGuidanceAnswers, [qId]: 'A'})}
                                                        className="bg-[#F9FCFC] cursor-pointer hover:bg-[#E1F0F0] transition-all duration-200 text-center relative w-16"
                                                    >
                                                        <div className="w-8 h-8 mx-auto flex items-center justify-center">
                                                            {selected === 'A' && <span className="text-[#005C69] font-black text-2xl">X</span>}
                                                        </div>
                                                    </td>
                                                </tr>
                                                {/* Option B Row */}
                                                <tr className="border-b-2 border-[#CDE0E0] group/row">
                                                    <td 
                                                        onClick={() => setStudentGuidanceAnswers({...studentGuidanceAnswers, [qId]: 'B'})}
                                                        className="bg-[#E7F3F3] text-center font-black text-[#005C69] border-r border-white p-3 w-12 cursor-pointer hover:bg-[#B7DBDB] transition-all duration-200"
                                                    >
                                                        B
                                                    </td>
                                                    <td 
                                                        onClick={() => setStudentGuidanceAnswers({...studentGuidanceAnswers, [qId]: 'B'})}
                                                        className="p-4 text-[#333] font-semibold text-[15px] border-r border-white bg-[#F9FCFC] cursor-pointer hover:bg-[#E1F0F0] transition-all duration-200"
                                                    >
                                                        {q.b}
                                                    </td>
                                                    <td 
                                                        onClick={() => setStudentGuidanceAnswers({...studentGuidanceAnswers, [qId]: 'B'})}
                                                        className="bg-[#F9FCFC] cursor-pointer hover:bg-[#E1F0F0] transition-all duration-200 text-center relative w-16"
                                                    >
                                                        <div className="w-8 h-8 mx-auto flex items-center justify-center">
                                                            {selected === 'B' && <span className="text-[#005C69] font-black text-2xl">X</span>}
                                                        </div>
                                                    </td>
                                                </tr>
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {config?.type === 'checklist_matrix' && (
                    <div className="max-w-5xl mx-auto overflow-hidden rounded-2xl border border-[#A5B972] shadow-lg mb-12">
                        <div className="bg-[#A5B972] p-8 text-white text-center">
                            <h3 className="text-2xl font-black mb-3 uppercase tracking-wider">{config.title}</h3>
                            <p className="text-[15px] font-medium opacity-90 max-w-3xl mx-auto leading-relaxed">{config.desc}</p>
                        </div>
                        <div className="bg-white overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-[#F4F7E9]">
                                        <th className="p-5 border border-[#A5B972] text-[#556B2F] font-black text-sm uppercase text-left pl-8">MADDELER</th>
                                        <th className="w-24 p-5 border border-[#A5B972] text-[#556B2F] font-black text-xs uppercase text-center">EVET</th>
                                        <th className="w-24 p-5 border border-[#A5B972] text-[#556B2F] font-black text-xs uppercase text-center">KISMEN</th>
                                        <th className="w-24 p-5 border border-[#A5B972] text-[#556B2F] font-black text-xs uppercase text-center">HAYIR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {config.questions?.map((q: any, idx: number) => {
                                        if (typeof q === 'object' && q.header) {
                                            return (
                                                <tr key={`header-${idx}`} className="bg-[#A5B972]">
                                                    <td colSpan={4} className="p-4 text-white font-black text-[13px] uppercase tracking-widest pl-8 shadow-inner">
                                                        {q.header}
                                                    </td>
                                                </tr>
                                            );
                                        }
                                        const qId = `q_${idx}`;
                                        const qText = typeof q === 'string' ? q : q.text;
                                        const selected = studentGuidanceAnswers[qId];
                                        return (
                                            <tr key={idx} className="border-b border-[#E1E8CC] hover:bg-[#F9FCF2] transition-colors group">
                                                <td className="p-5 border-x border-[#E1E8CC] text-gray-700 font-bold text-[15px] pl-8">
                                                    <span className="inline-block w-10 text-[#7D8F52] font-black">{idx + 1}.</span>
                                                    {qText}
                                                </td>
                                                {['Evet', 'Kısmen', 'Hayır'].map(option => (
                                                    <td 
                                                        key={option}
                                                        onClick={() => setStudentGuidanceAnswers({...studentGuidanceAnswers, [qId]: option})}
                                                        className={`border border-[#E1E8CC] cursor-pointer text-center group-hover:bg-[#F2F7E1]/30 transition-all duration-200 ${selected === option ? 'bg-[#F2F7E1]/50' : ''}`}
                                                    >
                                                        <div className={`w-8 h-8 mx-auto rounded-full border-[3px] flex items-center justify-center transition-all ${selected === option ? 'border-[#A5B972] scale-110 shadow-md shadow-[#A5B972]/20' : 'border-gray-200 group-hover:border-[#A5B972]/40'}`}>
                                                            {selected === option && <div className="w-4 h-4 rounded-full bg-[#A5B972] animate-in zoom-in-50 duration-200"></div>}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {config?.type === 'yasam_pencerem' && (
                    <div className="max-w-5xl mx-auto overflow-hidden rounded-2xl border border-[#005C69] shadow-lg mb-12">
                        <div className="bg-[#005C69] p-8 text-white relative">
                            <div className="absolute top-0 right-0 w-32 h-full bg-white/5 skew-x-[-20deg] translate-x-16"></div>
                            <h3 className="text-3xl font-black mb-3 tracking-tighter uppercase">{config.title}</h3>
                            <p className="text-[14px] font-bold opacity-90 leading-relaxed max-w-3xl italic">{config.desc}</p>
                        </div>
                        <div className="bg-white overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-[#E7F3F3]">
                                        <th className="w-16 p-4 border border-[#B7DBDB] text-[#005C69] font-black text-center text-lg">NO</th>
                                        <th className="w-16 p-4 border border-[#B7DBDB] text-[#005C69] font-black text-center text-lg">( )</th>
                                        <th className="p-4 border border-[#B7DBDB] text-[#005C69] font-black text-left pl-8 uppercase tracking-widest">İFADELER</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {config.questions?.map((q: any, idx: number) => {
                                        const qId = `q_${idx}`;
                                        const isSelected = studentGuidanceAnswers[qId] === true;
                                        return (
                                            <tr key={idx} className="border-b border-[#CDE0E0] hover:bg-[#F0F7F7] transition-all group">
                                                <td className="p-4 border border-[#B7DBDB] text-center font-black text-[#005C69] bg-[#E7F3F3]/30">
                                                    {idx + 1}
                                                </td>
                                                <td 
                                                    className="p-4 border border-[#B7DBDB] text-center cursor-pointer group-hover:bg-[#E7F3F3]/50"
                                                    onClick={() => setStudentGuidanceAnswers({...studentGuidanceAnswers, [qId]: !isSelected})}
                                                >
                                                    <div className={`w-8 h-8 mx-auto flex items-center justify-center transition-all ${isSelected ? 'text-[#005C69]' : 'text-transparent'}`}>
                                                        <span className="font-black text-2xl leading-none">X</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 border border-[#B7DBDB] text-gray-700 font-bold text-[15px] pl-8">
                                                    <div className="flex flex-col gap-3">
                                                        <span 
                                                            className="cursor-pointer select-none"
                                                            onClick={() => setStudentGuidanceAnswers({...studentGuidanceAnswers, [qId]: !isSelected})}
                                                        >
                                                            {q.text}
                                                        </span>
                                                        {(isSelected && q.hasText) && (
                                                            <input 
                                                                type="text"
                                                                placeholder="Lütfen buraya yazınız..."
                                                                className="w-full p-3 bg-white border-b-2 border-dashed border-[#005C69] outline-none text-[#005C69] font-bold text-sm placeholder:text-gray-300 placeholder:italic animate-in slide-in-from-top-1 duration-300"
                                                                value={studentGuidanceAnswers[`${qId}_text`] || ''}
                                                                onChange={e => setStudentGuidanceAnswers({...studentGuidanceAnswers, [`${qId}_text`]: e.target.value})}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {config.footer && (
                            <div className="p-8 bg-[#E7F3F3] border-t border-[#005C69]">
                                <h4 className="text-[#005C69] font-black text-sm mb-4 uppercase tracking-widest">{config.footer}</h4>
                                <textarea
                                    value={studentGuidanceAnswers['footer_text'] || ''}
                                    onChange={e => setStudentGuidanceAnswers({...studentGuidanceAnswers, 'footer_text': e.target.value})}
                                    className="w-full h-40 bg-white border-2 border-[#005C69]/20 rounded-2xl p-6 outline-none focus:border-[#005C69] transition-all text-gray-800 font-medium placeholder:italic"
                                    placeholder="Düşüncelerinizi buraya yazabilirsiniz..."
                                />
                            </div>
                        )}
                    </div>
                )}
                {config?.type === 'ogrenme_stilleri' && (
                    <div className="max-w-5xl mx-auto overflow-hidden rounded-2xl border border-gray-300 shadow-lg mb-12">
                        <div className="bg-gray-100 p-8 border-b border-gray-300">
                            <h3 className="text-2xl font-black text-gray-800 uppercase text-center mb-4">{config.title}</h3>
                            <p className="text-sm font-bold text-gray-600 leading-relaxed text-center italic">{config.desc}</p>
                        </div>
                        {config.categories?.map((cat: any, catIdx: number) => (
                            <div key={cat.name} className="bg-white mb-6">
                                <div className="bg-gray-200 border-y border-gray-300 p-3">
                                    <h4 className="font-black text-gray-800 uppercase tracking-widest pl-4">{cat.name}</h4>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-300">
                                                <th className="w-16 p-3 border-r border-gray-300 text-gray-600 font-black text-center text-sm">NO</th>
                                                <th className="p-3 border-r border-gray-300 text-gray-600 font-black text-left pl-6 uppercase text-sm">İFADELER</th>
                                                <th className="w-20 p-3 text-gray-600 font-black text-center text-sm">(x)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cat.items.map((item: string, idx: number) => {
                                                const qId = `${cat.prefix}_${idx + 1}`;
                                                const isSelected = studentGuidanceAnswers[qId] === true;
                                                return (
                                                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-all group">
                                                        <td className="p-3 border-r border-gray-200 text-center font-bold text-gray-600 bg-gray-50/50">
                                                            {idx + 1}
                                                        </td>
                                                        <td className="p-3 border-r border-gray-200 text-gray-700 font-medium text-[15px] pl-6 cursor-pointer select-none"
                                                            onClick={() => setStudentGuidanceAnswers({...studentGuidanceAnswers, [qId]: !isSelected})}>
                                                            {item}
                                                        </td>
                                                        <td 
                                                            className="p-3 text-center cursor-pointer group-hover:bg-gray-100/50"
                                                            onClick={() => setStudentGuidanceAnswers({...studentGuidanceAnswers, [qId]: !isSelected})}
                                                        >
                                                            <div className={`w-8 h-8 mx-auto flex items-center justify-center transition-all ${isSelected ? 'text-gray-900' : 'text-transparent'}`}>
                                                                <span className="font-black text-2xl leading-none">x</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot className="bg-gray-50 border-t border-gray-300">
                                            <tr>
                                                <td colSpan={2} className="p-3 border-r border-gray-300 font-bold text-right text-sm text-gray-700">İşaretlenen madde toplamı</td>
                                                <td className="p-3 text-center font-black text-gray-800 text-lg">
                                                    {cat.items.filter((_: any, idx: number) => studentGuidanceAnswers[`${cat.prefix}_${idx + 1}`] === true).length}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {config?.type === 'burdon' && (
                    <BurdonTest 
                        config={config} 
                        studentGuidanceAnswers={studentGuidanceAnswers} 
                        setStudentGuidanceAnswers={setStudentGuidanceAnswers} 
                        submitGuidanceForm={submitGuidanceForm} 
                    />
                )}
                {config?.type !== 'ogrenme_stilleri' && config?.type !== 'burdon' && config?.type !== 'matrix' && config?.type !== 'story_matrix' && config?.type !== 'riba' && config?.type !== 'checklist_matrix' && config?.type !== 'yasam_pencerem' && config?.questions?.map((q: any, idx: number) => {
                    const qId = q.id || `q_${idx}`;
                    const qText = typeof q === 'string' ? q : (q.text || q.a || q.title || `Soru ${idx + 1}`);
                    const qType = typeof q === 'string' ? 'text' : (q.type || 'text');
                    return (
                    <div key={qId} className="bg-gray-50/30 p-8 rounded-[32px] border border-gray-100/50">
                        <p className="font-bold text-gray-800 mb-6 text-lg leading-relaxed flex gap-4">
                            <span className="text-blue-600 font-black">{idx + 1}.</span>
                            {qText}
                        </p>
                        {qType === 'text' && (
                            <textarea 
                                value={studentGuidanceAnswers[qId] || ''} 
                                onChange={e => {
                                    const val = e.target.value;
                                    if(val.length <= 1000) {
                                       setStudentGuidanceAnswers({...studentGuidanceAnswers, [qId]: val});
                                    }
                                }}
                                maxLength={1000}
                                className="w-full border border-gray-200 p-6 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none h-40 text-base font-medium bg-white"
                                placeholder="Cevabınızı buraya yazınız... (Maksimum 1000 karakter)"
                            />
                        )}
                        {qType === 'yesno' && (
                            <div className="flex gap-4">
                                <label className={`flex-1 flex items-center justify-center gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all font-black text-sm ${studentGuidanceAnswers[qId] === 'Evet' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200 hover:text-blue-600'}`}>
                                    <input type="radio" name={qId} value="Evet" checked={studentGuidanceAnswers[qId] === 'Evet'} onChange={e => setStudentGuidanceAnswers({...studentGuidanceAnswers, [qId]: e.target.value})} className="hidden"/>
                                    Evet
                                </label>
                                <label className={`flex-1 flex items-center justify-center gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all font-black text-sm ${studentGuidanceAnswers[qId] === 'Hayır' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200 hover:text-blue-600'}`}>
                                    <input type="radio" name={qId} value="Hayır" checked={studentGuidanceAnswers[qId] === 'Hayır'} onChange={e => setStudentGuidanceAnswers({...studentGuidanceAnswers, [qId]: e.target.value})} className="hidden"/>
                                    Hayır
                                </label>
                            </div>
                        )}
                        {qType === 'likert' && (
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                                {q.options?.map((opt: string) => (
                                    <label key={opt} className={`flex items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all font-bold text-xs text-center ${studentGuidanceAnswers[qId] === opt ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200 hover:text-blue-600'}`}>
                                        <input type="radio" name={qId} value={opt} checked={studentGuidanceAnswers[qId] === opt} onChange={e => setStudentGuidanceAnswers({...studentGuidanceAnswers, [qId]: e.target.value})} className="hidden"/>
                                        {opt}
                                    </label>
                                ))}
                            </div>
                        )}
                        {qType === 'matrix' && (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                {q.options?.map((opt: string) => {
                                    const isSelected = (studentGuidanceAnswers[qId] || []).includes(opt);
                                    return (
                                        <label key={opt} className={`flex items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all font-bold text-xs text-center ${isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200 hover:text-blue-600'}`}>
                                            <input type="checkbox" checked={isSelected} onChange={(e) => {
                                                const current = studentGuidanceAnswers[qId] || [];
                                                if(e.target.checked) setStudentGuidanceAnswers({...studentGuidanceAnswers, [qId]: [...current, opt]});
                                                else setStudentGuidanceAnswers({...studentGuidanceAnswers, [qId]: current.filter((c:string)=>c!==opt)});
                                            }} className="hidden"/>
                                            {opt}
                                        </label>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )})}
            </div>
            {config?.type !== 'burdon' && (
                <div className="mt-12 flex justify-end pt-10 border-t border-gray-50">
                    <button onClick={() => submitGuidanceForm(config?.id)} className="bg-blue-600 text-white px-12 py-5 rounded-[24px] font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center gap-3">
                        <CheckCircle size={22}/> Formu Tamamla ve Gönder
                    </button>
                </div>
            )}
        </div>
    );
  }

  // MAIN DASHBOARD (Homework/Guidance List)
  return (
    <div className="animate-in fade-in duration-500 space-y-12 pb-20">
        
        {/* Student Global Stats Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-[48px] text-white shadow-2xl shadow-blue-200 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-white/20 transition-all duration-700"></div>
                <div className="relative z-10 text-center md:text-left">
                    <h2 className="text-4xl font-black tracking-tight mb-2">Selam, {currentUser.name}!</h2>
                    <p className="text-blue-100 font-bold text-lg">Başarıya giden yolda emin adımlarla ilerliyorsun.</p>
                    <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
                        <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-3">
                            <TrendingUp size={20} className="text-blue-200"/>
                            <span className="font-black text-xl">{totalCorrect} <span className="text-sm font-bold text-blue-200 ml-1 uppercase">Doğru Cevap</span></span>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-3">
                            <Award size={20} className="text-blue-200"/>
                            <span className="font-black text-xl">{myBadges.length} <span className="text-sm font-bold text-blue-200 ml-1 uppercase">Rozet</span></span>
                        </div>
                    </div>
                </div>
                <div className="relative z-10 bg-white/10 p-6 rounded-[32px] backdrop-blur-md border border-white/10">
                    <CheckCircle size={80} strokeWidth={2.5} className="text-white drop-shadow-lg"/>
                </div>
            </div>

            <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-xl flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200 mb-6">
                    {myBadges.length > 0 ? (
                        <div className="text-5xl">{myBadges[myBadges.length - 1].emoji}</div>
                    ) : (
                        <Award size={40}/>
                    )}
                </div>
                <h3 className="font-black text-xl text-blue-900 mb-2">Son Kazandığın Rozet</h3>
                <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">{myBadges.length > 0 ? myBadges[myBadges.length - 1].title : 'Henüz Rozet Yok'}</p>
            </div>
        </div>

        {/* Badges Section (Small horizontal scroll) */}
        {myBadges.length > 0 && (
            <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[3px] ml-4">Kazandığım Rozetler</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 px-4 scrollbar-hide">
                    {myBadges.map((badge: any) => (
                        <div key={badge.id} className="min-w-[120px] bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center gap-2 hover:scale-105 transition-all">
                            <span className="text-4xl">{badge.emoji}</span>
                            <span className="text-[10px] font-black text-blue-900 uppercase text-center leading-tight">{badge.title}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {section === 'homework' && (
            <div className="space-y-8">
                <div className="flex items-center justify-between px-4">
                    <h3 className="text-2xl font-black text-blue-900 tracking-tight">Atanan Ödevler</h3>
                    <div className="bg-gray-100 px-4 py-2 rounded-xl text-xs font-bold text-gray-500 uppercase tracking-widest">
                        {myAssignments.length} Aktif Görev
                    </div>
                </div>

                {myAssignments.length === 0 ? (
                    <div className="bg-white p-16 rounded-[48px] border border-gray-100 text-center flex flex-col items-center gap-6">
                        <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-100">
                            <BookOpen size={48}/>
                        </div>
                        <p className="text-gray-400 font-bold text-xl">Harika! Şu an çözmen gereken bir ödev yok.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {myAssignments.map((a: any) => {
                            const progId = `${currentUser.id}_${a.id}`;
                            const prog = hwProgress[progId];
                            const totalQ = a.questions?.length || a.words?.length || 0;
                            const isCompleted = prog?.completed;
                            const remainingQ = isCompleted ? 0 : (prog?.remainingIndices?.length ?? totalQ);
                            const completedQ = totalQ - remainingQ;
                            const percent = totalQ > 0 ? Math.round((completedQ / totalQ) * 100) : 0;
                            
                            const now = new Date();
                            const tzOffset = now.getTimezoneOffset() * 60000;
                            const todayStr = new Date(now.getTime() - tzOffset).toISOString().split('T')[0];
                            const pastDue = a.dueDate && a.dueDate < todayStr && !isCompleted;
                            
                            return (
                                <div key={a.id} className={`bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col h-full group transition-all duration-500 relative overflow-hidden ${pastDue ? 'opacity-80 grayscale-[50%]' : 'hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-50'}`}>
                                    <div className="mb-8">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                                {a.type === 'dogruYanlis' ? 'D/Y' : a.type === 'bosluk' ? 'Boşluk' : a.type === 'coktanSecmeli' ? 'Test' : 'Kelime'}
                                            </div>
                                            {isCompleted && (
                                                <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg border border-emerald-100">
                                                    <CheckCircle size={14}/>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-black text-xl text-blue-900 tracking-tight leading-tight mb-2 group-hover:text-blue-600 transition-colors">{a.title}</h3>
                                        <div className="flex items-center gap-3">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{totalQ} SORU</p>
                                            {a.dueDate && (
                                                <p className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${pastDue ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                                                    Son: {new Date(a.dueDate).toLocaleDateString('tr-TR')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3 mb-10">
                                        <div className="flex justify-between items-end px-1">
                                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">İlerleme: %{percent}</span>
                                            <span className="text-xs font-black text-blue-600 leading-none">{completedQ} / {totalQ}</span>
                                        </div>
                                        <div className="w-full bg-gray-50 rounded-full h-3 overflow-hidden p-[2px]">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : (pastDue ? 'bg-red-400' : 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.3)]')}`} 
                                                style={{width: `${percent}%`}}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="mt-auto">
                                        <button 
                                            onClick={() => {
                                                if (pastDue) {
                                                    setAppToast({ message: 'Bu ödevin son teslim tarihi geçtiği için açılamaz.', type: 'error' });
                                                    return;
                                                }
                                                startHomework(a);
                                            }} 
                                            className={`w-full py-5 rounded-[24px] font-black text-base transition-all flex items-center justify-center gap-3 active:scale-95 ${
                                                isCompleted 
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100' 
                                                    : pastDue 
                                                        ? 'bg-red-50 text-red-500 border border-red-100 cursor-not-allowed'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100 hover:shadow-2xl'
                                            }`}
                                        >
                                            {isCompleted ? <Activity size={20}/> : pastDue ? <X size={20}/> : (percent > 0 ? <TrendingUp size={20}/> : <PlayCircle size={20} fill="currentColor" className="text-white"/>)}
                                            {isCompleted ? 'Tekrar Çöz' : pastDue ? 'Süresi Doldu' : (percent > 0 ? 'Devam Et' : 'Başla')}
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        )}

        {section === 'guidance' && (
            <div className="space-y-8">
                <div className="flex items-center justify-between px-4">
                    <h3 className="text-2xl font-black text-blue-900 tracking-tight">Rehberlik Formları</h3>
                </div>

                {myGuidanceForms.length === 0 ? (
                    <div className="bg-white p-16 rounded-[48px] border border-gray-100 text-center flex flex-col items-center gap-6">
                        <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-100">
                            <FileText size={48}/>
                        </div>
                        <p className="text-gray-400 font-bold text-xl">Doldurman gereken bir rehberlik formu bulunmuyor.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                        {myGuidanceForms.map((config) => {
                            const key = config.id;
                            const isCompleted = guidanceForms.some((f: any) => f.studentId === currentUser.id && f.formType === key);
                            return (
                                <div key={key} className={`p-10 rounded-[48px] border shadow-sm flex flex-col h-full transition-all group duration-500 relative ${isCompleted ? 'bg-gray-50/50 border-gray-100 grayscale hover:grayscale-0' : 'bg-white border-gray-100 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-50'}`}>
                                    <div className="flex items-start justify-between mb-10">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isCompleted ? 'bg-gray-200 text-gray-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                            <FileQuestion size={28}/>
                                        </div>
                                        {isCompleted ? (
                                            <span className="bg-emerald-50 text-emerald-600 px-5 py-2 rounded-xl text-xs font-black border border-emerald-100 flex items-center gap-2"><CheckCircle size={14}/> Dolduruldu</span>
                                        ) : (
                                            <span className="bg-orange-50 text-orange-600 px-5 py-2 rounded-xl text-xs font-black border border-orange-100 flex items-center gap-2 animate-pulse"><Clock size={14}/> BEKLİYOR</span>
                                        )}
                                    </div>
                                    <h3 className={`font-black text-2xl mb-3 tracking-tight ${isCompleted ? 'text-gray-500' : 'text-blue-900'}`}>{config.title}</h3>
                                    <p className="text-sm font-medium text-gray-400 mb-12 leading-relaxed line-clamp-3">{config.desc || 'Anket formunu doldurmak için lütfen butona tıklayınız.'}</p>
                                    <div className="mt-auto">
                                        <div className="flex flex-col gap-2">
                                            {(!isCompleted && currentUser?.guidanceDrafts?.[key]) && (
                                                <div className="text-center font-bold text-orange-500 text-sm animate-pulse mb-2">
                                                    Henüz formu göndermediniz.
                                                </div>
                                            )}
                                            <button 
                                                onClick={() => {
                                                    if (!isCompleted) {
                                                        const existingDraft = currentUser?.guidanceDrafts?.[key];
                                                        setStudentGuidanceAnswers(existingDraft || {});
                                                        setStudentGuidanceForm(key);
                                                    }
                                                }} 
                                                disabled={isCompleted}
                                                className={`w-full py-6 rounded-[28px] font-black text-lg transition-all flex items-center justify-center gap-3 ${isCompleted ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100'}`}
                                            >
                                                {isCompleted ? 'Geri Bildirim Gönderildi' : 'Formu Doldur'}
                                                {!isCompleted && <ChevronRight size={22}/>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        )}
    </div>
  );
};
