
import React, { useState } from 'react';
import { CATEGORIES_CONFIG, QUESTIONS } from '../data/questions';
import { motion } from 'framer-motion';
import { Users, CheckCircle2, Trophy, HelpCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { HelpType, Question } from '../types';

interface SetupProps {
  onStart: (team1: string, team2: string, selectedCats: string[], t1Helps: HelpType[], t2Helps: HelpType[]) => void;
  isAdmin: boolean;
  onOpenAdmin: () => void;
  allQuestions: Question[];
}

const HELPS_CONFIG: { type: HelpType; name: string; desc: string }[] = [
  { type: 'think', name: 'خل أفكر', desc: 'تعطي الفريق 60 ثانية للإجابة' },
  { type: 'phone', name: 'أريد أخبار', desc: 'إيقاف الوقت، ثم استئنافه بـ 40 ثانية' },
  { type: 'destruction', name: 'تفليش', desc: 'إذا جاوبتم صح، الخصم ينقص نقاط السؤال' },
  { type: 'change', name: 'شوفلي غيرة', desc: 'تبديل السؤال بنفس المستوى وتجديد الوقت' },
  { type: 'thief', name: 'حرامي', desc: 'سرقة سؤال الخصم القادم' },
];

const Setup: React.FC<SetupProps> = ({ onStart, isAdmin, onOpenAdmin, allQuestions }) => {
  const [team1, setTeam1] = useState('الفريق الأول');
  const [team2, setTeam2] = useState('الفريق الثاني');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [team1Helps, setTeam1Helps] = useState<HelpType[]>([]);
  const [team2Helps, setTeam2Helps] = useState<HelpType[]>([]);
  const [showRules, setShowRules] = useState(false);

  const toggleCategory = (cat: string) => {
    if (selectedCats.includes(cat)) {
      setSelectedCats(selectedCats.filter(c => c !== cat));
    } else if (selectedCats.length < 6) {
      setSelectedCats([...selectedCats, cat]);
    }
  };

  const toggleHelp = (teamIdx: 1 | 2, help: HelpType) => {
    if (teamIdx === 1) {
      if (team1Helps.includes(help)) setTeam1Helps(team1Helps.filter(h => h !== help));
      else if (team1Helps.length < 3) setTeam1Helps([...team1Helps, help]);
    } else {
      if (team2Helps.includes(help)) setTeam2Helps(team2Helps.filter(h => h !== help));
      else if (team2Helps.length < 3) setTeam2Helps([...team2Helps, help]);
    }
  };

  const handleStart = () => {
    if (selectedCats.length === 6 && team1Helps.length === 3 && team2Helps.length === 3) {
      onStart(team1, team2, selectedCats, team1Helps, team2Helps);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto p-6 rtl pb-20"
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <h1 className="text-5xl font-black text-black tracking-tighter uppercase">إعداد اللعبة</h1>
        <div className="flex gap-3">
          {isAdmin && (
            <button 
              onClick={onOpenAdmin}
              className="flex items-center gap-2 bg-black text-[#F7C705] px-6 py-3 rounded-2xl transition-all font-black shadow-xl"
            >
              <ShieldAlert size={20} />
              الإدارة
            </button>
          )}
          <button 
            onClick={() => setShowRules(!showRules)}
            className="flex items-center gap-2 bg-black/5 border-2 border-black/10 px-6 py-3 rounded-2xl text-black font-black hover:bg-black/10 transition-colors"
          >
            <HelpCircle size={20} />
            قوانين اللعبة
          </button>
        </div>
      </div>

      {showRules && (
        <div className="bg-black text-[#F7C705] p-8 rounded-[32px] mb-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full -translate-y-12 translate-x-12" />
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
            <Trophy className="text-[#F7C705]" /> قوانين چگار
          </h2>
          <ul className="space-y-3 font-bold text-lg opacity-90">
            <li className="flex gap-3"><span className="text-yellow-500">●</span> يتم تشكيل فريقين متنافسين.</li>
            <li className="flex gap-3"><span className="text-yellow-500">●</span> كل فريق يختار 3 أصناف (المجموع 6 أصناف للعبة).</li>
            <li className="flex gap-3"><span className="text-yellow-500">●</span> لكل صنف 3 مستويات صعوبة: سهل (100)، متوسط (200)، صعب (400).</li>
            <li className="flex gap-3"><span className="text-yellow-500">●</span> كل مستوى صعوبة يحتوي على سؤالين في القيم الواحد.</li>
            <li className="flex gap-3"><span className="text-yellow-500">●</span> الفائز هو الفريق الذي يجمع أكبر عدد من النقاط.</li>
            <li className="flex gap-3"><span className="text-yellow-500">●</span> الأسئلة التي تتم الإجابة عليها لا تتكرر في المرات القادمة.</li>
          </ul>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Team 1 Setup */}
        <div className="bg-white/40 p-8 rounded-[40px] border-4 border-black/5 space-y-6 shadow-xl">
          <div className="space-y-4">
            <label className="block text-black font-black mb-2 flex items-center gap-2 uppercase tracking-wide">
              <Users size={20} className="text-black/40" /> اسم الفريق الأول
            </label>
            <input
              type="text"
              value={team1}
              onChange={(e) => setTeam1(e.target.value)}
              className="w-full bg-black border-4 border-black rounded-3xl py-5 px-6 outline-none text-[#F7C705] font-black text-xl transition-all"
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-black text-black/40 uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={16} /> اختر 3 وسائل مساعدة
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {HELPS_CONFIG.map(help => (
                <button
                  key={help.type}
                  onClick={() => toggleHelp(1, help.type)}
                  className={`p-4 rounded-2xl border-4 text-right transition-all font-black ${team1Helps.includes(help.type) ? 'bg-black border-black text-[#F7C705]' : 'bg-white/50 border-black/5 text-black/60'}`}
                >
                  <div className="text-sm">{help.name}</div>
                  <div className="text-[10px] opacity-40 font-bold">{help.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Team 2 Setup */}
        <div className="bg-white/40 p-8 rounded-[40px] border-4 border-black/5 space-y-6 shadow-xl">
          <div className="space-y-4">
            <label className="block text-black font-black mb-2 flex items-center gap-2 uppercase tracking-wide">
              <Users size={20} className="text-black/40" /> اسم الفريق الثاني
            </label>
            <input
              type="text"
              value={team2}
              onChange={(e) => setTeam2(e.target.value)}
              className="w-full bg-black border-4 border-black rounded-3xl py-5 px-6 outline-none text-[#F7C705] font-black text-xl transition-all"
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-black text-black/40 uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={16} /> اختر 3 وسائل مساعدة
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {HELPS_CONFIG.map(help => (
                <button
                  key={help.type}
                  onClick={() => toggleHelp(2, help.type)}
                  className={`p-4 rounded-2xl border-4 text-right transition-all font-black ${team2Helps.includes(help.type) ? 'bg-black border-black text-[#F7C705]' : 'bg-white/50 border-black/5 text-black/60'}`}
                >
                  <div className="text-sm">{help.name}</div>
                  <div className="text-[10px] opacity-40 font-bold">{help.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black/5 p-8 md:p-12 rounded-[48px] border-4 border-black/5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
          <h2 className="text-3xl font-black text-black">اختر 6 أصناف للعبة</h2>
          <span className={`px-6 py-2 rounded-full font-black text-sm ${selectedCats.length === 6 ? 'bg-black text-[#F7C705]' : 'bg-black/10 text-black/40'}`}>
            المختار: {selectedCats.length} / 6
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {CATEGORIES_CONFIG.map(cat => {
            const isSelected = selectedCats.includes(cat.name);
            const catQsCount = allQuestions.filter(q => q.category === cat.name).length;
            const gamesCount = Math.floor(catQsCount / 6);

            return (
              <button
                key={cat.name}
                onClick={() => toggleCategory(cat.name)}
                disabled={!isSelected && selectedCats.length >= 6}
                className={`
                  relative p-5 h-40 rounded-[35px] border-4 transition-all duration-300 text-center font-black overflow-hidden flex flex-col items-center justify-center gap-2
                  ${isSelected 
                    ? 'bg-black border-black text-[#F7C705] shadow-2xl scale-105' 
                    : 'bg-white/40 border-black/5 text-black/60 hover:border-black/20'
                  }
                  disabled:opacity-30 disabled:cursor-not-allowed
                `}
              >
                <span className="text-4xl">{cat.icon}</span>
                <div className="flex flex-col">
                  <span className="text-[10px] leading-tight mb-1">{cat.name}</span>
                  <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${isSelected ? 'bg-[#F7C705] text-black' : 'bg-black/10 text-black/60'}`}>
                    {gamesCount} ألعاب متاحة
                  </div>
                </div>
                {isSelected && (
                  <CheckCircle2 className="absolute top-4 left-4 text-[#F7C705]/50" size={18} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-16 flex justify-center">
        <button
          onClick={handleStart}
          disabled={selectedCats.length !== 6}
          className={`
            px-20 py-6 rounded-3xl text-2xl font-black transition-all transform hover:scale-105 active:scale-95 shadow-2xl
            ${selectedCats.length === 6
              ? 'bg-black text-[#F7C705] hover:shadow-black/20'
              : 'bg-black/10 text-black/20 cursor-not-allowed'
            }
          `}
        >
          ابدأ التحدي الآن
        </button>
      </div>
    </motion.div>
  );
};

export default Setup;
