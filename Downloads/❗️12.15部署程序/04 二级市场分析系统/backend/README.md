# 后端API文档

## 环境变量

在Vercel控制台配置：
- `GEMINI_API_KEY`: 你的Gemini API Key

## API端点

### Gemini API

#### POST /api/gemini/text
文本生成

**请求体：**
```json
{
  "prompt": "你的提示词"
}
```

**响应：**
```json
{
  "text": "生成的文本"
}
```

#### POST /api/gemini/vision
视觉分析

**请求体：**
```json
{
  "image": "base64编码的图片",
  "prompt": "分析提示"
}
```

#### POST /api/gemini/search
搜索功能（带Google Search）

**请求体：**
```json
{
  "prompt": "搜索提示"
}
```

#### POST /api/gemini/chat
聊天对话

**请求体：**
```json
{
  "messages": [
    {"role": "user", "text": "消息1"},
    {"role": "model", "text": "回复1"}
  ],
  "prompt": "当前消息"
}
```

#### POST /api/gemini/tts
语音合成

**请求体：**
```json
{
  "text": "要转换的文本"
}
```

**响应：**
```json
{
  "audio": "base64编码的音频数据"
}
```

### Imagen API

#### POST /api/imagen
图像生成

**请求体：**
```json
{
  "prompt": "图像描述"
}
```

**响应：**
```json
{
  "image": "data:image/png;base64,..."
}
```

### 股票数据API

#### GET /api/stock/realtime?code=sh600519
获取实时行情

**响应：**
```json
{
  "code": "sh600519",
  "name": "贵州茅台",
  "price": 1750.00,
  "prevClose": 1740.00,
  "high": 1760.00,
  "low": 1730.00,
  "vol": 1000000,
  "bids": [...],
  "asks": [...]
}
```

#### GET /api/stock/intraday?code=sh600519
获取分时数据

**响应：**
```json
{
  "prices": [1750.00, 1751.00, ...],
  "count": 240
}
```

## 部署

部署到Vercel后，所有API端点将自动可用。
