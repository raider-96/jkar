import React, { useState } from 'react';
import { CATEGORIES_CONFIG } from '../data/questions';
import { motion } from 'framer-motion';
import { Users, CheckCircle2, Trophy, HelpCircle, ShieldAlert, Sparkles, Clock, Phone, Bomb, Shuffle, Ghost } from 'lucide-react';

// تأكدي من مطابقة الواجهة (Interface) لما يطلبه App.tsx تماماً
interface SetupProps {
  onSetupComplete: (teams: [string, string], categories: string[]) => void; 
  allQuestions: any[];
  isAdmin: boolean;
  onOpenAdmin: () => void;
}

const HELP_STYLES = {
  think: {
    icon: Clock,
    name: 'خل أفكر',
    desc: 'تعطي الفريق 60 ثانية للإجابة',
    color: 'bg-yellow-400 border-yellow-500 text-black',
    selected: 'ring-4 ring-yellow-200'
  },
  phone: {
    icon: Phone,
    name: 'أريد أخبار',
    desc: 'إيقاف الوقت، ثم استئنافه بـ 40 ثانية',
    color: 'bg-orange-500 border-orange-600 text-white',
    selected: 'ring-4 ring-orange-300'
  },
  destruction: {
    icon: Bomb,
    name: 'تفليش',
    desc: 'إذا جاوبتم صح، الخصم ينقص نقاط السؤال',
    color: 'bg-red-600 border-red-700 text-white',
    selected: 'ring-4 ring-red-300'
  },
  change: {
    icon: Shuffle,
    name: 'شوفلي غيرة',
    desc: 'تبديل السؤال بنفس المستوى وتجديد الوقت',
    color: 'bg-blue-500 border-blue-600 text-white',
    selected: 'ring-4 ring-blue-200'
  },
  thief: {
    icon: Ghost,
    name: 'حرامي',
    desc: 'سرقة سؤال الخصم القادم',
    color: 'bg-green-500 border-green-600 text-white',
    selected: 'ring-4 ring-green-200'
  }
} as const;

type HelpType = keyof typeof HELP_STYLES;

const HELPS_LIST: { type: HelpType }[] = [
  { type: 'think' },
  { type: 'phone' },
  { type: 'destruction' },
  { type: 'change' },
  { type: 'thief' }
];

const Setup: React.FC<SetupProps> = ({ onSetupComplete, allQuestions, isAdmin, onOpenAdmin }) => {
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
    // إرسال مصفوفة الأسماء البسيطة [team1, team2] مباشرة لتتوافق مع الـ Handler في App.tsx وعمل سيت لوسائل المساعدة
    if (selectedCats.length === 6 && team1Helps.length === 3 && team2Helps.length === 3) {
      
      // حفظ المساعدات محلياً في الـ LocalStorage للفريقين لكي يتم قراءتها داخل شاشة الـ Game مباشرة دون كسر الـ Props الافتراضية للـ App
      localStorage.setItem('team1_helps', JSON.stringify(team1Helps));
      localStorage.setItem('team2_helps', JSON.stringify(team2Helps));

      // استدعاء الدالة بنفس الشكل المتوقع في السطر 420 لملف App.tsx
      onSetupComplete([team1, team2], selectedCats);
    }
  };

  const isGameReady = selectedCats.length === 6 && team1Helps.length === 3 && team2Helps.length === 3;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto p-6 rtl pb-20 text-right"
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
            <li className="flex gap-3"><span className="text-yellow-500">●</span> الفائز هو الفريق الذي يجمع أكبر عدد من النقاط.</li>
          </ul>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* الفريق الأول */}
        <div className="bg-white/60 p-8 rounded-[40px] border-4 border-black/5 space-y-6 shadow-2xl relative">
          <Users size={32} className="absolute top-6 right-6 text-black/10 z-0" />
          <div className="space-y-4 relative z-10">
            <label className="block text-black font-black mb-2 flex items-center gap-2 uppercase tracking-wide">
              اسم الفريق الأول
            </label>
            <input
              type="text"
              value={team1}
              onChange={(e) => setTeam1(e.target.value)}
              className="w-full bg-black border-4 border-black rounded-3xl py-5 px-6 outline-none text-[#F7C705] font-black text-xl transition-all"
            />
          </div>
          <div className="space-y-4 relative z-10">
            <h3 className="text-sm font-black text-black/60 uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={16} /> اختر 3 وسائل مساعدة ({team1Helps.length} / 3)
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {HELPS_LIST.map(({ type }) => {
                const style = HELP_STYLES[type];
                const Icon = style.icon;
                const isSelected = team1Helps.includes(type);
                const isMaxed = team1Helps.length >= 3 && !isSelected;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleHelp(1, type)}
                    disabled={isMaxed}
                    className={`flex items-center gap-3 p-4 h-20 rounded-2xl border-4 text-right transition-all font-black shadow-lg disabled:opacity-30 disabled:cursor-not-allowed ${isSelected ? `${style.color} ${style.selected}` : 'bg-white/70 border-black/10 text-black'}`}
                  >
                    <Icon size={24} className={isSelected ? '' : 'text-black/40'} />
                    <div>
                      <div className="text-base leading-tight">{style.name}</div>
                      <div className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-black/50'}`}>{style.desc}</div>
                    </div>
                    {isSelected && <CheckCircle2 size={20} className="mr-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* الفريق الثاني */}
        <div className="bg-white/60 p-8 rounded-[40px] border-4 border-black/5 space-y-6 shadow-2xl relative">
          <Users size={32} className="absolute top-6 right-6 text-black/10 z-0" />
          <div className="space-y-4 relative z-10">
            <label className="block text-black font-black mb-2 flex items-center gap-2 uppercase tracking-wide">
              اسم الفريق الثاني
            </label>
            <input
              type="text"
              value={team2}
              onChange={(e) => setTeam2(e.target.value)}
              className="w-full bg-black border-4 border-black rounded-3xl py-5 px-6 outline-none text-[#F7C705] font-black text-xl transition-all"
            />
          </div>
          <div className="space-y-4 relative z-10">
            <h3 className="text-sm font-black text-black/60 uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={16} /> اختر 3 وسائل مساعدة ({team2Helps.length} / 3)
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {HELPS_LIST.map(({ type }) => {
                const style = HELP_STYLES[type];
                const Icon = style.icon;
                const isSelected = team2Helps.includes(type);
                const isMaxed = team2Helps.length >= 3 && !isSelected;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleHelp(2, type)}
                    disabled={isMaxed}
                    className={`flex items-center gap-3 p-4 h-20 rounded-2xl border-4 text-right transition-all font-black shadow-lg disabled:opacity-30 disabled:cursor-not-allowed ${isSelected ? `${style.color} ${style.selected}` : 'bg-white/70 border-black/10 text-black'}`}
                  >
                    <Icon size={24} className={isSelected ? '' : 'text-black/40'} />
                    <div>
                      <div className="text-base leading-tight">{style.name}</div>
                      <div className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-black/50'}`}>{style.desc}</div>
                    </div>
                    {isSelected && <CheckCircle2 size={20} className="mr-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* أصناف اللعبة واضحة وبدون أسماء */}
      <div className="bg-black/5 p-8 md:p-12 rounded-[48px] border-4 border-black/5 shadow-inner">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
          <h2 className="text-3xl font-black text-black">اختر 6 أصناف للعبة</h2>
          <span className={`px-6 py-2 rounded-full font-black text-sm ${selectedCats.length === 6 ? 'bg-black text-[#F7C705]' : 'bg-black/10 text-black/40'}`}>
            المختار: {selectedCats.length} / 6
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {CATEGORIES_CONFIG.map(cat => {
            const isSelected = selectedCats.includes(cat.name);
            const catQsCount = allQuestions ? allQuestions.filter(q => q.category === cat.name).length : 0;
            const gamesCount = Math.floor(catQsCount / 6);

            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => toggleCategory(cat.name)}
                disabled={!isSelected && selectedCats.length >= 6}
                className={`
                  relative h-44 rounded-[40px] border-4 transition-all duration-300 text-center font-black overflow-hidden flex flex-col items-center justify-center
                  ${isSelected 
                    ? 'bg-black border-black text-[#F7C705] shadow-2xl scale-105' 
                    : 'bg-white border-black/10 text-black hover:border-black/30 hover:bg-white'
                  }
                  disabled:opacity-30 disabled:cursor-not-allowed shadow-lg
                `}
              >
                <div className="absolute inset-0 z-0">
                  <img 
                    src={cat.icon} 
                    alt="" 
                    className="w-full h-full object-cover opacity-60" 
                  />
                  <div className={`absolute inset-0 ${isSelected ? 'bg-black/70' : 'bg-white/40'}`} />
                </div>

                <div className="relative z-10 w-full h-full flex flex-col justify-end items-center p-5">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${isSelected ? 'bg-[#F7C705] text-black' : 'bg-black text-white'}`}>
                    {gamesCount} ألعاب متاحة
                  </div>
                </div>
                
                {isSelected && (
                  <CheckCircle2 className="absolute top-4 left-4 text-[#F7C705] z-20" size={24} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-16 flex justify-center">
        <button
          onClick={handleStart}
          disabled={!isGameReady}
          className={`
            px-20 py-6 rounded-3xl text-2xl font-black transition-all transform hover:scale-105 active:scale-95 shadow-2xl
            ${isGameReady
              ? 'bg-black text-[#F7C705] hover:shadow-black/20 cursor-pointer'
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