import React, { useState, useEffect } from 'react';
import { GameState, Team, Question, Difficulty, UserAccount } from './types';
import { QUESTIONS } from './data/questions';
import Login from './components/Login';
import Setup from './components/Setup';
import GameBoard from './components/GameBoard';
import ScoreBoard from './components/ScoreBoard';
import QuestionView from './components/QuestionView';
import AdminPanel from './components/AdminPanel';
import confetti from 'canvas-confetti';
import { RotateCcw, LogOut, Award } from 'lucide-react';

const DEFAULT_USERS: UserAccount[] = [
  { username: 'admin', role: 'admin', isActive: true, createdAt: new Date().toISOString() },
  { username: 'player1', role: 'user', isActive: true, createdAt: new Date().toISOString() },
  { username: 'user', role: 'user', isActive: true, createdAt: new Date().toISOString() },
];

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
  
  // لضمان استقرار البيانات، نقرأ من localStorage أو نستخدم الافتراضي
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('chagar_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [permanentlyUsedIds, setPermanentlyUsedIds] = useState<string[]>([]);

  // مزامنة أي تغيير في اليوزرات مع التخزين المحلي فوراً
  useEffect(() => {
    localStorage.setItem('chagar_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    const saved = localStorage.getItem('chagar_used_questions');
    if (saved) {
      setPermanentlyUsedIds(JSON.parse(saved));
    }
  }, []);

  // دالة تسجيل الدخول المحدثة
  const handleLogin = (username: string) => {
    const cleanUsername = username.trim().toLowerCase();
    // البحث في قائمة users المحدثة دائماً
    const user = users.find(u => u.username.toLowerCase() === cleanUsername);
    
    if (user) {
      if (!user.isActive) {
        alert('هذا اليوزر معطل حالياً من قبل الإدارة');
        return;
      }
      setCurrentUser(user);
      setGameState(prev => ({ ...prev, step: 'setup' }));
    } else {
      alert('اسم المستخدم غير موجود، يرجى التأكد من الإدارة');
    }
  };

  // إضافة يوزر جديد مع منع التكرار
  const handleAddUser = (username: string) => {
    const cleanName = username.trim();
    if (!cleanName) return;

    if (users.find(u => u.username.toLowerCase() === cleanName.toLowerCase())) {
      alert('هذا المستخدم موجود بالفعل');
      return;
    }

    const newUser: UserAccount = {
      username: cleanName,
      role: 'user',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    setUsers(prev => [...prev, newUser]);
  };

  // تعطيل/تفعيل يوزر
  const handleToggleUser = (username: string) => {
    setUsers(prev => prev.map(u => 
      u.username === username ? { ...u, isActive: !u.isActive } : u
    ));
  };

  // دالة حذف يوزر (الخيار الجديد للادمن)
  const handleDeleteUser = (username: string) => {
    if (username.toLowerCase() === 'admin') {
      alert('لا يمكن حذف حساب المسؤول الرئيسي');
      return;
    }
    if (window.confirm(`هل أنت متأكد من حذف المستخدم ${username} نهائياً؟`)) {
      setUsers(prev => prev.filter(u => u.username !== username));
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
  };

  const handleSelectQuestion = (category: string, difficulty: Difficulty) => {
    const available = QUESTIONS.filter(q => 
      q.category === category && 
      q.difficulty === difficulty && 
      !permanentlyUsedIds.includes(q.id)
    );

    let chosenQuestion: Question;
    if (available.length === 0) {
      const resetAvailable = QUESTIONS.filter(q => q.category === category && q.difficulty === difficulty);
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
        colors: ['#F7C705', '#000000', '#ffffff']
      });
    }

    const newAnswered = [...gameState.answeredQuestionIds, activeQuestion.key];
    const newPermanentUsed = [...permanentlyUsedIds, activeQuestion.question.id];
    
    setPermanentlyUsedIds(newPermanentUsed);
    localStorage.setItem('chagar_used_questions', JSON.stringify(newPermanentUsed));

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
    <div className="min-h-screen bg-[#F7C705] text-black font-sans selection:bg-black/10 overflow-x-hidden">
      
      {/* Top Hazard Stripes */}
      <div className="h-6 w-full bg-black overflow-hidden border-b-4 border-black flex">
        {Array.from({ length: 80 }).map((_, i) => (
          <div key={i} className="w-10 h-full bg-[#F7C705] skew-x-[-45deg] mx-2 shrink-0" />
        ))}
      </div>

      <nav className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto mb-4">
        <div className="flex items-center gap-5">
          <div className="relative">
            <img 
              src="/img/log.png" 
              alt="Logo" 
              className="w-24 h-24 object-contain drop-shadow-xl" 
            />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#F7C705] rounded-full animate-pulse"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-4xl font-black tracking-tighter uppercase leading-none">چگار</span>
            <span className="text-[10px] font-bold bg-black text-[#F7C705] px-2 py-0.5 rounded mt-2 self-start shadow-sm">لعبة العقول</span>
          </div>
        </div>
        
        {currentUser && (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-black/50 text-[10px] font-black uppercase">Active Admin</span>
              <span className="text-black font-black text-sm">{currentUser.username}</span>
            </div>
            <button onClick={handleLogout} className="bg-black text-[#F7C705] p-3 rounded-2xl hover:bg-black/80 transition-all shadow-lg active:scale-95">
              <LogOut size={22} />
            </button>
          </div>
        )}
      </nav>

      <main className="relative z-10 pb-20">
        {/* شاشة الدخول المحدثة (الصقر في الدائرة) */}
        {gameState.step === 'login' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative mb-8">
              <div className="w-40 h-40 bg-[#F7C705] rounded-full flex items-center justify-center shadow-2xl border-4 border-black/10 overflow-hidden">
                <img 
                  src="/img/sq.jpeg" 
                  alt="Chgar Icon" 
                  className="w-32 h-32 object-contain" 
                />
              </div>
              <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 border-4 border-[#F7C705] rounded-full animate-pulse"></div>
            </div>
            <Login onLogin={handleLogin} />
          </div>
        )}
        
        {gameState.step === 'admin' && (
          <AdminPanel 
            users={users} 
            onAddUser={handleAddUser} 
            onToggleUser={handleToggleUser} 
            onDeleteUser={handleDeleteUser} // تمرير دالة الحذف الجديدة
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
            />
          </div>
        )}

        {gameState.step === 'result' && (
          <div className="max-w-2xl mx-auto mt-20 p-10 bg-black rounded-3xl border-4 border-black shadow-2xl text-center rtl text-[#F7C705]">
            <Award size={80} className="mx-auto mb-6 text-[#F7C705]" />
            <h2 className="text-4xl font-black mb-2 uppercase">انتهت المعركة!</h2>
            <p className="text-white/60 mb-8 font-bold">النتائج النهائية للتحدي</p>
            
            <div className="flex justify-between items-center mb-12">
              <div className={`p-6 rounded-2xl flex-1 ${gameState.teams[0].score > gameState.teams[1].score ? 'bg-[#F7C705] text-black ring-4 ring-white/30' : 'bg-white/10 text-white'}`}>
                <h3 className="font-bold mb-2">{gameState.teams[0].name}</h3>
                <p className="text-4xl font-black">{gameState.teams[0].score}</p>
              </div>
              <div className="px-6 font-black text-2xl text-white/20">VS</div>
              <div className={`p-6 rounded-2xl flex-1 ${gameState.teams[1].score > gameState.teams[0].score ? 'bg-[#F7C705] text-black ring-4 ring-white/30' : 'bg-white/10 text-white'}`}>
                <h3 className="font-bold mb-2">{gameState.teams[1].name}</h3>
                <p className="text-4xl font-black">{gameState.teams[1].score}</p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="flex items-center gap-2 mx-auto bg-[#F7C705] text-black px-12 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-xl"
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

      <footer className="relative z-10 mt-auto py-8 text-center text-black/40 text-[10px] font-black uppercase tracking-widest">
        <p>© {new Date().getFullYear()} CHGAR - INTELLECTUAL ARENA</p>
      </footer>
    </div>
  );
};

export default App;