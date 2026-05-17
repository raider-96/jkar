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

// تأكد أن الرابط ينتهي بـ /api ليتوافق مع مسارات Express وسيرفر Vercel Serverless Functions
// هذا السطر يضمن أن يقرأ التطبيق أونلاين أو محلياً مع الحفاظ على اللاحقة الموحدة /api
const API_URL = `${window.location.origin}/api`;
const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    step: 'login',
    teams: [
      { name: 'الفريق الأول', score: 0, categories: [] },
      { name: 'الفريق الثاني', score: 0, categories: [] },
    ],
    currentTurn: 0,
    answeredQuestionIds: [],
    selectedCategories: [],
  });

  const [activeQuestion, setActiveQuestion] = useState<{
    question: Question;
    key: string;
  } | null>(null);

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [permanentlyUsedIds, setPermanentlyUsedIds] = useState<string[]>([]);

 // 1. جلب المستخدمين والأسئلة مرة واحدة فقط عند إقلاع التطبيق لمنع التكرار والانهيار
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
          // حماية إضافية للتأكد أن كل سؤال يحتوي على تصنيف نصي سليم لمنع خطأ startsWith
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
  }, []); // 👈 قمنا بجعل المصفوفة فارغة تماماً لتعمل مرة واحدة فقط وتمنع أي Infinite Loop
  const handleLogin = (username: string, password?: string) => {
    const trimmedUsername = username.trim().toLowerCase();

    // دخول الأدمن الفوري والمحلي (تأمين كامل بدون طلب سيرفر)
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
        return; 
      }
    }

    // الفحص الآمن لبقية اللاعبين للتأكد من أن المصفوفة جاهزة
    const safeUsers = Array.isArray(users) ? users : [];
    const user = safeUsers.find((u: any) => u.username.toLowerCase() === trimmedUsername);
    
    if (user) {
      if (!user.isActive) {
        alert('هذا الحساب معطل حالياً من قِبل المشرف');
        return;
      }
      setCurrentUser(user);
      setGameState((prev: any) => ({ ...prev, step: 'setup' }));
    } else {
      alert('اسم المستخدم غير موجود، يرجى مراجعة الأدمن لتسجيلك!');
    }
  };

const handleAddUser = async (username: string, password?: string) => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: username.trim(), 
        password: password || "123", // تعيين رمز افتراضي إذا تركه فارغاً
        role: 'user',
        isActive: true // تأكد من إرسال حالة الحساب لتجنب رفض السيرفر لها
      })
    });

    if (response.ok) {
      const newUser = await response.json();
      setUsers(prev => [...prev, newUser]);
      alert('تم إضافة المستخدم بنجاح!');
    } else {
      const errData = await response.json();
      alert(errData.error || 'فشل السيرفر في إضافة المستخدم');
    }
  } catch (err) {
    console.error("خطأ أثناء إضافة المستخدم:", err);
  }
};

  // 3. تعديل حالة الحساب من السيرفر (تفعيل/تعطيل)
  const handleToggleUser = async (username: string) => {
    try {
      const response = await fetch(`${API_URL}/users/${username}/toggle`, {
        method: 'PATCH'
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(prev => (Array.isArray(prev) ? prev : []).map(u => u.username === username ? updatedUser : u));
      }
    } catch (err) {
      console.error("خطأ أثناء تعديل حالة الحساب:", err);
    }
  };

  // 4. حذف المستخدم نهائياً من السيرفر وقاعدة البيانات
  const handleDeleteUser = async (username: string) => {
    try {
      const response = await fetch(`${API_URL}/users/${username}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setUsers(prev => (Array.isArray(prev) ? prev : []).filter(u => u.username !== username));
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
        points: Number(q.points) || 10
      };

      const response = await fetch(`${API_URL}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData)
      });

      const resData = await response.json();

      if (response.ok) {
        setAllQuestions(prev => [...prev, resData]);
        // 👈 قمنا بإلغاء الـ alert من هنا لمنع التكرار المزدوج مع AdminPanel
      } else {
        alert(`❌ فشل السيرفر في التخزين: ${resData.error || resData.message}`);
      }
    } catch (err) {
      console.error("خطأ في إضافة السؤال للسيرفر:", err);
    }
  };
const handleDeleteQuestion = (id: string) => {
    const safeQuestions = Array.isArray(allQuestions) ? allQuestions : [];
    // نتحقق من الـ id العادي أو الـ _id القادم من المونجو لضمان حذف السؤال المحدد فقط
    const updated = safeQuestions.filter((q: any) => {
      const qId = q.id || q._id || q['_id'];
      return qId !== id;
    });
    setAllQuestions(updated);
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
        alert("لا توجد أسئلة متوفرة في هذا القسم حالياً!");
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
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setGameState(prev => ({ ...prev, step: 'login' }));
  };

  return (
    <div className="min-h-screen bg-[#F7C705] text-black font-sans selection:bg-black/10">
      <div className="h-6 w-full bg-repeat-x flex overflow-hidden border-b-4 border-black">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className={`w-8 h-full transform -skew-x-[45deg] ${i % 2 === 0 ? 'bg-black' : 'bg-transparent'}`} />
        ))}
      </div>

      <nav className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto mb-8 border-b-2 border-black/10">
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
        
        {currentUser && (
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-black/60 text-[10px] font-black uppercase tracking-widest">المستخدم الحالي</span>
              <span className="text-black font-black text-lg">{currentUser.username}</span>
            </div>
            <button onClick={handleLogout} className="bg-black text-[#F7C705] p-2.5 rounded-xl hover:scale-110 transition-transform shadow-lg">
              <LogOut size={22} />
            </button>
          </div>
        )}
      </nav>

      <main className="relative z-10 pb-20">
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
            <h2 className="text-4xl font-black mb-2">انتهت اللعبة!</h2>
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
              <p className="text-indigo-300">أداء رائع ومنافسة قوية!</p>
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

      <footer className="relative z-10 mt-auto py-8 text-center text-slate-600 text-sm">
        <p>© {new Date().getFullYear()} چگار - منصة الألعاب الجماعية</p>
      </footer>
    </div>
  );
};

export default App;