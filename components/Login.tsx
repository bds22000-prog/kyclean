
import React, { useState } from 'react';
import { Lock, User, ChevronRight, ShieldAlert } from 'lucide-react';
import { Language, Employee } from '../types';
import { WithYouLogo } from '../App';

interface LoginProps {
  onLogin: (user: Employee) => void;
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
  employees: Employee[];
}

// Google 멀티컬러 로고 SVG
const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// WhatsApp 브랜드 로고 SVG
const WhatsAppLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const Login: React.FC<LoginProps> = ({ onLogin, lang, setLang, t, employees }) => {
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ username: 'wy-0', password: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const inputVal = formData.username.trim().toLowerCase();
    const inputPwd = formData.password.trim();

    const user = employees.find(emp => 
      (emp.empNo?.toLowerCase() === inputVal || emp.name.toLowerCase() === inputVal) && 
      emp.password === inputPwd
    );

    if (user) {
      onLogin(user);
    } else {
      setError(lang === 'ko' ? '사원번호(ID) 또는 비밀번호가 일치하지 않습니다.' : 'Неверный ID сотрудника или пароль.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#00afca] relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-white/20 blur-[180px] rounded-full"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#FEC110]/20 blur-[180px] rounded-full"></div>
      
      <div className="w-full max-w-4xl p-6 z-10 grid grid-cols-1 md:grid-cols-2 bg-white/95 backdrop-blur-3xl rounded-[56px] border border-white shadow-[0_48px_120px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in duration-700">
        
        <div className="p-12 flex flex-col items-center justify-center text-center bg-[#008ba3] border-r border-white/10 relative">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
          <WithYouLogo size={110} white />
          <div className="mt-10 space-y-3 relative z-10">
             <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">WITH YOU E&C</h2>
             <p className="text-[12px] font-black text-[#FEC110] uppercase tracking-[0.6em] leading-none">KYZYLORDA</p>
             <div className="w-16 h-1 bg-[#FEC110] mx-auto rounded-full mt-4"></div>
             <p className="text-[9px] font-black text-white/50 uppercase tracking-[0.3em] pt-4 italic">INTEGRATED MS PLATFORM</p>
          </div>
          <div className="mt-14 flex flex-wrap justify-center gap-4 relative z-10">
             <button onClick={() => setLang('ko')} className={`p-1.5 rounded-xl border-2 transition-all hover:scale-110 ${lang === 'ko' ? 'border-[#FEC110] bg-white/10 shadow-[0_0_20px_rgba(254,193,16,0.3)]' : 'border-white/10'}`}><img src="https://flagcdn.com/w80/kr.png" className="w-12 h-8 rounded shadow-lg object-cover" /></button>
             <button onClick={() => setLang('ru')} className={`p-1.5 rounded-xl border-2 transition-all hover:scale-110 ${lang === 'ru' ? 'border-[#FEC110] bg-white/10 shadow-[0_0_20px_rgba(254,193,16,0.3)]' : 'border-white/10'}`}><img src="https://flagcdn.com/w80/ru.png" className="w-12 h-8 rounded shadow-lg object-cover" /></button>
          </div>
        </div>

        <div className="p-12 flex flex-col justify-center bg-white">
          <div className="mb-8 text-left">
            <h1 className="text-3xl font-black text-[#00afca] uppercase tracking-tighter italic leading-none">SYSTEM LOGIN</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">{t('welcomeBack')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold animate-in slide-in-from-top-2">
              <ShieldAlert size={18} /> {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-1 text-left">
              <label className="text-[9px] font-black text-[#00afca] uppercase tracking-widest ml-1">{t('username')}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  required 
                  type="text" 
                  value={formData.username} 
                  onChange={e => setFormData({...formData, username: e.target.value})} 
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-[#00afca] transition-all font-black text-slate-900 placeholder-slate-300 text-sm tracking-widest" 
                  placeholder="wy-0000" 
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[9px] font-black text-[#00afca] uppercase tracking-widest ml-1">{t('password')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-[#00afca] transition-all font-black text-slate-900 placeholder-slate-300 text-sm tracking-widest" placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-[#00afca] hover:bg-[#008ba3] text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-[#00afca]/20 transition-all active:scale-[0.97] flex items-center justify-center gap-3 mt-4 group">{t('login')} <ChevronRight size={18} className="text-[#FEC110] group-hover:translate-x-1 transition-transform" /></button>
          </form>

          <div className="relative my-10 flex items-center justify-center">
            <div className="absolute inset-x-0 h-px bg-slate-100"></div>
            <span className="relative bg-white px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">OR</span>
          </div>

          <div className="space-y-4">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">{t('easyLogin')}</p>
             <div className="grid grid-cols-1 gap-3">
                {/* WhatsApp Pretty Image Button */}
                <button className="flex items-center justify-center gap-4 py-4 bg-[#25D366] text-white rounded-[24px] font-black text-[11px] uppercase shadow-[0_12px_24px_rgba(37,211,102,0.25)] hover:shadow-[0_16px_32px_rgba(37,211,102,0.35)] hover:-translate-y-1 transition-all active:scale-95 group overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
                  <WhatsAppLogo />
                  <span className="relative z-10 tracking-widest">{t('continueWithWhatsApp')}</span>
                </button>
                
                {/* Google Pretty Image Button */}
                <button className="flex items-center justify-center gap-4 py-4 bg-white border border-slate-200 text-slate-600 rounded-[24px] font-black text-[11px] uppercase shadow-[0_12px_24px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all active:scale-95 group">
                  <GoogleLogo />
                  <span className="tracking-widest">{t('continueWithGoogle')}</span>
                </button>
             </div>
          </div>
          
          <div className="mt-12 text-center">
             <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.3em] leading-loose">&copy; 2025 WITH YOU E&C<br/>SECURE ENTERPRISE ACCESS CONTROL</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
