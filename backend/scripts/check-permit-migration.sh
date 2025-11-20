#!/bin/bash

# 数据库迁移安全检查脚本
# 用途：检查港澳通行证字段迁移的数据完整性和影响范围

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 数据库连接信息（从环境变量读取）
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-pinhaopin_db}"
DB_USER="${DB_USER:-root}"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  港澳通行证字段迁移 - 数据安全检查${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# 提示输入密码
echo -e "${YELLOW}请输入数据库密码:${NC}"
read -s DB_PASS

# 测试数据库连接
echo -e "\n${BLUE}[1/6] 测试数据库连接...${NC}"
if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -e "USE $DB_NAME;" 2>/dev/null; then
    echo -e "${GREEN}✓ 数据库连接成功${NC}"
else
    echo -e "${RED}✗ 数据库连接失败，请检查配置${NC}"
    exit 1
fi

# 检查表是否存在
echo -e "\n${BLUE}[2/6] 检查数据表...${NC}"
TABLE_EXISTS=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -sN -e "SHOW TABLES LIKE 'registrations';")
if [ -z "$TABLE_EXISTS" ]; then
    echo -e "${RED}✗ registrations 表不存在${NC}"
    exit 1
else
    echo -e "${GREEN}✓ registrations 表存在${NC}"
fi

# 检查字段约束
echo -e "\n${BLUE}[3/6] 检查 permitImageUrl 字段约束...${NC}"
FIELD_INFO=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -sN -e "SHOW COLUMNS FROM registrations LIKE 'permitImageUrl';")
if echo "$FIELD_INFO" | grep -q "YES"; then
    echo -e "${GREEN}✓ permitImageUrl 字段已设置为可空 (NULL)${NC}"
    MIGRATED=true
else
    echo -e "${YELLOW}⚠ permitImageUrl 字段当前为必填 (NOT NULL)${NC}"
    MIGRATED=false
fi

# 统计数据
echo -e "\n${BLUE}[4/6] 统计现有数据...${NC}"
STATS=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -sN -e "
SELECT 
  COUNT(*) as total,
  COUNT(permitImageUrl) as with_permit,
  SUM(CASE WHEN permitImageUrl IS NULL THEN 1 ELSE 0 END) as null_count,
  SUM(CASE WHEN permitImageUrl = '' THEN 1 ELSE 0 END) as empty_count
FROM registrations;")

TOTAL=$(echo $STATS | awk '{print $1}')
WITH_PERMIT=$(echo $STATS | awk '{print $2}')
NULL_COUNT=$(echo $STATS | awk '{print $3}')
EMPTY_COUNT=$(echo $STATS | awk '{print $4}')

echo -e "  总记录数: ${GREEN}$TOTAL${NC}"
echo -e "  有港澳通行证: ${GREEN}$WITH_PERMIT${NC}"
echo -e "  NULL 值记录: ${YELLOW}$NULL_COUNT${NC}"
echo -e "  空字符串记录: ${YELLOW}$EMPTY_COUNT${NC}"

# 数据完整性检查
echo -e "\n${BLUE}[5/6] 数据完整性检查...${NC}"
if [ "$TOTAL" -eq 0 ]; then
    echo -e "${YELLOW}⚠ 数据库中暂无报名记录${NC}"
elif [ "$MIGRATED" = true ]; then
    if [ "$NULL_COUNT" -gt 0 ] || [ "$EMPTY_COUNT" -gt 0 ]; then
        echo -e "${YELLOW}⚠ 发现 $((NULL_COUNT + EMPTY_COUNT)) 条记录没有港澳通行证${NC}"
    else
        echo -e "${GREEN}✓ 所有历史记录的港澳通行证字段均有值${NC}"
    fi
else
    if [ "$TOTAL" -eq "$WITH_PERMIT" ]; then
        echo -e "${GREEN}✓ 所有记录的港澳通行证字段均有值${NC}"
        echo -e "${GREEN}✓ 可以安全执行迁移${NC}"
    else
        echo -e "${RED}✗ 发现异常：存在没有港澳通行证的记录但字段仍为 NOT NULL${NC}"
    fi
fi

# 生成详细报告
echo -e "\n${BLUE}[6/6] 生成详细报告...${NC}"
REPORT_FILE="migration-check-report-$(date +%Y%m%d_%H%M%S).txt"

cat > "$REPORT_FILE" << EOF
========================================
港澳通行证字段迁移检查报告
========================================
检查时间: $(date '+%Y-%m-%d %H:%M:%S')
数据库: $DB_NAME
主机: $DB_HOST:$DB_PORT

字段状态:
- 字段名: permitImageUrl
- 当前约束: $(if [ "$MIGRATED" = true ]; then echo "NULL (已迁移)"; else echo "NOT NULL (未迁移)"; fi)

数据统计:
- 总记录数: $TOTAL
- 有港澳通行证: $WITH_PERMIT
- NULL 值记录: $NULL_COUNT
- 空字符串记录: $EMPTY_COUNT

结论:
$(if [ "$MIGRATED" = true ]; then
    echo "✓ 迁移已完成，字段约束已修改为可空"
    if [ "$NULL_COUNT" -gt 0 ] || [ "$EMPTY_COUNT" -gt 0 ]; then
        echo "⚠ 存在没有港澳通行证的记录，这是正常的新增数据"
    else
        echo "✓ 所有历史数据完整，无空值记录"
    fi
else
    echo "⚠ 迁移尚未执行"
    if [ "$TOTAL" -eq "$WITH_PERMIT" ]; then
        echo "✓ 所有记录均有港澳通行证数据，可以安全迁移"
    else
        echo "✗ 发现数据异常，建议先检查数据完整性"
    fi
fi)

建议操作:
$(if [ "$MIGRATED" = false ]; then
    echo "1. 备份数据库: mysqldump -u root -p $DB_NAME > backup_$(date +%Y%m%d).sql"
    echo "2. 执行迁移: cd backend && npx prisma migrate deploy"
    echo "3. 重新运行本脚本验证迁移结果"
elif [ "$NULL_COUNT" -eq 0 ] && [ "$EMPTY_COUNT" -eq 0 ]; then
    echo "✓ 数据完整，无需额外操作"
else
    echo "⚠ 如需回滚，请先处理 NULL 值记录"
    echo "  参考文档: Docs/database-migration-20251120.md"
fi)

========================================
EOF

echo -e "${GREEN}✓ 报告已生成: $REPORT_FILE${NC}"
cat "$REPORT_FILE"

echo -e "\n${BLUE}================================================${NC}"
echo -e "${GREEN}检查完成！${NC}"
echo -e "${BLUE}================================================${NC}"

# 询问是否需要备份
if [ "$MIGRATED" = false ] && [ "$TOTAL" -gt 0 ]; then
    echo -e "\n${YELLOW}是否需要立即备份数据库? (y/n)${NC}"
    read -r BACKUP_CHOICE
    if [ "$BACKUP_CHOICE" = "y" ]; then
        BACKUP_FILE="backup_before_migration_$(date +%Y%m%d_%H%M%S).sql"
        echo -e "${BLUE}开始备份...${NC}"
        mysqldump -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_FILE"
        if [ $? -eq 0 ]; then
            gzip "$BACKUP_FILE"
            echo -e "${GREEN}✓ 备份完成: ${BACKUP_FILE}.gz${NC}"
            echo -e "${GREEN}✓ 备份大小: $(du -h ${BACKUP_FILE}.gz | cut -f1)${NC}"
        else
            echo -e "${RED}✗ 备份失败${NC}"
        fi
    fi
fi
