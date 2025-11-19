import { Response } from 'express';
import { ApiResponse } from '../types';

export function success<T>(res: Response, data?: T, message = '操作成功'): void {
  const response: ApiResponse<T> = {
    code: 200,
    message,
    data,
  };
  res.json(response);
}

export function error(res: Response, message = '操作失败', code = 400): void {
  const response: ApiResponse = {
    code,
    message,
  };
  res.status(code >= 500 ? 500 : 400).json(response);
}
