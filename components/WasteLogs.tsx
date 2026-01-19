
import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation, WithYouLogo } from '../App';
import { X, Check, Edit3, Trash2, Printer, Plus, Search, Save, Truck, ChevronLeft, ChevronRight, Calendar, Package, TrendingUp, Building2, FileText, Sun, Thermometer, UserCheck, Languages, RefreshCw } from 'lucide-react';
import { WasteType, WasteEntry, Client } from '../types';
import { translateContent } from '../geminiService';

interface WorkJournal {
  date: string;
  writer: string;
  weather: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  temperature: string;
  morningWork: string;
  afternoonWork: string;
  specialNotes: string;
  equipments: {
    bulldozer: string;
    excavator: string;
    loader: string;
    trucks: string;
  };
}

const WasteLogs: React.FC = () => {
  const { clients, setClients, wasteSubTab, searchTerm, setTriggerAddModal, user, lang, t, wasteEntries, setWasteEntries } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WasteEntry | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [translating, setTranslating] = useState<string | null>(null);
  
  const getKyzylordaNow = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Qyzylorda' }));
  const formatDateToYYYYMMDD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [viewDate, setViewDate] = useState(getKyzylordaNow());
  const selectedDateStr = useMemo(() => formatDateToYYYYMMDD(viewDate), [viewDate]);
  const selectedMonthStr = selectedDateStr.substring(0, 7);

  const [journals, setJournals] = useState<Record<string, WorkJournal>>({
    [selectedDateStr]: {
      date: selectedDateStr,
      writer: user.name,
      weather: 'sunny',
      temperature: '18',
      morningWork: '1. ',
      afternoonWork: '1. ',
      specialNotes: '1. ',
      equipments: { bulldozer: '정상 가동', excavator: '정상 가동', loader: '정상 가동', trucks: '정상 가동' }
    }
  });

  const [newEntry, setNewEntry] = useState({
    clientName: '',
    vehicleNumber: '',
    type: WasteType.General,
    weight: 0,
    entryDate: selectedDateStr
  });

  const [newClient, setNewClient] = useState({ name: '', nameCyrillic: '', phone: '', fee: 2200 });

  useEffect(() => {
    setTriggerAddModal(() => () => {
        if (wasteSubTab === 'logs' || wasteSubTab === 'monthly') {
            setEditingEntry(null);
            setNewEntry({
                clientName: clients[0]?.name || '',
                vehicleNumber: '',
                type: WasteType.General,
                weight: 0,
                entryDate: selectedDateStr
            });
            setIsModalOpen(true);
        } else if (wasteSubTab === 'clients') {
            setEditingClient(null);
            setNewClient({ name: '', nameCyrillic: '', phone: '', fee: 2200 });
            setIsClientModalOpen(true);
        } else {
          handleSaveJournal();
        }
    });
  }, [setTriggerAddModal, wasteSubTab, clients, selectedDateStr]);

  const handleTranslate = async (field: keyof WorkJournal) => {
    setTranslating(field);
    const text = currentJournal[field] as string;
    const translated = await translateContent(text, lang);
    handleJournalChange(field, translated);
    setTranslating(null);
  };

  const handleAddOrUpdateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.name === newEntry.clientName);
    const entry: WasteEntry = {
      id: editingEntry ? editingEntry.id : `w-${Date.now()}`,
      ...newEntry,
      clientNameCyrillic: client?.nameCyrillic || '',
      cost: (client?.defaultFeePerTon || 2200) * newEntry.weight
    };

    if (editingEntry) {
      setWasteEntries((prev: WasteEntry[]) => prev.map(en => en.id === editingEntry.id ? entry : en));
    } else {
      setWasteEntries((prev: WasteEntry[]) => [entry, ...prev]);
    }
    setIsModalOpen(false);
    setEditingEntry(null);
  };

  const handleAddOrUpdateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
        setClients((prev: Client[]) => prev.map(c => c.id === editingClient.id ? { ...c, name: newClient.name, nameCyrillic: newClient.nameCyrillic, phone: newClient.phone, defaultFeePerTon: newClient.fee } : c));
    } else {
        const client: Client = {
          id: `c-${Date.now()}`,
          name: newClient.name,
          nameCyrillic: newClient.nameCyrillic,
          phone: newClient.phone,
          defaultFeePerTon: newClient.fee,
          registrationDate: formatDateToYYYYMMDD(getKyzylordaNow())
        };
        setClients([...clients, client]);
    }
    setIsClientModalOpen(false);
    setEditingClient(null);
  };

  const openEditEntry = (entry: WasteEntry) => {
    setEditingEntry(entry);
    setNewEntry({
      clientName: entry.clientName,
      vehicleNumber: entry.vehicleNumber,
      type: entry.type,
      weight: entry.weight,
      entryDate: entry.entryDate
    });
    setIsModalOpen(true);
  };

  const openEditClient = (client: Client) => {
    setEditingClient(client);
    setNewClient({ name: client.name, nameCyrillic: client.nameCyrillic || '', phone: client.phone || '', fee: client.defaultFeePerTon });
    setIsClientModalOpen(true);
  };

  const filteredEntries = useMemo(() => {
    return (wasteEntries || []).filter(e => 
      e.entryDate === selectedDateStr && (
        e.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [wasteEntries, searchTerm, selectedDateStr]);

  const monthlyFilteredEntries = useMemo(() => {
    return (wasteEntries || []).filter(e => 
      e.entryDate.startsWith(selectedMonthStr) && (
        e.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [wasteEntries, searchTerm, selectedMonthStr]);

  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (c.nameCyrillic || '').toLowerCase().includes(searchTerm.toLowerCase())
    ).map(client => {
      const monthlyWeight = (wasteEntries || [])
        .filter(e => e.clientName === client.name && e.entryDate.startsWith(selectedMonthStr))
        .reduce((sum, e) => sum + e.weight, 0);
      return { ...client, monthlyWeight };
    });
  }, [clients, wasteEntries, searchTerm, selectedMonthStr]);

  const dailyTotalWeight = useMemo(() => filteredEntries.reduce((acc, curr) => acc + curr.weight, 0), [filteredEntries]);
  
  const monthlyTotalWeight = useMemo(() => {
    return (wasteEntries || [])
      .filter(e => e.entryDate.startsWith(selectedMonthStr))
      .reduce((acc, curr) => acc + curr.weight, 0);
  }, [wasteEntries, selectedMonthStr]);

  const monthlyTotalCost = useMemo(() => {
    return monthlyFilteredEntries.reduce((acc, curr) => acc + curr.cost, 0);
  }, [monthlyFilteredEntries]);

  const handleDateChange = (days: number) => {
    const next = new Date(viewDate);
    if (wasteSubTab === 'monthly') {
      next.setMonth(next.getMonth() + (days > 0 ? 1 : -1));
    } else {
      next.setDate(next.getDate() + days);
    }
    setViewDate(next);
  };

  const currentJournal: WorkJournal = useMemo(() => {
    return journals[selectedDateStr] || {
      date: selectedDateStr,
      writer: user.name,
      weather: 'sunny',
      temperature: '18',
      morningWork: '1. ',
      afternoonWork: '1. ',
      specialNotes: '1. ',
      equipments: { bulldozer: '정상 가동', excavator: '정상 가동', loader: '정상 가동', trucks: '정상 가동' }
    };
  }, [journals, selectedDateStr, user.name]);

  const handleJournalChange = (field: keyof WorkJournal, value: any) => {
    setJournals(prev => ({
      ...prev,
      [selectedDateStr]: {
        ...currentJournal,
        [field]: value
      } as WorkJournal
    }));
  };

  const handleEquipmentChange = (key: keyof WorkJournal['equipments'], value: string) => {
    setJournals(prev => ({
      ...prev,
      [selectedDateStr]: {
        ...currentJournal,
        equipments: {
          ...currentJournal.equipments,
          [key]: value
        }
      } as WorkJournal
    }));
  };

  const handleSaveJournal = () => {
    alert(`${selectedDateStr} 업무일지가 성공적으로 저장되었습니다.`);
  };

  const erpHeaderStyle = "border border-[#ddd] bg-slate-100 p-3 text-center font-normal text-[11px] uppercase tracking-tighter text-[#475569]";
  const erpCellStyle = "border border-[#ddd] p-2 h-12 text-center font-normal text-[13px] text-[#475569] bg-white";
  
  const journalLabelStyle = "bg-slate-100 border-r border-[#ddd] p-2 text-center font-normal text-[11px] uppercase tracking-tighter text-[#475569] flex flex-col items-center justify-center shrink-0 w-24 md:w-32";
  const journalInputStyle = "w-full h-full p-4 outline-none font-normal text-[14px] text-[#475569] leading-relaxed resize-none focus:bg-blue-50/10 transition-colors border-none";
  const innerHeaderStyle = "p-2 text-center font-normal text-[10px] text-[#475569] uppercase flex flex-col items-center justify-center border-b border-[#ddd] bg-slate-50";

  const renderJournal = () => {
    const isRU = lang === 'ru';
    return (
      <div className="bg-white p-4 md:p-12 max-w-[1000px] mx-auto shadow-2xl rounded-none border border-[#ddd] print:p-0 print:shadow-none print:border-none animate-in fade-in duration-700" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
        
        {/* Header section - Responsive */}
        <div className="flex flex-col md:flex-row items-start justify-between mb-10 gap-6">
          <div className="w-full md:w-1/4 flex flex-col items-center md:items-start">
            <WithYouLogo size={60} />
            <p className="text-[8px] font-normal text-slate-400 mt-2 uppercase tracking-tighter text-center md:text-left">TOO WITH YOU E&C KYZYLORDA</p>
          </div>
          
          <div className="flex-1 text-center self-center order-first md:order-none">
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tighter uppercase leading-none border-b-4 border-slate-900 inline-block pb-1 mb-2">
              {isRU ? 'РАБОЧИЙ ЖУРНАЛ' : '업 무 일 지'}
            </h2>
          </div>
          
          <div className="w-full md:w-1/4 flex justify-center md:justify-end">
            <table className="border-collapse border border-[#ddd] bg-white w-full max-w-[240px] text-[8px] md:text-[10px]">
              <thead>
                <tr className="bg-slate-100 h-6 md:h-8">
                  {['담당', '책임자', '이사', '대표'].map((label, idx) => (
                    <th key={idx} className="border border-[#ddd] font-bold text-slate-900 text-center w-1/4 uppercase tracking-tighter">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="h-14 md:h-20">
                  <td className="border border-[#ddd] text-center align-middle relative"><span className="text-[#475569] font-normal italic text-[10px]">{currentJournal.writer}</span></td>
                  <td className="border border-[#ddd]"></td>
                  <td className="border border-[#ddd]"></td>
                  <td className="border border-[#ddd]"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="border border-[#ddd] rounded-none overflow-hidden shadow-sm">
          {/* Weather Row */}
          <div className="flex flex-col md:flex-row border-b border-[#ddd] bg-white">
            <div className="flex flex-1 border-b md:border-b-0 md:border-r border-[#ddd] h-16">
              <div className={journalLabelStyle}><span>{t('date')}</span></div>
              <div className="flex-1 flex items-center justify-center font-normal text-xl tabular-nums tracking-tighter text-[#475569]">
                {currentJournal.date.replace(/-/g, '.')}
              </div>
            </div>
            <div className="flex flex-1 h-16">
              <div className={journalLabelStyle}><span>날씨 / 온도</span></div>
              <div className="flex-1 flex items-center justify-center px-4 gap-4">
                 <div className="flex items-center gap-2">
                    <Sun size={18} className="text-[#FEC110]" />
                    <span className="font-normal text-xs text-[#475569] uppercase">Sunny</span>
                 </div>
                 <div className="flex items-center gap-1">
                    <Thermometer size={16} className="text-red-500" />
                    <span className="font-normal text-xl tabular-nums text-[#475569]">{currentJournal.temperature}</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Morning Work with AI Translate */}
          <div className="flex flex-col md:flex-row border-b border-[#ddd] min-h-[160px]">
            <div className={journalLabelStyle}>
              <span>오전 작업</span>
              <button 
                onClick={() => handleTranslate('morningWork')}
                className="mt-3 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all flex flex-col items-center gap-1 group"
              >
                {translating === 'morningWork' ? <RefreshCw size={14} className="animate-spin" /> : <Languages size={14} />}
                <span className="text-[7px] font-black uppercase">AI 번역</span>
              </button>
            </div>
            <div className="flex-1">
              <textarea 
                className={journalInputStyle} 
                value={currentJournal.morningWork} 
                onChange={e => handleJournalChange('morningWork', e.target.value)}
              />
            </div>
          </div>

          {/* Afternoon Work with AI Translate */}
          <div className="flex flex-col md:flex-row border-b border-[#ddd] min-h-[160px]">
            <div className={journalLabelStyle}>
              <span>오후 작업</span>
              <button 
                onClick={() => handleTranslate('afternoonWork')}
                className="mt-3 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all flex flex-col items-center gap-1"
              >
                {translating === 'afternoonWork' ? <RefreshCw size={14} className="animate-spin" /> : <Languages size={14} />}
                <span className="text-[7px] font-black uppercase">AI 번역</span>
              </button>
            </div>
            <div className="flex-1">
              <textarea 
                className={journalInputStyle} 
                value={currentJournal.afternoonWork} 
                onChange={e => handleJournalChange('afternoonWork', e.target.value)}
              />
            </div>
          </div>

          {/* Special Notes with AI Translate */}
          <div className="flex flex-col md:flex-row min-h-[120px]">
            <div className={journalLabelStyle}>
              <span>특이사항</span>
              <button 
                onClick={() => handleTranslate('specialNotes')}
                className="mt-3 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all flex flex-col items-center gap-1"
              >
                {translating === 'specialNotes' ? <RefreshCw size={14} className="animate-spin" /> : <Languages size={14} />}
                <span className="text-[7px] font-black uppercase">AI 번역</span>
              </button>
            </div>
            <div className="flex-1">
              <textarea 
                className={journalInputStyle} 
                value={currentJournal.specialNotes} 
                onChange={e => handleJournalChange('specialNotes', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Navigator - Mobile optimized */}
      <div className="bg-white p-4 md:p-6 rounded-none border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 no-print">
         <div className="flex items-center gap-2 md:gap-6 w-full md:w-auto">
            <div className="flex bg-slate-50 border border-slate-200 p-1 w-full md:w-auto justify-between items-center rounded-xl">
              <button onClick={() => handleDateChange(-1)} className="p-2 hover:bg-white rounded-lg text-slate-400"><ChevronLeft size={20}/></button>
              <div className="px-4 flex items-center gap-3">
                <Calendar size={18} className="text-[#00AFCA]" />
                <span className="font-bold text-slate-800 text-[14px] tabular-nums">
                  {selectedDateStr}
                </span>
              </div>
              <button onClick={() => handleDateChange(1)} className="p-2 hover:bg-white rounded-lg text-slate-400"><ChevronRight size={20}/></button>
            </div>
         </div>

         <div className="flex gap-2 w-full md:w-auto">
            <button onClick={() => window.print()} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-bold text-xs uppercase"><Printer size={16} /> 인쇄</button>
            <button 
              onClick={() => {
                if (wasteSubTab === 'journal') handleSaveJournal();
                else setIsModalOpen(true);
              }}
              className="flex-2 md:flex-none px-6 py-2.5 bg-[#00AFCA] text-white font-bold rounded-xl hover:bg-[#008ba3] flex items-center justify-center gap-2 text-xs shadow-lg uppercase"
            >
              <Plus size={18} /> {wasteSubTab === 'journal' ? '일지 저장' : '기록 등록'}
            </button>
         </div>
      </div>

      <div className="bg-white p-0 md:p-1 overflow-hidden print:p-0">
           {wasteSubTab === 'journal' ? renderJournal() : (
             <div className="overflow-x-auto border border-[#ddd] rounded-none">
                <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-[10px] md:text-[11px]">
                        <th className={erpHeaderStyle}>일자</th>
                        <th className={`${erpHeaderStyle} text-left px-4`}>거래처</th>
                        <th className={erpHeaderStyle}>차량</th>
                        <th className={erpHeaderStyle}>중량(T)</th>
                        <th className={`${erpHeaderStyle} no-print`}>관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEntries.map(e => (
                        <tr key={e.id} className="hover:bg-blue-50/20 text-xs md:text-sm h-12 md:h-14">
                          <td className={erpCellStyle}>{e.entryDate.slice(5)}</td>
                          <td className={`${erpCellStyle} text-left px-4 font-bold`}>{lang === 'ko' ? e.clientName : (e.clientNameCyrillic || e.clientName)}</td>
                          <td className={`${erpCellStyle} font-mono text-blue-800`}>{e.vehicleNumber}</td>
                          <td className={`${erpCellStyle} text-right font-black pr-4 tabular-nums`}>{e.weight.toFixed(2)}</td>
                          <td className={`${erpCellStyle} no-print`}>
                             <div className="flex justify-center gap-1 md:gap-2">
                                <button onClick={() => openEditEntry(e)} className="p-1.5 text-slate-300 hover:text-blue-600"><Edit3 size={14}/></button>
                                <button onClick={() => setWasteEntries((prev: WasteEntry[]) => prev.filter(en => en.id !== e.id))} className="p-1.5 text-slate-300 hover:text-red-600"><Trash2 size={14}/></button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                </table>
             </div>
           )}
      </div>
    </div>
  );
};

export default WasteLogs;
