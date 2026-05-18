
import React, { useState } from 'react';
import { UserAccount, Question, Difficulty, CategoryInfo } from '../types';
import { 
  UserPlus, UserX, UserCheck, Shield, ArrowLeft, PlusCircle, Trash2, 
  List, Download, Image as ImageIcon, CheckCircle, FolderPlus, 
  ChevronRight, Box
} from 'lucide-react';

interface AdminPanelProps {
  onImportData: (data: string) => void;
  onExportData: () => void;
  users: UserAccount[];
  onAddUser: (username: string, password?: string) => void;
  onDeleteUser: (username: string) => void;
  onToggleUser: (username: string) => void;
  categories: CategoryInfo[];
  onAddCategory: (cat: CategoryInfo) => void;
  onDeleteCategory: (name: string) => void;
  questions: Question[];
  onAddQuestion: (q: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  users, onAddUser, onDeleteUser, onToggleUser, 
  categories, onAddCategory, onDeleteCategory,
  questions, onAddQuestion, onDeleteQuestion, 
  onExportData, onBack 
}) => {
  const [tab, setTab] = useState<'users' | 'challenges' | 'categories' | 'cloud'>('challenges');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [sUrl, setSUrl] = useState(localStorage.getItem('supabase_url') || '');
  const [sKey, setSKey] = useState(localStorage.getItem('supabase_anon_key') || '');
  const [newCat, setNewCat] = useState<CategoryInfo>({ name: '', image: '' });
  const [selectedCatView, setSelectedCatView] = useState<string | null>(null);
  const saveCloudSettings = () => {
    localStorage.setItem('supabase_url', sUrl);
    localStorage.setItem('supabase_anon_key', sKey);
    alert('تم حفظ الإعدادات، يرجى إعادة تحميل الصفحة');
    window.location.reload();
  };

  const [newQ, setNewQ] = useState<Partial<Question>>({
    category: categories[0]?.name || '',
    difficulty: 'easy',
    points: 100
  });

  const handleCategoryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => {
        const base64 = re.target?.result as string;
        setNewCat({...newCat, image: base64});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (type: 'q' | 'a', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => {
        const base64 = re.target?.result as string;
        if (type === 'q') setNewQ({...newQ, qImage: base64});
        else setNewQ({...newQ, aImage: base64});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQ.question && newQ.answer) {
      onAddQuestion({
        ...newQ as Question,
        id: `custom-${Date.now()}`,
        points: newQ.difficulty === 'easy' ? 100 : newQ.difficulty === 'medium' ? 200 : 400
      });
      setNewQ({ ...newQ, question: '', answer: '', qImage: '', aImage: '' });
      alert('تمت إضافة التحدي!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 rtl pb-24">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex items-center gap-4">
           <div className="bg-black text-[#F7C705] p-3 rounded-2xl shadow-xl">
             <Shield size={32} />
           </div>
           <h1 className="text-4xl font-black text-black tracking-tighter">لوحة الإدارة</h1>
        </div>
        
           <div className="flex gap-2 bg-black/5 p-2 rounded-3xl overflow-x-auto max-w-full">
          <button onClick={() => { setTab('challenges'); setSelectedCatView(null); }} className={`px-6 py-3 rounded-2xl font-black transition-all shrink-0 ${tab === 'challenges' ? 'bg-black text-[#F7C705] shadow-lg' : 'text-black/40'}`}>التحديات</button>
          <button onClick={() => setTab('categories')} className={`px-6 py-3 rounded-2xl font-black transition-all shrink-0 ${tab === 'categories' ? 'bg-black text-[#F7C705] shadow-lg' : 'text-black/40'}`}>الأصناف</button>
          <button onClick={() => setTab('users')} className={`px-6 py-3 rounded-2xl font-black transition-all shrink-0 ${tab === 'users' ? 'bg-black text-[#F7C705] shadow-lg' : 'text-black/40'}`}>المستخدمين</button>
          <button onClick={() => setTab('cloud')} className={`px-6 py-3 rounded-2xl font-black transition-all shrink-0 ${tab === 'cloud' ? 'bg-black text-[#F7C705] shadow-lg' : 'text-black/40'}`}>السحابة 🌍</button>
        </div>

        <div className="flex gap-3">
          <button onClick={onExportData} className="bg-white border-4 border-black text-black px-6 py-3 rounded-2xl font-black hover:bg-black hover:text-[#F7C705] transition-all flex items-center gap-2 shrink-0"><Download size={20} />تصدير</button>
          <button onClick={onBack} className="bg-black text-[#F7C705] px-8 py-3 rounded-2xl font-black hover:scale-105 transition-all shadow-xl flex items-center gap-2 shrink-0"><ArrowLeft size={20} />عودة</button>
        </div>
      </div>

      {tab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1">
             <div className="bg-black text-[#F7C705] rounded-[40px] p-8 shadow-2xl">
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3"><FolderPlus /> إضافة صنف جديد</h2>
                <form onSubmit={(e) => { e.preventDefault(); if(newCat.name && newCat.image) { onAddCategory(newCat); setNewCat({name: '', image: ''}); } else if(!newCat.image) { alert('يرجى رفع صورة للصنف'); } }} className="space-y-4">
                   <input type="text" value={newCat.name} onChange={(e) => setNewCat({...newCat, name: e.target.value})} className="w-full bg-[#1A1A1A] border-2 border-[#F7C705]/10 rounded-2xl px-6 py-4 text-[#F7C705] font-black outline-none focus:border-[#F7C705]" placeholder="اسم الصنف" required />
                   
                   <label className="w-full bg-[#1A1A1A] border-2 border-dashed border-[#F7C705]/20 rounded-2xl py-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#F7C705] transition-all">
                      {newCat.image ? (
                        <img src={newCat.image} className="w-20 h-20 rounded-xl object-cover border-2 border-[#F7C705]" alt="Preview" />
                      ) : (
                        <>
                          <ImageIcon size={32} />
                          <span className="text-[10px] font-black opacity-40 uppercase">رفع صورة الصنف</span>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={handleCategoryImageUpload} />
                   </label>

                   <button type="submit" className="w-full bg-[#F7C705] text-black py-4 rounded-2xl font-black text-xl shadow-xl">إنشاء الصنف</button>
                </form>
             </div>
          </div>
          <div className="lg:col-span-2">
             <div className="bg-black/5 rounded-[50px] p-8 border-4 border-black/5">
                <h2 className="text-2xl font-black text-black mb-8">قائمة الأصناف ({categories.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {categories.map(cat => (
                     <div key={cat.name} className="bg-white p-4 rounded-[30px] border-4 border-black/5 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                           <img src={cat.image} className="w-16 h-16 rounded-[20px] object-cover border-2 border-black/5" alt={cat.name} />
                           <p className="font-black text-xl">{cat.name}</p>
                        </div>
                        <button onClick={() => { if(confirm('هل تريد حذف الصنف؟')) onDeleteCategory(cat.name); }} className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={20} /></button>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      )}

      {tab === 'challenges' && !selectedCatView && (
        <div className="space-y-10">
           <div className="bg-black text-[#F7C705] rounded-[50px] p-10 shadow-2xl">
              <h2 className="text-2xl font-black mb-10 flex items-center gap-3"><PlusCircle /> إضافة تحدي جديد</h2>
              <form onSubmit={handleAddQuestion} className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black opacity-60 mr-4">الصنف</label>
                      <select value={newQ.category} onChange={(e) => setNewQ({...newQ, category: e.target.value})} className="w-full bg-[#1A1A1A] border-2 border-[#F7C705]/20 rounded-3xl px-6 py-4 text-[#F7C705] font-black outline-none focus:border-[#F7C705]">
                         {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
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
                    <div className="grid grid-cols-2 gap-4 pt-6">
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
              <h2 className="text-3xl font-black text-black mb-10">إحصائيات الأصناف</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {categories.map(cat => {
                   const count = questions.filter(q => q.category === cat.name).length;
                   return (
                     <button 
                      key={cat.name} 
                      onClick={() => setSelectedCatView(cat.name)}
                      className="bg-white p-6 rounded-[40px] border-4 border-black/5 text-right flex items-center justify-between group hover:border-black transition-all shadow-sm"
                     >
                        <div className="flex items-center gap-5">
                           <img src={cat.image} className="w-16 h-16 rounded-[20px] object-cover" alt={cat.name} />
                           <div>
                              <p className="font-black text-lg">{cat.name}</p>
                              <p className="text-[10px] text-black/40 font-black uppercase tracking-tighter">{count} تحدي</p>
                           </div>
                        </div>
                        <ChevronRight className="text-black/20 group-hover:text-black transition-colors" />
                     </button>
                   );
                 })}
              </div>
           </div>
        </div>
      )}

      {tab === 'challenges' && selectedCatView && (
        <div className="animate-in fade-in slide-in-from-left-4">
           <div className="flex items-center gap-4 mb-10">
              <button onClick={() => setSelectedCatView(null)} className="p-4 bg-black text-[#F7C705] rounded-[24px] hover:scale-110 transition-all"><ArrowLeft /></button>
              <h2 className="text-4xl font-black text-black flex items-center gap-3">
                 <Box size={36} /> تحديات صنف: {selectedCatView}
              </h2>
           </div>
           
           <div className="space-y-4">
              {questions.filter(q => q.category === selectedCatView).map(q => (
                <div key={q.id} className="bg-white p-8 rounded-[40px] border-4 border-black/5 flex items-center justify-between shadow-sm">
                   <div className="flex-1">
                      <div className="flex gap-2 mb-4">
                         <span className="bg-black text-[#F7C705] text-[10px] px-4 py-1.5 rounded-full font-black uppercase">{q.difficulty}</span>
                         <span className="bg-black/5 text-black text-[10px] px-4 py-1.5 rounded-full font-black">ID: {q.id.split('-').pop()}</span>
                      </div>
                      <p className="text-black font-black text-2xl leading-tight">{q.question}</p>
                      <div className="mt-4 p-4 bg-black/5 rounded-2xl border border-black/5">
                         <p className="text-sm font-bold text-black/60">الجواب:</p>
                         <p className="text-lg font-black text-black">{q.answer}</p>
                      </div>
                   </div>
                   <button onClick={() => { if(confirm('حذف هذا السؤال؟')) onDeleteQuestion(q.id); }} className="p-5 rounded-[24px] bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all mr-10 shadow-sm"><Trash2 size={28} /></button>
                </div>
              ))}
              {questions.filter(q => q.category === selectedCatView).length === 0 && (
                <div className="text-center py-20 bg-black/5 rounded-[60px] border-4 border-dashed border-black/10">
                   <Box size={60} className="mx-auto text-black/10 mb-4" />
                   <p className="text-black/40 font-black text-xl">لا توجد تحديات في هذا الصنف حالياً</p>
                </div>
              )}
           </div>
        </div>
      )}

        {tab === 'users' && (
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
      )}
      {tab === 'cloud' && (
        <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95">
           <div className="bg-black text-[#F7C705] rounded-[50px] p-10 shadow-2xl border-4 border-black/5">
              <h2 className="text-3xl font-black mb-10 flex items-center gap-4">⚙️ إعدادات المزامنة السحابية</h2>
              <p className="text-sm font-bold opacity-60 mb-10 leading-relaxed text-right">
                لجعل التعديلات تظهر لجميع اللاعبين على جميع الأجهزة، يجب ربط الموقع بقاعدة بيانات Supabase. 
                <br />1. أنشئ حساب مجاني في <a href="https://supabase.com" target="_blank" className="underline">Supabase</a>.
                <br />2. أنشئ مشروع جديد.
                <br />3. انسخ الـ Project URL و Anon Key وضعهما هنا.
              </p>
              <div className="space-y-6 text-right">
                 <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest mr-4 opacity-40">Project URL</label>
                    <input type="text" value={sUrl} onChange={(e) => setSUrl(e.target.value)} className="w-full bg-[#1A1A1A] border-2 border-[#F7C705]/10 rounded-2xl px-6 py-4 text-[#F7C705] font-mono text-xs outline-none focus:border-[#F7C705]" placeholder="https://xyz.supabase.co" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest mr-4 opacity-40">Anon Key</label>
                    <input type="password" value={sKey} onChange={(e) => setSKey(e.target.value)} className="w-full bg-[#1A1A1A] border-2 border-[#F7C705]/10 rounded-2xl px-6 py-4 text-[#F7C705] font-mono text-xs outline-none focus:border-[#F7C705]" placeholder="eyJhbGciOiJIUzI1..." />
                 </div>
                 <button onClick={saveCloudSettings} className="w-full bg-[#F7C705] text-black py-5 rounded-2xl font-black text-xl mt-6 shadow-xl hover:scale-[1.02] transition-all">حفظ وتفعيل المزامنة</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
