/**
 * Gemini聊天API端点
 * 用于"幽灵"聊天功能，支持对话历史
 */

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API Key not configured' });
    }

    // 构建对话历史
    const contents = (messages || []).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // 添加当前用户消息
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    // 调用Gemini API - 使用gemini-3-pro-preview模型
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents,
        systemInstruction: {
          parts: [{
            text: '你是一个中国A股市场的"匿名内部人"（代号：幽灵）。说话神秘、犀利，喜欢用黑话（如"庄家"、"洗盘"、"喝茶"）。'
          }]
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini Chat API error:', errorData);
      return res.status(response.status).json({ 
        error: 'Gemini Chat API request failed',
        details: errorData 
      });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'AI 暂时离线';

    return res.status(200).json({ text });

  } catch (error) {
    console.error('Error in chat API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
