
import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { Timer, CheckCircle, XCircle, Eye, Image as ImageIcon, UserCircle } from 'lucide-react';

interface QuestionViewProps {
  question: Question;
  teams: [string, string];
  currentTurn: 0 | 1;
  onAnswer: (winnerIndex: number | null) => void;
}

const QuestionView: React.FC<QuestionViewProps> = ({ question, teams, currentTurn, onAnswer }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isSecondChance, setIsSecondChance] = useState(false);
  const [activeTeamIdx, setActiveTeamIdx] = useState(currentTurn);

  useEffect(() => {
    if (timeLeft > 0 && !showAnswer) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showAnswer && !isSecondChance) {
      setIsSecondChance(true);
      setActiveTeamIdx(currentTurn === 0 ? 1 : 0);
      setTimeLeft(20);
    }
  }, [timeLeft, showAnswer, isSecondChance, currentTurn]);

  const getChallengeIcon = () => {
    switch(question.type) {
      case 'image': return <ImageIcon className="text-[#F7C705]" size={32} />;
      case 'act': return <UserCircle className="text-[#F7C705]" size={32} />;
      default: return null;
    }
  };

  const getChallengeLabel = () => {
    switch(question.type) {
      case 'image': return 'تحدي تخمين الصورة';
      case 'act': return 'تحدي التمثيل';
      default: return 'سؤال عام';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md rtl">
      <div className="bg-[#F7C705] border-8 border-black w-full max-w-4xl max-h-[90vh] rounded-[60px] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header - Stays Fixed */}
        <div className="px-8 py-6 flex justify-between items-center bg-black text-[#F7C705] shrink-0">
          <div>
            <span className="text-[10px] uppercase font-black opacity-60 block tracking-widest mb-1">
              {isSecondChance ? 'فرصة ذهبية ثانية:' : 'دور الفريق:'}
            </span>
            <span className="text-2xl font-black">{teams[activeTeamIdx]}</span>
          </div>
          <div className="flex items-center gap-3 bg-[#F7C705]/10 px-6 py-3 rounded-[24px] border border-[#F7C705]/20">
            <Timer size={28} className={timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-[#F7C705]'} />
            <span className={`text-4xl font-mono font-black ${timeLeft <= 5 ? 'text-red-500' : 'text-[#F7C705]'}`}>
              {timeLeft}
            </span>
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="p-10 md:p-16 text-center overflow-y-auto custom-scrollbar flex-1">
          <div className="flex flex-col items-center gap-6 mb-12">
            <div className="flex items-center gap-3 bg-black text-[#F7C705] px-8 py-3 rounded-full text-lg font-black shadow-xl">
              {getChallengeIcon()}
              <span>{getChallengeLabel()} • {question.points} نقطة</span>
            </div>
            {question.image && (
              <div className="w-full max-w-lg h-64 overflow-hidden rounded-[40px] border-8 border-black shadow-2xl mt-4 shrink-0">
                <img src={question.image} alt="Challenge" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black text-black mb-16 leading-tight max-w-3xl mx-auto">
            {question.question}
          </h2>

          <div className="space-y-8 pb-10">
            {!showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                className="group flex items-center gap-4 mx-auto bg-black hover:scale-105 text-[#F7C705] px-16 py-8 rounded-[32px] transition-all shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)]"
              >
                <Eye size={36} />
                <span className="text-3xl font-black uppercase tracking-tighter">إظهار الإجابة</span>
              </button>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="bg-black/5 border-4 border-black/10 p-10 rounded-[48px] mb-12 relative">
                  <span className="bg-black text-[#F7C705] text-xs absolute -top-4 right-12 px-6 py-2 rounded-full font-black uppercase">الإجابة الصحيحة</span>
                  <p className="text-4xl md:text-5xl font-black text-black">{question.answer}</p>
                </div>
                
                <p className="text-black/40 mb-8 font-black uppercase tracking-widest text-sm">تحديد الفريق الفائز بالنقطة</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button
                    onClick={() => onAnswer(0)}
                    className="flex flex-col items-center gap-2 bg-black hover:bg-black/90 text-[#F7C705] font-black py-6 rounded-[32px] shadow-2xl transition-all active:scale-95"
                  >
                    <CheckCircle size={32} />
                    <span className="text-xl">{teams[0]}</span>
                  </button>
                  <button
                    onClick={() => onAnswer(1)}
                    className="flex flex-col items-center gap-2 bg-black hover:bg-black/90 text-[#F7C705] font-black py-6 rounded-[32px] shadow-2xl transition-all active:scale-95"
                  >
                    <CheckCircle size={32} />
                    <span className="text-xl">{teams[1]}</span>
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
