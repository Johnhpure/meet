import { Request, Response, NextFunction } from 'express';
import { RegistrationService } from '../services/registrationService';
import { success, error } from '../utils/response';
import { validateIdCard, validatePhone, validateEmail } from '../utils/validator';
import { RegistrationDTO } from '../types';

const registrationService = new RegistrationService();

export class RegistrationController {
  /**
   * 提交报名
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: RegistrationDTO = req.body;

      // 数据验证
      if (!data.name || !data.idCard || !data.phone || !data.email) {
        error(res, '请填写所有必填项');
        return;
      }

      if (!validateIdCard(data.idCard)) {
        error(res, '身份证号码格式不正确');
        return;
      }

      if (!validatePhone(data.phone)) {
        error(res, '手机号码格式不正确');
        return;
      }

      if (!validateEmail(data.email)) {
        error(res, '邮箱格式不正确');
        return;
      }

      if (!['option1', 'option2', 'option3'].includes(data.attendanceType)) {
        error(res, '参会方式选择不正确');
        return;
      }

      // 检查身份证是否已报名
      const exists = await registrationService.checkIdCardExists(data.idCard);
      if (exists) {
        error(res, '该身份证号已报名，请勿重复提交');
        return;
      }

      const registration = await registrationService.create(data);
      success(res, registration, '报名成功');
    } catch (err) {
      next(err);
    }
  }

  /**
   * 获取报名列表（管理端）
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        keyword: req.query.keyword as string,
        attendanceType: req.query.attendanceType as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      const result = await registrationService.findAll(query);
      success(res, result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * 获取报名详情
   */
  async detail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const registration = await registrationService.findById(id);

      if (!registration) {
        error(res, '报名记录不存在', 404);
        return;
      }

      success(res, registration);
    } catch (err) {
      next(err);
    }
  }

  /**
   * 更新报名信息
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const data: Partial<RegistrationDTO> = req.body;

      const registration = await registrationService.update(id, data);
      success(res, registration, '更新成功');
    } catch (err) {
      next(err);
    }
  }

  /**
   * 删除报名记录
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await registrationService.delete(id);
      success(res, null, '删除成功');
    } catch (err) {
      next(err);
    }
  }

  /**
   * 获取统计数据
   */
  async statistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await registrationService.getStatistics();
      success(res, stats);
    } catch (err) {
      next(err);
    }
  }
}
