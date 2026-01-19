
import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation, WithYouLogo } from '../App';
import { RecyclingType, RecyclingAction, RecyclingRecord, Client, WasteType, WasteEntry } from '../types';
import { ChevronLeft, ChevronRight, Calendar, Edit3, Trash2, Printer, Save, Building2, Users, RefreshCw, CloudSun } from 'lucide-react';

const Recycling: React.FC = () => {
  const { searchTerm, setTriggerAddModal, recyclingSubTab, clients, setClients, lang, user, t, recyclingRecords, setRecyclingRecords, wasteEntries } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RecyclingRecord | null>(null);
  const [editingVendor, setEditingVendor] = useState<Client | null>(null);

  const [newVendorData, setNewVendorData] = useState({
    name: '',
    nameCyrillic: ''
  });

  // Set initial view date to current system date
  const [viewDate, setViewDate] = useState(new Date());

  const [signatures, setSignatures] = useState({
    staff: '',
    manager: '',
    director: ''
  });

  const dateStr = useMemo(() => {
    const y = String(viewDate.getFullYear()).slice(-2);
    const m = String(viewDate.getMonth() + 1).padStart(2, '0');
    const d = String(viewDate.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
  }, [viewDate]);

  const dateStrFull = useMemo(() => {
    const y = viewDate.getFullYear();
    const m = String(viewDate.getMonth() + 1).padStart(2, '0');
    const d = String(viewDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [viewDate]);

  const currentMonthRU = useMemo(() => {
    const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    return months[viewDate.getMonth()];
  }, [viewDate]);

  const currentMonthKO = (viewDate.getMonth() + 1) + '월';

  // State for Report manual inputs (other than linked data)
  const [reportData, setReportData] = useState({
    weather: '맑은 / солн. (18°C)',
    morningWork: '',
    tomorrowPlan: '',
    dieselIn: { prev: 0, today: 0, remark: '' },
    dieselOut: { prev: 0, today: 0, balance: 0 },
    siteStatus: {
      staffRU: '', equipRU: '', polygonRU: '',
      staffKO: '', equipKO: '', polygonKO: ''
    }
  });

  const updateReport = (path: string, value: any) => {
    const keys = path.split('.');
    setReportData(prev => {
      const next = { ...prev };
      let curr: any = next;
      for (let i = 0; i < keys.length - 1; i++) {
        curr = curr[keys[i]];
      }
      curr[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleAutoWeather = () => {
    const weathers = ['맑음 / солн.', '구름조금 / обл.', '흐림 / пасмурно', '눈 / снег'];
    const selected = weathers[Math.floor(Math.random() * weathers.length)];
    const temp = Math.floor(Math.random() * (25 - (-10)) + (-10)); // 시뮬레이션 온도
    updateReport('weather', `${selected} (${temp}°C)`);
  };

  const linkedData = useMemo(() => {
    const todayRecycling = (recyclingRecords || []).filter(r => r.date === dateStrFull);
    const prevRecycling = (recyclingRecords || []).filter(r => r.date < dateStrFull && r.date.startsWith(dateStrFull.substring(0, 7)));
    
    const todayWaste = (wasteEntries || []).filter(w => w.entryDate === dateStrFull);
    const prevWaste = (wasteEntries || []).filter(w => w.entryDate < dateStrFull && w.entryDate.startsWith(dateStrFull.substring(0, 7)));

    const getWasteTotal = (arr: WasteEntry[], type: WasteType) => arr.filter(w => w.type === type).reduce((sum, w) => sum + w.weight * 1000, 0);
    const getRecTotal = (arr: RecyclingRecord[], type: RecyclingType, action: RecyclingAction) => arr.filter(r => r.type === type && r.action === action).reduce((sum, r) => sum + r.count, 0);

    return {
      personnelToday: todayRecycling.reduce((sum, r) => sum + (r.sortingPersonnel || 0), 0),
      waste: [
        { name: '일반폐기물', sub: 'Обычные отходы', today: getWasteTotal(todayWaste, WasteType.General), prev: getWasteTotal(prevWaste, WasteType.General) },
        { name: '건설폐기물', sub: 'Строительные отходы', today: getWasteTotal(todayWaste, WasteType.Construction), prev: getWasteTotal(prevWaste, WasteType.Construction) },
        { name: '의료폐기물', sub: 'Медицинские отходы', today: getWasteTotal(todayWaste, WasteType.Medical), prev: getWasteTotal(prevWaste, WasteType.Medical) },
      ],
      sorting: [
        { name: '플라스틱', sub: 'Пластик (PET)', today: getRecTotal(todayRecycling, RecyclingType.Plastic, RecyclingAction.Sorting), prev: getRecTotal(prevRecycling, RecyclingType.Plastic, RecyclingAction.Sorting) },
        { name: '종이/폐지', sub: 'Бумага', today: getRecTotal(todayRecycling, RecyclingType.Paper, RecyclingAction.Sorting), prev: getRecTotal(prevRecycling, RecyclingType.Paper, RecyclingAction.Sorting) },
      ],
      outbound: [
        { name: '플라스틱 출고', sub: 'Пластик (Out)', today: getRecTotal(todayRecycling, RecyclingType.Plastic, RecyclingAction.Outbound), prev: getRecTotal(prevRecycling, RecyclingType.Plastic, RecyclingAction.Outbound) },
        { name: '폐지 출고', sub: 'Бумага (Out)', today: getRecTotal(todayRecycling, RecyclingType.Paper, RecyclingAction.Outbound), prev: getRecTotal(prevRecycling, RecyclingType.Paper, RecyclingAction.Outbound) },
      ]
    };
  }, [dateStrFull, recyclingRecords, wasteEntries]);

  const recyclingVendors = useMemo(() => {
    return clients.filter(c => c.name.includes('위드유') || c.name.includes('에코') || c.name.includes('타잘륵'));
  }, [clients]);

  const [newRecord, setNewRecord] = useState({
    vendorName: recyclingVendors[0]?.name || '',
    type: RecyclingType.Paper,
    action: RecyclingAction.Sorting,
    count: 0,
    amount: 0,
    sortingPersonnel: 0,
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    setTriggerAddModal(() => () => {
        if (recyclingSubTab === 'logs' || recyclingSubTab === 'monthly') {
            setEditingRecord(null);
            setNewRecord({
                vendorName: recyclingVendors[0]?.name || '',
                type: RecyclingType.Paper,
                action: RecyclingAction.Sorting,
                count: 0,
                amount: 0,
                sortingPersonnel: 0,
                date: dateStrFull
            });
            setIsModalOpen(true);
        } else if (recyclingSubTab === 'clients') {
            setEditingVendor(null);
            setNewVendorData({ name: '', nameCyrillic: '' });
            setIsVendorModalOpen(true);
        } else if (recyclingSubTab === 'dailyReport') {
            alert('작업일보가 저장되었습니다.');
        }
    });
  }, [setTriggerAddModal, recyclingSubTab, dateStrFull, recyclingVendors]);

  const handleAddOrUpdateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = recyclingVendors.find(v => v.name === newRecord.vendorName);
    const record: RecyclingRecord = {
      id: editingRecord ? editingRecord.id : `r-${Date.now()}`,
      ...newRecord,
      vendorNameCyrillic: vendor?.nameCyrillic || '',
      weight: 0 
    };

    if (editingRecord) {
      setRecyclingRecords((prev: RecyclingRecord[]) => prev.map(r => r.id === editingRecord.id ? record : r));
    } else {
      setRecyclingRecords((prev: RecyclingRecord[]) => [record, ...prev]);
    }
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  const handleAddOrUpdateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVendor) {
      setClients((prev: Client[]) => prev.map(c => c.id === editingVendor.id ? { ...c, name: newVendorData.name, nameCyrillic: newVendorData.nameCyrillic } : c));
    } else {
      const vendor: Client = {
        id: `v-${Date.now()}`,
        name: newVendorData.name,
        nameCyrillic: newVendorData.nameCyrillic,
        defaultFeePerTon: 2200,
        registrationDate: new Date().toISOString().split('T')[0]
      };
      setClients((prev: Client[]) => [...prev, vendor]);
    }
    setIsVendorModalOpen(false);
    setEditingVendor(null);
  };

  const openEditRecord = (record: RecyclingRecord) => {
    setEditingRecord(record);
    setNewRecord({
      vendorName: record.vendorName,
      type: record.type,
      action: record.action,
      count: record.count,
      amount: record.amount,
      sortingPersonnel: record.sortingPersonnel || 0,
      date: record.date
    });
    setIsModalOpen(true);
  };

  const openEditVendor = (vendor: Client) => {
    setEditingVendor(vendor);
    setNewVendorData({
      name: vendor.name,
      nameCyrillic: vendor.nameCyrillic || ''
    });
    setIsVendorModalOpen(true);
  };

  const handleDateChange = (days: number) => {
    const next = new Date(viewDate);
    if (recyclingSubTab === 'monthly') {
      next.setMonth(next.getMonth() + (days > 0 ? 1 : -1));
    } else {
      next.setDate(next.getDate() + days);
    }
    setViewDate(next);
  };

  const filteredRecords = useMemo(() => {
    return (recyclingRecords || []).filter(r => 
      r.date === dateStrFull && 
      (r.type.toLowerCase().includes(searchTerm.toLowerCase()) || 
       r.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       r.action.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [recyclingRecords, searchTerm, dateStrFull]);

  const monthlyRecordsFiltered = useMemo(() => {
    const currentMonth = dateStrFull.substring(0, 7);
    return (recyclingRecords || []).filter(r => 
      r.date.startsWith(currentMonth) && 
      (r.type.toLowerCase().includes(searchTerm.toLowerCase()) || 
       r.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       r.action.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [recyclingRecords, searchTerm, dateStrFull]);

  const filteredVendors = useMemo(() => {
    return recyclingVendors.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (c.nameCyrillic || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [recyclingVendors, searchTerm]);

  const getMonthlyAccumulatedCount = (type: RecyclingType, currentDate: string) => {
    const currentMonth = currentDate.substring(0, 7);
    return (recyclingRecords || [])
      .filter(r => r.type === type && r.date.startsWith(currentMonth) && r.date <= currentDate)
      .reduce((sum, r) => sum + r.count, 0);
  };

  const dailyTotalAmount = useMemo(() => filteredRecords.reduce((acc, curr) => acc + curr.amount, 0), [filteredRecords]);
  const monthlyTotalAmount = useMemo(() => monthlyRecordsFiltered.reduce((acc, curr) => acc + curr.amount, 0), [monthlyRecordsFiltered]);

  const imageGridStyle = "border border-[#ddd] px-4 py-2 text-center text-[13px] font-normal h-14 bg-white text-[#475569] tabular-nums";
  const headerGridStyle = "border border-[#ddd] bg-slate-100 px-4 py-4 text-center text-[11px] font-normal uppercase tracking-tight text-[#475569]";

  const handleSign = (type: 'staff' | 'manager' | 'director') => {
    setSignatures(prev => ({
      ...prev,
      [type]: prev[type as keyof typeof signatures] ? '' : user.name
    }));
  };

  const renderVendorName = (name: string, nameCyrillic: string | undefined) => {
    const isCyrillicPriority = lang === 'ru' || lang === 'kz';
    if (isCyrillicPriority) {
        return (
            <div className="flex flex-col">
                <span className="text-[#475569] font-bold">{nameCyrillic || name}</span>
                <span className="text-[10px] text-slate-400 font-normal italic">{name}</span>
            </div>
        );
    }
    return (
        <div className="flex flex-col">
            <span className="text-[#475569] font-bold">{name}</span>
            <span className="text-[10px] text-slate-400 font-normal italic">{nameCyrillic || ''}</span>
        </div>
    );
  };

  const renderDailyReport = () => {
    const thStyle = "border border-[#ddd] bg-[#F4FAFF] text-center p-1 text-[10px] font-normal leading-tight text-[#475569]";
    const tdStyle = "border border-[#ddd] px-1 text-center h-8 text-[11px] font-normal text-[#475569] tabular-nums";
    const inputStyle = "w-full h-full bg-transparent border-none outline-none text-center px-1 font-normal text-[#475569] focus:bg-yellow-50 tabular-nums";
    const titleStyle = "text-[11px] font-bold text-[#475569] mb-1 mt-3";

    return (
      <div className="bg-white p-6 md:p-10 max-w-[1500px] mx-auto text-[#475569] border border-[#ddd] rounded-none animate-in fade-in duration-700 shadow-2xl print:shadow-none print:border-none print:p-0 font-sans relative" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
        
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body { background: white !important; }
            .print-container { 
              width: 100% !important; 
              max-width: 100% !important; 
              margin: 0 !important; 
              padding: 0 !important;
              transform: scale(0.95);
              transform-origin: top left;
            }
          }
        `}} />

        <div className="print-container">
          <div className="flex justify-between items-start mb-4">
             <div className="flex-1 flex flex-col items-center">
                <h1 className="text-2xl md:text-3xl font-bold text-center underline decoration-1 underline-offset-8 mb-5 text-slate-900">작업일보 / Ежедневный отчет</h1>
                <div className="grid grid-cols-3 w-full text-[11px] font-normal px-2">
                   <div className="flex items-center gap-2">일자 / Дата : <span className="border-b border-slate-400 px-3 min-w-[90px] text-center tabular-nums font-bold">{dateStr}</span></div>
                   <div className="text-center font-bold">크즐오르다 매립장 / Полигон</div>
                   <div className="flex items-center justify-end gap-2 group relative">날씨 / погода : 
                      <input 
                        className="w-24 border-b border-slate-400 outline-none text-center bg-transparent font-bold pr-6" 
                        value={reportData.weather}
                        onChange={e => updateReport('weather', e.target.value)}
                      />
                      <button 
                        onClick={handleAutoWeather}
                        className="absolute right-0 p-1 text-blue-500 hover:text-blue-700 transition-colors no-print"
                        title="날씨 자동 업데이트"
                      >
                        <RefreshCw size={12} />
                      </button>
                   </div>
                </div>
             </div>
             <div className="ml-8">
                <table className="border-collapse border border-[#ddd] w-64 text-[10px] rounded-none overflow-hidden">
                   <thead>
                      <tr className="h-6">
                         <th className="border border-[#ddd] bg-slate-50 font-bold w-1/3">Составил<br/>담당</th>
                         <th className="border border-[#ddd] bg-slate-50 font-bold w-1/3">Ответственный<br/>책임자</th>
                         <th className="border border-[#ddd] bg-slate-50 font-bold w-1/3">Исаним<br/>이사</th>
                      </tr>
                   </thead>
                   <tbody>
                      <tr className="h-14">
                         <td className="border border-[#ddd] text-center cursor-pointer relative hover:bg-slate-50 transition-colors" onClick={() => handleSign('staff')}>
                            {signatures.staff && <span className="text-[11px] font-bold animate-in zoom-in duration-200">{signatures.staff}</span>}
                         </td>
                         <td className="border border-[#ddd] text-center cursor-pointer relative hover:bg-slate-50 transition-colors" onClick={() => handleSign('manager')}>
                            {signatures.manager && <span className="text-[11px] font-bold animate-in zoom-in duration-200">{signatures.manager}</span>}
                         </td>
                         <td className="border border-[#ddd] text-center cursor-pointer relative hover:bg-slate-50 transition-colors" onClick={() => handleSign('director')}>
                            {signatures.director && <span className="text-[11px] font-bold animate-in zoom-in duration-200">{signatures.director}</span>}
                         </td>
                      </tr>
                   </tbody>
                </table>
             </div>
          </div>

          <div className="grid grid-cols-12 gap-x-5">
             <div className="col-span-8 flex flex-col">
                <h2 className={titleStyle}>1. 작업내용 / Описание работы</h2>
                <div className="border border-[#ddd] rounded-none overflow-hidden">
                    <table className="w-full border-collapse border-none text-[11px] h-full shadow-sm">
                       <thead>
                          <tr>
                             <th className={`${thStyle} w-24 bg-slate-50`}>품명<br/>Название</th>
                             <th className={thStyle}>금일작업내용<br/>Plan na segonya</th>
                             <th className={thStyle}>명일작업계획<br/>Plan na zavtra</th>
                          </tr>
                       </thead>
                       <tbody>
                          <tr className="h-[280px]">
                             <td className="border border-[#ddd] text-center font-bold align-middle bg-white">구매립장<br/>Полигон</td>
                             <td className="border border-[#ddd] p-0 align-top bg-white">
                                <textarea 
                                  className="w-full h-full p-3 outline-none resize-none bg-transparent font-normal text-[12px] leading-relaxed text-[#475569] focus:bg-blue-50/10" 
                                  value={reportData.morningWork}
                                  onChange={e => updateReport('morningWork', e.target.value)}
                                  placeholder="내용을 입력하세요..."
                                />
                             </td>
                             <td className="border border-[#ddd] p-0 align-top bg-white">
                                <textarea 
                                  className="w-full h-full p-3 outline-none resize-none bg-transparent font-normal text-[12px] leading-relaxed text-[#475569] focus:bg-blue-50/10" 
                                  value={reportData.tomorrowPlan}
                                  onChange={e => updateReport('tomorrowPlan', e.target.value)}
                                  placeholder="내용을 입력하세요..."
                                />
                             </td>
                          </tr>
                       </tbody>
                    </table>
                </div>
             </div>

             <div className="col-span-4 space-y-4">
                <div>
                   <h2 className={titleStyle}>2. 직원정보 / Сотрудники</h2>
                   <div className="border border-[#ddd] rounded-none overflow-hidden">
                       <table className="w-full border-collapse border-none text-[10px] shadow-sm">
                          <thead>
                             <tr>
                                <th className={thStyle} style={{ width: '28%' }}>이름<br/>Имя</th>
                                <th className={thStyle} style={{ width: '18%' }}>전체</th>
                                <th className={thStyle} style={{ width: '18%' }}>주기</th>
                                <th className={thStyle} style={{ width: '18%' }}>휴가</th>
                                <th className={`${thStyle} bg-slate-200 font-bold`} style={{ width: '18%' }}>누계</th>
                             </tr>
                          </thead>
                          <tbody>
                             <tr className="h-8">
                                <td className="border border-[#ddd] text-center font-bold p-1 bg-white leading-none whitespace-nowrap">매립관리직원<br/><span className="text-[8px] font-normal opacity-70">Сотр.полигона</span></td>
                                <td className={tdStyle}><input className={inputStyle} defaultValue={4} /></td>
                                <td className={tdStyle}><input className={inputStyle} defaultValue={0} /></td>
                                <td className={tdStyle}><input className={inputStyle} defaultValue={0} /></td>
                                <td className={`${tdStyle} bg-blue-50 font-bold text-[#00AFCA]`}>4</td>
                             </tr>
                             <tr className="h-8">
                                <td className="border border-[#ddd] text-center font-bold p-1 bg-white leading-none whitespace-nowrap">선별직원<br/><span className="text-[8px] font-normal opacity-70">Рабоч.сортировки</span></td>
                                <td className={tdStyle}><input className={inputStyle} value={linkedData.personnelToday} readOnly /></td>
                                <td className={tdStyle}><input className={inputStyle} defaultValue={0} /></td>
                                <td className={tdStyle}><input className={inputStyle} defaultValue={0} /></td>
                                <td className={`${tdStyle} bg-blue-50 font-bold text-[#00AFCA]`}>{linkedData.personnelToday}</td>
                             </tr>
                          </tbody>
                       </table>
                   </div>
                </div>

                <div>
                   <h2 className={titleStyle}>3. 장비정보 / Спецтехника</h2>
                   <div className="border border-[#ddd] rounded-none overflow-hidden">
                       <table className="w-full border-collapse border-none text-[10px] shadow-sm">
                          <thead>
                             <tr>
                                <th className={thStyle} style={{ width: '30%' }}>명칭<br/>Название</th>
                                <th className={thStyle} style={{ width: '20%' }}>전일</th>
                                <th className={thStyle} style={{ width: '20%' }}>금일</th>
                                <th className={`${thStyle} bg-slate-200 font-bold`} style={{ width: '30%' }}>누계</th>
                             </tr>
                          </thead>
                          <tbody>
                             {[
                               {name: '굴삭기', sub: 'Экскаватор'},
                               {name: '불도저', sub: 'Бульдозер'},
                               {name: '지게차', sub: 'Мини погрузчик'},
                               {name: '페이로더', sub: 'Погрузчик'},
                             ].map((e, i) => (
                                <tr key={i} className="h-8">
                                   <td className="border border-[#ddd] text-center font-bold p-1 bg-white leading-none whitespace-nowrap">{e.name}<br/><span className="text-[8px] font-normal opacity-70">{e.sub}</span></td>
                                   <td className={tdStyle}><input className={inputStyle} defaultValue={0} /></td>
                                   <td className={tdStyle}><input className={inputStyle} defaultValue={1} /></td>
                                   <td className={`${tdStyle} bg-blue-50 font-bold text-blue-700`}>1</td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                   </div>
                </div>
             </div>

             <div className="col-span-4 mt-3">
                <h2 className={titleStyle}>4. 반입폐기물정보 / Информация по ТБО</h2>
                <div className="border border-[#ddd] rounded-none overflow-hidden">
                    <table className="w-full border-collapse border-none text-[10px] shadow-sm">
                       <thead>
                          <tr>
                             <th className={thStyle} style={{ width: '30%' }}>품명<br/>Название</th>
                             <th className={thStyle} style={{ width: '22%' }}>전일까지</th>
                             <th className={thStyle} style={{ width: '22%' }}>{dateStr}</th>
                             <th className={`${thStyle} bg-slate-200 font-bold`} style={{ width: '26%' }}>누계 KG</th>
                          </tr>
                       </thead>
                       <tbody>
                          {linkedData.waste.map((w, i) => (
                             <tr key={i} className="h-8">
                                <td className="border border-[#ddd] text-center font-bold p-1 bg-white leading-tight">{w.name}<br/><span className="text-[8px] font-normal opacity-70">{w.sub}</span></td>
                                <td className={tdStyle}><input className={inputStyle} readOnly value={w.prev.toLocaleString()} /></td>
                                <td className={tdStyle}><input className={inputStyle} readOnly value={w.today.toLocaleString()} /></td>
                                <td className={`${tdStyle} bg-emerald-50 font-bold text-emerald-700`}>{(w.prev + w.today).toLocaleString()}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                </div>
             </div>

             <div className="col-span-4 mt-3 space-y-4">
                <div>
                   <h2 className={titleStyle}>5. 선별폐기물정보 / Сортировка ПЭК</h2>
                   <div className="border border-[#ddd] rounded-none overflow-hidden">
                       <table className="w-full border-collapse border-none text-[10px] shadow-sm">
                          <thead>
                             <tr>
                                <th className={thStyle} style={{ width: '30%' }}>품명<br/>Название</th>
                                <th className={thStyle} style={{ width: '22%' }}>전일까지</th>
                                <th className={thStyle} style={{ width: '22%' }}>금일</th>
                                <th className={`${thStyle} bg-slate-200 font-bold`} style={{ width: '26%' }}>누계 개</th>
                          </tr>
                       </thead>
                       <tbody>
                          {linkedData.sorting.map((s, i) => (
                             <tr key={i} className="h-8">
                                <td className="border border-[#ddd] text-center font-bold p-1 bg-white leading-tight">{s.name}<br/><span className="text-[8px] font-normal opacity-70">{s.sub}</span></td>
                                <td className={tdStyle}><input className={inputStyle} readOnly value={s.prev.toLocaleString()} /></td>
                                <td className={tdStyle}><input className={inputStyle} readOnly value={s.today.toLocaleString()} /></td>
                                <td className={`${tdStyle} bg-blue-50 font-bold text-blue-600`}>{(s.prev + s.today).toLocaleString()}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                   </div>
                </div>
                <div>
                   <h2 className={titleStyle}>6. 선별 후 반출정보 / Отправлено ПЭК</h2>
                   <div className="border border-[#ddd] rounded-none overflow-hidden">
                       <table className="w-full border-collapse border-none text-[10px] shadow-sm">
                          <thead>
                             <tr>
                                <th className={thStyle} style={{ width: '30%' }}>품명<br/>Название</th>
                                <th className={thStyle} style={{ width: '22%' }}>전일까지</th>
                                <th className={thStyle} style={{ width: '22%' }}>금일</th>
                                <th className={`${thStyle} bg-slate-200 font-bold`} style={{ width: '26%' }}>누계 개</th>
                             </tr>
                          </thead>
                          <tbody>
                             {linkedData.outbound.map((o, i) => (
                                <tr key={i} className="h-8">
                                   <td className="border border-[#ddd] p-1 text-center font-bold bg-white leading-tight">{o.name}<br/><span className="text-[8px] font-normal opacity-70">{o.sub}</span></td>
                                   <td className={tdStyle}><input className={inputStyle} readOnly value={o.prev.toLocaleString()} /></td>
                                   <td className={tdStyle}><input className={inputStyle} readOnly value={o.today.toLocaleString()} /></td>
                                   <td className={`${tdStyle} bg-orange-50 font-bold text-orange-600`}>{(o.prev + o.today).toLocaleString()}</td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                   </div>
                </div>
             </div>

             <div className="col-span-4 mt-3 space-y-4">
                <div>
                   <h2 className={titleStyle}>7. 수령디젤수량 / Получено (디젤)</h2>
                   <div className="border border-[#ddd] rounded-none overflow-hidden">
                       <table className="w-full border-collapse border-none text-[10px] shadow-sm">
                          <thead>
                             <tr>
                                <th className={thStyle} style={{ width: '18%' }}>명칭</th>
                                <th className={thStyle} style={{ width: '20%' }}>전일까지</th>
                                <th className={thStyle} style={{ width: '20%' }}>금일</th>
                                <th className={`${thStyle} bg-slate-200 font-bold`} style={{ width: '24%' }}>누계</th>
                                <th className={thStyle} style={{ width: '18%' }}>비고</th>
                             </tr>
                          </thead>
                          <tbody>
                             <tr className="h-9">
                                <td className="border border-[#ddd] text-center font-bold p-1 bg-white leading-tight whitespace-nowrap">{currentMonthRU}<br/><span className="text-[8px] font-normal opacity-70">{currentMonthKO}</span></td>
                                <td className={tdStyle}><input className={inputStyle} type="number" value={reportData.dieselIn.prev} onChange={e => updateReport('dieselIn.prev', parseInt(e.target.value) || 0)} /></td>
                                <td className={tdStyle}><input className={inputStyle} type="number" value={reportData.dieselIn.today} onChange={e => updateReport('dieselIn.today', parseInt(e.target.value) || 0)} /></td>
                                <td className={`${tdStyle} bg-blue-50 font-bold text-blue-800`}>{reportData.dieselIn.prev + reportData.dieselIn.today}</td>
                                <td className={tdStyle}><input className={inputStyle} value={reportData.dieselIn.remark} onChange={e => updateReport('dieselIn.remark', e.target.value)} /></td>
                             </tr>
                             <tr className="h-7"><td className="border border-[#ddd]"></td><td className={tdStyle}></td><td className={tdStyle}></td><td className={tdStyle}></td><td className={tdStyle}></td></tr>
                          </tbody>
                       </table>
                   </div>
                </div>
                <div>
                   <h2 className={titleStyle}>8. 발급디젤수량 / Выдано (디젤)</h2>
                   <div className="border border-[#ddd] rounded-none overflow-hidden">
                       <table className="w-full border-collapse border-none text-[10px] shadow-sm">
                          <thead>
                             <tr>
                                <th className={thStyle} style={{ width: '18%' }}>명칭</th>
                                <th className={thStyle} style={{ width: '20%' }}>전일까지</th>
                                <th className={thStyle} style={{ width: '20%' }}>금일</th>
                                <th className={`${thStyle} bg-slate-200 font-bold`} style={{ width: '22%' }}>누계</th>
                                <th className={`${thStyle} bg-red-100 text-red-700 font-bold`} style={{ width: '20%' }}>잔여</th>
                             </tr>
                          </thead>
                          <tbody>
                             <tr className="h-9">
                                <td className="border border-[#ddd] text-center font-bold p-1 bg-white leading-tight whitespace-nowrap">{currentMonthRU}<br/><span className="text-[8px] font-normal opacity-70">{currentMonthKO}</span></td>
                                <td className={tdStyle}><input className={inputStyle} type="number" value={reportData.dieselOut.prev} onChange={e => updateReport('dieselOut.prev', parseInt(e.target.value) || 0)} /></td>
                                <td className={tdStyle}><input className={inputStyle} type="number" value={reportData.dieselOut.today} onChange={e => updateReport('dieselOut.today', parseInt(e.target.value) || 0)} /></td>
                                <td className={`${tdStyle} bg-slate-50 font-bold`}>{reportData.dieselOut.prev + reportData.dieselOut.today}</td>
                                <td className={`${tdStyle} bg-red-50 text-red-600 font-bold text-[13px]`}>{(reportData.dieselIn.prev + reportData.dieselIn.today) - (reportData.dieselOut.prev + reportData.dieselOut.today)}</td>
                             </tr>
                             <tr className="h-7"><td className="border border-[#ddd]"></td><td className={tdStyle}></td><td className={tdStyle}></td><td className={tdStyle}></td><td className={tdStyle}></td></tr>
                          </tbody>
                       </table>
                   </div>
                </div>
             </div>

             <div className="col-span-12 mt-6">
                <h2 className={titleStyle}>9. 현장상황 / Особые условия</h2>
                <div className="border border-[#ddd] rounded-none p-4 text-[11px] grid grid-cols-2 gap-x-10 min-h-[220px] bg-white shadow-inner">
                   <div className="space-y-3">
                      <div className="flex gap-3">1. Сотрудники : <input className="flex-1 border-b border-slate-200 outline-none font-normal focus:border-blue-400" value={reportData.siteStatus.staffRU} onChange={e => updateReport('siteStatus.staffRU', e.target.value)} /></div>
                      <div className="flex gap-3">2. Спецтехника : <input className="flex-1 border-b border-slate-200 outline-none font-normal focus:border-blue-400" value={reportData.siteStatus.equipRU} onChange={e => updateReport('siteStatus.equipRU', e.target.value)} /></div>
                      <div className="flex gap-3">3. Полигон : <input className="flex-1 border-b border-slate-200 outline-none font-normal focus:border-blue-400" value={reportData.siteStatus.polygonRU} onChange={e => updateReport('siteStatus.polygonRU', e.target.value)} /></div>
                   </div>
                   <div className="space-y-3">
                      <div className="flex gap-3">1. 직원정보 : <input className="flex-1 border-b border-slate-200 outline-none font-normal focus:border-blue-400" value={reportData.siteStatus.staffKO} onChange={e => updateReport('siteStatus.staffKO', e.target.value)} /></div>
                      <div className="flex gap-3">2. 장비정보 : <input className="flex-1 border-b border-slate-200 outline-none font-normal focus:border-blue-400" value={reportData.siteStatus.equipKO} onChange={e => updateReport('siteStatus.equipKO', e.target.value)} /></div>
                      <div className="flex gap-3">3. 현장정보 : <input className="flex-1 border-b border-slate-200 outline-none font-normal focus:border-blue-400" value={reportData.siteStatus.polygonKO} onChange={e => updateReport('siteStatus.polygonKO', e.target.value)} /></div>
                   </div>
                </div>
             </div>
          </div>

          <div className="mt-10 text-right text-[8px] font-bold text-slate-300 uppercase tracking-widest italic tabular-nums">
            IMS Platform - Daily Report v6.5 / TOO WITH YOU E&C KYZYLORDA POLYGON
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
      
      <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center justify-between no-print">
         <div className="flex items-center gap-6">
            <div className="flex bg-slate-50 border border-slate-200 p-1.5 rounded-2xl shadow-inner">
              <button onClick={() => handleDateChange(-1)} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-900"><ChevronLeft size={20}/></button>
              <div className="px-6 flex items-center gap-3 min-w-[220px] justify-center">
                <Calendar size={18} className="text-[#8DC63F]" />
                <span className="font-normal text-[#475569] text-[16px] tracking-tighter uppercase tabular-nums">
                  {recyclingSubTab === 'monthly'
                    ? viewDate.toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit' })
                    : viewDate.toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })
                  }
                </span>
              </div>
              <button onClick={() => handleDateChange(1)} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-900"><ChevronRight size={20}/></button>
            </div>
         </div>

         <div className="flex gap-3">
            <button onClick={() => window.print()} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-all uppercase"><Printer size={16} /> 인쇄</button>
            <button 
              onClick={() => {
                if(recyclingSubTab === 'logs' || recyclingSubTab === 'monthly') { 
                    setEditingRecord(null);
                    setNewRecord({ vendorName: recyclingVendors[0]?.name || '', type: RecyclingType.Paper, action: RecyclingAction.Sorting, count: 0, amount: 0, sortingPersonnel: 0, date: dateStrFull });
                    setIsModalOpen(true); 
                } 
                else if (recyclingSubTab === 'clients') { 
                    setEditingVendor(null);
                    setNewVendorData({ name: '', nameCyrillic: '' });
                    setIsVendorModalOpen(true); 
                } else {
                    alert('작업일보 데이터가 저장되었습니다.');
                }
              }}
              className="px-6 py-2.5 bg-[#8DC63F] text-white font-bold rounded-2xl hover:bg-[#7db135] transition-all flex items-center gap-2 text-xs shadow-lg shadow-green-100 uppercase"
            >
              <Save size={18} /> {recyclingSubTab === 'dailyReport' ? '작업일보 저장' : recyclingSubTab === 'clients' ? '선별업체 등록' : '재활용 기록 등록'}
            </button>
         </div>
      </div>

      <div className="bg-white p-1 overflow-hidden print:p-0">
           {recyclingSubTab === 'logs' ? (
             <div className="overflow-x-auto border border-[#ddd] rounded-none overflow-hidden">
                <table className="w-full border-collapse border-none">
                    <thead>
                      <tr>
                        <th className={headerGridStyle} style={{ width: '8%' }}>일자</th>
                        <th className={`${headerGridStyle} text-left px-4`}>선별업체 (VENDOR)</th>
                        <th className={headerGridStyle}>품목 (ITEM)</th>
                        <th className={`${headerGridStyle} bg-blue-50 text-blue-800`} style={{ width: '8%' }}>입고 (IN)</th>
                        <th className={`${headerGridStyle} bg-orange-50 text-orange-800`} style={{ width: '8%' }}>출고 (OUT)</th>
                        <th className={headerGridStyle} style={{ width: '8%' }}>선별인원</th>
                        <th className={`${headerGridStyle} bg-slate-100`} style={{ width: '12%' }}>계</th>
                        <th className={headerGridStyle} style={{ width: '15%' }}>금액 (KZT)</th>
                        <th className={`${headerGridStyle} no-print`} style={{ width: '8%' }}>관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map(r => (
                        <tr key={r.id} className="hover:bg-slate-50 transition-all group">
                          <td className={imageGridStyle}>{r.date.split('-').map((s,i)=> i===0?s.slice(-2):s).join('.')}</td>
                          <td className={`${imageGridStyle} text-left px-4`}>
                             {renderVendorName(r.vendorName, r.vendorNameCyrillic)}
                          </td>
                          <td className={`${imageGridStyle} text-left font-normal text-[#475569]`}>{r.type}</td>
                          <td className={`${imageGridStyle} tabular-nums text-blue-600`}>
                            {r.action === RecyclingAction.Sorting ? r.count.toLocaleString() : '-'}
                          </td>
                          <td className={`${imageGridStyle} tabular-nums text-orange-600`}>
                            {r.action === RecyclingAction.Outbound ? r.count.toLocaleString() : '-'}
                          </td>
                          <td className={`${imageGridStyle} tabular-nums text-[#475569]`}>
                            {r.sortingPersonnel || '-'}
                          </td>
                          <td className={`${imageGridStyle} tabular-nums font-normal text-[#475569] bg-slate-50/30`}>
                            {getMonthlyAccumulatedCount(r.type, r.date).toLocaleString()}
                          </td>
                          <td className={`${imageGridStyle} text-right tabular-nums text-emerald-700`}>{r.amount.toLocaleString()}</td>
                          <td className={`${imageGridStyle} no-print`}>
                             <div className="flex justify-center gap-2">
                                <button onClick={() => openEditRecord(r)} className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit3 size={14}/></button>
                                <button onClick={() => setRecyclingRecords((prev: RecyclingRecord[]) => prev.filter(rec => rec.id !== r.id))} className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14}/></button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-200 text-[#475569] font-bold">
                        <td colSpan={7} className="border border-[#ddd] px-6 py-4 text-right uppercase tracking-[0.2em] text-[10px] opacity-60">일일 정산 합계 (DAILY TOTAL)</td>
                        <td className="border border-[#ddd] px-6 py-4 text-right text-xl text-emerald-700 tabular-nums">{dailyTotalAmount.toLocaleString()} <span className="text-xs ml-1 text-slate-500">KZT</span></td>
                        <td className="border border-[#ddd] no-print"></td>
                      </tr>
                    </tfoot>
                </table>
             </div>
           ) : recyclingSubTab === 'monthly' ? (
             <div className="overflow-x-auto border border-[#ddd] rounded-none overflow-hidden">
                <table className="w-full border-collapse border-none">
                    <thead>
                      <tr>
                        <th className={headerGridStyle} style={{ width: '12%' }}>일자</th>
                        <th className={`${headerGridStyle} text-left px-4`}>선별업체 (VENDOR)</th>
                        <th className={headerGridStyle}>품목 (ITEM)</th>
                        <th className={headerGridStyle} style={{ width: '12%' }}>유형</th>
                        <th className={headerGridStyle} style={{ width: '15%' }}>수량 (Pcs)</th>
                        <th className={headerGridStyle} style={{ width: '18%' }}>매출 금액 (KZT)</th>
                        <th className={`${headerGridStyle} no-print`} style={{ width: '10%' }}>관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyRecordsFiltered.map(r => (
                        <tr key={r.id} className="hover:bg-slate-50 transition-all group">
                          <td className={imageGridStyle}>{r.date.split('-').map((s,i)=> i===0?s.slice(-2):s).join('.')}</td>
                          <td className={`${imageGridStyle} text-left px-4`}>
                             {renderVendorName(r.vendorName, r.vendorNameCyrillic)}
                          </td>
                          <td className={`${imageGridStyle} text-left font-normal text-[#475569]`}>{r.type}</td>
                          <td className={imageGridStyle}>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-normal border ${r.action === RecyclingAction.Sorting ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-orange-50 border-orange-200 text-orange-600'}`}>
                              {r.action === RecyclingAction.Sorting ? '선별(입고)' : '판매(출고)'}
                            </span>
                          </td>
                          <td className={`${imageGridStyle} text-right tabular-nums pr-6`}>{r.count.toLocaleString()}</td>
                          <td className={`${imageGridStyle} text-right tabular-nums font-normal pr-6 text-emerald-700`}>{r.amount.toLocaleString()}</td>
                          <td className={`${imageGridStyle} no-print`}>
                             <div className="flex justify-center gap-2">
                                <button onClick={() => openEditRecord(r)} className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit3 size={14}/></button>
                                <button onClick={() => setRecyclingRecords((prev: RecyclingRecord[]) => prev.filter(rec => rec.id !== r.id))} className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14}/></button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-200 text-[#475569] font-bold">
                        <td colSpan={5} className="border border-[#ddd] px-6 py-5 text-right uppercase tracking-[0.2em] text-[10px] opacity-60">월간 정산 합계 (MONTHLY TOTAL)</td>
                        <td className="border border-[#ddd] px-6 py-5 text-right text-2xl text-emerald-700 tabular-nums">{monthlyTotalAmount.toLocaleString()} <span className="text-xs ml-1 text-slate-500">KZT</span></td>
                        <td className="border border-[#ddd] no-print"></td>
                      </tr>
                    </tfoot>
                </table>
             </div>
           ) : recyclingSubTab === 'clients' ? (
             <div className="overflow-x-auto border border-[#ddd] rounded-none overflow-hidden">
                <table className="w-full border-collapse border-none">
                    <thead>
                      <tr>
                        <th className={headerGridStyle}>선별업체명 (한글 / 원문)</th>
                        <th className={headerGridStyle} style={{ width: '25%' }}>주요 매입 품목</th>
                        <th className={headerGridStyle} style={{ width: '20%' }}>등록일</th>
                        <th className={`${headerGridStyle} no-print`} style={{ width: '15%' }}>관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVendors.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50 transition-all group">
                          <td className={`${imageGridStyle} text-left px-4`}>
                             {renderVendorName(c.name, c.nameCyrillic)}
                          </td>
                          <td className={imageGridStyle}>
                             <div className="flex gap-1 justify-center">
                                <span className="px-2 py-0.5 bg-slate-100 text-[9px] rounded font-normal">Paper</span>
                                <span className="px-2 py-0.5 bg-slate-100 text-[9px] rounded font-normal">Plastic</span>
                             </div>
                          </td>
                          <td className={imageGridStyle}>{c.registrationDate?.split('-').map((s,i)=> i===0?s.slice(-2):s).join('.') || '23.01.01'}</td>
                          <td className={`${imageGridStyle} no-print`}>
                             <div className="flex justify-center gap-2">
                                <button onClick={() => openEditVendor(c)} className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit3 size={14}/></button>
                                <button className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14}/></button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                </table>
             </div>
           ) : (
             renderDailyReport()
           )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-xl bg-white p-12 shadow-2xl rounded-[40px] border-4 border-slate-900 font-sans text-slate-900 text-left" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
            <h3 className="text-2xl font-bold tracking-tighter uppercase mb-8">{editingRecord ? '재활용 기록 수정' : '재활용 기록 등록'}</h3>
            <form className="space-y-6" onSubmit={handleAddOrUpdateRecord}>
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-normal text-slate-400 uppercase tracking-widest ml-2">기록 일자 (DATE)</label>
                <input 
                  type="date"
                  value={newRecord.date}
                  onChange={e => setNewRecord({...newRecord, date: e.target.value})}
                  className="w-full px-8 py-4 bg-gray-50 border border-slate-200 font-normal text-[#475569] rounded-2xl outline-none focus:border-[#8DC63F] transition-all tabular-nums"
                />
              </div>
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-normal text-slate-400 uppercase tracking-widest ml-2">선별업체 선택 (VENDOR)</label>
                <select 
                  required
                  value={newRecord.vendorName}
                  onChange={e => setNewRecord({...newRecord, vendorName: e.target.value})}
                  className="w-full px-8 py-4 bg-gray-50 border border-slate-200 font-normal text-[#475569] rounded-2xl outline-none focus:border-[#8DC63F] transition-all"
                >
                  {recyclingVendors.map(v => <option key={v.id} value={v.name}>{lang === 'ru' || lang === 'kz' ? (v.nameCyrillic || v.name) : v.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-normal text-slate-400 uppercase tracking-widest ml-2">품목 선택</label>
                  <select 
                    value={newRecord.type} 
                    onChange={e => setNewRecord({...newRecord, type: e.target.value as RecyclingType})}
                    className="w-full px-8 py-4 bg-gray-50 border border-slate-200 font-normal text-[#475569] rounded-2xl outline-none focus:border-[#8DC63F] transition-all"
                  >
                    {Object.values(RecyclingType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-normal text-slate-400 uppercase tracking-widest ml-2">기록 유형 (입/출)</label>
                  <select 
                    value={newRecord.action} 
                    onChange={e => setNewRecord({...newRecord, action: e.target.value as RecyclingAction})}
                    className="w-full px-8 py-4 bg-gray-50 border border-slate-200 font-normal text-[#475569] rounded-2xl outline-none focus:border-[#8DC63F] transition-all"
                  >
                    <option value={RecyclingAction.Sorting}>Sorting (선별/입고)</option>
                    <option value={RecyclingAction.Outbound}>Outbound (판매/출고)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-normal text-slate-400 uppercase tracking-widest ml-2">수량 (개/Pcs)</label>
                  <input 
                    type="number" 
                    value={newRecord.count} 
                    onChange={e => setNewRecord({...newRecord, count: parseInt(e.target.value)})}
                    className="w-full px-8 py-4 bg-gray-50 border border-slate-200 font-normal text-[#475569] rounded-2xl outline-none focus:border-[#8DC63F] transition-all tabular-nums" 
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-normal text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2"><Users size={12}/> 선별인원</label>
                  <input 
                    type="number" 
                    value={newRecord.sortingPersonnel} 
                    onChange={e => setNewRecord({...newRecord, sortingPersonnel: parseInt(e.target.value)})}
                    className="w-full px-8 py-4 bg-gray-50 border border-slate-200 font-normal text-[#475569] rounded-2xl outline-none focus:border-[#8DC63F] transition-all tabular-nums" 
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-normal text-slate-400 uppercase tracking-widest ml-2">금액 (KZT)</label>
                  <input 
                    type="number" 
                    value={newRecord.amount} 
                    onChange={e => setNewRecord({...newRecord, amount: parseInt(e.target.value)})}
                    className="w-full px-8 py-4 bg-gray-50 border border-slate-200 font-normal text-[#475569] rounded-2xl outline-none focus:border-[#8DC63F] transition-all tabular-nums" 
                  />
                </div>
              </div>
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 bg-slate-100 text-slate-400 font-black uppercase rounded-2xl text-xs tracking-widest">CANCEL</button>
                <button type="submit" className="flex-1 py-3.5 bg-[#8DC63F] text-white font-black uppercase rounded-2xl shadow-xl text-xs tracking-widest">{editingRecord ? 'SAVE' : '기록저장'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recycling;
