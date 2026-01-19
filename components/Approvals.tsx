
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation, WithYouLogo } from '../App';
import { Clock, X, Printer, Save, CheckSquare, FilePlus, ChevronRight, FileText, Calendar, User, Search, CheckCircle, PlusCircle, ShieldCheck, IdCard, FileCheck, Paperclip, Trash2, File as FileIcon, UploadCloud } from 'lucide-react';
import { ApprovalDoc, ApprovalFormType } from '../types';

const Approvals: React.FC = () => {
  const { approvalSubTab, searchTerm, setTriggerAddModal, user, t, lang } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to format YYYY-MM-DD to YY.MM.DD
  const formatToShortDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[0].slice(-2)}.${parts[1]}.${parts[2]}`;
  };

  // Get current date in Kyzylorda timezone
  const getKyzylordaNow = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Qyzylorda' }));
  const formatDateToYYYYMMDD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [docs, setDocs] = useState<ApprovalDoc[]>([
    { id: '1', type: 'Proposal', title: '2026년 1분기 소모품 구매 건', requester: '배대식', content: '현장 소모품(장갑, 마스크 등) 구매 요청', date: '2026-01-05', status: 'Pending', approvalLine: [] },
    { id: '2', type: 'Expense', title: '1월 차량 유류비 결제', requester: '누르지깃', content: '현장 장비 유류대금 지출 결의', date: '2026-01-06', status: 'Approved', approvalLine: [] },
  ]);

  const [expenseRows, setExpenseRows] = useState(
    Array.from({ length: 8 }, (_, i) => ({ id: i + 1, detail: '', date: '', amount: 0 }))
  );
  
  const [formData, setFormData] = useState({
    title: '',
    drafter: user.name,
    dept: user.department,
    date: formatDateToYYYYMMDD(getKyzylordaNow()),
    content: '',
    destination: '',
    purpose: '',
    startDate: formatDateToYYYYMMDD(getKyzylordaNow()),
    endDate: formatDateToYYYYMMDD(getKyzylordaNow()),
    totalDays: '0',
    address: '',
    reason: ''
  });

  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    setTriggerAddModal(() => () => setIsModalOpen(true));
  }, [setTriggerAddModal]);

  const totalExpense = useMemo(() => expenseRows.reduce((acc, row) => acc + (Number(row.amount) || 0), 0), [expenseRows]);

  const handleApprove = () => {
    alert('결재 데이터가 저장되었습니다.');
  };

  const addExpenseRow = () => {
    setExpenseRows(prev => [...prev, { id: prev.length + 1, detail: '', date: '', amount: 0 }]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const labelStyle = "bg-slate-50 border-r border-slate-200 p-2 text-center font-normal text-[11px] h-full flex items-center justify-center tracking-tighter text-[#475569] uppercase shrink-0 w-24";
  const inputStyle = "w-full h-full p-3 bg-transparent border-none outline-none text-center font-normal text-[14px] text-[#475569] focus:bg-blue-50/50 transition-colors placeholder:text-slate-200 tabular-nums";
  const sectionTitle = "text-[12px] font-bold text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-widest border-l-4 border-[#00AFCA] pl-3 mt-8";

  const renderApprovalStatusHeader = () => {
    const steps = [
      { label: '담당', name: formData.drafter, status: 'DONE' },
      { label: '책임자', name: '', status: 'PENDING' },
      { label: '이사', name: '', status: 'PENDING' },
      { label: '부대표', name: '', status: 'PENDING' },
      { label: '대표', name: '', status: 'PENDING' },
    ];

    return (
      <div className="mb-8 flex items-end justify-end w-full">
        <div className="flex items-center">
            <table className="border-collapse border border-slate-200 bg-white shadow-sm overflow-hidden rounded-none">
               <thead>
                 <tr className="bg-slate-50 h-7">
                   {steps.map((step, idx) => (
                     <th key={idx} className="border border-slate-200 px-3 py-1 text-[9px] font-bold text-slate-400 text-center whitespace-nowrap w-20 uppercase tracking-tighter">
                       {step.label}
                     </th>
                   ))}
                 </tr>
               </thead>
               <tbody>
                 <tr className="h-16">
                   {steps.map((step, idx) => (
                     <td key={idx} className="border border-slate-200 bg-white relative min-w-[80px]">
                       {step.status === 'DONE' && (
                         <div className="flex flex-col items-center justify-center h-full animate-in zoom-in duration-300">
                            <span className="text-[11px] font-bold text-[#475569] leading-none">{step.name}</span>
                            <div className="mt-1 text-[7px] font-bold text-[#00AFCA] border border-[#00AFCA] rounded-none px-1 scale-90">APPV</div>
                         </div>
                       )}
                     </td>
                   ))}
                 </tr>
               </tbody>
            </table>
        </div>
      </div>
    );
  };

  const renderStructuredForm = (type: 'Proposal' | 'Expense') => {
    const isExpense = type === 'Expense';
    const isProposal = type === 'Proposal';
    const isRU = lang === 'ru';
    const today = getKyzylordaNow();
    const formattedDateShort = `${String(today.getFullYear()).slice(-2)}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

    return (
      <div className="bg-white p-12 max-w-[1000px] mx-auto text-[#475569] print:p-0 animate-in fade-in duration-700 shadow-2xl rounded-none border border-slate-200 relative overflow-hidden" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
        
        <div className="flex justify-end items-center mb-10 no-print">
          <div className="flex gap-3">
            <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-800 text-white px-8 py-3 rounded-none font-black text-xs hover:bg-blue-900 transition-all shadow-xl uppercase tracking-widest">
              <Printer size={18} /> 인쇄
            </button>
            <button onClick={handleApprove} className="flex items-center gap-2 bg-[#00AFCA] text-white px-8 py-3 rounded-none font-black text-xs hover:bg-[#008ba3] shadow-xl shadow-cyan-100 transition-all uppercase tracking-widest">
              <Save size={18} /> 저장
            </button>
          </div>
        </div>

        {renderApprovalStatusHeader()}

        <div className="text-center mb-10 flex flex-col items-center">
            {isRU ? (
              <>
                <h1 className="text-4xl font-bold tracking-[0.4em] inline-block uppercase leading-none border-b-4 border-slate-900 pb-2 text-slate-900">
                  {isProposal ? 'ПРЕДЛОЖЕНИЕ' : 'РАСХОДЫ'}
                </h1>
                <p className="text-[10px] font-normal text-slate-300 uppercase tracking-[0.2em] mt-3">
                  {isProposal ? '품 의 서 (OPERATIONAL PROPOSAL)' : '지 출 결 의 서 (EXPENSE RESOLUTION)'}
                </p>
              </>
            ) : (
              <>
                <h1 className="text-4xl font-bold tracking-[0.4em] inline-block uppercase leading-none border-b-4 border-slate-900 pb-2 text-slate-900">
                  {isProposal ? '품 의 서' : '지 출 결 의 서'}
                </h1>
                <p className="text-[10px] font-normal text-slate-300 uppercase tracking-[0.2em] mt-3">
                  {isProposal ? 'OPERATIONAL PROPOSAL' : 'EXPENSE RESOLUTION'}
                </p>
              </>
            )}
        </div>

        <div className="border border-slate-200 rounded-none overflow-hidden grid grid-cols-2 mb-8">
            <div className="flex border-b border-r border-slate-200 h-14">
                <div className={labelStyle}>기안부서</div>
                <input className={inputStyle} value={formData.dept} readOnly />
            </div>
            <div className="flex border-b border-slate-200 h-14">
                <div className={labelStyle}>기 안 자</div>
                <input className={inputStyle} value={formData.drafter} readOnly />
            </div>
            <div className="flex border-r border-slate-200 h-14">
                <div className={labelStyle}>기안일자</div>
                <input className={inputStyle} value={formatToShortDate(formData.date)} readOnly />
            </div>
            <div className="flex h-14">
                <div className={labelStyle}>문서번호</div>
                <div className="flex-1 flex items-center justify-center font-normal text-slate-300 text-[13px] tabular-nums">자동 생성 (Auto)</div>
            </div>
        </div>

        <div className="border border-slate-200 rounded-none overflow-hidden flex h-14 mb-8">
            <div className={labelStyle}>제 목</div>
            <input className={`${inputStyle} text-left px-6 font-bold text-[16px] text-slate-900`} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="기안 제목을 입력하세요" />
        </div>

        {isExpense ? (
            <div>
              <h4 className={sectionTitle}>지출 내역 상세 (Details)</h4>
              <div className="border border-slate-200 rounded-none overflow-hidden divide-y divide-slate-100">
                <div className="flex bg-slate-50 h-10 font-bold text-[10px] text-slate-400 uppercase tracking-widest">
                  <div className="w-16 border-r border-slate-100 flex items-center justify-center">No</div>
                  <div className="flex-1 border-r border-slate-100 flex items-center justify-center">일 자 (Date)</div>
                  <div className="flex-[2] border-r border-slate-100 flex items-center justify-center">적 요 (Description)</div>
                  <div className="flex-1 flex items-center justify-center">금 액 (₸)</div>
                </div>
                {expenseRows.map((row, i) => (
                  <div key={row.id} className="flex h-12">
                    <div className="w-16 border-r border-slate-100 flex items-center justify-center text-[11px] font-normal text-slate-300 tabular-nums">{row.id}</div>
                    <div className="flex-1 border-r border-slate-100">
                        <input type="date" className={`${inputStyle} text-[#475569]`} value={row.date} onChange={e => {
                            const newRows = [...expenseRows];
                            newRows[i].date = e.target.value;
                            setExpenseRows(newRows);
                        }} />
                    </div>
                    <div className="flex-[2] border-r border-slate-100">
                        <input className={`${inputStyle} text-left px-4`} value={row.detail} onChange={e => {
                            const newRows = [...expenseRows];
                            newRows[i].detail = e.target.value;
                            setExpenseRows(newRows);
                        }} />
                    </div>
                    <div className="flex-1">
                        <input type="number" className={`${inputStyle} text-right pr-6`} value={row.amount} onChange={e => {
                            const newRows = [...expenseRows];
                            newRows[i].amount = Number(e.target.value);
                            setExpenseRows(newRows);
                        }} />
                    </div>
                  </div>
                ))}
                <div className="flex h-16 bg-slate-50 text-slate-900 font-bold border-t border-slate-200">
                    <div className="flex-[3.5] border-r border-slate-200 flex items-center justify-end px-10 text-[11px] uppercase tracking-[0.4em] opacity-60 text-[#475569]">Grand Total</div>
                    <div className="flex-1 flex items-center justify-end px-8 text-xl text-[#00AFCA] tabular-nums font-black">{totalExpense.toLocaleString()} <span className="text-[10px] ml-1">₸</span></div>
                </div>
              </div>
              <div className="flex justify-end no-print mt-4">
                <button onClick={addExpenseRow} className="flex items-center gap-2 text-[11px] font-bold text-[#00AFCA] hover:underline uppercase tracking-widest">
                  <PlusCircle size={16} /> 행 추가 (Add Row)
                </button>
              </div>
            </div>
        ) : (
            <div>
                <h4 className={sectionTitle}>품의 상세 내용 (Proposal Content)</h4>
                <div className="border border-slate-200 rounded-none overflow-hidden">
                    <textarea 
                        className="w-full h-[350px] p-10 outline-none font-normal text-[15px] text-[#475569] leading-relaxed resize-none focus:bg-blue-50/10 transition-colors" 
                        value={formData.content} 
                        onChange={e => setFormData({...formData, content: e.target.value})}
                        placeholder="품의 내용을 상세히 입력하십시오..."
                    ></textarea>
                </div>
            </div>
        )}

        <h4 className={sectionTitle}>첨부파일 (Attachments)</h4>
        <div className="border-2 border-dashed border-slate-200 rounded-none p-6 bg-slate-50/50">
           <div className="flex flex-wrap gap-3 mb-4 no-print">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-none text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest shadow-sm"
              >
                <Paperclip size={14} className="text-[#00AFCA]" /> 파일 선택
              </button>
              <input type="file" ref={fileInputRef} multiple className="hidden" onChange={handleFileChange} />
           </div>

           <div className="space-y-2">
              {attachments.length > 0 ? (
                attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white p-3 px-5 rounded-none border border-slate-100 shadow-sm animate-in slide-in-from-left-2 duration-300">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-none flex items-center justify-center">
                          <FileIcon size={16} />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[13px] font-normal text-[#475569] leading-none">{file.name}</span>
                          <span className="text-[10px] text-slate-400 mt-1 uppercase font-normal tabular-nums">{(file.size / 1024).toFixed(1)} KB</span>
                       </div>
                    </div>
                    <button onClick={() => removeAttachment(idx)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-none transition-all no-print">
                       <Trash2 size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-slate-300 gap-2">
                   <UploadCloud size={32} className="opacity-20" />
                   <p className="text-[10px] font-normal uppercase tracking-widest">No files attached</p>
                </div>
              )}
           </div>
        </div>

        <div className="mt-16 text-center space-y-4">
            <p className="text-[18px] font-normal text-[#475569] leading-relaxed tracking-tight">상기와 같이 검토 후 재가하여 주시기 바랍니다.</p>
            <p className="text-[11px] font-normal tracking-[0.4em] tabular-nums text-slate-400">{formattedDateShort}</p>
        </div>

        <div className="mt-16 border-t border-slate-100 pt-10 flex justify-between items-center px-10">
            <WithYouLogo size={60} />
            <div className="flex items-center gap-12">
                <span className="text-slate-400 text-[12px] font-normal uppercase tracking-widest">신청인 (Applicant)</span>
                <div className="flex items-center gap-6">
                    <span className="text-4xl font-bold tracking-tight text-slate-900">{formData.drafter}</span>
                    <div className="w-16 h-16 border border-slate-200 rounded-none flex items-center justify-center font-normal text-slate-200 bg-white">인</div>
                </div>
            </div>
        </div>
      </div>
    );
  };

  const renderCommonForm = (type: 'Leave' | 'Trip') => {
    const isLeave = type === 'Leave';
    const isRU = lang === 'ru';
    const today = getKyzylordaNow();
    const formattedDateShort = `${String(today.getFullYear()).slice(-2)}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
    
    return (
      <div className="bg-white p-12 max-w-[1000px] mx-auto text-[#475569] print:p-0 animate-in fade-in duration-700 shadow-2xl rounded-none border border-slate-200 relative overflow-hidden" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
        
        <div className="flex justify-end items-center mb-10 no-print">
          <div className="flex gap-3">
            <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-800 text-white px-8 py-3 rounded-none font-black text-xs hover:bg-blue-900 transition-all shadow-xl uppercase tracking-widest">
              <Printer size={18} /> 인쇄
            </button>
            <button onClick={handleApprove} className="flex items-center gap-2 bg-[#00AFCA] text-white px-8 py-3 rounded-none font-black text-xs hover:bg-[#008ba3] shadow-xl shadow-cyan-100 transition-all uppercase tracking-widest">
              <Save size={18} /> 저장
            </button>
          </div>
        </div>

        {renderApprovalStatusHeader()}

        <div className="text-center mb-10">
          {isRU ? (
            <>
              <h1 className="text-4xl font-bold tracking-[0.4em] border-b-4 border-slate-900 inline-block pb-2 uppercase leading-none text-slate-900">
                {isLeave ? 'ОТПУСК' : 'КОМАНДИРОВКА'}
              </h1>
              <p className="text-slate-400 font-normal uppercase tracking-[0.4em] italic text-[10px] mt-4">
                {isLeave ? '휴가신청서 (OFFICIAL LEAVE REQUEST)' : '출장신청서 (BUSINESS TRIP REQUEST)'}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold tracking-[0.4em] border-b-4 border-slate-900 inline-block pb-2 uppercase leading-none text-slate-900">
                {isLeave ? '휴가신청서' : '출장신청서'}
              </h1>
              <p className="text-slate-400 font-normal uppercase tracking-[0.4em] italic text-[10px] mt-4">
                {isLeave ? 'OFFICIAL LEAVE REQUEST' : 'BUSINESS TRIP REQUEST'}
              </p>
            </>
          )}
        </div>

        <div className="border border-slate-200 rounded-none overflow-hidden grid grid-cols-2 mb-4">
            <div className="flex border-b border-r border-slate-200 h-14">
                <div className={labelStyle}>성 명</div>
                <input className={inputStyle} value={user.name} readOnly />
            </div>
            <div className="flex border-b border-slate-200 h-14">
                <div className={labelStyle}>부 서</div>
                <input className={inputStyle} value={user.department} readOnly />
            </div>
            <div className="flex border-r border-slate-200 h-14">
                <div className={labelStyle}>{isLeave ? '비상연락망' : '출 장 지'}</div>
                <input className={`${inputStyle} text-left px-6`} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder={isLeave ? "010-XXXX-XXXX" : "도시명 또는 업체명"} />
            </div>
            <div className="flex h-14">
                <div className={labelStyle}>{isLeave ? '휴가 구분' : '교통 수단'}</div>
                <input className={inputStyle} value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} placeholder={isLeave ? "연차 / 반차 / 특별" : "항공 / 철도 / 차량"} />
            </div>
        </div>

        <div className="border border-slate-200 rounded-none overflow-hidden mb-8">
            <div className="flex border-b border-slate-200 h-14">
                <div className={labelStyle}>기 간</div>
                <div className="flex-1 flex items-center gap-4 px-6">
                    <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="border-b border-slate-200 px-2 py-1 outline-none font-normal text-[14px] text-[#475569] focus:border-[#00AFCA] transition-all tabular-nums" />
                    <span className="font-bold text-slate-300">~</span>
                    <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="border-b border-slate-200 px-2 py-1 outline-none font-normal text-[14px] text-[#475569] focus:border-[#00AFCA] transition-all tabular-nums" />
                    <div className="ml-auto flex items-center gap-3">
                        <span className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">총</span>
                        <input className="w-12 text-center bg-slate-50 outline-none text-xl tabular-nums border-b border-slate-300 font-bold text-[#00AFCA]" value={formData.totalDays} onChange={e => setFormData({...formData, totalDays: e.target.value})} />
                        <span className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">일간</span>
                    </div>
                </div>
            </div>
            <div className="flex h-32">
                <div className={labelStyle}>{isLeave ? '신청 사유' : '출장 업무'}</div>
                <textarea 
                    className="flex-1 p-4 outline-none resize-none font-normal text-[14px] text-[#475569] leading-relaxed focus:bg-blue-50/10 transition-all"
                    value={formData.reason}
                    onChange={e => setFormData({...formData, reason: e.target.value})}
                    placeholder="상세 내용을 입력하세요..."
                ></textarea>
            </div>
        </div>

        <div className="mt-20 text-center space-y-12">
            <p className="text-[20px] font-normal leading-relaxed text-[#475569] tracking-tight">
              상기 본인은 위와 같은 사유로 {isLeave ? '휴가원' : '출장신청서'}을 제출하오니<br/>
              검토 후 결재하여 주시기 바랍니다.
            </p>
            <p className="text-[11px] font-normal tracking-[0.4em] tabular-nums text-slate-400 pt-8">{formattedDateShort}</p>
        </div>

        <div className="mt-16 border-t border-slate-100 pt-10 flex justify-between items-center px-10">
            <WithYouLogo size={60} />
            <div className="flex items-center gap-12">
                <span className="text-slate-400 text-[12px] font-normal uppercase tracking-widest">신청인 (Applicant)</span>
                <div className="flex items-center gap-6">
                    <span className="text-4xl font-bold tracking-tight text-slate-900">{user.name}</span>
                    <div className="w-16 h-16 border border-slate-200 rounded-none flex items-center justify-center font-normal text-slate-200 bg-white">인</div>
                </div>
            </div>
        </div>
      </div>
    );
  };

  const filteredDocs = useMemo(() => {
    return docs.filter(d => 
      (approvalSubTab === 'All' || d.type === approvalSubTab) &&
      (d.title.toLowerCase().includes(searchTerm.toLowerCase()) || d.requester.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [docs, approvalSubTab, searchTerm]);

  return (
    <div className="space-y-10" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
      {(approvalSubTab === 'Proposal' || approvalSubTab === 'Expense') ? (
          renderStructuredForm(approvalSubTab as 'Proposal' | 'Expense')
      ) : (approvalSubTab === 'Leave' || approvalSubTab === 'Trip') ? (
          renderCommonForm(approvalSubTab as 'Leave' | 'Trip')
      ) : (
          <div className="bg-white overflow-hidden animate-in fade-in duration-500 rounded-none border border-slate-200 shadow-xl">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 h-16 border-b border-slate-200">
                  <th className="p-3 text-center font-bold text-[11px] uppercase w-40 tracking-widest text-slate-400">문서종류</th>
                  <th className="p-3 text-center font-bold text-[11px] uppercase tracking-widest text-slate-400">제목 (Document Title)</th>
                  <th className="p-3 text-center font-bold text-[11px] uppercase w-48 tracking-widest text-slate-400">기안자</th>
                  <th className="p-3 text-center font-bold text-[11px] uppercase w-48 tracking-widest text-slate-400">기안일</th>
                  <th className="p-3 text-center font-bold text-[11px] uppercase w-48 tracking-widest text-slate-400">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map(doc => (
                  <tr key={doc.id} className="hover:bg-sky-50/30 transition-all cursor-pointer group h-16">
                    <td className="p-3 text-center">
                      <span className={`px-4 py-1.5 rounded-none text-[9px] font-bold uppercase tracking-widest ${doc.type === 'Proposal' ? 'bg-blue-600/10 text-blue-600' : doc.type === 'Expense' ? 'bg-purple-600/10 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
                        {doc.type}
                      </span>
                    </td>
                    <td className="p-3 px-10">
                       <div className="flex items-center justify-between">
                         <span className="text-[#475569] text-[15px] font-normal tracking-tight group-hover:text-[#00AFCA] transition-colors">{doc.title}</span>
                         <div className="w-10 h-10 rounded-none bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md border border-slate-100">
                           <ChevronRight size={20} className="text-[#00AFCA]" />
                         </div>
                       </div>
                    </td>
                    <td className="p-3 text-center text-[13px] font-normal text-[#475569]">{doc.requester}</td>
                    <td className="p-3 text-center text-[13px] tabular-nums font-normal text-slate-300">{formatToShortDate(doc.date)}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center">
                        {doc.status === 'Approved' ? (
                          <span className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase bg-emerald-50 px-5 py-1.5 rounded-none border border-emerald-100"><CheckCircle size={16} /> 승인완료</span>
                        ) : (
                          <button onClick={(e) => { e.stopPropagation(); handleApprove(); }} className="px-6 py-1.5 bg-blue-600 text-white font-bold text-[10px] rounded-none hover:bg-blue-700 transition-all uppercase shadow-lg shadow-blue-100">결재대기</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredDocs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-40 text-center text-slate-100 font-bold italic tracking-[0.8em] text-sm uppercase">Database Empty</td>
                  </tr>
                )}
                {Array.from({ length: Math.max(0, 8 - filteredDocs.length) }).map((_, i) => (
                  <tr key={`blank-${i}`} className="h-16">
                    <td colSpan={5} className="border-b border-slate-50"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      )}
    </div>
  );
};

export default Approvals;
