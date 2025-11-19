import axios from 'axios';
import type { ApiResponse, Registration, RegistrationFormData, PaginationData, StatisticsData } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || '网络请求失败';
    return Promise.reject(new Error(message));
  }
);

export const registrationApi = {
  // 提交报名
  create: (data: RegistrationFormData) =>
    api.post<any, ApiResponse<Registration>>('/registrations', data),

  // 上传图片
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<any, ApiResponse<{ url: string }>>('/upload', formData);
  },
};

export const adminApi = {
  // 登录
  login: (username: string, password: string) =>
    api.post<any, ApiResponse<{ username: string }>>('/admin/login', { username, password }),

  // 获取报名列表
  getList: (params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    attendanceType?: string;
    startDate?: string;
    endDate?: string;
  }) =>
    api.get<any, ApiResponse<PaginationData<Registration>>>('/admin/registrations', { params }),

  // 获取报名详情
  getDetail: (id: number) =>
    api.get<any, ApiResponse<Registration>>(`/admin/registrations/${id}`),

  // 更新报名
  update: (id: number, data: Partial<RegistrationFormData>) =>
    api.put<any, ApiResponse<Registration>>(`/admin/registrations/${id}`, data),

  // 删除报名
  delete: (id: number) =>
    api.delete<any, ApiResponse>(`/admin/registrations/${id}`),

  // 获取统计数据
  getStatistics: () =>
    api.get<any, ApiResponse<StatisticsData>>('/admin/statistics'),
};
