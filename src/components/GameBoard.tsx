
import React from 'react';
import { GameState, Difficulty } from '../types';
import { CheckCircle } from 'lucide-react';
import { CATEGORIES_CONFIG, QUESTIONS } from '../data/questions';

interface GameBoardProps {
  gameState: GameState;
  onSelectQuestion: (category: string, difficulty: Difficulty) => void;
  permanentlyUsedIds: string[];
}

const DIFFICULTIES: { label: string; value: Difficulty; points: number }[] = [
  { label: 'سهل', value: 'easy', points: 100 },
  { label: 'متوسط', value: 'medium', points: 200 },
  { label: 'صعب', value: 'hard', points: 400 },
];

const GameBoard: React.FC<GameBoardProps> = ({ gameState, onSelectQuestion, permanentlyUsedIds }) => {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 rtl">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {gameState.selectedCategories.map((catName) => {
          const catInfo = CATEGORIES_CONFIG.find(c => c.name === catName);
          const remainingCount = QUESTIONS.filter(q => q.category === catName && !permanentlyUsedIds.includes(q.id)).length;

          return (
            <div key={catName} className="flex flex-col gap-5">
              <div className="bg-black p-5 rounded-[32px] border-4 border-black text-center shadow-2xl flex flex-col items-center gap-2 relative overflow-hidden group">
                <span className="text-3xl z-10 transform group-hover:scale-125 transition-transform duration-300">{catInfo?.icon}</span>
                <h3 className="text-[10px] font-black text-[#F7C705] truncate w-full z-10 uppercase tracking-tighter leading-tight">{catName}</h3>
                <div className="bg-[#F7C705] text-black text-[8px] font-black px-2 py-0.5 rounded-full z-10">
                  {remainingCount} متبقي
                </div>
              </div>
              
              {DIFFICULTIES.map((diff) => (
                <div key={`${catName}-${diff.value}`} className="flex flex-col gap-3">
                  {[1, 2].map((num) => {
                    const questionKey = `${catName}-${diff.value}-${num}`;
                    const isDone = gameState.answeredQuestionIds.includes(questionKey);

                    return (
                      <button
                        key={questionKey}
                        disabled={isDone}
                        onClick={() => onSelectQuestion(catName, diff.value)}
                        className={`
                          h-24 flex flex-col items-center justify-center rounded-[24px] border-4 transition-all font-black text-2xl
                          ${isDone 
                            ? 'bg-black/5 border-black/5 text-black/10 cursor-not-allowed' 
                            : 'bg-white border-black text-black hover:scale-105 hover:bg-black hover:text-[#F7C705] shadow-xl'
                          }
                        `}
                      >
                        {isDone ? (
                          <CheckCircle size={32} className="text-slate-700" />
                        ) : (
                          <>
                            <span>{diff.points}</span>
                            <span className="text-[10px] opacity-60 font-normal">{diff.label}</span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GameBoard;
