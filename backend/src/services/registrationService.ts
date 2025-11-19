import { PrismaClient, Registration } from '@prisma/client';
import { RegistrationDTO, PaginationQuery, StatisticsData } from '../types';

const prisma = new PrismaClient();

export class RegistrationService {
  /**
   * 创建报名记录
   */
  async create(data: RegistrationDTO): Promise<Registration> {
    return await prisma.registration.create({
      data: {
        ...data,
        companions: data.companions ? JSON.stringify(data.companions) : null,
      },
    });
  }

  /**
   * 分页查询报名列表
   */
  async findAll(query: PaginationQuery) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (query.keyword) {
      where.OR = [
        { name: { contains: query.keyword } },
        { phone: { contains: query.keyword } },
        { idCard: { contains: query.keyword } },
      ];
    }

    if (query.attendanceType) {
      where.attendanceType = query.attendanceType;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    const [list, total] = await Promise.all([
      prisma.registration.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.registration.count({ where }),
    ]);

    // 解析 companions JSON 字符串
    const parsedList = list.map(item => ({
      ...item,
      companions: item.companions ? JSON.parse(item.companions) : null,
    }));

    return {
      list: parsedList,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 根据ID查询报名详情
   */
  async findById(id: number): Promise<Registration | null> {
    const registration = await prisma.registration.findUnique({
      where: { id },
    });

    if (!registration) {
      return null;
    }

    // 解析 companions JSON 字符串
    return {
      ...registration,
      companions: registration.companions ? JSON.parse(registration.companions) : null,
    } as any;
  }

  /**
   * 更新报名记录
   */
  async update(id: number, data: Partial<RegistrationDTO>): Promise<Registration> {
    return await prisma.registration.update({
      where: { id },
      data: {
        ...data,
        companions: data.companions ? JSON.stringify(data.companions) : undefined,
      },
    });
  }

  /**
   * 删除报名记录
   */
  async delete(id: number): Promise<Registration> {
    return await prisma.registration.delete({
      where: { id },
    });
  }

  /**
   * 获取统计数据
   */
  async getStatistics(): Promise<StatisticsData> {
    const total = await prisma.registration.count();
    
    const option1Count = await prisma.registration.count({
      where: { attendanceType: 'option1' },
    });
    
    const option2Count = await prisma.registration.count({
      where: { attendanceType: 'option2' },
    });
    
    const option3Count = await prisma.registration.count({
      where: { attendanceType: 'option3' },
    });

    const plusOnesResult = await prisma.registration.aggregate({
      _sum: { plusOnesCount: true },
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentRegistrations = await prisma.registration.count({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
    });

    return {
      total,
      option1Count,
      option2Count,
      option3Count,
      totalPlusOnes: plusOnesResult._sum.plusOnesCount || 0,
      recentRegistrations,
    };
  }

  /**
   * 检查身份证是否已存在
   */
  async checkIdCardExists(idCard: string): Promise<boolean> {
    const count = await prisma.registration.count({
      where: { idCard },
    });
    return count > 0;
  }
}
