import React, { useState, useEffect } from 'react';
import { Table, Card, Input, Select, DatePicker, Button, Space, message, Modal, Statistic, Row, Col, Image, Tag, Descriptions, Divider, Badge } from 'antd';
import { SearchOutlined, ReloadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { adminApi } from '../services/api';
import type { Registration, StatisticsData } from '../types';

const { RangePicker } = DatePicker;

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Registration[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [attendanceType, setAttendanceType] = useState<string>();
  const [dateRange, setDateRange] = useState<[string, string]>();
  const [stats, setStats] = useState<StatisticsData>();
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentDetail, setCurrentDetail] = useState<Registration>();
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getList({
        page,
        pageSize,
        keyword,
        attendanceType,
        startDate: dateRange?.[0],
        endDate: dateRange?.[1],
      });
      setData(res.data?.list || []);
      setTotal(res.data?.total || 0);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const res = await adminApi.getStatistics();
      setStats(res.data);
    } catch (error: any) {
      message.error(error.message);
    }
  };

  useEffect(() => {
    const isAdmin = localStorage.getItem('admin');
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    loadData();
    loadStatistics();
  }, [page, pageSize]);

  const handleSearch = () => {
    setPage(1);
    loadData();
  };

  const handleReset = () => {
    setKeyword('');
    setAttendanceType(undefined);
    setDateRange(undefined);
    setPage(1);
    setTimeout(loadData, 0);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这条报名记录吗？',
      onOk: async () => {
        try {
          await adminApi.delete(id);
          message.success('删除成功');
          loadData();
          loadStatistics();
        } catch (error: any) {
          message.error(error.message);
        }
      },
    });
  };

  // 获取参会方式详细信息
  const getAttendanceTypeDetail = (type: string) => {
    const typeMap: Record<string, { label: string; desc: string; color: string }> = {
      option1: {
        label: '选项1',
        desc: '7号深圳不住宿（8号直接参会，9号不参加一日游）',
        color: 'blue'
      },
      option2: {
        label: '选项2',
        desc: '7号不住深圳 + 8号香港住宿 + 9号香港一日游',
        color: 'green'
      },
      option3: {
        label: '选项3',
        desc: '7号深圳住宿 + 8号香港住宿 + 9号香港一日游',
        color: 'orange'
      }
    };
    return typeMap[type] || { label: type, desc: '', color: 'default' };
  };

  const showDetail = async (id: number) => {
    try {
      const res = await adminApi.getDetail(id);
      setCurrentDetail(res.data);
      setDetailVisible(true);
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      width: 100,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      width: 60,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      width: 120,
    },
    {
      title: '参会方式',
      dataIndex: 'attendanceType',
      width: 100,
      render: (val: string) => (
        <Tag color={val === 'option1' ? 'blue' : val === 'option2' ? 'green' : 'orange'}>
          {val === 'option1' ? '选项1' : val === 'option2' ? '选项2' : '选项3'}
        </Tag>
      ),
    },
    {
      title: '携带人数',
      dataIndex: 'plusOnesCount',
      width: 90,
      render: (val: number, record: Registration) => 
        record.hasPlusOnes ? `${val}人` : '-',
    },
    {
      title: '城市',
      dataIndex: 'city',
      width: 100,
    },
    {
      title: '职务',
      dataIndex: 'position',
      width: 120,
    },
    {
      title: '报名时间',
      dataIndex: 'createdAt',
      width: 160,
      render: (val: string) => dayjs(val).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: Registration) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => showDetail(record.id)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic title="总报名人数" value={stats?.total || 0} />
          </Col>
          <Col span={6}>
            <Statistic title="选项1" value={stats?.option1Count || 0} suffix="人" />
          </Col>
          <Col span={6}>
            <Statistic title="选项2" value={stats?.option2Count || 0} suffix="人" />
          </Col>
          <Col span={6}>
            <Statistic title="选项3" value={stats?.option3Count || 0} suffix="人" />
          </Col>
        </Row>
      </Card>

      <Card
        title="报名管理"
        extra={
          <Button onClick={() => {
            localStorage.removeItem('admin');
            navigate('/admin/login');
          }}>
            退出登录
          </Button>
        }
      >
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="搜索姓名/手机号/身份证"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 200 }}
            allowClear
          />
          <Select
            placeholder="参会方式"
            value={attendanceType}
            onChange={setAttendanceType}
            style={{ width: 120 }}
            allowClear
          >
            <Select.Option value="option1">选项1</Select.Option>
            <Select.Option value="option2">选项2</Select.Option>
            <Select.Option value="option3">选项3</Select.Option>
          </Select>
          <RangePicker
            value={dateRange ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : null}
            onChange={(dates) => {
              if (dates) {
                setDateRange([
                  dates[0]!.format('YYYY-MM-DD'),
                  dates[1]!.format('YYYY-MM-DD'),
                ]);
              } else {
                setDateRange(undefined);
              }
            }}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            },
          }}
        />
      </Card>

      <Modal
        title={
          <div style={{ fontSize: 18, fontWeight: 'bold' }}>
            📋 报名详情
          </div>
        }
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={900}
        style={{ top: 20 }}
      >
        {currentDetail && (
          <div style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', padding: '8px 0' }}>
            {/* 顶部摘要卡片 */}
            <Card 
              size="small" 
              style={{ 
                marginBottom: 20, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
            >
              <Row gutter={16} style={{ color: 'white' }}>
                <Col span={8}>
                  <div style={{ fontSize: 14, opacity: 0.9 }}>参会人员</div>
                  <div style={{ fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>{currentDetail.name}</div>
                </Col>
                <Col span={8}>
                  <div style={{ fontSize: 14, opacity: 0.9 }}>职务</div>
                  <div style={{ fontSize: 18, fontWeight: 'bold', marginTop: 4 }}>{currentDetail.position}</div>
                </Col>
                <Col span={8}>
                  <div style={{ fontSize: 14, opacity: 0.9 }}>总费用</div>
                  <div style={{ fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>
                    ¥{currentDetail.totalFee?.toLocaleString() || 0}
                  </div>
                </Col>
              </Row>
            </Card>

            {/* 基本信息 */}
            <Divider orientation="left" style={{ fontSize: 16, fontWeight: 'bold' }}>
              👤 基本信息
            </Divider>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="姓名">{currentDetail.name}</Descriptions.Item>
              <Descriptions.Item label="性别">{currentDetail.gender}</Descriptions.Item>
              <Descriptions.Item label="身份证号" span={2}>{currentDetail.idCard}</Descriptions.Item>
              <Descriptions.Item label="所属城市">{currentDetail.city}</Descriptions.Item>
              <Descriptions.Item label="职务">{currentDetail.position}</Descriptions.Item>
            </Descriptions>

            {/* 参会信息 */}
            <Divider orientation="left" style={{ fontSize: 16, fontWeight: 'bold', marginTop: 24 }}>
              🎫 参会信息
            </Divider>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="参会方式" span={2}>
                <Space>
                  <Tag color={getAttendanceTypeDetail(currentDetail.attendanceType).color}>
                    {getAttendanceTypeDetail(currentDetail.attendanceType).label}
                  </Tag>
                  <span style={{ color: '#666', fontSize: 12 }}>
                    {getAttendanceTypeDetail(currentDetail.attendanceType).desc}
                  </span>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="是否携带人员">
                {currentDetail.hasPlusOnes ? (
                  <Badge status="success" text={`携带 ${currentDetail.plusOnesCount} 人`} />
                ) : (
                  <Badge status="default" text="不携带" />
                )}
              </Descriptions.Item>
              <Descriptions.Item label="会务费用">
                <span style={{ fontSize: 16, fontWeight: 'bold', color: '#ff4d4f' }}>
                  ¥{currentDetail.totalFee?.toLocaleString() || 0}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="报名时间" span={2}>
                {dayjs(currentDetail.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            </Descriptions>

            {/* 联系方式 */}
            <Divider orientation="left" style={{ fontSize: 16, fontWeight: 'bold', marginTop: 24 }}>
              📞 联系方式
            </Divider>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="手机号码">{currentDetail.phone}</Descriptions.Item>
              <Descriptions.Item label="微信号">{currentDetail.wechat || '-'}</Descriptions.Item>
              <Descriptions.Item label="邮箱地址" span={2}>{currentDetail.email}</Descriptions.Item>
            </Descriptions>

            {/* 证件附件 */}
            <Divider orientation="left" style={{ fontSize: 16, fontWeight: 'bold', marginTop: 24 }}>
              📎 证件附件
            </Divider>
            <div style={{ background: '#fafafa', padding: 16, borderRadius: 8 }}>
              <Row gutter={[24, 16]}>
                <Col span={12}>
                  <div style={{ marginBottom: 8, fontWeight: 'bold', color: '#666' }}>
                    本人港澳通行证
                  </div>
                  {currentDetail.permitImageUrl ? (
                    <Image 
                      src={currentDetail.permitImageUrl} 
                      width="100%"
                      style={{ borderRadius: 8, border: '1px solid #e8e8e8' }}
                      placeholder={<div style={{ height: 200, background: '#f0f0f0' }} />}
                    />
                  ) : (
                    <div style={{ 
                      height: 200, 
                      background: '#f5f5f5', 
                      border: '1px dashed #d9d9d9', 
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#999'
                    }}>
                      未上传
                    </div>
                  )}
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: 8, fontWeight: 'bold', color: '#666' }}>
                    付款截图
                  </div>
                  <Image 
                    src={currentDetail.paymentImageUrl} 
                    width="100%"
                    style={{ borderRadius: 8, border: '1px solid #e8e8e8' }}
                    placeholder={<div style={{ height: 200, background: '#f0f0f0' }} />}
                  />
                </Col>
              </Row>
            </div>

            {/* 携带人员信息 */}
            {currentDetail.hasPlusOnes && currentDetail.companions && currentDetail.companions.length > 0 && (
              <>
                <Divider orientation="left" style={{ fontSize: 16, fontWeight: 'bold', marginTop: 24 }}>
                  👥 携带人员信息
                </Divider>
                <div style={{ marginTop: 16 }}>
                  {currentDetail.companions.map((companion, index) => (
                    <Card
                      key={index}
                      size="small"
                      title={
                        <Space>
                          <span style={{ fontSize: 14 }}>携带人员 {index + 1}</span>
                          <Tag color={companion.bedType === 'share' ? 'blue' : 'orange'}>
                            {companion.bedType === 'share' ? '不占床' : '占床'}
                          </Tag>
                        </Space>
                      }
                      style={{ 
                        marginBottom: index < (currentDetail.companions?.length || 1) - 1 ? 16 : 0,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                      }}
                    >
                      <Descriptions bordered size="small" column={2}>
                        <Descriptions.Item label="姓名">{companion.name}</Descriptions.Item>
                        <Descriptions.Item label="身份证号">{companion.idCard}</Descriptions.Item>
                        <Descriptions.Item label="住宿方式" span={2}>
                          <Tag color={companion.bedType === 'share' ? 'blue' : 'orange'}>
                            {companion.bedType === 'share' ? '不占床' : '占床'}
                          </Tag>
                        </Descriptions.Item>
                      </Descriptions>
                      <div style={{ marginTop: 12 }}>
                        <div style={{ marginBottom: 8, fontWeight: 'bold', color: '#666', fontSize: 13 }}>
                          港澳通行证
                        </div>
                        {companion.permitImageUrl ? (
                          <Image 
                            src={companion.permitImageUrl} 
                            width={200}
                            style={{ borderRadius: 8, border: '1px solid #e8e8e8' }}
                          />
                        ) : (
                          <div style={{ 
                            width: 200,
                            height: 120, 
                            background: '#f5f5f5', 
                            border: '1px dashed #d9d9d9', 
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#999',
                            fontSize: 12
                          }}>
                            未上传
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
