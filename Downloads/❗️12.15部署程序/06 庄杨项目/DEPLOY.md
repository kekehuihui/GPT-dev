# 部署指南 - 波纹 (Ripple)

恭喜你！项目代码已经准备就绪。现在我们需要把它部署到互联网上，让所有人都能访问。

我们将使用 **GitHub** 托管代码，并使用 **Cloudflare Pages** 进行自动化部署。

## 第一步：准备本地环境

1.  **打开终端 (Terminal)**
    在 VS Code 中，点击菜单栏的 `Terminal` -> `New Terminal`，或者使用快捷键 `Ctrl + \`` (Windows) / `Cmd + \`` (Mac)。

2.  **初始化 Git 仓库**
    在终端中输入以下命令并回车（一行一行执行）：
    ```bash
    git init
    git add .
    git commit -m "Initial commit: Ripple project setup"
    ```
    *解释：这三行命令分别做了：初始化一个新的代码仓库、将所有文件加入暂存区、提交这些文件并附带说明。*

## 第二步：推送到 GitHub

1.  **登录 GitHub**
    打开浏览器访问 [GitHub](https://github.com/) 并登录你的账号。

2.  **创建新仓库**
    *   点击右上角的 `+` 号，选择 `New repository`。
    *   **Repository name**: 输入 `ripple-sentiment-platform` (或者你喜欢的名字)。
    *   **Public/Private**: 选择 `Public` (公开) 或 `Private` (私有) 均可。Cloudflare Pages 都支持。
    *   点击 `Create repository` 按钮。

3.  **关联远程仓库**
    创建成功后，GitHub 会显示一堆命令。找到 **"…or push an existing repository from the command line"** 这一栏。
    复制那两行代码，类似于：
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/ripple-sentiment-platform.git
    git branch -M main
    git push -u origin main
    ```
    将它们粘贴到你的 VS Code 终端中并回车。
    *注意：如果提示输入账号密码，按照提示操作。*

## 第三步：在 Cloudflare Pages 上部署

1.  **登录 Cloudflare**
    访问 [Cloudflare Dashboard](https://dash.cloudflare.com/) 并登录。

2.  **创建 Pages 项目**
    *   在左侧菜单点击 `Workers & Pages`。
    *   点击右侧的 `Create application` 按钮。
    *   选择 `Pages` 标签页。
    *   点击 `Connect to Git`。

3.  **连接 GitHub**
    *   如果你是第一次使用，需要授权 Cloudflare 访问你的 GitHub 账号。
    *   在列表中选择你刚才创建的仓库 `ripple-sentiment-platform`。
    *   点击 `Begin setup`。

4.  **配置构建设置 (关键步骤)**
    Cloudflare 通常会自动检测设置，但请务必核对以下信息：
    *   **Project name**: 保持默认即可。
    *   **Production branch**: `main`。
    *   **Framework preset**: 选择 `Vite` (如果没有 Vite，手动填写下面的设置)。
    *   **Build command**: `npm run build`
    *   **Build output directory**: `dist`

5.  **开始部署**
    *   点击 `Save and Deploy`。
    *   Cloudflare 会开始自动构建你的项目。这可能需要 1-2 分钟。
    *   构建完成后，你会看到一个绿色的 `Success!` 提示，并且会有一个类似 `https://ripple-sentiment-platform.pages.dev` 的网址。

## 第四步：访问你的网站

点击那个网址，你的“波纹”舆情分析平台就已经上线了！你可以把这个链接分享给任何人。

---

### 后续更新

如果你修改了代码（比如改了文字或颜色）：
1.  在 VS Code 终端运行：
    ```bash
    git add .
    git commit -m "Update: 修改了xxx"
    git push
    ```
2.  Cloudflare Pages 会自动检测到 GitHub 的变化，并自动重新部署最新版本。无需任何额外操作！
