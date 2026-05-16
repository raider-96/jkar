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


// رابط السيرفر المشترك
const API_URL = '/api';
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

  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [permanentlyUsedIds, setPermanentlyUsedIds] = useState<string[]>([]);

  // 1. جلب المستخدمين والأسئلة من السيرفر فور تشغيل اللعبة
  useEffect(() => {
    // جلب المستخدمين
    fetch(`${API_URL}/users`)
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error("خطأ في جلب المستخدمين:", err));

    // جلب كافة الأسئلة (الأساسية والمضافة)
    fetch(`${API_URL}/questions`)
      .then(res => res.json())
      .then(data => setAllQuestions(data))
      .catch(err => console.error("خطأ في جلب الأسئلة:", err));
  }, []);

 const handleLogin = (username: string, password?: string) => {
  // 1. تحويل النص لحروف صغيرة لضمان مطابقة الكلمة بدقة
  const trimmedUsername = username.trim().toLowerCase();

  // 2. قاطع فوري للأدمن: يدخل مباشرة دون النظر لقائمة اليوزرز من السيرفر
  if (trimmedUsername === 'admin') {
    if (password === '123' || !password || password === '...') {
      const adminUser: any = {
        _id: 'admin-local-id',
        username: 'admin',
        role: 'admin',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      setCurrentUser(adminUser);
      setGameState((prev: any) => ({ ...prev, step: 'setup' }));
      return; // إنهاء الدالة فوراً هنا ومنع الوصول لرسالة اليوزر غير موجود
    } else {
      alert('الرمز السري غير صحيح لحساب الأدمن');
      return;
    }
  }

  // 3. الفحص الطبيعي لبقية مستخدمي اللعبة العاديين من السيرفر السحابي
  const user = users && users.find((u: any) => u.username.toLowerCase() === trimmedUsername);

  if (user) {
    if (!user.isActive) {
      alert('هذا اليوزر معطل حالياً');
      return;
    }
    if (user.password && user.password !== password) {
      alert('الرمز السري غير صحيح');
      return;
    }
    setCurrentUser(user);
    setGameState((prev: any) => ({ ...prev, step: 'setup' }));
  } else {
    alert('اليوزر غير موجود');
  }
};

  // 2. إرسال المستخدم الجديد إلى قاعدة البيانات عبر السيرفر
  const handleAddUser = async (username: string, password?: string) => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role: 'user' })
      });

      if (response.ok) {
        const newUser = await response.json();
        setUsers(prev => [...prev, newUser]);
      } else {
        const errData = await response.json();
        alert(errData.error);
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
        setUsers(prev => prev.map(u => u.username === username ? updatedUser : u));
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
        setUsers(prev => prev.filter(u => u.username !== username));
      }
    } catch (err) {
      console.error("خطأ أثناء حذف المستخدم:", err);
    }
  };

  // 5. إضافة الأسئلة الإضافية إلى قاعدة البيانات السحابية
  const handleAddQuestion = async (q: Question) => {
    try {
      const response = await fetch(`${API_URL}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(q)
      });

      if (response.ok) {
        const newQuestion = await response.json();
        setAllQuestions(prev => [...prev, newQuestion]);
      }
    } catch (err) {
      console.error("خطأ في إضافة السؤال للسيرفر:", err);
    }
  };

  const handleDeleteQuestion = (id: string) => {
    // يمكنك تطبيق مسار DELETE في السيرفر بنفس النمط إذا كنت تحذف أسئلة من قاعدة البيانات
    const updated = allQuestions.filter(q => q.id !== id);
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
    const available = allQuestions.filter(q => 
      q.category === category && 
      q.difficulty === difficulty && 
      !permanentlyUsedIds.includes(q.id)
    );

    let chosenQuestion: Question;
    if (available.length === 0) {
      const resetAvailable = allQuestions.filter(q => q.category === category && q.difficulty === difficulty);
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
    const newPermanentUsed = [...permanentlyUsedIds, activeQuestion.question.id];
    
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
            users={users} 
            onAddUser={handleAddUser} 
            onDeleteUser={handleDeleteUser}
            onToggleUser={handleToggleUser} 
            questions={allQuestions}
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
              questions={allQuestions}
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