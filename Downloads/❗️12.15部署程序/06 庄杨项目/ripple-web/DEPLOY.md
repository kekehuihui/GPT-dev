# 波纹 (Ripple) 项目部署指南

## 📋 部署到 Cloudflare Pages 完整步骤

### 第一步：准备 GitHub 仓库

1. **在 GitHub 上创建新仓库**
   - 登录 GitHub，点击右上角 "+" → "New repository"
   - 仓库名称建议：`ripple-web` 或 `ripple-sentiment-platform`
   - 选择 Public（公开）或 Private（私有）
   - **不要**勾选 "Initialize this repository with a README"
   - 点击 "Create repository"

2. **在本地初始化 Git 并推送代码**

   打开终端，进入项目目录，执行以下命令：

   ```bash
   # 进入项目目录
   cd ripple-web
   
   # 初始化 Git 仓库
   git init
   
   # 添加所有文件到暂存区
   git add .
   
   # 提交代码（这是第一次提交）
   git commit -m "初始提交：波纹舆情分析平台 v4.6"
   
   # 添加远程仓库（将 YOUR_USERNAME 和 YOUR_REPO_NAME 替换为你的实际信息）
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   
   # 推送代码到 GitHub
   git branch -M main
   git push -u origin main
   ```

   **注意**：如果 GitHub 要求身份验证，你可能需要：
   - 使用 Personal Access Token（个人访问令牌）代替密码
   - 或者配置 SSH 密钥

### 第二步：在 Cloudflare Pages 部署

1. **登录 Cloudflare Dashboard**
   - 访问 https://dash.cloudflare.com/
   - 使用你的 Cloudflare 账号登录

2. **创建新的 Pages 项目**
   - 在左侧菜单找到 "Workers & Pages"
   - 点击 "Create application"
   - 选择 "Pages" → "Connect to Git"

3. **连接 GitHub 仓库**
   - 点击 "Connect to Git" 按钮
   - 选择 "GitHub" 作为 Git 提供商
   - 授权 Cloudflare 访问你的 GitHub 账号
   - 选择你刚才创建的仓库

4. **配置构建设置**
   Cloudflare Pages 会自动检测到这是一个 Vite 项目，但请确认以下设置：

   - **项目名称**：`ripple-web`（可以自定义）
   - **生产分支**：`main`
   - **构建命令**：`npm run build`
   - **构建输出目录**：`dist`
   - **根目录**：`/`（留空或填写 `ripple-web`，取决于你的仓库结构）

   **重要提示**：
   - 如果你的仓库根目录就是 `ripple-web` 文件夹的内容，根目录留空 `/`
   - 如果你的仓库包含 `ripple-web` 文件夹，根目录填写 `ripple-web`

5. **环境变量（可选）**
   - 如果你的项目需要环境变量，可以在 "Environment variables" 部分添加
   - 目前这个项目使用模拟数据，暂时不需要环境变量

6. **开始部署**
   - 点击 "Save and Deploy"
   - Cloudflare 会自动开始构建和部署
   - 等待 2-5 分钟，部署完成后会显示一个预览 URL

### 第三步：自定义域名（可选）

1. **添加自定义域名**
   - 在项目设置中找到 "Custom domains"
   - 点击 "Set up a custom domain"
   - 输入你的域名（例如：`ripple.yourdomain.com`）
   - 按照提示配置 DNS 记录

2. **DNS 配置**
   - 在你的域名 DNS 设置中添加 CNAME 记录
   - 记录名称：`ripple`（或你想要的子域名）
   - 目标：Cloudflare 提供的 Pages 域名

### 第四步：验证部署

1. **访问预览 URL**
   - 部署完成后，Cloudflare 会提供一个类似 `https://ripple-web.pages.dev` 的 URL
   - 点击访问，确认网站正常运行

2. **检查功能**
   - 测试各个页面切换（大盘、龙虎榜、产业链、个股、回测）
   - 确认图表正常显示
   - 测试搜索功能
   - 验证响应式设计（在不同设备上查看）

### 🔧 常见问题排查

#### 问题 1：构建失败
- **原因**：可能是依赖安装失败或构建命令错误
- **解决**：检查 Cloudflare 构建日志，确认 `package.json` 中的依赖都正确

#### 问题 2：页面显示空白
- **原因**：可能是路由配置问题
- **解决**：确认 `_redirects` 文件已创建（已包含在项目中），所有路由都重定向到 `index.html`

#### 问题 3：资源加载失败（404）
- **原因**：可能是构建输出目录配置错误
- **解决**：确认构建输出目录设置为 `dist`

#### 问题 4：样式丢失
- **原因**：Tailwind CSS 可能没有正确编译
- **解决**：检查 `postcss.config.js` 和 `tailwind.config.js` 配置

### 📝 后续更新部署

每次更新代码后，只需：

```bash
# 在本地修改代码后
git add .
git commit -m "更新描述"
git push origin main
```

Cloudflare Pages 会自动检测到 GitHub 的更新，并触发新的构建和部署。

### 🎉 部署完成！

恭喜！你的波纹舆情分析平台现在已经成功部署到 Cloudflare Pages 了。

**项目特点**：
- ✅ 完全静态部署，无需服务器
- ✅ 全球 CDN 加速，访问速度快
- ✅ 自动 HTTPS 加密
- ✅ 免费额度充足（适合个人和小型项目）

**下一步建议**：
- 根据后端开发蓝图，逐步接入真实数据 API
- 优化性能，考虑代码分割减少初始加载时间
- 添加 Google Analytics 或其他分析工具追踪访问

---

**需要帮助？**
- Cloudflare Pages 文档：https://developers.cloudflare.com/pages/
- GitHub 文档：https://docs.github.com/
