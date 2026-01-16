/**
 * 股票实时行情API端点
 * 从腾讯财经获取实时股票数据，解决跨域问题
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

    // 从腾讯财经获取实时数据
    const timestamp = Date.now();
    const url = `https://qt.gtimg.cn/q=${code}&_=${timestamp}`;

    const response = await fetch(url, {
      headers: {
        'Referer': 'https://finance.qq.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: 'Failed to fetch stock data' 
      });
    }

    const text = await response.text();
    
    // 解析腾讯财经数据格式
    // 格式：v_sh600519="1~贵州茅台~600519~1750.00~1740.00~..."
    const match = text.match(/v_[\w]+\="([^"]+)"/);
    if (!match) {
      return res.status(500).json({ error: 'Invalid data format' });
    }

    const parts = match[1].split('~');
    if (parts.length < 30) {
      return res.status(500).json({ error: 'Incomplete data' });
    }

    // 标准化数据格式
    const stockData = {
      code: parts[2] || code,
      name: parts[1] || '--',
      price: parseFloat(parts[3]) || 0,
      prevClose: parseFloat(parts[4]) || 0,
      open: parseFloat(parts[5]) || 0,
      high: parseFloat(parts[33]) || 0,
      low: parseFloat(parts[34]) || 0,
      vol: parseFloat(parts[6]) * 100 || 0,
      bids: [], // 买盘五档
      asks: []  // 卖盘五档
    };

    // 解析买盘五档（bids）
    for (let i = 0; i < 5; i++) {
      stockData.bids.push({
        price: parseFloat(parts[9 + i * 2]) || 0,
        vol: parseFloat(parts[10 + i * 2]) || 0
      });
    }

    // 解析卖盘五档（asks）
    for (let i = 0; i < 5; i++) {
      stockData.asks.push({
        price: parseFloat(parts[19 + i * 2]) || 0,
        vol: parseFloat(parts[20 + i * 2]) || 0
      });
    }

    // 卖盘需要反转顺序（从高到低）
    stockData.asks.reverse();

    return res.status(200).json(stockData);

  } catch (error) {
    console.error('Error in realtime API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
