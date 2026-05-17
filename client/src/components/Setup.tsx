import React, { useState } from 'react';
import { CATEGORIES_CONFIG } from '../data/questions';
import { motion } from 'framer-motion';
import { Users, CheckCircle2, Trophy, HelpCircle, ShieldAlert } from 'lucide-react';

// 1. دمج جميع الخصائص في واجهة واحدة متكاملة بدون تكرار
interface SetupProps {
  onSetupComplete: (teams: [string, string], categories: string[]) => void;
  allQuestions: any[];
  isAdmin: boolean;
  onOpenAdmin: () => void;
}

// 2. تحديث الخصائص المستلمة في الكومبوننت لتطابق الواجهة
const Setup: React.FC<SetupProps> = ({ onSetupComplete, isAdmin, onOpenAdmin }) => {
  const [team1, setTeam1] = useState('الفريق الأول');
  const [team2, setTeam2] = useState('الفريق الثاني');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [showRules, setShowRules] = useState(false);

  const toggleCategory = (cat: string) => {
    if (selectedCats.includes(cat)) {
      setSelectedCats(selectedCats.filter(c => c !== cat));
    } else if (selectedCats.length < 6) {
      setSelectedCats([...selectedCats, cat]);
    }
  };

  // 3. تحديث الدالة لترسل البيانات للـ App.tsx عبر الهيكل الجديد المتوقع (Tuple)
  const handleStart = () => {
    if (selectedCats.length === 6) {
      onSetupComplete([team1, team2], selectedCats);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto p-6 rtl"
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
            <li className="flex gap-3"><span className="text-yellow-500">●</span> كل فريق يختار 3 أصناف يتميز فيها(المجموع 6 أصناف للعبة).</li>
            <li className="flex gap-3"><span className="text-yellow-500">●</span> لكل صنف 3 مستويات صعوبة: سهل (100)، متوسط (200)، صعب (400).</li>
            <li className="flex gap-3"><span className="text-yellow-500">●</span> كل مستوى صعوبة يحتوي على سؤالين .</li>
            <li className="flex gap-3"><span className="text-yellow-500">●</span>عند انتهاء وقت الفريق الاول يحق للفريق الثاني تقديم اجابة ايضا وعندة انتهاء الوقت الفريق صاحب الاجابة الصحيحة ياخذ النقاط .</li>
            <li className="flex gap-3"><span className="text-yellow-500">●</span> الفائز هو الفريق الذي يجمع أكبر عدد من النقاط.</li>
          </ul>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="space-y-4">
          <label className="block text-black font-black mb-2 flex items-center gap-2 uppercase tracking-wide">
            <Users size={20} className="text-black/40" /> اسم الفريق الأول
          </label>
          <input
            type="text"
            value={team1}
            onChange={(e) => setTeam1(e.target.value)}
            className="w-full bg-white/50 border-4 border-black/10 rounded-3xl py-5 px-6 focus:border-black outline-none text-black font-black text-xl transition-all"
            placeholder="أدخل اسم الفريق..."
          />
        </div>
        <div className="space-y-4">
          <label className="block text-black font-black mb-2 flex items-center gap-2 uppercase tracking-wide">
            <Users size={20} className="text-black/40" /> اسم الفريق الثاني
          </label>
          <input
            type="text"
            value={team2}
            onChange={(e) => setTeam2(e.target.value)}
            className="w-full bg-white/50 border-4 border-black/10 rounded-3xl py-5 px-6 focus:border-black outline-none text-black font-black text-xl transition-all"
            placeholder="أدخل اسم الفريق..."
          />
        </div>
      </div>

      <div className="bg-black/5 p-8 md:p-12 rounded-[48px] border-4 border-black/5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
          <h2 className="text-3xl font-black text-black">اختر 6 أصناف للعبة</h2>
          <span className={`px-6 py-2 rounded-full font-black text-sm ${selectedCats.length === 6 ? 'bg-black text-[#F7C705]' : 'bg-black/10 text-black/40'}`}>
            المختار: {selectedCats.length} / 6
          </span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {CATEGORIES_CONFIG.map(cat => {
            const isSelected = selectedCats.includes(cat.name);
            return (
              <button
                key={cat.name}
                onClick={() => toggleCategory(cat.name)}
                disabled={!isSelected && selectedCats.length >= 6}
                className={`
                  relative h-40 rounded-[32px] border-4 transition-all duration-300 overflow-hidden flex items-center justify-center
                  ${isSelected 
                    ? 'bg-black border-black shadow-2xl scale-105 -rotate-2' 
                    : 'bg-white/40 border-black/5 hover:border-black/20 hover:bg-white/60'
                  }
                  disabled:opacity-30 disabled:cursor-not-allowed
                `}
              >
                <img 
                  src={cat.icon} 
                  alt={cat.name} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                />
                
                {isSelected && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                     <CheckCircle2 className="text-[#F7C705]" size={40} />
                  </div>
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