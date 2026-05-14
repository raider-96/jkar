
import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  // Simulating a list of allowed users
  const allowedUsers = ['admin', 'player1', 'player2', 'player3', 'player4', 'user', 'guest'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (allowedUsers.includes(username.toLowerCase())) {
      onLogin(username);
    } else {
      setError('عذراً، هذا اليوزر غير مسموح له بالدخول حالياً.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 rtl">
      <div className="bg-black p-10 rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-md transform transition-all border-4 border-black/5">
        <div className="flex justify-center mb-10">
          <div className="p-5 bg-[#F7C705] rounded-full shadow-xl">
            <ShieldCheck size={56} className="text-black" />
          </div>
        </div>
        <h1 className="text-4xl font-black text-center mb-3 text-[#F7C705] tracking-tight">مرحباً بك</h1>
        <p className="text-[#F7C705]/60 text-center mb-10 font-bold">أدخل اليوزر للبدء بالتحدي</p>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="relative">
            <label className="block text-sm font-black mb-3 text-[#F7C705]/80 uppercase tracking-widest">اسم المستخدم</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#1A1A1A] border-2 border-[#F7C705]/20 rounded-2xl py-5 px-6 focus:outline-none focus:border-[#F7C705] transition-all text-[#F7C705] text-xl font-black text-center"
                placeholder="أدخل اليوزر..."
                required
              />
            </div>
          </div>
          
          {error && <p className="text-red-500 text-sm text-center font-black bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</p>}
          
          <button
            type="submit"
            className="w-full bg-[#F7C705] hover:scale-[1.02] text-black font-black py-5 rounded-2xl shadow-xl shadow-[#F7C705]/10 transition-all active:scale-95 text-xl"
          >
            دخول للعبة
          </button>
        </form>
        
        <div className="mt-12 text-center text-[#F7C705]/40 text-xs font-bold uppercase tracking-widest">
          <p>مخصص لعدد محدود من اليوزرات</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
