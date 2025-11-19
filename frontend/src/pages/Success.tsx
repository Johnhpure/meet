import React from 'react';
import { Button, Card, CardBody } from '@heroui/react';
import { useNavigate } from 'react-router-dom';

const Success: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="max-w-lg w-full shadow-xl">
        <CardBody className="p-8 md:p-12 text-center">
          {/* 成功图标 */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-success-100 rounded-full">
              <svg 
                className="w-12 h-12 text-success-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
          </div>

          {/* 标题 */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            报名成功！
          </h1>

          {/* 描述 */}
          <p className="text-gray-600 mb-8 text-base md:text-lg">
            您的报名信息已提交，我们会尽快与您联系确认。
          </p>

          {/* 返回按钮 */}
          <Button 
            color="primary" 
            size="lg"
            className="w-full sm:w-auto px-8"
            onPress={() => navigate('/')}
          >
            返回首页
          </Button>
        </CardBody>
      </Card>
    </div>
  );
};

export default Success;
