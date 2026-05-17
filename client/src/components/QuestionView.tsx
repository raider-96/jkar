import React, { useState } from 'react';
import { Question } from '../types';

interface QuestionViewProps {
  question: Question;
  teams: string[];
  currentTurn: number;
  onAnswer: (winnerIndex: number | null) => void;
}

const QuestionView: React.FC<QuestionViewProps> = ({ question, teams, currentTurn, onAnswer }) => {
  const [showAnswer, setShowAnswer] = useState(false);

  // تأمين قراءة القسم لتجنب الأخطاء البرمجية
  const currentCategory = question?.category || '';
  const isActingChallenge = currentCategory.includes('تمثيل') || currentCategory.includes('حركة');

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 rtl text-white animate-in fade-in duration-300">
      
      {/* نص التحدي أو السؤال الأساسي في المنتصف */}
      <h2 className="text-3xl font-black text-center max-w-3xl mb-8 leading-relaxed">
        {question.question}
      </h2>

      {/* 🖼️ المرحلة الأولى: عرض صورة السؤال أو الباركود (تظهر فقط قبل كشف الإجابة) */}
      {!showAnswer && ((question as any).questionImage || (question as any).image) && (
        <div className="mb-8 max-w-md w-full bg-white p-4 rounded-2xl border-4 border-[#F7C705] shadow-2xl animate-in zoom-in-95 duration-300">
          <img 
            src={(question as any).questionImage || (question as any).image} 
            alt="صورة التحدي" 
            className="max-h-64 object-contain rounded-xl mx-auto" 
          />
          {isActingChallenge && (
            <p className="text-black text-xs font-black text-center mt-2">⚠️ خاص بالممثل: التقط الباركود السري لمعرفة التحدي!</p>
          )}
        </div>
      )}

      {/* 🖼️ المرحلة الثانية: عرض الإجابة النصية وصورة الإجابة التوضيحية (تظهر بعد الضغط على إظهار الجواب) */}
      {showAnswer && (
        <div className="space-y-6 text-center animate-in scale-up duration-300">
          <div className="text-[#F7C705] text-4xl font-black border-b-4 border-[#F7C705] pb-2 px-10 inline-block">
            {question.answer}
          </div>
          
          {((question as any).answerImage || (question as any).answerImg) && (
            <div className="max-w-md bg-white p-4 rounded-2xl border-4 border-emerald-500 shadow-2xl mx-auto">
              <img 
                src={(question as any).answerImage || (question as any).answerImg} 
                alt="صورة الإجابة التوضيحية" 
                className="max-h-64 object-contain rounded-xl mx-auto" 
              />
            </div>
          )}
        </div>
      )}

      {/* 🎛️ القائمة الكلاسيكية القديمة تماماً لضغط الأزرار واحتساب النقاط */}
      <div className="mt-12 flex gap-4">
        {!showAnswer ? (
          <button 
            onClick={() => setShowAnswer(true)}
            className="bg-[#F7C705] text-black px-8 py-3 rounded-xl font-black text-lg hover:scale-105 transition-transform"
          >
            👁️ إظهار الإجابة الصحيحة
          </button>
        ) : (
          <div className="flex gap-4">
            <button 
              onClick={() => onAnswer(0)} 
              className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-black hover:scale-105 transition-transform"
            >
              ✓ نقطة لـ {teams[0]}
            </button>
            <button 
              onClick={() => onAnswer(1)} 
              className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-black hover:scale-105 transition-transform"
            >
              ✓ نقطة لـ {teams[1]}
            </button>
            <button 
              onClick={() => onAnswer(null)} 
              className="bg-slate-700 text-white px-6 py-3 rounded-xl font-black hover:scale-105 transition-transform"
            >
              خطأ للطرفين
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default QuestionView;