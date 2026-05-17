import React, { useState } from 'react';
import { Question } from '../types';
import { Eye, Check, X, HelpCircle, ImageIcon } from 'lucide-react';

interface QuestionViewProps {
  question: Question;
  teams: string[];
  currentTurn: number;
  onAnswer: (winnerIndex: number | null) => void;
}

const QuestionView: React.FC<QuestionViewProps> = ({ question, teams, currentTurn, onAnswer }) => {
  const [showAnswer, setShowAnswer] = useState(false);
// تخمين نوع التحدي بناءً على التصنيف لضمان عدم حدوث خطأ عند القراءة
  const currentCategory = question?.category || '';
  const isImageChallenge = currentCategory.includes('صور') || currentCategory.includes('تخمين');
  const isActingChallenge = currentCategory.includes('تمثيل') || currentCategory.includes('حركة');
  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 rtl text-white animate-in fade-in duration-300">
      
      {/* شريط علوي ذكي يوضح نوع التحدي المفتوح حالياً */}
      <div className="bg-[#F7C705] text-black px-6 py-2 rounded-full font-black text-sm mb-6 flex items-center gap-2 border-2 border-black shadow-lg">
        {isImageChallenge && <span>📸 تحدي تخمين الصور</span>}
        {isActingChallenge && <span>🎭 تحدي التمثيل والمسرح السري</span>}
        {!isImageChallenge && !isActingChallenge && <span>🧠 تحدي السؤال الثقافي</span>}
        <span className="bg-black text-[#F7C705] px-2 py-0.5 rounded-md text-xs">{question.points} نقطة</span>
      </div>

      {/* نص التحدي أو السؤال الأساسي في المنتصف */}
      <h2 className="text-3xl font-black text-center max-w-3xl mb-8 leading-relaxed tracking-wide">
        {question.question}
      </h2>

      {/* 🖼️ المرحلة الأولى: عرض صورة السؤال أو الباركود (تظهر فقط قبل كشف الإجابة) */}
      {!showAnswer && (question as any).questionImage && (
        <div className="mb-8 max-w-md w-full bg-white p-4 rounded-3xl border-4 border-[#F7C705] shadow-[0_20px_50px_rgba(247,199,5,0.2)] animate-in zoom-in-95 duration-300">
          <img 
            src={(question as any).questionImage || (question as any).image}
            alt="صورة التحدي الجاري" 
            className="max-h-64 w-full object-contain rounded-2xl mx-auto"
            onError={(e) => {
              // حماية في حال كان الرابط مكسوراً
              e.currentTarget.style.display = 'none';
            }}
          />
          {isActingChallenge && (
            <div className="bg-black text-[#F7C705] text-xs font-black text-center mt-3 py-1.5 px-3 rounded-xl border border-[#F7C705]/30">
              📲 خاص بالمتحدي: التقط الباركود بكاميرا هاتفك لبدء التمثيل سرياً!
            </div>
          )}
        </div>
      )}

      {/* 🖼️ المرحلة الثانية: عرض الإجابة النصية وصورة الإجابة التوضيحية (تظهر بعد الضغط على زر الكشف) */}
      {showAnswer && (
        <div className="flex flex-col items-center gap-6 max-w-md w-full text-center animate-in zoom-in-95 duration-300">
          {/* الإجابة النصية الصريحة */}
          <div className="bg-emerald-500 text-white font-black text-4xl px-12 py-3 rounded-2xl border-4 border-black shadow-2xl tracking-wide transform rotate-1">
            {question.answer}
          </div>
          
          {/* صورة الإجابة التوضيحية المدعومة من لوحة الإدارة */}
          {(question as any).answerImage && (
            <div className="w-full bg-white p-4 rounded-3xl border-4 border-emerald-400 shadow-[0_20px_50px_rgba(16,185,129,0.2)]">
              <img 
                src={(question as any).answerImage || (question as any).answerImg}
                alt="صورة تأكيد الإجابة" 
                className="max-h-64 w-full object-contain rounded-2xl mx-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* 🎛️ لوحة تحكم وإدارة نتيجة التحدي الحالي */}
      <div className="mt-12 w-full max-w-xl">
        {!showAnswer ? (
          <button 
            onClick={() => setShowAnswer(true)}
            className="w-full bg-[#F7C705] text-black hover:bg-[#d6ab04] px-8 py-4 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all border-4 border-black shadow-[0_8px_0_#000] active:translate-y-2 active:shadow-none"
          >
            <Eye size={24} />
            كشف الإجابة الصحيحة وإظهار الصور
          </button>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-300">
            <p className="text-center text-sm font-bold text-slate-400 mb-2">احتساب نقاط التحدي للفريق الفائز:</p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => onAnswer(0)} 
                className="bg-black text-[#F7C705] border-2 border-[#F7C705] hover:bg-emerald-500 hover:text-white hover:border-black px-4 py-3.5 rounded-xl font-black transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Check size={20} />
                {teams[0]}
              </button>
              <button 
                onClick={() => onAnswer(1)} 
                className="bg-black text-[#F7C705] border-2 border-[#F7C705] hover:bg-emerald-500 hover:text-white hover:border-black px-4 py-3.5 rounded-xl font-black transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Check size={20} />
                {teams[1]}
              </button>
            </div>
            <button 
              onClick={() => onAnswer(null)} 
              className="w-full bg-slate-800 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-black transition-all flex items-center justify-center gap-2 border-2 border-slate-700"
            >
              <X size={18} />
              لم يجب أحد (تجاوز بدون نقاط)
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default QuestionView;