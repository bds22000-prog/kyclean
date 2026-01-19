
import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation, WithYouLogo } from '../App';
import { Printer, Save, Camera, Trash2, Plus, User, FileText, ClipboardList, MapPin, UserMinus, ChevronLeft, Users, CheckCircle } from 'lucide-react';
import { Employee } from '../types';

const HRSection: React.FC = () => {
  const { employees, setEmployees, hrSubTab, setHrSubTab, searchTerm, selectedEmpId, setSelectedEmpId, setTriggerAddModal, lang } = useTranslation();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emptyCard: Partial<Employee> = {
    id: '',
    empNo: '',
    name: '',
    nameCyrillic: '',
    phone: '',
    department: '',
    positionCyrillic: '',
    role: 'Staff',
    company: 'WY',
    gender: 'M',
    birthDate: '',
    joinDate: '',
    resignationDate: '',
    address: '',
    education: [],
    career: [],
    family: [],
    remarks: ''
  };

  const [cardData, setCardData] = useState<any>(emptyCard);

  useEffect(() => {
    if (hrSubTab === 'card' && !selectedEmpId && employees && employees.length > 0) {
      setSelectedEmpId(employees[0].id);
    }
  }, [hrSubTab, selectedEmpId, employees, setSelectedEmpId]);

  useEffect(() => {
    setTriggerAddModal(() => () => {
      setSelectedEmpId('new');
      setHrSubTab('card');
      setCardData({ ...emptyCard, id: `emp-${Date.now()}`, empNo: `WY-${(employees.length).toString().padStart(4, '0')}` });
      setPhotoPreview(null);
    });
  }, [setTriggerAddModal, setSelectedEmpId, setHrSubTab, employees.length]);

  useEffect(() => {
    if (selectedEmpId) {
      if (selectedEmpId !== 'new') {
        const emp = employees.find(e => e.id === selectedEmpId);
        if (emp) {
          setCardData({
            ...emp,
            gender: emp.gender || 'M',
            birthDate: emp.birthDate || '',
            joinDate: emp.joinDate || '',
            resignationDate: emp.resignationDate || '',
            address: emp.address || '',
            education: emp.education || '',
            career: emp.career || '',
            family: emp.family || '',
            remarks: emp.remarks || ''
          });
          setPhotoPreview(emp.photo || null);
        }
      }
    }
  }, [selectedEmpId, employees]);

  const handleRowClick = (id: string) => {
    setSelectedEmpId(id);
    setHrSubTab('card');
  };

  const handleCardChange = (field: string, value: any) => {
    setCardData((prev: any) => ({ ...prev, [field]: value }));
  };

  const saveCardChanges = useCallback(() => {
    if (!cardData.name) {
      alert(lang === 'ko' ? "성명을 입력해주세요." : "Пожалуйста, введите имя.");
      return;
    }
    const updatedEmployee = { ...cardData, photo: photoPreview };
    
    setEmployees((prev: Employee[]) => {
      const exists = prev.find(e => e.id === updatedEmployee.id);
      if (exists) {
        return prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp);
      } else {
        return [...prev, updatedEmployee];
      }
    });
    
    alert(lang === 'ko' ? `${cardData.name}님의 인사카드가 저장되었습니다.` : `Личная карточка ${cardData.name} сохранена.`);
    setHrSubTab('status');
  }, [cardData, photoPreview, setEmployees, setHrSubTab, lang]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setPhotoPreview(reader.result as string); };
      reader.readAsDataURL(file);
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (e.nameCyrillic || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.empNo || '').toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
      if (hrSubTab === 'status') return !e.resignationDate;
      if (hrSubTab === 'resigned') return !!e.resignationDate;
      return true;
    });
  }, [employees, searchTerm, hrSubTab]);

  const labelCellClass = "bg-slate-50 border border-slate-200 p-3 text-center font-bold text-[11px] uppercase tracking-tighter text-slate-600 w-[125px] flex flex-col items-center justify-center leading-tight shrink-0";
  const inputClass = "w-full h-full px-4 py-3 bg-transparent border-none outline-none font-medium text-slate-800 focus:bg-blue-50/20 transition-colors text-[14px]";
  const textAreaClass = "w-full p-4 outline-none font-medium text-[14px] leading-[45px] resize-none focus:bg-blue-50/5 transition-colors border-none min-h-[135px] bg-[linear-gradient(transparent_44px,#e2e8f0_44px)] bg-[size:100%_45px] text-slate-700";

  const excelThStyle = "border border-slate-200 bg-slate-100 p-3 text-center font-bold text-[12px] text-slate-700 uppercase tracking-tighter whitespace-nowrap";
  const excelTdStyle = "border border-slate-200 p-3 text-[13px] text-center font-medium h-12 tabular-nums";

  return (
    <div className="space-y-6 animate-in fade-in duration-500" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
      {(hrSubTab === 'status' || hrSubTab === 'resigned') ? (
        <div className="bg-white border border-[#ddd] shadow-2xl overflow-hidden rounded-none p-1">
          <div className="bg-slate-100 border-b border-slate-200 p-4 flex justify-between items-center no-print">
            <div className="flex items-center gap-3">
              <WithYouLogo size={30} />
              <div>
                <h2 className="text-[16px] font-black uppercase tracking-tight text-slate-900">직원현황</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{hrSubTab === 'status' ? 'Active Personnel Status' : 'Resigned Personnel Archive'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => window.print()} className="p-2 bg-white border border-slate-200 text-slate-400 rounded-none hover:text-slate-900 transition-all"><Printer size={16}/></button>
              <button 
                onClick={() => {
                  setSelectedEmpId('new');
                  setHrSubTab('card');
                  setCardData({ ...emptyCard, id: `emp-${Date.now()}`, empNo: `WY-${(employees.length).toString().padStart(4, '0')}` });
                  setPhotoPreview(null);
                }}
                className="bg-[#ccff00] text-slate-900 px-6 py-2 rounded-none font-black text-[11px] uppercase shadow-md hover:bg-[#b8e600] transition-all"
              >
                신규 등록
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={excelThStyle} style={{ width: '100px' }}>사원번호</th>
                  <th className={excelThStyle}>성명 (RU)</th>
                  <th className={excelThStyle}>성명 (KR)</th>
                  <th className={excelThStyle}>직책 (KR)</th>
                  <th className={excelThStyle}>직책 (RU)</th>
                  <th className={excelThStyle} style={{ width: '80px' }}>성별</th>
                  <th className={excelThStyle} style={{ width: '80px' }}>회사</th>
                  <th className={`${excelThStyle} no-print`} style={{ width: '100px' }}>Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredEmployees.map((e) => (
                  <tr key={e.id} className="hover:bg-blue-50/50 cursor-pointer transition-colors group" onClick={() => handleRowClick(e.id)}>
                    <td className={`${excelTdStyle} font-mono font-black text-slate-400 tabular-nums`}>{e.empNo}</td>
                    <td className={`${excelTdStyle} text-slate-800 font-bold`}>{e.nameCyrillic || '-'}</td>
                    <td className={`${excelTdStyle} text-slate-900 font-black`}>{e.name}</td>
                    <td className={`${excelTdStyle} text-slate-700 font-bold`}>{e.department}</td>
                    <td className={`${excelTdStyle} text-slate-500 font-medium italic text-[11px]`}>{e.positionCyrillic || '-'}</td>
                    <td className={excelTdStyle}>{e.gender === 'F' ? '여' : '남'}</td>
                    <td className={`${excelTdStyle} font-black ${e.company === 'SK' ? 'text-blue-600' : 'text-slate-900'}`}>{e.company}</td>
                    <td className={`${excelTdStyle} no-print`} onClick={(ev) => ev.stopPropagation()}>
                       <div className="flex justify-center gap-2">
                          <button onClick={() => handleRowClick(e.id)} className="p-1.5 text-slate-300 hover:text-blue-600 transition-all"><FileText size={16}/></button>
                          <button onClick={() => { if(confirm(`${e.name}님의 정보를 삭제하시겠습니까?`)) setEmployees((prev: Employee[]) => prev.filter(emp => emp.id !== e.id)); }} className="p-1.5 text-slate-300 hover:text-red-600 transition-all"><Trash2 size={16}/></button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 xl:p-12 max-w-[950px] mx-auto text-slate-900 print:p-0 animate-in fade-in duration-700 shadow-2xl rounded-none border border-[#ddd] relative overflow-hidden" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
          <div className="flex justify-between items-center mb-10 no-print">
            <button onClick={() => { setSelectedEmpId(null); setHrSubTab('status'); }} className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-none font-bold text-[10px] uppercase transition-all border border-slate-200"><ChevronLeft size={16} /> 목록으로</button>
            <div className="flex gap-3">
              <button onClick={saveCardChanges} className="flex items-center gap-2 bg-[#00AFCA] text-white px-6 py-2.5 rounded-none font-bold text-[11px] hover:bg-[#008ba3] shadow-lg transition-all active:scale-95"><Save size={16} /> 저장</button>
              <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-none font-bold text-[11px] hover:bg-black transition-all shadow-lg uppercase tracking-widest"><Printer size={16} /> 인쇄</button>
            </div>
          </div>
          <div className="text-center mb-12">
            <h1 className="text-3xl font-black tracking-[0.2em] border-b-4 border-slate-900 inline-block pb-2 uppercase leading-none text-slate-900">
              {lang === 'ru' ? 'ЛИЧНАЯ КАРТОЧКА' : '인 사 기 록 부'}
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.4em] italic text-[10px] mt-4">PERSONNEL RECORD CARD</p>
          </div>

          <div className="border border-slate-200 rounded-none overflow-hidden">
             <div className="flex border-b border-slate-200">
                <div className="w-[180px] border-r border-slate-200 flex flex-col bg-slate-50 shrink-0">
                    <div className="h-full relative group cursor-pointer aspect-[3/4]" onClick={() => fileInputRef.current?.click()}>
                      {photoPreview ? <img src={photoPreview} className="w-full h-full object-cover" alt="Profile" /> : <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 min-h-[200px]"><User size={48} className="mb-2 opacity-20" /><p className="text-[9px] font-bold uppercase tracking-widest text-center">Photo / Фото</p></div>}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center no-print"><Camera size={24} className="text-white" /></div>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                    </div>
                </div>
                <div className="flex-1 flex flex-col">
                    <div className="grid grid-cols-2 border-b border-slate-200">
                       <div className="flex border-r border-slate-200"><div className={labelCellClass}><span>성 명</span><span className="text-[8px] opacity-50 uppercase">Name (KR)</span></div><div className="flex-1"><input className={inputClass} value={cardData.name || ''} onChange={e => handleCardChange('name', e.target.value)} /></div></div>
                       <div className="flex"><div className={labelCellClass}><span>Ф.И.О</span><span className="text-[8px] opacity-50 uppercase">Name (RU)</span></div><div className="flex-1"><input className={inputClass} value={cardData.nameCyrillic || ''} onChange={e => handleCardChange('nameCyrillic', e.target.value)} /></div></div>
                    </div>
                    <div className="grid grid-cols-2 border-b border-slate-200">
                       <div className="flex border-r border-slate-200"><div className={labelCellClass}><span>생년월일</span><span className="text-[8px] opacity-50 uppercase">Birth Date</span></div><div className="flex-1"><input type="date" className={`${inputClass} tabular-nums`} value={cardData.birthDate} onChange={e => handleCardChange('birthDate', e.target.value)} /></div></div>
                       <div className="flex"><div className={labelCellClass}><span>성 별</span><span className="text-[8px] opacity-50 uppercase">Gender</span></div><div className="flex-1 flex items-center gap-6 px-6 bg-white"><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="gender" value="M" checked={cardData.gender === 'M'} onChange={e => handleCardChange('gender', e.target.value)} className="w-4 h-4 accent-blue-600" /><span className="font-bold text-[13px] text-slate-700">남</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="gender" value="F" checked={cardData.gender === 'F'} onChange={e => handleCardChange('gender', e.target.value)} className="w-4 h-4 accent-blue-600" /><span className="font-bold text-[13px] text-slate-700">여</span></label></div></div>
                    </div>
                    <div className="grid grid-cols-2 border-b border-slate-200">
                       <div className="flex border-r border-slate-200"><div className={labelCellClass}><span>소속 / 직책</span><span className="text-[8px] opacity-50 uppercase">Position</span></div><div className="flex-1"><input className={inputClass} value={`${cardData.department} / ${cardData.positionCyrillic || ''}`} onChange={e => { const val = e.target.value.split('/'); handleCardChange('department', val[0]?.trim() || ''); handleCardChange('positionCyrillic', val[1]?.trim() || ''); }} /></div></div>
                       <div className="flex"><div className={labelCellClass}><span>사원번호</span><span className="text-[8px] opacity-50 uppercase">Emp No</span></div><div className="flex-1 bg-slate-50/50"><input className={`${inputClass} text-slate-400 font-bold tabular-nums`} value={cardData.empNo || ''} readOnly /></div></div>
                    </div>
                    <div className="flex">
                       <div className={labelCellClass}><span>휴대전화</span><span className="text-[8px] opacity-50 uppercase">Phone</span></div>
                       <div className="flex-1"><input className={`${inputClass} tabular-nums`} value={cardData.phone || ''} onChange={e => handleCardChange('phone', e.target.value)} placeholder="+7 7XX XXX XXXX" /></div>
                    </div>
                </div>
             </div>
             
             <div className="flex border-b border-slate-200">
                <div className="grid grid-cols-2 w-full">
                    <div className="flex border-r border-slate-200"><div className={labelCellClass}><span>입사일자</span><span className="text-[8px] opacity-50 uppercase">Join Date</span></div><div className="flex-1"><input type="date" className={`${inputClass} tabular-nums`} value={cardData.joinDate} onChange={e => handleCardChange('joinDate', e.target.value)} /></div></div>
                    <div className="flex"><div className={`${labelCellClass} ${cardData.resignationDate ? 'text-red-600 bg-red-50/30' : ''}`}><span>퇴사일자</span><span className="text-[8px] opacity-50 uppercase">Resignation</span></div><div className={`flex-1 ${cardData.resignationDate ? 'bg-red-50/5' : ''}`}><input type="date" className={`${inputClass} tabular-nums ${cardData.resignationDate ? 'text-red-600' : ''}`} value={cardData.resignationDate || ''} onChange={e => handleCardChange('resignationDate', e.target.value)} /></div></div>
                </div>
             </div>

             <div className="flex border-b border-slate-200">
                <div className={labelCellClass}><span>현 주 소</span><span className="text-[8px] opacity-50 uppercase">Address</span></div>
                <div className="flex-1"><input className={`${inputClass} text-left`} value={cardData.address || ''} onChange={e => handleCardChange('address', e.target.value)} /></div>
             </div>

             <div className="grid grid-cols-2">
                <div className="flex flex-col border-r border-slate-200">
                   <div className="bg-slate-50 p-2 text-center border-b border-slate-200"><span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">학 력 사 항 (Education)</span></div>
                   <textarea className={textAreaClass} value={Array.isArray(cardData.education) ? cardData.education.join('\n') : cardData.education} onChange={e => handleCardChange('education', e.target.value)} />
                </div>
                <div className="flex flex-col">
                   <div className="bg-slate-50 p-2 text-center border-b border-slate-200"><span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">경 력 사 항 (Experience)</span></div>
                   <textarea className={textAreaClass} value={Array.isArray(cardData.career) ? cardData.career.join('\n') : cardData.career} onChange={e => handleCardChange('career', e.target.value)} />
                </div>
             </div>

             <div className="grid grid-cols-2 border-t border-slate-200">
                <div className="flex flex-col border-r border-slate-200">
                   <div className="bg-slate-50 p-2 text-center border-b border-slate-200"><span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">가 족 사 항 (Family)</span></div>
                   <textarea className={textAreaClass} value={Array.isArray(cardData.family) ? cardData.family.join('\n') : cardData.family} onChange={e => handleCardChange('family', e.target.value)} />
                </div>
                <div className="flex flex-col">
                   <div className="bg-slate-50 p-2 text-center border-b border-slate-200"><span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">특이사항 (Remarks)</span></div>
                   <textarea className={textAreaClass} value={cardData.remarks} onChange={e => handleCardChange('remarks', e.target.value)} />
                </div>
             </div>
          </div>

          <div className="mt-16 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <WithYouLogo size={40} />
              <div className="h-6 w-px bg-slate-200"></div>
              <p className="text-slate-900 font-black text-[13px] tracking-widest uppercase">TOO WITH YOU E&C KYZYLORDA</p>
            </div>
            <p className="text-slate-300 font-bold text-[9px] uppercase tracking-[0.4em] italic tabular-nums">IMS Personnel Ledger Secure Digital Record v3.0.1</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRSection;
