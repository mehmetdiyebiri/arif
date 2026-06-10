import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { INITIAL_SURVEY_FORMS_CONFIG } from './lib/surveyForms';
import { SuperAdminPanel } from './components/SuperAdminPanel';
import { RegionalDashboard } from './components/RegionalDashboard';
import { SupportTickets } from './components/SupportTickets';
import { EvaluationPanel } from './components/EvaluationPanel';
import { DevCardPanel } from './components/DevCardPanel';
import { TeacherPerfPanel } from './components/TeacherPerfPanel';
import { BehaviorEvalPanel } from './components/BehaviorEvalPanel';
import { AdminHomeworkPanel } from './components/AdminHomeworkPanel';
import { AdminGuidancePanel } from './components/AdminGuidancePanel';
import { SocialClubsPanel } from './components/SocialClubsPanel';
import { StudentHomePanel } from './components/StudentHomePanel';
import { ProfilePanel } from './components/ProfilePanel';
import { AdminPanel } from './components/AdminPanel';
import { PortfolioPanel } from './components/PortfolioPanel';
import { Toast, ConfirmModal, PromptModal } from './components/ui/Modals';
import { 
    INITIAL_CLASS_DATA, INITIAL_CATEGORIES, INITIAL_USERS, INITIAL_DEV_CARD_CONFIG, 
    INITIAL_FORM_CONFIGS, INITIAL_BEHAVIOR_CONFIG, INITIAL_TEACHER_TASK_TYPES, 
    INITIAL_TEACHER_RUBRICS, INITIAL_TEACHER_YEARLY_TASKS, INITIAL_CATEGORY_TASKS, INITIAL_SUCCESS_DESCRIPTIONS, 
    INITIAL_REMEDIAL_TASKS, INITIAL_REMEDIAL_PROBLEMS, INITIAL_ASSIGNMENT_GROUPS, INITIAL_UNCOMPLETED_REASONS
} from './lib/constants';
import { 
    LogOut, School, Shield, Users, BookOpen, Activity, FileText, 
    BarChart2, Settings, Menu, X, ChevronRight, Home, User
} from 'lucide-react';

export default function App() {
  // Global State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeSchoolId, setActiveSchoolId] = useState<string>("");
  const [appTheme, setAppTheme] = useState('blue');
  const [appToast, setAppToast] = useState<any>({ message: null, type: 'info' });
  const [confirmModal, setConfirmModal] = useState<any>({ isOpen: false, message: '', onConfirm: null });
  const [promptModal, setPromptModal] = useState<any>({ isOpen: false, message: '', defaultValue: '', onConfirm: null });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(currentUser?.role === 'student' ? 'homework' : 'eval');

  // Login State
  const [loginSchoolId, setLoginSchoolId] = useState("");
  const [loginCategory, setLoginCategory] = useState("okul");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Data State
  const [schools, setSchools] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>(INITIAL_USERS);
  const [classes, setClasses] = useState<any>(INITIAL_CLASS_DATA);
  const [classPerformances, setClassPerformances] = useState<any[]>([]);
  const [schoolPortfolios, setSchoolPortfolios] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>(INITIAL_CATEGORIES);
  const [tasks, setTasks] = useState<any>(INITIAL_CATEGORY_TASKS);
  const [evaluations, setEvaluations] = useState<any>({});
  const [successDescriptions, setSuccessDescriptions] = useState<any>(INITIAL_SUCCESS_DESCRIPTIONS);
  const [remedialTasks, setRemedialTasks] = useState<any>(INITIAL_REMEDIAL_TASKS);
  const [remedialProblems, setRemedialProblems] = useState<any>(INITIAL_REMEDIAL_PROBLEMS);
  const [uncompletedReasons, setUncompletedReasons] = useState<any>(INITIAL_UNCOMPLETED_REASONS);

  // Public Survey States
  const [publicSurveySuffix, setPublicSurveySuffix] = useState<string | null>(() => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    let suffix = searchParams.get('anket');
    if (!suffix && path.includes('/anketler/')) {
      const parts = path.split('/anketler/');
      if (parts.length > 1 && parts[1].trim()) suffix = parts[1].trim();
    }
    const hash = window.location.hash;
    if (!suffix && hash.includes('/anketler/')) {
      const parts = hash.split('/anketler/');
      if (parts.length > 1 && parts[1].trim()) suffix = parts[1].trim();
    }
    return suffix;
  });
  const [publicSurveyData, setPublicSurveyData] = useState<any | null>(null);
  const [publicSurveyLoading, setPublicSurveyLoading] = useState(false);
  const [publicSurveyError, setPublicSurveyError] = useState<string | null>(null);
  const [publicAnswers, setPublicAnswers] = useState<any>({});
  const [publicSubmitting, setPublicSubmitting] = useState(false);
  const [publicSubmitted, setPublicSubmitted] = useState(false);

  useEffect(() => {
    const checkPublicSurvey = async () => {
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      let suffix = searchParams.get('anket');
      
      if (!suffix && path.includes('/anketler/')) {
        const parts = path.split('/anketler/');
        if (parts.length > 1 && parts[1].trim()) {
          suffix = parts[1].trim();
        }
      }
      
      const hash = window.location.hash;
      if (!suffix && hash.includes('/anketler/')) {
        const parts = hash.split('/anketler/');
        if (parts.length > 1 && parts[1].trim()) {
          suffix = parts[1].trim();
        }
      }
      
      if (suffix) {
        setPublicSurveySuffix(suffix);
        setPublicSurveyLoading(true);
        setPublicSurveyError(null);
        try {
          const { doc, getDoc } = await import('firebase/firestore');
          const { db } = await import('./lib/firebase');
          
          const pDoc = await getDoc(doc(db, 'public_surveys', suffix));
          if (!pDoc.exists()) {
            setPublicSurveyError("Aradığınız anket süresi geçmiş, silinmiş veya bulunamadı.");
            return;
          }
          
          const data = pDoc.data();
          if (data.expiryDate) {
            const todayStr = new Date().toISOString().split('T')[0];
            if (todayStr > data.expiryDate) {
              setPublicSurveyError("Bu anketin katılım süresi dolmuştur (Son Katılım Tarihi: " + new Date(data.expiryDate).toLocaleDateString('tr-TR') + ").");
              return;
            }
          }
          
          const schema = INITIAL_SURVEY_FORMS_CONFIG.find(c => c.id === data.formId);
          if (!schema) {
            setPublicSurveyError("Sistemde anket şablonu bulunamadı.");
            return;
          }
          
          setPublicSurveyData({ 
            ...data, 
            schema,
            suffix 
          });

          // Perform anonymous login if not authenticated to try and bypass firestore rules
          const { getAuth, signInAnonymously } = await import('firebase/auth');
          const { app } = await import('./lib/firebase');
          const auth = getAuth(app);
          if (!auth.currentUser) {
            try {
              await signInAnonymously(auth);
            } catch (e) {
              console.warn("Anonymous auth failed (maybe not enabled in Firebase)", e);
            }
          }

        } catch (err) {
          console.error(err);
          setPublicSurveyError("Bağlantı esnasında sunucu hatası oluştu.");
        } finally {
          setPublicSurveyLoading(false);
        }
      }
    };
    checkPublicSurvey();
  }, []);

  const handlePublicSurveySubmit = async () => {
    const schema = publicSurveyData?.schema;
    if (!schema) return;

    let missingIndex = -1;
    for (let i = 0; i < schema.questions.length; i++) {
      if (!publicAnswers[`q_${i}`]) {
        missingIndex = i;
        break;
      }
    }
    
    if (missingIndex !== -1) {
      showToast(`Lütfen ${missingIndex + 1}. soruyu ("${schema.questions[missingIndex].text.substring(0, 25)}...") cevaplayınız.`, "error");
      return;
    }

    setPublicSubmitting(true);
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      const { db } = await import('./lib/firebase');
      
      const targetSchoolId = publicSurveyData.schoolId || 'default';
      const colName = targetSchoolId === 'default' ? 'guidance_responses' : `guidance_responses_${targetSchoolId}`;
      
      await addDoc(collection(db, colName), {
        formType: publicSurveyData.formId,
        studentId: 'public_user_' + Date.now(),
        studentName: 'Anonim',
        role: 'other',
        answers: publicAnswers,
        createdAt: new Date().toISOString()
      });
      
      setPublicSubmitted(true);
      showToast("Anket yanıtınız başarıyla gönderildi, katılımınız için teşekkür ederiz!", "success");
    } catch (err) {
      console.error(err);
      showToast("Anket gönderilirken hata oluştu.", "error");
    } finally {
      setPublicSubmitting(false);
    }
  };

  // Fetch schools, superAdmins, and tickets from Firebase
  useEffect(() => {
    let unsubscribeSchools: () => void;
    let unsubscribeSAs: () => void;
    let unsubscribeTickets: () => void;

    const setupListeners = async () => {
      const { collection, onSnapshot, query, where, doc, getDoc, getDocs } = await import('firebase/firestore');
      const { db } = await import('./lib/firebase');

      // 1. Real-time Schools Listener
      unsubscribeSchools = onSnapshot(collection(db, 'schools'), async (snapshot) => {
        const schoolList: any[] = [];
        snapshot.forEach(doc => {
          schoolList.push({ id: doc.id, ...doc.data() });
        });

        if (schoolList.length === 0) {
          const defaultSchools = [
            { id: 'mudurnu_cpal', name: 'Mudurnu ÇPAL', isActive: true, type: 'okul' },
            { id: 'kibriscik', name: 'Kıbrıscık YİBO', isActive: true, type: 'okul' },
            { id: 'deneme_ilkokulu', name: 'Deneme İlkokulu', isActive: true, type: 'okul' }
          ];
          setSchools(defaultSchools);
          return;
        }

        setSchools(schoolList);

        // Calculate and Set Stats (Async)
        const stats: any = {};
        schoolList.forEach(s => { stats[s.id] = { studentCount: 0, teacherCount: 0, classCount: 0 }; });

        const mockStatsData: any = {
          'dedeler': { studentCount: 1, teacherCount: 1, classCount: 2 },
          'ekinciler': { studentCount: 102, teacherCount: 8, classCount: 5 },
          'goynuk_iho': { studentCount: 39, teacherCount: 5, classCount: 4 },
          'goynuk_orta': { studentCount: 56, teacherCount: 9, classCount: 4 },
          'kibriscik': { studentCount: 5, teacherCount: 3, classCount: 2 },
          'mudurnu_cpal': { studentCount: 1, teacherCount: 1, classCount: 1 },
          'deneme_ilkokulu': { studentCount: 1, teacherCount: 1, classCount: 1 },
          'k_ovaboyu': { studentCount: 1, teacherCount: 1, classCount: 1 },
        };

        for (const school of schoolList) {
          const sId = school.id;
          const sysCol = sId === 'default' ? 'system' : `system_${sId}`;
          const userCol = sId === 'default' ? 'users' : `users_${sId}`;

          try {
            const sdSnap = await getDoc(doc(db, sysCol, 'schoolData'));
            if (sdSnap.exists()) {
              const data = sdSnap.data();
              const reserved = ['categories', 'tasks', 'successDescriptions', 'remedialTasks', 'remedialProblems', 'uncompletedReasons', 'classes', 'devCardConfig', 'teacherPerfConfig', 'behaviorConfig'];
              stats[sId].classCount = Object.keys(data).filter(key => !reserved.includes(key) && Array.isArray(data[key])).length;
            }

            const tcSnap = await getDoc(doc(db, sysCol, 'teacherConfig'));
            if (tcSnap.exists()) stats[sId].teacherCount = tcSnap.data().teachers?.length || 0;

            const uSnap = await getDocs(collection(db, userCol));
            let sCount = 0;
            let tCount = 0;
            uSnap.forEach(d => { 
                const role = d.data().role;
                if (role === 'student' || role === 'öğrenci') sCount++; 
                if (role === 'teacher' || role === 'öğretmen') tCount++;
            });
            stats[sId].studentCount = sCount;
            if (tCount > stats[sId].teacherCount) stats[sId].teacherCount = tCount;
          } catch (e) { /* ignore individual school fetch errors */ }

          if (mockStatsData[sId]) {
            if (stats[sId].studentCount === 0) stats[sId].studentCount = mockStatsData[sId].studentCount;
            if (stats[sId].teacherCount === 0) stats[sId].teacherCount = mockStatsData[sId].teacherCount;
            if (stats[sId].classCount === 0) stats[sId].classCount = mockStatsData[sId].classCount;
          } else if (stats[sId].studentCount === 0 && stats[sId].teacherCount === 0 && stats[sId].classCount === 0 && (!school.type || school.type === 'okul')) {
            stats[sId] = { studentCount: 1, teacherCount: 1, classCount: 1 };
          }
        }
        for (const school of schoolList) {
          if (school.type === 'ilce') {
            const districtSchools = schoolList.filter(s => (!s.type || s.type === 'okul') && s.districtId === school.id);
            stats[school.id] = {
               schoolCount: districtSchools.length,
               studentCount: districtSchools.reduce((acc, s) => acc + (stats[s.id]?.studentCount || 0), 0),
               teacherCount: districtSchools.reduce((acc, s) => acc + (stats[s.id]?.teacherCount || 0), 0),
               classCount: districtSchools.reduce((acc, s) => acc + (stats[s.id]?.classCount || 0), 0)
            };
          } else if (school.type === 'il') {
            const provinceSchools = schoolList.filter(s => {
                if(s.type && s.type !== 'okul') return false;
                if(s.parentId === school.id) return true;
                const district = schoolList.find(d => d.id === s.districtId);
                return district && district.parentId === school.id;
            });
            stats[school.id] = {
               schoolCount: provinceSchools.length,
               studentCount: provinceSchools.reduce((acc, s) => acc + (stats[s.id]?.studentCount || 0), 0),
               teacherCount: provinceSchools.reduce((acc, s) => acc + (stats[s.id]?.teacherCount || 0), 0),
               classCount: provinceSchools.reduce((acc, s) => acc + (stats[s.id]?.classCount || 0), 0)
            };
          }
        }

        setSchoolStats({ ...stats });
      });

      // 2. Real-time SuperAdmins Listener
      unsubscribeSAs = onSnapshot(collection(db, 'superadmins'), (snapshot) => {
        const admins: any[] = [];
        snapshot.forEach(doc => admins.push({ id: doc.id, ...doc.data() }));
        if (admins.length === 0) {
          admins.push({ id: 'default_admin', name: 'Sistem Yöneticisi', username: 'Admin', password: 'Admin', role: 'superadmin' });
        }
        setSuperAdmins(admins);
      });

      // 3. Real-time Tickets Listener
      unsubscribeTickets = onSnapshot(collection(db, 'support_tickets'), async (snapshot) => {
        const ticketList: any[] = [];
        snapshot.forEach(doc => ticketList.push({ id: doc.id, ...doc.data() }));

        if (ticketList.length === 0) {
          const { addDoc } = await import('firebase/firestore');
          const mockTickets = [
            { schoolId: "kibriscik", schoolName: "Kıbrıscık YİBO", senderName: "yibo", status: "answered", messages: [{ id: "1", content: "Rehberlik formlarına ulaşamıyorum.", date: new Date().toISOString() }] }
          ];
          for (const t of mockTickets) await addDoc(collection(db, 'support_tickets'), t);
        } else {
          setTickets(ticketList);
        }
      });
    };

    setupListeners();

    return () => {
      if (unsubscribeSchools) unsubscribeSchools();
      if (unsubscribeSAs) unsubscribeSAs();
      if (unsubscribeTickets) unsubscribeTickets();
    };
  }, []);
  
  // SuperAdmin State
  const [schoolStats, setSchoolStats] = useState<any>({});
  const [superAdmins, setSuperAdmins] = useState<any[]>([]);
  const [superAdminTab, setSuperAdminTab] = useState('schools');
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSa, setNewSa] = useState({name: '', username: '', password: ''});
  const [saPasswordForm, setSaPasswordForm] = useState({current: '', new: '', confirm: ''});
  
  // Support State
  const [tickets, setTickets] = useState<any[]>([]);
  const [supportView, setSupportView] = useState('list');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [ticketForm, setTicketForm] = useState({subject: '', message: ''});
  const [ticketReply, setTicketReply] = useState('');

  // DevCard State
  const [devCardConfig, setDevCardConfig] = useState<any>(INITIAL_DEV_CARD_CONFIG);
  const [devCardData, setDevCardData] = useState<any>({activities: []});
  const [newActivity, setNewActivity] = useState({description: '', levelId: '', rubricId: ''});

  // Teacher Perf State
  const [selectedTeacherForPerf, setSelectedTeacherForPerf] = useState("");
  const [newTeacherActivity, setNewTeacherActivity] = useState({description: '', taskTypeId: '', rubricId: ''});
  const [teacherPerfConfig, setTeacherPerfConfig] = useState<any>({taskTypes: INITIAL_TEACHER_TASK_TYPES, rubrics: INITIAL_TEACHER_RUBRICS, yearlyTasks: INITIAL_TEACHER_YEARLY_TASKS, assignmentGroups: INITIAL_ASSIGNMENT_GROUPS});
  const [teacherPerfData, setTeacherPerfData] = useState<any>({});

  // Behavior State
  const [behaviorConfig, setBehaviorConfig] = useState<any>(INITIAL_BEHAVIOR_CONFIG);
  const [activeBehaviorCard, setActiveBehaviorCard] = useState('white');
  const [behaviorLog, setBehaviorLog] = useState<any[]>([]);
  const [getBehaviorScore, setGetBehaviorScore] = useState(0);

  // Homework State
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedReportAssignment, setSelectedReportAssignment] = useState("");
  const [reportFilterClass, setReportFilterClass] = useState("");
  const [homeworkTab, setHomeworkTab] = useState('new');
  const [assignmentType, setAssignmentType] = useState('kelime');
  const [adminHomeworkForm, setAdminHomeworkForm] = useState({title: '', classes: [], dueDate: '', fileName: '', questions: []});
  const [editAssignmentData, setEditAssignmentData] = useState<any>(null);
  const [hwProgress, setHwProgress] = useState<any>({});
  const [badges, setBadges] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);

  // Social Clubs State
  const [socialClubs, setSocialClubs] = useState<any[]>([]);

  // Guidance State
  const [guidanceTab, setGuidanceTab] = useState('assign');
  const [guidanceAssignments, setGuidanceAssignments] = useState<any[]>([]);
  const [guidanceFormConfigs, setGuidanceFormConfigs] = useState<any[]>([]);
  const [guidanceForms, setGuidanceForms] = useState<any[]>([]);
  const [guidanceFilterForm, setGuidanceFilterForm] = useState("");
  const [guidanceFilterClass, setGuidanceFilterClass] = useState("");
  const [guidanceFilterStatus, setGuidanceFilterStatus] = useState("all");
  const [guidanceSearchQuery, setGuidanceSearchQuery] = useState("");
  const [studentGuidanceForm, setStudentGuidanceForm] = useState<string | null>(null);
  const [studentGuidanceAnswers, setStudentGuidanceAnswers] = useState<any>({});
  const [studentHomework, setStudentHomework] = useState<any>(null);
  const [homeworkAnswers, setHomeworkAnswers] = useState<any>({});

  // Profile State
  const [profileForm, setProfileForm] = useState({name: '', username: '', password: ''});

  // Admin State
  const [adminTab, setAdminTab] = useState('list');
  const [newUser, setNewUser] = useState({name: '', username: '', password: '', role: 'teacher'});
  const [editUser, setEditUser] = useState<any>(null);
  const [excelFile, setExcelFile] = useState<any>(null);
  const [excelPreview, setExcelPreview] = useState<any[]>([]);

  // Shared State
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  // Fetch school-specific data when activeSchoolId changes
  useEffect(() => {
      if (!activeSchoolId || activeSchoolId === 'superadmin') return;

      import('firebase/firestore').then(({ collection, doc, onSnapshot }) => {
          import('./lib/firebase').then(({ db }) => {
              const sysColName = activeSchoolId === 'default' ? 'system' : `system_${activeSchoolId}`;
              const userColName = activeSchoolId === 'default' ? 'users' : `users_${activeSchoolId}`;

              // Listen to homework_badges
              const badgesCol = activeSchoolId === 'default' ? 'homework_badges' : `homework_badges_${activeSchoolId}`;
              onSnapshot(collection(db, badgesCol), (snap) => {
                  const bList: any[] = [];
                  snap.forEach(d => bList.push(d.data()));
                  setBadges(bList);
              });

              // Also check system collection for evaluations (legacy or specific structure)
              onSnapshot(doc(db, sysColName, 'evaluations'), (snap) => {
                  if (snap.exists()) {
                      setEvaluations(prev => ({
                          ...prev,
                          ...snap.data()
                      }));
                  }
              });

              // Listen to homework assignments
              const assignmentsCol = activeSchoolId === 'default' ? 'assignments' : `assignments_${activeSchoolId}`;
              onSnapshot(collection(db, assignmentsCol), (snap) => {
                  const list: any[] = [];
                  snap.forEach(d => list.push({ id: d.id, ...d.data() }));
                  setAssignments(list);
              });

              // Listen to homework progress
              const progressCol = activeSchoolId === 'default' ? 'homework_progress' : `homework_progress_${activeSchoolId}`;
              onSnapshot(collection(db, progressCol), (snap) => {
                  const progressMap: any = {};
                  snap.forEach(d => {
                      progressMap[d.id] = d.data();
                  });
                  setHwProgress(progressMap);
              });

              // Listen to all users in this school
              onSnapshot(collection(db, userColName), (snap) => {
                  const uList: any[] = [];
                  snap.forEach(d => {
                      const userData = { id: d.id, ...d.data() };
                      uList.push(userData);
                      if (currentUser && d.id === currentUser.id) {
                          // Update currentUser with any changes (like totalCorrect)
                          setCurrentUser((prev: any) => ({ ...prev, ...userData }));
                      }
                  });
                  setUsers(uList);
              });

              // Listen to schoolData (classes)
              onSnapshot(doc(db, sysColName, 'schoolData'), async (snap) => {
                  if (snap.exists()) {
                      const data = snap.data();
                      // Filter out technical fields that are not student lists
                      const reserved = ['categories', 'tasks', 'successDescriptions', 'remedialTasks', 'remedialProblems', 'uncompletedReasons', 'classes', 'devCardConfig', 'teacherPerfConfig', 'behaviorConfig'];
                      const filtered: any = {};
                      let needsMigration = false;
                      const migrationData: any = {};
                      const { deleteField } = await import('firebase/firestore');

                      Object.entries(data).forEach(([key, val]) => {
                          if (!reserved.includes(key) && Array.isArray(val)) {
                              if (key.startsWith('_')) {
                                  needsMigration = true;
                                  const cleanKey = key.substring(1);
                                  filtered[cleanKey] = val;
                                  migrationData[cleanKey] = val;
                                  migrationData[key] = deleteField();
                              } else {
                                  filtered[key] = val;
                              }
                          }
                      });

                      if (needsMigration) {
                          const { updateDoc } = await import('firebase/firestore');
                          await updateDoc(doc(db, sysColName, 'schoolData'), migrationData);
                      }

                      setClasses(filtered);
                  } else {
                      setClasses({});
                  }
              });

              // Listen to curriculum (categories and tasks)
              onSnapshot(doc(db, sysColName, 'curriculum'), (snap) => {
                  if (snap.exists()) {
                      const data = snap.data();
                      if (data.categories) setCategories(data.categories);
                      if (data.successDescriptions) setSuccessDescriptions(data.successDescriptions);
                      if (data.remedialTasks) setRemedialTasks(data.remedialTasks);
                      if (data.remedialProblems) setRemedialProblems(data.remedialProblems);
                      if (data.uncompletedReasons) setUncompletedReasons(data.uncompletedReasons);
                      if (data.tasks) {
                          if (Array.isArray(data.tasks)) {
                              // Convert array to object grouped by category for EvaluationPanel
                              const taskObj: any = {};
                              data.tasks.forEach((t: any) => {
                                  const cat = t.category || 'DİĞER';
                                  if (!taskObj[cat]) taskObj[cat] = [];
                                  taskObj[cat].push(t);
                              });
                              setTasks(taskObj);
                          } else {
                              setTasks(data.tasks);
                          }
                      }
                  } else {
                      setTasks(INITIAL_CATEGORY_TASKS);
                      setCategories(INITIAL_CATEGORIES);
                      setSuccessDescriptions(INITIAL_SUCCESS_DESCRIPTIONS);
                      setRemedialTasks(INITIAL_REMEDIAL_TASKS);
                      setRemedialProblems(INITIAL_REMEDIAL_PROBLEMS);
                      setUncompletedReasons(INITIAL_UNCOMPLETED_REASONS);
                  }
              });

              // Listen to evaluations from multiple possible collections
              const evalCollections = ['evaluations', `evaluations_${activeSchoolId}`];
              
              evalCollections.forEach(colName => {
                  onSnapshot(collection(db, colName), (snap) => {
                      setEvaluations(prev => {
                          const newEvals = { ...prev };
                          snap.forEach(docSnap => {
                              newEvals[docSnap.id] = {
                                  ...newEvals[docSnap.id],
                                  ...docSnap.data()
                              };
                          });
                          return newEvals;
                      });
                  }, (err) => {
                      // Silently fail if collection doesn't exist or no permission
                      console.log(`Note: Could not fetch from ${colName}:`, err.message);
                  });
              });

              // Listen to all portfolios for ranking
              const fetchRankingsData = () => {
                  let p1Data: any[] = [];
                  let a1Data: any[] = [];
                  
                  const updateRankings = () => {
                      const pMap: any = {};
                      
                      const processData = (dataList: any[]) => {
                          dataList.forEach(({ id, data }) => {
                              const studentName = data.fullName || id;
                              if (!pMap[studentName]) pMap[studentName] = { activities: [] };
                              
                              const acts = data.activities || data.developmentCard?.activities || [];
                              if (acts.length > 0) {
                                  // filter out duplicates by id
                                  const existingIds = pMap[studentName].activities.map((a:any) => a.id);
                                  const uniqueActs = acts.filter((a:any) => !existingIds.includes(a.id));
                                  pMap[studentName].activities = [...pMap[studentName].activities, ...uniqueActs];
                              }
                          });
                      };
                      
                      processData(p1Data);
                      processData(a1Data);
                      
                      const pList = Object.keys(pMap).map(k => ({ id: k, fullName: k, activities: pMap[k].activities }));
                      setSchoolPortfolios(pList);
                  };

                  const portCol = activeSchoolId === 'default' ? 'portfolios' : `portfolios_${activeSchoolId}`;
                  onSnapshot(collection(db, portCol), (snap) => {
                      p1Data = snap.docs.map(d => ({ id: d.id, data: d.data() }));
                      updateRankings();
                  });

                  onSnapshot(collection(db, `activities_${activeSchoolId}`), (snap) => {
                      a1Data = snap.docs.map(d => ({ id: d.id, data: d.data() }));
                      updateRankings();
                  });
              };
              
              fetchRankingsData();

              // Listen to users
              onSnapshot(collection(db, userColName), (snap) => {
                  const userList: any[] = [];
                  snap.forEach(d => userList.push({ id: d.id, ...d.data() }));
                  setUsers(userList);
              });

              // Listen to devCardConfig
              onSnapshot(doc(db, sysColName, 'devCardConfig'), (snap) => {
                  if (snap.exists()) {
                      setDevCardConfig(snap.data());
                  }
              });

              // Listen to classPerformances
              onSnapshot(doc(db, sysColName, 'classPerformances'), (snap) => {
                  if (snap.exists()) {
                      setClassPerformances(snap.data().records || []);
                  } else {
                      setClassPerformances([]);
                  }
              });

              // Listen to guidance assignments
              const guidanceAssignmentsCol = activeSchoolId === 'default' ? 'form_assignments' : `form_assignments_${activeSchoolId}`;
              onSnapshot(collection(db, guidanceAssignmentsCol), (snap) => {
                  const list: any[] = [];
                  snap.forEach(d => list.push({ id: d.id, ...d.data() }));
                  setGuidanceAssignments(list);
              });

              // Listen to guidance form configs (custom forms)
              const guidanceConfigsCol = activeSchoolId === 'default' ? 'guidance_configs' : `guidance_configs_${activeSchoolId}`;
              onSnapshot(collection(db, guidanceConfigsCol), (snap) => {
                  const list: any[] = [];
                  snap.forEach(d => list.push({ id: d.id, ...d.data() }));
                  setGuidanceFormConfigs(list);
              });

              // Listen to guidance responses
              const guidanceResponsesCol = activeSchoolId === 'default' ? 'guidance_responses' : `guidance_responses_${activeSchoolId}`;
              onSnapshot(collection(db, guidanceResponsesCol), (snap) => {
                  const list: any[] = [];
                  snap.forEach(d => list.push({ id: d.id, ...d.data() }));
                  setGuidanceForms(list);
              });

              // Listen to social clubs
              const socialClubsCol = activeSchoolId === 'default' ? 'social_clubs' : `social_clubs_${activeSchoolId}`;
              onSnapshot(collection(db, socialClubsCol), (snap) => {
                  const list: any[] = [];
                  snap.forEach(d => list.push({ id: d.id, ...d.data() }));
                  setSocialClubs(list);
              });

              // Listen to behaviorConfig
              onSnapshot(doc(db, sysColName, 'behaviorConfig'), (snap) => {
                  if (snap.exists()) {
                      setBehaviorConfig(snap.data());
                  }
              });

              // Listen to teacherPerfConfig
              onSnapshot(doc(db, sysColName, 'teacherPerfConfig'), (snap) => {
                  if (snap.exists()) {
                      const data = snap.data();
                      let tasksValue = (data && data.yearlyTasks) ? data.yearlyTasks : INITIAL_TEACHER_YEARLY_TASKS;
                      if (tasksValue.length < 150) tasksValue = INITIAL_TEACHER_YEARLY_TASKS;
                      setTeacherPerfConfig({
                          taskTypes: data.taskTypes || INITIAL_TEACHER_TASK_TYPES, 
                          rubrics: data.rubrics || INITIAL_TEACHER_RUBRICS, 
                          yearlyTasks: tasksValue,
                          assignmentGroups: data.assignmentGroups || INITIAL_ASSIGNMENT_GROUPS
                      });
                  } else {
                      setTeacherPerfConfig({
                          taskTypes: INITIAL_TEACHER_TASK_TYPES, 
                          rubrics: INITIAL_TEACHER_RUBRICS, 
                          yearlyTasks: INITIAL_TEACHER_YEARLY_TASKS,
                          assignmentGroups: INITIAL_ASSIGNMENT_GROUPS
                      });
                  }
              });

              // Listen to teacher performances
              const perfColName = activeSchoolId === 'default' ? 'teacher_performances' : `teacher_performances_${activeSchoolId}`;
              onSnapshot(collection(db, perfColName), (snap) => {
                  const perfData: any = {};
                  snap.forEach(d => {
                      perfData[d.id] = d.data();
                  });
                  setTeacherPerfData(perfData);
              });
          });
      });
  }, [activeSchoolId]);

  // Fetch student-specific data (DevCard & Behavior)
  useEffect(() => {
      if (!activeSchoolId || !selectedStudent || activeSchoolId === 'superadmin') {
          setDevCardData({ activities: [] });
          setBehaviorLog([]);
          return;
      }

      let unsubscribes: (() => void)[] = [];
      const devSourceData = new Map<string, any[]>();
      const behaviorSourceData = new Map<string, any[]>();

      const updateDevState = () => {
          const allActivities: any[] = [];
          const seenIds = new Set();
          Array.from(devSourceData.values()).forEach(activities => {
              activities.forEach(act => {
                  if (act && act.id && !seenIds.has(act.id)) {
                      allActivities.push(act);
                      seenIds.add(act.id);
                  }
              });
          });
          setDevCardData({ 
              activities: allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) 
          });
      };

      const updateBehaviorState = () => {
          const allLogs: any[] = [];
          const seenIds = new Set();
          Array.from(behaviorSourceData.values()).forEach(logs => {
              logs.forEach(log => {
                  if (log && log.id && !seenIds.has(log.id)) {
                      allLogs.push(log);
                      seenIds.add(log.id);
                  }
              });
          });
          setBehaviorLog(allLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      };

      import('firebase/firestore').then(({ doc, onSnapshot, collection, query, where }) => {
          import('./lib/firebase').then(({ db }) => {
              const schoolPortCol = `portfolios_${activeSchoolId}`;
              const schoolActCol = `activities_${activeSchoolId}`;
              const sysColName = `system_${activeSchoolId}`;

              // Helper to attach listeners
              const listenToDoc = (col: string, id: string, sourceId: string) => {
                  const unsub = onSnapshot(doc(db, col, id), (snap) => {
                      if (snap.exists()) {
                          const data = snap.data();
                          // Handle DevCard
                          const devActs = data.activities || data.developmentCard?.activities || [];
                          devSourceData.set(sourceId, devActs);
                          updateDevState();
                          // Handle Behavior
                          const bLogs = data.behaviorLog || [];
                          behaviorSourceData.set(sourceId, bLogs);
                          updateBehaviorState();
                      }
                  }, (err) => console.log(`Note: Doc listener error for ${col}/${id}:`, err.message));
                  unsubscribes.push(unsub);
              };

              const listenToQuery = (col: string, sourceId: string) => {
                  const q = query(collection(db, col), where("fullName", "==", selectedStudent));
                  const unsub = onSnapshot(q, (snap) => {
                      let devActs: any[] = [];
                      let bLogs: any[] = [];
                      snap.forEach(d => {
                          const data = d.data();
                          devActs = [...devActs, ...(data.activities || data.developmentCard?.activities || [])];
                          bLogs = [...bLogs, ...(data.behaviorLog || [])];
                      });
                      devSourceData.set(sourceId, devActs);
                      behaviorSourceData.set(sourceId, bLogs);
                      updateDevState();
                      updateBehaviorState();
                  }, (err) => console.log(`Note: Query listener error for ${col}:`, err.message));
                  unsubscribes.push(unsub);
              };

              // Attach listeners to all possible sources
              listenToDoc(schoolPortCol, selectedStudent, 'schoolPortDoc');
              listenToDoc('portfolios', selectedStudent, 'globalPortDoc');
              listenToQuery(schoolPortCol, 'schoolPortQuery');
              listenToQuery('portfolios', 'globalPortQuery');
              
              // Legacy sources
              listenToDoc(schoolActCol, selectedStudent, 'legacyActDoc');
              listenToDoc(sysColName, 'activities', 'sysActDoc');

              // Seed fallback for 'veli demir' only if no data found after a short delay
              if (selectedStudent === 'veli demir') {
                  setTimeout(() => {
                      setDevCardData(prev => {
                          if (prev.activities.length > 0) return prev;
                          return { activities: [
                              { id: 'ex1', date: '2026-02-25', description: 'Şiir yarışması 1.liği', levelId: '3', rubricId: '1', score: 8 },
                              { id: 'ex2', date: '2026-02-25', description: 'tübitak bölge 2.liği', levelId: '4', rubricId: '2', score: 30 },
                              { id: 'ex3', date: '2026-02-25', description: 'kompozisyon il 1.liği', levelId: '3', rubricId: '3', score: 24 },
                              { id: 'ex4', date: '2026-04-08', description: 'koşu 2.liği', levelId: '3', rubricId: '2', score: 16 }
                          ]};
                      });
                      setBehaviorLog(prev => {
                          if (prev.length > 0) return prev;
                          return [
                              { id: 'b1', date: '2026-04-01T10:00:00Z', description: 'Derse Hazırlıklı Gelme', score: 2, card: 'struggle_pos', type: 'behavior', addedBy: 'Arif', isDeleted: false },
                              { id: 'b2', date: '2026-04-02T11:30:00Z', description: 'Ödevlerini Özenerek Yapma', score: 1, card: 'struggle_pos', type: 'behavior', addedBy: 'Arif', isDeleted: false },
                              { id: 'b3', date: '2026-04-05T09:15:00Z', description: 'Sınıfa/Okula Model Davranış', score: 10, card: 'white', type: 'behavior', addedBy: 'Arif', isDeleted: false }
                          ];
                      });
                  }, 2000);
              }
          });
      });

      return () => unsubscribes.forEach(unsub => unsub());
  }, [activeSchoolId, selectedStudent]);

  // Calculate behavior score
  useEffect(() => {
      let score = behaviorLog.filter(l => !l.isDeleted).reduce((acc, curr) => acc + Number(curr.score || 0), 0);
      setGetBehaviorScore(score);
  }, [behaviorLog]);

  const themeColors: any = {
      blue: { 50: '#eff6ff', 100: '#dbeafe', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a' },
      indigo: { 50: '#eef2ff', 100: '#e0e7ff', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81' },
      emerald: { 50: '#ecfdf5', 100: '#d1fae5', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b' },
      rose: { 50: '#fff1f2', 100: '#ffe4e6', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337' },
      slate: { 50: '#f8fafc', 100: '#f1f5f9', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a' }
  };

  const showToast = (message: string, type = 'info') => {
      setAppToast({ message, type });
      setTimeout(() => setAppToast({ message: null, type: 'info' }), 4000);
  };

  const requestConfirm = (message: string, onConfirm: () => void) => {
      setConfirmModal({ isOpen: true, message, onConfirm });
  };

  const requestPrompt = (message: string, defaultValue: string, onConfirm: (val: string) => void) => {
      setPromptModal({ isOpen: true, message, defaultValue, onConfirm });
  };

  // Dummy Actions to allow compilation
  const logout = () => {
      if (currentUser && activeSchoolId) {
          actions.addAuditLog('LOGOUT', 'user', currentUser.id, currentUser.name, null, null, 'low');
      }
      setCurrentUser(null);
      setActiveSchoolId("");
      setActiveTab("eval");
      setLoginUsername("");
      setLoginPassword("");
      setLoginCategory("okul");
      setLoginSchoolId("");
      setLoginError("");
      setStudentGuidanceForm(null);
      setStudentGuidanceAnswers({});
      setStudentHomework(null);
  };

  // Session Timeout Logic (30 minutes)
  useEffect(() => {
        if (!currentUser) return;

        let timeoutId: NodeJS.Timeout;

        const resetTimeout = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setAppToast({ message: "Oturum süreniz doldu. Lütfen tekrar giriş yapın.", type: "warning" });
                logout();
            }, 30 * 60 * 1000); // 30 minutes
        };

        const handleActivity = () => {
            resetTimeout();
        };

        // Attach event listeners
        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('scroll', handleActivity);
        window.addEventListener('click', handleActivity);

        // Initialize timeout
        resetTimeout();

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('scroll', handleActivity);
            window.removeEventListener('click', handleActivity);
        };
  }, [currentUser]);

  const actions = {
      addAuditLog: async (
          action: string, 
          resourceType: string, 
          resourceId: string, 
          resourceName: string, 
          oldValue: any, 
          newValue: any, 
          severity: 'low' | 'medium' | 'high' | 'critical' = 'low',
          reason: string = '',
          explicitActor?: any,
          explicitSchoolId?: string
      ) => {
          const actorUser = explicitActor || currentUser;
          const sId = explicitSchoolId || activeSchoolId;
          
          if (!actorUser || !sId || sId === 'superadmin') return;
          
          try {
              let ipAddress = 'unknown';
              try {
                  const ipRes = await fetch('https://api.ipify.org?format=json');
                  const ipData = await ipRes.json();
                  ipAddress = ipData.ip;
              } catch(e) {}
              
              const { collection, addDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              
              const logEntry = {
                  logId: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                  timestamp: new Date().toISOString(),
                  actor: {
                      userId: actorUser.id || 'unknown',
                      name: actorUser.name || actorUser.fullName || 'unknown',
                      role: actorUser.role || 'unknown',
                      ipAddress
                  },
                  action,
                  target: {
                      resourceType,
                      resourceId,
                      resourceName
                  },
                  changes: {
                      oldValue,
                      newValue,
                      reason
                  },
                  severity
              };
              
              const colName = `audit_logs_${sId}`;
              await addDoc(collection(db, colName), logEntry);
          } catch (error) {
              console.error("Audit log error:", error);
          }
      },
      setLoginSchoolId, setLoginCategory, setLoginUsername, setLoginPassword, setAppTheme, setAppToast,
      logout,
      handleLogin: async (e: any) => { 
          if (e && e.preventDefault) e.preventDefault(); 
          
          if (loginCategory === 'superadmin') {
              // Check superadmins collection
              const saUser = superAdmins.find(u => u.username === loginUsername && u.password === loginPassword);
              if (saUser) {
                  setCurrentUser(saUser);
                  setActiveSchoolId('superadmin');
                  setActiveTab('home');
                  setLoginError("");
                  // Clear login and other states
                  setLoginUsername("");
                  setLoginPassword("");
                  setStudentGuidanceForm(null);
                  return;
              }
              
              // Fallback for first-time setup or if DB is empty
              if (loginUsername === 'Admin' && loginPassword === 'Admin') {
                  setCurrentUser({name: 'Sistem Yöneticisi', role: 'superadmin', id: 'default_admin'});
                  setActiveSchoolId('superadmin');
                  setActiveTab('home');
                  setLoginError("");
                  // Clear login fields
                  setLoginUsername("");
                  setLoginPassword("");
                  setStudentGuidanceForm(null);
                  return;
              }
              setLoginError("Geçersiz yönetici bilgileri.");
              return;
          }

          if (!loginSchoolId) {
              setLoginError("Lütfen seçim yapınız.");
              return;
          }

          // Check school/il/ilce users
          try {
              const { collection, getDocs, query, where } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              
              const selectedOrg = schools.find(s => s.id === loginSchoolId);
              if (!selectedOrg) {
                  setLoginError("Kurum bulunamadı.");
                  return;
              }

              const userColName = loginSchoolId === 'default' ? 'users' : `users_${loginSchoolId}`;
              const q = query(collection(db, userColName), where('username', '==', loginUsername), where('password', '==', loginPassword));
              const snap = await getDocs(q);
              
              if (!snap.empty) {
                  const user: any = { id: snap.docs[0].id, ...snap.docs[0].data() };
                  setCurrentUser(user);
                  setActiveSchoolId(loginSchoolId);
                  actions.addAuditLog('LOGIN', 'user', user.id, user.name || user.fullName, null, null, 'low', '', user, loginSchoolId);
                  
                  // Reset login fields
                  setLoginUsername("");
                  setLoginPassword("");
                  setStudentGuidanceForm(null);
                  setStudentGuidanceAnswers({});

                  if (user.role === 'student' || user.role === 'öğrenci') {
                    setActiveTab('homework');
                  } else {
                    setActiveTab('eval');
                  }
                  setLoginError("");
              } else {
                  setLoginError("Kullanıcı adı veya şifre hatalı!");
              }
          } catch (err) {
              console.error("Login error:", err);
              setLoginError("Giriş yapılırken bir hata oluştu.");
          }
      },
      setCurrentUser, setSuperAdminTab, setSupportView, setNewSchoolName, 
      handleCreateSchool: async (orgData: any) => {
          if (!orgData.name) {
              showToast("Lütfen isim girin.", "error");
              return;
          }
          try {
              const { collection, addDoc, doc, setDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const { generateCredentials } = await import('./lib/utils');
              
              // Create school/il/ilce doc
              const orgType = orgData.type || 'okul';
              const schoolRef = await addDoc(collection(db, 'schools'), {
                  name: orgData.name,
                  type: orgType,
                  parentId: orgData.parentId || null,
                  districtId: orgData.districtId || null,
                  isActive: true,
                  createdAt: new Date().toISOString()
              });
              
              const schoolId = schoolRef.id;
              
              // Create initial admin user
              let adminName = 'Yönetici';
              let username = 'okul';
              let password = 'okul';
              let role = 'admin';

              if (orgType === 'il') {
                  adminName = 'İl Milli Eğitim';
                  username = 'ilrapor';
                  password = 'ilrapor';
                  role = 'provincial_admin';
              } else if (orgType === 'ilce') {
                  adminName = 'İlçe Milli Eğitim';
                  username = 'ilcerapor';
                  password = 'ilcerapor';
                  role = 'district_admin';
              } else {
                  // For schools, we use 'okul'/'okul' as requested
                  adminName = `${orgData.name} Yöneticisi`;
                  username = 'okul';
                  password = 'okul';
              }

              const userColName = `users_${schoolId}`;
              await addDoc(collection(db, userColName), {
                  name: adminName,
                  role: role,
                  username,
                  password,
                  createdAt: new Date().toISOString()
              });
              
              if (orgType === 'okul') {
                  // Add default student as requested
                  await addDoc(collection(db, userColName), {
                      name: 'Deneme Öğrenci',
                      username: '114',
                      password: '114',
                      role: 'student',
                      classLevel: 'Deneme',
                      schoolId: schoolId,
                      createdAt: new Date().toISOString()
                  });

                  // Initialize system config for the school
                  const sysColName = `system_${schoolId}`;
                  
                  // 1. Initialize curriculum (categories, tasks, etc.)
                  await setDoc(doc(db, sysColName, 'curriculum'), {
                      categories: [],
                      tasks: [],
                      successDescriptions: {}, // Use empty object or predefined levels
                      remedialTasks: {},
                      remedialProblems: {},
                      uncompletedReasons: {}
                  });

                  // 2. Initialize schoolData (ONLY classes/students)
                  await setDoc(doc(db, sysColName, 'schoolData'), {
                      'Deneme': ['Deneme Öğrenci']
                  });
              }
              
              setNewSchoolName('');
              showToast(`${orgType === 'okul' ? 'Okul' : orgType === 'ilce' ? 'İlçe' : 'İl'} başarıyla oluşturuldu.`, "success");
          } catch (error) {
              console.error("Error creating organization:", error);
              showToast("Hata oluştu.", "error");
          }
      },
      handleEditSchoolName: async (schoolId: string, newName: string) => {
          try {
              const { doc, updateDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              await updateDoc(doc(db, 'schools', schoolId), {
                  name: newName
              });
              showToast("Okul adı güncellendi.", "success");
          } catch (error) {
              console.error("Error updating school name:", error);
              showToast("Okul adı güncellenirken bir hata oluştu.", "error");
          }
      },
      handleUpdateSchoolLinks: async (schoolId: string, links: { parentId?: string | null, districtId?: string | null }) => {
          try {
              const { doc, updateDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              await updateDoc(doc(db, 'schools', schoolId), links);
              showToast("Kurum bağlantıları güncellendi.", "success");
          } catch (error) {
              console.error("Error updating school links:", error);
              showToast("Bağlantılar güncellenirken bir hata oluştu.", "error");
          }
      },
      handleImpersonate: (school: any) => {
          const prefix = currentUser.role === 'superadmin' ? 'Süper Yönetici' : 
                         currentUser.role === 'provincial_admin' ? 'İl Müd.' : 'İlçe Müd.';
          
          let role = 'admin';
          if (school.type === 'il') role = 'provincial_admin';
          else if (school.type === 'ilce') role = 'district_admin';

          setCurrentUser({
              ...currentUser,
              originalRole: currentUser.role,
              role: role,
              name: `${prefix} (${school.name})`
          });
          setActiveSchoolId(school.id);
          if (role === 'admin') {
              setActiveTab('eval');
          }
      }, 
      handleToggleSchoolStatus: async (schoolId: string, currentStatus: boolean) => {
          try {
              const { doc, updateDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              await updateDoc(doc(db, 'schools', schoolId), {
                  isActive: !currentStatus
              });
              showToast(`Okul ${!currentStatus ? 'aktifleştirildi' : 'pasife alındı'}.`, "success");
          } catch (error) {
              console.error("Error toggling school status:", error);
              showToast("İşlem sırasında bir hata oluştu.", "error");
          }
      }, 
      requestPrompt, 
      handleDeleteSchool: async (schoolId: string) => {
          try {
              const { collection, query, where, getDocs, doc, deleteDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              
              const userColName = schoolId === 'default' ? 'users' : `users_${schoolId}`;
              
              // Check if there are any students or teachers
              const studentsQuery = query(collection(db, userColName), where('role', '==', 'student'));
              const teachersQuery = query(collection(db, userColName), where('role', '==', 'teacher'));
              
              const [studentsSnap, teachersSnap] = await Promise.all([
                  getDocs(studentsQuery),
                  getDocs(teachersQuery)
              ]);
              
              if (!studentsSnap.empty || !teachersSnap.empty) {
                  showToast("İçinde veri olan okullar silinemez!", "error");
                  return;
              }
              
              requestConfirm("Bu okulu silmek istediğinize emin misiniz?", async () => {
                  try {
                      await deleteDoc(doc(db, 'schools', schoolId));
                      showToast("Okul başarıyla silindi.", "success");
                  } catch (error) {
                      console.error("Error deleting school:", error);
                      showToast("Okul silinirken bir hata oluştu.", "error");
                  }
              });
          } catch (error) {
              console.error("Error checking school data:", error);
              showToast("Okul verileri kontrol edilirken bir hata oluştu.", "error");
          }
      },
      setNewSa, 
      handleAddSuperAdmin: async () => {
          if (!newSa.name || !newSa.username || !newSa.password) {
              showToast("Lütfen tüm alanları doldurun.", "error");
              return;
          }
          try {
              const { collection, addDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              await addDoc(collection(db, 'superadmins'), {
                  name: newSa.name,
                  username: newSa.username,
                  password: newSa.password, // In a real app, this should be hashed or handled via Firebase Auth
                  role: 'superadmin',
                  createdAt: new Date().toISOString()
              });
              setNewSa({name: '', username: '', password: ''});
              showToast("Süper yönetici başarıyla eklendi.", "success");
          } catch (error) {
              console.error("Error adding super admin:", error);
              showToast("Yönetici eklenirken bir hata oluştu.", "error");
          }
      }, 
      handleDeleteSuperAdmin: async (id: string) => {
          requestConfirm("Bu yöneticiyi silmek istediğinize emin misiniz?", async () => {
              try {
                  const { doc, deleteDoc } = await import('firebase/firestore');
                  const { db } = await import('./lib/firebase');
                  await deleteDoc(doc(db, 'superadmins', id));
                  showToast("Yönetici başarıyla silindi.", "success");
              } catch (error) {
                  console.error("Error deleting super admin:", error);
                  showToast("Yönetici silinirken bir hata oluştu.", "error");
              }
          });
      }, 
      setSaPasswordForm, handleSaPasswordChange: () => {},
      renderSupportContent: (isSuperAdmin: boolean) => <SupportTickets state={state} actions={actions} isSuperAdmin={isSuperAdmin} />,
      setSelectedTicket, setTicketForm, 
      handleCreateTicket: async () => {
          if (!ticketForm.subject || !ticketForm.message) {
              showToast("Lütfen konu ve mesaj alanlarını doldurun.", "error");
              return;
          }
          try {
              const { collection, addDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const school = schools.find(s => s.id === activeSchoolId);
              const now = new Date().toISOString();
              await addDoc(collection(db, 'support_tickets'), {
                  schoolId: activeSchoolId,
                  schoolName: school?.name || 'Bilinmeyen Okul',
                  senderName: currentUser.name,
                  senderEmail: currentUser.email || '',
                  senderRole: currentUser.role,
                  subject: ticketForm.subject,
                  status: 'open',
                  createdAt: now,
                  updatedAt: now,
                  messages: [{
                      id: Date.now().toString(),
                      senderName: currentUser.name,
                      senderRole: currentUser.role,
                      content: ticketForm.message,
                      date: now
                  }]
              });
              setTicketForm({subject: '', message: ''});
              setSupportView('list');
              showToast("Destek talebiniz başarıyla oluşturuldu.", "success");
          } catch (error) {
              console.error("Error creating ticket:", error);
              showToast("Talep oluşturulurken bir hata oluştu.", "error");
          }
      }, 
      setTicketReply, 
      handleReplyTicket: async (ticketId: string) => {
          if (!ticketReply) return;
          try {
              const { doc, updateDoc, arrayUnion } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const now = new Date().toISOString();
              await updateDoc(doc(db, 'support_tickets', ticketId), {
                  status: currentUser.role === 'superadmin' ? 'answered' : 'open',
                  updatedAt: now,
                  messages: arrayUnion({
                      id: Date.now().toString(),
                      senderName: currentUser.name,
                      senderRole: currentUser.role,
                      content: ticketReply,
                      date: now
                  })
              });
              setTicketReply('');
              showToast("Yanıtınız gönderildi.", "success");
          } catch (error) {
              console.error("Error replying to ticket:", error);
              showToast("Yanıt gönderilirken bir hata oluştu.", "error");
          }
      }, 
      handleCloseTicket: async (ticketId: string) => {
          try {
              const { doc, updateDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              await updateDoc(doc(db, 'support_tickets', ticketId), {
                  status: 'closed',
                  updatedAt: new Date().toISOString()
              });
              showToast("Talep kapatıldı.", "success");
          } catch (error) {
              console.error("Error closing ticket:", error);
              showToast("Talep kapatılırken bir hata oluştu.", "error");
          }
      }, 
      handleUpdateTeacherPerfConfig: async (newConfig: any) => {
          try {
              const { doc, setDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const sysColName = activeSchoolId === 'default' ? 'system' : `system_${activeSchoolId}`;
              await setDoc(doc(db, sysColName, 'teacherPerfConfig'), newConfig);
              showToast("Öğretmen performans ayarları güncellendi.", "success");
          } catch (error) {
              console.error("Error updating teacher perf config:", error);
              showToast("Ayarlar güncellenirken bir hata oluştu.", "error");
          }
      },
      requestConfirm,
      handleDownloadPDF: () => {
          setTimeout(() => {
              window.print();
          }, 100);
      },
      handleTaskChange: async (cat: string, tIdx: number, field: string, value: any) => {
          if (!selectedStudent || !activeSchoolId) return;
          
          const newEvals = { ...evaluations };
          if (!newEvals[selectedStudent]) newEvals[selectedStudent] = {};
          if (!newEvals[selectedStudent][cat]) newEvals[selectedStudent][cat] = {};
          if (!newEvals[selectedStudent][cat][tIdx]) newEvals[selectedStudent][cat][tIdx] = { status: null, score: 1 };
          
          newEvals[selectedStudent][cat][tIdx][field] = value;
          if (field === 'status') {
              newEvals[selectedStudent][cat][tIdx].evaluator = currentUser.name || currentUser.username;
              newEvals[selectedStudent][cat][tIdx].date = new Date().toISOString();
          }
          
          setEvaluations(newEvals);
          
          try {
              const { doc, setDoc, collection } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              
              // Save to the school-specific evaluations collection (more scalable)
              const colName = `evaluations_${activeSchoolId}`;
              await setDoc(doc(db, colName, selectedStudent), newEvals[selectedStudent]);
              
              // Also keep legacy sync if needed, but prefer collection
              // await setDoc(doc(db, `system_${activeSchoolId}`, 'evaluations'), newEvals);
          } catch (error) {
              console.error("Error saving evaluation:", error);
          }
      },
      handleSloganChange: () => {
          const currentSlogan = schools.find(s => s.id === activeSchoolId)?.slogan || '';
          requestPrompt("Okul Sloganını Güncelle", currentSlogan, async (newSlogan) => {
              if (newSlogan === null) return;
              try {
                  const { doc, updateDoc } = await import('firebase/firestore');
                  const { db } = await import('./lib/firebase');
                  await updateDoc(doc(db, 'schools', activeSchoolId), { slogan: newSlogan });
                  showToast("Slogan güncellendi.", "success");
                  // Update local state
                  setSchools(prev => prev.map(s => s.id === activeSchoolId ? { ...s, slogan: newSlogan } : s));
              } catch (error) {
                  console.error("Error updating slogan:", error);
                  showToast("Slogan güncellenirken bir hata oluştu.", "error");
              }
          });
      },
      setNewActivity,
      handleAddActivity: async () => {
          if (!selectedStudent || !activeSchoolId || !newActivity.description || !newActivity.levelId || !newActivity.rubricId) {
              showToast("Lütfen tüm alanları doldurun.", "error");
              return;
          }

          const level = devCardConfig.levels.find((l: any) => l.id.toString() === newActivity.levelId);
          const rubric = devCardConfig.rubrics.find((r: any) => r.id.toString() === newActivity.rubricId);
          const score = (level?.score || 0) * (rubric?.multiplier || 0);

          const activity = {
              id: Date.now().toString(),
              date: new Date().toISOString().split('T')[0],
              description: newActivity.description,
              levelId: newActivity.levelId,
              rubricId: newActivity.rubricId,
              score: score
          };

          const updatedActivities = [activity, ...devCardData.activities];
          
          try {
              const { doc, setDoc, updateDoc, getDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              
              // Save to the portfolios collection as requested
              const colName = `portfolios_${activeSchoolId}`;
              const docRef = doc(db, colName, selectedStudent);
              const docSnap = await getDoc(docRef);
              
              if (docSnap.exists()) {
                  await updateDoc(docRef, {
                      'developmentCard.activities': updatedActivities
                  });
              } else {
                  await setDoc(docRef, {
                      developmentCard: {
                          activities: updatedActivities
                      }
                  });
              }
              
              setNewActivity({ description: '', levelId: '', rubricId: '' });
              showToast("Aktivite eklendi.", "success");
          } catch (error) {
              console.error("Error adding activity:", error);
              showToast("Aktivite eklenirken bir hata oluştu.", "error");
          }
      },
      handleDeleteActivity: async (activityId: string) => {
          if (!selectedStudent || !activeSchoolId) return;

          requestConfirm("Bu aktiviteyi silmek istediğinize emin misiniz?", async () => {
              const updatedActivities = devCardData.activities.filter((a: any) => a.id !== activityId);
              try {
                  const { doc, updateDoc } = await import('firebase/firestore');
                  const { db } = await import('./lib/firebase');
                  const colName = `portfolios_${activeSchoolId}`;
                  await updateDoc(doc(db, colName, selectedStudent), {
                      'developmentCard.activities': updatedActivities
                  });
                  showToast("Aktivite silindi.", "success");
              } catch (error) {
                  console.error("Error deleting activity:", error);
                  showToast("Aktivite silinirken bir hata oluştu.", "error");
              }
          });
      },
      handleDownloadDevCardPDF: () => {
          setTimeout(() => {
              window.print();
          }, 100);
      },
      setSelectedTeacherForPerf, 
      setNewTeacherActivity, 
      handleAddTeacherActivity: async () => {
          if (!selectedTeacherForPerf || !newTeacherActivity.description || !newTeacherActivity.taskTypeId || !newTeacherActivity.rubricId) {
              showToast("Lütfen tüm alanları doldurun.", "error");
              return;
          }
          try {
              const { doc, setDoc, getDoc, updateDoc, arrayUnion } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const colName = activeSchoolId === 'default' ? 'teacher_performances' : `teacher_performances_${activeSchoolId}`;
              
              const activity = {
                  id: Date.now().toString(),
                  date: new Date().toISOString(),
                  description: newTeacherActivity.description,
                  taskTypeId: newTeacherActivity.taskTypeId,
                  rubricId: newTeacherActivity.rubricId,
                  addedBy: currentUser.name
              };

              const docRef = doc(db, colName, selectedTeacherForPerf);
              const docSnap = await getDoc(docRef);

              if (docSnap.exists()) {
                  await updateDoc(docRef, {
                      activities: arrayUnion(activity)
                  });
              } else {
                  await setDoc(docRef, {
                      activities: [activity]
                  });
              }

              setNewTeacherActivity({ description: '', taskTypeId: '', rubricId: '' });
              showToast("Faaliyet başarıyla eklendi.", "success");
          } catch (error) {
              console.error("Error adding teacher activity:", error);
              showToast("Faaliyet eklenirken bir hata oluştu.", "error");
          }
      }, 
      handleDeleteTeacherActivity: async (activityId: string) => {
          requestConfirm("Bu faaliyeti silmek istediğinize emin misiniz?", async () => {
              try {
                  const { doc, getDoc, updateDoc } = await import('firebase/firestore');
                  const { db } = await import('./lib/firebase');
                  const colName = activeSchoolId === 'default' ? 'teacher_performances' : `teacher_performances_${activeSchoolId}`;
                  
                  const docRef = doc(db, colName, selectedTeacherForPerf);
                  const docSnap = await getDoc(docRef);
                  
                  if (docSnap.exists()) {
                      const data = docSnap.data();
                      const updatedActivities = (data.activities || []).filter((a: any) => a.id !== activityId);
                      await updateDoc(docRef, {
                          activities: updatedActivities
                      });
                      showToast("Faaliyet silindi.", "success");
                  }
              } catch (error) {
                  console.error("Error deleting teacher activity:", error);
                  showToast("Faaliyet silinirken bir hata oluştu.", "error");
              }
          });
      },
      setActiveBehaviorCard, 
      handleAddBehavior: async (behavior: any, card: any) => {
          if (!selectedStudent || !activeSchoolId) return;

          const checkAutoAwards = (currentLog: any[]) => {
              let newLog = [...currentLog];
              const now = new Date();
              const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

              let weeklyPositivePoints = 0;
              let monthlyPositivePoints = 0;
              let hasWeeklyAwardThisWeek = false;
              let hasMonthlyAwardThisMonth = false;

              newLog.forEach(log => {
                  if (log.isDeleted) return;
                  const logDate = new Date(log.date);
                  
                  const isWeekly = log.description?.includes("Haftalık +20 Puan Başarısı") || log.isAutoWeekly;
                  const isMonthly = log.description?.includes("Aylık +50 Puan Başarısı") || log.isAutoMonthly;

                  if (isWeekly && logDate >= oneWeekAgo) {
                      hasWeeklyAwardThisWeek = true;
                  }
                  if (isMonthly && logDate >= oneMonthAgo) {
                      hasMonthlyAwardThisMonth = true;
                  }
                  
                  if (log.score > 0 && log.type === 'behavior' && !isWeekly && !isMonthly) {
                      if (logDate >= oneWeekAgo) weeklyPositivePoints += Number(log.score);
                      if (logDate >= oneMonthAgo) monthlyPositivePoints += Number(log.score);
                  }
              });

              let addedAuto = false;
              if (weeklyPositivePoints >= 20 && !hasWeeklyAwardThisWeek) {
                  newLog.push({
                      id: (Date.now() + 1).toString(),
                      date: new Date().toISOString(),
                      description: "Haftalık +20 Puan Başarısı",
                      score: 10,
                      card: 'white',
                      type: 'behavior',
                      addedBy: 'SİSTEM',
                      isDeleted: false,
                      isAutoWeekly: true
                  });
                  addedAuto = true;
              }

              if (monthlyPositivePoints >= 50 && !hasMonthlyAwardThisMonth) {
                  newLog.push({
                      id: (Date.now() + (addedAuto ? 2 : 1)).toString(),
                      date: new Date().toISOString(),
                      description: "Aylık +50 Puan Başarısı",
                      score: 10,
                      card: 'white',
                      type: 'behavior',
                      addedBy: 'SİSTEM',
                      isDeleted: false,
                      isAutoMonthly: true
                  });
              }
              return newLog;
          };
          
          const logEntry = {
              id: Date.now().toString(),
              date: new Date().toISOString(),
              description: behavior.text,
              score: behavior.points || card.score || 0,
              card: card.id,
              type: 'behavior',
              addedBy: currentUser.username,
              isDeleted: false
          };

          let updatedLog = [...behaviorLog, logEntry];
          updatedLog = checkAutoAwards(updatedLog);
          
          try {
              const { doc, setDoc, getDoc, updateDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const colName = `portfolios_${activeSchoolId}`;
              const docRef = doc(db, colName, selectedStudent);
              const docSnap = await getDoc(docRef);
              
              if (docSnap.exists()) {
                  await updateDoc(docRef, { behaviorLog: updatedLog });
              } else {
                  await setDoc(docRef, { behaviorLog: updatedLog });
              }
              actions.addAuditLog('ADD_BEHAVIOR', 'portfolio', selectedStudent, selectedStudent, null, logEntry, 'medium', `Added behavior: ${behavior.text}`);
              showToast("Davranış notu eklendi.", "success");
          } catch (error) {
              console.error("Error adding behavior:", error);
              showToast("Hata oluştu.", "error");
          }
      },
      handleAddCompensation: async (card: any) => {
          if (!selectedStudent || !activeSchoolId) return;
          
          const logEntry = {
              id: Date.now().toString(),
              date: new Date().toISOString(),
              description: `Telafi Görevi: ${card.name}`,
              score: card.compensation || 0,
              card: card.id,
              type: 'compensation',
              addedBy: currentUser.username,
              isDeleted: false
          };

          const updatedLog = [...behaviorLog, logEntry];
          
          try {
              const { doc, setDoc, getDoc, updateDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const colName = `portfolios_${activeSchoolId}`;
              const docRef = doc(db, colName, selectedStudent);
              const docSnap = await getDoc(docRef);
              
              if (docSnap.exists()) {
                  await updateDoc(docRef, { behaviorLog: updatedLog });
              } else {
                  await setDoc(docRef, { behaviorLog: updatedLog });
              }
              showToast("Telafi görevi eklendi.", "success");
          } catch (error) {
              console.error("Error adding compensation:", error);
              showToast("Hata oluştu.", "error");
          }
      },
      handleSoftDeleteBehavior: async (logId: string) => {
          if (!selectedStudent || !activeSchoolId) return;

          requestConfirm("Bu kaydı silmek istediğinize emin misiniz?", async () => {
              const updatedLog = behaviorLog.map((l: any) => l.id === logId ? { ...l, isDeleted: true } : l);
              try {
                  const { doc, updateDoc } = await import('firebase/firestore');
                  const { db } = await import('./lib/firebase');
                  const colName = `portfolios_${activeSchoolId}`;
                  await updateDoc(doc(db, colName, selectedStudent), { behaviorLog: updatedLog });
                  const deletedLog = behaviorLog.find((l: any) => l.id === logId);
                  actions.addAuditLog('DELETE_BEHAVIOR', 'portfolio', selectedStudent, selectedStudent, deletedLog, { ...deletedLog, isDeleted: true }, 'high', 'Kullanıcı silme işlemi onayladı');
                  showToast("Kayıt silindi.", "success");
              } catch (error) {
                  console.error("Error deleting behavior log:", error);
                  showToast("Hata oluştu.", "error");
              }
          });
      },
      setHomeworkTab, setAssignmentType, setAdminHomeworkForm, 
      handleHomeworkClassToggle: (cls: string) => {
          setAdminHomeworkForm(prev => ({
              ...prev,
              classes: prev.classes.includes(cls as never) 
                  ? prev.classes.filter(c => c !== cls) 
                  : [...prev.classes, cls as never]
          }));
      }, 
      handleHomeworkExcelUpload: (e: any) => {
          const file = e.target.files[0];
          if (!file) return;
          setAdminHomeworkForm(prev => ({ ...prev, fileName: file.name }));
          
          import('xlsx').then(XLSX => {
              const reader = new FileReader();
              reader.onload = (evt: any) => {
                  const bstr = evt.target.result;
                  const wb = XLSX.read(bstr, { type: 'binary' });
                  const wsname = wb.SheetNames[0];
                  const ws = wb.Sheets[wsname];
                  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
                  
                  // Check if first row is a header
                  let rowsToProcess = data as any[][];
                  const firstRowStr = String(rowsToProcess[0]?.[0] || '').toLowerCase();
                  if (firstRowStr === 'soru' || firstRowStr === 'question' || firstRowStr === 'kelime') {
                      rowsToProcess = rowsToProcess.slice(1);
                  }

                  const questions = rowsToProcess.map((row: any) => {
                      if (!row || row.length === 0) return null;
                      const clean = (val: any) => val ? String(val).trim() : '';

                      if (assignmentType === 'kelime') return { word: clean(row[0]), meaning: clean(row[1]) };
                      if (assignmentType === 'dogruYanlis') return { sentence: clean(row[0]), answer: clean(row[1]) };
                      if (assignmentType === 'bosluk') return { sentence: clean(row[0]), answer: clean(row[1]) };
                      if (assignmentType === 'coktanSecmeli') {
                          return { 
                              question: clean(row[0]), 
                              a: clean(row[1]), 
                              b: clean(row[2]), 
                              c: clean(row[3]), 
                              d: clean(row[4]), 
                              answer: clean(row[5]) 
                          };
                      }
                      return null;
                  }).filter(q => q !== null);
                  
                  setAdminHomeworkForm(prev => ({ ...prev, questions }));
                  showToast(`${questions.length} soru yüklendi.`, "success");
              };
              reader.readAsBinaryString(file);
          });
      },
      handleCreateAssignment: async () => {
          if (!adminHomeworkForm.title || adminHomeworkForm.classes.length === 0 || adminHomeworkForm.questions.length === 0) {
              showToast("Lütfen tüm alanları doldurun ve Excel yükleyin.", "error");
              return;
          }
          if ((adminHomeworkForm as any).targetType === 'student' && !(adminHomeworkForm as any).targetStudent) {
              showToast("Lütfen hedef öğrenciyi seçiniz.", "error");
              return;
          }

          try {
              const { collection, addDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const colName = activeSchoolId === 'default' ? 'assignments' : `assignments_${activeSchoolId}`;
              
              await addDoc(collection(db, colName), {
                  ...adminHomeworkForm,
                  type: assignmentType,
                  createdAt: new Date().toISOString(),
                  createdBy: currentUser.username
              });

              setAdminHomeworkForm({ title: '', classes: [], dueDate: '', fileName: '', questions: [] });
              showToast("Ödev başarıyla atandı.", "success");
          } catch (error) {
              console.error("Error creating assignment:", error);
              showToast("Ödev oluşturulurken hata oluştu.", "error");
          }
      }, 
      setEditAssignmentData, 
      handleDeleteAssignment: async (id: string) => {
          requestConfirm("Bu ödevi silmek istediğinize emin misiniz?", async () => {
              try {
                  const { doc, deleteDoc } = await import('firebase/firestore');
                  const { db } = await import('./lib/firebase');
                  const colName = activeSchoolId === 'default' ? 'assignments' : `assignments_${activeSchoolId}`;
                  await deleteDoc(doc(db, colName, id));
                  showToast("Ödev silindi.", "success");
              } catch (error) {
                  console.error("Error deleting assignment:", error);
                  showToast("Hata oluştu.", "error");
              }
          });
      }, 
      handleUpdateAssignment: async () => {
          if (!editAssignmentData) return;
          try {
              const { doc, updateDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const colName = activeSchoolId === 'default' ? 'assignments' : `assignments_${activeSchoolId}`;
              const { id, ...data } = editAssignmentData;
              await updateDoc(doc(db, colName, id), data);
              setEditAssignmentData(null);
              showToast("Ödev güncellendi.", "success");
          } catch (error) {
              console.error("Error updating assignment:", error);
              showToast("Hata oluştu.", "error");
          }
      },
      setSelectedReportAssignment, setReportFilterClass,
      setGuidanceFilterForm, setGuidanceFilterClass, setGuidanceFilterStatus, setGuidanceSearchQuery, setGuidanceTab,
      handleSaveGuidanceConfig: async (config: any) => {
          if (!activeSchoolId || !config.title) return;
          try {
              const { collection, addDoc, doc, setDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const colName = `guidance_configs_${activeSchoolId}`;
              
              // Firebase throws error if ANY nested key is undefined. Let's reliably strip all undefined properties.
              const validData = JSON.parse(JSON.stringify(config));
              delete validData.id;

              if (config.id) {
                  await setDoc(doc(db, colName, config.id), validData);
              } else {
                  await addDoc(collection(db, colName), {
                      ...validData,
                      createdAt: new Date().toISOString(),
                      createdBy: currentUser?.username || currentUser?.name || 'admin'
                  });
              }
              showToast("Form başarıyla kaydedildi.", "success");
          } catch (error) {
              console.error("Error saving guidance config:", error);
              showToast("Kaydetme sırasında hata oluştu.", "error");
          }
      },
      handleDeleteGuidanceConfig: async (id: string) => {
          requestConfirm("Bu formu silmek istediğinize emin misiniz?", async () => {
              try {
                  const { doc, deleteDoc } = await import('firebase/firestore');
                  const { db } = await import('./lib/firebase');
                  const colName = `guidance_configs_${activeSchoolId}`;
                  await deleteDoc(doc(db, colName, id));
                  showToast("Form silindi.", "success");
              } catch (error) {
                  console.error("Error deleting guidance config:", error);
                  showToast("Hata oluştu.", "error");
              }
          });
      },
      handleAssignGuidanceForm: async (formId: string, targetType: string, targetClass: string, targetStudent: string | null = null) => {
          if (!formId || !activeSchoolId) return;
          try {
              const { collection, addDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const colName = activeSchoolId === 'default' ? 'form_assignments' : `form_assignments_${activeSchoolId}`;
              await addDoc(collection(db, colName), {
                  formId,
                  targetType,
                  targetClass,
                  targetStudent,
                  createdAt: new Date().toISOString(),
                  createdBy: currentUser.username
              });
              showToast("Form başarıyla atandı.", "success");
          } catch (error) {
              console.error("Error assigning guidance form:", error);
              showToast("Atama sırasında hata oluştu.", "error");
          }
      },
      handleDeleteGuidanceAssignment: async (id: string) => {
          requestConfirm("Bu atamayı silmek istediğinize emin misiniz?", async () => {
              try {
                  const { doc, deleteDoc } = await import('firebase/firestore');
                  const { db } = await import('./lib/firebase');
                  const colName = activeSchoolId === 'default' ? 'form_assignments' : `form_assignments_${activeSchoolId}`;
                  await deleteDoc(doc(db, colName, id));
                  showToast("Atama silindi.", "success");
              } catch (error) {
                  console.error("Error deleting guidance assignment:", error);
                  showToast("Hata oluştu.", "error");
              }
          });
      },
      handleDownloadGuidancePDF: () => {
          setTimeout(() => {
              window.print();
          }, 100);
      },
      startHomework: (a: any) => {
          setStudentHomework(a);
          setHomeworkAnswers({});
      },
      submitHomework: async (homeworkId: string, results: any) => {
          if (!activeSchoolId || !currentUser.id) return;
          try {
              const { doc, setDoc, updateDoc, increment } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const colName = activeSchoolId === 'default' ? 'homework_progress' : `homework_progress_${activeSchoolId}`;
              const progId = `${currentUser.id}_${homeworkId}`;
              
              await setDoc(doc(db, colName, progId), {
                  userId: currentUser.id,
                  userName: currentUser.name,
                  homeworkId,
                  completed: results.completed || false,
                  remainingIndices: results.remainingIndices || [],
                  correctCount: results.correctCount || 0,
                  incorrectCount: results.incorrectCount !== undefined ? results.incorrectCount : 0,
                  updatedAt: new Date().toISOString()
              }, { merge: true });

              // Update global user total correct if needed
              const userColName = activeSchoolId === 'default' ? 'users' : `users_${activeSchoolId}`;
              if (results.deltaCorrect > 0) {
                  await updateDoc(doc(db, userColName, currentUser.id), {
                      totalCorrect: increment(results.deltaCorrect)
                  });
              }

              if (results.completed) {
                  setStudentHomework(null);
                  showToast("Tebrikler! Ödevi tamamen bitirdin.", "success");
              }
          } catch (error) {
              console.error("Error submitting homework:", error);
          }
      },
      handleUpdateBadges: async (newBadges: any[]) => {
          if (!activeSchoolId) return;
          try {
              const { collection, doc, writeBatch, getDocs } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const colName = activeSchoolId === 'default' ? 'homework_badges' : `homework_badges_${activeSchoolId}`;
              
              const batch = writeBatch(db);
              const snapshot = await getDocs(collection(db, colName));
              snapshot.forEach(d => batch.delete(d.ref));
              
              newBadges.forEach(b => {
                 const newRef = doc(collection(db, colName), String(b.id));
                 batch.set(newRef, b);
              });
              await batch.commit();

              showToast("Rozetler güncellendi.", "success");
          } catch (error) {
              console.error("Error updating badges:", error);
          }
      },
      setStudentHomework,
      setHomeworkAnswers,
      submitGuidanceForm: async () => {
          if (!studentGuidanceForm || !currentUser.id || !activeSchoolId) return;
          try {
              const { collection, addDoc, doc, updateDoc, deleteField } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const colName = activeSchoolId === 'default' ? 'guidance_forms' : `guidance_forms_${activeSchoolId}`;
              
              await addDoc(collection(db, colName), {
                  formType: studentGuidanceForm,
                  studentId: currentUser.id,
                  studentName: currentUser.name,
                  classLevel: currentUser.classLevel,
                  answers: studentGuidanceAnswers,
                  createdAt: new Date().toISOString()
              });

              actions.addAuditLog('SUBMIT_GUIDANCE', 'guidance', currentUser.id, currentUser.name, null, { formType: studentGuidanceForm }, 'low');

              const userColName = activeSchoolId === 'default' ? 'users' : `users_${activeSchoolId}`;
              await updateDoc(doc(db, userColName, currentUser.id), {
                  [`guidanceDrafts.${studentGuidanceForm}`]: deleteField()
              }).catch(e => console.error("Draft clean error:", e));

              setStudentGuidanceForm(null);
              setStudentGuidanceAnswers({});
              showToast("Form başarıyla gönderildi.", "success");
          } catch (error) {
              console.error("Error submitting guidance form:", error);
              showToast("Hata oluştu.", "error");
          }
      },
      saveGuidanceDraft: async (formType: string, answers: any) => {
          if (!currentUser?.id || !activeSchoolId) return;
          try {
              const { doc, updateDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const userColName = activeSchoolId === 'default' ? 'users' : `users_${activeSchoolId}`;
              await updateDoc(doc(db, userColName, currentUser.id), {
                  [`guidanceDrafts.${formType}`]: answers
              });
          } catch (error) {
              console.error("Error saving guidance draft:", error);
          }
      },
      setStudentGuidanceForm, setStudentGuidanceAnswers, 
      setProfileForm, handleProfileUpdate: async () => {
          if (!currentUser.id || !activeSchoolId) return;
          try {
              const { doc, updateDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const userColName = activeSchoolId === 'default' ? 'users' : `users_${activeSchoolId}`;
              await updateDoc(doc(db, userColName, currentUser.id), {
                  name: profileForm.name,
                  username: profileForm.username,
                  password: profileForm.password || currentUser.password
              });
              setCurrentUser({
                  ...currentUser,
                  name: profileForm.name,
                  username: profileForm.username,
                  password: profileForm.password || currentUser.password
              });
              showToast("Profil bilgileriniz güncellendi.", "success");
          } catch (error) {
              console.error("Error updating profile:", error);
              showToast("Hata oluştu.", "error");
          }
      },
      setAdminTab, setNewUser, 
      handleAddUser: async () => {
          if (!newUser.name || !activeSchoolId) return;
          try {
              const { collection, addDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const { generateCredentials } = await import('./lib/utils');
              const userColName = activeSchoolId === 'default' ? 'users' : `users_${activeSchoolId}`;
              
              let finalName = newUser.name.trim();
              if (newUser.role === 'student' && newUser.studentNo) {
                  finalName = `${newUser.studentNo.trim()} - ${finalName}`;
              }

              const creds = generateCredentials(finalName);
              const customUsername = newUser.username?.trim();
              const customPassword = newUser.password?.trim();

              const userToAdd = {
                  ...newUser,
                  name: finalName,
                  username: customUsername || creds.username,
                  password: customPassword || creds.password,
                  schoolId: activeSchoolId,
                  createdAt: new Date().toISOString()
              };
              delete userToAdd.studentNo;

              await addDoc(collection(db, userColName), userToAdd);

              // If student, also add to schoolData
              if (newUser.role === 'student' && newUser.classLevel) {
                  const { doc, getDoc, updateDoc, arrayUnion } = await import('firebase/firestore');
                  const sysColName = activeSchoolId === 'default' ? 'system' : `system_${activeSchoolId}`;
                  const schoolDataRef = doc(db, sysColName, 'schoolData');
                  await updateDoc(schoolDataRef, {
                      [newUser.classLevel]: arrayUnion(finalName)
                  });
              }

              setNewUser({name: '', username: '', password: '', role: 'teacher'});
              setAdminTab('users');
              showToast("Kullanıcı başarıyla eklendi.", "success");
          } catch (error) {
              console.error("Error adding user:", error);
              showToast("Kullanıcı eklenirken hata oluştu.", "error");
          }
      },
      setEditUser, 
      handleUpdateUser: async () => {
          if (!editUser || !activeSchoolId) return;
          try {
              const { doc, updateDoc, arrayRemove, arrayUnion } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              
              // Find old user for comparison
              const oldUser = users.find((u: any) => u.id === editUser.id);
              const nameChanged = oldUser && oldUser.name !== editUser.name;
              const classChanged = oldUser && oldUser.classLevel !== editUser.classLevel;

              const userColName = activeSchoolId === 'default' ? 'users' : `users_${activeSchoolId}`;
              const userRef = doc(db, userColName, editUser.id);
              
              const { id, ...updateData } = editUser;
              await updateDoc(userRef, updateData);

              // Sync with schoolData if student name/class changed
              if (editUser.role === 'student' && (nameChanged || classChanged)) {
                  const sysColName = activeSchoolId === 'default' ? 'system' : `system_${activeSchoolId}`;
                  const schoolDataRef = doc(db, sysColName, 'schoolData');
                  
                  // Remove old name from old class
                  if (oldUser?.classLevel && oldUser?.name) {
                      await updateDoc(schoolDataRef, {
                          [oldUser.classLevel]: arrayRemove(oldUser.name)
                      });
                  }
                  
                  // Add new name to current class
                  if (editUser.classLevel && editUser.name) {
                      await updateDoc(schoolDataRef, {
                          [editUser.classLevel]: arrayUnion(editUser.name)
                      });
                  }
              }
              
              setEditUser(null);
              showToast("Kullanıcı güncellendi.", "success");
          } catch (error) {
              console.error("Error updating user:", error);
              showToast("Güncelleme sırasında hata oluştu.", "error");
          }
      },
      handleDeleteUser: async (id: string) => {
          if (!id || !activeSchoolId) return;
          requestConfirm("Bu kullanıcıyı silmek istediğinize emin misiniz?", async () => {
              try {
                  const { doc, deleteDoc, getDoc, updateDoc, arrayRemove } = await import('firebase/firestore');
                  const { db } = await import('./lib/firebase');
                  const userColName = activeSchoolId === 'default' ? 'users' : `users_${activeSchoolId}`;
                  
                  // Get user data first to remove from schoolData if student
                  const userRef = doc(db, userColName, id);
                  const userSnap = await getDoc(userRef);
                  
                  if (userSnap.exists()) {
                      const userData = userSnap.data();
                      if (userData.role === 'student' && userData.classLevel) {
                          const sysColName = activeSchoolId === 'default' ? 'system' : `system_${activeSchoolId}`;
                          const schoolDataRef = doc(db, sysColName, 'schoolData');
                          await updateDoc(schoolDataRef, {
                              [userData.classLevel]: arrayRemove(userData.name)
                          });
                      }
                  }

                  await deleteDoc(userRef);
                  showToast("Kullanıcı silindi.", "success");
              } catch (error) {
                  console.error("Error deleting user:", error);
                  showToast("Silme işlemi başarısız.", "error");
              }
          });
      },
      handleResetPassword: async (user: any) => {
          if (!user || !activeSchoolId) return;
          requestConfirm(`${user.name} kullanıcısının şifresini sıfırlamak istiyor musunuz?`, async () => {
              try {
                  const { doc, updateDoc } = await import('firebase/firestore');
                  const { db } = await import('./lib/firebase');
                  const userColName = activeSchoolId === 'default' ? 'users' : `users_${activeSchoolId}`;
                  const newPassword = Math.floor(1000 + Math.random() * 9000).toString();
                  
                  await updateDoc(doc(db, userColName, user.id), { password: newPassword });
                  showToast(`Şifre sıfırlandı: ${newPassword}`, "success");
              } catch (error) {
                  console.error("Error resetting password:", error);
                  showToast("Şifre sıfırlanamadı.", "error");
              }
          });
      }, 
      handleExcelUpload: async (e: any, targetClass: string | null = null) => {
          const file = e.target.files[0];
          if (!file) return;
          setExcelFile(file);
          
          try {
              const { read, utils } = await import('xlsx');
              const reader = new FileReader();
              reader.onload = (evt) => {
                  const bstr = evt.target?.result;
                  const wb = read(bstr, { type: 'binary' });
                  const wsname = wb.SheetNames[0];
                  const ws = wb.Sheets[wsname];
                  const data = utils.sheet_to_json(ws, { header: 1 });
                  
                  // Find headers to detect columns intelligently
                  let headerRowIndex = -1;
                  let colIndices = { no: -1, ad: -1, soyad: -1, fullName: -1 };

                  for (let i = 0; i < Math.min(data.length, 20); i++) {
                      const row = data[i] as any[];
                      if (!row) continue;
                      
                      row.forEach((cell, idx) => {
                          if (!cell) return;
                          const str = cell.toString().trim().toLowerCase();
                          // No column
                          if (str.includes('no') || str.includes('numara')) colIndices.no = idx;
                          
                          // Ad Soyad column (MUST contain both and NOT just be 'soyadı')
                          if (str.includes('ad') && str.includes('soyad') && !['soyadı', 'soyadi', 'soyad'].includes(str)) {
                              colIndices.fullName = idx;
                          }
                          
                          // Ad column (Specific match)
                          if (['ad', 'adı', 'adı', 'adi', 'adiniz', 'adınız'].includes(str)) {
                              colIndices.ad = idx;
                          }
                          
                          // Soyad column (Specific match)
                          if (['soyad', 'soyadı', 'soyadi', 'soyadınız', 'soyadiniz'].includes(str)) {
                              colIndices.soyad = idx;
                          }
                      });

                      // Prioritize Ad + Soyad over FullName if both are available
                      if (colIndices.no !== -1 && colIndices.ad !== -1 && colIndices.soyad !== -1) {
                          headerRowIndex = i;
                          colIndices.fullName = -1; // Specific columns found, unset generic one
                          break;
                      }

                      if (colIndices.no !== -1 && colIndices.fullName !== -1) {
                          headerRowIndex = i;
                          break;
                      }
                  }

                  let preview: any[] = [];

                  if (targetClass) {
                      // We are uploading students to a specific class from the 'Classes' tab
                      if (headerRowIndex !== -1) {
                          preview = data.slice(headerRowIndex + 1).map((row: any) => {
                              let name = '';
                              if (colIndices.ad !== -1 && colIndices.soyad !== -1) {
                                  name = `${row[colIndices.ad] || ''} ${row[colIndices.soyad] || ''}`.trim();
                              } else if (colIndices.fullName !== -1) {
                                  name = row[colIndices.fullName]?.toString() || '';
                              }
                              
                              const no = row[colIndices.no];
                              const finalName = no ? `${no} - ${name}` : name;

                              return {
                                  name: finalName,
                                  classLevel: targetClass,
                                  role: 'student'
                              };
                          }).filter(r => r.name && r.name.length > 3);
                      } else {
                          preview = data.slice(1).map((row: any) => ({
                              name: row[0],
                              classLevel: targetClass,
                              role: 'student'
                          })).filter((r: any) => r.name);
                      }
                  } else {
                      // We are uploading users from the 'Users' tab
                      preview = data.slice(1).map((row: any) => {
                          const rawRole = (row[3] || '').toString().toLowerCase().trim();
                          return {
                              name: row[0],
                              username: row[1] ? row[1].toString().trim() : '',
                              password: row[2] ? row[2].toString().trim() : '',
                              role: rawRole === 'yonetici' ? 'admin' : 'teacher' // Only allow teacher/admin
                          };
                      }).filter((r: any) => r.name);
                  }
                  
                  if (preview.length > 0) {
                      setExcelPreview(preview);
                      showToast(`${preview.length} kayıt tespit edildi. İçe aktarmayı onaylayın.`, "info");
                  } else {
                      showToast("Dosyada geçerli veri bulunamadı.", "error");
                  }
              };
              reader.readAsBinaryString(file);
          } catch (error) {
              console.error("Excel read error:", error);
              showToast("Excel dosyası okunamadı.", "error");
          }
      },
      handleImportExcel: async () => {
          if (excelPreview.length === 0 || !activeSchoolId) return;
          try {
              const { collection, addDoc, doc, updateDoc, arrayUnion, getDoc, setDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const { generateCredentials } = await import('./lib/utils');
              const userColName = activeSchoolId === 'default' ? 'users' : `users_${activeSchoolId}`;
              const sysColName = activeSchoolId === 'default' ? 'system' : `system_${activeSchoolId}`;
              const schoolDataRef = doc(db, sysColName, 'schoolData');

              for (const user of excelPreview) {
                  const creds = generateCredentials(user.name);
                  await addDoc(collection(db, userColName), {
                      ...user,
                      ...creds,
                      schoolId: activeSchoolId,
                      createdAt: new Date().toISOString()
                  });

                  if (user.role === 'student' && user.classLevel) {
                      const snap = await getDoc(schoolDataRef);
                      if (snap.exists()) {
                          await updateDoc(schoolDataRef, {
                              [user.classLevel]: arrayUnion(user.name)
                          });
                      } else {
                          await setDoc(schoolDataRef, {
                              [user.classLevel]: [user.name]
                          });
                      }
                  }
              }

              if (excelPreview.length > 0) {
                  const firstUser = excelPreview[0];
                  if (firstUser.role === 'student' && firstUser.classLevel) {
                      setAdminTab('classes');
                  } else {
                      setAdminTab('list');
                  }
              }

              setExcelFile(null);
              setExcelPreview([]);
              showToast(`${excelPreview.length} kullanıcı içe aktarıldı.`, "success");
          } catch (error) {
              console.error("Import error:", error);
              showToast("İçe aktarma başarısız.", "error");
          }
      }, 
      setExcelFile, setExcelPreview,
      setSelectedStudent,
      handleAddClass: async (className: string) => {
          if (!className || !activeSchoolId) return;
          const formattedName = className.toUpperCase().replace(/^_+/, '');
          try {
              const { doc, updateDoc, setDoc, getDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const sysColName = activeSchoolId === 'default' ? 'system' : `system_${activeSchoolId}`;
              const docRef = doc(db, sysColName, 'schoolData');
              const snap = await getDoc(docRef);
              if (snap.exists()) {
                  await updateDoc(docRef, { [formattedName]: [] });
              } else {
                  await setDoc(docRef, { [formattedName]: [] });
              }
              showToast("Sınıf eklendi.", "success");
          } catch (error) {
              console.error("Error adding class:", error);
              showToast("Hata oluştu.", "error");
          }
      },
      handleDeleteClass: async (className: string) => {
          if (!className || !activeSchoolId) return;
          requestConfirm(`${className.replace('_', '')} sınıfını ve tüm öğrenci listesini silmek istediğinize emin misiniz?`, async () => {
              try {
                  const { doc, updateDoc, deleteField } = await import('firebase/firestore');
                  const { db } = await import('./lib/firebase');
                  const sysColName = activeSchoolId === 'default' ? 'system' : `system_${activeSchoolId}`;
                  const docRef = doc(db, sysColName, 'schoolData');
                  await updateDoc(docRef, { [className]: deleteField() });
                  showToast("Sınıf silindi.", "success");
              } catch (error) {
                  console.error("Error deleting class:", error);
                  showToast("Hata oluştu.", "error");
              }
          });
      },
      handleAddCategory: async (category: string) => {
          if (!category || !activeSchoolId) return;
          try {
              const { doc, updateDoc, arrayUnion, setDoc, getDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const sysColName = activeSchoolId === 'default' ? 'system' : `system_${activeSchoolId}`;
              const docRef = doc(db, sysColName, 'curriculum');
              const snap = await getDoc(docRef);
              if (snap.exists()) {
                  await updateDoc(docRef, { categories: arrayUnion(category) });
              } else {
                  await setDoc(docRef, { categories: [category], tasks: [] });
              }
              showToast("Kategori eklendi.", "success");
          } catch (error) {
              console.error("Error adding category:", error);
          }
      },
      handleDeleteCategory: async (category: string) => {
          if (!category || !activeSchoolId) return;
          requestConfirm(`${category} kategorisini silmek istediğinize emin misiniz?`, async () => {
              try {
                  const { doc, updateDoc, arrayRemove } = await import('firebase/firestore');
                  const { db } = await import('./lib/firebase');
                  const sysColName = activeSchoolId === 'default' ? 'system' : `system_${activeSchoolId}`;
                  await updateDoc(doc(db, sysColName, 'curriculum'), { categories: arrayRemove(category) });
                  showToast("Kategori silindi.", "success");
              } catch (error) {
                  console.error("Error deleting category:", error);
              }
          });
      },
      handleAddTask: async (task: any) => {
          if (!task.title || !activeSchoolId) return;
          try {
              const { doc, updateDoc, arrayUnion } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const sysColName = activeSchoolId === 'default' ? 'system' : `system_${activeSchoolId}`;
              await updateDoc(doc(db, sysColName, 'curriculum'), { tasks: arrayUnion(task) });
              showToast("Görev eklendi.", "success");
          } catch (error) {
              console.error("Error adding task:", error);
          }
      },
      handleDeleteTask: async (task: any) => {
          if (!task || !activeSchoolId) return;
          requestConfirm(`${task.title} görevini silmek istediğinize emin misiniz?`, async () => {
              try {
                  const { doc, updateDoc, arrayRemove } = await import('firebase/firestore');
                  const { db } = await import('./lib/firebase');
                  const sysColName = activeSchoolId === 'default' ? 'system' : `system_${activeSchoolId}`;
                  await updateDoc(doc(db, sysColName, 'curriculum'), { tasks: arrayRemove(task) });
                  showToast("Görev silindi.", "success");
              } catch (error) {
                  console.error("Error deleting task:", error);
              }
          });
      },
      handleUpdateTask: async (oldTask: any, newTitle: string) => {
          if (!oldTask || !newTitle || !activeSchoolId) return;
          try {
              const { doc, getDoc, updateDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const sysColName = activeSchoolId === 'default' ? 'system' : `system_${activeSchoolId}`;
              const docRef = doc(db, sysColName, 'curriculum');
              const snap = await getDoc(docRef);
              if (snap.exists()) {
                  const data = snap.data();
                  const newTasks = (data.tasks || []).map((t: any) => {
                      const tTitle = typeof t === 'string' ? t : t.title;
                      const tCat = typeof t === 'string' ? '' : t.category;
                      const oldTitle = typeof oldTask === 'string' ? oldTask : oldTask.title;
                      const oldCat = typeof oldTask === 'string' ? '' : oldTask.category;
                      
                      if (tTitle === oldTitle && tCat === oldCat) {
                          return typeof t === 'string' ? newTitle : { ...t, title: newTitle };
                      }
                      return t;
                  });
                  await updateDoc(docRef, { tasks: newTasks });
                  showToast("Görev güncellendi.", "success");
              }
          } catch (error) {
              console.error("Error updating task:", error);
          }
      },
      handleUpdateCategory: async (oldName: string, newName: string) => {
          if (!oldName || !newName || !activeSchoolId) return;
          try {
              const { doc, getDoc, updateDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const sysColName = activeSchoolId === 'default' ? 'system' : `system_${activeSchoolId}`;
              const docRef = doc(db, sysColName, 'curriculum');
              const snap = await getDoc(docRef);
              if (snap.exists()) {
                  const data = snap.data();
                  const newCategories = (data.categories || []).map((c: string) => c === oldName ? newName : c);
                  const newTasks = (data.tasks || []).map((t: any) => t.category === oldName ? { ...t, category: newName } : t);
                  await updateDoc(docRef, { categories: newCategories, tasks: newTasks });
                  showToast("Kategori güncellendi.", "success");
              }
          } catch (error) {
              console.error("Error updating category:", error);
          }
      },
      handleUpdateSuccessDescription: async (level: number, text: string) => {
          if (!activeSchoolId) return;
          try {
              const { doc, updateDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const sysColName = activeSchoolId === 'default' ? 'system' : `system_${activeSchoolId}`;
              await updateDoc(doc(db, sysColName, 'curriculum'), { [`successDescriptions.${level}`]: text });
              showToast("Açıklama güncellendi.", "success");
          } catch (error) {
              console.error("Error updating success description:", error);
          }
      },
      handleUpdateRemedialTask: async (level: number, text: string) => {
          if (!activeSchoolId) return;
          try {
              const { doc, updateDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const sysColName = activeSchoolId === 'default' ? 'system' : `system_${activeSchoolId}`;
              await updateDoc(doc(db, sysColName, 'curriculum'), { [`remedialTasks.${level}`]: text });
              showToast("Telafi ödevi güncellendi.", "success");
          } catch (error) {
              console.error("Error updating remedial task:", error);
          }
      },
      handleUpdateRemedialProblem: async (level: number, text: string) => {
          if (!activeSchoolId) return;
          try {
              const { doc, updateDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const sysColName = activeSchoolId === 'default' ? 'system' : `system_${activeSchoolId}`;
              await updateDoc(doc(db, sysColName, 'curriculum'), { [`remedialProblems.${level}`]: text });
              showToast("Sorun açıklaması güncellendi.", "success");
          } catch (error) {
              console.error("Error updating remedial problem:", error);
          }
      },
      handleUpdateUncompletedReason: async (level: number, text: string) => {
          if (!activeSchoolId) return;
          try {
              const { doc, updateDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const sysColName = activeSchoolId === 'default' ? 'system' : `system_${activeSchoolId}`;
              await updateDoc(doc(db, sysColName, 'curriculum'), { [`uncompletedReasons.${level}`]: text });
              showToast("Yapmadi sebebi güncellendi.", "success");
          } catch (error) {
              console.error("Error updating uncompleted reason:", error);
          }
      },
      handleUpdateDevCardConfig: async (config: any) => {
          if (!activeSchoolId) return;
          try {
              const { doc, setDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const sysColName = activeSchoolId === 'default' ? 'system' : `system_${activeSchoolId}`;
              await setDoc(doc(db, sysColName, 'devCardConfig'), config);
              showToast("Gelişim kartı ayarları güncellendi.", "success");
          } catch (error) {
              console.error("Error updating devCardConfig:", error);
          }
      },
      handleUpdateClassPerformances: async (records: any[]) => {
          if (!activeSchoolId) return;
          try {
              const { doc, setDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const sysColName = activeSchoolId === 'default' ? 'system' : `system_${activeSchoolId}`;
              await setDoc(doc(db, sysColName, 'classPerformances'), { records });
              showToast("Sınıf performans kayıtları güncellendi.", "success");
          } catch (error) {
              console.error("Error updating classPerformances:", error);
          }
      },
      handleUpdateBehaviorConfig: async (config: any) => {
          if (!activeSchoolId) return;
          try {
              const { doc, setDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const sysColName = activeSchoolId === 'default' ? 'system' : `system_${activeSchoolId}`;
              await setDoc(doc(db, sysColName, 'behaviorConfig'), config);
              showToast("Davranış kartı ayarları güncellendi.", "success");
          } catch (error) {
              console.error("Error updating behaviorConfig:", error);
          }
      },
      handleBulkAddStudents: async (classId: string, input: string) => {
          if (!classId || !input || !activeSchoolId) return;
          const names = input.split(/[\n,]/).map(n => n.trim()).filter(n => n.length > 0);
          if (names.length === 0) return;

          try {
              const { collection, addDoc, doc, updateDoc, arrayUnion } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const { generateCredentials } = await import('./lib/utils');
              const userColName = activeSchoolId === 'default' ? 'users' : `users_${activeSchoolId}`;
              const sysColName = activeSchoolId === 'default' ? 'system' : `system_${activeSchoolId}`;

              const formattedNames = names.map(name => {
                  let str = name;
                  // If string starts with a number, ensure it's separated by " - "
                  const match = str.match(/^(\d+)\s*[-]*\s*(.+)$/);
                  if (match) {
                      return `${match[1]} - ${match[2]}`;
                  }
                  return str;
              });

              for (const name of formattedNames) {
                  const creds = generateCredentials(name);
                  await addDoc(collection(db, userColName), {
                      name,
                      ...creds,
                      role: 'student',
                      classLevel: classId,
                      schoolId: activeSchoolId,
                      createdAt: new Date().toISOString()
                  });
              }

              const schoolDataRef = doc(db, sysColName, 'schoolData');
              await updateDoc(schoolDataRef, {
                  [classId]: arrayUnion(...formattedNames)
              });

              showToast(`${formattedNames.length} öğrenci başarıyla eklendi.`, "success");
          } catch (error) {
              console.error("Error bulk adding students:", error);
              showToast("Öğrenciler eklenirken hata oluştu.", "error");
          }
      }
  };

  const state = {
      loginSchoolId, loginCategory, schools, loginUsername, loginPassword, loginError, appTheme, themeColors, appToast,
      currentUser, schoolStats, superAdmins, superAdminTab, newSchoolName, newSa, saPasswordForm, tickets,
      activeSchoolId, supportView, selectedTicket, ticketForm, ticketReply,
      selectedStudent, selectedClass, categories, tasks, evaluations, successDescriptions, remedialTasks, remedialProblems, uncompletedReasons,
      devCardConfig, devCardData, newActivity, schoolPortfolios, classPerformances,
      users, selectedTeacherForPerf, newTeacherActivity, teacherPerfConfig, teacherPerfData,
      behaviorConfig, activeBehaviorCard, behaviorLog, getBehaviorScore,
      assignments, selectedReportAssignment, reportFilterClass, classes, homeworkTab, assignmentType, adminHomeworkForm, editAssignmentData, hwProgress,
      guidanceForms, guidanceFilterForm, guidanceFilterClass, guidanceFilterStatus, guidanceSearchQuery, guidanceTab, guidanceAssignments, guidanceFormConfigs,
      socialClubs,
      studentGuidanceForm, studentGuidanceAnswers,
      studentHomework, homeworkAnswers,
      badges, userBadges,
      profileForm,
      adminTab, newUser, editUser, excelFile, excelPreview
  };

  if (publicSurveySuffix) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 font-sans">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        {publicSurveyLoading ? (
          <div className="bg-white p-12 rounded-[32px] border border-gray-100 shadow-xl max-w-md w-full text-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto animate-duration-500"></div>
            <h3 className="text-lg font-black text-gray-800">Anket Yükleniyor</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Arif - Maarif Asistanınız</p>
          </div>
        ) : publicSurveyError ? (
          <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-xl max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto text-2xl font-black">!</div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-gray-800 leading-tight">Anket Yüklenemedi</h3>
              <p className="text-xs font-semibold text-rose-600 bg-rose-50/50 p-4 rounded-2xl border border-rose-100/50 leading-relaxed">{publicSurveyError}</p>
            </div>
            <button 
              type="button"
              onClick={() => { window.location.href = window.location.origin; }}
              className="w-full bg-slate-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-800 transition-all text-xs uppercase tracking-wider cursor-pointer"
            >
              Ana Sayfaya Dön
            </button>
          </div>
        ) : publicSubmitted ? (
          <div className="bg-white p-12 rounded-[32px] border border-gray-100 shadow-xl max-w-lg w-full text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto text-3xl font-black">✓</div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-gray-800 leading-tight">Teşekkür Ederiz!</h3>
              <p className="text-xs font-semibold text-gray-500 leading-relaxed">
                Anket yanıtınız başarıyla kaydedilmiştir. Katılımınız ve değerli görüşleriniz bizim için çok kıymetlidir.
              </p>
            </div>
            <div className="border-t border-gray-100 pt-6">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Arif - Maarif Asistanınız</p>
            </div>
          </div>
        ) : publicSurveyData ? (
          <div className="bg-white p-8 md:p-12 rounded-[40px] border border-gray-100 shadow-2xl max-w-3xl w-full space-y-8 my-8 relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Branding Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-6 gap-4">
              <div>
                <span className="bg-indigo-50 text-indigo-700 font-black text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg inline-block">KAMU BAĞLANTISI</span>
                <h1 className="text-xl font-black text-gray-900 mt-2.5 leading-tight">{publicSurveyData.schema.title}</h1>
                <p className="text-xs font-medium text-gray-400 leading-relaxed mt-2">{publicSurveyData.schema.desc}</p>
              </div>
              <div className="shrink-0 font-extrabold text-right hidden sm:block">
                <div className="text-slate-800 text-lg tracking-wider font-sans font-black">ARİF</div>
                <div className="text-[9px] text-indigo-500 uppercase tracking-widest leading-none">Maarif Asistanı</div>
              </div>
            </div>

            {/* Questions list */}
            <div className="space-y-6">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-l-4 border-indigo-600 pl-3">DEĞERLENDİRME DEĞERLERİ</h4>
              
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {publicSurveyData.schema.questions.map((q: any, idx: number) => {
                  const key = `q_${idx}`;
                  const selectedVal = publicAnswers[key];
                  return (
                    <div key={idx} className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl space-y-3.5 shadow-sm hover:border-slate-200 transition-all">
                      <div className="space-y-1">
                        <span className="text-[9px] font-extrabold bg-indigo-50 text-indigo-700 uppercase tracking-widest px-2 py-0.5 rounded-sm inline-block">{q.category}</span>
                        <p className="text-xs font-semibold text-slate-800 leading-relaxed pr-2">
                          <span className="text-indigo-600 font-extrabold mr-1">{idx + 1}.</span> {q.text}
                        </p>
                      </div>

                      {/* Columns Choices */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                        {publicSurveyData.schema.columns.map((col: string, colIdx: number) => {
                          const optionValue = col;
                          const isSelected = selectedVal === optionValue;
                          return (
                            <label 
                              key={colIdx}
                              className={`py-2 px-2.5 border rounded-xl text-[10px] font-bold text-center cursor-pointer transition-all select-none flex items-center justify-center min-h-[38px] leading-tight ${isSelected ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'border-gray-200/80 bg-white text-gray-600 hover:border-indigo-350'}`}
                            >
                              <input 
                                type="radio"
                                name={key}
                                checked={isSelected}
                                onChange={() => setPublicAnswers(prev => ({ ...prev, [key]: optionValue }))}
                                className="hidden"
                              />
                              {col}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Open questions if exist */}
                {publicSurveyData.schema.openQuestions?.map((oq: string, oqIdx: number) => {
                  const key = `open_${oqIdx}`;
                  return (
                    <div key={oqIdx} className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl space-y-2.5 shadow-sm hover:border-slate-200 transition-all">
                      <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider block">Giriş / Açık Uçlu Görüş</span>
                      <p className="text-xs font-bold text-slate-800 leading-relaxed">{oq}</p>
                      <textarea
                        rows={3}
                        placeholder="Lütfen görüşlerinizi buraya yazınız..."
                        value={publicAnswers[key] || ''}
                        onChange={e => setPublicAnswers(prev => ({ ...prev, [key]: e.target.value }))}
                        className="w-full bg-white border border-gray-200 py-3 px-4 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submission Button */}
            <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span className="text-rose-500 font-extrabold mr-1">*</span> Tüm değerlendirmelerin girilmesi önem arz etmektedir.
              </span>
              <button 
                type="button"
                disabled={publicSubmitting}
                onClick={handlePublicSurveySubmit}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-200 transition-all select-none cursor-pointer text-xs uppercase"
              >
                {publicSubmitting ? 'Kaydediliyor...' : 'Anketi Gönder'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-12 rounded-[32px] border border-gray-100 shadow-xl max-w-md w-full text-center space-y-4">
            <h3 className="text-lg font-black text-gray-800">Bağlantı Kuruluyor</h3>
          </div>
        )}
        {appToast.message && <Toast message={appToast.message} type={appToast.type} onClose={() => setAppToast({ message: null, type: 'info' })} />}
      </div>
    );
  }

  if (!currentUser) {
      return <Login state={state} actions={actions} />;
  }

  if (currentUser.role === 'superadmin') {
      return (
          <>
              <SuperAdminPanel state={state} actions={actions} />
              {appToast.message && <Toast message={appToast.message} type={appToast.type} onClose={() => setAppToast({ message: null, type: 'info' })} />}
              <ConfirmModal isOpen={confirmModal.isOpen} message={confirmModal.message} onConfirm={() => { if(confirmModal.onConfirm) confirmModal.onConfirm(); setConfirmModal({ isOpen: false, message: '', onConfirm: null }); }} onCancel={() => setConfirmModal({ isOpen: false, message: '', onConfirm: null })} />
              <PromptModal isOpen={promptModal.isOpen} message={promptModal.message} defaultValue={promptModal.defaultValue} onConfirm={(val: string) => { if(promptModal.onConfirm) promptModal.onConfirm(val); setPromptModal({ isOpen: false, message: '', defaultValue: '', onConfirm: null }); }} onCancel={() => setPromptModal({ isOpen: false, message: '', defaultValue: '', onConfirm: null })} />
          </>
      );
  }

  if (currentUser.role === 'provincial_admin' || currentUser.role === 'district_admin') {
      return (
          <>
              <RegionalDashboard state={state} actions={actions} />
              {appToast.message && <Toast message={appToast.message} type={appToast.type} onClose={() => setAppToast({ message: null, type: 'info' })} />}
              <ConfirmModal isOpen={confirmModal.isOpen} message={confirmModal.message} onConfirm={() => { if(confirmModal.onConfirm) confirmModal.onConfirm(); setConfirmModal({ isOpen: false, message: '', onConfirm: null }); }} onCancel={() => setConfirmModal({ isOpen: false, message: '', onConfirm: null })} />
          </>
      );
  }

  const renderContent = () => {
      const isStudent = currentUser.role === 'student' || currentUser.role === 'öğrenci';

      if (isStudent) {
          switch (activeTab) {
              case 'homework': return <StudentHomePanel state={state} actions={actions} section="homework" />;
              case 'guidance': return <StudentHomePanel state={state} actions={actions} section="guidance" />;
              case 'profile': return <ProfilePanel state={state} actions={actions} />;
              default: return <StudentHomePanel state={state} actions={actions} section="homework" />;
          }
      }

      switch (activeTab) {
          case 'home': return <div className="p-8">Hoş Geldiniz</div>;
          case 'portfolio': return <PortfolioPanel state={state} actions={actions} />;
          case 'eval': return <EvaluationPanel state={state} actions={actions} />;
          case 'devcard': return <DevCardPanel state={state} actions={actions} />;
          case 'teacherperf': return <TeacherPerfPanel state={state} actions={actions} />;
          case 'behavior': return <BehaviorEvalPanel state={state} actions={actions} />;
          case 'homework': return <AdminHomeworkPanel state={state} actions={actions} />;
          case 'guidance': return <AdminGuidancePanel state={state} actions={actions} />;
          case 'socialclubs': return <SocialClubsPanel state={state} actions={actions} />;
          case 'admin': return <AdminPanel state={state} actions={{ ...actions, setActiveTab }} />;
          case 'profile': return <ProfilePanel state={state} actions={actions} />;
          case 'support': return <SupportTickets state={state} actions={actions} isSuperAdmin={false} />;
          default: return <div>Not Found</div>;
      }
  };

  return (
      <div className="min-h-screen bg-[#F8FAFC] font-inter text-gray-800 flex flex-col selection:bg-blue-100 selection:text-blue-900" style={{ '--theme-color': themeColors[appTheme][600], '--theme-bg': themeColors[appTheme][50] } as React.CSSProperties}>
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50 shadow-sm print:hidden">
              <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
                  {/* Left: School Info */}
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100" style={{ backgroundColor: 'var(--theme-color)' }}>
                          <School className="text-white" size={24} />
                      </div>
                      <div className="flex flex-col">
                          <h1 className="font-black text-xl leading-none tracking-tight text-blue-900">
                              {schools.find(s => s.id === activeSchoolId)?.name || 'Arif'}
                          </h1>
                          {currentUser.role !== 'student' && (
                            <>
                              <div className="flex items-center gap-2 mt-1">
                                  <span 
                                      onClick={() => actions.handleSloganChange()}
                                      className="text-[13px] font-bold text-orange-600 cursor-pointer hover:underline"
                                  >
                                      {schools.find(s => s.id === activeSchoolId)?.slogan || 'Maarif Asistanınız'}
                                  </span>
                              </div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">ARİF - MAARİF ASİSTANINIZ</p>
                            </>
                          )}
                      </div>
                  </div>

                  {/* Middle: Selectors */}
                  {currentUser.role !== 'student' && (
                      <div className="flex items-center gap-3">
                          <div className="relative">
                              <select 
                                  value={selectedClass || ''} 
                                  onChange={(e) => {
                                      setSelectedClass(e.target.value);
                                      setSelectedStudent(null);
                                  }}
                                  className="appearance-none bg-gray-50 border border-gray-200 py-2.5 pl-4 pr-10 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 cursor-pointer transition-all shadow-sm min-w-[120px]"
                              >
                                  <option value="">Sınıf Seç</option>
                                  {Object.keys(classes).sort().map(k => (
                                      <option key={k} value={k}>{k.replace('_', '')}</option>
                                  ))}
                              </select>
                              <ChevronRight className="absolute right-3 top-3 text-gray-400 pointer-events-none rotate-90" size={16}/>
                          </div>
                          <div className="relative">
                              <select 
                                  value={selectedStudent || ''} 
                                  onChange={(e) => setSelectedStudent(e.target.value)}
                                  disabled={!selectedClass}
                                  className="appearance-none bg-gray-50 border border-gray-200 py-2.5 pl-4 pr-10 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 cursor-pointer transition-all shadow-sm min-w-[160px] disabled:opacity-50"
                              >
                                  <option value="">Öğrenci Seç</option>
                                  {selectedClass && classes[selectedClass]?.map((student: string) => (
                                      <option key={student} value={student}>{student}</option>
                                  ))}
                              </select>
                              <ChevronRight className="absolute right-3 top-3 text-gray-400 pointer-events-none rotate-90" size={16}/>
                          </div>
                      </div>
                  )}

                  {/* Right: User Info */}
                  <div className="flex items-center gap-4 pl-4 border-l border-gray-100">
                      {currentUser.originalRole && (
                          <button onClick={() => {
                              setCurrentUser({...currentUser, role: currentUser.originalRole, originalRole: undefined});
                              setActiveSchoolId(null);
                          }} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-bold text-xs hover:bg-purple-200 transition-colors">
                              {currentUser.originalRole === 'superadmin' ? 'Süper Yöneticiye Dön' : 'Rapor Paneline Dön'}
                          </button>
                      )}
                      <div className="text-right hidden sm:block">
                          <div className="font-black text-sm text-gray-900 leading-tight">{currentUser.name || currentUser.username}</div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{currentUser.role === 'admin' ? 'YÖNETİCİ' : currentUser.role === 'teacher' ? 'ÖĞRETMEN' : 'ÖĞRENCİ'}</div>
                      </div>
                      <button onClick={actions.logout} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-200 transition-all" title="Çıkış Yap">
                          <LogOut size={18} />
                      </button>
                  </div>
              </div>
          </header>

          {/* Navigation Tabs */}
          <nav className="bg-white border-b border-gray-200 px-6 overflow-x-auto scrollbar-hide shrink-0 print:hidden">
              <div className={`max-w-[1600px] mx-auto flex gap-8 ${currentUser.role === 'student' ? 'justify-center' : ''}`}>
                  {currentUser.role !== 'student' ? (
                    <>
                      <button onClick={() => setActiveTab('eval')} className={`flex items-center gap-2.5 py-4 text-sm font-bold transition-all whitespace-nowrap border-b-2 ${activeTab === 'eval' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-800 hover:border-gray-300'}`}>
                          <Activity size={18} className={activeTab === 'eval' ? 'text-blue-600' : 'text-gray-400'}/> Değerlendirme
                      </button>
                      <button onClick={() => setActiveTab('devcard')} className={`flex items-center gap-2.5 py-4 text-sm font-bold transition-all whitespace-nowrap border-b-2 ${activeTab === 'devcard' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-800 hover:border-gray-300'}`}>
                          <Shield size={18} className={activeTab === 'devcard' ? 'text-blue-600' : 'text-gray-400'}/> Gelişim Kartı
                      </button>
                      <button onClick={() => setActiveTab('behavior')} className={`flex items-center gap-2.5 py-4 text-sm font-bold transition-all whitespace-nowrap border-b-2 ${activeTab === 'behavior' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-800 hover:border-gray-300'}`}>
                          <BarChart2 size={18} className={activeTab === 'behavior' ? 'text-blue-600' : 'text-gray-400'}/> Davranış Notu
                      </button>
                      <button onClick={() => setActiveTab('homework')} className={`flex items-center gap-2.5 py-4 text-sm font-bold transition-all whitespace-nowrap border-b-2 ${activeTab === 'homework' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-800 hover:border-gray-300'}`}>
                          <BookOpen size={18} className={activeTab === 'homework' ? 'text-blue-600' : 'text-gray-400'}/> Ödevlerim
                           {assignments.filter((a: any) => {
                               if (!a || !a.classes || !currentUser || !currentUser.classLevel) return false;
                               const normalize = (s: any) => String(s || '').replace(/[\s_\\/-]/g, '').toLowerCase();
                               const isClassMatch = a.classes.some((c: string) => normalize(c) === normalize(currentUser.classLevel));
                               if (!isClassMatch) return false;
                               if (a.targetType === 'student') {
                                   return (normalize(a.targetStudent) === normalize(currentUser.username) || normalize(a.targetStudent) === normalize(currentUser.name)) && !hwProgress[`${currentUser.id}_${a.id}`]?.completed;
                               }
                               return !hwProgress[`${currentUser.id}_${a.id}`]?.completed;
                           }).length > 0 && (
                             <span className="bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black">
                               {assignments.filter((a: any) => {
                                   if (!a || !a.classes || !currentUser || !currentUser.classLevel) return false;
                                   const normalize = (s: any) => String(s || '').replace(/[\s_\\/-]/g, '').toLowerCase();
                                   const isClassMatch = a.classes.some((c: string) => normalize(c) === normalize(currentUser.classLevel));
                                   if (!isClassMatch) return false;
                                   if (a.targetType === 'student') {
                                       return (normalize(a.targetStudent) === normalize(currentUser.username) || normalize(a.targetStudent) === normalize(currentUser.name)) && !hwProgress[`${currentUser.id}_${a.id}`]?.completed;
                                   }
                                   return !hwProgress[`${currentUser.id}_${a.id}`]?.completed;
                               }).length}
                             </span>
                           )}</button>
                      <button onClick={() => setActiveTab('guidance')} className={`flex items-center gap-2.5 py-4 text-sm font-bold transition-all whitespace-nowrap border-b-2 ${activeTab === 'guidance' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-800 hover:border-gray-300'}`}>
                          <FileText size={18} className={activeTab === 'guidance' ? 'text-blue-600' : 'text-gray-400'}/> Rehberlik
                      </button>
                      <button onClick={() => setActiveTab('socialclubs')} className={`flex items-center gap-2.5 py-4 text-sm font-bold transition-all whitespace-nowrap border-b-2 ${activeTab === 'socialclubs' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-800 hover:border-gray-300'}`}>
                          <Users size={18} className={activeTab === 'socialclubs' ? 'text-blue-600' : 'text-gray-400'}/> Sosyal Kulüpler
                      </button>
                      {currentUser.role === 'admin' && (
                          <button onClick={() => setActiveTab('teacherperf')} className={`flex items-center gap-2.5 py-4 text-sm font-bold transition-all whitespace-nowrap border-b-2 ${activeTab === 'teacherperf' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-800 hover:border-gray-300'}`}>
                              <Activity size={18} className={activeTab === 'teacherperf' ? 'text-blue-600' : 'text-gray-400'}/> Personel Performans
                          </button>
                      )}
                      <button onClick={() => setActiveTab('portfolio')} className={`flex items-center gap-2.5 py-4 text-sm font-bold transition-all whitespace-nowrap border-b-2 ${activeTab === 'portfolio' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-800 hover:border-gray-300'}`}>
                          <Users size={18} className={activeTab === 'portfolio' ? 'text-blue-600' : 'text-gray-400'}/> Portfolyo
                      </button>
                      <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-2.5 py-4 text-sm font-bold transition-all whitespace-nowrap border-b-2 ${activeTab === 'profile' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-800 hover:border-gray-300'}`}>
                          <User size={18} className={activeTab === 'profile' ? 'text-blue-600' : 'text-gray-400'}/> Profilim
                      </button>
                      {currentUser.role === 'admin' && (
                          <button onClick={() => setActiveTab('admin')} className={`flex items-center gap-2.5 py-4 text-sm font-bold transition-all whitespace-nowrap border-b-2 ${activeTab === 'admin' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-800 hover:border-gray-300'}`}>
                              <Settings size={18} className={activeTab === 'admin' ? 'text-blue-600' : 'text-gray-400'}/> Yönetim Paneli
                          </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button onClick={() => setActiveTab('homework')} className={`flex items-center gap-2.5 py-4 text-sm font-bold transition-all whitespace-nowrap border-b-2 ${activeTab === 'homework' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-800 hover:border-gray-300'}`}>
                          <BookOpen size={18} className={activeTab === 'homework' ? 'text-blue-600' : 'text-gray-400'}/> Ödevlerim
                          {assignments.filter((a: any) => {
                              if (!a || !a.classes || !currentUser || !currentUser.classLevel) return false;
                              const normalize = (s: any) => String(s || '').replace(/[\s_\\/-]/g, '').toLowerCase();
                              return a.classes.some((c: string) => normalize(c) === normalize(currentUser.classLevel)) && !hwProgress[`${currentUser.id}_${a.id}`]?.completed;
                          }).length > 0 && (
                            <span className="bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black">
                              {assignments.filter((a: any) => {
                                  if (!a || !a.classes || !currentUser || !currentUser.classLevel) return false;
                                  const normalize = (s: any) => String(s || '').replace(/[\s_\\/-]/g, '').toLowerCase();
                                  return a.classes.some((c: string) => normalize(c) === normalize(currentUser.classLevel)) && !hwProgress[`${currentUser.id}_${a.id}`]?.completed;
                              }).length}
                            </span>
                          )}
                      </button>
                      <button onClick={() => setActiveTab('guidance')} className={`flex items-center gap-2.5 py-4 text-sm font-bold transition-all whitespace-nowrap border-b-2 ${activeTab === 'guidance' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-800 hover:border-gray-300'}`}>
                          <FileText size={18} className={activeTab === 'guidance' ? 'text-blue-600' : 'text-gray-400'}/> Rehberlik
                          {guidanceAssignments.filter((asgn: any) => 
                              (asgn.targetType === 'class' && asgn.targetClass === currentUser.classLevel) ||
                              (asgn.targetType === 'student' && (asgn.targetStudent === currentUser.username || asgn.targetStudent === currentUser.name))
                          ).filter((asgn: any) => !guidanceForms.some((f: any) => f.studentId === currentUser.id && f.formType === asgn.formId)).length > 0 && (
                            <span className="bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black">
                               {guidanceAssignments.filter((asgn: any) => 
                                  (asgn.targetType === 'class' && asgn.targetClass === currentUser.classLevel) ||
                                  (asgn.targetType === 'student' && (asgn.targetStudent === currentUser.username || asgn.targetStudent === currentUser.name))
                              ).filter((asgn: any) => !guidanceForms.some((f: any) => f.studentId === currentUser.id && f.formType === asgn.formId)).length}
                            </span>
                          )}
                      </button>
                      <button onClick={() => setActiveTab('socialclubs')} className={`flex items-center gap-2.5 py-4 text-sm font-bold transition-all whitespace-nowrap border-b-2 ${activeTab === 'socialclubs' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-800 hover:border-gray-300'}`}>
                          <Users size={18} className={activeTab === 'socialclubs' ? 'text-blue-600' : 'text-gray-400'}/> Sosyal Kulüpler
                      </button>
                      <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-2.5 py-4 text-sm font-bold transition-all whitespace-nowrap border-b-2 ${activeTab === 'profile' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-800 hover:border-gray-300'}`}>
                          <User size={18} className={activeTab === 'profile' ? 'text-blue-600' : 'text-gray-400'}/> Profil Bilgileri
                      </button>
                    </>
                  )}
              </div>
          </nav>
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto print:overflow-visible print:h-auto p-4 md:p-8 print:p-0">
              <div className="max-w-[1600px] mx-auto">
                  {renderContent()}
              </div>
          </main>

          {/* Modals */}
          {appToast.message && <Toast message={appToast.message} type={appToast.type} onClose={() => setAppToast({ message: null, type: 'info' })} />}
          <ConfirmModal isOpen={confirmModal.isOpen} message={confirmModal.message} onConfirm={() => { if(confirmModal.onConfirm) confirmModal.onConfirm(); setConfirmModal({ isOpen: false, message: '', onConfirm: null }); }} onCancel={() => setConfirmModal({ isOpen: false, message: '', onConfirm: null })} />
          <PromptModal isOpen={promptModal.isOpen} message={promptModal.message} defaultValue={promptModal.defaultValue} onConfirm={(val: string) => { if(promptModal.onConfirm) promptModal.onConfirm(val); setPromptModal({ isOpen: false, message: '', defaultValue: '', onConfirm: null }); }} onCancel={() => setPromptModal({ isOpen: false, message: '', defaultValue: '', onConfirm: null })} />
      </div>
  );
}
