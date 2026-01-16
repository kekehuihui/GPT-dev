#!/bin/bash

# 二级市场分析系统 - 部署执行脚本
# 此脚本将帮助你完成Git提交和准备部署

echo "🚀 开始部署流程..."
echo ""

# 进入项目目录
cd "$(dirname "$0")"

# 检查Git状态
echo "📋 检查Git状态..."
git status --short

echo ""
echo "📦 添加所有文件到Git..."
git add .

echo ""
echo "💾 提交更改..."
git commit -m "Complete: 前后端分离版本 - 所有功能已实现

- 后端API: 8个端点（Gemini 5个 + Imagen 1个 + Stock 2个）
- 前端: HTML/CSS/JS已分离，所有API调用改为后端
- 模型: 所有Gemini调用使用 gemini-3-pro-preview
- 配置: Vercel和Cloudflare配置完整
- 文档: 完整的部署和使用文档"

echo ""
echo "✅ 代码已提交！"
echo ""
echo "📤 下一步：推送到GitHub（如果还没推送）"
echo "   执行: git push origin main"
echo ""
echo "🌐 然后按照以下步骤部署："
echo "   1. 部署后端到Vercel（Root Directory: backend）"
echo "   2. 配置环境变量 GEMINI_API_KEY"
echo "   3. 更新前端API地址"
echo "   4. 部署前端到Cloudflare Pages（Build output: frontend）"
echo "   5. 配置环境变量 API_BASE_URL"
echo ""
echo "详细步骤请查看: 立即执行步骤.md"
