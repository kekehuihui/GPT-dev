/**
 * Imagen图像生成API端点
 * 用于生成情绪图腾图像
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

    // 调用Imagen API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [{
          prompt: prompt
        }],
        parameters: {
          sampleCount: 1
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Imagen API error:', errorData);
      return res.status(response.status).json({ 
        error: 'Imagen API request failed',
        details: errorData 
      });
    }

    const data = await response.json();
    const imageBase64 = data.predictions?.[0]?.bytesBase64Encoded;

    if (!imageBase64) {
      return res.status(500).json({ error: 'No image data returned' });
    }

    // 返回base64编码的图片数据
    return res.status(200).json({ 
      image: `data:image/png;base64,${imageBase64}` 
    });

  } catch (error) {
    console.error('Error in Imagen API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
