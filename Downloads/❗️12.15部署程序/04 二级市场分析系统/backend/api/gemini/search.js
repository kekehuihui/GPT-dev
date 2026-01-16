/**
 * Gemini搜索API端点
 * 用于全网舆情挖掘，使用Google Search功能
 */

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API Key not configured' });
    }

    // 调用Gemini API with Google Search工具 - 使用gemini-3-pro-preview模型
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        tools: [{
          googleSearch: {}
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini Search API error:', errorData);
      return res.status(response.status).json({ 
        error: 'Gemini Search API request failed',
        details: errorData 
      });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '侦察失败：AI 无法连接到外网';

    return res.status(200).json({ text });

  } catch (error) {
    console.error('Error in search API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
