
import React, { useMemo, useState } from 'react';
import { useTranslation, WithYouLogo } from '../App';
import { 
  Shield, Check, ShieldAlert, UserCog, Users, Layers, Activity, 
  Settings, Database, Server, Save, Lock, Terminal, UserPlus, 
  Key, Fingerprint, ShieldCheck, UserCheck, AlertCircle, LayoutGrid, ChevronRight
} from 'lucide-react';
import { UserRole, Employee } from '../types';

const AdminSettings: React.FC = () => {
  const { employees, setEmployees, user, searchTerm, lang } = useTranslation();

  const allMenus = [
    { id: 'dashboard', label: '대시보드', icon: Activity },
    { id: 'waste', label: '폐기물', icon: Users },
    { id: 'recycling', label: '재활용', icon: Layers },
    { id: 'documents', label: '문서함', icon: Database },
    { id: 'schedule', label: '일정', icon: Activity },
    { id: 'hr', label: '인사', icon: Users },
    { id: 'attendance', label: '근태', icon: Activity },
    { id: 'finance', label: '재무', icon: Shield },
    { id: 'approval', label: '결재', icon: Check },
    { id: 'settings', label: '설정', icon: UserCog },
  ];

  const activeEmployees = useMemo(() => {
    return employees.filter(e => 
      !e.resignationDate && (
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (e.nameCyrillic || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.empNo || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [employees, searchTerm]);

  const stats = useMemo(() => {
    const total = activeEmployees.length;
    const admins = activeEmployees.filter(e => e.role === 'Admin').length;
    const managers = activeEmployees.filter(e => e.role === 'Manager').length;
    const staff = activeEmployees.filter(e => e.role === 'Staff').length;
    return { total, admins, managers, staff };
  }, [activeEmployees]);

  const toggleMenuPermission = (empId: string, menuId: string) => {
    setEmployees((prev: Employee[]) => prev.map((emp: Employee) => {
      if (emp.id !== empId) return emp;
      const allowed = emp.allowedMenus || [];
      const nextAllowed = allowed.includes(menuId)
        ? allowed.filter((m: string) => m !== menuId)
        : [...allowed, menuId];
      return { ...emp, allowedMenus: nextAllowed };
    }));
  };

  const handleRoleChange = (id: string, newRole: UserRole) => {
    setEmployees((prev: Employee[]) => prev.map((emp: Employee) => emp.id === id ? { ...emp, role: newRole } : emp));
  };

  const handlePasswordChange = (id: string, newPwd: string) => {
    setEmployees((prev: Employee[]) => prev.map((emp: Employee) => emp.id === id ? { ...emp, password: newPwd } : emp));
  };

  if (user.role !== 'Admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 lg:py-32 bg-white rounded-[40px] border border-blue-100 shadow-2xl text-center max-w-4xl mx-auto animate-in zoom-in-95 duration-500 mx-4 lg:mx-auto">
        <div className="w-20 h-20 lg:w-24 lg:h-24 bg-red-50 rounded-full flex items-center justify-center mb-8 border-4 border-blue-100 shadow-xl shadow-red-100">
            <ShieldAlert size={40} className="text-red-500 animate-pulse" />
        </div>
        <h3 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter text-blue-900 px-6">Access Restricted</h3>
        <p className="text-blue-700/60 font-bold mt-4 text-sm lg:text-lg px-6">최고 관리자(Admin) 계정만 시스템 보안 설정을 변경할 수 있습니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 lg:space-y-8 animate-in fade-in duration-700 pb-20" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
      
      {/* 1. Dashboard Stats - Responsive Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-6">
         <div className="bg-white p-4 lg:p-6 rounded-[24px] lg:rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-3 lg:gap-5 hover:shadow-lg transition-all group">
            <div className="w-10 h-10 lg:w-14 lg:h-14 bg-blue-900 rounded-xl lg:rounded-2xl flex items-center justify-center text-[#ccff00] shadow-xl group-hover:scale-105 transition-transform shrink-0"><Users size={20} className="lg:size-7"/></div>
            <div>
               <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">전체 계정</p>
               <h4 className="text-xl lg:text-3xl font-black text-slate-900 tabular-nums">{stats.total}</h4>
            </div>
         </div>
         <div className="bg-white p-4 lg:p-6 rounded-[24px] lg:rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-3 lg:gap-5 hover:shadow-lg transition-all group text-blue-600">
            <div className="w-10 h-10 lg:w-14 lg:h-14 bg-blue-50 rounded-xl lg:rounded-2xl flex items-center justify-center text-blue-600 shadow-xl group-hover:scale-105 transition-transform shrink-0"><ShieldCheck size={20} className="lg:size-7"/></div>
            <div>
               <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">ADMIN</p>
               <h4 className="text-xl lg:text-3xl font-black tabular-nums">{stats.admins}</h4>
            </div>
         </div>
         <div className="bg-white p-4 lg:p-6 rounded-[24px] lg:rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-3 lg:gap-5 hover:shadow-lg transition-all group text-emerald-600">
            <div className="w-10 h-10 lg:w-14 lg:h-14 bg-emerald-50 rounded-xl lg:rounded-2xl flex items-center justify-center text-emerald-600 shadow-xl group-hover:scale-105 transition-transform shrink-0"><UserCheck size={20} className="lg:size-7"/></div>
            <div>
               <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">MANAGER</p>
               <h4 className="text-xl lg:text-3xl font-black tabular-nums">{stats.managers}</h4>
            </div>
         </div>
         <div className="bg-white p-4 lg:p-6 rounded-[24px] lg:rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-3 lg:gap-5 hover:shadow-lg transition-all group text-slate-400">
            <div className="w-10 h-10 lg:w-14 lg:h-14 bg-slate-50 rounded-xl lg:rounded-2xl flex items-center justify-center text-slate-400 shadow-xl group-hover:scale-105 transition-transform shrink-0"><LayoutGrid size={20} className="lg:size-7"/></div>
            <div>
               <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">STAFF</p>
               <h4 className="text-xl lg:text-3xl font-black tabular-nums">{stats.staff}</h4>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[24px] lg:rounded-[40px] border border-slate-200 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-[#ccff00] to-emerald-500"></div>
        
        {/* Header - Mobile friendly padding and layout */}
        <div className="p-6 lg:p-8 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between bg-white gap-6">
          <div className="flex items-center gap-4 lg:gap-5">
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-blue-900 rounded-2xl flex items-center justify-center text-[#ccff00] shadow-2xl shrink-0">
               <Fingerprint size={24} className="lg:size-7" />
            </div>
            <div>
              <h2 className="text-lg lg:text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">권한 및 보안 정책 관리</h2>
              <p className="text-[9px] lg:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2 italic">
                <Shield size={12} className="text-blue-500" /> Security & Access Console
              </p>
            </div>
          </div>
          <button 
            onClick={() => alert('보안 정책이 모든 계정에 즉시 적용되었습니다.')}
            className="w-full md:w-auto flex items-center justify-center gap-3 bg-blue-900 text-[#ccff00] px-6 lg:px-8 py-3.5 lg:py-4 rounded-xl lg:rounded-[20px] font-black text-[11px] lg:text-xs hover:bg-blue-800 shadow-xl transition-all uppercase tracking-widest"
          >
            <Save size={18} /> 설정 저장
          </button>
        </div>

        {/* Mobile View: Card List (Hidden on Large) */}
        <div className="block lg:hidden p-4 space-y-4">
           {activeEmployees.map((emp) => (
             <div key={emp.id} className="bg-slate-50 border border-slate-200 p-5 rounded-[24px] shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-white font-black">{emp.name.charAt(0)}</div>
                      <div>
                         <h4 className="text-[14px] font-black text-slate-900">{emp.name}</h4>
                         <p className="text-[10px] text-slate-400 font-bold uppercase">{emp.empNo} • {emp.role}</p>
                      </div>
                   </div>
                </div>
                
                <div className="space-y-3 pt-3 border-t border-slate-200">
                   <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                         <label className="text-[8px] font-black text-slate-400 uppercase">권한 등급</label>
                         <select 
                            value={emp.role} 
                            onChange={(e) => handleRoleChange(emp.id, e.target.value as UserRole)}
                            className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-[11px] font-black text-blue-600 outline-none"
                         >
                            <option value="Admin">Admin</option>
                            <option value="Manager">Manager</option>
                            <option value="Staff">Staff</option>
                         </select>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[8px] font-black text-slate-400 uppercase">비밀번호</label>
                         <input 
                            type="text"
                            value={emp.password || ''}
                            onChange={(e) => handlePasswordChange(emp.id, e.target.value)}
                            className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-[11px] font-bold text-slate-700 outline-none"
                         />
                      </div>
                   </div>
                   
                   <div className="space-y-2">
                      <label className="text-[8px] font-black text-slate-400 uppercase">메뉴 접근 권한</label>
                      <div className="grid grid-cols-4 gap-1">
                         {allMenus.map(menu => {
                           const isAllowed = (emp.allowedMenus || []).includes(menu.id);
                           return (
                             <button
                               key={menu.id}
                               onClick={() => toggleMenuPermission(emp.id, menu.id)}
                               className={`p-2 rounded-lg transition-all border flex flex-col items-center gap-1
                                 ${isAllowed ? 'bg-blue-900 text-[#ccff00] border-blue-800' : 'bg-white text-slate-300 border-slate-100'}
                               `}
                             >
                               <menu.icon size={12} strokeWidth={isAllowed ? 3 : 2} />
                               <span className="text-[7px] font-black truncate w-full text-center">{menu.label}</span>
                             </button>
                           );
                         })}
                      </div>
                   </div>
                </div>
             </div>
           ))}
        </div>

        {/* Desktop View: Table (Hidden on Mobile) */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full border-collapse table-fixed">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-5 text-center font-black text-[10px] text-slate-400 uppercase tracking-widest w-[10%]">No.</th>
                <th className="p-5 text-left font-black text-[10px] text-slate-400 uppercase tracking-widest px-10 w-[20%]">사용자 기본 정보 (User Identity)</th>
                <th className="p-5 text-left px-10 font-black text-[10px] text-slate-400 uppercase tracking-widest bg-slate-100/50 w-[15%]">보안 설정 (Security)</th>
                <th className="p-5 text-center font-black text-[10px] text-slate-400 uppercase tracking-widest w-[55%]">메뉴 접근 제어 (Permissions Matrix)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeEmployees.map((emp, idx) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-all group h-24">
                  <td className="p-5 text-center text-slate-300 tabular-nums font-bold text-xs">{(idx + 1).toString().padStart(2, '0')}</td>
                  <td className="p-5 px-10">
                    <div className="flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-inner ${emp.company === 'SK' ? 'bg-blue-600' : 'bg-blue-900'}`}>
                          {emp.name.charAt(0)}
                       </div>
                       <div className="flex flex-col">
                         <div className="flex items-center gap-2">
                           <span className="font-black text-slate-700 text-base tracking-tighter">{emp.name}</span>
                           <span className="text-[9px] font-black text-slate-300 tabular-nums uppercase border border-slate-100 px-2 py-0.5 rounded leading-none pt-1">{emp.empNo}</span>
                         </div>
                         <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">{emp.positionCyrillic || emp.department}</span>
                         </div>
                       </div>
                    </div>
                  </td>
                  <td className="p-5 px-10 bg-slate-50/30">
                    <div className="flex flex-col gap-2">
                       <div className="relative">
                          <Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                          <select 
                            value={emp.role} 
                            onChange={(e) => handleRoleChange(emp.id, e.target.value as UserRole)}
                            className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-[11px] font-black uppercase text-blue-600 outline-none shadow-sm"
                          >
                            <option value="Admin">Admin</option>
                            <option value="Manager">Manager</option>
                            <option value="Staff">Staff</option>
                          </select>
                       </div>
                       <div className="relative">
                          <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                          <input 
                            type="text"
                            value={emp.password || ''}
                            onChange={(e) => handlePasswordChange(emp.id, e.target.value)}
                            className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-[12px] font-bold text-slate-700 outline-none"
                            placeholder="PWD"
                          />
                       </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="grid grid-cols-5 gap-1.5 justify-center max-w-[600px] mx-auto">
                      {allMenus.map(menu => {
                        const isAllowed = (emp.allowedMenus || []).includes(menu.id);
                        return (
                          <button
                            key={menu.id}
                            onClick={() => toggleMenuPermission(emp.id, menu.id)}
                            className={`px-3 py-2 rounded-xl text-[9px] font-black transition-all border flex flex-col items-center justify-center gap-1.5 uppercase leading-none min-h-[54px]
                              ${isAllowed ? 'bg-blue-900 text-[#ccff00] border-blue-800 shadow-lg' : 'bg-white text-slate-300 border-slate-100 hover:text-slate-600'}
                            `}
                          >
                            <menu.icon size={14} strokeWidth={isAllowed ? 3 : 2} className={isAllowed ? 'text-[#ccff00]' : 'text-slate-200'} />
                            <span className="truncate w-full text-center">{menu.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 lg:p-8 bg-blue-900 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
                 <Shield size={20} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Security Protocol Ver 7.0</p>
                 <p className="text-[9px] lg:text-[11px] font-bold text-slate-400 leading-none mt-1">권한 변경 사항은 시스템에 즉시 반영되며 로그에 기록됩니다.</p>
              </div>
           </div>
           <div className="flex items-center gap-4 text-white/20">
              <Server size={16} />
              <div className="h-4 w-px bg-white/10"></div>
              <p className="text-[9px] font-bold tracking-widest uppercase tabular-nums">IMS-AUTH-CORE Active</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
