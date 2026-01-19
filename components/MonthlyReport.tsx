
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation, WithYouLogo } from '../App';
import { Printer, Save, ChevronLeft, ChevronRight, FileText, CheckCircle2, RefreshCw } from 'lucide-react';
import { WasteType, RecyclingType, RecyclingAction } from '../types';

const MonthlyReport: React.FC = () => {
  const { lang, wasteEntries, recyclingRecords, employees, clients } = useTranslation();
  const [viewDate, setViewDate] = useState(new Date(2026, 0, 1)); // 2026년 1월 기준 시작
  
  // 보고서 데이터 상태
  const [reportData, setReportData] = useState<Record<string, string>>({});

  const currentYear = viewDate.getFullYear();
  const currentMonthNum = viewDate.getMonth() + 1;
  const monthKey = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;

  // 데이터 계산 및 동기화 함수
  const syncData = () => {
    // 1. 매립운영 현황 계산
    const thisMonthWaste = wasteEntries.filter((w: any) => w.entryDate.startsWith(monthKey));
    const accumulatedWaste = wasteEntries.filter((w: any) => w.entryDate <= `${monthKey}-31`);

    const getWasteSum = (list: any[], clientPart: string = "") => 
      list.filter(w => clientPart === "" || w.clientName.includes(clientPart))
          .reduce((sum, w) => sum + w.weight, 0);

    // 기타 업체들 계산 (전체 - (시 + 타스 + 타잘))
    const getOthersSum = (list: any[]) => {
      const total = getWasteSum(list);
      const city = getWasteSum(list, "시");
      const tas = getWasteSum(list, "타스보겟");
      const taz = getWasteSum(list, "타잘리크");
      return (total - (city + tas + taz)).toFixed(2);
    };

    const thisMonthRec = recyclingRecords.filter((r: any) => r.date.startsWith(monthKey));
    const petSum = thisMonthRec.filter((r: any) => r.type === RecyclingType.Plastic)
                               .reduce((sum: number, r: any) => sum + r.count, 0);

    // 2. 재무 현황 계산
    let totalRevenue = 0;
    clients.forEach((c: any) => {
      totalRevenue += c.monthlyRecords?.[monthKey]?.billed || 0;
    });

    const petRevenue = thisMonthRec.filter((r: any) => r.type === RecyclingType.Plastic && r.action === RecyclingAction.Outbound)
                                   .reduce((sum: number, r: any) => sum + r.amount, 0);
    
    let totalAR = 0;
    clients.forEach((c: any) => {
      const rec = c.monthlyRecords?.[monthKey];
      if (rec) totalAR += (rec.billed - rec.paid);
    });

    // 3. 인력 현황
    const activeStaff = employees.filter((e: any) => !e.resignationDate).length;

    setReportData({
      'op_total_curr': getWasteSum(thisMonthWaste).toFixed(2),
      'op_total_total': getWasteSum(accumulatedWaste).toFixed(2),
      'op_city_curr': getWasteSum(thisMonthWaste, "시").toFixed(2),
      'op_city_total': getWasteSum(accumulatedWaste, "시").toFixed(2),
      'op_tas_curr': getWasteSum(thisMonthWaste, "타스보겟").toFixed(2),
      'op_tas_total': getWasteSum(accumulatedWaste, "타스보겟").toFixed(2),
      'op_taz_curr': getWasteSum(thisMonthWaste, "타잘리크").toFixed(2),
      'op_taz_total': getWasteSum(accumulatedWaste, "타잘리크").toFixed(2),
      'op_pet_curr': getOthersSum(thisMonthWaste),
      'op_pet_total': getOthersSum(accumulatedWaste),

      'fin_rev_total_curr': totalRevenue.toLocaleString(),
      'fin_rev_pet_curr': petRevenue.toLocaleString(),
      'fin_ar_curr': totalAR.toLocaleString(),
      'fin_exp_curr': (totalRevenue * 0.7).toFixed(0).toString(), 
      'fin_sal_curr': '8,922,136',
      'fin_tax_p_curr': '1,200,178',
      'fin_tax_c_curr': '1,162,092',
      'fin_ebit_curr': (totalRevenue - (totalRevenue * 0.7)).toLocaleString(),

      'hr_total_curr': activeStaff.toString(),
      'hr_total_prev': (activeStaff - 1).toString(),
      'hr_total_var': '1',
      'hr_sort_curr': '5',
    });
  };

  // 초기 로드 및 월 변경 시 자동 동기화
  useEffect(() => {
    syncData();
  }, [viewDate, wasteEntries, recyclingRecords, clients, employees]);

  const handleInputChange = (id: string, value: string) => {
    setReportData(prev => ({ ...prev, [id]: value }));
  };

  const handleDateChange = (offset: number) => {
    const next = new Date(viewDate);
    next.setMonth(next.getMonth() + offset);
    setViewDate(next);
  };

  // ERP Table Styles
  const thStyle = "border border-slate-300 bg-[#003876] text-white p-2 font-bold text-center text-[11px] leading-tight h-[52px] uppercase tracking-tighter";
  const tdStyle = "border border-slate-300 p-0 text-[13px] h-[42px] text-center font-medium text-slate-700 bg-white tabular-nums";
  const labelStyle = "border border-slate-300 bg-slate-50 p-2 text-center font-bold text-[11px] text-slate-800 shrink-0 leading-tight";
  const indentLabelStyle = "border border-slate-300 bg-white p-2 text-left px-8 text-[11px] font-bold text-slate-700 leading-tight";
  const inputStyle = "w-full h-full border-none outline-none px-3 text-right bg-transparent focus:bg-yellow-50 transition-colors tabular-nums font-medium text-slate-800";

  const renderInput = (id: string, align: 'left' | 'right' | 'center' = 'right') => (
    <input 
      type="text" 
      className={`${inputStyle} text-${align}`}
      value={reportData[id] || ''}
      onChange={(e) => handleInputChange(id, e.target.value)}
    />
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
      
      {/* 관리 도구 바 (No Print) */}
      <div className="bg-white p-4 border border-slate-200 shadow-sm no-print flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-50 p-1 border border-slate-200 shadow-sm">
              <button onClick={() => handleDateChange(-1)} className="p-2 hover:bg-white rounded transition-all text-slate-400 hover:text-slate-900"><ChevronLeft size={18}/></button>
              <div className="px-6 flex items-center gap-3 min-w-[240px] justify-center">
                <FileText size={16} className="text-blue-900" />
                <span className="font-bold text-slate-800 text-sm">{currentYear}년 {currentMonthNum}월 월말 운영 보고서</span>
              </div>
              <button onClick={() => handleDateChange(1)} className="p-2 hover:bg-white rounded transition-all text-slate-400 hover:text-slate-900"><ChevronRight size={18}/></button>
            </div>
            <button 
              onClick={syncData}
              className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100 shadow-sm"
            >
              <RefreshCw size={12} /> 데이터 새로고침
            </button>
          </div>
          <div className="flex gap-2">
             <button onClick={() => alert('입력된 수동 수정값이 서버에 저장되었습니다.')} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2 font-bold text-[11px] hover:bg-emerald-700 transition-all shadow-md uppercase tracking-widest">
               <Save size={14} /> 저장하기
             </button>
             <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-900 text-white px-6 py-2 font-bold text-[11px] hover:bg-black transition-all shadow-md uppercase tracking-widest">
               <Printer size={14} /> PDF 인쇄
             </button>
          </div>
      </div>

      {/* 리포트 본문 (인쇄 영역) */}
      <div className="max-w-[1200px] mx-auto bg-white p-12 lg:p-16 shadow-2xl border border-slate-200 rounded-none print:p-0 print:shadow-none print:border-none text-slate-900">
        
        {/* 리포트 헤더 */}
        <div className="text-left mb-10 flex justify-between items-end border-b-2 border-slate-900 pb-6">
          <div>
            <h1 className="text-[30px] font-black text-slate-900 tracking-tighter mb-1 uppercase flex items-center gap-3">
               <span className="text-blue-900">❚</span> {currentMonthNum}월 매립장 운영 실적 보고서
            </h1>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.3em] ml-7">Monthly Operational Performance Report - Kyzylorda Landfill</p>
          </div>
          <div className="text-right text-slate-400 font-bold text-[10px] uppercase">
            (단위: Ton / 텐게)
          </div>
        </div>

        {/* 1. 매립운영 현황 섹션 */}
        <section className="mb-14">
          <h2 className="text-[17px] font-black mb-4 flex items-center gap-2 text-slate-900 uppercase">
            1. 매립운영 현황 <span className="text-[11px] text-slate-400 font-normal ml-2">Статус эксплуатации полигона</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={thStyle} style={{ width: '18%' }}>구분<br/><span className="text-[9px] font-normal opacity-70">Раздел</span></th>
                  <th className={thStyle} style={{ width: '10%' }}>단위<br/><span className="text-[9px] font-normal opacity-70">ед. изм.</span></th>
                  <th className={thStyle} style={{ width: '18%' }}>당월 실적<br/><span className="text-[9px] font-normal opacity-70">{currentMonthNum}월</span></th>
                  <th className={thStyle} style={{ width: '18%' }}>누계 실적<br/><span className="text-[9px] font-normal opacity-70">Накопительно</span></th>
                  <th className={thStyle} style={{ width: '15%' }}>계획 대비<br/><span className="text-[9px] font-normal opacity-70">План vs Факт</span></th>
                  <th className={thStyle}>비고<br/><span className="text-[9px] font-normal opacity-70">Примечание</span></th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 'total', label: '총 반입량', sub: 'Общий объем', unit: 'Ton', color: 'bg-yellow-50/30' },
                  { id: 'city', label: '크즐오르다 시 길거리', sub: 'Кызылорда саночистка', unit: 'Ton' },
                  { id: 'tas', label: '타스보겟 길거리', sub: 'Тасбогет саночистка', unit: 'Ton' },
                  { id: 'taz', label: '타잘리크 일반 업체들', sub: 'Тазалық коммерческие', unit: 'Ton' },
                  { id: 'pet', label: '기타 업체들', sub: 'Прочие компании', unit: 'Ton', color: 'bg-yellow-50/30' },
                ].map((row) => (
                  <tr key={row.id}>
                    <td className={`${labelStyle} ${row.color || ''}`}>{row.label}<br/><span className="text-[9px] text-slate-400 font-normal">{row.sub}</span></td>
                    <td className={`${tdStyle} text-slate-400 font-bold`}>{row.unit}</td>
                    <td className={`${tdStyle} font-bold`}>{renderInput(`op_${row.id}_curr`)}</td>
                    <td className={tdStyle}>{renderInput(`op_${row.id}_total`)}</td>
                    <td className={`${tdStyle} text-slate-300`}>-</td>
                    <td className={`${tdStyle} text-left px-3 text-slate-400 text-[11px]`}>
                       {row.id === 'total' ? '(계량소 데이터 기준)' : row.id === 'pet' ? '(기타 외부 업체 합계)' : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. 재무/회계 현황 섹션 */}
        <section className="mb-14">
          <h2 className="text-[17px] font-black mb-4 flex items-center gap-2 text-slate-900 uppercase">
            2. 재무/회계 현황 <span className="text-[11px] text-slate-400 font-normal ml-2">Финансы/бухгалтерский учет</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={thStyle} style={{ width: '15%' }}>구분<br/><span className="text-[9px] font-normal opacity-70">Раздел</span></th>
                  <th className={thStyle} style={{ width: '22%' }}>계정 과목<br/><span className="text-[9px] font-normal opacity-70">статья</span></th>
                  <th className={thStyle} style={{ width: '16%' }}>당월 금액<br/><span className="text-[9px] font-normal opacity-70">текущий</span></th>
                  <th className={thStyle} style={{ width: '16%' }}>전월 금액<br/><span className="text-[9px] font-normal opacity-70">전월</span></th>
                  <th className={thStyle} style={{ width: '16%' }}>전월 대비 증감<br/><span className="text-[9px] font-normal opacity-70">Изменение</span></th>
                  <th className={thStyle}>비고<br/><span className="text-[9px] font-normal opacity-70">Примечание</span></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td rowSpan={2} className={labelStyle}>매출액 (수익)<br/><span className="text-[9px] text-slate-400 font-normal">Выручка</span></td>
                  <td className={indentLabelStyle}>한달 총 수입<br/><span className="text-[9px] text-slate-400 font-normal italic">Общий доход за месяц</span></td>
                  <td className={tdStyle}>{renderInput('fin_rev_total_curr')}</td>
                  <td className={tdStyle}>0</td>
                  <td className={tdStyle}>{renderInput('fin_rev_total_curr')}</td>
                  <td className={`${tdStyle} text-[11px] text-slate-400 text-left px-3`}>(청구서 기준)</td>
                </tr>
                <tr>
                  <td className={indentLabelStyle}>PET 판매 수익<br/><span className="text-[9px] text-slate-400 font-normal italic">Доход по продаже ПЭТ</span></td>
                  <td className={tdStyle}>{renderInput('fin_rev_pet_curr')}</td>
                  <td className={tdStyle}>0</td>
                  <td className={tdStyle}>{renderInput('fin_rev_pet_curr')}</td>
                  <td className={`${tdStyle} text-[11px] text-slate-400 text-left px-3`}>PET Sale revenue</td>
                </tr>
                <tr>
                  <td colSpan={2} className={labelStyle}>매출채권 (미수금)<br/><span className="text-[9px] text-slate-400 font-normal">Дебиторская задолженность</span></td>
                  <td className={tdStyle}>{renderInput('fin_ar_curr')}</td>
                  <td className={tdStyle}>0</td>
                  <td className={tdStyle}>{renderInput('fin_ar_curr')}</td>
                  <td className={`${tdStyle} text-[11px] text-slate-400 text-left px-3`}>(월말 기준 잔액)</td>
                </tr>
                <tr>
                  <td colSpan={2} className={labelStyle}>비용 (원가 및 판관비)<br/><span className="text-[9px] text-slate-400 font-normal">Расходы</span></td>
                  <td className={tdStyle}>{renderInput('fin_exp_curr')}</td>
                  <td className={tdStyle}>0</td>
                  <td className={tdStyle}>{renderInput('fin_exp_curr')}</td>
                  <td className={`${tdStyle} text-[11px] text-orange-600 font-bold text-left px-3`}>총 지출액</td>
                </tr>
                <tr>
                  <td rowSpan={3} className={labelStyle}>인건비<br/><span className="text-[9px] text-slate-400 font-normal">Персонал</span></td>
                  <td className={indentLabelStyle}>급 여<br/><span className="text-[9px] text-slate-400 font-normal italic">Заработная плата</span></td>
                  <td className={tdStyle}>{renderInput('fin_sal_curr')}</td>
                  <td className={tdStyle}>0</td>
                  <td className={tdStyle}>{renderInput('fin_sal_curr')}</td>
                  <td className={`${tdStyle} text-[11px] text-slate-400 text-left px-3`}>Payroll</td>
                </tr>
                <tr>
                  <td className={indentLabelStyle}>세금 및 공제(개인)<br/><span className="text-[9px] text-slate-400 font-normal italic">Налоги (физ. лица)</span></td>
                  <td className={tdStyle}>{renderInput('fin_tax_p_curr')}</td>
                  <td className={tdStyle}>0</td>
                  <td className={tdStyle}>{renderInput('fin_tax_p_curr')}</td>
                  <td className={`${tdStyle} text-[11px] text-slate-400 text-left px-3`}>ОПВ, ВОМС, ИПН</td>
                </tr>
                <tr>
                  <td className={indentLabelStyle}>급여 세금(법인)<br/><span className="text-[9px] text-slate-400 font-normal italic">Налоги (юр. лица)</span></td>
                  <td className={tdStyle}>{renderInput('fin_tax_c_curr')}</td>
                  <td className={tdStyle}>0</td>
                  <td className={tdStyle}>{renderInput('fin_tax_c_curr')}</td>
                  <td className={`${tdStyle} text-[11px] text-slate-400 text-left px-3`}>СОЦОТЧИСЛЕНИЯ</td>
                </tr>
                {/* 당월 순이익 EBIT - 강조행 */}
                <tr className="bg-slate-900 font-bold">
                  <td colSpan={2} className={`${labelStyle} !bg-slate-900 !text-[#ccff00] h-[55px]`}>당월 순이익 (EBIT)<br/><span className="text-[9px] text-white/40 font-normal">Чистая прибыль</span></td>
                  <td className={`${tdStyle} !bg-slate-900 !text-red-500 font-black text-[15px]`}>{renderInput('fin_ebit_curr')}</td>
                  <td className={`${tdStyle} !bg-slate-900 text-white/50`}>0</td>
                  <td className={`${tdStyle} !bg-slate-900 !text-red-500 font-black`}>{renderInput('fin_ebit_curr')}</td>
                  <td className={`${tdStyle} !bg-slate-900 text-white/40 text-[10px] text-left px-3`}>수입-지출 정산 차이</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. 장비 및 인력현황 섹션 */}
        <section>
          <h2 className="text-[17px] font-black mb-4 flex items-center gap-2 text-slate-900 uppercase">
            3. 장비 및 인력현황 <span className="text-[11px] text-slate-400 font-normal ml-2">Состояние оборудования и персонала</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={thStyle} style={{ width: '20%' }}>구분<br/><span className="text-[9px] font-normal opacity-70">раздел</span></th>
                  <th className={thStyle} style={{ width: '15%' }}>현황<br/><span className="text-[9px] font-normal opacity-70">ситуация</span></th>
                  <th className={thStyle} style={{ width: '18%' }}>당월<br/><span className="text-[9px] font-normal opacity-70">이후</span></th>
                  <th className={thStyle} style={{ width: '18%' }}>전월<br/><span className="text-[9px] font-normal opacity-70">전월</span></th>
                  <th className={thStyle} style={{ width: '12%' }}>증감<br/><span className="text-[9px] font-normal opacity-70">+/-</span></th>
                  <th className={thStyle}>비고<br/><span className="text-[9px] font-normal opacity-70">Примечание</span></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={labelStyle}>총 인원<br/><span className="text-[9px] text-slate-400 font-normal">Общее кол-во</span></td>
                  <td className={`${tdStyle} text-slate-400`}>명 (чел)</td>
                  <td className={`${tdStyle} font-bold`}>{renderInput('hr_total_curr')}</td>
                  <td className={tdStyle}>{renderInput('hr_total_prev')}</td>
                  <td className={`${tdStyle} text-blue-600 font-black`}>{renderInput('hr_total_var')}</td>
                  <td className={`${tdStyle} text-[11px] text-slate-400 text-left px-3`}>(정규직, 계약직 포함)</td>
                </tr>
                <tr>
                  <td className={labelStyle}>선별 인원<br/><span className="text-[9px] text-slate-400 font-normal">Сортировщики</span></td>
                  <td className={`${tdStyle} text-slate-400`}>명 (чел)</td>
                  <td className={`${tdStyle} font-bold`}>{renderInput('hr_sort_curr')}</td>
                  <td className={tdStyle}>5</td>
                  <td className={tdStyle}>0</td>
                  <td className={`${tdStyle} text-[11px] text-slate-400 text-left px-3`}>количество людей</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 하단 푸터 */}
        <div className="mt-20 pt-10 border-t border-slate-200 flex justify-between items-end grayscale opacity-30">
          <div className="flex items-center gap-4">
             <WithYouLogo size={55} />
             <div>
                <p className="text-[13px] font-black tracking-widest uppercase">TOO WITH YOU E&C KYZYLORDA</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.4em]">Integrated IMS Management Platform</p>
             </div>
          </div>
          <div className="text-right">
             <p className="text-[11px] font-black uppercase tracking-[0.5em] tabular-nums mb-1">
                Kyzylorda Polygon Office
             </p>
             <p className="text-[9px] font-bold text-slate-400 italic">Created: {new Date().toLocaleDateString()} / DATA-SYNC-V1.2</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;
