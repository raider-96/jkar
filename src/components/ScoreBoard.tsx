
import React from 'react';
import { Team } from '../types';
import { Trophy, Plus, Minus } from 'lucide-react';

interface ScoreBoardProps {
  teams: [Team, Team];
  currentTurn: 0 | 1;
  onAdjustScore: (teamIdx: number, amount: number) => void;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ teams, currentTurn, onAdjustScore }) => {
  return (
    <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-8 mb-12 rtl px-4">
      {teams.map((team, idx) => (
        <div
          key={idx}
          className={`
            relative flex-1 max-w-sm p-8 rounded-[40px] border-4 transition-all duration-500
            ${currentTurn === idx 
              ? 'bg-black border-black shadow-2xl shadow-black/30 scale-105 z-10 text-[#F7C705]' 
              : 'bg-white/40 border-black/10 opacity-70 text-black'
            }
          `}
        >
          {currentTurn === idx && (
            <div className="absolute -top-4 right-10 bg-[#F7C705] text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter shadow-lg">
              دور الفريق الحالي
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-[20px] ${currentTurn === idx ? 'bg-[#F7C705]/10' : 'bg-black/5'}`}>
                <Trophy size={32} className={currentTurn === idx ? 'text-[#F7C705]' : 'text-black/40'} />
              </div>
              <div>
                <h3 className="text-2xl font-black truncate w-40">{team.name}</h3>
                <p className={`text-5xl font-mono font-black ${currentTurn === idx ? 'text-[#F7C705]' : 'text-black'}`}>{team.score}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => onAdjustScore(idx, 100)}
                className={`p-2 rounded-xl transition-all shadow-sm border-2 ${currentTurn === idx ? 'bg-[#F7C705] border-[#F7C705] text-black' : 'bg-black border-black text-[#F7C705]'}`}
                title="إضافة 100 نقطة"
              >
                <Plus size={20} />
              </button>
              <button 
                onClick={() => onAdjustScore(idx, -100)}
                className={`p-2 rounded-xl transition-all shadow-sm border-2 ${currentTurn === idx ? 'bg-transparent border-[#F7C705]/30 text-[#F7C705]' : 'bg-transparent border-black/20 text-black'}`}
                title="خصم 100 نقطة"
              >
                <Minus size={20} />
              </button>
            </div>
          </div>
          
          <div className="mt-8 flex flex-wrap gap-2">
            {team.categories.map((cat, i) => (
              <span key={i} className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tight ${currentTurn === idx ? 'bg-[#F7C705]/10 text-[#F7C705]/60' : 'bg-black/5 text-black/40'}`}>
                {cat}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScoreBoard;
