import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Selector, 
  Radio, 
  Checkbox,
  ImageUploader, 
  Button, 
  Toast,
  Card,
  Divider,
  Space,
  CascadePicker
} from 'antd-mobile';
import { 
  UnorderedListOutline, 
  BankcardOutline, 
  PhoneFill,
  ExclamationCircleFill,
  DownOutline,
  UpOutline
} from 'antd-mobile-icons';
import { registrationApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { cityData } from '../data/cityData';
import './RegistrationForm.css';

// 职务选项
const positionOptions = [
  { label: '5GP', value: '5GP' },
  { label: '4GP', value: '4GP' },
  { label: '3GP', value: '3GP' },
  { label: '2GP', value: '2GP' },
  { label: 'LP', value: 'LP' },
  { label: '商务', value: '商务' },
  { label: '联盟商家', value: '联盟商家' },
  { label: '其他合作伙伴', value: '其他合作伙伴' },
];

// 参会方式选项
const attendanceOptions = [
  { label: '参会方式1：只参加8号全天会议，含午餐和晚宴', value: 'option1' },
  { label: '参会方式2：7号不住深圳酒店，8号香港住宿1晚，9号香港一日游', value: 'option2' },
  { label: '参会方式3：7号住深圳酒店，8号香港酒店住宿各1晚，9号香港一日游', value: 'option3' },
];

interface CompanionInfo {
  name: string;
  idCard: string;
  bedType: 'share' | 'single';
  permitImages: any[];
}

const RegistrationForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hasPlusOnes, setHasPlusOnes] = useState(false);
  const [plusOnesCount, setPlusOnesCount] = useState<number>(0);
  const [attendanceType, setAttendanceType] = useState<string>('');
  const [companions, setCompanions] = useState<CompanionInfo[]>([]);
  const [permitImages, setPermitImages] = useState<any[]>([]);
  const [paymentImages, setPaymentImages] = useState<any[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [totalFee, setTotalFee] = useState(0);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [cityPickerVisible, setCityPickerVisible] = useState(false);
  const [cityValue, setCityValue] = useState<(string | null)[]>([]);
  const [cityLabel, setCityLabel] = useState('');

  // 费用计算逻辑
  useEffect(() => {
    let fee = 0;
    
    // 本人费用
    if (attendanceType === 'option1') {
      fee = 1000;
    } else if (attendanceType === 'option2') {
      fee = 1800;
    } else if (attendanceType === 'option3') {
      fee = 2000;
    }

    // 携带人员费用
    if (hasPlusOnes && companions.length > 0) {
      companions.forEach(companion => {
        if (attendanceType === 'option1') {
          // 选项1不支持携带人员
          fee += 0;
        } else if (attendanceType === 'option2') {
          // 7号不住深圳
          fee += companion.bedType === 'share' ? 1600 : 1800;
        } else if (attendanceType === 'option3') {
          // 7号住深圳
          fee += companion.bedType === 'share' ? 1800 : 2000;
        }
      });
    }

    setTotalFee(fee);
  }, [attendanceType, hasPlusOnes, companions]);

  // 图片上传处理
  const uploadImage = async (file: File): Promise<string> => {
    try {
      const res = await registrationApi.upload(file);
      return res.data?.url || '';
    } catch (error: any) {
      throw new Error(error.message || '上传失败');
    }
  };

  // 文件上传前验证
  const beforeUpload = (file: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      Toast.show({
        icon: 'fail',
        content: '图片大小不能超过10MB，请压缩后重试',
      });
      return null;
    }
    return file;
  };

  // 处理携带人数变化
  const handlePlusOnesCountChange = (count: number) => {
    setPlusOnesCount(count);
    const newCompanions: CompanionInfo[] = [];
    for (let i = 0; i < count; i++) {
      newCompanions.push({
        name: '',
        idCard: '',
        bedType: 'share',
        permitImages: []
      });
    }
    setCompanions(newCompanions);
  };

  // 更新携带人员信息
  const updateCompanion = (index: number, field: keyof CompanionInfo, value: any) => {
    const newCompanions = [...companions];
    newCompanions[index] = { ...newCompanions[index], [field]: value };
    setCompanions(newCompanions);
  };

  // 表单提交
  const onFinish = async (values: any) => {
    // 验证附件（港澳通行证改为非必填）
    // if (permitImages.length === 0) {
    //   Toast.show({ content: '请上传您的港澳通行证', icon: 'fail' });
    //   return;
    // }
    if (paymentImages.length === 0) {
      Toast.show({ content: '请上传付款截图', icon: 'fail' });
      return;
    }

    // 验证携带人员信息
    if (hasPlusOnes) {
      for (let i = 0; i < companions.length; i++) {
        const companion = companions[i];
        if (!companion.name || !companion.idCard) {
          Toast.show({ content: `请完善第${i + 1}位携带人员的基本信息`, icon: 'fail' });
          return;
        }
        // 携带人员港澳通行证改为非必填
        // if (companion.permitImages.length === 0) {
        //   Toast.show({ content: `请上传第${i + 1}位携带人员的港澳通行证`, icon: 'fail' });
        //   return;
        // }
      }
    }

    // 验证确认勾选
    if (!confirmed) {
      Toast.show({ content: '请先阅读并确认报名须知', icon: 'fail' });
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...values,
        permitImageUrl: permitImages[0]?.url || '',
        paymentImageUrl: paymentImages[0]?.url || '',
        hasPlusOnes,
        plusOnesCount,
        companions: hasPlusOnes ? companions.map(c => ({
          ...c,
          permitImageUrl: c.permitImages[0]?.url || ''
        })) : [],
        totalFee
      };

      await registrationApi.create(submitData);
      Toast.show({ 
        content: '🎉 报名成功！正在跳转...', 
        icon: 'success',
        duration: 1500,
        position: 'top',
      });
      setTimeout(() => {
        navigate('/success');
      }, 1500);
    } catch (error: any) {
      Toast.show({ content: error.message || '提交失败', icon: 'fail' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-page">
      {/* 顶部Banner */}
      <div className="page-header">
        <h1 className="header-title">2026拼好拼香港年会</h1>
        <p className="header-subtitle">报名登记表</p>
        <div className="header-info">
          <span>📅 2026年1月7日 - 1月9日</span>
          <span>📍 中国·香港</span>
        </div>
      </div>

      {/* 第一部分：会议详情 */}
      <Card className="section-card">
        <div className="section-title">
          <UnorderedListOutline fontSize={20} />
          <span>会议详情</span>
        </div>
        
        {/* 折叠/展开按钮 */}
        <Button
          block
          color="primary"
          fill="outline"
          className="details-toggle-btn"
          onClick={() => setDetailsExpanded(!detailsExpanded)}
        >
          <div className="toggle-btn-content">
            <span className="toggle-btn-text">
              {detailsExpanded ? '收起详情' : '点击查看完整会议详情'}
            </span>
            {detailsExpanded ? <UpOutline fontSize={16} /> : <DownOutline fontSize={16} />}
          </div>
        </Button>
        
        {/* 会议详情内容 - 可折叠 */}
        <div className={`details-content ${detailsExpanded ? 'expanded' : 'collapsed'}`}>
          {/* 会议议程安排 */}
        <div style={{ marginTop: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: '#333' }}>
            📋 会议议程安排
          </h3>
          
          {/* 1月7日 */}
          <div style={{ 
            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '16px',
            border: '2px solid #1976d2',
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)'
          }}>
            <div style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              color: '#1565c0',
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{ fontSize: 20 }}>📅</span>
              <span>1月7日</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#1976d2', marginLeft: 8 }}>深圳集合</span>
            </div>
            
            <div style={{ fontSize: 14, color: '#333', lineHeight: '1.8' }}>
              <div style={{ marginBottom: 8 }}>
                <span style={{ display: 'block', marginBottom: 4 }}>📍 全国各地到深圳【大梅沙芭堤雅】酒店集合</span>
              </div>
              
              <div style={{ marginBottom: 8 }}>
                <span style={{ display: 'block', color: '#666', fontSize: 13 }}>🏠 地址：深圳盐田区大梅沙环梅路20号</span>
              </div>
              
              <div style={{ marginBottom: 8 }}>
                <span style={{ display: 'block', color: '#666', fontSize: 13 }}>🚇 地铁：大梅沙站C出口（距760米）</span>
              </div>
              
              <div style={{ 
                marginTop: 12, 
                paddingTop: 12, 
                borderTop: '1px dashed #90caf9',
                fontWeight: 'bold',
                color: '#1565c0'
              }}>
                🏨 住宿：深圳酒店 (四星)
              </div>
            </div>
          </div>

          {/* 1月8日 */}
          <div style={{ 
            background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '16px',
            border: '2px solid #388e3c',
            boxShadow: '0 2px 8px rgba(56, 142, 60, 0.15)'
          }}>
            <div style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              color: '#2e7d32',
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{ fontSize: 20 }}>📅</span>
              <span>1月8日</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#388e3c', marginLeft: 8 }}>深圳→香港</span>
            </div>
            
            <div style={{ fontSize: 14, color: '#333', lineHeight: '1.8' }}>
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 'bold', color: '#2e7d32' }}>06:00-06:30</span>
                <span style={{ marginLeft: 8 }}>酒店自助早餐</span>
              </div>
              
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 'bold', color: '#2e7d32' }}>07:00</span>
                <span style={{ marginLeft: 8 }}>准时集合出发，前往莲塘口岸</span>
              </div>
              
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 'bold', color: '#2e7d32' }}>07:30-09:00</span>
                <span style={{ marginLeft: 8 }}>统一乘大巴车前往香港酒店</span>
              </div>
              
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 'bold', color: '#2e7d32' }}>09:00-12:00</span>
                <span style={{ marginLeft: 8 }}>上午会议</span>
              </div>
              
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 'bold', color: '#2e7d32' }}>12:00-13:00</span>
                <span style={{ marginLeft: 8 }}>自助午餐</span>
              </div>
              
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 'bold', color: '#2e7d32' }}>14:00-17:00</span>
                <span style={{ marginLeft: 8 }}>下午会议</span>
              </div>
              
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 'bold', color: '#2e7d32' }}>19:00-22:00</span>
                <span style={{ marginLeft: 8 }}>年会晚宴</span>
              </div>
              
              <div style={{ 
                marginTop: 12, 
                paddingTop: 12, 
                borderTop: '1px dashed #a5d6a7',
                fontWeight: 'bold',
                color: '#2e7d32'
              }}>
                🏨 住宿：香港酒店 (五星)
              </div>
            </div>
          </div>

          {/* 1月9日 */}
          <div style={{ 
            background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '16px',
            border: '2px solid #f57c00',
            boxShadow: '0 2px 8px rgba(245, 124, 0, 0.15)'
          }}>
            <div style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              color: '#e65100',
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{ fontSize: 20 }}>📅</span>
              <span>1月9日</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#f57c00', marginLeft: 8 }}>香港→深圳</span>
            </div>
            
            <div style={{ fontSize: 14, color: '#333', lineHeight: '1.8' }}>
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 'bold', color: '#e65100' }}>07:30-08:30</span>
                <span style={{ marginLeft: 8 }}>早餐</span>
              </div>
              
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontWeight: 'bold', color: '#e65100' }}>09:00-18:00</span>
                <span style={{ marginLeft: 8 }}>游览行程：</span>
              </div>
              
              <div style={{ paddingLeft: 20, marginBottom: 10 }}>
                <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#f57c00', fontSize: 12 }}>▪</span>
                  <span>黄大仙祠</span>
                </div>
                <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#f57c00', fontSize: 12 }}>▪</span>
                  <span>香港钟楼 - 星光大道</span>
                </div>
                <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#f57c00', fontSize: 12 }}>▪</span>
                  <span>尖沙咀自由活动</span>
                </div>
                <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#f57c00', fontSize: 12 }}>▪</span>
                  <span>太平山顶</span>
                </div>
                <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#f57c00', fontSize: 12 }}>▪</span>
                  <span>浅水湾</span>
                </div>
                <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#f57c00', fontSize: 12 }}>▪</span>
                  <span>香港会展中心 & 金紫荆广场</span>
                </div>
                <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#f57c00', fontSize: 12 }}>▪</span>
                  <span>乘坐天星小轮游维港</span>
                </div>
              </div>
              
              <div style={{ 
                marginTop: 8,
                fontWeight: 'bold',
                color: '#e65100'
              }}>
                🚌 集合返回深圳莲塘口岸
              </div>
            </div>
          </div>
        </div>

        <Divider style={{ margin: '24px 0' }} />

        {/* 报名必读 - 平铺展示 */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' }}>
            ⚠️ 报名必读
          </h3>
          <div className="notice-list">
            <p>1、报名时建议提供<strong>签注在有效期内</strong>的港澳通行证正反面</p>
            <p>2、准确填写身份证信息</p>
            <p>3、上传会务费用转账记录</p>
            <p>4、填写真实姓名，不要写微信昵称</p>
          </div>
        </div>

        <Divider style={{ margin: '24px 0' }} />

        {/* 会务咨询 - 平铺展示 */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' }}>
            📞 会务咨询
          </h3>
          <div className="contact-info">
            <div className="contact-item">
              <PhoneFill fontSize={18} color="#1677ff" />
              <div>
                <p><strong>马晗</strong></p>
                <p>13828783495（同微信）</p>
              </div>
            </div>
            <div className="contact-item">
              <PhoneFill fontSize={18} color="#1677ff" />
              <div>
                <p><strong>玉洁</strong></p>
                <p>13823505853（同微信）</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </Card>

      {/* 会务费用卡片 */}
      <Card className="section-card" style={{ marginTop: 16 }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          margin: '-12px -12px 20px -12px',
          padding: '20px 16px',
          borderRadius: '8px 8px 0 0'
        }}>
          <h2 style={{ 
            color: 'white', 
            fontSize: 20, 
            fontWeight: 'bold', 
            margin: 0,
            textAlign: 'center' 
          }}>
            💰 会务费用
          </h2>
        </div>

        {/* 本人参会方式 */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: '#333' }}>
            本人参会费用
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* 参会方式1 */}
            <div style={{ 
              padding: '16px',
              background: '#f0f7ff',
              borderRadius: '8px',
              border: '2px solid #1677ff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 'bold', color: '#1677ff', marginBottom: 8 }}>
                    参会方式1
                  </div>
                  <div style={{ fontSize: 13, color: '#666', lineHeight: '1.5' }}>
                    只参加8号全天会议，含午餐和晚宴
                  </div>
                </div>
                <div style={{ 
                  fontSize: 24, 
                  fontWeight: 'bold', 
                  color: '#ff4d4f',
                  marginLeft: 12
                }}>
                  ¥1,000
                </div>
              </div>
            </div>

            {/* 参会方式2 */}
            <div style={{ 
              padding: '16px',
              background: '#f6ffed',
              borderRadius: '8px',
              border: '2px solid #52c41a'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 'bold', color: '#52c41a', marginBottom: 8 }}>
                    参会方式2
                  </div>
                  <div style={{ fontSize: 13, color: '#666', lineHeight: '1.5' }}>
                    7号不住深圳酒店，8号香港住宿1晚，9号香港一日游
                  </div>
                </div>
                <div style={{ 
                  fontSize: 24, 
                  fontWeight: 'bold', 
                  color: '#ff4d4f',
                  marginLeft: 12
                }}>
                  ¥1,800
                </div>
              </div>
            </div>

            {/* 参会方式3 */}
            <div style={{ 
              padding: '16px',
              background: '#fff7e6',
              borderRadius: '8px',
              border: '2px solid #fa8c16'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 'bold', color: '#fa8c16', marginBottom: 8 }}>
                    参会方式3
                  </div>
                  <div style={{ fontSize: 13, color: '#666', lineHeight: '1.5' }}>
                    7号住深圳酒店，8号香港酒店住宿各1晚，9号香港一日游
                  </div>
                </div>
                <div style={{ 
                  fontSize: 24, 
                  fontWeight: 'bold', 
                  color: '#ff4d4f',
                  marginLeft: 12
                }}>
                  ¥2,000
                </div>
              </div>
            </div>
          </div>
        </div>

        <Divider style={{ margin: '24px 0' }} />

        {/* 携带人员费用 */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: '#333' }}>
            携带家属或其他人参加
          </h3>
          
          <div style={{ 
            background: '#fafafa', 
            padding: '16px', 
            borderRadius: '8px',
            marginBottom: 12
          }}>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#52c41a', marginBottom: 12 }}>
              参会方式2 - 携带人员费用
            </div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
              7号不住深圳酒店，8号香港住宿1晚，9号香港一日游
            </div>
            <div style={{ display: 'flex', gap: '20px', fontSize: 14 }}>
              <div>
                <span style={{ color: '#666' }}>• 不占床：</span>
                <span style={{ fontWeight: 'bold', color: '#ff4d4f' }}>¥1,600/人</span>
              </div>
              <div>
                <span style={{ color: '#666' }}>• 占床：</span>
                <span style={{ fontWeight: 'bold', color: '#ff4d4f' }}>¥1,800/人</span>
              </div>
            </div>
          </div>

          <div style={{ 
            background: '#fafafa', 
            padding: '16px', 
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#fa8c16', marginBottom: 12 }}>
              参会方式3 - 携带人员费用
            </div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
              7号住深圳酒店，8号香港酒店住宿各1晚，9号香港一日游
            </div>
            <div style={{ display: 'flex', gap: '20px', fontSize: 14 }}>
              <div>
                <span style={{ color: '#666' }}>• 不占床：</span>
                <span style={{ fontWeight: 'bold', color: '#ff4d4f' }}>¥1,800/人</span>
              </div>
              <div>
                <span style={{ color: '#666' }}>• 占床：</span>
                <span style={{ fontWeight: 'bold', color: '#ff4d4f' }}>¥2,000/人</span>
              </div>
            </div>
          </div>
        </div>

        <Divider style={{ margin: '24px 0' }} />

        {/* 付款方式 */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: '#333' }}>
            💳 付款方式
          </h3>
          
          {/* 收款账号1 */}
          <div style={{ 
            background: '#f0f7ff', 
            padding: '16px', 
            borderRadius: '8px',
            marginBottom: 12,
            border: '1px solid #d6e4ff'
          }}>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#1677ff', marginBottom: 12 }}>
              收款账号1（公司）
            </div>
            <div style={{ fontSize: 13, color: '#333', lineHeight: '1.8' }}>
              <div style={{ marginBottom: 6 }}>
                <span style={{ color: '#666', fontWeight: 'bold' }}>开户名：</span>
                <span>深圳大马假期国际旅行社有限公司</span>
              </div>
              <div style={{ marginBottom: 6 }}>
                <span style={{ color: '#666', fontWeight: 'bold' }}>开户行：</span>
                <span>中国工商银行深圳国贸支行</span>
              </div>
              <div>
                <span style={{ color: '#666', fontWeight: 'bold' }}>账　号：</span>
                <span style={{ fontFamily: 'monospace', letterSpacing: '1px' }}>4000 0228 1920 0328 871</span>
              </div>
            </div>
          </div>

          {/* 收款账号2 */}
          <div style={{ 
            background: '#f6ffed', 
            padding: '16px', 
            borderRadius: '8px',
            border: '1px solid #b7eb8f'
          }}>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#52c41a', marginBottom: 12 }}>
              收款账号2（个人）
            </div>
            <div style={{ fontSize: 13, color: '#333', lineHeight: '1.8' }}>
              <div style={{ marginBottom: 6 }}>
                <span style={{ color: '#666', fontWeight: 'bold' }}>开户名：</span>
                <span>马　晗</span>
              </div>
              <div style={{ marginBottom: 6 }}>
                <span style={{ color: '#666', fontWeight: 'bold' }}>开户行：</span>
                <span>中国工商银行深圳华联支行</span>
              </div>
              <div>
                <span style={{ color: '#666', fontWeight: 'bold' }}>账　号：</span>
                <span style={{ fontFamily: 'monospace', letterSpacing: '1px' }}>6222 0840 0000 4070 879</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 第二部分：报名信息 */}
      <Card className="section-card">
        <div className="section-title">
          <span>📝</span>
          <span>报名信息</span>
        </div>

        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          footer={null}
        >
          <Form.Item
            name="name"
            label="参会人员姓名"
            rules={[{ required: true, message: '请输入真实姓名' }]}
          >
            <Input placeholder="请填写真实姓名（不要填写微信昵称）" clearable />
          </Form.Item>

          <Form.Item
            name="idCard"
            label="身份证号码"
            rules={[
              { required: true, message: '请输入身份证号码' },
              { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号码' }
            ]}
          >
            <Input placeholder="请输入18位身份证号码" maxLength={18} clearable />
          </Form.Item>

          <Form.Item
            name="gender"
            label="性别"
            rules={[{ required: true, message: '请选择性别' }]}
          >
            <Radio.Group>
              <Space>
                <Radio value="男">男</Radio>
                <Radio value="女">女</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="position"
            label="参会人员职务"
            rules={[{ required: true, message: '请选择职务' }]}
          >
            <Selector
              options={positionOptions}
              onChange={(val) => form.setFieldsValue({ position: val[0] })}
            />
          </Form.Item>

          <Form.Item
            name="attendanceType"
            label="请选择您的参会方式"
            rules={[{ required: true, message: '请选择参会方式' }]}
          >
            <Radio.Group onChange={(val: string | number) => {
              setAttendanceType(val as string);
              form.setFieldsValue({ attendanceType: val });
            }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {attendanceOptions.map(opt => (
                  <Radio key={opt.value} value={opt.value} style={{ 
                    padding: '12px',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    width: '100%',
                    marginBottom: '8px'
                  }}>
                    {opt.label}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="hasPlusOnes"
            label="是否携带其他人参加"
            rules={[{ required: true, message: '请选择' }]}
          >
            <Radio.Group onChange={(val: string | number) => setHasPlusOnes(val === 'yes')}>
              <Space direction="vertical">
                <Radio value="no">否</Radio>
                <Radio value="yes">是（最多2人）</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          {hasPlusOnes && (
            <>
              <Form.Item
                name="plusOnesCount"
                label="携带人数"
                rules={[{ required: true, message: '请选择携带人数' }]}
              >
                <Selector
                  options={[
                    { label: '1人', value: '1' },
                    { label: '2人', value: '2' }
                  ]}
                  onChange={(val: string[]) => {
                    const count = parseInt(val[0] || '0');
                    handlePlusOnesCountChange(count);
                  }}
                />
              </Form.Item>

              {/* 携带人员详细信息 */}
              {companions.map((companion, index) => (
                <div key={index} className="companion-form">
                  <Divider>携带人员 {index + 1}</Divider>
                  
                  <Form.Item label="姓名" required>
                    <Input
                      placeholder="请输入携带人员姓名"
                      value={companion.name}
                      onChange={(val) => updateCompanion(index, 'name', val)}
                      clearable
                    />
                  </Form.Item>

                  <Form.Item label="身份证号码" required>
                    <Input
                      placeholder="请输入18位身份证号码"
                      value={companion.idCard}
                      onChange={(val) => updateCompanion(index, 'idCard', val)}
                      maxLength={18}
                      clearable
                    />
                  </Form.Item>

                  {attendanceType !== 'option1' && (
                    <Form.Item label="住宿方式" required>
                      <Radio.Group
                        value={companion.bedType}
                        onChange={(val) => updateCompanion(index, 'bedType', val)}
                      >
                        <Space direction="vertical">
                          <Radio value="share">
                            不占床 
                            {attendanceType === 'option2' && <span className="price-tag">（¥1,600）</span>}
                            {attendanceType === 'option3' && <span className="price-tag">（¥1,800）</span>}
                          </Radio>
                          <Radio value="single">
                            占床 
                            {attendanceType === 'option2' && <span className="price-tag">（¥1,800）</span>}
                            {attendanceType === 'option3' && <span className="price-tag">（¥2,000）</span>}
                          </Radio>
                        </Space>
                      </Radio.Group>
                    </Form.Item>
                  )}

                  <Form.Item label="港澳通行证">
                    <ImageUploader
                      value={companion.permitImages}
                      onChange={(files) => updateCompanion(index, 'permitImages', files)}
                      beforeUpload={beforeUpload}
                      upload={async (file) => {
                        const url = await uploadImage(file);
                        return { url };
                      }}
                      maxCount={2}
                    >
                      <div className="upload-placeholder">
                        点击上传港澳通行证正反面
                      </div>
                    </ImageUploader>
                  </Form.Item>
                </div>
              ))}
            </>
          )}

          <Form.Item
            name="phone"
            label="联系电话"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号' }
            ]}
          >
            <Input placeholder="请输入11位手机号" maxLength={11} clearable />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' }
            ]}
          >
            <Input placeholder="请输入邮箱地址" clearable />
          </Form.Item>

          <Form.Item name="wechat" label="微信号">
            <Input placeholder="选填" clearable />
          </Form.Item>

          <Form.Item
            name="city"
            label="所属城市"
            rules={[{ required: true, message: '请选择城市' }]}
            onClick={() => {
              setCityPickerVisible(true);
            }}
          >
            <Input
              placeholder="请选择省市"
              value={cityLabel}
              readOnly
              style={{ caretColor: 'transparent' }}
            />
          </Form.Item>

          <CascadePicker
            options={cityData}
            visible={cityPickerVisible}
            onClose={() => {
              setCityPickerVisible(false);
            }}
            value={cityValue}
            onConfirm={(val, extend) => {
              const labels = extend.items.map(item => item?.label).filter(Boolean);
              const cityText = labels.join(' - ');
              setCityLabel(cityText);
              // 将 PickerValue[] 转换为 (string | null)[]
              setCityValue(val.map(v => v !== null && v !== undefined ? String(v) : null));
              form.setFieldsValue({ city: cityText });
            }}
          />

          {/* 费用显示 */}
          <div className="total-fee-display">
            <div className="fee-label">会务费用总计：</div>
            <div className="fee-amount">¥ {totalFee.toLocaleString()}</div>
          </div>
        </Form>
      </Card>

      {/* 第三部分：附件上传 */}
      <Card className="section-card">
        <div className="section-title">
          <BankcardOutline fontSize={20} />
          <span>附件上传</span>
        </div>

        <div className="upload-section">
          <div className="upload-item">
            <h4>1. 您的港澳通行证</h4>
            <p className="upload-tip">建议上传参会者本人且在有效期内的港澳通行证正反面</p>
            <ImageUploader
              value={permitImages}
              onChange={setPermitImages}
              beforeUpload={beforeUpload}
              upload={async (file) => {
                const url = await uploadImage(file);
                return { url };
              }}
              maxCount={2}
            >
              <div className="upload-placeholder">
                点击上传港澳通行证
              </div>
            </ImageUploader>
          </div>

          <div className="upload-item">
            <h4>2. 付款截图 <span className="required-mark">*</span></h4>
            <p className="upload-tip">必须上传支付会务费用的转账截图</p>
            <ImageUploader
              value={paymentImages}
              onChange={setPaymentImages}
              beforeUpload={beforeUpload}
              upload={async (file) => {
                const url = await uploadImage(file);
                return { url };
              }}
              maxCount={1}
            >
              <div className="upload-placeholder">
                点击上传付款截图
              </div>
            </ImageUploader>
          </div>
        </div>
      </Card>

      {/* 第四部分：确认提交 */}
      <Card className="section-card">
        <div className="confirmation-section">
          <div className="warning-box">
            <ExclamationCircleFill fontSize={20} color="#ff4d4f" />
            <p>我已知晓本次会议举办地在香港，需在12月30号前办理完港澳通行证，如果因证件或自身其他原因未能成行已支付费用不予退还。</p>
          </div>
          
          <Checkbox
            checked={confirmed}
            onChange={setConfirmed}
            style={{ fontSize: 15, marginTop: 16 }}
          >
            <strong>确认我已知晓</strong>
          </Checkbox>
        </div>
      </Card>

      {/* 提交按钮 */}
      <div className="submit-wrapper">
        <Button
          block
          size="large"
          color="primary"
          disabled={!confirmed}
          loading={loading}
          onClick={() => form.submit()}
        >
          提交报名
        </Button>
      </div>
    </div>
  );
};

export default RegistrationForm;
