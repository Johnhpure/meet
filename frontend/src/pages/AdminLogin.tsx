import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { adminApi } from '../services/api';

const AdminLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = { username: '', password: '' };
    let isValid = true;

    if (!username.trim()) {
      newErrors.username = '请输入用户名';
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = '请输入密码';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await adminApi.login(username, password);
      toast.success('登录成功');
      localStorage.setItem('admin', 'true');
      navigate('/admin/dashboard');
    } catch (error: any) {
      toast.error(error.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden'
      }}>
        {/* 头部 */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px 32px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'white',
            borderRadius: '50%',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#667eea" 
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h1 style={{
            color: 'white',
            fontSize: '28px',
            fontWeight: 'bold',
            margin: '0 0 8px 0',
            letterSpacing: '1px'
          }}>
            管理后台
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px',
            margin: 0
          }}>
            拼好拼香港年会报名系统
          </p>
        </div>

        {/* 表单 */}
        <div style={{ padding: '32px' }}>
          <form onSubmit={onSubmit}>
            {/* 用户名 */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px'
              }}>
                用户名
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '12px 16px 12px 44px',
                    fontSize: '15px',
                    border: errors.username ? '2px solid #ff4d4f' : '2px solid #e0e0e0',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'all 0.3s',
                    backgroundColor: '#fafafa'
                  }}
                  onFocus={(e) => {
                    if (!errors.username) {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.backgroundColor = 'white';
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.username) {
                      e.target.style.borderColor = '#e0e0e0';
                      e.target.style.backgroundColor = '#fafafa';
                    }
                  }}
                />
                <svg 
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '20px',
                    height: '20px'
                  }}
                  fill="none" 
                  stroke="#999" 
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              {errors.username && (
                <p style={{
                  color: '#ff4d4f',
                  fontSize: '13px',
                  marginTop: '6px',
                  marginLeft: '4px'
                }}>
                  {errors.username}
                </p>
              )}
            </div>

            {/* 密码 */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px'
              }}>
                密码
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '12px 16px 12px 44px',
                    fontSize: '15px',
                    border: errors.password ? '2px solid #ff4d4f' : '2px solid #e0e0e0',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'all 0.3s',
                    backgroundColor: '#fafafa'
                  }}
                  onFocus={(e) => {
                    if (!errors.password) {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.backgroundColor = 'white';
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.password) {
                      e.target.style.borderColor = '#e0e0e0';
                      e.target.style.backgroundColor = '#fafafa';
                    }
                  }}
                />
                <svg 
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '20px',
                    height: '20px'
                  }}
                  fill="none" 
                  stroke="#999" 
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              {errors.password && (
                <p style={{
                  color: '#ff4d4f',
                  fontSize: '13px',
                  marginTop: '6px',
                  marginLeft: '4px'
                }}>
                  {errors.password}
                </p>
              )}
            </div>

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '50px',
                background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)',
                letterSpacing: '1px'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                }
              }}
            >
              {loading ? '登录中...' : '登 录'}
            </button>
          </form>

          {/* 默认账号提示 */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#f0f5ff',
            borderRadius: '8px',
            borderLeft: '4px solid #667eea'
          }}>
            <p style={{
              fontSize: '13px',
              color: '#666',
              margin: '0 0 8px 0',
              fontWeight: '600'
            }}>
              💡 默认账号
            </p>
            <p style={{
              fontSize: '13px',
              color: '#666',
              margin: '4px 0'
            }}>
              用户名：<span style={{ fontWeight: 'bold', color: '#333' }}>admin</span>
            </p>
            <p style={{
              fontSize: '13px',
              color: '#666',
              margin: '4px 0'
            }}>
              密码：<span style={{ fontWeight: 'bold', color: '#333' }}>admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
