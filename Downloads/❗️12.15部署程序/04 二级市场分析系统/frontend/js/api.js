/**
 * API客户端 - 统一管理所有后端API调用
 * 所有API调用都通过这个模块，方便管理和维护
 */

// 后端API基础地址
// 在生产环境中，这个值应该从环境变量获取
// 开发环境可以使用相对路径或本地Vercel地址
// 注意：部署到Cloudflare Pages时，需要在环境变量中设置 API_BASE_URL
// 或者在部署后手动修改这里的地址
const API_BASE_URL = window.API_BASE_URL || 'https://your-vercel-app.vercel.app';

/**
 * 通用API请求函数
 * @param {string} endpoint - API端点路径
 * @param {object} options - fetch选项
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

/**
 * Gemini API调用
 */
const geminiAPI = {
  // 文本生成
  async text(prompt) {
    const result = await apiRequest('/api/gemini/text', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    });
    return result.text;
  },

  // 视觉分析
  async vision(imageBase64, prompt) {
    const result = await apiRequest('/api/gemini/vision', {
      method: 'POST',
      body: JSON.stringify({ 
        image: imageBase64,
        prompt 
      })
    });
    return result.text;
  },

  // 搜索功能
  async search(prompt) {
    const result = await apiRequest('/api/gemini/search', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    });
    return result.text;
  },

  // 聊天对话
  async chat(messages, prompt) {
    const result = await apiRequest('/api/gemini/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, prompt })
    });
    return result.text;
  },

  // 语音合成
  async tts(text) {
    const result = await apiRequest('/api/gemini/tts', {
      method: 'POST',
      body: JSON.stringify({ text })
    });
    return result.audio;
  }
};

/**
 * Imagen API调用
 */
const imagenAPI = {
  async generate(prompt) {
    const result = await apiRequest('/api/imagen', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    });
    return result.image;
  }
};

/**
 * 股票数据API调用
 */
const stockAPI = {
  // 获取实时行情
  async getRealtime(code) {
    const result = await apiRequest(`/api/stock/realtime?code=${encodeURIComponent(code)}`, {
      method: 'GET'
    });
    return result;
  },

  // 获取分时数据
  async getIntraday(code) {
    const result = await apiRequest(`/api/stock/intraday?code=${encodeURIComponent(code)}`, {
      method: 'GET'
    });
    return result;
  }
};

// 导出API对象
window.API = {
  gemini: geminiAPI,
  imagen: imagenAPI,
  stock: stockAPI
};
