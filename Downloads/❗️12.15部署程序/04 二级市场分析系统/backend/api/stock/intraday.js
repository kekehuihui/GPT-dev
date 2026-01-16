/**
 * 股票分时数据API端点
 * 从腾讯财经获取分时K线数据
 */

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Stock code is required' });
    }

    // 从腾讯财经获取分时数据
    const timestamp = Date.now();
    const callbackName = 'tencent_min_' + timestamp;
    const url = `https://web.ifzq.gtimg.cn/appstock/app/minute/query?code=${code}&callback=${callbackName}`;

    const response = await fetch(url, {
      headers: {
        'Referer': 'https://finance.qq.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: 'Failed to fetch intraday data' 
      });
    }

    const text = await response.text();
    
    // 解析JSONP格式：callbackName({...})
    const jsonMatch = text.match(new RegExp(`${callbackName}\\((.*)\\)`));
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Invalid data format' });
    }

    const data = JSON.parse(jsonMatch[1]);
    
    // 提取分时数据
    const stockCode = code.replace('sh', '').replace('sz', '');
    const minuteData = data.data?.[code]?.data?.data || data.data?.[stockCode]?.data?.data;

    if (!minuteData || !Array.isArray(minuteData)) {
      return res.status(500).json({ error: 'No intraday data available' });
    }

    // 解析分时数据，提取价格
    // 格式：["时间", "价格", "成交量", ...]
    const prices = minuteData.map(item => {
      const parts = item.split(' ');
      return parseFloat(parts[1]) || 0;
    }).filter(price => price > 0);

    return res.status(200).json({ 
      prices: prices,
      count: prices.length
    });

  } catch (error) {
    console.error('Error in intraday API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
