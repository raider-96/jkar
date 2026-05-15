
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface LoginProps {
  onLogin: (username: string, password?: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[70vh] p-4 rtl"
    >
      <div className="bg-black p-10 rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-md border-4 border-black/5">
        <div className="flex justify-center mb-10">
          <div className="p-1 bg-[#F7C705] rounded-[35px] shadow-2xl border-4 border-[#F7C705]/20">
            <img 
              src="img/sq.jpeg" 
              alt="Chgar Logo" 
              className="w-32 h-32 rounded-[30px] object-cover shadow-inner"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/150?text=CHGAR";
              }}
            />
          </div>
        </div>
        <h1 className="text-4xl font-black text-center mb-3 text-[#F7C705] tracking-tight">مرحباً بك</h1>
        <p className="text-[#F7C705]/60 text-center mb-10 font-bold">أدخل اليوزر والرمز للبدء بالتحدي</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label className="block text-sm font-black mb-2 text-[#F7C705]/80 uppercase tracking-widest">اسم المستخدم</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#1A1A1A] border-2 border-[#F7C705]/20 rounded-2xl py-4 px-6 focus:outline-none focus:border-[#F7C705] transition-all text-[#F7C705] text-xl font-black text-center"
              placeholder="اسم المستخدم"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-black mb-2 text-[#F7C705]/80 uppercase tracking-widest">الرمز السري</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1A1A1A] border-2 border-[#F7C705]/20 rounded-2xl py-4 px-6 focus:outline-none focus:border-[#F7C705] transition-all text-[#F7C705] text-xl font-black text-center"
              placeholder="الرمز"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-[#F7C705] hover:scale-[1.02] text-black font-black py-5 rounded-2xl shadow-xl shadow-[#F7C705]/10 transition-all active:scale-95 text-xl mt-4"
          >
            دخول للعبة
          </button>
        </form>
        
        <div className="mt-12 text-center text-[#F7C705]/40 text-xs font-bold uppercase tracking-widest">
          <p>مخصص لعدد محدود من اليوزرات</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
