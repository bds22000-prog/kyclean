
import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation, WithYouLogo } from '../App';
import { ChevronLeft, ChevronRight, Save, Printer, Calendar, ArrowUpRight, TrendingUp, RotateCcw } from 'lucide-react';
import { Client } from '../types';
import MonthlyReport from './MonthlyReport';
import PayrollStatus from './PayrollStatus';

const Finance: React.FC = () => {
  const { clients, setClients, searchTerm, financeSubTab, setFinanceSubTab, lang } = useTranslation();
  const [viewDate, setViewDate] = useState(new Date(2026, 0, 14));

  const currentMonthKey = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}`;
  const monthLabel = viewDate.toLocaleString(lang === 'ko' ? 'ko-KR' : 'ru-KZ', { year: 'numeric', month: 'long' });

  const handleRecordChange = (clientId: string, field: 'billed' | 'paid', value: string) => {
    const num = parseInt(value.replace(/[^0-9]/g, '')) || 0;
    setClients((prev: Client[]) => prev.map((c: Client) => {
      if (c.id !== clientId) return c;
      const records = { ...c.monthlyRecords };
      records[currentMonthKey] = { ...(records[currentMonthKey] || { billed: 0, paid: 0 }), [field]: num };
      return { ...c, monthlyRecords: records };
    }));
  };

  const filteredClients = useMemo(() => {
    return clients.filter((c: Client) => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (c.nameCyrillic || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  const monthSummary = useMemo(() => {
    let billed = 0, paid = 0;
    filteredClients.forEach((c: Client) => {
      const rec = c.monthlyRecords?.[currentMonthKey] || { billed: 0, paid: 0 };
      billed += rec.billed; paid += rec.paid;
    });
    return { billed, paid, ar: billed - paid };
  }, [filteredClients, currentMonthKey]);

  const excelThStyle = "border border-slate-200 bg-slate-50 p-3 text-center font-bold text-[11px] text-[#475569] uppercase tracking-widest whitespace-nowrap";
  const excelTdStyle = "border border-slate-200 p-0 text-[14px] h-11 group transition-all duration-200";
  const excelInputStyle = "w-full h-full bg-transparent border-none outline-none px-4 focus:bg-blue-50/50 transition-all font-normal text-[#475569] placeholder:text-slate-200 tabular-nums";

  const renderClientName = (name: string, nameCyrillic: string | undefined) => {
    const isCyrillicPriority = lang === 'ru' || lang === 'kz';
    return (
      <div className="flex flex-col">
        <span className="text-[#475569] font-bold">{isCyrillicPriority ? (nameCyrillic || name) : name}</span>
        <span className="text-[10px] text-slate-400 font-normal italic">{isCyrillicPriority ? name : (nameCyrillic || '')}</span>
      </div>
    );
  };

  const renderContent = () => {
    if (financeSubTab === 'monthly') return <MonthlyReport />;
    if (financeSubTab === 'payroll') return <PayrollStatus />;
    
    return (
      <div className="bg-white overflow-x-auto mt-4 animate-in fade-in duration-500 border border-[#ddd] rounded-none shadow-xl p-1">
        <table className="w-full border-collapse">
            <thead>
                <tr className="bg-slate-50">
                    <th className={excelThStyle} style={{ width: '60px' }}>No</th>
                    <th className={`${excelThStyle} text-left px-8`}>거래처명 / 적요 (VENDOR NAME / DETAILS)</th>
                    <th className={`${excelThStyle} text-right px-8`} style={{ width: '220px' }}>청구액 (A)</th>
                    <th className={`${excelThStyle} text-right px-8`} style={{ width: '220px' }}>수납액 (B)</th>
                    <th className={`${excelThStyle} text-right px-8 bg-blue-50/50 text-blue-900`} style={{ width: '240px' }}>미수금 (A-B)</th>
                    <th className={`${excelThStyle} no-print`} style={{ width: '60px' }}></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {filteredClients.map((c, idx) => {
                 const rec = c.monthlyRecords?.[currentMonthKey] || { billed: 0, paid: 0 };
                 const ar = rec.billed - rec.paid;
                 return (
                   <tr key={c.id} className="hover:bg-blue-50/20 group">
                      <td className="text-center text-[11px] font-normal text-slate-300 tabular-nums border border-slate-100">{idx + 1}</td>
                      <td className="border border-slate-100 px-8 py-3">{renderClientName(c.name, c.nameCyrillic)}</td>
                      <td className={excelTdStyle}>
                        <input className={`${excelInputStyle} text-right tabular-nums text-[16px]`} value={rec.billed.toLocaleString()} onChange={e => handleRecordChange(c.id, 'billed', e.target.value)} />
                      </td>
                      <td className={excelTdStyle}>
                        <input className={`${excelInputStyle} text-right tabular-nums text-[16px] text-emerald-600`} value={rec.paid.toLocaleString()} onChange={e => handleRecordChange(c.id, 'paid', e.target.value)} />
                      </td>
                      <td className={`${excelTdStyle} bg-blue-50/10 text-right px-8 font-normal text-red-600 text-[17px] tabular-nums`}>{ar.toLocaleString()}</td>
                      <td className="no-print text-center border border-slate-100">
                         <button className="text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><RotateCcw size={16}/></button>
                      </td>
                   </tr>
                 );
               })}
            </tbody>
            <tfoot>
                <tr className="bg-blue-900 text-white font-bold h-20 shadow-2xl">
                    <td colSpan={2} className="px-12 text-xs uppercase tracking-[0.4em] opacity-40 italic">Monthly Financial Aggregation Status</td>
                    <td className="text-right px-8 text-xl tabular-nums border-r border-white/5">{monthSummary.billed.toLocaleString()}</td>
                    <td className="text-right px-8 text-xl tabular-nums text-emerald-400 border-r border-white/5">{monthSummary.paid.toLocaleString()}</td>
                    <td className="text-right px-8 text-3xl tabular-nums text-[#FEC110] bg-black/20">{monthSummary.ar.toLocaleString()}</td>
                    <td className="no-print"></td>
                </tr>
            </tfoot>
        </table>
      </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-10" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
      <div className="bg-white rounded-none overflow-hidden shadow-[0_32px_120px_rgba(0,0,0,0.1)] border border-slate-200">
        {(financeSubTab !== 'monthly' && financeSubTab !== 'payroll') && (
          <header className="bg-gradient-to-r from-blue-800 to-blue-600 p-8 text-white no-print">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-white/20 text-[9px] font-bold rounded-none uppercase tracking-widest border border-white/30">Finance & Analytics</span>
                    <p className="text-blue-100 text-[10px] flex items-center gap-2 uppercase tracking-widest"><Calendar size={12} /> {monthLabel}</p>
                  </div>
                  <h1 className="text-3xl font-black tracking-tight uppercase">매출액 및 미수금 통합 관리</h1>
               </div>
               <div className="bg-white/10 backdrop-blur-xl px-7 py-4 border border-white/20 flex items-center gap-6 shadow-2xl">
                  <div className="flex flex-col items-end">
                      <div className="text-[10px] text-blue-200 font-black uppercase tracking-widest">CURRENT MONTH TOTAL ARREARS</div>
                      <div className="text-3xl font-black tabular-nums text-[#FEC110]">KZT {monthSummary.ar.toLocaleString()}</div>
                  </div>
               </div>
            </div>
          </header>
        )}

        <div className={(financeSubTab === 'monthly' || financeSubTab === 'payroll') ? '' : 'p-6 bg-slate-50/50 min-h-[600px]'}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Finance;
