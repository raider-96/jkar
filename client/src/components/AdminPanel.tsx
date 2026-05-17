import React, { useState } from 'react';
import { UserAccount, Question, Difficulty } from '../types';
import { UserPlus, UserX, UserCheck, Shield, ArrowLeft, PlusCircle, Trash2, List } from 'lucide-react';
import { CATEGORIES } from '../data/questions';

interface AdminPanelProps {
  users: UserAccount[];
  onAddUser: (username: string, password?: string) => void;
  onDeleteUser: (username: string) => void;
  onToggleUser: (username: string) => void;
  questions: Question[];
  onAddQuestion: (q: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  users, onAddUser, onDeleteUser, onToggleUser, 
  questions, onAddQuestion, onDeleteQuestion, 
  onBack 
}) => {
  const [tab, setTab] = useState<'users' | 'challenges'>('users');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');


  // تهيئة الحقول الجديدة بدون خانة نوع التحدي، ومع دعم صورة السؤال وصورة الجواب
  const [newQ, setNewQ] = useState<Partial<Question>>({
    category: CATEGORIES[0],
    difficulty: 'easy',
    points: 100,
    questionImage: '', // حقل صورة السؤال
    answerImage: ''    // حقل صورة الجواب التوضيحية
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.trim()) {
      onAddUser(newUsername.trim(), newPassword.trim());
      setNewUsername('');
      setNewPassword('');
    }
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQ.question && newQ.answer) {
      const q: Question = {
        ...newQ as Question,
        id: `custom-${Date.now()}`,
        points: newQ.difficulty === 'easy' ? 100 : newQ.difficulty === 'medium' ? 200 : 400
      };
      onAddQuestion(q);
      // تفريغ الحقول والصور بعد الإضافة مباشرة
      setNewQ({ 
        category: newQ.category, 
        difficulty: newQ.difficulty, 
        points: 100, 
        question: '', 
        answer: '', 
        questionImage: '', 
        answerImage: '' 
      });
    }
  };

  // دالة مساعدة لرفع ومعالجة الصور وتحويلها إلى Base64
  const handleImageUpload = (file: File, field: 'questionImage' | 'answerImage') => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const base64 = readerEvent.target?.result as string;
      setNewQ(prev => ({ ...prev, [field]: base64 }));
    };
    reader.readAsDataURL(file);
  };

  
{/* 🗂️ قسم التحديات المضافة الذكي والمنظم بالأصناف */}
<div className="mt-12 bg-black/5 p-6 rounded-3xl border-2 border-black/10">
  
  {/* الهيدر الديناميكي للقائمة */}
  <div className="flex items-center justify-between mb-6 rtl">
    <div className="flex items-center gap-3">
      <span className="text-2xl font-black">📋 التحديات المضافة</span>
      {selectedCategory && (
        <span className="bg-black text-[#F7C705] text-sm font-black px-3 py-1 rounded-full">
          صنف: {selectedCategory}
        </span>
      )}
    </div>

    {/* زر العودة للأصناف يظهر فقط عند الدخول داخل صنف معين */}
    {selectedCategory && (
      <button
        onClick={() => setSelectedCategory(null)}
        className="flex items-center gap-1.5 bg-black text-[#F7C705] font-black px-3 py-1.5 rounded-lg text-xs hover:scale-105 transition-all"
      >
        <span>🔙 العودة للأصناف</span>
      </button>
    )}
  </div>

  {/* 1️⃣ العرض الأول: عرض بطاقات الأصناف (Categories Grid) */}
  {!selectedCategory ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 rtl">
      {/* استخراج الأصناف الفريدة المتاحة في الأسئلة الحالية تلقائياً */}
      {Array.from(new Set(questions.map((q: any) => q.category))).map((cat: string) => {
        // حساب عدد الأسئلة المتوفرة داخل هذا الصنف بالتحديد
        const count = questions.filter((q: any) => q.category === cat).length;
        
        return (
          <div
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className="bg-white border-4 border-black p-5 rounded-2xl cursor-pointer hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] transition-all flex justify-between items-center group"
          >
            <div className="flex flex-col text-right">
              <span className="font-black text-lg group-hover:text-amber-600 transition-colors">{cat || "بدون صنف"}</span>
              <span className="text-xs text-gray-500 font-bold">{count} تحديات متوفرة</span>
            </div>
            <span className="text-2xl group-hover:translate-x-1 transition-transform">📂</span>
          </div>
        );
      })}

      {questions.length === 0 && (
        <div className="col-span-full text-center py-8 text-gray-500 font-bold">
          📭 لا توجد أي تحديات مضافة في قاعدة البيانات حالياً.
        </div>
      )}
    </div>
  ) : (
    /* 2️⃣ العرض الثاني: أسئلة الصنف المحدد فقط عند الدخول إليه */
    <div className="space-y-3 rtl">
      {questions
        .filter((q: any) => q.category === selectedCategory)
        .map((q: any) => (
          <div 
            key={q._id || q.id} 
            className="bg-white border-4 border-black p-4 rounded-2xl flex justify-between items-center shadow-md animate-in fade-in duration-300"
          >
            {/* زر الحذف الفردي من السيرفر والمحلي المتناسق مع دالتك الفعالة */}
            <button 
              onClick={() => onDeleteQuestion(q._id || q.id)}
              className="bg-red-100 hover:bg-red-500 hover:text-white text-red-500 p-2.5 rounded-xl transition-all active:scale-95 border-2 border-transparent hover:border-black"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>

            {/* تفاصيل التحدي المعروض */}
            <div className="flex flex-col text-right gap-1">
              <div className="flex items-center gap-2 justify-end">
                <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded border border-amber-300">
                  ⭐ {q.points || 100} نقطة
                </span>
                <span className="bg-gray-100 text-gray-800 text-[10px] font-black px-2 py-0.5 rounded border border-gray-300">
                  ⚙️ {q.difficulty === 'easy' ? 'سهل' : q.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                </span>
              </div>
              <p className="font-black text-black text-base mt-1">{q.question}</p>
              {q.answer && (
                <p className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded inline-block self-end mt-1">
                  💡 الإجابة: {q.answer}
                </p>
              )}
            </div>
          </div>
        ))}

      {questions.filter((q: any) => q.category === selectedCategory).length === 0 && (
        <div className="text-center py-6 text-gray-500 font-bold">
          الصنف فارغ حالياً بعد إتمام عمليات الحذف.
        </div>
      )}
    </div>
  )}

</div>

  return (
    <div className="max-w-6xl mx-auto p-6 rtl pb-24 text-right">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-4xl font-black text-black flex items-center gap-3">
          <Shield className="text-black" size={40} /> لوحة الإدارة
        </h1>
        <div className="flex gap-2 bg-black/5 p-2 rounded-2xl">
          <button 
            onClick={() => setTab('users')}
            className={`px-6 py-2 rounded-xl font-black transition-all ${tab === 'users' ? 'bg-black text-[#F7C705]' : 'text-black/60'}`}
          >
            المستخدمين
          </button>
          <button 
            onClick={() => setTab('challenges')}
            className={`px-6 py-2 rounded-xl font-black transition-all ${tab === 'challenges' ? 'bg-black text-[#F7C705]' : 'text-black/60'}`}
          >
            التحديات
          </button>
        </div>
        <button onClick={onBack} className="flex items-center gap-2 bg-black text-[#F7C705] px-6 py-2 rounded-xl font-black hover:scale-105 transition-all">
          <ArrowLeft size={20} /> العودة للعبة
        </button>
      </div>

      {tab === 'users' ? (
        <div className="space-y-10">
          <div className="bg-black text-[#F7C705] rounded-[40px] p-10 shadow-2xl border-4 border-black/5">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
              <UserPlus className="text-[#F7C705]" /> إضافة مستخدم جديد
            </h2>
            <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="bg-[#1A1A1A] border-2 border-[#F7C705]/20 rounded-[24px] px-8 py-5 text-[#F7C705] text-xl font-black outline-none focus:border-[#F7C705] transition-all"
                placeholder="اسم المستخدم"
                required
              />
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-[#1A1A1A] border-2 border-[#F7C705]/20 rounded-[24px] px-8 py-5 text-[#F7C705] text-xl font-black outline-none focus:border-[#F7C705] transition-all"
                placeholder="الرمز السري"
                required
              />
              <button type="submit" className="bg-[#F7C705] hover:scale-105 text-black px-8 py-5 rounded-[24px] font-black text-xl shadow-xl transition-all">
                إنشاء اليوزر
              </button>
            </form>
          </div>

          <div className="bg-black/5 rounded-[48px] p-10 border-4 border-black/5">
            <h2 className="text-2xl font-black text-black mb-10 flex items-center gap-2">
              <List size={24} /> قائمة المستخدمين ({users.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {users.map((u) => (
                <div key={u.username} className="flex items-center justify-between p-6 bg-white border-4 border-black/5 rounded-[32px] shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-5">
                    <div className={`w-4 h-4 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                    <div>
                      <p className="text-black text-xl font-black uppercase tracking-tighter">{u.username}</p>
                      <p className="text-[10px] text-black/40 font-bold">الرمز: {u.password || 'لا يوجد'}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => onToggleUser(u.username)}
                      className={`p-3 rounded-xl transition-all ${u.isActive ? 'text-amber-500 bg-amber-50 hover:bg-amber-500 hover:text-white' : 'text-green-500 bg-green-50 hover:bg-green-500 hover:text-white'}`}
                      title={u.isActive ? 'تعطيل' : 'تفعيل'}
                    >
                      {u.isActive ? <UserX size={24} /> : <UserCheck size={24} />}
                    </button>
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => onDeleteUser(u.username)}
                        className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all mr-4"
                        title="حذف"
                      >
                        <Trash2 size={24} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="bg-black text-[#F7C705] rounded-[40px] p-10 shadow-2xl border-4 border-black/5">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
              <PlusCircle className="text-[#F7C705]" /> إضافة تحدي جديد
            </h2>
            <form onSubmit={handleAddQuestion} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-black mr-2">الصنف</label>
                  <select 
                    value={newQ.category}
                    onChange={(e) => setNewQ({...newQ, category: e.target.value})}
                    className="w-full bg-[#1A1A1A] border-2 border-[#F7C705]/20 rounded-[24px] px-6 py-4 text-[#F7C705] font-black outline-none focus:border-[#F7C705]"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black mr-2">الصعوبة</label>
                  <select 
                    value={newQ.difficulty}
                    onChange={(e) => setNewQ({...newQ, difficulty: e.target.value as Difficulty})}
                    className="w-full bg-[#1A1A1A] border-2 border-[#F7C705]/20 rounded-[24px] px-6 py-4 text-[#F7C705] font-black outline-none focus:border-[#F7C705]"
                  >
                    <option value="easy">سهل (100)</option>
                    <option value="medium">متوسط (200)</option>
                    <option value="hard">صعب (400)</option>
                  </select>
                </div>
              </div>

              {/* قسم رفع الصور المطور: صورة السؤال وصورة الجواب */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. حقل رفع صورة السؤال */}
                <div className="space-y-2">
                  <label className="text-sm font-black mr-2">رفع صورة السؤال / الباركود (اختياري)</label>
                  <div className="flex flex-col gap-3">
                    <label className="w-full bg-[#1A1A1A] border-2 border-[#F7C705]/20 rounded-[24px] px-6 py-4 text-[#F7C705]/40 font-black cursor-pointer hover:border-[#F7C705] transition-all flex items-center justify-center gap-3">
                      <PlusCircle size={20} />
                      {newQ.questionImage ? '📸 تم اختيار صورة السؤال' : 'اختر صورة السؤال'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, 'questionImage');
                        }}
                      />
                    </label>
                    {newQ.questionImage && (
                      <div className="relative w-full h-32 rounded-2xl overflow-hidden border-2 border-[#F7C705]">
                        <img src={newQ.questionImage} className="w-full h-full object-contain bg-black/40" alt="Question Preview" />
                        <button 
                          type="button"
                          onClick={() => setNewQ({...newQ, questionImage: ''})}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. حقل رفع صورة الجواب */}
                <div className="space-y-2">
                  <label className="text-sm font-black mr-2">رفع صورة الجواب التوضيحية (اختياري)</label>
                  <div className="flex flex-col gap-3">
                    <label className="w-full bg-[#1A1A1A] border-2 border-[#F7C705]/20 rounded-[24px] px-6 py-4 text-[#F7C705]/40 font-black cursor-pointer hover:border-[#F7C705] transition-all flex items-center justify-center gap-3">
                      <PlusCircle size={20} />
                      {newQ.answerImage ? '📸 تم اختيار صورة الجواب' : 'اختر صورة الجواب'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, 'answerImage');
                        }}
                      />
                    </label>
                    {newQ.answerImage && (
                      <div className="relative w-full h-32 rounded-2xl overflow-hidden border-2 border-emerald-500">
                        <img src={newQ.answerImage} className="w-full h-full object-contain bg-black/40" alt="Answer Preview" />
                        <button 
                          type="button"
                          onClick={() => setNewQ({...newQ, answerImage: ''})}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* نص التحدي */}
              <div className="space-y-2">
                <label className="text-sm font-black mr-2">نص التحدي / السؤال</label>
                <textarea
                  value={newQ.question || ''}
                  onChange={(e) => setNewQ({...newQ, question: e.target.value})}
                  className="w-full bg-[#1A1A1A] border-2 border-[#F7C705]/20 rounded-[24px] px-6 py-4 text-[#F7C705] font-black outline-none focus:border-[#F7C705] h-32"
                  placeholder="اكتب التحدي هنا..."
                  required
                />
              </div>

              {/* الإجابة الصحيحة */}
              <div className="space-y-2">
                <label className="text-sm font-black mr-2">الإجابة</label>
                <input
                  type="text"
                  value={newQ.answer || ''}
                  onChange={(e) => setNewQ({...newQ, answer: e.target.value})}
                  className="w-full bg-[#1A1A1A] border-2 border-[#F7C705]/20 rounded-[24px] px-6 py-4 text-[#F7C705] font-black outline-none focus:border-[#F7C705]"
                  placeholder="الإجابة الصحيحة"
                  required
                />
              </div>

              <button type="submit" className="w-full bg-[#F7C705] hover:scale-[1.01] text-black px-8 py-5 rounded-[24px] font-black text-xl shadow-xl transition-all">
                إضافة التحدي للقاعدة
              </button>
            </form>
          </div>

          <div className="bg-black/5 rounded-[48px] p-10 border-4 border-black/5">
            <h2 className="text-2xl font-black text-black mb-10 flex items-center gap-2">
              <List size={24} /> التحديات المضافة 
              ({questions.filter((q: any) => q && ((q.id && typeof q.id === 'string' && q.id.startsWith('custom-')) || q._id)).length})
            </h2>
            <div className="space-y-4">
              {questions.filter((q: any) => q && ((q.id && typeof q.id === 'string' && q.id.startsWith('custom-')) || q._id)).reverse().map((q: any) => {
                const safeId = q._id || q.id;
                return (
                  <div key={safeId} className="flex items-center justify-between p-6 bg-white border-4 border-black/5 rounded-[32px] shadow-sm">
                    <div className="flex-1">
                      <div className="flex gap-2 mb-2">
                        <span className="bg-black text-[#F7C705] text-[10px] px-2 py-0.5 rounded font-black">{q.category}</span>
                        <span className="bg-black/10 text-black text-[10px] px-2 py-0.5 rounded font-black">
                          {q.questionImage || q.image ? '📸 يحتوي على صورة' : '📝 نصي'}
                        </span>
                      </div>
                      <p className="text-black font-black">{q.question}</p>
                    </div>
                    <button
                      onClick={() => onDeleteQuestion(safeId)}
                      className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all mr-4"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;