
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation, WithYouLogo } from '../App';
import { FileText, Plus, Download, Trash2, Printer, Search, Save, Paperclip, ChevronLeft, ChevronRight, File, Archive, ExternalLink, HardDrive, X, Eye, Maximize2, AlertCircle, UploadCloud } from 'lucide-react';
import { DocumentRecord, DocumentType } from '../types';

const DocumentStorage: React.FC = () => {
  const { documentSubTab, setDocumentSubTab, searchTerm, user, t, lang, setTriggerAddModal } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<DocumentRecord[]>([
    { id: 'doc-1', title: '2026년 매립지 운영 계약서', type: 'Contract', date: '2026-01-01', uploader: '황성신', fileName: 'contract_2026.pdf', fileSize: '2.4 MB', remarks: '본사 승인 완료본' },
    { id: 'doc-2', title: '키질로르다 주정부 환경부 공문', type: 'Official', date: '2026-01-05', uploader: '유보람', fileName: 'official_env_0105.pdf', fileSize: '1.2 MB', remarks: '환경 검사 일정 협조 건' },
    { id: 'doc-3', title: '장비 유지보수 업체 리스트', type: 'Other', date: '2026-01-10', uploader: '임근배', fileName: 'equipment_vendors.xlsx', fileSize: '450 KB', remarks: '26년도 신규 업체 포함' },
  ]);

  const [formData, setFormData] = useState<Partial<DocumentRecord>>({
    title: '',
    type: 'Official',
    remarks: '',
  });
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  useEffect(() => {
    setTriggerAddModal(() => () => {
      setFormData({ title: '', type: documentSubTab, remarks: '' });
      setAttachedFile(null);
      setIsModalOpen(true);
    });
  }, [setTriggerAddModal, documentSubTab]);

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => 
      doc.type === documentSubTab &&
      (doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       doc.uploader.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [documents, documentSubTab, searchTerm]);

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const newDoc: DocumentRecord = {
      id: `doc-${Date.now()}`,
      title: formData.title,
      type: formData.type as DocumentType,
      date: new Date().toISOString().split('T')[0],
      uploader: user.name,
      fileName: attachedFile?.name || 'No File',
      fileSize: attachedFile ? `${(attachedFile.size / (1024 * 1024)).toFixed(1)} MB` : '-',
      remarks: formData.remarks
    };

    setDocuments(prev => [newDoc, ...prev]);
    setIsModalOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const deleteDocument = (id: string) => {
    if (confirm('이 문서를 영구적으로 삭제하시겠습니까?')) {
      setDocuments(prev => prev.filter(d => d.id !== id));
    }
  };

  const openPreview = (doc: DocumentRecord) => {
    setSelectedDoc(doc);
    setIsPreviewOpen(true);
  };

  // Excel Style Constants
  const excelThStyle = "border border-slate-300 bg-slate-100 p-2 text-center font-bold text-[11px] text-slate-600 uppercase tracking-tighter whitespace-nowrap";
  const excelTdStyle = "border border-slate-300 p-0 text-[13px] h-12 tabular-nums group";

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 no-print">
         <div className="bg-white border border-slate-200 p-6 rounded-[32px] flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-[#ccff00] shadow-xl"><Archive size={24}/></div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">전체 보관 문서</p>
               <h4 className="text-2xl font-black text-slate-900 tabular-nums">{documents.length} <span className="text-xs text-slate-300">Files</span></h4>
            </div>
         </div>
         <div className="bg-white border border-slate-200 p-6 rounded-[32px] flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-xl shadow-blue-100"><FileText size={24}/></div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">당월 신규 등록</p>
               <h4 className="text-2xl font-black text-blue-600 tabular-nums">{documents.filter(d => d.date.startsWith('2026-01')).length} <span className="text-xs text-slate-300">Files</span></h4>
            </div>
         </div>
         <div className="bg-white border border-slate-200 p-6 rounded-[32px] flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-100"><HardDrive size={24}/></div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">스토리지 사용량</p>
               <h4 className="text-2xl font-black text-emerald-600 tabular-nums">4.2 <span className="text-xs text-slate-300">GB</span></h4>
            </div>
         </div>
         <button 
           onClick={() => setIsModalOpen(true)}
           className="bg-sky-100 text-sky-600 border border-sky-200 rounded-[32px] font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-sky-200 hover:text-sky-700 transition-all shadow-lg active:scale-95 group"
         >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" /> 신규 문서 등록
         </button>
      </div>

      {/* Main Excel Grid */}
      <div className="bg-white border border-slate-300 shadow-2xl overflow-hidden rounded-sm">
        <div className="bg-slate-100 border-b border-slate-300 p-4 flex justify-between items-center">
           <div className="flex items-center gap-3">
             <WithYouLogo size={30} />
             <div>
               <h2 className="text-[14px] font-black uppercase tracking-tight text-slate-900">Enterprise Cloud Document Storage (IMS-DOC v1.0)</h2>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Classification: {documentSubTab}</p>
             </div>
           </div>
           <div className="flex gap-2">
             <button onClick={() => window.print()} className="p-2 bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-slate-900 transition-all"><Printer size={16}/></button>
             <button className="p-2 bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-slate-900 transition-all"><Save size={16}/></button>
           </div>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 h-10 border-b border-slate-400">
              <th className={excelThStyle} style={{ width: '60px' }}>Row</th>
              <th className={`${excelThStyle} text-left px-6`}>문서 제목 (Document Title)</th>
              <th className={`${excelThStyle} text-center`} style={{ width: '120px' }}>등록일</th>
              <th className={`${excelThStyle} text-center`} style={{ width: '120px' }}>작성자</th>
              <th className={`${excelThStyle} text-left px-6`} style={{ width: '250px' }}>첨부 파일 정보</th>
              <th className={`${excelThStyle} text-center`} style={{ width: '80px' }}>Preview</th>
              <th className={`${excelThStyle} text-center`} style={{ width: '80px' }}>Download</th>
              <th className={`${excelThStyle} text-center`} style={{ width: '100px' }}>Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredDocs.map((doc, idx) => (
              <tr key={doc.id} className="h-12 hover:bg-blue-50/50 transition-colors">
                <td className="text-center text-[12px] font-mono text-slate-400 bg-slate-50/50 border-r border-slate-300 tabular-nums">{idx + 1}</td>
                <td className="px-6 border-r border-slate-300">
                   <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${doc.type === 'Contract' ? 'bg-amber-400' : doc.type === 'Official' ? 'bg-blue-500' : 'bg-slate-400'}`}></span>
                      <span className="text-[14px] font-bold text-slate-900">{doc.title}</span>
                   </div>
                </td>
                <td className="text-center font-mono text-[12px] text-slate-400 border-r border-slate-300 tabular-nums">{doc.date}</td>
                <td className="text-center font-bold text-slate-600 border-r border-slate-300">{doc.uploader}</td>
                <td className="px-6 border-r border-slate-300">
                   {doc.fileName && doc.fileName !== 'No File' ? (
                      <div className="flex items-center gap-2">
                         <Paperclip size={14} className="text-[#00AFCA]" />
                         <button 
                           onClick={() => openPreview(doc)}
                           className="text-blue-600 hover:underline truncate max-w-[150px] transition-all text-[11px] font-black"
                         >
                           {doc.fileName}
                         </button>
                         <span className="text-[10px] text-slate-400 tabular-nums">({doc.fileSize})</span>
                      </div>
                   ) : <span className="text-slate-300 italic text-xs">No attachments</span>}
                </td>
                <td className="text-center border-r border-slate-300">
                   <button 
                     onClick={() => openPreview(doc)}
                     className="p-2 text-slate-300 hover:text-emerald-500 transition-all"
                   >
                     <Eye size={18}/>
                   </button>
                </td>
                <td className="text-center border-r border-slate-300">
                   <button className="p-2 text-slate-300 hover:text-[#00AFCA] transition-all"><Download size={18}/></button>
                </td>
                <td className="text-center">
                   <div className="flex justify-center gap-2">
                      <button className="p-2 text-slate-300 hover:text-slate-900 transition-all"><ExternalLink size={16}/></button>
                      <button onClick={() => deleteDocument(doc.id)} className="p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-xl bg-white p-12 shadow-[0_32px_80px_rgba(0,0,0,0.3)] rounded-[56px] border border-slate-100 animate-in zoom-in-95 duration-300 text-left" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
            <div className="flex items-center gap-4 mb-8">
               <div className="w-14 h-14 bg-[#ccff00] rounded-[20px] flex items-center justify-center text-slate-900 shadow-xl"><Plus size={28}/></div>
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">신규 문서 업로드</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload into: {documentSubTab}</p>
               </div>
            </div>

            <form onSubmit={handleAddDocument} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">문서 분류</label>
                <div className="grid grid-cols-3 gap-2">
                   {(['Official', 'Contract', 'Other'] as DocumentType[]).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({...formData, type})}
                        className={`py-3 rounded-2xl font-black text-[11px] uppercase transition-all border-2 ${
                          formData.type === type ? 'bg-[#ccff00] text-slate-900 border-[#ccff00] shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                        }`}
                      >
                        {type === 'Official' ? '공문' : type === 'Contract' ? '계약서' : '기타'}
                      </button>
                   ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">문서 제목</label>
                <input 
                  required 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  className="w-full px-8 py-4 bg-slate-50 border border-slate-100 font-bold rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-[15px]" 
                  placeholder="문서의 공식 명칭을 입력하세요" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">파일 첨부</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-[32px] p-8 flex flex-col items-center justify-center gap-3 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-500 transition-all cursor-pointer group"
                >
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-blue-500 shadow-sm transition-colors">
                      <Paperclip size={24} />
                   </div>
                   {attachedFile ? (
                      <div className="text-center">
                        <p className="text-[13px] font-black text-slate-900 leading-none">{attachedFile.name}</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tabular-nums">{(attachedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                   ) : (
                      <div className="text-center">
                        <p className="text-[12px] font-black text-slate-500 uppercase tracking-widest">Click to select files</p>
                        <p className="text-[9px] text-slate-300 mt-1 uppercase font-bold">PDF, XLSX, DOCX (Max 50MB)</p>
                      </div>
                   )}
                   <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-slate-100 text-slate-400 font-black uppercase rounded-2xl hover:bg-slate-200 transition-all text-xs tracking-widest">CANCEL</button>
                <button type="submit" className="flex-1 py-5 bg-blue-600 text-white font-black uppercase rounded-2xl shadow-2xl hover:bg-blue-700 transition-all text-xs tracking-widest">SECURE UPLOAD</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewOpen && selectedDoc && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 lg:p-10">
           <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-lg" onClick={() => setIsPreviewOpen(false)}></div>
           
           <div className="relative w-full h-full max-w-7xl bg-white rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
              {/* Preview Header */}
              <div className="h-20 bg-slate-50 border-b border-slate-200 px-8 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                       <FileText size={20} />
                    </div>
                    <div>
                       <h3 className="text-[16px] font-black text-slate-900 leading-none">{selectedDoc.title}</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Classification: {selectedDoc.type} • File: {selectedDoc.fileName}</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-3">
                    <button className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-slate-900 transition-all shadow-sm"><Printer size={18}/></button>
                    <button className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-slate-900 transition-all shadow-sm"><Download size={18}/></button>
                    <div className="w-px h-8 bg-slate-200 mx-2"></div>
                    <button 
                      onClick={() => setIsPreviewOpen(false)}
                      className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-black transition-all shadow-lg"
                    >
                       <X size={20} />
                    </button>
                 </div>
              </div>

              {/* Preview Content Area */}
              <div className="flex-1 flex overflow-hidden">
                 <div className="flex-1 bg-slate-100 p-8 lg:p-12 overflow-y-auto flex flex-col items-center">
                    <div className="w-full max-w-4xl bg-white shadow-xl min-h-[1200px] p-20 flex flex-col items-center">
                       {selectedDoc.fileName?.endsWith('.pdf') ? (
                          <div className="w-full space-y-12">
                             <div className="flex justify-between border-b-2 border-slate-200 pb-8">
                                <WithYouLogo size={60} />
                                <div className="text-right">
                                   <p className="text-xl font-black uppercase">Official Document</p>
                                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest tabular-nums">Document ID: {selectedDoc.id}</p>
                                </div>
                             </div>
                             
                             <div className="py-20 text-center space-y-8">
                                <h1 className="text-4xl font-black tracking-tight text-slate-900">{selectedDoc.title}</h1>
                                <div className="h-1 w-20 bg-slate-900 mx-auto"></div>
                                <p className="text-slate-500 font-medium leading-relaxed text-lg max-w-2xl mx-auto italic">
                                   "{selectedDoc.remarks || '본 문서는 크즐로르다 매립장 통합 관리 시스템(IMS)에 의해 안전하게 보관 및 보호되고 있는 공식 문서입니다.'}"
                                </p>
                             </div>

                             <div className="grid grid-cols-2 gap-12 mt-20">
                                <div className="p-10 border-2 border-slate-50 rounded-3xl space-y-4">
                                   <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest">Metadata</h4>
                                   <div className="space-y-2">
                                      <p className="text-sm font-bold flex justify-between"><span>작성자:</span> <span className="text-slate-900">{selectedDoc.uploader}</span></p>
                                      <p className="text-sm font-bold flex justify-between"><span>등록일:</span> <span className="text-slate-900 tabular-nums">{selectedDoc.date}</span></p>
                                      <p className="text-sm font-bold flex justify-between"><span>분류:</span> <span className="text-slate-900">{selectedDoc.type}</span></p>
                                   </div>
                                </div>
                                <div className="p-10 border-2 border-slate-50 rounded-3xl flex flex-col items-center justify-center gap-4">
                                   <div className="w-16 h-16 border-4 border-[#00AFCA] rounded-full flex items-center justify-center font-black text-[#00AFCA] text-xl tabular-nums">IMS</div>
                                   <p className="text-[10px] font-black text-slate-300 uppercase">Secure Seal Verified</p>
                                </div>
                             </div>
                          </div>
                       ) : (
                          <div className="flex flex-col items-center justify-center h-[800px] text-center gap-6">
                             <div className="w-24 h-24 bg-blue-50 text-[#00AFCA] rounded-full flex items-center justify-center shadow-inner">
                                <Archive size={48} />
                             </div>
                             <div>
                                <h4 className="text-2xl font-black text-slate-900">브라우저 내 뷰어 지원 제한</h4>
                                <p className="text-slate-400 font-bold mt-2">{selectedDoc.fileName} 파일은 전용 뷰어에서 확인 가능합니다.</p>
                             </div>
                             <div className="flex gap-4 mt-4">
                                <button className="px-8 py-4 bg-slate-900 text-white font-black uppercase rounded-2xl shadow-xl hover:bg-black transition-all flex items-center gap-3">
                                   <Download size={20} /> 원본 파일 다운로드
                                </button>
                                <button className="px-8 py-4 bg-white border border-slate-200 text-slate-400 font-black uppercase rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-3">
                                   <ExternalLink size={20} /> 외부 앱에서 열기
                                </button>
                             </div>
                             <div className="mt-12 p-6 bg-amber-50 border border-amber-100 rounded-[32px] flex items-center gap-4 max-w-md text-left">
                                <AlertCircle size={24} className="text-amber-500 shrink-0" />
                                <p className="text-[11px] font-bold text-amber-900 leading-relaxed">
                                   Excel(XLSX) 또는 오피스 문서는 데이터 보안 정책에 따라 온라인 프리뷰를 제공하지 않을 수 있습니다.
                                </p>
                             </div>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default DocumentStorage;
