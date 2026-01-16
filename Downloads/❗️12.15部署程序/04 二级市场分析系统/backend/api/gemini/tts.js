/**
 * Gemini语音合成API端点
 * 用于将策略文本转换为语音
 */

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API Key not configured' });
    }

    // 调用Gemini TTS API - 使用gemini-3-pro-preview模型
    // 注意：TTS功能可能需要特定的模型，这里使用标准模型
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: text }]
        }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Kore'
              }
            }
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini TTS API error:', errorData);
      return res.status(response.status).json({ 
        error: 'Gemini TTS API request failed',
        details: errorData 
      });
    }

    const data = await response.json();
    const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;

    if (!audioData) {
      return res.status(500).json({ error: 'No audio data returned' });
    }

    return res.status(200).json({ audio: audioData });

  } catch (error) {
    console.error('Error in TTS API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
