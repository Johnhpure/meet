#!/bin/bash

# 拼好拼年会报名系统 - 局域网访问启动脚本

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

LAN_IP="192.168.1.8"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         拼好拼香港年会报名系统 - 启动中...                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# 检查是否在项目根目录
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}✗ 错误: 请在项目根目录运行此脚本${NC}"
    exit 1
fi

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ 错误: 未安装Node.js${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 启动前检查...${NC}"
echo "-----------------------------------"

# 检查后端依赖
echo -n "检查后端依赖... "
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ 缺失${NC}"
    echo "正在安装后端依赖..."
    cd backend && npm install && cd ..
fi

# 检查前端依赖
echo -n "检查前端依赖... "
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ 缺失${NC}"
    echo "正在安装前端依赖..."
    cd frontend && npm install && cd ..
fi

# 检查数据库
echo -n "检查数据库... "
if [ -f "backend/prisma/dev.db" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ 未找到数据库，正在初始化...${NC}"
    cd backend && npx prisma migrate dev && cd ..
fi

echo ""
echo -e "${YELLOW}🚀 启动服务...${NC}"
echo "-----------------------------------"

# 停止旧的进程
pkill -f "vite.*5173" 2>/dev/null
pkill -f "ts-node.*backend" 2>/dev/null
sleep 2

# 创建日志目录
mkdir -p logs

# 启动后端
echo "启动后端服务..."
cd backend
nohup npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo -e "${GREEN}✓ 后端启动 (PID: $BACKEND_PID)${NC}"

# 等待后端启动
echo -n "等待后端服务就绪..."
for i in {1..15}; do
    if curl -s http://${LAN_IP}:3000/api/admin/statistics > /dev/null 2>&1; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# 启动前端
echo "启动前端服务..."
cd frontend
nohup npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo -e "${GREEN}✓ 前端启动 (PID: $FRONTEND_PID)${NC}"

# 等待前端启动
echo -n "等待前端服务就绪..."
for i in {1..15}; do
    if curl -s http://${LAN_IP}:5173/ > /dev/null 2>&1; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                   🎉 启动成功！                                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${BLUE}📱 用户报名页面 (手机/电脑):${NC}"
echo "   http://${LAN_IP}:5173/"
echo ""
echo -e "${BLUE}👤 管理后台:${NC}"
echo "   http://${LAN_IP}:5173/admin/login"
echo "   用户名: admin"
echo "   密码: admin123"
echo ""
echo -e "${YELLOW}💡 使用提示:${NC}"
echo "   • 确保设备连接到同一WiFi网络"
echo "   • 手机访问会自动切换到移动端界面"
echo "   • 可以生成二维码方便手机扫码访问"
echo ""
echo -e "${YELLOW}📊 监控服务:${NC}"
echo "   查看后端日志: tail -f logs/backend.log"
echo "   查看前端日志: tail -f logs/frontend.log"
echo "   测试服务状态: bash test-lan-access.sh"
echo ""
echo -e "${YELLOW}🛑 停止服务:${NC}"
echo "   bash stop.sh"
echo ""

# 保存PID
echo "$BACKEND_PID" > logs/backend.pid
echo "$FRONTEND_PID" > logs/frontend.pid

echo -e "${GREEN}✓ 所有服务运行中...${NC}"
echo ""
