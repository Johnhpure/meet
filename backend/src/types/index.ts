export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

export interface CompanionInfo {
  name: string;
  idCard: string;
  bedType: 'share' | 'single';
  permitImageUrl: string;
}

export interface RegistrationDTO {
  name: string;
  idCard: string;
  gender: string;
  hasPlusOnes: boolean;
  plusOnesCount: number;
  attendanceType: string;
  companions?: CompanionInfo[];
  phone: string;
  email: string;
  wechat?: string;
  city: string;
  position: string;
  permitImageUrl: string;
  paymentImageUrl: string;
  totalFee: number;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  attendanceType?: string;
  startDate?: string;
  endDate?: string;
}

export interface StatisticsData {
  total: number;
  option1Count: number;
  option2Count: number;
  option3Count: number;
  totalPlusOnes: number;
  recentRegistrations: number;
}
