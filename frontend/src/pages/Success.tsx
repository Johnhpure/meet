import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Success.css';

const Success: React.FC = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100);
    setTimeout(() => setShowConfetti(true), 300);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  // 生成随机礼花粒子
  const confettiParticles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'][Math.floor(Math.random() * 6)]
  }));

  return (
    <div className="success-page">
      {/* 背景装饰圆圈 */}
      <div className="background-circle-1" />
      <div className="background-circle-2" />

      {/* 礼花效果 */}
      {showConfetti && (
        <div className="confetti-container">
          {confettiParticles.map((particle) => (
            <div
              key={particle.id}
              className="confetti-particle"
              style={{
                left: `${particle.left}%`,
                backgroundColor: particle.color,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* 主内容卡片 */}
      <div className={`success-content ${showContent ? 'visible' : ''}`}>
        <div className="success-card">
          {/* 顶部装饰带 */}
          <div className="card-header-strip" />
          
          <div className="card-body">
            {/* 成功图标 */}
            <div className="icon-container">
              <div className="icon-wrapper">
                {/* 外圈脉冲光晕 */}
                <div className="icon-pulse" />
                
                {/* 主图标圆圈 */}
                <div className="icon-circle">
                  {/* 对勾图标 */}
                  <svg 
                    className="check-icon"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* 主标题 */}
            <h1 className="main-title">
              🎉 报名成功！
            </h1>

            {/* 副标题 */}
            <p className="subtitle">
              您的报名信息已成功提交，我们会尽快与您联系
            </p>

            {/* 信息卡片 */}
            <div className="info-card">
              <div className="info-items">
                {/* 信息项1 */}
                <div className="info-item">
                  <div className="info-icon green">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="info-content">
                    <p className="info-title">信息已录入系统</p>
                    <p className="info-description">我们已收到您的报名信息，正在处理中</p>
                  </div>
                </div>

                {/* 信息项2 */}
                <div className="info-item">
                  <div className="info-icon blue">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <div className="info-content">
                    <p className="info-title">邮件/短信通知</p>
                    <p className="info-description">确认信息将发送至您预留的联系方式</p>
                  </div>
                </div>

                {/* 信息项3 */}
                <div className="info-item">
                  <div className="info-icon purple">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="info-content">
                    <p className="info-title">活动准备中</p>
                    <p className="info-description">请保持联系方式畅通，等待进一步通知</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 温馨提示 */}
            <div className="notice-box">
              <div className="notice-content">
                <svg className="notice-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="notice-text">
                  <p className="notice-title">温馨提示</p>
                  <p className="notice-description">如需修改报名信息或有任何疑问，请及时联系活动组织方</p>
                </div>
              </div>
            </div>

            {/* 按钮组 */}
            <div className="button-group">
              <button
                className="action-button primary"
                onClick={() => navigate('/')}
              >
                <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                返回首页
              </button>
              
              <button
                className="action-button secondary"
                onClick={() => navigate('/admin/login')}
              >
                <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                查看报名
              </button>
            </div>
          </div>
        </div>

        {/* 底部装饰文字 */}
        <p className="footer-text">
          感谢您的报名，期待与您相见！✨
        </p>
      </div>
    </div>
  );
};

export default Success;
