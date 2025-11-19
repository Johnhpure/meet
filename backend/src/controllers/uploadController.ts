import { Request, Response, NextFunction } from 'express';
import { success, error } from '../utils/response';

export class UploadController {
  /**
   * 上传图片
   */
  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        error(res, '请选择要上传的文件');
        return;
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      success(res, { url: fileUrl }, '上传成功');
    } catch (err) {
      next(err);
    }
  }
}
