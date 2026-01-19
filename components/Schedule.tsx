
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation, WithYouLogo } from '../App';
import { 
  ChevronLeft, ChevronRight, Printer, Calendar as CalendarIcon, 
  MapPin, Flag, Clock, CheckSquare, Search, Plus, Save, Trash2, X,
  Globe, RefreshCw, StickyNote, Edit, RotateCcw, Copy, Delete, User, Check, Wallet, TrendingUp
} from 'lucide-react';
import { ScheduleEvent } from '../types';

const KZ_HOLIDAYS: Record<string, { ko: string; ru: string; kz: string }> = {
  '01-01': { ko: '신정', ru: 'Новый год', kz: 'Жаңа жыл' },
  '01-02': { ko: '신정 연휴', ru: 'Новый год', kz: 'Жาңа жыл' },
  '01-07': { ko: '정교회 크리스마스', ru: 'Рождество Христово', kz: 'Рождество' },
  '03-08': { ko: '국제 여성의 날', ru: 'Международный женский день', kz: 'Халықаралық ә일더 кү니' },
  '03-21': { ko: '나우르즈', ru: 'Наурызы 메이라미', kz: 'Наурыз 메йрамы' },
  '03-22': { ko: '나우르즈', ru: 'Наурызы 메이라미', kz: 'Наурыз 메йрамы' },
  '03-23': { ko: '나우르즈 연휴', ru: 'Наурызы 메이라미', kz: 'Наурыз 메йрамы' },
  '05-01': { ko: '단결의 날', ru: 'День единства народа Казахстана', kz: 'Қазақстан халқының бірлігі мере케сі' },
  '05-07': { ko: '조국 수호자의 날', ru: 'День защитника Отечества', kz: 'Отан қорғаушылар күні' },
  '05-09': { ko: '승리의 날', ru: 'День Победы', kz: 'Жеңіс күні' },
  '07-06': { ko: '수도의 날', ru: 'День Столицы', kz: 'Астана күні' },
  '08-30': { ko: '헌법의 날', ru: 'День Конституции РК', kz: 'ҚР Конституциясы күні' },
  '10-25': { ko: '공화국의 날', ru: 'День Республики', kz: 'Республика күні' },
  '12-16': { ko: '독립 기념일', ru: 'День Независимости', kz: 'Тәуелсіздік кү니' },
};

const Schedule: React.FC = () => {
  const { scheduleSubTab, lang, t, user } = useTranslation();
  const [viewDate, setViewDate] = useState(new Date(2026, 1, 1)); 

  // Calculator State
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [formula, setFormula] = useState('');
  const [isWaitingForNext, setIsWaitingForNext] = useState(false);
  const [memory, setMemory] = useState<number>(0);

  // Notepad State
  const [memo, setMemo] = useState('');

  // Inline Input State for Calendar
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [inlineInput, setInlineInput] = useState('');

  const [events, setEvents] = useState<ScheduleEvent[]>([
    { id: 'e1', date: '2026-02-04', title: '배사장님 귀국', category: 'Other' },
    { id: 'e2', date: '2026-02-04', title: '이사님 현장 방문', category: 'Inspection' },
    { id: 'e3', date: '2026-02-10', title: '부사장님 귀국', category: 'Other' },
    { id: 'e4', date: '2026-02-10', title: '출장자 입국', category: 'Other' },
    { id: 'e5', date: '2026-02-16', title: '본사 보고', category: 'Meeting' },
    { id: 'e6', date: '2026-02-16', title: '현장 안전 점검', category: 'Inspection' },
    { id: 'e7', date: '2026-02-22', title: '중장비 수리', category: 'Maintenance' },
    { id: 'e8', date: '2026-02-28', title: '아이디어 미팅', category: 'Meeting' },
    { id: 'e9', date: '2026-02-28', title: '결산 보고', category: 'Other' },
  ]);

  const [personalEvents, setPersonalEvents] = useState<ScheduleEvent[]>([
    { id: 'p1', date: '2026-02-14', title: '가족 통화 예약', category: 'Other' },
    { id: 'p2', date: '2026-02-20', title: '개인 비자 갱신 확인', category: 'Other' },
  ]);

  const [expenseEvents, setExpenseEvents] = useState<ScheduleEvent[]>([
    { id: 'x1', date: '2026-02-01', title: '식자재 구매 (12,500₸)', category: 'Other' },
    { id: 'x2', date: '2026-02-02', title: '유류비 결제 (50,000₸)', category: 'Other' },
  ]);

  const [inputValues, setInputValues] = useState<Record<number, string>>({});
  const [expenseInputValues, setExpenseInputValues] = useState<Record<number, string>>({});

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const getEventsForDay = (day: number, type: 'daily' | 'personal' | 'expenses' = 'daily') => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (type === 'personal') return personalEvents.filter(e => e.date === dateStr);
    if (type === 'expenses') return expenseEvents.filter(e => e.date === dateStr);
    return events.filter(e => e.date === dateStr);
  };

  // Helper to extract and sum numeric values from text titles (e.g. "Lunch 5000" -> 5000)
  const getDailyExpenseTotal = useCallback((day: number) => {
    const dayEvents = getEventsForDay(day, 'expenses');
    let total = 0;
    dayEvents.forEach(e => {
      const match = e.title.match(/[\d,]+/g);
      if (match) {
        match.forEach(m => {
          const val = parseInt(m.replace(/,/g, ''));
          if (!isNaN(val)) total += val;
        });
      }
    });
    return total;
  }, [expenseEvents, year, month]);

  const monthlyExpenseTotal = useMemo(() => {
    let total = 0;
    expenseEvents.filter(e => e.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).forEach(e => {
       const match = e.title.match(/[\d,]+/g);
       if (match) {
         match.forEach(m => {
           const val = parseInt(m.replace(/,/g, ''));
           if (!isNaN(val)) total += val;
         });
       }
    });
    return total;
  }, [expenseEvents, year, month]);

  const handleAddEvent = (day: number, directTitle?: string) => {
    const currentTab = scheduleSubTab;
    const isExp = currentTab === 'expenses';
    const isPer = currentTab === 'personal';
    
    const inputMap = isExp ? expenseInputValues : inputValues;
    const title = directTitle || inputMap[day];
    
    if (!title || !title.trim()) return;

    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const newEvent: ScheduleEvent = {
      id: `${isExp ? 'x' : isPer ? 'p' : 'e'}-${Date.now()}`,
      date: dateStr,
      title: title.trim(),
      category: 'Other'
    };

    if (isExp) {
      setExpenseEvents(prev => [...prev, newEvent]);
      if (!directTitle) setExpenseInputValues(prev => ({ ...prev, [day]: '' }));
    } else if (isPer) {
      setPersonalEvents(prev => [...prev, newEvent]);
      if (!directTitle) setInputValues(prev => ({ ...prev, [day]: '' }));
    } else {
      setEvents(prev => [...prev, newEvent]);
      if (!directTitle) setInputValues(prev => ({ ...prev, [day]: '' }));
    }
    
    if (directTitle) {
      setEditingDay(null);
      setInlineInput('');
    }
  };

  const handleDeleteEvent = (id: string, type: 'daily' | 'personal' | 'expenses' = 'daily') => {
    if (type === 'personal') {
      setPersonalEvents(prev => prev.filter(e => e.id !== id));
    } else if (type === 'expenses') {
      setExpenseEvents(prev => prev.filter(e => e.id !== id));
    } else {
      setEvents(prev => prev.filter(e => e.id !== id));
    }
  };

  const calendarData = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    
    const prevDays = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      prevDays.push({ day: prevMonthLastDate - i, type: 'prev' });
    }
    
    const currentDays = [];
    for (let d = 1; d <= daysInMonth; d++) {
      currentDays.push({ day: d, type: 'current' });
    }
    
    const nextDays = [];
    const remaining = 42 - (prevDays.length + currentDays.length);
    for (let i = 1; i <= remaining; i++) {
      nextDays.push({ day: i, type: 'next' });
    }
    
    return [...prevDays, ...currentDays, ...nextDays];
  }, [year, month]);

  const miniCalendarData = useMemo(() => {
    const nextMonth = new Date(year, month + 1, 1);
    const nmYear = nextMonth.getFullYear();
    const nmMonth = nextMonth.getMonth();
    const daysInMonth = new Date(nmYear, nmMonth + 1, 0).getDate();
    const firstDay = new Date(nmYear, nmMonth, 1).getDay();
    
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length < 35) cells.push(null);
    
    return { year: nmYear, month: nmMonth + 1, cells };
  }, [year, month]);

  const renderEventBadge = (event: ScheduleEvent, type: 'daily' | 'personal' | 'expenses' = 'daily') => {
    let colorClass = type === 'personal' ? "bg-indigo-600" : type === 'expenses' ? "bg-emerald-600" : "bg-blue-600";
    if (event.category === 'Inspection') colorClass = "bg-green-600";
    if (event.category === 'Meeting') colorClass = "bg-blue-500";
    if (event.category === 'Maintenance') colorClass = "bg-emerald-600";
    if (event.title.includes('사장') || event.title.includes('귀국')) colorClass = "bg-red-500";
    if (event.title.includes('결산')) colorClass = "bg-amber-400 text-black";

    return (
      <div key={event.id} className={`flex items-center group/badge relative gap-1 px-1.5 py-0.5 ${colorClass} text-white rounded-[2px] mb-1 truncate shadow-sm`}>
        <div className={`w-1.5 h-1.5 ${type !== 'daily' ? 'bg-white' : 'bg-white/40'} rounded-full shrink-0`}></div>
        <span className="text-[9px] font-bold tracking-tighter leading-none truncate">{event.title}</span>
        <button 
          onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id, type); }}
          className="absolute right-0 top-0 bottom-0 bg-black/20 px-1 opacity-0 group-hover/badge:opacity-100 transition-opacity"
        >
          <X size={8} />
        </button>
      </div>
    );
  };

  // Calculator logic
  const performCalc = () => {
    const current = parseFloat(calcDisplay);
    if (prevValue === null || operation === null) return;
    
    let result = 0;
    switch(operation) {
      case '+': result = prevValue + current; break;
      case '-': result = prevValue - current; break;
      case '*': result = prevValue * current; break;
      case '/': result = prevValue / current; break;
      case '^': result = Math.pow(prevValue, current); break;
    }
    const resultStr = String(result);
    setCalcDisplay(resultStr);
    setPrevValue(result);
    setIsWaitingForNext(true);
    setFormula(prev => prev + ' ' + current + ' =');
  };

  const handleCalcBtn = (val: string) => {
    const currentNum = parseFloat(calcDisplay);

    if (['+', '-', '*', '/', '^'].includes(val)) {
      if (operation !== null && !isWaitingForNext) {
        performCalc();
      } else {
        setPrevValue(currentNum);
      }
      setOperation(val);
      setFormula(`${currentNum} ${val}`);
      setIsWaitingForNext(true);
    } else if (val === '=') {
      performCalc();
      setOperation(null);
    } else if (val === 'C') {
      setCalcDisplay('0');
      setPrevValue(null);
      setOperation(null);
      setFormula('');
      setIsWaitingForNext(false);
    } else if (val === 'B') {
      setCalcDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else if (val === '√') {
      const res = Math.sqrt(currentNum);
      setCalcDisplay(String(res));
      setFormula(`√(${currentNum})`);
      setIsWaitingForNext(true);
    } else if (val === 'x²') {
      const res = currentNum * currentNum;
      setCalcDisplay(String(res));
      setFormula(`sqr(${currentNum})`);
      setIsWaitingForNext(true);
    } else if (val === '%') {
      const res = currentNum / 100;
      setCalcDisplay(String(res));
      setIsWaitingForNext(true);
    } else if (val === '±') {
      setCalcDisplay(String(currentNum * -1));
    } else if (val === '1/x') {
      setCalcDisplay(String(1 / currentNum));
      setFormula(`1/(${currentNum})`);
      setIsWaitingForNext(true);
    } else if (val === 'M+') {
      setMemory(prev => prev + currentNum);
      setIsWaitingForNext(true);
    } else if (val === 'MR') {
      setCalcDisplay(String(memory));
      setIsWaitingForNext(true);
    } else if (val === 'MC') {
      setMemory(0);
    } else {
      if (calcDisplay === '0' || isWaitingForNext) {
        setCalcDisplay(val);
        setIsWaitingForNext(false);
      } else {
        setCalcDisplay(prev => prev + val);
      }
    }
  };

  const renderExchangeRates = () => {
    const rates = [
      { from: 'USD', to: 'KZT', fromName: '미국', toName: '카자흐스탄', rate: '512.45', trend: '+1.20', fromFlag: 'us', toFlag: 'kz' },
      { from: 'KRW', to: 'KZT', fromName: '대한민국', toName: '카자흐스탄', rate: '0.358', trend: '-0.002', fromFlag: 'kr', toFlag: 'kz' },
      { from: 'USD', to: 'KRW', fromName: '미국', toName: '대한민국', rate: '1,431.2', trend: '+4.5', fromFlag: 'us', toFlag: 'kr' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 w-full max-w-[1000px]">
        {rates.map((r, i) => (
          <div key={i} className="bg-white/40 backdrop-blur-md p-5 rounded-[24px] border border-white/60 shadow-lg flex items-center justify-between group hover:bg-white/60 transition-all cursor-default">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                 <img src={`https://flagcdn.com/w80/${r.fromFlag}.png`} className="w-10 h-6 rounded shadow-sm object-cover border border-slate-200" alt={r.from} />
                 <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-800 leading-none">{r.fromName}</span>
                    <span className="text-[10px] font-bold text-slate-400 mt-0.5">{r.from}</span>
                 </div>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="flex flex-col">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{r.from} ⇄ {r.to}</p>
                <h5 className="text-lg font-black text-slate-800 tabular-nums tracking-tighter">
                   {r.rate} <span className="text-[10px] font-normal text-slate-400 ml-1">{r.to}</span>
                </h5>
              </div>
            </div>
            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {r.trend}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCalculatorArea = () => {
    const btns = [
      '%', '√', 'x²', '1/x', 'C',
      '7', '8', '9', '/', 'B',
      '4', '5', '6', '*', '±',
      '1', '2', '3', '-', '^',
      '0', '.', '=', '+', 'M+'
    ];
    const memBtns = ['MC', 'MR'];

    return (
      <div className="flex flex-col items-center justify-center p-4 lg:p-10 animate-in fade-in duration-700 w-full max-w-[1200px] mx-auto">
        {renderExchangeRates()}
        <div className="flex flex-col xl:flex-row gap-10 items-stretch justify-center w-full">
          <div className="w-full max-w-[480px] bg-[#f0f9ff] p-8 rounded-[48px] shadow-[0_40px_100px_rgba(0,0,0,0.1)] border-8 border-blue-100 flex flex-col group relative">
            <div className="absolute -top-4 -left-4 bg-blue-600 text-white px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl group-hover:scale-105 transition-transform z-10">Advanced IMS Calc</div>
            <div className="mb-8 pt-4">
              <div className="text-[12px] text-blue-700 font-bold uppercase tracking-widest text-right mb-2 tabular-nums h-5 overflow-hidden">
                {formula || (operation ? `${prevValue} ${operation}` : '')}
              </div>
              <div className="bg-blue-900/10 px-8 py-10 rounded-3xl border border-blue-200/50 shadow-inner text-right relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                   <WithYouLogo size={60} />
                </div>
                {memory !== 0 && <span className="absolute left-6 top-6 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">Memory</span>}
                <span className="text-5xl font-black text-blue-800 tabular-nums font-digital leading-none tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                  {parseFloat(calcDisplay).toLocaleString(undefined, { maximumFractionDigits: 10 })}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {memBtns.map(btn => (
                <button key={btn} onClick={() => handleCalcBtn(btn)} className="h-10 rounded-xl bg-blue-100 text-blue-700 font-black text-[11px] uppercase hover:bg-blue-200 transition-all border border-blue-200">
                  {btn}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-3">
              {btns.map((btn, i) => {
                const isOperator = ['+', '-', '*', '/', '^', '=', '√', 'x²', '1/x', '%', '±'].includes(btn);
                const isAction = ['C', 'B', 'M+'].includes(btn);
                return (
                  <button
                    key={i}
                    onClick={() => handleCalcBtn(btn)}
                    className={`h-14 lg:h-16 rounded-2xl font-black text-[15px] transition-all active:scale-90 shadow-sm flex items-center justify-center border
                      ${isOperator 
                        ? btn === '=' ? 'bg-blue-600 text-white border-blue-700 shadow-blue-200/50' : 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200' 
                        : isAction 
                        ? 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100' 
                        : 'bg-white text-blue-900 border-blue-100 hover:bg-slate-50 shadow-inner'}
                      ${btn === '=' ? 'col-span-1' : ''}
                      ${btn === 'M+' ? 'bg-blue-600 text-white' : ''}
                    `}
                  >
                    {btn === 'B' ? <Delete size={20} /> : btn}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="w-full max-w-[480px] bg-[#fffdf0] rounded-[40px] shadow-2xl border border-yellow-200/40 overflow-hidden flex flex-col">
             <div className="bg-yellow-100/30 px-8 py-5 border-b border-yellow-200/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-sm">
                      <StickyNote size={20} />
                   </div>
                   <div>
                      <h3 className="text-sm font-black text-amber-900 uppercase tracking-tighter">실시간 업무 메모</h3>
                      <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest leading-none mt-0.5">Calculation & Memo Pad</p>
                   </div>
                </div>
                <button onClick={() => setMemo('')} className="p-2.5 text-amber-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="지우기">
                   <RotateCcw size={18} />
                </button>
             </div>
             <div className="flex-1 relative">
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(#d97706_1px,transparent_1px)] bg-[size:100%_40px] mt-12"></div>
                <textarea 
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="계산 결과나 중요한 업무 내용을 이곳에 기록하세요..."
                  className="w-full h-full p-10 outline-none text-[15px] font-medium leading-[40px] text-amber-900 resize-none bg-transparent placeholder:text-amber-200/50 placeholder:italic"
                  style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}
                />
             </div>
             <div className="p-6 bg-yellow-50/20 border-t border-yellow-100/50 flex items-center justify-between">
                <div className="flex gap-2">
                   <button className="p-2 text-amber-400 hover:text-amber-600 transition-colors"><Edit size={16}/></button>
                   <button className="p-2 text-amber-400 hover:text-amber-600 transition-colors" onClick={() => { navigator.clipboard.writeText(memo); alert('클립보드에 복사되었습니다.'); }}><Copy size={16}/></button>
                </div>
                <button 
                  onClick={() => { if(!memo.trim()) return; alert('메모가 시스템 클라우드에 임시 저장되었습니다.'); }}
                  className="flex items-center gap-2 bg-[#ccff00] text-slate-900 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-[#b8e600] transition-all"
                >
                   <Save size={14} /> 저장하기
                </button>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCalendarView = (isPersonal = false) => {
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="flex flex-col xl:flex-row gap-6 items-start animate-in fade-in slide-in-from-top-4 duration-700">
        <div className={`flex-1 bg-white border ${isPersonal ? 'border-indigo-300 shadow-indigo-100' : 'border-[#ddd]'} shadow-2xl overflow-hidden`}>
          {isPersonal && (
            <div className="bg-indigo-900 px-8 py-3 flex items-center gap-3">
               <User size={16} className="text-indigo-200" />
               <span className="text-[11px] font-black text-white uppercase tracking-widest">{user.name}님 전용 개인 비공개 달력</span>
            </div>
          )}
          <div className="p-8 flex justify-between items-end border-b border-[#ddd] bg-white">
             <div className="flex items-baseline gap-4">
                <span className={`text-8xl font-black ${isPersonal ? 'text-indigo-900' : 'text-slate-900'} leading-none tabular-nums tracking-tighter`}>
                  {String(month + 1).padStart(2, '0')}
                </span>
                <div className="flex flex-col">
                   <span className="text-2xl font-black text-slate-900 uppercase">월</span>
                   <span className="text-xl font-bold text-slate-300 tabular-nums">{String(year).slice(-2)} 년</span>
                </div>
             </div>
             <div className="flex flex-col items-end">
                <div className={`${isPersonal ? 'bg-indigo-900' : 'bg-[#003876]'} p-4 mb-2 shadow-xl`}>
                   <WithYouLogo size={60} white />
                </div>
                <span className="text-[11px] font-black text-slate-400 tracking-[0.3em] uppercase">KYZYLORDA INTEGRATED IMS</span>
             </div>
          </div>

          <div className={`grid grid-cols-7 ${isPersonal ? 'bg-indigo-900' : 'bg-[#003876]'} text-white`}>
            {dayLabels.map((label, idx) => (
              <div key={label} className={`py-3 text-center text-[12px] font-black uppercase tracking-[0.2em] border-r border-white/5 last:border-none ${idx === 0 ? 'text-red-300' : ''}`}>
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 border-l border-[#ddd]">
            {calendarData.map((item, idx) => {
              const isCurrent = item.type === 'current';
              const d = item.day;
              const dateKey = `${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const holiday = isCurrent ? KZ_HOLIDAYS[dateKey] : null;
              const isSun = idx % 7 === 0;
              const dayEvents = isCurrent ? getEventsForDay(d, 'daily') : [];
              const dayPersonalEvents = isCurrent && isPersonal ? getEventsForDay(d, 'personal') : [];
              const dayExpenseEvents = isCurrent ? getEventsForDay(d, 'expenses') : [];
              const isEditing = isPersonal && editingDay === d;

              return (
                <div 
                  key={idx} 
                  className={`min-h-[140px] border-r border-b border-[#ddd] p-2 hover:bg-slate-50 transition-all group relative ${!isCurrent ? 'bg-slate-50/50' : isSun || holiday ? 'bg-red-50/5' : 'bg-white'}`}
                  onClick={() => { if(isPersonal && isCurrent) setEditingDay(d); }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className={`text-[12px] font-bold tabular-nums ${!isCurrent ? 'text-slate-300' : isSun || holiday ? 'text-red-500' : 'text-slate-900'}`}>
                      {d}
                    </div>
                    {isPersonal && isCurrent && !isEditing && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingDay(d); }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-indigo-400 hover:text-indigo-600 transition-all"
                      >
                        <Plus size={14} />
                      </button>
                    )}
                    {holiday && (
                      <span className="text-[8px] font-black text-red-500 bg-red-100 px-1 py-0.5 rounded-sm uppercase tracking-tighter">
                        {lang === 'ko' ? holiday.ko : holiday.ru}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1 mt-1 overflow-y-auto max-h-[80px] no-scrollbar">
                    {dayEvents.map(e => renderEventBadge(e, 'daily'))}
                    {dayPersonalEvents.map(e => renderEventBadge(e, 'personal'))}
                    {dayExpenseEvents.map(e => renderEventBadge(e, 'expenses'))}
                  </div>

                  {isEditing && (
                    <div className="absolute inset-0 z-10 bg-white/95 p-2 flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-indigo-600 uppercase">개인 일정 등록</span>
                          <button onClick={() => setEditingDay(null)}><X size={12} className="text-slate-400"/></button>
                       </div>
                       <input 
                         autoFocus
                         className="flex-1 w-full text-[11px] font-bold border-b-2 border-indigo-600 outline-none p-1 text-slate-800 bg-transparent"
                         placeholder="내용 입력..."
                         value={inlineInput}
                         onChange={e => setInlineInput(e.target.value)}
                         onKeyDown={e => {
                            if (e.key === 'Enter') handleAddEvent(d, inlineInput);
                            if (e.key === 'Escape') setEditingDay(null);
                         }}
                       />
                       <div className="flex gap-1 mt-2">
                          <button 
                            onClick={() => handleAddEvent(d, inlineInput)}
                            className="flex-1 bg-indigo-600 text-white py-1.5 rounded-sm font-black text-[9px] uppercase shadow-md flex items-center justify-center gap-1"
                          >
                             <Check size={10} /> 저장
                          </button>
                       </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full xl:w-[200px] flex flex-col gap-6 no-print">
           <div className={`${isPersonal ? 'bg-indigo-900' : 'bg-[#003876]'} text-white p-3 text-center font-black text-[12px] tracking-widest uppercase shadow-lg`}>
              {String(miniCalendarData.year).slice(-2)}년 {miniCalendarData.month}월
           </div>
           <div className="bg-white border border-slate-300 p-2 shadow-sm">
              <div className="grid grid-cols-7 text-[8px] font-black text-center border-b border-slate-100 pb-2 mb-2 text-slate-400">
                 {['日', '月', '火', '수', '木', '金', '土'].map(d => <span key={d}>{d}</span>)}
              </div>
              <div className="grid grid-cols-7 text-[9px] font-bold text-center gap-y-1.5 tabular-nums">
                 {miniCalendarData.cells.map((cell, i) => (
                   <span key={i} className={cell === null ? 'text-transparent' : 'text-slate-600'}>
                     {cell || ''}
                   </span>
                 ))}
              </div>
           </div>

           <div className="bg-slate-50 border border-slate-200 p-3 rounded-none shadow-inner">
              <h4 className="inline-block bg-slate-900 text-white px-2 py-1 text-[8px] font-black uppercase tracking-widest mb-3 shadow-md">
                 이번 달 연휴
              </h4>
              <div className="space-y-2">
                 {Object.entries(KZ_HOLIDAYS)
                    .filter(([key]) => key.startsWith(String(month + 1).padStart(2, '0')))
                    .map(([date, h], i) => (
                   <div key={i} className="flex items-start gap-1.5 text-[9px] border-b border-dotted border-slate-300 pb-1.5 last:border-none group">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 shrink-0"></div>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 tabular-nums leading-tight">{date.split('-')[1]}일</span>
                        <span className="text-slate-500 font-bold group-hover:text-red-500 transition-colors leading-tight">{lang === 'ko' ? h.ko : h.ru}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    );
  };

  const renderDaily = (type: 'daily' | 'expenses' = 'daily') => {
    const isExp = type === 'expenses';
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    const themeColor = isExp ? "#10b981" : "#00AFCA";
    const headerColor = isExp ? "bg-emerald-800" : "bg-[#003876]";

    return (
      <div className="max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="bg-white p-10 rounded-none border border-slate-200 shadow-2xl overflow-hidden print:p-0 print:border-none print:shadow-none">
          <div className="flex items-center justify-between mb-10 no-print">
            <div className="flex items-center gap-5">
              <div className={`w-16 h-16 rounded-none flex items-center justify-center text-white shadow-2xl border-b-4 ${isExp ? 'bg-emerald-500 border-emerald-800' : 'bg-[#00AFCA] border-blue-800'}`}>
                {isExp ? <Wallet size={32}/> : <CalendarIcon size={32} />}
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-2xl uppercase tracking-tighter leading-none">
                  {isExp ? '일별 지출 내역 (Daily Expenses)' : '일별 세부 업무 일정 (Daily Operations)'}
                </h4>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2 italic">
                  {isExp ? 'Enter daily expense details to track site spending' : 'Scheduled entries will reflect on the monthly master report'}
                </p>
              </div>
            </div>
            
            {/* 요약 카드 영역 */}
            <div className="flex gap-6 items-center">
               {isExp && (
                 <div className="flex gap-8 px-8 border-r border-slate-200 mr-2">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                          <TrendingUp size={24} />
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">월 지출계</p>
                          <h5 className="text-xl font-black text-emerald-600 tabular-nums leading-none">
                             {monthlyExpenseTotal.toLocaleString()} <span className="text-[10px] text-slate-400 uppercase">₸</span>
                          </h5>
                       </div>
                    </div>
                 </div>
               )}
               <button onClick={() => alert('모든 변경사항이 시스템에 동기화되었습니다.')} className={`px-10 py-4 text-white font-black text-[11px] uppercase rounded-none transition-all shadow-2xl flex items-center gap-3 ${isExp ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-[#00AFCA] hover:bg-[#008ba3] shadow-cyan-100'}`}><Save size={18} /> 저장</button>
            </div>
          </div>

          <div className="border border-[#ddd] rounded-none overflow-hidden shadow-xl">
            <table className="w-full border-collapse">
              <thead>
                <tr className={`${headerColor} text-white`}>
                  <th className="border border-white/10 p-5 w-24 font-black text-[13px] text-center uppercase tracking-widest">Date</th>
                  {isExp && <th className="border border-white/10 p-5 w-40 font-black text-[13px] text-center uppercase tracking-widest bg-emerald-700">지출 계 (₸)</th>}
                  <th className="border border-white/10 p-5 font-black text-[13px] text-center uppercase tracking-widest">
                    {isExp ? '지출 내역 기록 (Expense Log)' : '일정 등록 및 관리 (Memo / Events)'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {days.map((day) => {
                  const dayEvents = getEventsForDay(day, type);
                  const isSun = new Date(year, month, day).getDay() === 0;
                  const dateKey = `${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const holiday = KZ_HOLIDAYS[dateKey];
                  const currentInput = isExp ? (expenseInputValues[day] || '') : (inputValues[day] || '');
                  const dailyTotal = isExp ? getDailyExpenseTotal(day) : 0;

                  return (
                    <tr key={day} className="group hover:bg-blue-50/20 transition-all min-h-[80px]">
                      <td className={`border border-slate-200 p-4 text-center font-black text-[18px] w-24 tabular-nums transition-all ${isSun || holiday ? 'text-red-500 bg-red-50/30' : 'bg-slate-50/50 text-[#475569]'}`}>
                        <div className="flex flex-col items-center">
                          <span>{day}</span>
                          <span className="text-[10px] font-bold opacity-40 uppercase">{isSun ? 'SUN' : 'DAY'}</span>
                          {holiday && <span className="text-[8px] bg-red-500 text-white px-1 mt-1 rounded-sm">{lang === 'ko' ? '공휴일' : 'Holiday'}</span>}
                        </div>
                      </td>
                      {isExp && (
                        <td className={`border border-slate-200 p-4 text-right font-black text-[16px] w-40 tabular-nums bg-emerald-50/20 text-emerald-700`}>
                           {dailyTotal > 0 ? dailyTotal.toLocaleString() : '-'}
                        </td>
                      )}
                      <td className="border border-slate-200 p-6 relative">
                         <div className="flex flex-col gap-3">
                            <div className="flex flex-wrap gap-2">
                               {dayEvents.map(e => (
                                 <div key={e.id} className={`bg-white px-4 py-2 rounded-none text-[11px] font-bold border-l-4 shadow-md flex items-center gap-4 animate-in slide-in-from-left-2 ${isExp ? 'border-emerald-600' : 'border-blue-600'}`}>
                                    <span className="text-slate-700">{e.title}</span>
                                    <button 
                                      onClick={() => handleDeleteEvent(e.id, type)}
                                      className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                       <X size={14} />
                                    </button>
                                 </div>
                               ))}
                            </div>
                            
                            <div className="flex items-center gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                               <input 
                                 type="text"
                                 value={currentInput}
                                 onChange={(e) => {
                                    if(isExp) setExpenseInputValues(prev => ({ ...prev, [day]: e.target.value }));
                                    else setInputValues(prev => ({ ...prev, [day]: e.target.value }));
                                 }}
                                 onKeyPress={(e) => e.key === 'Enter' && handleAddEvent(day)}
                                 className="flex-1 bg-slate-50 border-b-2 border-slate-200 px-4 py-2 outline-none text-[13px] font-bold text-slate-900 focus:border-blue-500 transition-all"
                                 placeholder={`${isExp ? '지출 내역 및 금액' : '새 일정'}을 입력하세요... (Enter)`}
                               />
                               <button 
                                 onClick={() => handleAddEvent(day)}
                                 className={`p-2 text-white rounded-none shadow-lg transition-all active:scale-95 ${isExp ? 'bg-emerald-600' : 'bg-blue-600'}`}
                               >
                                  <Plus size={20} />
                               </button>
                            </div>
                         </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1500px] mx-auto pb-20 animate-in fade-in duration-500" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
      <div className="bg-white border border-slate-200 shadow-xl rounded-none overflow-hidden">
        {/* Date Navigator Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex flex-wrap items-center justify-between no-print bg-white gap-6">
             <div className="flex items-center gap-6">
                <div className="flex bg-slate-100 p-1.5 rounded-none shadow-inner border border-slate-200">
                  <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-2.5 hover:bg-white rounded-none transition-all text-slate-400 hover:text-slate-900"><ChevronLeft size={22}/></button>
                  <div className="px-10 flex flex-col items-center justify-center min-w-[200px]">
                    <span className="text-lg font-black text-slate-900 tracking-tighter uppercase tabular-nums">{String(year).slice(-2)}년 {month + 1}월</span>
                  </div>
                  <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-2.5 hover:bg-white rounded-none transition-all text-slate-400 hover:text-slate-900"><ChevronRight size={22}/></button>
                </div>
             </div>
        </div>

        <div className={`p-10 bg-[#f4f7fa] min-h-[900px] ${scheduleSubTab === 'calculator' ? 'flex flex-col items-center' : ''}`}>
          {scheduleSubTab === 'monthly' ? renderCalendarView(false) : 
           scheduleSubTab === 'personal' ? renderCalendarView(true) :
           scheduleSubTab === 'expenses' ? renderDaily('expenses') :
           scheduleSubTab === 'calculator' ? renderCalculatorArea() : renderDaily('daily')}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
