# 二级市场分析系统 - 前后端分离部署指南

## 📁 项目结构

```
stock-analysis-system/
├── frontend/              # 前端代码（部署到Cloudflare Pages）
│   ├── index.html        # 主HTML文件
│   ├── assets/
│   │   └── style.css     # 样式文件
│   └── js/
│       ├── api.js        # API客户端（已创建）
│       └── app.js         # 应用主逻辑（需要创建）
│
├── backend/               # 后端代码（部署到Vercel）
│   ├── api/              # API端点（已创建）
│   ├── package.json      # 已创建
│   └── vercel.json       # 已创建
│
└── README.md             # 本文件
```

## 🚀 部署步骤

### 第一步：准备GitHub仓库

1. 在GitHub创建新仓库（如：`stock-analysis-system`）
2. 克隆到本地：
```bash
git clone https://github.com/your-username/stock-analysis-system.git
cd stock-analysis-system
```

3. 将当前项目文件复制到仓库目录

### 第二步：配置后端（Vercel）

1. 登录 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 导入你的GitHub仓库
4. 配置项目：
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: (留空)
   - **Output Directory**: (留空)

5. 添加环境变量：
   - 名称：`GEMINI_API_KEY`
   - 值：你的Gemini API Key

6. 部署后，复制部署地址（如：`https://your-app.vercel.app`）

### 第三步：配置前端（Cloudflare Pages）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 "Workers & Pages"
3. 点击 "Create Application" > "Pages" > "Connect to Git"
4. 选择你的GitHub仓库
5. 配置构建设置：
   - **Project name**: stock-analysis-frontend
   - **Production branch**: main
   - **Build command**: (留空)
   - **Build output directory**: `frontend`

6. 添加环境变量：
   - 名称：`API_BASE_URL`
   - 值：你的Vercel部署地址（如：`https://your-app.vercel.app`）

7. 部署

### 第四步：更新前端API地址

在 `frontend/js/api.js` 中，更新：
```javascript
const API_BASE_URL = window.API_BASE_URL || 'https://your-vercel-app.vercel.app';
```

或者在Cloudflare Pages的环境变量中设置 `API_BASE_URL`

## 🔧 本地开发

### 后端开发

```bash
cd backend
npm install -g vercel
vercel dev
```

后端将在 `http://localhost:3000` 运行

### 前端开发

1. 使用本地服务器（如Python）：
```bash
cd frontend
python -m http.server 8000
```

2. 或使用VS Code的Live Server插件

3. 在浏览器访问 `http://localhost:8000`

## 📝 注意事项

1. **API Key安全**：永远不要在前端代码中暴露API Key
2. **CORS配置**：Vercel的vercel.json已配置CORS，允许所有来源
3. **环境变量**：生产环境必须在平台配置，不要提交到Git
4. **模型名称**：所有Gemini调用已改为 `gemini-3-pro-preview`

## 🐛 常见问题

### 问题1：CORS错误
**解决**：检查Vercel的vercel.json中的CORS配置

### 问题2：API调用失败
**解决**：
- 检查Vercel环境变量是否配置
- 检查API地址是否正确
- 查看浏览器控制台和Vercel日志

### 问题3：前端无法加载
**解决**：
- 检查Cloudflare Pages的构建输出目录
- 确保index.html在正确位置

## 📞 下一步

1. 完成前端代码改造（将原始HTML中的JavaScript提取并修改）
2. 测试所有功能
3. 优化性能
4. 添加错误处理和加载状态
