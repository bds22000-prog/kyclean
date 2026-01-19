
import React, { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
import { 
  LayoutDashboard, Truck, Recycle, Users, CreditCard, FileCheck, Settings, Globe, LogOut,
  CalendarDays, Search, Printer, Plus, MapPin, AlertCircle, ShieldAlert, Clock, Play, Square, ChevronRight, LogIn, UserCheck, Power, Key, Files, Menu, X as CloseIcon, Calculator
} from 'lucide-react';
import { translations } from './translations';
import { Language, Employee, Client, ApprovalFormType, UserRole, WasteEntry, RecyclingRecord, WasteType, RecyclingType, RecyclingAction } from './types';

// Components
import Dashboard from './components/Dashboard';
import WasteLogs from './components/WasteLogs';
import Recycling from './components/Recycling';
import HRSection from './components/HRSection';
import Finance from './components/Finance';
import Approvals from './components/Approvals';
import Login from './components/Login';
import AdminSettings from './components/AdminSettings';
import Schedule from './components/Schedule';
import MonthlyReport from './components/MonthlyReport';
import Attendance from './components/Attendance';
import DocumentStorage from './components/DocumentStorage';

// Fix: Define and export LanguageContext and useTranslation hook
export const LanguageContext = createContext<any>(null);

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

// Fix: Updated TabBtn component to match sidebar typography (size 14px, weight 400, Noto Sans KR)
const TabBtn = ({ active, onClick, label }: any) => (
  <button 
    onClick={onClick} 
    className={`px-6 py-2 rounded-[48px] transition-all uppercase tracking-tighter whitespace-nowrap text-[14px] font-[400] ${
      active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'
    }`}
    style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
  >
    {label}
  </button>
);

// Fix: Define MobileNavBtn component
const MobileNavBtn = ({ active, icon: Icon, onClick }: any) => (
  <button 
    onClick={onClick} 
    className={`p-2 rounded-2xl transition-all ${
      active ? 'bg-[#ccff00] text-slate-900 shadow-lg' : 'text-slate-400 hover:bg-slate-100'
    }`}
  >
    <Icon size={24} />
  </button>
);

const initialClients: Client[] = [
  { id: 'c-1', name: '위드유이앤씨 크즐로르다" 유한회사', nameCyrillic: 'TOO "With You E&C Kyzylorda"', defaultFeePerTon: 2200, registrationDate: '2023-01-01', monthlyRecords: {} },
  { id: 'c-2', name: '알렘 쿠루일리스 AQ 유한회사', nameCyrillic: 'TOO "Alem Kurylys AQ"', defaultFeePerTon: 2200, registrationDate: '2023-08-05', monthlyRecords: {} },
  { id: 'c-3', name: '에코오일 그룹 유한회사', nameCyrillic: 'EcoOil Group TOO', defaultFeePerTon: 2500, registrationDate: '2023-05-12', monthlyRecords: {} },
  { id: 'c-4', name: '아부-세르 유한회사', nameCyrillic: 'TOO "Abu-Ser"', defaultFeePerTon: 2200, registrationDate: '2023-10-01', monthlyRecords: {} },
  { id: 'c-5', name: '바이샷 개인사업자', nameCyrillic: 'IP "Bayshat"', defaultFeePerTon: 2200, registrationDate: '2023-11-15', monthlyRecords: {} },
  { id: 'c-6', name: '바르샤-K 유한회사', nameCyrillic: 'TOO "Barsha-K"', defaultFeePerTon: 2200, registrationDate: '2023-12-01', monthlyRecords: {} },
  { id: 'c-7', name: '베키셔세프 개인사업자', nameCyrillic: 'IP "Bekishershef"', defaultFeePerTon: 2200, registrationDate: '2024-01-10', monthlyRecords: {} },
  { id: 'c-8', name: '예르-알리 개인사업자', nameCyrillic: 'IP "Yer-Ali"', defaultFeePerTon: 2200, registrationDate: '2024-02-05', monthlyRecords: {} },
  { id: 'c-9', name: '예르-알리 개인사업자', nameCyrillic: 'IP "Ibrayev"', defaultFeePerTon: 2200, registrationDate: '2024-02-20', monthlyRecords: {} },
  { id: 'c-10', name: '카진프라스트룩투라 개인사업자', nameCyrillic: 'IP "Kazinfrastruktura"', defaultFeePerTon: 2200, registrationDate: '2024-03-01', monthlyRecords: {} },
  { id: 'c-11', name: '잘가스 컴퍼니 및 K 유한회사', nameCyrillic: 'TOO "Zhalgas Company & K"', defaultFeePerTon: 2200, registrationDate: '2024-03-15', monthlyRecords: {} },
  { id: 'c-12', name: '크즐로르다 타잘륵 유한회사', nameCyrillic: 'TOO "Kyzylorda Tazalyk"', defaultFeePerTon: 2200, registrationDate: '2022-10-01', monthlyRecords: {} },
  { id: 'c-13', name: '크즐로르다 시 주택및공공서비스,여객운송및자동차도로국', nameCyrillic: 'Акимат г. Кызылорда ЖКХ', defaultFeePerTon: 2200, registrationDate: '2022-11-20', monthlyRecords: {} },
  { id: 'c-15', name: '사발락- 귀 즐로다 공공단체', nameCyrillic: 'ГКП "Sabalak-Ky-Zlorda"', defaultFeePerTon: 2200, registrationDate: '2024-04-10', monthlyRecords: {} },
  { id: 'c-16', name: '형사집행위원회 제60호 주립기관', nameCyrillic: 'РГУ Учреждение №60 КУИС', defaultFeePerTon: 2200, registrationDate: '2024-05-01', monthlyRecords: {} },
];

export const WithYouLogo = ({ size = 40, white = false }: { size?: number, white?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 20 L42 85" stroke={white ? "white" : "#003876"} strokeWidth="15" strokeLinecap="round" />
    <path d="M58 85 L82 20" stroke={white ? "white" : "#003876"} strokeWidth="15" strokeLinecap="round" />
    <path d="M38 20 L53 50 L68 20" stroke="#8DC63F" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M53 50 L38 85" stroke="#8DC63F" strokeLinecap="round" />
  </svg>
);

const SidebarClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Qyzylorda' })));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="text-center mb-2 px-1">
      <div className="bg-[#002B5B] py-3 rounded-2xl shadow-xl border border-[#ccff00]/20 flex flex-col items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-[#ccff00]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="text-[#ccff00] font-digital text-[16px] font-black tracking-widest drop-shadow-[0_0_10px_#ccff00] z-10">
          {time.toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <div className="text-[#ccff00]/40 font-digital text-[8px] font-bold tracking-[0.4em] uppercase mt-1 z-10">
          Kyzylorda Time
        </div>
      </div>
    </div>
  );
};

const PasswordChangeModal = ({ isOpen, onClose, user, onUpdatePassword, t }: any) => {
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (currentPwd !== user.password) {
      setError(t('wrongPassword'));
      return;
    }
    if (newPwd !== confirmPwd) {
      setError(t('passwordMismatch'));
      return;
    }
    if (newPwd.length < 4) {
      setError('비밀번호는 4자 이상이어야 합니다.');
      return;
    }

    onUpdatePassword(user.id, newPwd);
    alert(t('passwordChanged'));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white p-10 shadow-[0_32px_80px_rgba(0,0,0,0.3)] rounded-[40px] border border-slate-100 animate-in zoom-in-95 duration-300 text-left">
        <div className="flex items-center gap-4 mb-8">
           <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900"><Key size={24} /></div>
           <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{t('changePassword')}</h3>
        </div>
        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-2 animate-pulse"><ShieldAlert size={14} />{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
           <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t('currentPassword')}</label>
              <input type="password" required value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 font-bold rounded-2xl outline-none focus:border-[#00AFCA] transition-all" />
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t('newPassword')}</label>
              <input type="password" required value={newPwd} onChange={e => setNewPwd(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 font-bold rounded-2xl outline-none focus:border-[#00AFCA] transition-all" />
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t('confirmPassword')}</label>
              <input type="password" required value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 font-bold rounded-2xl outline-none focus:border-[#00AFCA] transition-all" />
           </div>
           <div className="pt-6 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-50 text-slate-400 font-black uppercase rounded-2xl hover:bg-slate-100 transition-all text-xs">취소</button>
              <button type="submit" className="flex-2 py-4 bg-blue-900 text-white font-black uppercase rounded-2xl shadow-xl hover:bg-blue-950 transition-all text-xs tracking-widest">변경하기</button>
           </div>
        </form>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ko');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPwdModalOpen, setIsPwdModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [wasteSubTab, setWasteSubTab] = useState<'logs' | 'clients' | 'journal' | 'monthly'>('logs');
  const [recyclingSubTab, setRecyclingSubTab] = useState<'logs' | 'clients' | 'monthly' | 'dailyReport'>('logs');
  const [hrSubTab, setHrSubTab] = useState<'status' | 'resigned' | 'card'>('status');
  const [attendanceSubTab, setAttendanceSubTab] = useState<'register' | 'status'>('register');
  const [financeSubTab, setFinanceSubTab] = useState<'clientCards' | 'receivables' | 'receivablesCard' | 'monthly' | 'payroll'>('clientCards');
  const [scheduleSubTab, setScheduleSubTab] = useState<'daily' | 'monthly' | 'personal' | 'calculator' | 'expenses'>('daily');
  const [settingsSubTab, setSettingsSubTab] = useState<'security'>('security');
  const [approvalSubTab, setApprovalSubTab] = useState<ApprovalFormType | 'All'>('All');
  const [documentSubTab, setDocumentSubTab] = useState<'Official' | 'Contract' | 'Other'>('Official');
  const [triggerAddModal, setTriggerAddModal] = useState<() => void>(() => () => {});
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);

  const initialEmployees: Employee[] = [
    { id: 'admin', empNo: 'WY-0000', name: '관리자', nameCyrillic: 'admin', role: 'Admin', department: 'admin', positionCyrillic: 'admin', gender: 'M', company: 'WY', canInput: true, password: '1234', allowedMenus: ['dashboard', 'waste', 'recycling', 'documents', 'schedule', 'hr', 'attendance', 'finance', 'approval', 'settings'] },
    { id: '0001', empNo: 'WY-0001', name: '황성신', nameCyrillic: 'Хван Сон Шин', role: 'Manager', department: '대표', positionCyrillic: 'образец, тип, пример', gender: 'M', company: 'WY', canInput: true, password: '1234', allowedMenus: ['dashboard', 'waste', 'recycling', 'schedule', 'hr', 'attendance', 'finance', 'approval', 'documents'] },
    { id: '0002', empNo: 'WY-0002', name: '배대식', nameCyrillic: 'Тип распределения', role: 'Manager', department: '부대표', positionCyrillic: 'Заместитель председателя', gender: 'M', company: 'WY', canInput: true, password: '1234', allowedMenus: ['dashboard', 'waste', 'recycling', 'schedule', 'hr', 'attendance', 'finance', 'approval', 'documents'] },
    { id: '0003', empNo: 'WY-0003', name: '유보람', nameCyrillic: 'Ю부рам', role: 'Manager', department: '이사', positionCyrillic: 'переезд', gender: 'F', company: 'WY', canInput: true, password: '1234', allowedMenus: ['dashboard', 'waste', 'recycling', 'schedule', 'hr', 'attendance', 'finance', 'approval', 'documents'] },
    { id: '0004', empNo: 'WY-0004', name: '임정훈', nameCyrillic: 'Л임 Чон Хун', role: 'Manager', department: '한국대표', positionCyrillic: 'образец, тип, пример', gender: 'M', company: 'WY', canInput: true, password: '1234', allowedMenus: ['dashboard', 'waste', 'recycling', 'schedule', 'hr', 'attendance', 'finance', 'approval', 'documents'] },
    { id: '0005', empNo: 'WY-0005', name: '임근배', nameCyrillic: 'Л임 Гын Бэ', role: 'Manager', department: '전무', positionCyrillic: 'Полное отсутствие', gender: 'M', company: 'WY', canInput: true, password: '1234', allowedMenus: ['dashboard', 'waste', 'recycling', 'schedule', 'hr', 'attendance', 'finance', 'approval', 'documents'] },
    { id: '0006', empNo: 'WY-0006', name: '최윤혁', nameCyrillic: 'Чхве Юн Хёк', role: 'Manager', department: '한국대표', positionCyrillic: 'образец, тип, пример', gender: 'M', company: 'WY', canInput: true, password: '1234' },
    { id: '0007', empNo: 'WY-0007', name: '에르란', nameCyrillic: 'Эрлан', role: 'Manager', department: '부사장', positionCyrillic: 'Вице-президент', gender: 'M', company: 'WY', canInput: true, password: '1234' },
    { id: '0008', empNo: 'WY-0008', name: '아스핫', nameCyrillic: 'Асхат', role: 'Manager', department: '본부장', positionCyrillic: 'Начальник', gender: 'M', company: 'WY', canInput: true, password: '1234' },
    { id: '0009', empNo: 'WY-0009', name: '마리나', nameCyrillic: 'Марина', role: 'Staff', department: '공무', positionCyrillic: 'ПТО', gender: 'F', company: 'WY', canInput: true, password: '1234' },
    { id: '0010', empNo: 'WY-0010', name: '쿠알라이', nameCyrillic: 'Куалай', role: 'Staff', department: '공무', positionCyrillic: 'ПТО', gender: 'F', company: 'WY', canInput: true, password: '1234' },
    { id: '0011', empNo: 'WY-0011', name: '누르지깃', nameCyrillic: 'Нуржигит', role: 'Staff', department: '공무', positionCyrillic: 'ПТО', gender: 'M', company: 'SK', canInput: true, password: '1234' },
    { id: '0012', empNo: 'WY-0012', name: '아타잔', nameCyrillic: 'Атажан', role: 'Manager', department: '사장', positionCyrillic: 'Директор', gender: 'M', company: 'SK', canInput: true, password: '1234' },
    { id: '0013', empNo: 'WY-0013', name: '세릭볼', nameCyrillic: 'Серикбол', role: 'Staff', department: '안전', positionCyrillic: 'Тех.디ректор', gender: 'M', company: 'SK', canInput: true, password: '1234' },
    { id: '0014', empNo: 'WY-0014', name: '무흐타르', nameCyrillic: 'Мухтар', role: 'Staff', department: '장비관리자', positionCyrillic: 'Механик', gender: 'M', company: 'WY', canInput: true, password: '1234' },
    { id: '0015', empNo: 'WY-0015', name: '자나르벡', nameCyrillic: 'Жанарбек', role: 'Staff', department: '환경', positionCyrillic: 'Эколог', gender: 'M', company: 'WY', canInput: true, password: '1234' },
    { id: '0016', empNo: 'WY-0016', name: '사맛', nameCyrillic: 'Самат', role: 'Staff', department: '반장', positionCyrillic: 'Мастер участка', gender: 'M', company: 'WY', canInput: true, password: '1234' },
    { id: '0017', empNo: 'WY-0017', name: '누르지깃', nameCyrillic: 'Нуржигит', role: 'Staff', department: '백호기사', positionCyrillic: 'Механизатор', gender: 'M', company: 'WY', canInput: true, password: '1234' },
    { id: '0018', empNo: 'WY-0018', name: '잔볼랏', nameCyrillic: 'Жанболат', role: 'Staff', department: '불도저기사', positionCyrillic: 'Механизатор', gender: 'M', company: 'WY', canInput: true, password: '1234' },
    { id: '0019', empNo: 'WY-0019', name: '르스벡', nameCyrillic: 'Рыс벡', role: 'Staff', department: '작업자', positionCyrillic: 'Мастер участка', gender: 'M', company: 'WY', canInput: true, password: '1234' },
    { id: '0020', empNo: 'WY-0020', name: '가피즈', nameCyrillic: 'Гафиз', role: 'Staff', department: '경비팀장', positionCyrillic: 'Охрана', gender: 'M', company: 'WY', canInput: true, password: '1234' },
    { id: '0021', empNo: 'WY-0021', name: '바투', nameCyrillic: 'Бату', role: 'Staff', department: '경비', positionCyrillic: 'Охрана', gender: 'M', company: 'WY', canInput: true, password: '1234' },
    { id: '0022', empNo: 'WY-0022', name: '바글란', nameCyrillic: 'Баглан', role: 'Staff', department: '경비', positionCyrillic: 'Охрана', gender: 'M', company: 'WY', canInput: true, password: '1234' },
    { id: '0023', empNo: 'WY-0023', name: '아브잘', nameCyrillic: 'Абзал', role: 'Staff', department: '경비', positionCyrillic: 'Охрана', gender: 'M', company: 'WY', canInput: true, password: '1234' },
    { id: '0024', empNo: 'WY-0024', name: '아이잔', nameCyrillic: 'Айжан', role: 'Staff', department: '회계', positionCyrillic: 'Бухгалтер', gender: 'F', company: 'WY', canInput: true, password: '1234' },
    { id: '0025', empNo: 'WY-0025', name: '아이짜다', nameCyrillic: 'Айзада', role: 'Staff', department: '매니저', positionCyrillic: 'Менеджер', gender: 'F', company: 'WY', canInput: true, password: '1234' },
    { id: '0026', empNo: 'WY-0026', name: '랴일랴', nameCyrillic: 'Ляйля', role: 'Staff', department: '요리사', positionCyrillic: 'Повар', gender: 'F', company: 'WY', canInput: true, password: '1234' },
  ];

  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [currentUser, setCurrentUser] = useState<Employee>(employees[0]);

  // Unified Data State for Waste and Recycling
  const [wasteEntries, setWasteEntries] = useState<WasteEntry[]>([
    { id: '1', vehicleNumber: 'KZ 001 ABC', clientName: '위드유이앤씨 크즐로르다" 유한회사', clientNameCyrillic: 'TOO "With You E&C Kyzylorda"', type: WasteType.General, weight: 12.5, entryDate: new Date().toISOString().split('T')[0], cost: 27500 },
    { id: '2', vehicleNumber: 'KZ 777 ZZZ', clientName: '에코오일 그룹 유한회사', clientNameCyrillic: 'EcoOil Group TOO', type: WasteType.Construction, weight: 24.0, entryDate: new Date().toISOString().split('T')[0], cost: 60000 },
    { id: '3', vehicleNumber: 'KZ 123 KYZ', clientName: '크즐오르다 시 주택및공공서비스,여객운송및자동차도로국', clientNameCyrillic: 'Акимат города Кызылорда', type: WasteType.General, weight: 8.2, entryDate: new Date().toISOString().split('T')[0], cost: 18000 },
    { id: '4', vehicleNumber: 'KZ 444 ABZ', clientName: '알렘 쿠루일리스 AQ 유한회사', clientNameCyrillic: 'TOO "Alem Kurylys AQ"', type: WasteType.General, weight: 15.5, entryDate: new Date().toISOString().split('T')[0], cost: 34100 },
  ]);

  const [recyclingRecords, setRecyclingRecords] = useState<RecyclingRecord[]>([
    { id: '1', vendorName: '위드유이앤씨', vendorNameCyrillic: 'TOO "With You"', type: RecyclingType.Paper, action: RecyclingAction.Sorting, count: 500, weight: 1.2, date: new Date().toISOString().split('T')[0], amount: 150000, sortingPersonnel: 5 },
    { id: '2', vendorName: '에코오일 그룹', vendorNameCyrillic: 'EcoOil Group', type: RecyclingType.Plastic, action: RecyclingAction.Outbound, count: 200, weight: 0.8, date: new Date().toISOString().split('T')[0], amount: 450000, sortingPersonnel: 0 },
  ]);

  const t = useCallback((key: string) => {
    return translations[lang][key] || translations['ko'][key] || key;
  }, [lang]);
  
  const menuItems = useMemo(() => [
    { id: 'dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
    { id: 'waste', icon: Truck, labelKey: 'wasteManagement' },
    { id: 'recycling', icon: Recycle, labelKey: 'recycling' },
    { id: 'documents', icon: Files, labelKey: 'documents' },
    { id: 'schedule', icon: CalendarDays, labelKey: 'schedule' },
    { id: 'hr', icon: Users, labelKey: 'hr' },
    { id: 'attendance', icon: MapPin, labelKey: 'attendance' },
    { id: 'finance', icon: CreditCard, labelKey: 'finance' },
    { id: 'approval', icon: FileCheck, labelKey: 'approval' },
    { id: 'settings', icon: Settings, labelKey: 'settings' }, // 'settings' at the bottom
  ].filter(item => (currentUser.allowedMenus || []).includes(item.id)), [currentUser]);

  const handleLogin = (user: Employee) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setActiveTab('dashboard');
  };

  const handleUpdatePassword = (empId: string, newPwd: string) => {
    setEmployees(prev => {
        const next = prev.map(emp => emp.id === empId ? { ...emp, password: newPwd } : emp);
        const updatedCurrent = next.find(emp => emp.id === empId);
        if (updatedCurrent) setCurrentUser(updatedCurrent);
        return next;
    });
  };

  const LanguageContextValue = useMemo(() => ({ 
    lang, setLang, t, user: currentUser, employees, setEmployees, clients, setClients, 
    wasteSubTab, setWasteSubTab, recyclingSubTab, setRecyclingSubTab, hrSubTab, setHrSubTab, 
    attendanceSubTab, setAttendanceSubTab, financeSubTab, setFinanceSubTab, scheduleSubTab, 
    setScheduleSubTab, approvalSubTab, setApprovalSubTab, documentSubTab, setDocumentSubTab, 
    settingsSubTab, setSettingsSubTab,
    searchTerm, setSearchTerm, triggerAddModal, setTriggerAddModal, selectedEmpId, setSelectedEmpId,
    wasteEntries, setWasteEntries, recyclingRecords, setRecyclingRecords
  }), [lang, currentUser, employees, clients, wasteSubTab, recyclingSubTab, hrSubTab, attendanceSubTab, financeSubTab, scheduleSubTab, approvalSubTab, documentSubTab, settingsSubTab, searchTerm, triggerAddModal, selectedEmpId, wasteEntries, recyclingRecords]);

  if (!isAuthenticated) {
    return (
      <LanguageContext.Provider value={LanguageContextValue}>
        <Login onLogin={handleLogin} lang={lang} setLang={setLang} t={t} employees={employees} />
      </LanguageContext.Provider>
    );
  }

  const switchTab = (id: string) => {
    setActiveTab(id);
    setIsSidebarOpen(false);
  };

  const EXCLUDED_PRINT_TABS = ['approval', 'finance', 'waste', 'recycling', 'documents'];

  return (
    <LanguageContext.Provider value={LanguageContextValue}>
      <div className="flex min-h-screen bg-[#eef6ff] text-[#475569] overflow-hidden font-sans relative">
        
        {/* Sidebar Overlay (Mobile) */}
        {isSidebarOpen && (
          <div className="lg:hidden fixed inset-0 bg-blue-900/60 backdrop-blur-sm z-[60]" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        <aside className={`fixed inset-y-0 left-0 z-[70] w-64 bg-white border-r border-slate-200 shadow-2xl no-print lg:relative lg:translate-x-0 lg:shadow-sm flex flex-col transition-transform duration-500 ease-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="lg:hidden absolute top-4 right-4">
             <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-all"><CloseIcon size={24}/></button>
          </div>

          <div className="py-8 px-4 border-b border-slate-100 flex flex-col items-center text-center gap-3">
            <WithYouLogo size={75} />
            <div className="space-y-1">
              <h1 className="font-black text-[15px] tracking-tight text-slate-900 uppercase">WITH YOU</h1>
              <div className="flex flex-col items-center mt-1">
                <span className="text-[10px] bg-[#FEC110] text-black px-3 py-0.5 rounded-full font-black uppercase mb-1">
                    {currentUser.role}
                </span>
                <p className="text-[12px] text-slate-500 font-bold uppercase tracking-tight">{currentUser.name}</p>
                <p className="text-[9px] text-slate-300 font-black uppercase tabular-nums">{currentUser.empNo}</p>
              </div>
            </div>
          </div>

          <div className="p-3 border-b border-slate-100 bg-slate-50/50">
            <SidebarClock />
          </div>

          <nav className="p-2 space-y-1 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {menuItems.map((item) => (
              <button 
                key={item.id} 
                onClick={() => switchTab(item.id)} 
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                  activeTab === item.id 
                    ? 'bg-[#ccff00] text-slate-900 shadow-lg shadow-[#ccff00]/40' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <item.icon size={22} className={`shrink-0 ${activeTab === item.id ? 'text-slate-900' : 'text-slate-400'}`} />
                <span 
                  className="font-[400] text-[14px] uppercase tracking-tighter leading-none whitespace-nowrap text-[#475569]"
                  style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
                >
                  {t(item.labelKey)}
                </span>
              </button>
            ))}
          </nav>
          
          <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/30">
            <div className="grid grid-cols-2 gap-2 mb-2">
                <button onClick={() => { switchTab('attendance'); setAttendanceSubTab('register'); }} className="flex flex-col items-center justify-center gap-1 p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all active:scale-95 group"><LogIn size={18} className="group-hover:scale-110 transition-transform" /><span className="text-[10px] font-black uppercase">출근</span></button>
                <button onClick={() => { switchTab('attendance'); setAttendanceSubTab('register'); }} className="flex flex-col items-center justify-center gap-1 p-3 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all active:scale-95 group"><LogOut size={18} className="group-hover:scale-110 transition-transform" /><span className="text-[10px] font-black uppercase">퇴근</span></button>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/50">
              <button onClick={() => setIsPwdModalOpen(true)} className="flex items-center justify-center gap-2 p-3 text-slate-400 hover:text-slate-900 transition-all border border-slate-200 rounded-2xl group bg-white shadow-sm"><Key size={16} className="group-hover:rotate-45 transition-transform" /><span className="text-[9px] font-black uppercase whitespace-nowrap">PWD</span></button>
              <button onClick={() => setIsAuthenticated(false)} className="flex items-center justify-center gap-2 p-3 text-slate-400 hover:text-red-500 transition-all border border-slate-200 rounded-2xl group bg-white shadow-sm"><Power size={16} /><span className="text-[9px] font-black uppercase whitespace-nowrap">OFF</span></button>
            </div>
          </div>
        </aside>
        
        <main className={`flex-1 overflow-y-auto relative bg-[#eef6ff] transition-all duration-300`}>
          {activeTab !== 'dashboard' && (
            <header className="sticky top-0 z-50 bg-blue-600 border-b border-blue-700 px-4 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between no-print shadow-xl">
              <div className="flex items-center gap-4 flex-1 w-full overflow-x-auto no-scrollbar py-1">
                 <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-white/80 hover:bg-white/10 rounded-xl transition-all mr-2">
                    <Menu size={24} />
                 </button>
                 <div className="flex p-1.5 rounded-[48px] bg-[#f1f5f9] backdrop-blur-md border border-white/20 min-w-max flex-nowrap">
                   {activeTab === 'waste' && (
                     <>
                       <TabBtn active={wasteSubTab === 'logs'} onClick={() => setWasteSubTab('logs')} label={t('logs')} />
                       <TabBtn active={wasteSubTab === 'monthly'} onClick={() => setWasteSubTab('monthly')} label={t('monthlyWaste')} />
                       <TabBtn active={wasteSubTab === 'journal'} onClick={() => setWasteSubTab('journal')} label={t('journal')} />
                       <TabBtn active={wasteSubTab === 'clients'} onClick={() => setWasteSubTab('clients')} label={t('clients')} />
                     </>
                   )}
                   {activeTab === 'recycling' && (
                     <>
                       <TabBtn active={recyclingSubTab === 'logs'} onClick={() => setRecyclingSubTab('logs')} label={t('logs')} />
                       <TabBtn active={recyclingSubTab === 'monthly'} onClick={() => setRecyclingSubTab('monthly')} label={t('monthlyRecycling')} />
                       <TabBtn active={recyclingSubTab === 'clients'} onClick={() => setRecyclingSubTab('clients')} label={t('clients')} />
                       <TabBtn active={recyclingSubTab === 'dailyReport'} onClick={() => setRecyclingSubTab('dailyReport')} label="작업일보" />
                     </>
                   )}
                   {activeTab === 'documents' && (
                     <>
                        <TabBtn active={documentSubTab === 'Official'} onClick={() => setDocumentSubTab('Official')} label={t('officialDocs')} />
                        <TabBtn active={documentSubTab === 'Contract'} onClick={() => setDocumentSubTab('Contract')} label={t('contracts')} />
                        <TabBtn active={documentSubTab === 'Other'} onClick={() => setDocumentSubTab('Other')} label={t('others')} />
                     </>
                   )}
                   {activeTab === 'attendance' && (
                     <>
                       <TabBtn active={attendanceSubTab === 'register'} onClick={() => setAttendanceSubTab('register')} label={t('register')} />
                       <TabBtn active={attendanceSubTab === 'status'} onClick={() => setAttendanceSubTab('status')} label={t('attendance_status')} />
                     </>
                   )}
                   {activeTab === 'hr' && (
                     <>
                       <TabBtn active={hrSubTab === 'status'} onClick={() => setHrSubTab('status')} label={t('status_tab')} />
                       <TabBtn active={hrSubTab === 'resigned'} onClick={() => setHrSubTab('resigned')} label={t('resigned')} />
                       <TabBtn active={hrSubTab === 'card'} onClick={() => setHrSubTab('card')} label={t('card')} />
                     </>
                   )}
                   {activeTab === 'finance' && (
                     <>
                       <TabBtn active={financeSubTab === 'clientCards'} onClick={() => setFinanceSubTab('clientCards')} label={t('clientCards')} />
                       <TabBtn active={financeSubTab === 'receivables'} onClick={() => setFinanceSubTab('receivables')} label={t('receivablesStatus')} />
                       <TabBtn active={financeSubTab === 'receivablesCard'} onClick={() => setFinanceSubTab('receivablesCard')} label={t('receivablesCard')} />
                       <TabBtn active={financeSubTab === 'monthly'} onClick={() => setFinanceSubTab('monthly')} label={t('monthly')} />
                       <TabBtn active={financeSubTab === 'payroll'} onClick={() => setFinanceSubTab('payroll')} label="급여현황" />
                     </>
                   )}
                   {activeTab === 'schedule' && (
                     <>
                       <TabBtn active={scheduleSubTab === 'daily'} onClick={() => setScheduleSubTab('daily')} label={t('daily')} />
                       <TabBtn active={scheduleSubTab === 'monthly'} onClick={() => setScheduleSubTab('monthly')} label="달 력" />
                       <TabBtn active={scheduleSubTab === 'personal'} onClick={() => setScheduleSubTab('personal')} label="개인달력" />
                       <TabBtn active={scheduleSubTab === 'expenses'} onClick={() => setScheduleSubTab('expenses')} label="지출내역" />
                       <TabBtn active={scheduleSubTab === 'calculator'} onClick={() => setScheduleSubTab('calculator')} label="계산기 / 메모" />
                     </>
                   )}
                   {activeTab === 'approval' && (
                     <>
                       <TabBtn active={approvalSubTab === 'All'} onClick={() => setApprovalSubTab('All')} label={t('allList')} />
                       <TabBtn active={approvalSubTab === 'Proposal'} onClick={() => setApprovalSubTab('Proposal')} label={t('Proposal')} />
                       <TabBtn active={approvalSubTab === 'Expense'} onClick={() => setApprovalSubTab('Expense')} label={t('Expense')} />
                       <TabBtn active={approvalSubTab === 'Leave'} onClick={() => setApprovalSubTab('Leave')} label={t('Leave')} />
                       <TabBtn active={approvalSubTab === 'Trip'} onClick={() => setApprovalSubTab('Trip')} label={t('Trip')} />
                     </>
                   )}
                   {activeTab === 'settings' && (
                     <>
                       <TabBtn active={settingsSubTab === 'security'} onClick={() => setSettingsSubTab('security')} label="시스템 보안 관리" />
                     </>
                   )}
                 </div>
              </div>

              <div className="flex items-center gap-4 justify-end w-full md:w-auto">
                <div className="flex items-center gap-3">
                   {/* Universal Print Button - Hidden for specified tabs as requested */}
                   {!EXCLUDED_PRINT_TABS.includes(activeTab) && (
                     <button 
                       onClick={() => window.print()} 
                       className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center gap-2 transition-all border border-white/20 group"
                     >
                       <Printer size={16} className="group-hover:scale-110 transition-transform" />
                       <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">인쇄</span>
                     </button>
                   )}
                   
                   <div className="relative w-full md:w-48">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={14} />
                     <input type="text" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-[11px] font-bold outline-none focus:bg-white/20 transition-all text-white placeholder:text-white/30 tabular-nums" placeholder="SEARCH..." />
                   </div>
                </div>
              </div>
            </header>
          )}

          <div className={`${activeTab === 'dashboard' ? 'p-0' : 'p-4 lg:p-10'} animate-in fade-in duration-500 pb-24 lg:pb-10`}>
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'waste' && <WasteLogs />}
            {activeTab === 'recycling' && <Recycling />}
            {activeTab === 'documents' && <DocumentStorage />}
            {activeTab === 'schedule' && <Schedule />}
            {activeTab === 'hr' && <HRSection />}
            {activeTab === 'attendance' && <Attendance />}
            {activeTab === 'finance' && <Finance />}
            {activeTab === 'approval' && <Approvals />}
            {activeTab === 'settings' && <AdminSettings />}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 px-6 py-3 z-[100] flex justify-between items-center no-print shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
           <MobileNavBtn active={activeTab === 'dashboard'} icon={LayoutDashboard} onClick={() => switchTab('dashboard')} />
           <MobileNavBtn active={activeTab === 'waste'} icon={Truck} onClick={() => switchTab('waste')} />
           <MobileNavBtn active={activeTab === 'recycling'} icon={Recycle} onClick={() => switchTab('recycling')} />
           <MobileNavBtn active={activeTab === 'approval'} icon={FileCheck} onClick={() => switchTab('approval')} />
           <MobileNavBtn active={activeTab === 'attendance'} icon={MapPin} onClick={() => switchTab('attendance')} />
        </nav>
      </div>

      <PasswordChangeModal isOpen={isPwdModalOpen} onClose={() => setIsPwdModalOpen(false)} user={currentUser} onUpdatePassword={handleUpdatePassword} t={t} />
    </LanguageContext.Provider>
  );
};

export default App;
