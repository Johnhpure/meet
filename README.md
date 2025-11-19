# 拼好拼香港年会报名系统

完整的前后端分离项目，支持用户在线报名和管理员后台管理。

## 技术栈

### 后端
- Node.js + Express
- TypeScript
- Prisma ORM
- MySQL

### 前端
- React 18
- Vite
- Ant Design（Web端）
- Ant Design Mobile（移动端）
- React Router

## 项目结构

```
pinhaopin/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── services/        # 业务逻辑
│   │   ├── middlewares/     # 中间件
│   │   ├── utils/           # 工具函数
│   │   ├── types/           # 类型定义
│   │   └── index.ts         # 入口文件
│   ├── prisma/
│   │   └── schema.prisma    # 数据库模型
│   └── package.json
├── frontend/                # 前端应用
│   ├── src/
│   │   ├── pages/           # 页面组件
│   │   ├── services/        # API服务
│   │   ├── utils/           # 工具函数
│   │   ├── types/           # 类型定义
│   │   ├── App.tsx          # 主应用
│   │   └── main.tsx         # 入口文件
│   └── package.json
└── docs/                    # 文档目录
```

## 快速开始

### 1. 环境要求

- Node.js >= 16
- MySQL >= 5.7
- npm 或 yarn

### 2. 数据库配置

创建MySQL数据库：
```sql
CREATE DATABASE pinhaopin_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 后端安装和启动

```bash
cd backend

# 复制环境变量配置
cp .env.example .env

# 编辑.env文件，配置数据库连接
# DATABASE_URL="mysql://[用户名]:[密码]@localhost:3306/pinhaopin_db"

# 安装依赖
npm install

# 生成Prisma客户端
npm run prisma:generate

# 运行数据库迁移
npm run prisma:migrate

# 启动开发服务器
npm run dev
```

后端服务将运行在 http://localhost:3000

### 4. 前端安装和启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端应用将运行在 http://localhost:5173

## 功能特性

### 用户端
- ✅ 响应式设计，自动适配H5和Web
- ✅ 完整的报名表单，包含13个字段
- ✅ 图片上传功能（港澳通行证、付款截图）
- ✅ 实时表单验证（身份证、手机号、邮箱）
- ✅ 重复报名检测
- ✅ 提交成功页面

### 管理端
- ✅ 管理员登录（默认账号，生产环境请修改）
- ✅ 报名数据统计（总人数、各选项人数）
- ✅ 报名列表查询（支持分页、搜索、筛选）
- ✅ 查看报名详情
- ✅ 删除报名记录
- ✅ 导出数据（可扩展）

## API接口

### 用户端接口

#### 提交报名
```
POST /api/registrations
Content-Type: application/json

{
  "name": "张三",
  "idCard": "110101199001011234",
  "gender": "男",
  "hasPlusOnes": false,
  "plusOnesCount": 0,
  "attendanceOption": 1,
  "phone": "13800138000",
  "email": "zhangsan@example.com",
  "wechat": "zhangsan_wx",
  "city": "北京",
  "position": "经理",
  "permitImageUrl": "/uploads/permit-xxx.jpg",
  "paymentImageUrl": "/uploads/payment-xxx.jpg"
}
```

#### 上传图片
```
POST /api/upload
Content-Type: multipart/form-data

file: <binary>
```

### 管理端接口

#### 登录
```
POST /api/admin/login
Content-Type: application/json

{
  "username": "管理员用户名",
  "password": "管理员密码"
}
```

#### 获取报名列表
```
GET /api/admin/registrations?page=1&pageSize=10&keyword=张三&attendanceOption=1
```

#### 获取报名详情
```
GET /api/admin/registrations/:id
```

#### 删除报名
```
DELETE /api/admin/registrations/:id
```

#### 获取统计数据
```
GET /api/admin/statistics
```

## 数据库模型

### Registration（报名记录）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int | 主键 |
| name | String | 姓名 |
| idCard | String | 身份证号（唯一） |
| gender | String | 性别 |
| hasPlusOnes | Boolean | 是否携带他人 |
| plusOnesCount | Int | 携带人数 |
| attendanceOption | Int | 参会方式（1/2/3） |
| phone | String | 手机号 |
| email | String | 邮箱 |
| wechat | String | 微信号（可选） |
| city | String | 城市 |
| position | String | 职务 |
| permitImageUrl | String | 通行证图片URL |
| paymentImageUrl | String | 付款截图URL |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

## 配置说明

### 后端环境变量（.env）

```env
# ⚠️ 以下为示例配置，请根据实际情况修改
DATABASE_URL="mysql://[用户名]:[密码]@localhost:3306/pinhaopin_db"
PORT=3000
NODE_ENV=development
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
ADMIN_USERNAME=管理员用户名
ADMIN_PASSWORD=管理员密码
```

## 开发指南

### 添加新的报名字段

1. 修改 `backend/prisma/schema.prisma` 添加字段
2. 运行 `npm run prisma:migrate` 生成迁移
3. 修改 `backend/src/types/index.ts` 添加类型定义
4. 修改前端 `frontend/src/types/index.ts` 添加类型定义
5. 在前端表单组件中添加表单项
6. 测试提交和显示

### 自定义验证规则

在 `backend/src/utils/validator.ts` 中添加验证函数，然后在控制器中使用。

## 构建部署

### 后端构建
```bash
cd backend
npm run build
npm start
```

### 前端构建
```bash
cd frontend
npm run build
# 构建产物在 dist/ 目录
```

## 常见问题

### 数据库连接失败
检查 `.env` 文件中的 `DATABASE_URL` 配置是否正确。

### 图片上传失败
确保 `backend/uploads` 目录存在且有写入权限。

### 前端请求404
确保后端服务已启动，检查 Vite 代理配置。

## 许可证

MIT
