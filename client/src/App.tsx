
import React, { useState, useEffect } from 'react';
import { GameState, Team, Question, Difficulty, UserAccount, HelpType } from './types';
import { QUESTIONS } from './data/questions';
import Login from './components/Login';
import Setup from './components/Setup';
import GameBoard from './components/GameBoard';
import ScoreBoard from './components/ScoreBoard';
import QuestionView from './components/QuestionView';
import AdminPanel from './components/AdminPanel';
import confetti from 'canvas-confetti';
import { RotateCcw, LogOut, Award, ArrowLeft } from 'lucide-react';

const DEFAULT_USERS: UserAccount[] = [
  { username: 'admin', password: '123', role: 'admin', isActive: true, createdAt: new Date().toISOString() },
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = sessionStorage.getItem('chgar_game_state');
    return saved ? JSON.parse(saved) : {
      step: 'login',
      teams: [
        { name: 'الفريق الأول', score: 0, categories: [], helps: [], usedHelps: [] },
        { name: 'الفريق الثاني', score: 0, categories: [], helps: [], usedHelps: [] },
      ],
      currentTurn: 0,
      answeredQuestionIds: [],
      selectedCategories: [],
      activeDestruction: null,
      activeThief: null
    };
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = sessionStorage.getItem('chgar_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('chagar_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [allQuestions, setAllQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('chagar_custom_questions');
    const custom = saved ? JSON.parse(saved) : [];
    return [...QUESTIONS, ...custom];
  });

  const [activeQuestion, setActiveQuestion] = useState<{ question: Question; key: string; } | null>(null);
  const [permanentlyUsedIds, setPermanentlyUsedIds] = useState<string[]>([]);

  useEffect(() => { sessionStorage.setItem('chgar_game_state', JSON.stringify(gameState)); }, [gameState]);
  useEffect(() => { if (currentUser) sessionStorage.setItem('chgar_current_user', JSON.stringify(currentUser)); else sessionStorage.removeItem('chgar_current_user'); }, [currentUser]);
  useEffect(() => { localStorage.setItem('chagar_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { const saved = localStorage.getItem('chagar_used_questions'); if (saved) setPermanentlyUsedIds(JSON.parse(saved)); }, []);

  const handleLogin = (username: string, password?: string) => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
      if (!user.isActive) return alert('هذا اليوزر معطل حالياً');
      if (user.password && user.password !== password) return alert('الرمز السري غير صحيح');
      setCurrentUser(user);
      setGameState(prev => ({ ...prev, step: 'setup' }));
    } else alert('اليوزر غير موجود');
  };

  const handleAddUser = (username: string, password?: string) => {
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) return;
    setUsers([...users, { username, password, role: 'user', isActive: true, createdAt: new Date().toISOString() }]);
  };

  const handleToggleUser = (username: string) => setUsers(users.map(u => u.username === username ? { ...u, isActive: !u.isActive } : u));
  const handleDeleteUser = (username: string) => setUsers(users.filter(u => u.username !== username));

  const handleAddQuestion = (q: Question) => {
    const updated = [...allQuestions, q];
    setAllQuestions(updated);
    localStorage.setItem('chagar_custom_questions', JSON.stringify(updated.filter(item => item.id.startsWith('custom-'))));
  };

  const handleDeleteQuestion = (id: string) => {
    const updated = allQuestions.filter(q => q.id !== id);
    setAllQuestions(updated);
    localStorage.setItem('chagar_custom_questions', JSON.stringify(updated.filter(item => item.id.startsWith('custom-'))));
  };

  const handleExportData = () => {
    const data = { users: users.filter(u => u.role !== 'admin'), questions: allQuestions.filter(q => q.id.startsWith('custom-')) };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chgar_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportData = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.users) {
        const existing = users.map(u => u.username.toLowerCase());
        setUsers([...users, ...data.users.filter((u: any) => !existing.includes(u.username.toLowerCase()))]);
      }
      if (data.questions) {
        const existingIds = allQuestions.map(q => q.id);
        const newQs = data.questions.filter((q: any) => !existingIds.includes(q.id));
        const updated = [...allQuestions, ...newQs];
        setAllQuestions(updated);
        localStorage.setItem('chagar_custom_questions', JSON.stringify(updated.filter(q => q.id.startsWith('custom-'))));
      }
      alert('تم الاستيراد!');
    } catch (err) { alert('خطأ في الملف!'); }
  };

  const handleStartGame = (t1: string, t2: string, cats: string[], t1Helps: HelpType[], t2Helps: HelpType[]) => {
    setGameState({
      ...gameState,
      step: 'game',
      teams: [
        { name: t1, score: 0, categories: cats.slice(0, 3), helps: t1Helps, usedHelps: [] },
        { name: t2, score: 0, categories: cats.slice(3, 6), helps: t2Helps, usedHelps: [] },
      ],
      selectedCategories: cats,
      answeredQuestionIds: [],
    });
  };

  const handleUseHelp = (teamIdx: number, type: HelpType) => {
    const newTeams = [...gameState.teams] as [Team, Team];
    newTeams[teamIdx].usedHelps.push(type);
    let updates: any = { teams: newTeams };
    if (type === 'destruction') updates.activeDestruction = teamIdx;
    if (type === 'thief') updates.activeThief = teamIdx;
    setGameState(prev => ({ ...prev, ...updates }));
  };

  const handleSwitchQuestion = () => {
    if (!activeQuestion) return;
    const { category: cat, difficulty: diff, id } = activeQuestion.question;
    const avail = allQuestions.filter(q => q.category === cat && q.difficulty === diff && !permanentlyUsedIds.includes(q.id) && q.id !== id);
    if (avail.length > 0) setActiveQuestion({ ...activeQuestion, question: avail[Math.floor(Math.random() * avail.length)] });
  };

  const handleSelectQuestion = (category: string, difficulty: Difficulty) => {
    const targetIdx = gameState.activeThief !== null ? gameState.activeThief : gameState.currentTurn;
    const avail = allQuestions.filter(q => q.category === category && q.difficulty === difficulty && !permanentlyUsedIds.includes(q.id));
    const chosen = avail.length > 0 ? avail[Math.floor(Math.random() * avail.length)] : allQuestions.filter(q => q.category === category && q.difficulty === difficulty)[0];
    const prefix = `${category}-${difficulty}`;
    const slot = gameState.answeredQuestionIds.includes(`${prefix}-1`) ? `${prefix}-2` : `${prefix}-1`;
    setActiveQuestion({ question: chosen, key: slot });
    if (gameState.activeThief !== null) setGameState(prev => ({ ...prev, activeThief: null }));
  };

  const handleAnswer = (winnerIdx: number | null) => {
    if (!activeQuestion) return;
    const newTeams = [...gameState.teams] as [Team, Team];
    if (winnerIdx !== null) {
      newTeams[winnerIdx].score += activeQuestion.question.points;
      if (gameState.activeDestruction !== null && winnerIdx === gameState.activeDestruction) {
        newTeams[winnerIdx === 0 ? 1 : 0].score -= activeQuestion.question.points;
      }
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#F7C705', '#000'] });
    }
    const newUsed = [...permanentlyUsedIds, activeQuestion.question.id];
    setPermanentlyUsedIds(newUsed);
    localStorage.setItem('chagar_used_questions', JSON.stringify(newUsed));
    const nextAns = [...gameState.answeredQuestionIds, activeQuestion.key];
    setGameState({
      ...gameState,
      teams: newTeams,
      currentTurn: (gameState.currentTurn === 0 ? 1 : 0) as 0 | 1,
      answeredQuestionIds: nextAns,
      activeDestruction: null,
      step: nextAns.length === (gameState.selectedCategories.length * 6) ? 'result' : 'game'
    });
    setActiveQuestion(null);
  };

  return (
    <div className="min-h-screen bg-[#F7C705] text-black font-sans selection:bg-black/10">
      <div className="h-6 w-full bg-repeat-x flex overflow-hidden border-b-4 border-black">
        {Array.from({ length: 50 }).map((_, i) => (<div key={i} className={`w-8 h-full transform -skew-x-[45deg] ${i % 2 === 0 ? 'bg-black' : 'bg-transparent'}`} />))}
      </div>

      <nav className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto mb-4 border-b-2 border-black/10">
        <div className="flex items-center gap-4">
          <img src="img/lo.jpg" alt="Chgar" className="w-16 h-16 rounded-[20px] shadow-2xl border-4 border-black" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <div className="flex flex-col">
            <span className="text-4xl font-black tracking-tighter uppercase leading-none">چگار</span>
            <span className="text-[10px] font-black tracking-[0.2em] opacity-40">CHGAR GAME</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {gameState.step !== 'login' && (
            <button onClick={() => setGameState(prev => ({ ...prev, step: prev.step === 'game' ? 'setup' : 'game' }))} className="bg-black/5 p-3 rounded-xl hover:bg-black hover:text-[#F7C705] transition-all">
              <ArrowLeft size={24} />
            </button>
          )}
          {currentUser && (
            <button onClick={() => { setCurrentUser(null); setGameState(prev => ({ ...prev, step: 'login' })); sessionStorage.clear(); }} className="bg-black text-[#F7C705] p-3 rounded-xl shadow-lg">
              <LogOut size={24} />
            </button>
          )}
        </div>
      </nav>

      <main className="relative z-10">
        {gameState.step === 'login' && <Login onLogin={handleLogin} />}
        {gameState.step === 'admin' && <AdminPanel users={users} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser} onToggleUser={handleToggleUser} questions={allQuestions} onAddQuestion={handleAddQuestion} onDeleteQuestion={handleDeleteQuestion} onExportData={handleExportData} onImportData={handleImportData} onBack={() => setGameState(prev => ({ ...prev, step: 'setup' }))} />}
        {gameState.step === 'game' && (
          <div className="space-y-8 animate-in fade-in duration-700">
            <ScoreBoard teams={gameState.teams} currentTurn={gameState.currentTurn} onAdjustScore={(idx, amt) => { const nt = [...gameState.teams] as [Team, Team]; nt[idx].score += amt; setGameState(prev => ({ ...prev, teams: nt })); }} />
            <GameBoard gameState={gameState} onSelectQuestion={handleSelectQuestion} permanentlyUsedIds={permanentlyUsedIds} questions={allQuestions} />
          </div>
        )}
        {gameState.step === 'result' && (
          <div className="max-w-2xl mx-auto mt-20 p-10 bg-black text-[#F7C705] rounded-[60px] shadow-2xl text-center rtl border-8 border-black/20">
            <Award size={100} className="mx-auto mb-8" />
            <h2 className="text-6xl font-black mb-12">انتهت اللعبة!</h2>
            <div className="flex justify-around items-center mb-16">
              <div className="text-center">
                <p className="text-xs uppercase font-black opacity-40 mb-2">{gameState.teams[0].name}</p>
                <p className="text-6xl font-black">{gameState.teams[0].score}</p>
              </div>
              <div className="h-20 w-1 bg-[#F7C705]/20 rounded-full" />
              <div className="text-center">
                <p className="text-xs uppercase font-black opacity-40 mb-2">{gameState.teams[1].name}</p>
                <p className="text-6xl font-black">{gameState.teams[1].score}</p>
              </div>
            </div>
            <button onClick={() => setGameState(prev => ({ ...prev, step: 'setup', answeredQuestionIds: [] }))} className="bg-[#F7C705] text-black px-12 py-6 rounded-[30px] font-black text-2xl flex items-center justify-center gap-4 mx-auto hover:scale-105 transition-all">
              <RotateCcw size={32} /> تحدي جديد
            </button>
          </div>
        )}
      </main>

      {activeQuestion && <QuestionView question={activeQuestion.question} teams={gameState.teams} currentTurn={gameState.currentTurn} onAnswer={handleAnswer} onUseHelp={handleUseHelp} onSwitchQuestion={handleSwitchQuestion} />}
    </div>
  );
};

export default App;
