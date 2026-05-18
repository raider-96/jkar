
import React, { useState, useEffect } from 'react';
import { Question, HelpType, Team } from '../types';
import { Timer, CheckCircle, XCircle, Eye, Image as Play, Pause, RefreshCw, Smartphone, Brain, Bomb, Ghost } from 'lucide-react';

interface QuestionViewProps {
  question: Question;
  teams: [Team, Team];
  currentTurn: 0 | 1;
  onAnswer: (winnerIndex: number | null) => void;
  onUseHelp: (teamIdx: number, help: HelpType) => void;
  onSwitchQuestion: () => void;
}

const QuestionView: React.FC<QuestionViewProps> = ({ 
  question, teams, currentTurn, onAnswer, onUseHelp, onSwitchQuestion 
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isSecondChance, setIsSecondChance] = useState(false);
  const [activeTeamIdx, setActiveTeamIdx] = useState(currentTurn);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !showAnswer && !isPaused) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showAnswer && !isSecondChance) {
      setIsSecondChance(true);
      setActiveTeamIdx(currentTurn === 0 ? 1 : 0);
      setTimeLeft(20);
    }
  }, [timeLeft, showAnswer, isSecondChance, currentTurn, isPaused]);

  const useHelp = (teamIdx: number, type: HelpType) => {
    if (type === 'think') setTimeLeft(60);
    if (type === 'phone') setIsPaused(true);
    if (type === 'change') {
      onSwitchQuestion();
      setTimeLeft(30);
      setIsSecondChance(false);
      setActiveTeamIdx(currentTurn);
    }
    onUseHelp(teamIdx, type);
  };

  const resumeTime = () => {
    setIsPaused(false);
    setTimeLeft(40);
  };

  const helpIcons: Record<HelpType, any> = {
    think: Brain,
    phone: Smartphone,
    destruction: Bomb,
    change: RefreshCw,
    thief: Ghost
  };

  const helpNames: Record<HelpType, string> = {
    think: 'خل أفكر',
    phone: 'أريد أخبار',
    destruction: 'تفليش',
    change: 'شوفلي غيرة',
    thief: 'حرامي'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md rtl">
      <div className="bg-[#F7C705] border-8 border-black w-full max-w-4xl max-h-[95vh] rounded-[60px] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 flex justify-between items-center bg-black text-[#F7C705] shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#F7C705] rounded-xl flex items-center justify-center text-black font-black text-xl">
              {activeTeamIdx + 1}
            </div>
            <div>
              <span className="text-[10px] uppercase font-black opacity-60 block tracking-widest">
                {isSecondChance ? 'فرصة ذهبية ثانية' : 'دور الفريق'}
              </span>
              <span className="text-2xl font-black">{teams[activeTeamIdx].name}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
             {isPaused && (
               <button 
                onClick={resumeTime}
                className="bg-[#F7C705] text-black px-4 py-2 rounded-xl font-black flex items-center gap-2 animate-pulse"
               >
                 <Play size={18} /> استمرار (40ث)
               </button>
             )}
             <div className="flex items-center gap-3 bg-[#F7C705]/10 px-6 py-3 rounded-[24px] border border-[#F7C705]/20">
              {isPaused ? <Pause size={28} /> : <Timer size={28} className={timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-[#F7C705]'} />}
              <span className={`text-4xl font-mono font-black ${timeLeft <= 5 ? 'text-red-500' : 'text-[#F7C705]'}`}>
                {timeLeft}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 md:p-12 text-center overflow-y-auto custom-scrollbar flex-1">
          
          {/* Helps Toolbar */}
          {!showAnswer && (
            <div className="flex justify-center gap-3 mb-10 bg-black/5 p-4 rounded-[30px]">
              {teams[activeTeamIdx].helps.filter(h => !teams[activeTeamIdx].usedHelps.includes(h)).map(helpType => {
                const Icon = helpIcons[helpType];
                return (
                  <button
                    key={helpType}
                    onClick={() => useHelp(activeTeamIdx, helpType)}
                    className="group flex flex-col items-center gap-1 bg-black text-[#F7C705] p-4 rounded-2xl hover:scale-110 transition-all shadow-lg"
                  >
                    <Icon size={24} />
                    <span className="text-[8px] font-black">{helpNames[helpType]}</span>
                  </button>
                );
              })}
              {teams[activeTeamIdx].helps.filter(h => !teams[activeTeamIdx].usedHelps.includes(h)).length === 0 && (
                <span className="text-black/20 font-black text-xs uppercase py-2">لا يوجد وسائل مساعدة متاحة</span>
              )}
            </div>
          )}

          <div className="flex flex-col items-center gap-6 mb-10">
            <div className="bg-black text-[#F7C705] px-8 py-3 rounded-full text-lg font-black shadow-xl">
               {question.difficulty === 'easy' ? 'سهل' : question.difficulty === 'medium' ? 'متوسط' : 'صعب'} • {question.points} نقطة
            </div>
            
            {(showAnswer ? question.aImage : question.qImage) && (
              <div className="w-full max-w-lg h-auto max-h-[350px] overflow-hidden rounded-[40px] border-8 border-black shadow-2xl bg-white">
                <img 
                  src={showAnswer ? question.aImage : question.qImage} 
                  alt="Challenge" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black text-black mb-12 leading-tight">
            {showAnswer ? question.answer : question.question}
          </h2>

          <div className="space-y-8 pb-10">
            {!showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                className="group flex items-center gap-4 mx-auto bg-black hover:scale-105 text-[#F7C705] px-16 py-8 rounded-[32px] transition-all shadow-2xl"
              >
                <Eye size={36} />
                <span className="text-3xl font-black uppercase">إظهار الإجابة</span>
              </button>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                <p className="text-black/40 mb-8 font-black uppercase tracking-widest text-sm">تحديد الفريق الفائز</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button
                    onClick={() => onAnswer(0)}
                    className="flex flex-col items-center gap-2 bg-black hover:bg-black/90 text-[#F7C705] font-black py-6 rounded-[32px] shadow-2xl transition-all active:scale-95"
                  >
                    <CheckCircle size={32} />
                    <span className="text-xl">{teams[0].name}</span>
                  </button>
                  <button
                    onClick={() => onAnswer(1)}
                    className="flex flex-col items-center gap-2 bg-black hover:bg-black/90 text-[#F7C705] font-black py-6 rounded-[32px] shadow-2xl transition-all active:scale-95"
                  >
                    <CheckCircle size={32} />
                    <span className="text-xl">{teams[1].name}</span>
                  </button>
                  <button
                    onClick={() => onAnswer(null)}
                    className="flex flex-col items-center gap-2 bg-white/40 border-4 border-black/10 text-black/40 font-black py-6 rounded-[32px] transition-all hover:bg-white/60 active:scale-95"
                  >
                    <XCircle size={32} />
                    <span className="text-xl">لا أحد</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionView;
