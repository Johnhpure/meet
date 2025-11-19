#!/bin/bash

# 局域网访问测试脚本

echo "======================================"
echo "拼好拼年会报名系统 - 局域网访问测试"
echo "======================================"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

LAN_IP="192.168.1.8"

echo -e "${YELLOW}1. 检查服务状态${NC}"
echo "-----------------------------------"

# 检查后端
echo -n "后端服务 (http://${LAN_IP}:3000)... "
if curl -s -f http://${LAN_IP}:3000/api/admin/statistics > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 运行正常${NC}"
else
    echo -e "${RED}✗ 无法访问${NC}"
fi

# 检查前端
echo -n "前端服务 (http://${LAN_IP}:5173)... "
if curl -s -f http://${LAN_IP}:5173/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 运行正常${NC}"
else
    echo -e "${RED}✗ 无法访问${NC}"
fi

echo ""
echo -e "${YELLOW}2. 检查端口监听${NC}"
echo "-----------------------------------"
netstat -tlnp 2>/dev/null | grep -E ":3000|:5173" || ss -tlnp | grep -E ":3000|:5173"

echo ""
echo -e "${YELLOW}3. 网络接口信息${NC}"
echo "-----------------------------------"
ip addr show | grep -E "inet " | grep -v "127.0.0.1"

echo ""
echo -e "${YELLOW}4. 测试API接口${NC}"
echo "-----------------------------------"

# 测试登录接口
echo -n "测试管理员登录... "
login_response=$(curl -s -X POST http://${LAN_IP}:3000/api/admin/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}')
if echo "$login_response" | grep -q '"code":200'; then
    echo -e "${GREEN}✓ 成功${NC}"
else
    echo -e "${RED}✗ 失败${NC}"
fi

# 测试统计接口
echo -n "测试统计数据接口... "
stats_response=$(curl -s http://${LAN_IP}:3000/api/admin/statistics)
if echo "$stats_response" | grep -q '"code":200'; then
    echo -e "${GREEN}✓ 成功${NC}"
    echo "  数据: $(echo $stats_response | cut -c1-80)..."
else
    echo -e "${RED}✗ 失败${NC}"
fi

echo ""
echo "======================================"
echo -e "${GREEN}测试完成！${NC}"
echo "======================================"
echo ""
echo "🌐 访问地址："
echo ""
echo "  📱 用户端（报名）:"
echo "     http://${LAN_IP}:5173/"
echo ""
echo "  👤 管理端（后台）:"
echo "     http://${LAN_IP}:5173/admin/login"
echo "     用户名: admin"
echo "     密码: admin123"
echo ""
echo "💡 提示："
echo "  1. 确保设备连接到同一局域网"
echo "  2. 在浏览器中输入上述地址"
echo "  3. 手机访问时会自动适配移动端界面"
echo ""
echo "📱 二维码生成（可选）："
echo "  可以使用在线工具生成二维码："
echo "  https://cli.im/ 或 https://www.qr-code-generator.com/"
echo "  将 http://${LAN_IP}:5173/ 生成二维码"
echo "  手机扫码即可快速访问"
echo ""
