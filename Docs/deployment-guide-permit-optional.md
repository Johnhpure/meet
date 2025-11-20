# 港澳通行证可选化功能 - 部署指南

**版本**: 1.0  
**更新日期**: 2025-11-20  
**适用环境**: 开发/测试/生产  

---

## 📋 快速部署检查清单

```
[ ] 1. 阅读完整的迁移文档
[ ] 2. 备份生产数据库
[ ] 3. 运行数据安全检查脚本
[ ] 4. 在测试环境验证功能
[ ] 5. 部署前端代码
[ ] 6. 执行数据库迁移
[ ] 7. 部署后端代码
[ ] 8. 验证功能正常
[ ] 9. 监控错误日志
[ ] 10. 准备回滚方案
```

---

## 🚀 一键部署脚本

### 开发环境部署

```bash
#!/bin/bash
# 开发环境一键部署脚本

cd /home/chenbang/app/pinhaopin

echo "=== 1. 拉取最新代码 ==="
git pull origin main

echo "=== 2. 安装依赖 ==="
cd backend && npm install
cd ../frontend && npm install

echo "=== 3. 编译前端 ==="
cd ../frontend && npm run build

echo "=== 4. 编译后端 ==="
cd ../backend && npm run build

echo "=== 5. 运行数据库迁移 ==="
cd backend && npx prisma migrate deploy

echo "=== 6. 重启服务 ==="
pm2 restart pinhaopin-backend
pm2 restart pinhaopin-frontend

echo "=== 7. 检查服务状态 ==="
pm2 status

echo "✓ 部署完成！"
```

### 生产环境分步部署

```bash
#!/bin/bash
# 生产环境安全部署脚本

set -e  # 遇到错误立即退出

PROJECT_DIR="/home/chenbang/app/pinhaopin"
BACKUP_DIR="$PROJECT_DIR/database_backup"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "=========================================="
echo "  港澳通行证可选化 - 生产环境部署"
echo "=========================================="

# Step 1: 数据库备份
echo -e "\n[1/8] 备份数据库..."
mkdir -p "$BACKUP_DIR"
cd "$PROJECT_DIR/backend"

DB_NAME=$(grep DATABASE_URL .env | cut -d'/' -f4 | cut -d'?' -f1)
BACKUP_FILE="$BACKUP_DIR/backup_before_permit_optional_$TIMESTAMP.sql"

mysqldump -u root -p "$DB_NAME" > "$BACKUP_FILE"
gzip "$BACKUP_FILE"

echo "✓ 备份完成: ${BACKUP_FILE}.gz"
echo "  大小: $(du -h ${BACKUP_FILE}.gz | cut -f1)"

# Step 2: 运行安全检查
echo -e "\n[2/8] 运行数据安全检查..."
cd "$PROJECT_DIR/backend"
bash scripts/check-permit-migration.sh

echo "请确认检查结果无误后按 Enter 继续，或按 Ctrl+C 取消..."
read

# Step 3: 停止服务（可选，根据实际情况调整）
echo -e "\n[3/8] 准备部署..."
echo "是否需要停止服务进行维护? (y/n)"
read STOP_SERVICE

if [ "$STOP_SERVICE" = "y" ]; then
    pm2 stop pinhaopin-backend
    pm2 stop pinhaopin-frontend
    echo "✓ 服务已停止"
fi

# Step 4: 拉取代码
echo -e "\n[4/8] 拉取最新代码..."
cd "$PROJECT_DIR"
git pull origin main
echo "✓ 代码更新完成"

# Step 5: 安装依赖和编译
echo -e "\n[5/8] 编译项目..."
cd "$PROJECT_DIR/backend" && npm install && npm run build
cd "$PROJECT_DIR/frontend" && npm install && npm run build
echo "✓ 编译完成"

# Step 6: 执行数据库迁移
echo -e "\n[6/8] 执行数据库迁移..."
cd "$PROJECT_DIR/backend"
npx prisma migrate deploy
echo "✓ 数据库迁移完成"

# Step 7: 重启服务
echo -e "\n[7/8] 重启服务..."
pm2 restart pinhaopin-backend
pm2 restart pinhaopin-frontend
sleep 3
echo "✓ 服务已重启"

# Step 8: 验证服务
echo -e "\n[8/8] 验证服务状态..."
pm2 status

echo -e "\n=========================================="
echo "✓ 部署完成！"
echo "=========================================="
echo ""
echo "后续步骤："
echo "1. 访问前端页面测试报名功能（不上传港澳通行证）"
echo "2. 检查管理后台是否正常显示"
echo "3. 监控错误日志: pm2 logs pinhaopin-backend --lines 50"
echo ""
echo "回滚命令（如需）："
echo "  zcat ${BACKUP_FILE}.gz | mysql -u root -p $DB_NAME"
echo ""
```

保存为 `deploy-permit-optional.sh` 并执行：
```bash
chmod +x deploy-permit-optional.sh
./deploy-permit-optional.sh
```

---

## 🔍 部署前检查

### 1. 运行数据安全检查脚本

```bash
cd /home/chenbang/app/pinhaopin/backend
bash scripts/check-permit-migration.sh
```

**检查要点**：
- ✅ 数据库连接正常
- ✅ registrations 表存在
- ✅ 查看现有数据量
- ✅ 确认字段约束状态

### 2. 检查代码变更

```bash
cd /home/chenbang/app/pinhaopin
git status
git diff
```

**变更文件清单**：
```
frontend/src/pages/RegistrationForm.tsx    # 前端表单验证
frontend/src/pages/AdminDashboard.tsx      # 管理后台展示
backend/prisma/schema.prisma               # 数据库模型
backend/src/types/index.ts                 # 类型定义
backend/prisma/migrations/20251120031035_make_permit_optional/
```

### 3. 验证编译通过

```bash
# 前端编译
cd frontend && npm run build

# 后端编译
cd ../backend && npm run build
```

---

## 📦 部署步骤详解

### 步骤 1: 数据库备份（必须！）

```bash
cd /home/chenbang/app/pinhaopin

# 创建备份目录
mkdir -p database_backup

# 备份数据库
mysqldump -u root -p pinhaopin_db > database_backup/backup_$(date +%Y%m%d_%H%M%S).sql

# 压缩备份文件
gzip database_backup/backup_*.sql

# 验证备份文件
ls -lh database_backup/
```

### 步骤 2: 部署前端

```bash
cd /home/chenbang/app/pinhaopin/frontend

# 安装依赖（如有新增）
npm install

# 编译生产版本
npm run build

# 如使用 PM2 重启
pm2 restart pinhaopin-frontend

# 或如使用静态文件服务
# cp -r dist/* /var/www/pinhaopin/
```

### 步骤 3: 执行数据库迁移

```bash
cd /home/chenbang/app/pinhaopin/backend

# 方式 1: 使用 Prisma 迁移（推荐）
npx prisma migrate deploy

# 方式 2: 手动执行 SQL（不推荐）
# mysql -u root -p pinhaopin_db < prisma/migrations/20251120031035_make_permit_optional/migration.sql
```

**迁移说明**：
- 执行的 SQL: `ALTER TABLE registrations MODIFY permitImageUrl VARCHAR(255) NULL;`
- 影响：将 `permitImageUrl` 字段从 NOT NULL 改为 NULL
- 风险：低（仅放宽约束，不影响现有数据）

### 步骤 4: 部署后端

```bash
cd /home/chenbang/app/pinhaopin/backend

# 安装依赖（如有新增）
npm install

# 编译 TypeScript
npm run build

# 重新生成 Prisma Client（迁移后必须执行）
npx prisma generate

# 重启后端服务
pm2 restart pinhaopin-backend

# 或使用 npm
# npm run start
```

---

## ✅ 部署后验证

### 1. 功能验证清单

#### 前端报名表单
- [ ] 访问报名页面: http://localhost:5173
- [ ] 不上传港澳通行证可以提交
- [ ] 上传港澳通行证可以正常保存
- [ ] 携带人员不上传港澳通行证可以提交
- [ ] 表单提示文字已更新为"建议上传"

#### 管理后台
- [ ] 访问管理后台: http://localhost:5173/admin
- [ ] 查看有港澳通行证的历史记录 - 图片正常显示
- [ ] 查看无港澳通行证的新记录 - 显示"未上传"占位符
- [ ] 携带人员的港澳通行证展示正常

#### 数据库验证
```bash
# 检查字段约束
mysql -u root -p pinhaopin_db -e "SHOW COLUMNS FROM registrations LIKE 'permitImageUrl';"

# 预期输出：Null 列显示 YES

# 测试插入空值记录
mysql -u root -p pinhaopin_db -e "
INSERT INTO registrations (
  name, idCard, gender, phone, email, city, position, 
  paymentImageUrl, attendanceType, createdAt, updatedAt
) VALUES (
  '测试用户', '999999999999999999', '男', '13800000000', 
  'test@example.com', '测试市', '测试岗位', 
  'http://example.com/payment.jpg', '选项1', NOW(), NOW()
);"

# 查询测试记录
mysql -u root -p pinhaopin_db -e "
SELECT id, name, permitImageUrl 
FROM registrations 
WHERE name = '测试用户';"

# 清理测试数据
mysql -u root -p pinhaopin_db -e "
DELETE FROM registrations WHERE name = '测试用户';"
```

### 2. 性能验证

```bash
# 查看服务状态
pm2 status

# 查看最近日志
pm2 logs pinhaopin-backend --lines 50

# 监控内存和 CPU
pm2 monit
```

### 3. 错误日志检查

```bash
# 后端日志
tail -f /home/chenbang/app/pinhaopin/backend/backend.log

# PM2 日志
pm2 logs pinhaopin-backend --err --lines 100

# 数据库错误日志（如有）
tail -f /var/log/mysql/error.log
```

---

## 🔄 回滚方案

### 何时需要回滚？
- ❌ 数据库迁移失败
- ❌ 前端功能异常无法修复
- ❌ 后端服务无法启动
- ❌ 数据完整性问题

### 回滚步骤

#### 1. 停止服务
```bash
pm2 stop pinhaopin-backend
pm2 stop pinhaopin-frontend
```

#### 2. 恢复数据库
```bash
# 查找备份文件
ls -lh /home/chenbang/app/pinhaopin/database_backup/

# 恢复数据库
zcat /home/chenbang/app/pinhaopin/database_backup/backup_20251120_*.sql.gz | mysql -u root -p pinhaopin_db

# 或不解压直接恢复
gunzip -c backup_file.sql.gz | mysql -u root -p pinhaopin_db
```

#### 3. 回滚代码
```bash
cd /home/chenbang/app/pinhaopin

# 查看提交历史
git log --oneline -5

# 回滚到上一个版本
git reset --hard HEAD~1

# 或回滚到指定版本
# git reset --hard <commit-hash>

# 重新编译
cd frontend && npm run build
cd ../backend && npm run build
```

#### 4. 重启服务
```bash
pm2 restart pinhaopin-backend
pm2 restart pinhaopin-frontend
pm2 status
```

#### 5. 验证回滚
```bash
# 检查字段约束是否恢复为 NOT NULL
mysql -u root -p pinhaopin_db -e "SHOW COLUMNS FROM registrations LIKE 'permitImageUrl';"

# 测试前端表单是否恢复必填验证
# 访问报名页面，尝试不上传港澳通行证提交
```

---

## 🐛 常见问题排查

### 问题 1: 数据库迁移失败

**错误信息**:
```
Error: P3009: Failed to apply migration
```

**解决方案**:
```bash
# 1. 检查数据库连接
cd backend
npx prisma db push --preview-feature

# 2. 手动执行 SQL
mysql -u root -p pinhaopin_db -e "ALTER TABLE registrations MODIFY permitImageUrl VARCHAR(255) NULL;"

# 3. 标记迁移为已执行
npx prisma migrate resolve --applied 20251120031035_make_permit_optional
```

### 问题 2: 前端显示图片加载失败

**原因**: permitImageUrl 为空但仍尝试加载图片

**解决方案**: 
- 已在 AdminDashboard.tsx 中添加空值判断
- 确保前端代码已更新并重新编译

### 问题 3: 后端 TypeScript 类型错误

**错误信息**:
```
Type 'string | undefined' is not assignable to type 'string'
```

**解决方案**:
```bash
# 1. 确认类型定义已更新
cat backend/src/types/index.ts | grep permitImageUrl

# 应显示: permitImageUrl?: string;

# 2. 重新生成 Prisma Client
cd backend
npx prisma generate

# 3. 重新编译
npm run build
```

### 问题 4: 历史数据显示异常

**症状**: 管理后台显示历史记录的港澳通行证为"未上传"

**排查**:
```bash
# 检查数据库中的实际数据
mysql -u root -p pinhaopin_db -e "
SELECT id, name, permitImageUrl 
FROM registrations 
LIMIT 10;"

# 检查 URL 是否为空或无效
mysql -u root -p pinhaopin_db -e "
SELECT COUNT(*) as count, 
  CASE 
    WHEN permitImageUrl IS NULL THEN 'NULL'
    WHEN permitImageUrl = '' THEN 'EMPTY'
    ELSE 'VALID'
  END as status
FROM registrations
GROUP BY status;"
```

---

## 📊 监控指标

### 部署后需要监控的指标

1. **服务可用性**
   - 前端页面是否可访问
   - 后端 API 是否响应
   - 响应时间是否正常

2. **错误率**
   ```bash
   # 统计最近 1 小时的错误日志
   grep -i error /home/chenbang/app/pinhaopin/backend/backend.log | tail -100
   
   # 使用 PM2 查看错误
   pm2 logs pinhaopin-backend --err --lines 100
   ```

3. **数据完整性**
   ```bash
   # 每小时检查一次
   mysql -u root -p pinhaopin_db -e "
   SELECT 
     COUNT(*) as total,
     COUNT(permitImageUrl) as with_permit,
     COUNT(*) - COUNT(permitImageUrl) as without_permit
   FROM registrations
   WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 1 HOUR);"
   ```

4. **用户反馈**
   - 关注用户报告的问题
   - 检查是否有报名失败的情况

---

## 📝 部署记录模板

```
========================================
部署记录
========================================
部署时间: _________________
部署人员: _________________
部署环境: [ ] 开发 [ ] 测试 [ ] 生产

备份信息:
- 数据库备份文件: _________________
- 备份大小: _________________
- 备份时间: _________________

迁移执行:
- 迁移脚本版本: 20251120031035_make_permit_optional
- 执行时间: _________________
- 影响记录数: _________________

验证结果:
[ ] 前端表单可以不上传港澳通行证提交
[ ] 管理后台正常显示历史数据
[ ] 管理后台正确处理空值显示
[ ] 数据库字段约束已修改为 NULL
[ ] 服务运行正常，无错误日志

问题记录:
_________________________________
_________________________________

备注:
_________________________________
_________________________________

签名: _________________
========================================
```

---

## 📚 相关文档

- [数据库迁移详细文档](./database-migration-20251120.md)
- [数据安全检查脚本](../backend/scripts/check-permit-migration.sh)
- [项目 README](../README.md)

---

**文档版本**: 1.0  
**最后更新**: 2025-11-20  
**维护人员**: 开发团队
