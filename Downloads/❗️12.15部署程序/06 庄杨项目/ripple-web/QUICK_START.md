# 🚀 快速部署指南（5分钟上手）

## ✅ 准备工作检查清单

在开始之前，请确认你已经准备好：

- [x] Node.js 已安装（✅ 已完成）
- [x] GitHub 账号已注册（✅ 已完成）
- [x] Cloudflare 账号已注册（✅ 已完成）
- [x] 项目已构建成功（✅ 已完成）
- [x] Git 仓库已初始化（✅ 已完成）

## 📝 下一步操作

### 步骤 1：创建 GitHub 仓库（2分钟）

1. 打开 https://github.com/new
2. 填写仓库信息：
   - **Repository name**: `ripple-web`（或你喜欢的名字）
   - **Description**: `波纹舆情分析平台 - Ripple Sentiment Platform`
   - **Visibility**: 选择 Public 或 Private
   - ⚠️ **重要**：不要勾选 "Add a README file"
3. 点击 "Create repository"

### 步骤 2：推送代码到 GitHub（1分钟）

在终端中执行以下命令（**请将 YOUR_USERNAME 和 YOUR_REPO_NAME 替换为你的实际信息**）：

```bash
# 进入项目目录（如果还没进入的话）
cd ripple-web

# 提交代码
git commit -m "初始提交：波纹舆情分析平台 v4.6"

# 添加远程仓库（替换为你的 GitHub 仓库地址）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

**如果遇到身份验证问题**：
- GitHub 现在要求使用 Personal Access Token（个人访问令牌）代替密码
- 访问 https://github.com/settings/tokens 创建新的 token
- 选择权限：`repo`（完整仓库访问权限）
- 复制 token，在输入密码时使用这个 token

### 步骤 3：在 Cloudflare Pages 部署（2分钟）

1. **打开 Cloudflare Dashboard**
   - 访问 https://dash.cloudflare.com/
   - 登录你的账号

2. **创建 Pages 项目**
   - 左侧菜单 → "Workers & Pages"
   - 点击 "Create application"
   - 选择 "Pages" → "Connect to Git"

3. **连接 GitHub**
   - 点击 "Connect to Git"
   - 选择 "GitHub"
   - 授权 Cloudflare 访问你的 GitHub
   - 选择你刚创建的仓库

4. **配置构建设置**
   ```
   项目名称: ripple-web
   生产分支: main
   构建命令: npm run build
   构建输出目录: dist
   根目录: / (留空)
   ```

5. **部署**
   - 点击 "Save and Deploy"
   - 等待 2-5 分钟
   - 部署完成后会显示预览 URL

### 步骤 4：访问你的网站 🎉

部署完成后，你会得到一个类似这样的 URL：
- `https://ripple-web-xxxxx.pages.dev`

点击访问，你的网站就上线了！

## 🔍 验证部署

打开你的网站，检查以下功能：

- [ ] 页面正常加载
- [ ] 导航栏可以切换（大盘、龙虎榜、产业链、个股、回测）
- [ ] 图表正常显示
- [ ] 搜索功能可用
- [ ] 响应式设计正常（可以缩小浏览器窗口测试）

## ❓ 遇到问题？

### 问题：Git push 失败
**解决方案**：
- 确认 GitHub 仓库地址正确
- 使用 Personal Access Token 代替密码
- 检查网络连接

### 问题：Cloudflare 构建失败
**解决方案**：
- 查看构建日志，找到错误信息
- 确认 `package.json` 中的依赖都正确
- 检查构建命令是否为 `npm run build`

### 问题：网站显示空白
**解决方案**：
- 确认 `public/_redirects` 文件存在
- 检查浏览器控制台是否有错误
- 确认构建输出目录设置为 `dist`

## 📚 更多帮助

- 详细部署文档：查看 [DEPLOY.md](./DEPLOY.md)
- Cloudflare Pages 文档：https://developers.cloudflare.com/pages/
- GitHub 文档：https://docs.github.com/

---

**祝你部署顺利！** 🎊
