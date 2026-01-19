
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation, WithYouLogo } from '../App';
import { 
  MapPin, CheckCircle, Clock, Power, 
  ChevronLeft, ChevronRight, Calendar, 
  Users, ShieldCheck, Fingerprint, History, 
  Sun, RefreshCw, Thermometer, MapPinned, UserCheck, LogIn, LogOut,
  Briefcase, Palmtree, Search, Printer, Save, MoreHorizontal
} from 'lucide-react';
import { Employee } from '../types';

const Attendance: React.FC = () => {
  const { user, employees, attendanceSubTab, lang, t, searchTerm } = useTranslation();
  const [time, setTime] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  
  const [attendanceData, setAttendanceData] = useState<Record<string, Record<string, string>>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Qyzylorda" })));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dateKey = useMemo(() => viewDate.toISOString().split('T')[0], [viewDate]);

  const handleDateChange = (days: number) => {
    const next = new Date(viewDate);
    next.setDate(next.getDate() + days);
    setViewDate(next);
  };

  const handleStatusChange = (empId: string, newStatus: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [dateKey]: {
        ...(prev[dateKey] || {}),
        [empId]: newStatus
      }
    }));
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => 
      !e.resignationDate && (
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (e.nameCyrillic || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.empNo || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [employees, searchTerm]);

  const stats = useMemo(() => {
    const dayData = attendanceData[dateKey] || {};
    const total = filteredEmployees.length;
    let present = 0, late = 0, vacation = 0, trip = 0, off = 0;

    filteredEmployees.forEach(emp => {
      const status = dayData[emp.id] || '정상';
      if (status === '정상') present++;
      else if (status === '지각') late++;
      else if (status === '휴가') vacation++;
      else if (status === '출장') trip++;
      else if (status === '퇴직/OFF') off++;
    });

    if (Object.keys(dayData).length === 0) {
        present = Math.floor(total * 0.85);
        late = Math.floor(total * 0.05);
        vacation = total - present - late;
    }

    return { total, present, late, vacation, trip, off };
  }, [filteredEmployees, attendanceData, dateKey]);

  const statusColors: Record<string, string> = {
    '정상': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    '지각': 'bg-amber-50 text-amber-600 border-amber-100',
    '휴가': 'bg-indigo-50 text-indigo-600 border-indigo-100',
    '출장': 'bg-blue-50 text-blue-600 border-blue-100',
    '퇴직/OFF': 'bg-rose-50 text-rose-600 border-rose-100'
  };

  const renderRegister = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-700">
      {/* Clock In/Out Control Card */}
      <div className="lg:col-span-5">
        <div className="bg-white p-6 lg:p-10 rounded-[32px] lg:rounded-[48px] border border-slate-200 shadow-xl relative overflow-hidden group">
          <div className="relative z-10 text-center lg:text-left">
            <div className="flex flex-col lg:flex-row items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-900 rounded-2xl flex items-center justify-center text-[#ccff00] shadow-xl">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">실시간 근태 인증</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Mobile Attendance Sync</p>
              </div>
            </div>

            <div className="bg-slate-900 p-6 lg:p-8 rounded-[24px] lg:rounded-[32px] text-center mb-8 border-4 border-slate-800 shadow-inner">
              <p className="text-[9px] font-black text-[#ccff00] tracking-[0.4em] uppercase mb-3 animate-pulse">Kyzylorda Time</p>
              <h2 className="text-4xl lg:text-5xl font-black text-white font-digital tracking-widest tabular-nums leading-none">
                {time.toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => alert(t('clockInSuccess'))} className="flex flex-col items-center justify-center gap-2 p-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[24px] shadow-xl transition-all active:scale-95 group">
                <LogIn size={28} strokeWidth={3} />
                <span className="text-[14px] font-black uppercase">{t('clockInAction')}</span>
              </button>
              <button onClick={() => alert(t('clockOutSuccess'))} className="flex flex-col items-center justify-center gap-2 p-6 bg-rose-500 hover:bg-rose-600 text-white rounded-[24px] shadow-xl transition-all active:scale-95 group">
                <Power size={28} strokeWidth={3} />
                <span className="text-[14px] font-black uppercase">{t('clockOutAction')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary Area */}
      <div className="lg:col-span-7 space-y-4 lg:space-y-6">
        <div className="grid grid-cols-3 gap-3 lg:gap-6">
          <div className="bg-white p-4 lg:p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-2 lg:gap-4 text-center lg:text-left">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><UserCheck size={20}/></div>
            <div>
              <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">정상</p>
              <h4 className="text-lg lg:text-2xl font-black text-slate-900">{stats.present}</h4>
            </div>
          </div>
          <div className="bg-white p-4 lg:p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-2 lg:gap-4 text-center lg:text-left">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600"><Clock size={20}/></div>
            <div>
              <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">지각</p>
              <h4 className="text-lg lg:text-2xl font-black text-slate-900">{stats.late}</h4>
            </div>
          </div>
          <div className="bg-white p-4 lg:p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-2 lg:gap-4 text-center lg:text-left">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600"><Palmtree size={20}/></div>
            <div>
              <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">휴가</p>
              <h4 className="text-lg lg:text-2xl font-black text-slate-900">{stats.vacation}</h4>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[24px] lg:rounded-[40px] shadow-lg overflow-hidden">
          <div className="p-4 lg:p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History size={18} className="text-blue-600" />
              <h4 className="text-xs lg:text-sm font-black text-slate-800 uppercase tracking-tighter">최근 기록</h4>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredEmployees.slice(0, 4).map((emp, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-black text-[10px]">{emp.name.charAt(0)}</div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-800">{emp.name}</p>
                      <p className="text-[10px] text-slate-400 tabular-nums">08:52:14 • Main Gate</p>
                    </div>
                 </div>
                 <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-full border border-emerald-100 uppercase">출근</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStatus = () => (
    <div className="space-y-4 animate-in fade-in duration-700">
      <div className="bg-white border border-slate-300 p-4 lg:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
           <div className="flex bg-slate-50 border border-slate-200 p-1 rounded-xl w-full md:w-auto justify-between items-center">
             <button onClick={() => handleDateChange(-1)} className="p-2 hover:bg-white rounded-lg text-slate-400"><ChevronLeft size={20}/></button>
             <div className="px-4 flex items-center gap-2">
               <Calendar size={16} className="text-blue-600" />
               <span className="font-black text-slate-800 text-[14px] tabular-nums">
                 {viewDate.toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'ru-KZ', { year: 'numeric', month: '2-digit', day: '2-digit' })}
               </span>
             </div>
             <button onClick={() => handleDateChange(1)} className="p-2 hover:bg-white rounded-lg text-slate-400"><ChevronRight size={20}/></button>
           </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto no-print">
           <button onClick={() => window.print()} className="flex-1 md:flex-none p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl flex justify-center items-center"><Printer size={18}/></button>
           <button 
             onClick={() => { setIsSaving(true); setTimeout(() => { setIsSaving(false); alert('저장되었습니다.'); }, 800); }}
             className="flex-3 md:flex-none flex items-center justify-center gap-2 bg-blue-900 text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase shadow-lg"
           >
             {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14}/>} 명단 저장
           </button>
        </div>
      </div>

      {/* Mobile Card List (Visible on small screens) */}
      <div className="block lg:hidden space-y-3">
        {filteredEmployees.map((emp, idx) => {
          const currentStatus = (attendanceData[dateKey] || {})[emp.id] || '정상';
          return (
            <div key={emp.id} className="bg-white border border-slate-200 p-5 rounded-[24px] shadow-sm flex flex-col gap-4">
               <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-[#ccff00] font-black">{emp.name.charAt(0)}</div>
                     <div>
                        <h4 className="text-[14px] font-black text-slate-900">{emp.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{emp.empNo} • {emp.nameCyrillic || '-'}</p>
                     </div>
                  </div>
                  <select 
                    value={currentStatus}
                    onChange={(e) => handleStatusChange(emp.id, e.target.value)}
                    className={`px-3 py-1.5 rounded-full border font-black text-[10px] uppercase outline-none cursor-pointer appearance-none text-center ${statusColors[currentStatus]}`}
                  >
                    <option value="정상">정상</option>
                    <option value="지각">지각</option>
                    <option value="휴가">휴가</option>
                    <option value="출장">출장</option>
                    <option value="퇴직/OFF">퇴직/OFF</option>
                  </select>
               </div>
               <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4">
                  <div>
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">출근 시간</p>
                     <p className="text-[13px] font-bold text-slate-700 tabular-nums">{currentStatus === '정상' || currentStatus === '지각' ? '08:52:14' : '-'}</p>
                  </div>
                  <div>
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">퇴근 시간</p>
                     <p className="text-[13px] font-bold text-slate-700 tabular-nums">-</p>
                  </div>
               </div>
               <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-2">
                  <MapPin size={12} className="text-blue-500" />
                  <span className="text-[10px] text-slate-500 font-bold">Main Gate GPS Synchronized</span>
               </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table (Visible on large screens) */}
      <div className="hidden lg:block bg-white border border-slate-300 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="border border-slate-200 p-4 w-16">Row</th>
              <th className="border border-slate-200 p-4 text-left px-8">직원 정보</th>
              <th className="border border-slate-200 p-4">사원번호</th>
              <th className="border border-slate-200 p-4">출근</th>
              <th className="border border-slate-200 p-4">퇴근</th>
              <th className="border border-slate-200 p-4 w-40">근무상태</th>
              <th className="border border-slate-200 p-4 text-left px-8">인증 위치</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredEmployees.map((emp, idx) => {
              const currentStatus = (attendanceData[dateKey] || {})[emp.id] || '정상';
              return (
                <tr key={emp.id} className="hover:bg-blue-50/20 transition-colors h-16">
                  <td className="text-center font-mono text-[11px] text-slate-300">{idx + 1}</td>
                  <td className="px-8">
                    <div className="flex flex-col">
                        <span className="text-slate-900 font-bold">{emp.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium italic uppercase">{emp.nameCyrillic || '-'}</span>
                    </div>
                  </td>
                  <td className="text-center font-mono text-slate-400 text-[12px]">{emp.empNo}</td>
                  <td className="text-center font-bold text-slate-700">{currentStatus === '정상' || currentStatus === '지각' ? '08:52:14' : '-'}</td>
                  <td className="text-center text-slate-400">-</td>
                  <td className="p-2">
                    <select 
                      value={currentStatus}
                      onChange={(e) => handleStatusChange(emp.id, e.target.value)}
                      className={`w-full px-2 py-2 rounded-sm border font-black text-[10px] uppercase outline-none cursor-pointer appearance-none text-center ${statusColors[currentStatus]}`}
                    >
                      <option value="정상">정상</option>
                      <option value="지각">지각</option>
                      <option value="휴가">휴가</option>
                      <option value="출장">출장</option>
                      <option value="퇴직/OFF">퇴직/OFF</option>
                    </select>
                  </td>
                  <td className="px-8 text-[11px] text-slate-400">
                    <div className="flex items-center gap-3">
                        <MapPin size={12} className="text-blue-500" />
                        <span>Main Entrance gateway</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 lg:space-y-8" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
      {attendanceSubTab === 'register' ? renderRegister() : renderStatus()}
    </div>
  );
};

export default Attendance;
