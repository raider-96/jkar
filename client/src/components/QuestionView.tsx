import React, { useState, useEffect } from 'react';
import { Timer, CheckCircle, XCircle, Eye, Image as ImageIcon } from 'lucide-react';

interface QuestionViewProps {
  question: any; // مرونة تامة لقراءة image أو imageUrl القادمة من السيرفر
  teams: [string, string];
  currentTurn: 0 | 1;
  onAnswer: (winnerIndex: number | null) => void;
  initialBonusTime?: number;
  hasChangeHelpline?: boolean;
  onSkipQuestion?: () => void;
}

const QuestionView: React.FC<QuestionViewProps> = ({ 
  question, 
  teams, 
  currentTurn, 
  onAnswer,
  initialBonusTime = 0,
  hasChangeHelpline = true,
  onSkipQuestion
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  
  // ضبط الوقت (999 تعني وقت مفتوح عند الاتصال بصديق)
  const [timeLeft, setTimeLeft] = useState(initialBonusTime === 999 ? 999 : 30 + initialBonusTime);

  // إعادة ضبط الوقت عند تغيير السؤال
  useEffect(() => {
    setTimeLeft(initialBonusTime === 999 ? 999 : 30 + initialBonusTime);
    setShowAnswer(false);
  }, [initialBonusTime, question]);

  // عداد الوقت التنازلي
  useEffect(() => {
    if (timeLeft > 0 && timeLeft !== 999 && !showAnswer) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showAnswer) {
      setShowAnswer(true);
    }
  }, [timeLeft, showAnswer]);

  // قراءة رابط الصورة بذكاء سواء كان الحقل باسم image أو imageUrl
  const rawImage = question.image || question.imageUrl || null;
  const isImageChallenge = question.category === 'تحدي تخمين الصورة' || !!rawImage;

  const getChallengeIcon = () => {
    return isImageChallenge ? <ImageIcon size={20} /> : <Timer size={20} />;
  };

  const getChallengeLabel = () => {
    return isImageChallenge ? 'تحدي تخمين الصورة' : `سؤال: ${question.category}`;
  };

  const imageUrl = rawImage
    ? (rawImage.startsWith('http') ? rawImage : `${window.location.origin}${rawImage}`)
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 md:p-6 rtl select-none">
      <div className="bg-[#F7C705] border-4 border-black w-full max-w-4xl h-[92vh] rounded-[36px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden text-black animate-in zoom-in-95 duration-200">
        
        {/* شريط معلومات الوقت والدور العلوي */}
        <div className="bg-black text-white px-6 py-4 flex justify-between items-center border-b-4 border-black shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${timeLeft <= 10 && timeLeft !== 999 ? 'bg-red-500 animate-ping' : 'bg-green-500'}`} />
            <div className="text-lg font-black">
              {timeLeft === 999 ? '📞 تم تجميد الوقت (اتصال بصديق)' : `⏱️ المتبقي: ${timeLeft} ثانية`}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#F7C705] font-bold block opacity-60 leading-none">فريق الدور الحالي</span>
            <span className="text-lg font-black text-[#F7C705]">{teams[currentTurn]}</span>
          </div>
        </div>

        {/* جسم الكرت الداخلي */}
        <div className="p-6 md:p-8 text-center overflow-y-auto flex-1 flex flex-col items-center gap-4">
          
          {/* أزرار وسائل المساعدة التكتيكية الثلاثة داخل السؤال */}
          <div className="flex flex-wrap justify-center gap-2 mb-1 shrink-0">
            <button
              onClick={() => {
                if (timeLeft !== 999) {
                  setTimeLeft(prev => prev + 60);
                  alert('⏱️ خل افكر: تم تمديد الوقت بـ 60 ثانية إضافية!');
                }
              }}
              disabled={timeLeft === 999 || showAnswer}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white border-2 border-black font-black px-3 py-1.5 rounded-xl text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
            >
              ⏱️ خل افكر (+دقيقة)
            </button>

            <button
              onClick={() => {
                setTimeLeft(999);
                alert('📞 اريد اخابر: تم إيقاف العداد، ناقش صديقك براحتك الآن!');
              }}
              disabled={timeLeft === 999 || showAnswer}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white border-2 border-black font-black px-3 py-1.5 rounded-xl text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
            >
              📞 اريد اخابر
            </button>

            {onSkipQuestion && (
              <button
                onClick={() => {
                  if (confirm("هل تريد سحب كرت آخر واستبدال هذا السؤال فوراً؟")) {
                    onSkipQuestion();
                  }
                }}
                disabled={!hasChangeHelpline || showAnswer}
                className={`text-white border-2 border-black font-black px-3 py-1.5 rounded-xl text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all ${
                  hasChangeHelpline ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-400 opacity-40 cursor-not-allowed'
                }`}
              >
                🔄 شوفلي غيرة
              </button>
            )}
          </div>

          {/* شارة صنف التحدي والنقاط */}
          <div className="flex items-center gap-2 bg-black text-[#F7C705] px-5 py-2 rounded-full text-xs font-black shadow-md shrink-0">
            {getChallengeIcon()}
            <span>{getChallengeLabel()} • {question.points} نقطة</span>
          </div>

          {/* عرض صورة التحدي بدون تشويه */}
          {imageUrl && (
            <div className="w-full max-w-sm h-48 overflow-hidden rounded-2xl border-4 border-black bg-white shadow-md shrink-0">
              <img 
                src={imageUrl} 
                alt="Challenge View" 
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  console.error("فشل تحميل مسار الصورة:", imageUrl);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* نص السؤال الرئيسي */}
          <h2 className="text-xl md:text-3xl font-black text-black leading-snug max-w-2xl my-auto px-2">
            {question.question}
          </h2>

          {/* صندوق عرض الإجابة */}
          <div className="w-full max-w-xl mt-auto pt-2">
            {!showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                className="flex items-center gap-2 mx-auto bg-black hover:bg-black/90 text-[#F7C705] border-2 border-black px-6 py-2.5 rounded-xl font-black text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] active:translate-y-0.5 transition-all"
              >
                <Eye size={20} />
                <span>إظهار الإجابة</span>
              </button>
            ) : (
              <div className="bg-black text-[#F7C705] p-4 rounded-2xl border-4 border-black font-black text-xl md:text-2xl relative shadow-lg animate-in fade-in duration-300">
                <span className="absolute -top-3 right-4 bg-[#F7C705] text-black border-2 border-black text-[10px] px-2 py-0.5 rounded-full font-bold">
                  الإجابة الصحيحة
                </span>
                <p className="tracking-wide select-text">{question.answer}</p>
              </div>
            )}
          </div>
        </div>

        {/* أزرار التحكيم واحتساب النقاط السفليّة */}
        <div className="bg-white/95 border-t-4 border-black p-4 flex flex-col sm:flex-row justify-center items-center gap-3 shrink-0">
          <span className="text-xs font-black opacity-70">من فاز بنقاط الكرت؟</span>
          
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => onAnswer(0)}
              className="bg-black hover:bg-black/90 text-white font-black px-5 py-2 rounded-xl border-2 border-black flex items-center gap-2 text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
            >
              <CheckCircle size={16} className="text-green-400" />
              {teams[0]}
            </button>

            <button
              onClick={() => onAnswer(1)}
              className="bg-black hover:bg-black/90 text-white font-black px-5 py-2 rounded-xl border-2 border-black flex items-center gap-2 text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
            >
              <CheckCircle size={16} className="text-green-400" />
              {teams[1]}
            </button>

            <button
              onClick={() => onAnswer(null)}
              className="bg-gray-200 hover:bg-gray-300 text-black font-black px-5 py-2 rounded-xl border-2 border-black flex items-center gap-2 text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
            >
              <XCircle size={16} className="text-red-500" />
              تجاوز بدون نقاط
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuestionView;