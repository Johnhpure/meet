import React from 'react';
import { Result, Button } from 'antd';
import { Result as MobileResult, Button as MobileButton } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { isMobile } from '../utils/device';

const Success: React.FC = () => {
  const navigate = useNavigate();
  const mobile = isMobile();

  if (mobile) {
    return (
      <div style={{ padding: '40px 16px', textAlign: 'center' }}>
        <MobileResult
          status="success"
          title="报名成功"
          description="您的报名信息已提交，我们会尽快与您联系确认"
        />
        <MobileButton color="primary" onClick={() => navigate('/')} style={{ marginTop: 24 }}>
          返回首页
        </MobileButton>
      </div>
    );
  }

  return (
    <div className="desktop-layout">
      <Result
        status="success"
        title="报名成功！"
        subTitle="您的报名信息已提交，我们会尽快与您联系确认。"
        extra={[
          <Button type="primary" key="home" onClick={() => navigate('/')}>
            返回首页
          </Button>,
        ]}
      />
    </div>
  );
};

export default Success;
