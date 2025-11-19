import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { errorHandler } from './middlewares/errorHandler';
import { upload } from './middlewares/upload';
import { RegistrationController } from './controllers/registrationController';
import { UploadController } from './controllers/uploadController';

dotenv.config();

const app: Application = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 控制器实例
const registrationController = new RegistrationController();
const uploadController = new UploadController();

// 用户端路由
app.post('/api/registrations', (req, res, next) => registrationController.create(req, res, next));
app.post('/api/upload', upload.single('file'), (req, res, next) => uploadController.upload(req, res, next));

// 管理端路由
app.get('/api/admin/registrations', (req, res, next) => registrationController.list(req, res, next));
app.get('/api/admin/registrations/:id', (req, res, next) => registrationController.detail(req, res, next));
app.put('/api/admin/registrations/:id', (req, res, next) => registrationController.update(req, res, next));
app.delete('/api/admin/registrations/:id', (req, res, next) => registrationController.delete(req, res, next));
app.get('/api/admin/statistics', (req, res, next) => registrationController.statistics(req, res, next));

// 简易管理员登录
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (username === adminUsername && password === adminPassword) {
    res.json({ code: 200, message: '登录成功', data: { username } });
  } else {
    res.status(401).json({ code: 401, message: '用户名或密码错误' });
  }
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在 http://0.0.0.0:${PORT}`);
  console.log(`局域网访问地址: http://192.168.1.8:${PORT}`);
});
