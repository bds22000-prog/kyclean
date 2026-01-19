
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTranslation } from '../App';
import { generateOperationalSummary } from '../geminiService';
import { Zap, Truck, Recycle, Sun, Cloud, CloudRain, Wind, Droplets, RefreshCw, TrendingUp, Package, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const mockChartData = [
  { name: '1월', waste: 1200, sorting: 150 },
  { name: '2월', waste: 1100, sorting: 180 },
  { name: '3월', waste: 1400, sorting: 210 },
  { name: '4월', waste: 1300, sorting: 190 },
  { name: '5월', waste: 1500, sorting: 250 },
  { name: '6월', waste: 1700, sorting: 310 },
  { name: '7월', waste: 1600, sorting: 280 },
  { name: '8월', waste: 1800, sorting: 350 },
  { name: '9월', waste: 1550, sorting: 320 },
  { name: '10월', waste: 1450, sorting: 290 },
  { name: '11월', waste: 1650, sorting: 340 },
  { name: '12월', waste: 1900, sorting: 400 },
];

const KPICard = ({ title, value, unit, trend, icon: Icon, color, trendUp }: any) => (
  <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform`}></div>
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-6">
        <div className={`w-14 h-14 bg-${color}-50 rounded-2xl flex items-center justify-center text-${color}-600 shadow-inner`}>
          <Icon size={28} />
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trend}
        </div>
      </div>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums">{value}</h3>
        <span className="text-sm font-bold text-slate-400 uppercase">{unit}</span>
      </div>
    </div>
  </div>
);

const WeatherWidget: React.FC<{ timezone: string; location: string; countryCode: string }> = ({ timezone, location, countryCode }) => {
  const [time, setTime] = useState(new Date());
  const { lang } = useTranslation();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
      setTime(now);
    }, 1000);
    return () => clearInterval(timer);
  }, [timezone]);

  const dateStr = timezone.includes('Qyzylorda') || timezone.includes('Almaty')
    ? time.toLocaleDateString('ru-KZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : time.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\s/g, '');
    
  const dayName = time.toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'ru-KZ', { weekday: 'short' });
  const hour = time.getHours();
  const minute = time.getMinutes().toString().padStart(2, '0');
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = (hour % 12 || 12).toString().padStart(2, '0');

  const isKZ = countryCode === 'KZ';
  const temp = isKZ ? 18 : 22;
  const desc = isKZ ? '아주 맑음' : '대체로 맑음';
  const humidity = isKZ ? '32%' : '48%';
  const wind = isKZ ? 'NW 3.5m/s' : 'SW 1.2m/s';

  return (
    <div className="w-full bg-gradient-to-b from-[#1e60b4] to-[#3495d4] p-8 rounded-[48px] shadow-2xl text-white font-sans relative overflow-hidden group border-2 border-white/20">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
           <div className="bg-white/10 p-2 rounded-full backdrop-blur-md">
            <RefreshCw size={20} className="opacity-90 cursor-pointer hover:rotate-180 transition-transform duration-700" />
           </div>
           <div className="flex flex-col">
             <span className="text-[18px] font-black tracking-tight leading-none uppercase">{location}</span>
             <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1">{isKZ ? 'Kyzylorda, Kazakhstan' : 'Goyang, South Korea'}</span>
           </div>
        </div>
        <div className="bg-white/15 backdrop-blur-lg px-6 py-2 rounded-full text-[14px] font-black tracking-widest flex items-center gap-2 border border-white/20 shadow-inner">
           {dateStr} <span className="opacity-50 text-[10px]">|</span> {dayName}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 items-center mb-8">
        <div className="col-span-4 flex flex-col items-center justify-center space-y-4">
           <div className="relative">
             <Sun size={100} className="text-[#FEC110] drop-shadow-[0_0_30px_rgba(254,193,16,0.6)] animate-pulse" />
             {!isKZ && <Cloud size={50} className="absolute -bottom-2 -right-8 text-white/90 drop-shadow-lg" />}
           </div>
           <div className="text-center">
              <p className="text-[18px] font-black mb-1 uppercase tracking-tighter">{desc}</p>
              <div className="flex items-baseline justify-center gap-2">
                 <span className="text-7xl font-black tabular-nums tracking-tighter leading-none">{temp}</span>
                 <span className="text-3xl font-light opacity-80">°C</span>
              </div>
           </div>
        </div>

        <div className="col-span-8 flex flex-col items-center justify-center">
           <div className="w-full bg-white/10 backdrop-blur-2xl p-6 rounded-[32px] border border-white/20 shadow-2xl relative flex flex-col items-center justify-center group/clock overflow-hidden">
              <div className="absolute inset-0 bg-blue-400/10 animate-pulse pointer-events-none"></div>
              <div className="flex items-center gap-6 font-black text-6xl tabular-nums tracking-tighter text-white z-10 drop-shadow-2xl">
                 <div className="bg-white/10 px-5 py-3 rounded-2xl border border-white/10 shadow-lg">{displayHour}</div>
                 <span className="text-[#FEC110] animate-pulse">:</span>
                 <div className="bg-white/10 px-5 py-3 rounded-2xl border border-white/10 shadow-lg">{minute}</div>
              </div>
              <div className="mt-4 flex items-center gap-4 z-10">
                <div className="h-px w-12 bg-white/20"></div>
                <div className="text-[12px] font-black uppercase text-[#FEC110] tracking-[0.8em]">{ampm}</div>
                <div className="h-px w-12 bg-white/20"></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { t, lang } = useTranslation();
  const [aiInsight, setAiInsight] = useState<string>('운영 데이터를 분석 중입니다...');

  useEffect(() => {
    async function fetchInsight() {
      const summary = await generateOperationalSummary({
        annualWaste: 18420,
        monthlySorting: 340,
        efficiency: '94%'
      }, lang);
      setAiInsight(summary || '데이터를 가져올 수 없습니다.');
    }
    fetchInsight();
  }, [lang]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 pt-10 px-10 bg-[#f8fbff]">
      {/* 1. 상단 날씨 및 시계 섹션 */}
      <div className="flex flex-col items-center justify-center w-full">
          <div className="bg-white/30 backdrop-blur-3xl p-8 lg:p-10 rounded-[64px] border border-white/60 shadow-[0_60px_140px_-30px_rgba(0,43,91,0.1)] grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-10 w-full max-w-[2000px] border-2">
            <div className="w-full flex flex-col items-center gap-4 h-full animate-in slide-in-from-left-20 duration-1000">
               <div className="flex items-center gap-5 bg-white/90 px-10 py-3 rounded-full shadow-2xl border-b-4 border-sky-600/20 group hover:scale-105 transition-transform cursor-default">
                  <div className="relative">
                    <img src="https://flagcdn.com/w160/kz.png" className="w-14 h-9 rounded-md shadow-md object-cover" alt="KZ" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-slate-800 text-[20px] uppercase tracking-tighter leading-none">카자흐스탄</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Kyzylorda, Kazakhstan</span>
                  </div>
               </div>
               <div className="w-full flex-1">
                 <WeatherWidget timezone="Asia/Qyzylorda" location="카자흐스탄 키질로르다" countryCode="KZ" />
               </div>
            </div>
            
            <div className="w-full flex flex-col items-center gap-4 h-full animate-in slide-in-from-right-20 duration-1000">
               <div className="flex items-center gap-5 bg-white/90 px-10 py-3 rounded-full shadow-2xl border-b-4 border-blue-600/20 group hover:scale-105 transition-transform cursor-default">
                  <div className="relative">
                    <img src="https://flagcdn.com/w160/kr.png" className="w-14 h-9 rounded-md shadow-md object-cover" alt="KR" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-slate-800 text-[20px] uppercase tracking-tighter leading-none">대한민국</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Goyang, South Korea</span>
                  </div>
               </div>
               <div className="w-full flex-1">
                 <WeatherWidget timezone="Asia/Seoul" location="대한민국 경기도 고양시" countryCode="KR" />
               </div>
            </div>
          </div>
      </div>

      {/* 2. 핵심 운영 지표 KPI 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-[2000px] mx-auto">
        <KPICard title="연간 누적 매립량" value="18,420" unit="Ton" trend="↑ 12%" icon={Truck} color="blue" trendUp={true} />
        <KPICard title="당월 실시간 매립량" value="1,650" unit="Ton" trend="↑ 4%" icon={Package} color="sky" trendUp={true} />
        <KPICard title="연간 누적 선별량" value="4,210" unit="Pcs" trend="↑ 8.5%" icon={Recycle} color="emerald" trendUp={true} />
        <KPICard title="당월 실시간 선별량" value="340" unit="Pcs" trend="↓ 2%" icon={BarChart3} color="amber" trendUp={false} />
      </div>

      {/* 3. 데이터 통합 분석 그래프 및 AI Insight */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-[2000px] mx-auto">
        {/* 운영 추이 그래프 */}
        <div className="xl:col-span-2 bg-white p-10 rounded-[48px] border border-slate-200 shadow-2xl overflow-hidden group">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-[#ccff00]">
                <TrendingUp size={24} />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">연간 운영 통계 분석</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Waste Inbound vs. Sorting Efficiency (2026)</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#00AFCA]"></div>
                <span className="text-[11px] font-black text-slate-500 uppercase">매립량</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ccff00]"></div>
                <span className="text-[11px] font-black text-slate-500 uppercase">선별량</span>
              </div>
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00AFCA" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00AFCA" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSorting" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ccff00" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ccff00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="waste" 
                  stroke="#00AFCA" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorWaste)" 
                  animationDuration={2000}
                />
                <Area 
                  type="monotone" 
                  dataKey="sorting" 
                  stroke="#ccff00" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorSorting)" 
                  animationDuration={2500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI 운영 인사이트 */}
        <div className="bg-slate-900 p-10 rounded-[48px] border border-slate-800 shadow-2xl flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                <Zap size={24} />
              </div>
              <div>
                <h4 className="text-xl font-black text-white uppercase tracking-tighter leading-none">AI 운영 분석 리포트</h4>
                <p className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest mt-1">Smart Operational Insight</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] backdrop-blur-sm">
                <p className="text-blue-100/90 leading-relaxed font-medium text-[15px]">
                  {aiInsight}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                   <p className="text-[10px] font-black text-slate-500 uppercase mb-1">운영 효율성</p>
                   <h5 className="text-2xl font-black text-[#ccff00]">94.2%</h5>
                </div>
                <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                   <p className="text-[10px] font-black text-slate-500 uppercase mb-1">탄소 저감량</p>
                   <h5 className="text-2xl font-black text-blue-400">12.5t</h5>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-auto pt-10">
             <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-blue-900/40 transition-all flex items-center justify-center gap-3 group">
               상세 분석 리포트 확인 <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
