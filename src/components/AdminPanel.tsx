import React, { useState } from 'react';
import { UserAccount } from '../types';
// إضافة Trash2 إلى قائمة الأيقونات المستوردة
import { UserPlus, UserX, UserCheck, Shield, ArrowLeft, Trash2 } from 'lucide-react';

interface AdminPanelProps {
  users: UserAccount[];
  onAddUser: (username: string) => void;
  onToggleUser: (username: string) => void;
  onDeleteUser: (username: string) => void; 
  onBack: () => void;
}

// تأكد من استقبال onDeleteUser هنا في تعريف المكون
const AdminPanel: React.FC<AdminPanelProps> = ({ users, onAddUser, onToggleUser, onDeleteUser, onBack }) => {
  const [newUsername, setNewUsername] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.trim()) {
      onAddUser(newUsername.trim());
      setNewUsername('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 rtl" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-black flex items-center gap-3">
          <Shield className="text-black" /> لوحة الإدارة
        </h1>
        <button onClick={onBack} className="flex items-center gap-2 text-black/60 hover:text-black transition-colors font-bold">
          <ArrowLeft size={20} /> عودة للرئيسية
        </button>
      </div>

      {/* قسم إضافة مستخدم جديد */}
      <div className="bg-black text-[#F7C705] rounded-[40px] p-10 shadow-2xl mb-10 border-4 border-black/5">
        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
          <UserPlus className="text-[#F7C705]" /> إضافة مستخدم جديد
        </h2>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-5">
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="flex-1 bg-[#1A1A1A] border-2 border-[#F7C705]/20 rounded-[24px] px-8 py-5 text-[#F7C705] text-xl font-black outline-none focus:border-[#F7C705] transition-all"
            placeholder="اكتب اليوزر هنا..."
          />
          <button type="submit" className="bg-[#F7C705] hover:scale-105 text-black px-12 py-5 rounded-[24px] font-black text-xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#F7C705]/10">
            إضافة الآن
          </button>
        </form>
      </div>

      {/* قائمة المستخدمين */}
      <div className="bg-black/5 rounded-[48px] p-10 border-4 border-black/5">
        <h2 className="text-2xl font-black text-black mb-10">قائمة المستخدمين ({users.length})</h2>
        <div className="grid grid-cols-1 gap-6">
          {users.map((u) => (
            <div key={u.username} className="flex items-center justify-between p-6 bg-white border-4 border-black/5 rounded-[32px] shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-5">
                <div className={`w-4 h-4 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                <div>
                  <p className="text-black text-xl font-black uppercase tracking-tighter">{u.username}</p>
                  <p className="text-[10px] text-black/40 font-bold">
                    بدأ في: {new Date(u.createdAt).toLocaleDateString('ar-EG')}
                  </p>
                </div>
                {u.role === 'admin' && (
                  <span className="bg-black text-[#F7C705] text-[10px] font-black px-3 py-1 rounded-full border border-black uppercase tracking-widest">ADMIN</span>
                )}
              </div>
              
              {/* خيارات التحكم (تعطيل وحذف) تظهر فقط لغير الأدمن */}
              {u.role !== 'admin' && (
                <div className="flex items-center gap-3">
                  {/* زر التفعيل / التعطيل */}
                  <button
                    onClick={() => onToggleUser(u.username)}
                    className={`p-4 rounded-[20px] transition-all ${u.isActive ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-green-50 text-green-500 hover:bg-green-500 hover:text-white'} shadow-sm`}
                    title={u.isActive ? 'تعطيل اليوزر' : 'تفعيل اليوزر'}
                  >
                    {u.isActive ? <UserX size={24} /> : <UserCheck size={24} />}
                  </button>

                  {/* زر الحذف النهائي */}
                  <button
                    onClick={() => onDeleteUser(u.username)}
                    className="p-4 rounded-[20px] bg-gray-100 text-gray-400 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    title="حذف اليوزر نهائياً"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;