
import React, { useState } from 'react';
import { UserAccount, Question, Difficulty } from '../types';
import { UserPlus, UserX, UserCheck, Shield, ArrowLeft, PlusCircle, Trash2, List, Download, Upload, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { CATEGORIES } from '../data/questions';
///////////////////////////////////////////////////////
interface AdminPanelProps {
  onImportData: (data: string) => void;
  onExportData: () => void;
  users: UserAccount[];
  onAddUser: (username: string, password?: string) => void;
  onDeleteUser: (username: string) => void;
  onToggleUser: (username: string) => void;
  questions: Question[];
  onAddQuestion: (q: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onBack: () => void;
  onAddCategory: (name: string, icon: string) => Promise<boolean>; // 👈 أضفنا الصلاحية هنا
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  users,
  onAddUser,
  onDeleteUser,
  onToggleUser,
  questions,
  onAddQuestion,
  onDeleteQuestion,
  onImportData,
  onExportData,
  onBack,
  onAddCategory // 👈 استدعاء الدالة هنا
}) => {
////////////////////////////////////////////////////////////////////
  const [tab, setTab] = useState<'users' | 'challenges'>('users');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>(CATEGORIES[0]);

  const [newQ, setNewQ] = useState<Partial<Question>>({
    category: CATEGORIES[0],
    difficulty: 'easy',
    points: 100
  });

  const handleImageUpload = (type: 'q' | 'a', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const base64 = readerEvent.target?.result as string;
        if (type === 'q') setNewQ({...newQ, qImage: base64});
        else setNewQ({...newQ, aImage: base64});
      };
      reader.readAsDataURL(file);
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
      setNewQ({ ...newQ, question: '', answer: '', qImage: '', aImage: '' });
      alert('تمت إضافة التحدي!');
    }
  };
/////////////////////////
const AddCategoryForm: React.FC<{ onAddCategory: (name: string, icon: string) => Promise<boolean> }> = ({ onAddCategory }) => {
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName || !categoryIcon) {
      setMessage('الرجاء ملء جميع الحقول ⚠️');
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // استدعاء الدالة الممررة لحفظ الصنف في السيرفر
      const success = await onAddCategory(categoryName, categoryIcon);
      if (success) {
        setMessage('تم إضافة الصنف الجديد بنجاح! 🎉');
        setIsSuccess(true);
        setCategoryName('');
        setCategoryIcon('');
      } else {
        setMessage('حدث خطأ أثناء حفظ الصنف، قد يكون مكرراً! ❌');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('فشل الاتصال بالسيرفر 🔌');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md p-8 rounded-[32px] border-4 border-black shadow-2xl max-w-xl mx-auto text-right rtl mt-8">
      <div className="flex items-center gap-3 mb-6 border-b-4 border-black pb-3">
        <span className="text-3xl">📁</span>
        <h3 className="text-2xl font-black text-black">إضافة صنف (Category) جديد</h3>
      </div>
      
      {message && (
        <div className={`p-4 rounded-2xl mb-6 text-sm font-black text-center border-2 ${
          isSuccess 
            ? 'bg-green-100 border-green-400 text-green-800' 
            : 'bg-red-100 border-red-400 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-base font-black text-black mb-2">اسم الصنف الجديد</label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="مثال: مسلسلات إنمي، ألعاب فيديو..."
            className="w-full bg-black border-4 border-black rounded-2xl py-4 px-5 outline-none text-[#F7C705] font-black text-lg transition-all focus:ring-4 focus:ring-yellow-300"
          />
        </div>

        <div>
          <label className="block text-base font-black text-black mb-2">رابط صورة أو أيقونة الخلفية</label>
          <input
            type="text"
            value={categoryIcon}
            onChange={(e) => setCategoryIcon(e.target.value)}
            placeholder="https://jkar.vercel.app/categories/name.png"
            className="w-full bg-black border-4 border-black rounded-2xl py-4 px-5 outline-none text-[#F7C705] font-black text-lg text-left ltr transition-all focus:ring-4 focus:ring-yellow-300"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-5 rounded-2xl text-xl font-black transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl ${
            loading 
              ? 'bg-black/40 text-white/50 cursor-not-allowed' 
              : 'bg-black text-[#F7C705] hover:shadow-black/20'
          }`}
        >
          {loading ? 'جاري حفظ الصنف الجديد...' : 'إضافة الصنف إلى القائمة الآن'}
        </button>
      </form>
    </div>
  );
};
////////////////////////////////

  return (
    <div className="max-w-7xl mx-auto p-6 rtl pb-24">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex items-center gap-4">
           <div className="bg-black text-[#F7C705] p-3 rounded-2xl shadow-xl border-2 border-[#F7C705]/20">
             <Shield size={32} />
           </div>
           <h1 className="text-4xl font-black text-black tracking-tighter">لوحة الإدارة</h1>
        </div>
        
        <div className="flex gap-2 bg-black/5 p-2 rounded-3xl">
          <button onClick={() => setTab('users')} className={`px-8 py-3 rounded-2xl font-black transition-all ${tab === 'users' ? 'bg-black text-[#F7C705] shadow-lg' : 'text-black/40'}`}>المستخدمين</button>
          <button onClick={() => setTab('challenges')} className={`px-8 py-3 rounded-2xl font-black transition-all ${tab === 'challenges' ? 'bg-black text-[#F7C705] shadow-lg' : 'text-black/40'}`}>التحديات</button>
          //////////////////////
          <AddCategoryForm onAddCategory={onAddCategory} />
      //////////////////////////
   
        </div>

        <div className="flex gap-3">
          <button onClick={onExportData} className="bg-white border-4 border-black text-black px-6 py-3 rounded-2xl font-black hover:bg-black hover:text-[#F7C705] transition-all flex items-center gap-2"><Download size={20} />تصدير</button>
          <button onClick={onBack} className="bg-black text-[#F7C705] px-8 py-3 rounded-2xl font-black hover:scale-105 transition-all shadow-xl flex items-center gap-2"><ArrowLeft size={20} />عودة</button>
        </div>
      </div>

      {tab === 'users' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-8">
             <div className="bg-black text-[#F7C705] rounded-[40px] p-8 shadow-2xl border-4 border-black/5">
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3"><UserPlus /> إضافة يوزر</h2>
                <form onSubmit={(e) => { e.preventDefault(); onAddUser(newUsername, newPassword); setNewUsername(''); setNewPassword(''); }} className="space-y-4">
                   <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="w-full bg-[#1A1A1A] border-2 border-[#F7C705]/10 rounded-2xl px-6 py-4 text-[#F7C705] font-black outline-none focus:border-[#F7C705]" placeholder="اسم المستخدم" required />
                   <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-[#1A1A1A] border-2 border-[#F7C705]/10 rounded-2xl px-6 py-4 text-[#F7C705] font-black outline-none focus:border-[#F7C705]" placeholder="الرمز السري" required />
                   <button type="submit" className="w-full bg-[#F7C705] text-black py-4 rounded-2xl font-black text-xl shadow-xl hover:scale-[1.02] transition-all">إنشاء الآن</button>
                </form>
             </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-black/5 rounded-[50px] p-8 border-4 border-black/5">
               <h2 className="text-2xl font-black text-black mb-8 flex items-center gap-3"><List /> قائمة اليوزرات ({users.length})</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {users.map(u => (
                    <div key={u.username} className="bg-white p-6 rounded-[30px] border-4 border-black/5 flex items-center justify-between shadow-sm">
                       <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                          <div>
                             <p className="font-black text-lg leading-none">{u.username}</p>
                             <p className="text-[10px] text-black/40 font-bold mt-1">الرمز: {u.password}</p>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => onToggleUser(u.username)} className={`p-2.5 rounded-xl transition-all ${u.isActive ? 'bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white' : 'bg-green-50 text-green-500 hover:bg-green-500 hover:text-white'}`}>{u.isActive ? <UserX size={20} /> : <UserCheck size={20} />}</button>
                          {u.role !== 'admin' && <button onClick={() => onDeleteUser(u.username)} className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={20} /></button>}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
           <div className="bg-black text-[#F7C705] rounded-[50px] p-10 shadow-2xl">
              <h2 className="text-2xl font-black mb-10 flex items-center gap-3"><PlusCircle /> إضافة تحدي جديد</h2>
              <form onSubmit={handleAddQuestion} className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black opacity-60 mr-4">الصنف</label>
                      <select value={newQ.category} onChange={(e) => setNewQ({...newQ, category: e.target.value})} className="w-full bg-[#1A1A1A] border-2 border-[#F7C705]/20 rounded-3xl px-6 py-4 text-[#F7C705] font-black outline-none focus:border-[#F7C705]">
                         {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black opacity-60 mr-4">المستوى</label>
                      <select value={newQ.difficulty} onChange={(e) => setNewQ({...newQ, difficulty: e.target.value as Difficulty})} className="w-full bg-[#1A1A1A] border-2 border-[#F7C705]/20 rounded-3xl px-6 py-4 text-[#F7C705] font-black outline-none focus:border-[#F7C705]">
                         <option value="easy">سهل (100)</option>
                         <option value="medium">متوسط (200)</option>
                         <option value="hard">صعب (400)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <label className="bg-[#1A1A1A] border-2 border-[#F7C705]/10 rounded-3xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#F7C705] transition-all">
                          <ImageIcon className={newQ.qImage ? 'text-green-500' : 'text-[#F7C705]'} />
                          <span className="text-[10px] font-black text-center">{newQ.qImage ? 'تم رفع صورة السؤال' : 'صورة السؤال'}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('q', e)} />
                       </label>
                       <label className="bg-[#1A1A1A] border-2 border-[#F7C705]/10 rounded-3xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#F7C705] transition-all">
                          <CheckCircle className={newQ.aImage ? 'text-green-500' : 'text-[#F7C705]'} />
                          <span className="text-[10px] font-black text-center">{newQ.aImage ? 'تم رفع صورة الجواب' : 'صورة الجواب'}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('a', e)} />
                       </label>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <textarea value={newQ.question || ''} onChange={(e) => setNewQ({...newQ, question: e.target.value})} className="w-full bg-[#1A1A1A] border-2 border-[#F7C705]/20 rounded-3xl px-6 py-4 text-[#F7C705] font-black outline-none h-32" placeholder="نص السؤال..." required />
                    <textarea value={newQ.answer || ''} onChange={(e) => setNewQ({...newQ, answer: e.target.value})} className="w-full bg-[#1A1A1A] border-2 border-[#F7C705]/20 rounded-3xl px-6 py-4 text-[#F7C705] font-black outline-none h-32" placeholder="الجواب..." required />
                 </div>
                 <button type="submit" className="w-full bg-[#F7C705] text-black py-6 rounded-[30px] font-black text-2xl shadow-2xl hover:scale-[1.01] transition-all">إضافة التحدي للقاعدة</button>
              </form>
           </div>

           <div className="bg-black/5 rounded-[60px] p-10 border-4 border-black/5">
              <div className="flex justify-between items-center mb-10">
                 <h2 className="text-3xl font-black text-black">إدارة الأسئلة</h2>
                 <select value={selectedCatFilter} onChange={(e) => setSelectedCatFilter(e.target.value)} className="bg-white border-4 border-black/5 rounded-2xl px-6 py-2 font-black outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
              </div>
              <div className="space-y-4">
                 {questions.filter(q => q.category === selectedCatFilter).map(q => (
                    <div key={q.id} className="bg-white p-6 rounded-[35px] border-4 border-black/5 flex items-center justify-between shadow-sm">
                       <div className="flex-1">
                          <div className="flex gap-2 mb-2">
                             <span className="bg-black text-[#F7C705] text-[10px] px-3 py-1 rounded-full font-black uppercase">{q.difficulty}</span>
                             <span className="bg-black/5 text-black text-[10px] px-3 py-1 rounded-full font-black">ID: {q.id.split('-').pop()}</span>
                          </div>
                          <p className="text-black font-black text-lg line-clamp-2">{q.question}</p>
                       </div>
                       <button onClick={() => onDeleteQuestion(q.id)} className="p-4 rounded-[20px] bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all mr-6"><Trash2 size={24} /></button>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
