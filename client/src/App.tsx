import React, { useState, useEffect } from 'react';
import { GameState, Team, Question, Difficulty, UserAccount } from './types';
import Login from './components/Login';
import Setup from './components/Setup';
import GameBoard from './components/GameBoard';
import ScoreBoard from './components/ScoreBoard';
import QuestionView from './components/QuestionView';
import AdminPanel from './components/AdminPanel';
import confetti from 'canvas-confetti';
import { RotateCcw, LogOut, Award,  } from 'lucide-react';

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

  // 🚀 تتبع وسائل المساعدة المستخدمة لكل فريق (اسم الوسيلة)
  const [usedHelplines, setUsedHelplines] = useState<{ [key: number]: string[] }>({
    0: [], // وسائل الفريق الأول
    1: [], // وسائل الفريق الثاني
  });

  // 🚀 تتبع المساعدات النشطة التي تؤثر على التحدي الحالي
  const [activeEffects, setActiveEffects] = useState<{
    isStolen: boolean;
    isDestroyed: boolean;
    destroyingTeamIdx: number | null;
    initialBonusTime: number; 
  }>({
    isStolen: false,
    isDestroyed: false,
    destroyingTeamIdx: null,
    initialBonusTime: 0
  });

  useEffect(() => {
    fetch(`${API_URL}/users`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUsers(data);
        else setUsers([]);
      })
      .catch(err => {
        console.error("خطأ في جلب المستخدمين:", err);
        setUsers([]);
      });

    fetch(`${API_URL}/questions`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAllQuestions(data);
        else setAllQuestions([]);
      })
      .catch(err => {
        console.error("خطأ في جلب الأسئلة:", err);
        setAllQuestions([]);
      });
  }, [gameState.step]);

  const handleLogin = (username: string, password?: string) => {
    const trimmedUsername = username.trim().toLowerCase();
    if (trimmedUsername === 'admin') {
      if (password === '123' || !password || password === '...') {
        const adminUser: any = { _id: 'admin-local-id', username: 'admin', role: 'admin', isActive: true };
        setCurrentUser(adminUser);
        setGameState((prev: any) => ({ ...prev, step: 'setup' }));
        return; 
      }
    }
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
        body: JSON.stringify({ username: username.trim(), password: password || "123", role: 'user', isActive: true })
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

  const handleToggleUser = async (username: string) => {
    try {
      const response = await fetch(`${API_URL}/users/${username}/toggle`, { method: 'PATCH' });
      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(prev => (Array.isArray(prev) ? prev : []).map(u => u.username === username ? updatedUser : u));
      }
    } catch (err) {
      console.error("خطأ أثناء تعديل حالة الحساب:", err);
    }
  };

  const handleDeleteUser = async (username: string) => {
    try {
      const response = await fetch(`${API_URL}/users/${username}`, { method: 'DELETE' });
      if (response.ok) {
        setUsers(prev => (Array.isArray(prev) ? prev : []).filter(u => u.username !== username));
      }
    } catch (err) {
      console.error("خطأ أثناء حذف المستخدم:", err);
    }
  };

  const handleAddQuestion = async (q: Question) => {
    try {
      const questionData = {
        id: q.id || Date.now().toString(),
        question: q.question,
        options: q.options || [],
        answer: q.answer,
        category: q.category,
        difficulty: q.difficulty,
        points: Number(q.points) || 10
      };
      const response = await fetch(`${API_URL}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData)
      });
      if (response.ok) {
        const newQuestion = await response.json();
        setAllQuestions(prev => [...prev, newQuestion]);
        alert('تم إضافة السؤال بنجاح إلى قاعدة البيانات!');
      } else {
        const errData = await response.json();
        alert(errData.error || 'فشلت إضافة السؤال، راجع الحقول المطلوبة');
      }
    } catch (err) {
      console.error("خطأ في إضافة السؤال للسيرفر:", err);
    }
  };

  const handleDeleteQuestion = (id: string) => {
    const safeQuestions = Array.isArray(allQuestions) ? allQuestions : [];
    const updated = safeQuestions.filter(q => q.id !== id);
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
    // تصفير المساعدات للعبة الجديدة
    setUsedHelplines({ 0: [], 1: [] });
    setActiveEffects({ isStolen: false, isDestroyed: false, destroyingTeamIdx: null, initialBonusTime: 0 });
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

  // 🚀 دالة تفعيل وسائل المساعدة من الشاشة الرئيسية
  const handleUseHelpline = (teamIdx: number, key: string) => {
    if (usedHelplines[teamIdx].length >= 3) {
      alert("❌ لقد استهلك هذا الفريق الحد الأقصى من وسائل المساعدة (3 وسائل فقط)!");
      return;
    }
    if (usedHelplines[teamIdx].includes(key)) {
      alert("❌ تم استخدام هذه الوسيلة مسبقاً!");
      return;
    }

    setUsedHelplines(prev => ({
      ...prev,
      [teamIdx]: [...prev[teamIdx], key]
    }));

    if (key === 'add_minute') {
      setActiveEffects(prev => ({ ...prev, initialBonusTime: 60 }));
      alert("⏱️ تم تفعيل (خل افكر): سيتم إضافة دقيقة كاملة للوقت عند فتح السؤال التالي!");
    } else if (key === 'call_friend') {
      setActiveEffects(prev => ({ ...prev, initialBonusTime: 999 }));
      alert("📞 تم تفعيل (اريد اخابر): سيتم تجميد الوقت تماماً في السؤال التالي للنقاش!");
    } else if (key === 'steal_question') {
      setActiveEffects(prev => ({ ...prev, isStolen: true }));
      setGameState(prev => ({ ...prev, currentTurn: teamIdx as 0 | 1 }));
      alert(`🥷 تم تفعيل (جرامي): الدور تحول الآن لفريق [${gameState.teams[teamIdx].name}] لسرقة السؤال القادم!`);
    } else if (key === 'destroy') {
      setActiveEffects(prev => ({ ...prev, isDestroyed: true, destroyingTeamIdx: teamIdx }));
      alert(`💥 تم تفعيل (تفليش): إذا أجاب فريق [${gameState.teams[teamIdx].name}] صحيحاً، سيكسب النقاط وتُخصم من الخصم!`);
    }
  };

  // 🚀 دالة تبديل السؤال (شوفلي غيرة) المخصصة لـ QuestionView
  const handleSkipQuestion = () => {
    if (!activeQuestion) return;

    const safeQuestions = Array.isArray(allQuestions) ? allQuestions : [];
    const sameCategory = safeQuestions.filter(q => 
      q.category === activeQuestion.question.category &&
      q.difficulty === activeQuestion.question.difficulty &&
      q.id !== activeQuestion.question.id
    );

    if (sameCategory.length === 0) {
      alert("⚠️ لا يوجد سؤال بديل من نفس الصنف والصعوبة بداخل قاعدة البيانات!");
      return;
    }

    const nextQ = sameCategory[Math.floor(Math.random() * sameCategory.length)];
    setActiveQuestion(prev => prev ? { ...prev, question: nextQ } : null);
    
    // تسجيل استخدام الوسيلة للفريق الحالي
    setUsedHelplines(prev => ({
      ...prev,
      [gameState.currentTurn]: [...prev[gameState.currentTurn], 'change_question']
    }));
  };

  const handleAnswer = (winnerIndex: number | null) => {
    if (!activeQuestion) return;

    const newTeams = [...gameState.teams] as [Team, Team];
    const points = activeQuestion.question.points;

    if (winnerIndex !== null) {
      // 🚀 [حساب مفعول تفليش النشط]
      if (activeEffects.isDestroyed && activeEffects.destroyingTeamIdx === winnerIndex) {
        const opponentIndex = winnerIndex === 0 ? 1 : 0;
        newTeams[winnerIndex].score += points;
        newTeams[opponentIndex].score = Math.max(0, newTeams[opponentIndex].score - points);
      } else {
        newTeams[winnerIndex].score += points;
      }

      const colors = ['#F7C705', '#000000', '#ffffff'];
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: colors
      });
    }

    const newAnswered = [...gameState.answeredQuestionIds, activeQuestion.key];
    const questionId = activeQuestion.question.id || (activeQuestion.question as any)._id;
    const newPermanentUsed = [...permanentlyUsedIds, questionId];    
    setPermanentlyUsedIds(newPermanentUsed);

    const nextTurn = gameState.currentTurn === 0 ? 1 : 0;
    const totalSlots = gameState.selectedCategories.length * 3 * 2;
    const isGameOver = newAnswered.length === totalSlots;

    // إعادة تصفير تأثيرات المساعدات المؤقتة للجولة القادمة
    setActiveEffects({ isStolen: false, isDestroyed: false, destroyingTeamIdx: null, initialBonusTime: 0 });

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
    setGameState(prev => ({ ...prev, step: 'setup', answeredQuestionIds: [] }));
    setUsedHelplines({ 0: [], 1: [] });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setGameState(prev => ({ ...prev, step: 'login' }));
  };

  // قائمة الوسائل المساعدة للعرض
  const helplineList = [
    { key: 'add_minute', label: '⏱️ خل افكر' },
    { key: 'call_friend', label: '📞 اريد اخابر' },
    { key: 'steal_question', label: '🥷 جرامي' },
    { key: 'destroy', label: '💥 تفليش' },
  ];

  return (
    <div className="min-h-screen bg-[#F7C705] text-black font-sans selection:bg-black/10">
      <div className="h-6 w-full bg-repeat-x flex overflow-hidden border-b-4 border-black">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className={`w-8 h-full transform -skew-x-[45deg] ${i % 2 === 0 ? 'bg-black' : 'bg-transparent'}`} />
        ))}
      </div>

      <nav className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto mb-4 border-b-2 border-black/10">
        <div className="flex items-center gap-4">
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

   <main className="container mx-auto p-4 md:p-6 max-w-7xl">
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
          <div className="space-y-6 animate-in fade-in duration-700 max-w-7xl mx-auto px-4">
            
            {/* 🚀 قسم لوحة وسائل المساعدة للفرق بداخل شاشة اللعبة */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rtl text-right bg-black/5 p-4 rounded-[32px] border-4 border-black/10">
              {[0, 1].map((teamIdx) => (
                <div key={teamIdx} className={`p-4 rounded-[24px] bg-white border-4 border-black ${gameState.currentTurn === teamIdx ? 'ring-4 ring-black ring-offset-2' : 'opacity-80'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-black text-lg text-black">وسائل مساعدة {gameState.teams[teamIdx].name}</h4>
                    <span className="text-xs bg-black text-[#F7C705] px-3 py-1 rounded-full font-bold">
                      المستخدم: {usedHelplines[teamIdx].length} / 3
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {helplineList.map((help) => {
                      const isUsed = usedHelplines[teamIdx].includes(help.key);
                      const isMaxed = usedHelplines[teamIdx].length >= 3 && !isUsed;
                      return (
                        <button
                          key={help.key}
                          disabled={isUsed || isMaxed}
                          onClick={() => handleUseHelpline(teamIdx, help.key)}
                          className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 ${
                            isUsed 
                              ? 'bg-red-200 text-red-700 line-through border-red-300 shadow-none' 
                              : isMaxed 
                                ? 'bg-gray-200 text-gray-400 border-gray-300 shadow-none cursor-not-allowed'
                                : 'bg-[#F7C705] hover:bg-black hover:text-[#F7C705]'
                          }`}
                        >
                          {help.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

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

      {/* 🚀 الربط الحقيقي الصافي للمكون بداخل كودك وبدون أي خطأ في الـ TypeScript */}
      {activeQuestion && (
        <QuestionView
          question={activeQuestion.question}
          teams={[gameState.teams[0].name, gameState.teams[1].name]}
          currentTurn={gameState.currentTurn}
          onAnswer={(winnerIndex) => handleAnswer(winnerIndex)}
          
          // تمرير قيم الـ States النشطة الحالية التي قمت بحسابها بالبورد تلقائياً
          initialBonusTime={activeEffects.initialBonusTime} 
          hasChangeHelpline={!usedHelplines[gameState.currentTurn].includes('change_question')}
          onSkipQuestion={() => {
            handleSkipQuestion();
          }}
        />
      )}

      <footer className="relative z-10 mt-auto py-8 text-center text-slate-600 text-sm">
        <p>© {new Date().getFullYear()} چگار - منصة الألعاب الجماعية</p>
      </footer>
    </div>
  );
};

export default App;