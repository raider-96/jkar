import React, { useState, useEffect } from 'react';
import { GameState, Team, Question, Difficulty, UserAccount } from './types';
import Login from './components/Login';
import Setup from './components/Setup';
import GameBoard from './components/GameBoard';
import ScoreBoard from './components/ScoreBoard';
import QuestionView from './components/QuestionView';
import AdminPanel from './components/AdminPanel';
import confetti from 'canvas-confetti';
import { RotateCcw, LogOut, Award } from 'lucide-react';

// رابط الـ API الموحد متوافق مع البيئة المحلية والسحابية (Vercel)
const API_URL = `${window.location.origin}/api`;

const App: React.FC = () => {
  // 1. قراءة وتثبيت حالة المستخدم والخطوة من الـ localStorage لمنع الخروج عند التحديث
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const savedUser = localStorage.getItem('chgar_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [gameState, setGameState] = useState<GameState>(() => {
    const savedStep = localStorage.getItem('chgar_step') as any;
    return {
      step: savedStep || 'login', // يفتح على آخر صفحة كان عليها اللاعب قبل الـ Refresh
      teams: [
        { name: 'الفريق الأول', score: 0, categories: [] },
        { name: 'الفريق الثاني', score: 0, categories: [] },
      ],
      currentTurn: 0,
      answeredQuestionIds: [],
      selectedCategories: [],
    };
  });

  const [activeQuestion, setActiveQuestion] = useState<{
    question: Question;
    key: string;
  } | null>(null);

  const [users, setUsers] = useState<any[]>([]);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [permanentlyUsedIds, setPermanentlyUsedIds] = useState<string[]>([]);

  // State خاص بإدارة نظام الإشعارات الحديث (Toast Container)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // دالة ذكية لإطلاق الإشعار وإخفائه بسلاسة تلقائياً بعد 3 ثوانٍ
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 2. مراقبة وحفظ الجلسة في ذاكرة المتصفح فور حدوث أي تغيير
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('chgar_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('chgar_user');
    }
    localStorage.setItem('chgar_step', gameState.step);
  }, [currentUser, gameState.step]);

  // 3. جلب المستخدمين والأسئلة مرة واحدة فقط عند إقلاع التطبيق لمنع التكرار والانهيار
  useEffect(() => {
    // جلب المستخدمين
    fetch(`${API_URL}/users`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          setUsers([]); 
        }
      })
      .catch(err => {
        console.error("خطأ في جلب المستخدمين:", err);
        setUsers([]);
      });

    // جلب كافة الأسئلة مع التطهير الفوري للحقول
    fetch(`${API_URL}/questions`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const safeQuestions = data.filter(q => q && q.category && typeof q.category === 'string');
          setAllQuestions(safeQuestions);
        } else {
          setAllQuestions([]);
        }
      })
      .catch(err => {
        console.error("خطأ في جلب الأسئلة:", err);
        setAllQuestions([]);
      });
  }, []);

  const handleLogin = (username: string, password?: string) => {
    const trimmedUsername = username.trim().toLowerCase();

    // دخول الأدمن الفوري والمحلي الآمن////////////////////////////////////////////////////////////////////////////////////////////////////////
    if (trimmedUsername === 'admin') {
      if (password === '123' || !password || password === '...') {
        const adminUser: any = {
          _id: 'admin-local-id',
          username: 'admin',
          role: 'admin',
          isActive: true
        };
        setCurrentUser(adminUser);
        setGameState((prev: any) => ({ ...prev, step: 'setup' }));
        showToast('🔓 مرحباً بك يا مشرف! تم تسجيل الدخول بنجاح.', 'success');
        return; 
      }
    }

    const safeUsers = Array.isArray(users) ? users : [];
    const user = safeUsers.find((u: any) => u.username.toLowerCase() === trimmedUsername);
    
    if (user) {
      if (!user.isActive) {
        showToast('🔒 هذا الحساب معطل حالياً من قِبل المشرف', 'error');
        return;
      }
      setCurrentUser(user);
      setGameState((prev: any) => ({ ...prev, step: 'setup' }));
      showToast(`👋 أهلاً بك مجدداً ${user.username}!`, 'success');
    } else {
      showToast('❌ اسم المستخدم غير موجود، يرجى مراجعة الأدمن لتسجيلك', 'error');
    }
  };

  const handleAddUser = async (username: string, password?: string) => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username.trim(), 
          password: password || "123", 
          role: 'user',
          isActive: true 
        })
      });

      if (response.ok) {
        const newUser = await response.json();
        setUsers(prev => [...prev, newUser]);
        showToast('👤 تم إضافة المستخدم بنجاح وتخزينه سحابياً', 'success');
      } else {
        const errData = await response.json();
        showToast(errData.error || 'فشل السيرفر في إضافة المستخدم', 'error');
      }
    } catch (err) {
      console.error("خطأ أثناء إضافة المستخدم:", err);
      showToast('❌ حدث خطأ غير متوقع أثناء الاتصال بالسيرفر', 'error');
    }
  };

  const handleToggleUser = async (username: string) => {
    try {
      const response = await fetch(`${API_URL}/users/${username}/toggle`, {
        method: 'PATCH'
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(prev => (Array.isArray(prev) ? prev : []).map(u => u.username === username ? updatedUser : u));
        showToast(`⚙️ تم تحديث حالة حساب (${username}) بنجاح!`, 'info');
      }
    } catch (err) {
      console.error("خطأ أثناء تعديل حالة الحساب:", err);
    }
  };

  const handleDeleteUser = async (username: string) => {
    try {
      const response = await fetch(`${API_URL}/users/${username}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setUsers(prev => (Array.isArray(prev) ? prev : []).filter(u => u.username !== username));
        showToast(`🗑️ تم حذف حساب المستخدم (${username}) نهائياً.`, 'info');
      }
    } catch (err) {
      console.error("خطأ أثناء حذف المستخدم:", err);
    }
  };

 const handleAddQuestion = async (q: Question) => {
    try {
      const generatedId = `custom-${Date.now()}`;

      const questionData = {
        id: generatedId, 
        question: q.question || '',
        options: Array.isArray(q.options) ? q.options : ['', '', '', ''],
        answer: q.answer || '',
        category: q.category || 'عام', 
        difficulty: q.difficulty || 'easy',
        points: Number(q.points) || 10,
        
        // 🚀 إضافة حقول الصور هنا لضمان إرسالها وحفظها في السيرفر
        image: q.image || (q as any).questionImage || '',
        questionImage: (q as any).questionImage || q.image || '',
        answerImage: (q as any).answerImage || ''
      };

      const response = await fetch(`${API_URL}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData)
      });

      const resData = await response.json();

      if (response.ok) {
        setAllQuestions(prev => [...prev, resData]);
        showToast('🧠 تم إضافة السؤال الجديد وحفظه في السيرفر بنجاح', 'success');
      } else {
        showToast(`❌ فشل السيرفر في التخزين: ${resData.error || resData.message}`, 'error');
      }
    } catch (err) {
      console.error("خطأ في إضافة السؤال للسيرفر:", err);
      showToast('❌ حدث خطأ اتصال، لم يتم حفظ السؤال.', 'error');
    }
  };
const handleDeleteQuestion = async (id: string) => {
    try {
      // 1️⃣ إرسال طلب الحذف الفعلي إلى الباك إند
      const response = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const fallbackResponse = await fetch(`https://jkar.vercel.app/api/questions/${id}`, {
          method: 'DELETE',
        });
        
        if (!fallbackResponse.ok) {
          throw new Error('فشل الحذف من السيرفر');
        }
      }
// 1️⃣ تحديث الـ State ديناميكياً بدون الاعتماد على الاسم الثابت لـ setQuestions
      // تفريغ الأزمة وإعادة تحميل الصفحة تلقائياً لتعكس البيانات المحذوفة فوراً 🚀
      window.location.reload();
      console.log("Deleted successfully");

    } catch (err) {
      console.error("خطأ أثناء حذف السؤال:", err);
      alert('❌ حدث خطأ في الاتصال بالسيرفر أثناء محاولة الحذف');
    }
  };

  const handleStartGame = (t1: string, t2: string, cats: string[]) => {
    setGameState({
      ...gameState,
      step: 'game',
      teams: [
        { name: t1, score: 0, categories: cats.slice(0, 3) },
        { name: t2, score: 0, categories: cats.slice(3, 6) },
      ],
      selectedCategories: cats,
      answeredQuestionIds: [],
    });
    showToast('🚀 انطلق التحدي بالتوفيق للفريقين.', 'info');
  };

  const handleSelectQuestion = (category: string, difficulty: Difficulty) => {
    const safeQuestions = Array.isArray(allQuestions) ? allQuestions : [];
    
    const available = safeQuestions.filter(q => 
      q.category === category && 
      q.difficulty === difficulty && 
      !permanentlyUsedIds.includes(q.id)
    );

    let chosenQuestion: Question;
    if (available.length === 0) {
      const resetAvailable = safeQuestions.filter(q => q.category === category && q.difficulty === difficulty);
      if (resetAvailable.length === 0) {
        showToast('⚠️ لا توجد أسئلة متوفرة في هذا القسم حالياً', 'error');
        return;
      }
      chosenQuestion = resetAvailable[Math.floor(Math.random() * resetAvailable.length)];
    } else {
      chosenQuestion = available[Math.floor(Math.random() * available.length)];
    }

    const prefix = `${category}-${difficulty}`;
    const instance1 = `${prefix}-1`;
    const instance2 = `${prefix}-2`;
    const slotKey = gameState.answeredQuestionIds.includes(instance1) ? instance2 : instance1;

    setActiveQuestion({
      question: chosenQuestion,
      key: slotKey
    });
  };

  const handleAdjustScore = (teamIdx: number, amount: number) => {
    const newTeams = [...gameState.teams] as [Team, Team];
    newTeams[teamIdx].score += amount;
    setGameState(prev => ({ ...prev, teams: newTeams }));
    showToast(`🎯 تم تعديل نقاط ${newTeams[teamIdx].name} بمقدار ${amount}`, 'info');
  };

  const handleAnswer = (winnerIndex: number | null) => {
    if (!activeQuestion) return;

    const newTeams = [...gameState.teams] as [Team, Team];
    if (winnerIndex !== null) {
      newTeams[winnerIndex].score += activeQuestion.question.points;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#ec4899']
      });
      showToast(`🏆 إجابة صحيحة +${activeQuestion.question.points} نقطة لـ ${newTeams[winnerIndex].name}`, 'success');
    } else {
      showToast('💥 تم تجاوز السؤال بدون رابح نقاط.', 'info');
    }

    const newAnswered = [...gameState.answeredQuestionIds, activeQuestion.key];
    const questionId = activeQuestion.question.id || (activeQuestion.question as any)._id || (activeQuestion.question as any)["_id"];
    const newPermanentUsed = [...permanentlyUsedIds, questionId];    
    setPermanentlyUsedIds(newPermanentUsed);

    const nextTurn = gameState.currentTurn === 0 ? 1 : 0;
    const totalSlots = gameState.selectedCategories.length * 3 * 2;
    const isGameOver = newAnswered.length === totalSlots;

    setGameState({
      ...gameState,
      teams: newTeams,
      currentTurn: nextTurn as 0 | 1,
      answeredQuestionIds: newAnswered,
      step: isGameOver ? 'result' : 'game'
    });

    setActiveQuestion(null);
  };

  const handleReset = () => {
    setGameState(prev => ({
      ...prev,
      step: 'setup',
      answeredQuestionIds: [],
    }));
    showToast('🔄 تم إعداد طاولة التحدي لبدء المباراة ', 'info');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setGameState(prev => ({ ...prev, step: 'login' }));
    localStorage.removeItem('chgar_user');
    localStorage.removeItem('chgar_step');
    showToast('🔒 تم تسجيل الخروج بنجاح وبأمان.', 'info');
  };
return (
    <div className="min-h-screen bg-[#F7C705] text-black font-sans selection:bg-black/10 flex flex-col">
      {/* شريط الخطوط المائلة الأسود والأصفر */}
      <div className="h-6 w-full bg-repeat-x flex overflow-hidden border-b-4 border-black">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className={`w-8 h-full transform -skew-x-[45deg] ${i % 2 === 0 ? 'bg-black' : 'bg-transparent'}`} />
        ))}
      </div>

      <nav className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto w-full mb-8 border-b-2 border-black/10">
        <div className="flex items-center gap-4">
          <img 
            src="/img/lo.jpg"
            alt="Chgar" 
            className="w-16 h-16 rounded-[20px] shadow-2xl border-4 border-black"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="flex flex-col">
            <span className="text-4xl font-black tracking-tighter uppercase leading-none">چگار</span>
            <span className="text-[10px] font-black tracking-[0.2em] opacity-40">CHGAR GAME</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6">
          {/* 🚀 زر العودة الذكي للمستخدم: يظهر في كل الأقسام واللعب (باستثناء تسجيل الدخول والصفحة الرئيسية) */}
          {gameState.step !== 'login' && gameState.step !== 'setup' && (
            <button
              onClick={() => setGameState(prev => ({ ...prev, step: 'setup' }))}
              className="flex items-center gap-2 bg-black text-[#F7C705] font-black px-4 py-2.5 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all text-sm border-2 border-black"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 19 12 12 5"></polyline>
              </svg>
              <span>العودة للقائمة</span>
            </button>
          )}

          {currentUser && (
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-black/60 text-[10px] font-black uppercase tracking-widest">المستخدم الحالي</span>
                <span className="text-black font-black text-lg">{currentUser.username}</span>
              </div>
              <button onClick={handleLogout} className="bg-black text-[#F7C705] p-2.5 rounded-xl hover:scale-110 transition-transform shadow-lg border-2 border-black">
                <LogOut size={22} />
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="relative z-10 pb-20 flex-grow">
        {gameState.step === 'login' && <Login onLogin={handleLogin} />}
        
        {gameState.step === 'admin' && (
          <AdminPanel 
            users={Array.isArray(users) ? users : []} 
            onAddUser={handleAddUser} 
            onDeleteUser={handleDeleteUser}
            onToggleUser={handleToggleUser} 
            questions={Array.isArray(allQuestions) ? allQuestions : []}
            onAddQuestion={handleAddQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onBack={() => setGameState(prev => ({ ...prev, step: 'setup' }))} 
          />
        )}
        
        {gameState.step === 'setup' && (
          <Setup 
            onStart={handleStartGame} 
            isAdmin={currentUser?.role === 'admin'} 
            onOpenAdmin={() => setGameState(prev => ({ ...prev, step: 'admin' }))}
          />
        )}
        
        {gameState.step === 'game' && (
          <div className="space-y-8 animate-in fade-in duration-700">
            <ScoreBoard 
              teams={gameState.teams} 
              currentTurn={gameState.currentTurn} 
              onAdjustScore={handleAdjustScore}
            />
            <GameBoard 
              gameState={gameState} 
              onSelectQuestion={handleSelectQuestion}
              permanentlyUsedIds={permanentlyUsedIds}
              questions={Array.isArray(allQuestions) ? allQuestions : []}
            />
          </div>
        )}

        {gameState.step === 'result' && (
          <div className="max-w-2xl mx-auto mt-20 p-10 bg-slate-900 rounded-3xl border-2 border-indigo-500/50 shadow-2xl text-center rtl text-white">
            <Award size={80} className="mx-auto text-yellow-400 mb-6" />
            <h2 className="text-4xl font-black mb-2">انتهت اللعبة</h2>
            <p className="text-slate-400 mb-8">النتائج النهائية للتحدي</p>
            
            <div className="flex justify-between items-center mb-12">
              <div className={`p-6 rounded-2xl flex-1 ${gameState.teams[0].score > gameState.teams[1].score ? 'bg-indigo-600 ring-4 ring-indigo-400/30' : 'bg-slate-800'}`}>
                <h3 className="font-bold mb-2">{gameState.teams[0].name}</h3>
                <p className="text-4xl font-black">{gameState.teams[0].score}</p>
              </div>
              <div className="px-6 font-black text-2xl text-slate-500">VS</div>
              <div className={`p-6 rounded-2xl flex-1 ${gameState.teams[1].score > gameState.teams[0].score ? 'bg-indigo-600 ring-4 ring-indigo-400/30' : 'bg-slate-800'}`}>
                <h3 className="font-bold mb-2">{gameState.teams[1].name}</h3>
                <p className="text-4xl font-black">{gameState.teams[1].score}</p>
              </div>
            </div>

            <div className="bg-indigo-900/40 p-6 rounded-2xl mb-10">
              <h4 className="text-xl font-bold mb-2">
                الفائز: {gameState.teams[0].score > gameState.teams[1].score ? gameState.teams[0].name : gameState.teams[1].name}
              </h4>
              <p className="text-indigo-300">أداء رائع ومنافسة قوية</p>
            </div>

            <button
              onClick={handleReset}
              className="flex items-center gap-2 mx-auto bg-white text-indigo-950 px-10 py-4 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-xl"
            >
              <RotateCcw />
              لعبة جديدة
            </button>
          </div>
        )}
      </main>

      {activeQuestion && (
        <QuestionView 
          question={activeQuestion.question}
          teams={[gameState.teams[0].name, gameState.teams[1].name]}
          currentTurn={gameState.currentTurn}
          onAnswer={handleAnswer}
        />
      )}

      {/* حاوية نظام الإشعارات */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-black font-black text-lg transform animate-in slide-in-from-bottom duration-300 rtl
          ${toast.type === 'success' ? 'bg-[#F7C705] text-black' : ''}
          ${toast.type === 'error' ? 'bg-red-500 text-white' : ''}
          ${toast.type === 'info' ? 'bg-black text-[#F7C705]' : ''}
        `}>
          <span>{toast.message}</span>
          <div className={`w-2.5 h-2.5 rounded-full bg-current ${toast.type === 'success' ? 'bg-black animate-ping' : 'animate-ping'}`} />
        </div>
      )}

      <footer className="relative z-10 mt-auto py-8 text-center text-slate-600 text-sm">
        <p>© {new Date().getFullYear()} چگار - منصة الألعاب الجماعية</p>
      </footer>
    </div>
  );
};

export default App;