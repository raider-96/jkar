
import React, { useState } from 'react';
import { motion } from 'framer-motion';

import { MessageCircle } from 'lucide-react';

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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[85vh] p-4 rtl relative overflow-hidden"
    >
      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/07822771784" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-10 left-10 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-[200] flex items-center gap-2 font-black"
      >
        <MessageCircle size={24} />
        <span className="hidden md:block">تواصل مع الإدارة</span>
      </a>

      <div className="bg-black p-10 rounded-[60px] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.6)] w-full max-w-md border-4 border-[#F7C705]/10 relative z-10">
        <div className="flex justify-center mb-10">
          <motion.div 
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="p-1 bg-[#F7C705] rounded-[40px] shadow-2xl border-4 border-[#F7C705]/20"
          >
            <img 
              src="img/lo.jpg" 
              alt="Chgar Logo" 
              className="w-36 h-36 rounded-[35px] object-cover"
              onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/150?text=CHGAR"; }}
            />
          </motion.div>
        </div>
        
        <h1 className="text-4xl font-black text-center mb-2 text-[#F7C705] tracking-tight">چگار</h1>
        <p className="text-[#F7C705]/40 text-center mb-10 font-bold uppercase tracking-widest text-xs">أدخل اليوزر والرمز للبدء بالتحدي</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black mr-4 text-[#F7C705]/60 uppercase tracking-widest">اسم المستخدم</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#111] border-2 border-[#F7C705]/10 rounded-3xl py-5 px-6 focus:outline-none focus:border-[#F7C705] transition-all text-[#F7C705] text-xl font-black text-center"
              placeholder="USER ID"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black mr-4 text-[#F7C705]/60 uppercase tracking-widest">الرمز السري</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#111] border-2 border-[#F7C705]/10 rounded-3xl py-5 px-6 focus:outline-none focus:border-[#F7C705] transition-all text-[#F7C705] text-xl font-black text-center"
              placeholder="PASSWORD"
              required
            />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-[#F7C705] text-black font-black py-6 rounded-[30px] shadow-xl shadow-[#F7C705]/10 transition-all text-2xl mt-4"
          >
            دخول للعبة
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default Login;
