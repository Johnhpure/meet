#!/bin/bash

echo "======================================"
echo "拼好拼年会报名系统 - API测试脚本"
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

# 测试函数
test_api() {
    local name=$1
    local method=$2
    local url=$3
    local data=$4
    
    echo -n "测试 ${name}... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X ${method} "${BASE_URL}${url}")
    else
        response=$(curl -s -w "\n%{http_code}" -X ${method} "${BASE_URL}${url}" \
            -H "Content-Type: application/json" \
            -d "${data}")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ 成功${NC}"
        echo "  响应: $(echo $body | cut -c1-100)..."
    else
        echo -e "${RED}✗ 失败 (HTTP $http_code)${NC}"
        echo "  响应: $body"
    fi
    echo ""
}

echo -e "${YELLOW}1. 测试服务连通性${NC}"
echo "-----------------------------------"
curl -s http://localhost:3000 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 后端服务运行正常 (http://localhost:3000)${NC}"
else
    echo -e "${RED}✗ 后端服务无法访问${NC}"
    exit 1
fi
echo ""

curl -s http://localhost:5173 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 前端服务运行正常 (http://localhost:5173)${NC}"
else
    echo -e "${RED}✗ 前端服务无法访问${NC}"
fi
echo ""

echo -e "${YELLOW}2. 测试管理端API${NC}"
echo "-----------------------------------"
test_api "管理员登录" "POST" "/api/admin/login" '{"username":"admin","password":"admin123"}'
test_api "获取统计数据" "GET" "/api/admin/statistics"
test_api "获取报名列表" "GET" "/api/admin/registrations?page=1&pageSize=10"

echo -e "${YELLOW}3. 测试数据库连接${NC}"
echo "-----------------------------------"
mysql -h 127.0.0.1 -P 3306 -u root -pchenbang198859 pinhaopin_db -e "SELECT COUNT(*) as total FROM registrations;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 数据库连接正常${NC}"
else
    echo -e "${RED}✗ 数据库连接失败${NC}"
fi
echo ""

echo "======================================"
echo -e "${GREEN}测试完成！${NC}"
echo "======================================"
echo ""
echo "访问地址："
echo "  - 用户报名: http://localhost:5173/"
echo "  - 管理后台: http://localhost:5173/admin/login"
echo ""
echo "管理员账号："
echo "  - 用户名: admin"
echo "  - 密码: admin123"
echo ""
