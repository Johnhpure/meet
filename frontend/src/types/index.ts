// 携带人员信息
export interface CompanionInfo {
  name: string;
  idCard: string;
  bedType: 'share' | 'single'; // 不占床/占床
  permitImageUrl: string;
}

export interface Registration {
  id: number;
  name: string;
  idCard: string;
  gender: string;
  hasPlusOnes: boolean;
  plusOnesCount: number;
  attendanceType: string; // 'option1' | 'option2' | 'option3'
  companions?: CompanionInfo[]; // 携带人员信息
  phone: string;
  email: string;
  wechat?: string;
  city: string;
  position: string;
  permitImageUrl: string;
  paymentImageUrl: string;
  totalFee: number; // 总费用
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationFormData {
  name: string;
  idCard: string;
  gender: string;
  hasPlusOnes: boolean;
  plusOnesCount: number;
  attendanceType: string; // 'option1' | 'option2' | 'option3'
  companions?: CompanionInfo[]; // 携带人员信息
  phone: string;
  email: string;
  wechat?: string;
  city: string;
  position: string;
  permitImageUrl: string;
  paymentImageUrl: string;
  totalFee: number; // 总费用
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

export interface PaginationData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface StatisticsData {
  total: number;
  option1Count: number;
  option2Count: number;
  option3Count: number;
  totalPlusOnes: number;
  recentRegistrations: number;
}
