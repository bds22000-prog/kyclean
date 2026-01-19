
export type Language = 'ko' | 'kz' | 'ru';
export type UserRole = 'Admin' | 'Manager' | 'Staff';

export enum WasteType {
  General = 'General',
  Construction = 'Construction',
  Medical = 'Medical'
}

export enum RecyclingType {
  Paper = 'Paper',
  Glass = 'Glass',
  Can = 'Can',
  Plastic = 'Plastic',
  Medical = 'Medical',
  Other = 'Other'
}

export enum RecyclingAction {
  Sorting = 'Sorting',
  Outbound = 'Outbound'
}

export enum DebtManagementStatus {
  Normal = 'Normal',
  Collection = 'Collection',
  Legal = 'Legal',
  Other = 'Other'
}

export type DocumentType = 'Official' | 'Contract' | 'Other';

export interface DocumentRecord {
  id: string;
  title: string;
  type: DocumentType;
  date: string;
  uploader: string;
  fileName?: string;
  fileSize?: string;
  remarks?: string;
}

export interface Client {
  id: string;
  name: string; // Korean Name
  nameCyrillic?: string; // Russian/Kazakh Name
  phone?: string; // Contact Number
  defaultFeePerTon: number;
  registrationDate?: string;
  totalBilled?: number;
  totalPaid?: number;
  managementStatus?: DebtManagementStatus;
  lastFollowUp?: string;
  followUpNote?: string;
  monthlyRecords?: Record<string, { billed: number, paid: number }>; // YYYY-MM
}

export interface WasteEntry {
  id: string;
  vehicleNumber: string;
  clientName: string;
  clientNameCyrillic?: string;
  type: WasteType;
  weight: number;
  entryDate: string;
  cost: number;
}

export interface RecyclingRecord {
  id: string;
  vendorName: string;
  vendorNameCyrillic?: string;
  type: RecyclingType;
  action: RecyclingAction;
  count: number;
  weight: number;
  date: string;
  amount: number;
  sortingPersonnel?: number;
}

export type EmployeeStatus = 'Active' | 'Vacation' | 'BusinessTrip' | 'Off';

export interface Employee {
  id: string;
  empNo?: string; // 사원번호 (e.g., wy-0001)
  name: string; // Korean Name
  nameCyrillic?: string; // Russian/Kazakh Name
  role: UserRole;
  department: string; // Position in Korean
  positionCyrillic?: string; // Position in Cyrillic
  gender?: 'M' | 'F';
  company?: 'SK' | 'WY';
  canInput: boolean;
  status?: EmployeeStatus;
  joinDate?: string;
  resignationDate?: string; // 퇴사일자
  lastClockIn?: string;
  phone?: string;
  email?: string;
  password?: string;
  birthDate?: string;
  allowedMenus?: string[]; // Per-employee menu permissions
  photo?: string;
  education?: any[];
  family?: any[];
  career?: any[];
  remarks?: string;
  idNumber?: string;
  address?: string;
  ancestralHome?: string;
  emergencyPhone?: string;
  age?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  location?: { lat: number; lng: number };
  status: 'Present' | 'Late' | 'Leave' | 'BusinessTrip' | 'Outside';
  isOutsideIn?: boolean;
  isOutsideOut?: boolean;
}

export type ApprovalFormType = 'Proposal' | 'Expense' | 'Leave' | 'Trip' | 'Resignation';
export type ApprovalStepStatus = 'Pending' | 'Approved' | 'Rejected' | 'Current';

export interface ApprovalStep {
  role: string;
  name?: string;
  status: ApprovalStepStatus;
  date?: string;
}

export interface ApprovalDoc {
  id: string;
  type: ApprovalFormType;
  title: string;
  requester: string;
  content: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvalLine: ApprovalStep[];
}

export interface ScheduleEvent {
  id: string;
  date: string; // Start Date YYYY-MM-DD
  endDate?: string; // End Date YYYY-MM-DD
  title: string;
  description?: string;
  category: 'Meeting' | 'Inspection' | 'Maintenance' | 'Other' | 'Google';
  source?: 'local' | 'google';
}

export interface DailyMemo {
  date: string;
  content: string;
}
