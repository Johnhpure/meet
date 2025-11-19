#!/bin/bash

# 停止服务脚本

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║            停止拼好拼年会报名系统服务...                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# 从PID文件停止
if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    echo -n "停止后端服务 (PID: $BACKEND_PID)... "
    if kill $BACKEND_PID 2>/dev/null; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠ 进程不存在${NC}"
    fi
    rm -f logs/backend.pid
fi

if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    echo -n "停止前端服务 (PID: $FRONTEND_PID)... "
    if kill $FRONTEND_PID 2>/dev/null; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠ 进程不存在${NC}"
    fi
    rm -f logs/frontend.pid
fi

# 备用方案：按进程名查找并停止
echo -n "清理残留进程... "
pkill -f "vite.*5173" 2>/dev/null
pkill -f "ts-node.*backend" 2>/dev/null
pkill -f "node.*backend" 2>/dev/null
echo -e "${GREEN}✓${NC}"

echo ""
echo -e "${GREEN}✓ 所有服务已停止${NC}"
echo ""
