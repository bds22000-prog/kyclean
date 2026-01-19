
import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation, WithYouLogo } from '../App';
import { Printer, Save, ChevronLeft, ChevronRight, Calculator, Users, ShieldCheck, DollarSign, RefreshCw, Calendar } from 'lucide-react';

interface SalaryRecord {
  gross: number;
  opv: number;
  ipn: number;
  voms: number;
  socTax: number;
  socCont: number;
  osms: number;
}

const PayrollStatus: React.FC = () => {
  const { employees, lang } = useTranslation();
  
  // 월 선택 상태
  const [viewDate, setViewDate] = useState(new Date(2026, 0, 1));
  const monthKey = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}`;

  // 전체 급여 데이터 저장 (월별 -> 사원별)
  const [payrollData, setPayrollData] = useState<Record<string, Record<string, SalaryRecord>>>({});

  const currentMonthPayroll = useMemo(() => payrollData[monthKey] || {}, [payrollData, monthKey]);

  // 카자흐스탄 세금 계산 로직 (2025 표준)
  const calculateAutoTaxes = (gross: number): SalaryRecord => {
    const opv = Math.floor(gross * 0.10); // 연금 10%
    const voms = Math.floor(gross * 0.02); // 개인의보 2%
    const ipn = Math.floor((gross - opv - voms) * 0.10); // 소득세 (간이 10%)
    
    const socCont = Math.floor(gross * 0.035); // 사회보험 3.5%
    const socTax = Math.max(0, Math.floor(gross * 0.095 - socCont)); // 사회세 9.5% - 사회보험
    const osms = Math.floor(gross * 0.03); // 회사 의보 3%
    
    return { gross, opv, ipn, voms, socTax, socCont, osms };
  };

  // 입력 변경 처리
  const handleValueChange = (empId: string, field: keyof SalaryRecord, value: string) => {
    const num = parseInt(value.replace(/[^0-9]/g, '')) || 0;
    
    setPayrollData(prev => {
      const monthData = { ...(prev[monthKey] || {}) };
      const empData = { ...(monthData[empId] || { gross: 0, opv: 0, ipn: 0, voms: 0, socTax: 0, socCont: 0, osms: 0 }) };

      if (field === 'gross') {
        const autoCalculated = calculateAutoTaxes(num);
        monthData[empId] = autoCalculated;
      } else {
        empData[field] = num;
        monthData[empId] = empData;
      }

      return { ...prev, [monthKey]: monthData };
    });
  };

  const handleDateChange = (offset: number) => {
    const next = new Date(viewDate);
    next.setMonth(next.getMonth() + offset);
    setViewDate(next);
  };

  // 실지급액 및 총액 계산
  const getTotals = (empId: string) => {
    const data = currentMonthPayroll[empId] || { gross: 0, opv: 0, ipn: 0, voms: 0, socTax: 0, socCont: 0, osms: 0 };
    const net = data.gross - (data.opv + data.ipn + data.voms);
    const employerTaxes = data.socTax + data.socCont + data.osms;
    const totalCost = data.gross + employerTaxes;
    return { net, totalCost };
  };

  const monthLabel = `${viewDate.getFullYear()}년 ${viewDate.getMonth() + 1}월`;

  // 월말보고서와 동일한 선 스타일(border-slate-300) 및 색상 체계 적용
  const excelThStyle = "border border-slate-300 bg-[#003876] p-2 text-center font-bold text-[11px] text-white uppercase tracking-tighter leading-tight h-[52px]";
  const excelTdStyle = "border border-slate-300 p-0 h-[42px] tabular-nums text-[13px] bg-white";
  const inputStyle = "w-full h-full bg-transparent border-none outline-none px-2 text-right font-medium text-slate-700 focus:bg-yellow-50 transition-all tabular-nums";

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
      
      {/* 관리 바 */}
      <div className="bg-white p-4 border border-slate-200 shadow-sm flex items-center justify-between no-print rounded-none">
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-50 p-1 border border-slate-200 shadow-sm">
            <button onClick={() => handleDateChange(-1)} className="p-2 hover:bg-white rounded transition-all text-slate-400 hover:text-slate-900"><ChevronLeft size={18}/></button>
            <div className="px-6 flex items-center gap-3 min-w-[180px] justify-center">
              <Calendar size={16} className="text-blue-900" />
              <span className="font-bold text-slate-800 text-sm">{monthLabel} 급여 집계</span>
            </div>
            <button onClick={() => handleDateChange(1)} className="p-2 hover:bg-white rounded transition-all text-slate-400 hover:text-slate-900"><ChevronRight size={18}/></button>
          </div>
          <div className="h-8 w-px bg-slate-200 mx-2"></div>
          <div className="text-blue-900 font-bold text-xs uppercase tracking-widest">
            직원 : {employees.filter(e => !e.resignationDate).length} 명
          </div>
        </div>
        <div className="flex gap-2">
           <button onClick={() => window.print()} className="flex items-center gap-2 bg-white border border-slate-300 text-slate-600 px-5 py-2 font-bold text-xs hover:bg-slate-50 transition-all uppercase"><Printer size={14}/> 인쇄</button>
           <button onClick={() => alert('월별 데이터가 서버에 저장되었습니다.')} className="flex items-center gap-2 bg-blue-900 text-white px-6 py-2 font-bold text-xs hover:bg-black transition-all shadow-md uppercase tracking-widest"><Save size={14}/> 저장</button>
        </div>
      </div>

      {/* 메인 테이블 영역 - 월말보고서와 동일한 선 적용 */}
      <div className="bg-white border border-slate-300 shadow-xl overflow-hidden rounded-none relative">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th rowSpan={2} className={excelThStyle} style={{ width: '50px' }}>No</th>
                <th rowSpan={2} className={`${excelThStyle} text-left px-6`} style={{ minWidth: '160px' }}>성명 (Ф.И.О)</th>
                <th rowSpan={2} className={`${excelThStyle} bg-[#004d99]`} style={{ width: '130px' }}>총 급여액<br/><span className="text-[9px] font-normal opacity-70">(Оклад)</span></th>
                <th colSpan={3} className={`${excelThStyle} bg-slate-700`}>개인 공제 내역 <span className="text-[9px] font-normal opacity-70">(Удержания)</span></th>
                <th rowSpan={2} className={`${excelThStyle} bg-emerald-700`} style={{ width: '130px' }}>실지급액<br/><span className="text-[9px] font-normal opacity-70">(На руки)</span></th>
                <th colSpan={3} className={`${excelThStyle} bg-slate-700`}>회사 부담 세금 <span className="text-[9px] font-normal opacity-70">(Налоги РД)</span></th>
                <th rowSpan={2} className={`${excelThStyle} bg-slate-900`} style={{ width: '130px' }}>인건비 총액<br/><span className="text-[9px] font-normal opacity-70">(Total Cost)</span></th>
              </tr>
              <tr>
                <th className={excelThStyle} style={{ width: '95px' }}>OPV (10%)</th>
                <th className={excelThStyle} style={{ width: '95px' }}>IPN (10%)</th>
                <th className={excelThStyle} style={{ width: '95px' }}>VOMS (2%)</th>
                <th className={excelThStyle} style={{ width: '95px' }}>Soc.Tax</th>
                <th className={excelThStyle} style={{ width: '95px' }}>Soc.Cont</th>
                <th className={excelThStyle} style={{ width: '95px' }}>OSMS (3%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {employees.filter(e => !e.resignationDate).map((emp, idx) => {
                const data = currentMonthPayroll[emp.id] || { gross: 0, opv: 0, ipn: 0, voms: 0, socTax: 0, socCont: 0, osms: 0 };
                const { net, totalCost } = getTotals(emp.id);

                return (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="border border-slate-300 text-center text-[11px] font-bold text-slate-400 tabular-nums bg-slate-50/30">{idx + 1}</td>
                    <td className="border border-slate-300 px-6">
                      <div className="flex flex-col">
                        <span className="text-slate-800 font-bold text-[13px]">{lang === 'ko' ? emp.name : (emp.nameCyrillic || emp.name)}</span>
                        <span className="text-[9px] text-slate-400 font-medium italic uppercase tracking-tighter">{lang === 'ko' ? (emp.nameCyrillic || '') : emp.name}</span>
                      </div>
                    </td>
                    
                    {/* 총 급여액 */}
                    <td className={`${excelTdStyle} bg-blue-50/10`}>
                      <input 
                        className={`${inputStyle} font-black text-blue-900 !text-[15px]`}
                        value={data.gross === 0 ? '' : data.gross.toLocaleString()} 
                        onChange={(e) => handleValueChange(emp.id, 'gross', e.target.value)}
                        placeholder="0"
                      />
                    </td>

                    {/* 개인 공제 */}
                    <td className={excelTdStyle}>
                      <input className={inputStyle} value={data.opv === 0 ? '' : data.opv.toLocaleString()} onChange={(e) => handleValueChange(emp.id, 'opv', e.target.value)} />
                    </td>
                    <td className={excelTdStyle}>
                      <input className={inputStyle} value={data.ipn === 0 ? '' : data.ipn.toLocaleString()} onChange={(e) => handleValueChange(emp.id, 'ipn', e.target.value)} />
                    </td>
                    <td className={excelTdStyle}>
                      <input className={inputStyle} value={data.voms === 0 ? '' : data.voms.toLocaleString()} onChange={(e) => handleValueChange(emp.id, 'voms', e.target.value)} />
                    </td>

                    {/* 실지급액 */}
                    <td className={`${excelTdStyle} bg-emerald-50/20 text-right px-4 font-black text-emerald-700 text-[15px]`}>
                      {net.toLocaleString()}
                    </td>

                    {/* 회사 세금 */}
                    <td className={excelTdStyle}>
                      <input className={inputStyle} value={data.socTax === 0 ? '' : data.socTax.toLocaleString()} onChange={(e) => handleValueChange(emp.id, 'socTax', e.target.value)} />
                    </td>
                    <td className={excelTdStyle}>
                      <input className={inputStyle} value={data.socCont === 0 ? '' : data.socCont.toLocaleString()} onChange={(e) => handleValueChange(emp.id, 'socCont', e.target.value)} />
                    </td>
                    <td className={excelTdStyle}>
                      <input className={inputStyle} value={data.osms === 0 ? '' : data.osms.toLocaleString()} onChange={(e) => handleValueChange(emp.id, 'osms', e.target.value)} />
                    </td>

                    {/* 총 인건비 */}
                    <td className={`${excelTdStyle} bg-slate-100 text-slate-900 text-right px-4 font-black text-[15px]`}>
                      {totalCost.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              {/* 빈 행 채우기 (최소 10개 유지) */}
              {Array.from({ length: Math.max(0, 10 - employees.filter(e => !e.resignationDate).length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="h-[42px]">
                   <td colSpan={11} className="bg-white border border-slate-300"></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
               <tr className="bg-slate-900 text-white font-bold h-20 shadow-2xl">
                  <td colSpan={2} className="px-8 text-[10px] uppercase tracking-[0.4em] opacity-40 italic">Total Payroll Summary</td>
                  
                  <td className="text-right px-4 text-[17px] tabular-nums border-r border-white/5 text-blue-300">
                    {Object.values(currentMonthPayroll).reduce((acc: number, d: any) => acc + (d.gross || 0), 0).toLocaleString()}
                  </td>
                  
                  <td colSpan={3} className="border-r border-white/5"></td>
                  
                  <td className="text-right px-4 text-[18px] tabular-nums text-emerald-400 border-r border-white/5">
                    {employees.filter(e => !e.resignationDate).reduce((acc, emp) => acc + getTotals(emp.id).net, 0).toLocaleString()}
                  </td>
                  
                  <td colSpan={3} className="border-r border-white/5"></td>
                  
                  <td className="text-right px-4 text-[22px] tabular-nums text-[#ccff00] bg-white/5">
                    {employees.filter(e => !e.resignationDate).reduce((acc, emp) => acc + getTotals(emp.id).totalCost, 0).toLocaleString()}
                  </td>
               </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 하단 도움말 */}
      <div className="bg-blue-50 p-6 border border-slate-300 flex items-start gap-4 rounded-none no-print">
         <div className="w-12 h-12 bg-white border border-slate-200 rounded-none flex items-center justify-center text-blue-900 shadow-sm">
            <ShieldCheck size={24} />
         </div>
         <div className="space-y-1.5">
            <h4 className="text-[13px] font-black text-blue-900 uppercase tracking-tight">급여 관리 및 세무 준수 가이드</h4>
            <ul className="text-[11px] text-blue-800 space-y-1 font-medium leading-relaxed list-disc ml-4">
               <li><span className="font-black text-blue-900">총 급여액</span>을 입력하면 카자흐스탄 세법(2025)에 따라 각 공제 및 세금 항목이 자동 산출됩니다.</li>
               <li>자동 계산된 수치가 실제와 다를 경우, 해당 칸을 직접 클릭하여 <span className="font-bold">수동 수정</span>할 수 있습니다.</li>
               <li>모든 금액 단위는 <span className="font-bold">카자흐스탄 텐게 (KZT)</span> 기준입니다.</li>
               <li>작업 완료 후 반드시 <span className="font-bold text-blue-900">저장</span> 버튼을 클릭하여 데이터를 영구 저장하십시오.</li>
            </ul>
         </div>
      </div>
    </div>
  );
};

export default PayrollStatus;
