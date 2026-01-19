
import React, { useState } from 'react';
import { Lock, User, ChevronRight, ShieldAlert } from 'lucide-react';
import { Language, Employee } from './types';
// Fix: Correct import path to same directory
import { WithYouLogo, useTranslation } from './App';

interface LoginProps {
  onLogin: (user: Employee) => void;
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
}

const Login: React.FC<LoginProps> = ({ onLogin, lang, setLang, t }) => {
  const { employees } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 사원번호(wy-0001 등) 기반 로그인 로직
    const user = employees.find(emp => 
      emp.empNo?.toLowerCase() === formData.username.toLowerCase() && 
      emp.password === formData.password
    );

    if (user) {
      onLogin(user);
    } else {
      setError(lang === 'ko' ? '사원번호 또는 비밀번호가 일치하지 않습니다.' : 'Неверный ID сотрудника или пароль.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#00afca] relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-white/20 blur-[180px] rounded-full"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#FEC110]/20 blur-[180px] rounded-full"></div>
      
      <div className="w-full max-w-4xl p-6 z-10 grid grid-cols-1 md:grid-cols-2 bg-white/95 backdrop-blur-3xl rounded-[56px] border border-white shadow-[0_48px_120px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in duration-700">
        
        {/* Branding Section */}
        <div className="p-12 flex flex-col items-center justify-center text-center bg-[#008ba3] border-r border-white/10">
          <WithYouLogo size={110} white />
          <div className="mt-10 space-y-3">
             <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">WITH YOU E&C</h2>
             <p className="text-[12px] font-black text-[#FEC110] uppercase tracking-[0.6em] leading-none">KYZYLORDA</p>
             <div className="w-16 h-1 bg-[#FEC110] mx-auto rounded-full mt-4"></div>
             <p className="text-[9px] font-black text-white/50 uppercase tracking-[0.3em] pt-4 italic">INTEGRATED MS PLATFORM</p>
          </div>
          
          <div className="mt-14 flex flex-wrap justify-center gap-4">
             <button onClick={() => setLang('ko')} className={`p-1.5 rounded-xl border-2 transition-all hover:scale-105 ${lang === 'ko' ? 'border-[#FEC110] bg-white/10' : 'border-white/10'}`}>
                <img src="https://flagcdn.com/w80/kr.png" className="w-12 h-8 rounded shadow-lg object-cover" alt="KR" />
             </button>
             <button onClick={() => setLang('ru')} className={`p-1.5 rounded-xl border-2 transition-all hover:scale-105 ${lang === 'ru' ? 'border-[#FEC110] bg-white/10' : 'border-white/10'}`}>
                <img src="https://flagcdn.com/w80/ru.png" className="w-12 h-8 rounded shadow-lg object-cover" alt="RU" />
             </button>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="p-12 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-[#00afca] uppercase tracking-tighter italic">SYSTEM LOGIN</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('welcomeBack')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold animate-in slide-in-from-top-2">
              <ShieldAlert size={18} /> {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-[#00afca] uppercase tracking-widest ml-1">{t('username')}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  required
                  type="text" 
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-[#00afca] transition-all font-black text-slate-900 placeholder-slate-300 text-sm tracking-widest" 
                  placeholder="wy-0001"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-[#00afca] uppercase tracking-widest ml-1">{t('password')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  required
                  type="password" 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-[#00afca] transition-all font-black text-slate-900 placeholder-slate-300 text-sm tracking-widest" 
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-[#00afca] hover:bg-[#008ba3] text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-[#00afca]/20 transition-all active:scale-[0.97] flex items-center justify-center gap-3 mt-6 group"
            >
              {t('login')}
              <ChevronRight size={18} className="text-[#FEC110] group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
          <div className="mt-24 text-center">
             <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.3em] leading-loose">
               &copy; 2025 WITH YOU E&C<br/>
               SECURE ENTERPRISE ACCESS CONTROL
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
