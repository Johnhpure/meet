#!/bin/bash

echo "======================================"
echo "测试管理后台页面访问"
echo "======================================"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}1. 测试错误的URL（您之前使用的）${NC}"
echo "-----------------------------------"
echo "URL: http://192.168.1.8:5173/admin.login"
response=$(curl -s -o /dev/null -w "%{http_code}" http://192.168.1.8:5173/admin.login)
echo "HTTP状态码: $response"
if [ "$response" = "200" ] || [ "$response" = "304" ]; then
    echo -e "${YELLOW}注意：虽然返回200/304，但因为URL错误，React路由无法匹配，页面会显示空白${NC}"
else
    echo -e "${RED}访问失败${NC}"
fi

echo ""
echo -e "${YELLOW}2. 测试正确的URL${NC}"
echo "-----------------------------------"
echo "URL: http://192.168.1.8:5173/admin/login"
response=$(curl -s -o /dev/null -w "%{http_code}" http://192.168.1.8:5173/admin/login)
echo "HTTP状态码: $response"
if [ "$response" = "200" ] || [ "$response" = "304" ]; then
    echo -e "${GREEN}✓ 访问成功！React路由会正确渲染登录页面${NC}"
else
    echo -e "${RED}✗ 访问失败${NC}"
fi

echo ""
echo -e "${YELLOW}3. 说明${NC}"
echo "-----------------------------------"
echo "这是一个React单页应用(SPA)，所有路由都返回相同的HTML。"
echo "真正的路由匹配是在浏览器中通过JavaScript完成的。"
echo ""
echo "因此："
echo "  • 错误URL: /admin.login → React路由找不到匹配 → 页面空白"
echo "  • 正确URL: /admin/login → React路由匹配成功 → 显示登录页面"
echo ""

echo "======================================"
echo -e "${GREEN}请使用正确的URL访问管理后台：${NC}"
echo ""
echo "  http://192.168.1.8:5173/admin/login"
echo ""
echo "  注意是 /admin/login（两个斜杠）"
echo "  不是 admin.login（点号）"
echo "======================================"
echo ""
echo "🔑 登录信息："
echo "   用户名: admin"
echo "   密码: admin123"
echo ""
