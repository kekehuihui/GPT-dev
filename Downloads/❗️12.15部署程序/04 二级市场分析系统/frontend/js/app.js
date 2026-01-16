/**
 * 应用主逻辑
 * 这是改造后的版本，所有API调用都通过后端
 */

// 全局状态
let currentStrategyText = "";
let pollInterval = null;
let chartData = [];
let chatHistory = [];
let simulationMode = false;

// 应用状态
const state = {
    code: 'sh600519',
    name: '贵州茅台',
    price: 1750.00,
    prevClose: 1740.00,
    open: 1740.00,
    high: 1760.00,
    low: 1730.00,
    vol: 1000000,
    mode: 'soros',
    sentiment: 0.5,
    asks: [],
    bids: [],
    source: 'public',
    rumors: []
};

// ========== 工具函数 ==========

function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

function autoPrefix(input) {
    let val = input.value.trim();
    if(/^\d{6}$/.test(val)) {
        if(val.startsWith('6')) input.value = 'sh' + val;
        else input.value = 'sz' + val;
    }
}

function showModal(t, c, a=false) { 
    const m = document.getElementById('ai-modal'); 
    const bd = document.getElementById('modal-backdrop');
    document.getElementById('modal-title').innerText = t; 
    document.getElementById('modal-content').innerHTML = c || '<div class="h-40 flex flex-col items-center justify-center gap-4"><div class="loader"></div><div class="text-[10px] text-gray-500 font-mono animate-pulse">正在处理数据...</div></div>'; 
    document.getElementById('audio-control').style.display = a ? 'flex' : 'none'; 
    m.classList.add('active'); 
    bd.classList.add('active');
}

function closeModal() { 
    const m = document.getElementById('ai-modal');
    const bd = document.getElementById('modal-backdrop');
    if(m) m.classList.remove('active'); 
    if(bd) bd.classList.remove('active'); 
}

function logTrade(msg, type) { 
    const l = document.getElementById('trade-log'); 
    if (!l) return;
    let colorClass = 'text-gray-500';
    if(type === 'alert') colorClass = 'text-red-400 font-bold';
    const time = new Date().toLocaleTimeString('zh-CN',{hour12:false});
    l.innerHTML = `<div class="mb-1 ${colorClass} hover:bg-[#18181b] px-1 -mx-1 rounded transition"><span class="opacity-40 mr-2 font-mono text-[9px]">[${time}]</span>${msg}</div>` + l.innerHTML; 
}

function setConnectionStatus(status) {
    const dot = document.getElementById('status-dot');
    const text = document.getElementById('connection-text');
    const label = document.getElementById('data-mode-label');
    
    if (!dot || !text || !label) return;

    if(status === 'live') {
        dot.className = "w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]";
        text.innerText = "链路稳定";
        label.innerText = "L1 实盘";
        label.className = "px-1.5 py-0.5 rounded text-[9px] font-bold badge-live";
    } else if (status === 'sim') {
        dot.className = "w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]";
        text.innerText = "量子仿真中";
        label.innerText = "仿真";
        label.className = "px-1.5 py-0.5 rounded text-[9px] font-bold badge-sim";
    } else {
        dot.className = "w-2 h-2 rounded-full bg-yellow-500 animate-pulse";
        text.innerText = "连接中...";
    }
}

// ========== 数据获取（改造为调用后端API） ==========

async function fetchRealStockData() {
    try {
        const data = await window.API.stock.getRealtime(state.code);
        
        // 更新状态
        state.name = data.name || state.name;
        state.price = data.price || state.price;
        state.prevClose = data.prevClose || state.prevClose;
        state.high = data.high || state.high;
        state.low = data.low || state.low;
        state.vol = data.vol || state.vol;
        state.bids = data.bids || [];
        state.asks = data.asks || [];
        
        setConnectionStatus('live');
        updateUI();
    } catch (error) {
        console.error('获取实时数据失败:', error);
        activateSimulationMode();
    }
}

async function fetchIntradayData() {
    try {
        const data = await window.API.stock.getIntraday(state.code);
        if (data.prices && data.prices.length > 0) {
            chartData = data.prices;
            logTrade(`同步了 ${chartData.length} 个分时数据点`, 'info');
            drawChart();
        }
    } catch (error) {
        console.error('获取分时数据失败:', error);
        logTrade("分时数据获取失败", "alert");
    }
}

function changeStock() {
    const val = document.getElementById('stock-code').value.trim();
    if(!val) return;
    state.code = val;
    chartData = [];
    chatHistory = []; 
    state.rumors = [];
    simulationMode = false;
    
    const chatMsgEl = document.getElementById('chat-messages');
    if (chatMsgEl) chatMsgEl.innerHTML = '<div class="chat-bubble bubble-ai">我是"幽灵"。关于这个票，你想知道什么？</div>';
    
    const nlpFeedEl = document.getElementById('nlp-feed');
    if (nlpFeedEl) nlpFeedEl.innerHTML = ''; 
    
    logTrade(`正在初始化 ${val} 数据通道 (${state.source})...`, 'info');
    setConnectionStatus('connecting');
    
    fetchRealStockData();
    fetchIntradayData();
}

function switchDataSource(source) {
    state.source = source;
    logTrade(`切换数据源通道至: ${source.toUpperCase()}`, 'info');
    changeStock();
}

// ========== UI更新 ==========

function updateUI() {
    safeSetText('stock-name', state.name);
    safeSetText('high-price', state.high.toFixed(2));
    safeSetText('low-price', state.low.toFixed(2));
    
    const priceEl = document.getElementById('current-price');
    if (priceEl) priceEl.innerText = state.price.toFixed(2);
    
    let change = 0;
    if(state.prevClose > 0) change = ((state.price - state.prevClose) / state.prevClose) * 100;
    
    const changeEl = document.getElementById('price-change');
    if (changeEl) changeEl.innerText = (change > 0 ? "+" : "") + change.toFixed(2) + "%";
    
    const colorClass = change >= 0 ? 'text-[#ff333a]' : 'text-[#00e676]';
    if (priceEl) priceEl.className = `text-2xl font-bold tracking-tight transition-colors duration-300 ${colorClass}`;
    if (changeEl) changeEl.className = `text-sm font-bold ${colorClass}`;
    
    safeSetText('total-vol', "量: " + (state.vol / 10000).toFixed(0) + "万");

    renderOrderBook();
    
    if(simulationMode || chartData.length === 0) {
        chartData.push(state.price);
        if(chartData.length > 240) chartData.shift(); 
    } else {
        chartData[chartData.length - 1] = state.price;
    }
    
    drawChart();
    updateAlphaScore(change);
}

function renderOrderBook() {
    const asksContainer = document.getElementById('asks');
    const bidsContainer = document.getElementById('bids');
    
    if (!asksContainer || !bidsContainer) return;

    asksContainer.innerHTML = ''; 
    bidsContainer.innerHTML = '';
    const allVols = [...state.asks, ...state.bids].map(x => x.vol);
    const maxVol = Math.max(...allVols, 100); 
    
    state.asks.forEach((ask, i) => {
        const width = (ask.vol / maxVol) * 100;
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center px-4 py-0.5 text-[10px] relative hover:bg-gray-800 cursor-pointer group';
        div.innerHTML = `<div class="absolute top-0 right-0 h-full bg-green-900/10 transition-all duration-300" style="width: ${width}%"></div><span class="z-10 text-gray-500 w-8">卖${5-i}</span><span class="z-10 text-green-500 w-16 text-right group-hover:text-white transition">${ask.price.toFixed(2)}</span><span class="z-10 text-gray-500 w-12 text-right">${Math.floor(ask.vol)}</span>`;
        asksContainer.appendChild(div);
    });
    
    state.bids.forEach((bid, i) => {
        const width = (bid.vol / maxVol) * 100;
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center px-4 py-0.5 text-[10px] relative hover:bg-gray-800 cursor-pointer group';
        div.innerHTML = `<div class="absolute top-0 right-0 h-full bg-red-900/10 transition-all duration-300" style="width: ${width}%"></div><span class="z-10 text-gray-500 w-8">买${i+1}</span><span class="z-10 text-red-500 w-16 text-right group-hover:text-white transition">${bid.price.toFixed(2)}</span><span class="z-10 text-gray-500 w-12 text-right">${Math.floor(bid.vol)}</span>`;
        bidsContainer.appendChild(div);
    });
}

// ========== 仿真模式 ==========

function activateSimulationMode() {
    if(simulationMode) return;
    simulationMode = true;
    logTrade("检测到网络拦截，切换至量子仿真。", "alert");
    setConnectionStatus('sim');
    if(state.price === 0) {
        state.name = state.code.toUpperCase() + " (仿真)";
        state.price = 20.00; 
        state.prevClose = 19.50; 
        state.high = 20.10; 
        state.low = 19.50; 
        state.vol = 500000;
    }
    updateUI();
}

function runSimulationTick() {
    if(!simulationMode) return;
    const volatility = 0.003;
    const change = (Math.random() - 0.45) * state.price * volatility;
    state.price += change;
    if(state.price > state.high) state.high = state.price;
    if(state.price < state.low) state.low = state.price;
    state.vol += Math.floor(Math.random() * 500);
    
    state.asks = []; 
    state.bids = [];
    for(let i=0; i<5; i++) {
        state.asks.push({ price: state.price + (0.01 * (5-i)), vol: Math.floor(Math.random() * 500) + 10 });
        state.bids.push({ price: state.price - (0.01 * (i+1)), vol: Math.floor(Math.random() * 500) + 10 });
    }
    updateUI();
}

// ========== AI功能（改造为调用后端API） ==========

async function mineWebSentiment() {
    const feed = document.getElementById('nlp-feed');
    if (!feed) return;
    const id = 'scan-' + Date.now();
    feed.innerHTML = `<div id="${id}" class="mb-2 text-blue-400 border-l-2 border-blue-500 pl-2 text-[10px] animate-pulse">正在全网挖掘 ${state.name} 的小道消息...</div>` + feed.innerHTML;
    
    const prompt = `使用Google Search搜索中国A股"${state.name}"(${state.code})最近24小时在东方财富股吧、雪球、微博等平台的讨论、传闻或新闻。
    请提炼出一条最劲爆的"小作文"风格的摘要（30字以内）。如果没有特别的，就找行业相关新闻。
    格式：[类型] 内容
    类型可以是：利好、利空、甚至传闻。`;
    
    try {
        const text = await window.API.gemini.search(prompt);
        const el = document.getElementById(id);
        if(el) {
            el.className = "mb-2 text-blue-300 border-l-2 border-blue-500 pl-2 text-[10px] cursor-pointer hover:text-white transition";
            el.classList.remove("animate-pulse");
            el.innerHTML = marked.parse(text);
            state.rumors.push(`舆情: ${text.substring(0, 50)}...`);
        }
    } catch (error) {
        console.error('舆情挖掘失败:', error);
        const el = document.getElementById(id);
        if(el) el.innerHTML = '挖掘失败，请稍后重试';
    }
}

async function findHistoricalMatch() {
    showModal("历史镜像回溯", null);
    const canvas = document.getElementById('mainChart');
    const base64 = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, "");
    const change = ((state.price - state.prevClose) / state.prevClose * 100).toFixed(2);
    const prompt = `分析${state.name}K线(涨跌${change}%)。寻找A股/美股历史上的相似走势。哪年哪只票? 相似点? 剧本推演?`;
    
    try {
        const text = await window.API.gemini.vision(base64, prompt);
        const modalContent = document.getElementById('modal-content');
        if (modalContent) modalContent.innerHTML = marked.parse(text);
    } catch (error) {
        console.error('历史回溯失败:', error);
        const modalContent = document.getElementById('modal-content');
        if (modalContent) modalContent.innerHTML = '<p class="text-red-500">分析失败，请稍后重试</p>';
    }
}

async function consultRiskOfficer() {
    showModal("首席风控官", null);
    const modalContent = document.getElementById('modal-content');
    if (modalContent) modalContent.innerHTML = '<div class="p-8 flex justify-center"><div class="loader"></div></div>';
    const rumorsText = state.rumors.length > 0 ? state.rumors.join('; ') : "无重大传闻";
    const change = ((state.price - state.prevClose) / state.prevClose * 100).toFixed(2);
    const prompt = `CRO风控报告。标的:${state.name}。涨跌:${change}%。舆情:${rumorsText}。1.风险分(0-100)。2.风险点。3.强制指令。严厉口吻。`;
    
    try {
        const text = await window.API.gemini.text(prompt);
        if (modalContent) modalContent.innerHTML = marked.parse(text);
    } catch (error) {
        console.error('风控报告生成失败:', error);
        if (modalContent) modalContent.innerHTML = '<p class="text-red-500">生成失败，请稍后重试</p>';
    }
}

async function consultTherapist() {
    showModal("心理按摩", null);
    const modalContent = document.getElementById('modal-content');
    if (modalContent) modalContent.innerHTML = '<div class="p-8 flex justify-center"><div class="loader"></div></div>';
    const change = ((state.price - state.prevClose) / state.prevClose * 100).toFixed(2);
    const prompt = `心理医生干预。客户持有${state.name}，盈亏${change}%。风格:${state.mode}。涨则泼冷水，跌则安慰。温暖有力。`;
    
    try {
        const text = await window.API.gemini.text(prompt);
        if (modalContent) modalContent.innerHTML = marked.parse(text);
    } catch (error) {
        console.error('心理按摩失败:', error);
        if (modalContent) modalContent.innerHTML = '<p class="text-red-500">生成失败，请稍后重试</p>';
    }
}

async function generateSentimentTotem() {
    showModal("情绪图腾", null);
    const modalContent = document.getElementById('modal-content');
    if (modalContent) modalContent.innerHTML = '<div class="p-8 flex flex-col items-center justify-center gap-4"><div class="loader"></div><div class="text-xs text-pink-400">Imagen 4 绘图中...</div></div>';
    const change = ((state.price - state.prevClose) / state.prevClose * 100).toFixed(2);
    let artPrompt = change > 3 ? "Surreal golden bull charging up fire mountain" : (change < -3 ? "Cyberpunk broken bear robot in rain" : "Mysterious foggy lake");
    
    try {
        const imageUrl = await window.API.imagen.generate(artPrompt);
        if (modalContent) modalContent.innerHTML = imageUrl ? `<div class="flex flex-col items-center"><p class="text-gray-500 italic mb-2">"AI 感知的市场情绪"</p><img src="${imageUrl}" class="w-full max-w-md h-auto border border-pink-500/30"></div>` : '<p class="text-red-500">生成失败</p>';
    } catch (error) {
        console.error('情绪图腾生成失败:', error);
        if (modalContent) modalContent.innerHTML = '<p class="text-red-500">生成失败，请稍后重试</p>';
    }
}

async function openDebate() {
    showModal("多空庭辩", null);
    const modalContent = document.getElementById('modal-content');
    if (modalContent) modalContent.innerHTML = '<div class="p-8 flex justify-center"><div class="loader"></div></div>';
    const change = ((state.price - state.prevClose) / state.prevClose * 100).toFixed(2);
    const prompt = `模拟A股${state.name}多空辩论。涨跌${change}%。多头vs空头。4回合。语言犀利。`;
    
    try {
        const text = await window.API.gemini.text(prompt);
        if (modalContent) modalContent.innerHTML = marked.parse(text);
    } catch (error) {
        console.error('多空庭辩失败:', error);
        if (modalContent) modalContent.innerHTML = '<p class="text-red-500">生成失败，请稍后重试</p>';
    }
}

async function analyzeChartVision() {
    showModal("视觉分析");
    const canvas = document.getElementById('mainChart');
    const base64 = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, "");
    const prompt = `视觉分析K线。1.形态。2.美学。3.预测。`;
    
    try {
        const text = await window.API.gemini.vision(base64, prompt);
        const modalContent = document.getElementById('modal-content');
        if (modalContent) modalContent.innerHTML = marked.parse(text);
    } catch (error) {
        console.error('视觉分析失败:', error);
        const modalContent = document.getElementById('modal-content');
        if (modalContent) modalContent.innerHTML = '<p class="text-red-500">分析失败，请稍后重试</p>';
    }
}

async function identifyPredator() {
    const profile = document.getElementById('predator-profile');
    if (profile) profile.innerHTML = '<div class="loader"></div>';
    const change = ((state.price - state.prevClose) / state.prevClose * 100).toFixed(2);
    const prompt = `分析${state.name}实盘。涨跌${change}%。侧写主力属性。3句话。`;
    
    try {
        const text = await window.API.gemini.text(prompt);
        if (profile) profile.innerHTML = marked.parse(text);
    } catch (error) {
        console.error('主力识别失败:', error);
        if (profile) profile.innerHTML = '识别失败，请稍后重试';
    }
}

async function openWarRoom() {
    const scenario = window.prompt("宏观事件假设:", "人民币汇率大幅升值");
    if(!scenario) return;
    showModal("沙盘推演");
    const aiPrompt = `推演${state.name}在"${scenario}"下的表现。`;
    
    try {
        const text = await window.API.gemini.text(aiPrompt);
        const modalContent = document.getElementById('modal-content');
        if (modalContent) modalContent.innerHTML = marked.parse(text);
    } catch (error) {
        console.error('沙盘推演失败:', error);
        const modalContent = document.getElementById('modal-content');
        if (modalContent) modalContent.innerHTML = '<p class="text-red-500">推演失败，请稍后重试</p>';
    }
}

async function askStrategyCore() {
    showModal("智能策略", null, true);
    const prompt = `Alpha-Core策略。${state.name}。风格:${state.mode}。口语化建议。`;
    
    try {
        const text = await window.API.gemini.text(prompt);
        currentStrategyText = text;
        const modalContent = document.getElementById('modal-content');
        if (modalContent) modalContent.innerHTML = marked.parse(text);
        const btn = document.getElementById('btn-play-audio');
        const status = document.getElementById('audio-status');
        if (btn) btn.disabled = false;
        if (status) status.innerText = "语音就绪";
    } catch (error) {
        console.error('策略生成失败:', error);
        const modalContent = document.getElementById('modal-content');
        if (modalContent) modalContent.innerHTML = '<p class="text-red-500">生成失败，请稍后重试</p>';
    }
}

async function playStrategyAudio() {
    if(!currentStrategyText) return;
    const btn = document.getElementById('btn-play-audio');
    if (btn) btn.disabled=true;
    
    try {
        const b64 = await window.API.gemini.tts(currentStrategyText);
        if(b64) {
            const wav = pcm16ToWav(base64ToArrayBuffer(b64));
            new Audio(URL.createObjectURL(new Blob([wav],{type:'audio/wav'}))).play();
            const status = document.getElementById('audio-status');
            if (status) status.innerText="播放中...";
        }
    } catch (error) {
        console.error('语音播放失败:', error);
    } finally {
        if (btn) btn.disabled=false;
    }
}

function toggleChat() { 
    const widget = document.getElementById('chat-widget');
    if (widget) widget.classList.toggle('open'); 
}

async function sendChat() {
    const input = document.getElementById('chat-input');
    const val = input.value.trim();
    if(!val) return;
    addChatBubble(val, 'user');
    input.value = '';
    const loadingId = addChatBubble("...", 'ai');
    
    try {
        const response = await window.API.gemini.chat(chatHistory, val);
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.innerText = response;
        chatHistory.push({ role: 'user', text: val }, { role: 'model', text: response });
    } catch (error) {
        console.error('聊天失败:', error);
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.innerText = '发送失败，请稍后重试';
    }
}

function addChatBubble(text, type) {
    const c = document.getElementById('chat-messages');
    const d = document.createElement('div');
    d.id = 'msg-' + Date.now();
    d.className = `chat-bubble ${type === 'user' ? 'bubble-user' : 'bubble-ai'}`;
    d.innerText = text;
    c.appendChild(d); 
    c.scrollTop = c.scrollHeight;
    return d.id;
}

function switchMode(m) { 
    state.mode=m; 
    logTrade(`模式切换: ${m==='soros'?'索罗斯':'巴菲特'}`, 'info'); 
    const btnSoros = document.getElementById('mode-soros');
    const btnBuffett = document.getElementById('mode-buffett');
    if (btnSoros) btnSoros.className = m==='soros' ? "px-4 py-1 rounded bg-blue-600 text-white font-bold transition-all text-[10px]" : "px-4 py-1 rounded text-gray-400 hover:text-white transition-all text-[10px]";
    if (btnBuffett) btnBuffett.className = m==='buffett' ? "px-4 py-1 rounded bg-blue-600 text-white font-bold transition-all text-[10px]" : "px-4 py-1 rounded text-gray-400 hover:text-white transition-all text-[10px]";
}

async function generateFundamentalReport() { 
    showModal("深度审计", null); 
    try {
        const t = await window.API.gemini.text(`审计${state.name}基本面`);
        const content = document.getElementById('modal-content'); 
        if (content) content.innerHTML = marked.parse(t);
    } catch (error) {
        console.error('基本面报告生成失败:', error);
        const content = document.getElementById('modal-content');
        if (content) content.innerHTML = '<p class="text-red-500">生成失败，请稍后重试</p>';
    }
}

function updateAlphaScore(change) { 
    let score=50+change*5; 
    if(state.mode==='soros'&&change>5)score+=20; 
    if(state.mode==='buffett'&&change<-3)score+=20; 
    score=Math.max(0,Math.min(100,Math.floor(score))); 
    safeSetText('alpha-score', score); 
}

// ========== 图表绘制 ==========

function drawChart() { 
    const cvs=document.getElementById('mainChart'); 
    const ctx=cvs.getContext('2d'); 
    cvs.width=cvs.parentElement.offsetWidth; 
    cvs.height=cvs.parentElement.offsetHeight; 
    ctx.clearRect(0,0,cvs.width,cvs.height); 
    
    if(chartData.length<2) {
        ctx.fillStyle = "#333";
        ctx.font = "12px monospace";
        ctx.fillText("等待市场数据...", 20, 30);
        return;
    } 
    
    let min = Math.min(...chartData);
    let max = Math.max(...chartData);
    if (min === max) { min *= 0.99; max *= 1.01; }
    else { min *= 0.998; max *= 1.002; }
    const range = max - min;
    
    const grad=ctx.createLinearGradient(0,0,0,cvs.height); 
    grad.addColorStop(0,'rgba(139, 92, 246, 0.2)'); 
    grad.addColorStop(1,'rgba(139, 92, 246, 0)'); 
    
    ctx.beginPath(); 
    chartData.forEach((p,i)=>{
        const x=(i/(chartData.length-1))*cvs.width;
        const y=cvs.height-((p-min)/range)*cvs.height;
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)
    }); 
    ctx.lineTo(cvs.width,cvs.height); 
    ctx.lineTo(0,cvs.height); 
    ctx.fillStyle=grad; 
    ctx.fill(); 
    
    ctx.beginPath(); 
    chartData.forEach((p,i)=>{
        const x=(i/(chartData.length-1))*cvs.width;
        const y=cvs.height-((p-min)/range)*cvs.height;
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)
    }); 
    ctx.strokeStyle='#8b5cf6'; 
    ctx.lineWidth=2; 
    ctx.stroke(); 
}

// ========== 音频工具函数 ==========

function base64ToArrayBuffer(base64) { 
    const binaryString = window.atob(base64); 
    const bytes = new Uint8Array(binaryString.length); 
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i); 
    return bytes.buffer; 
}

function pcm16ToWav(pcmData) { 
    const numChannels=1, sampleRate=24000, bitsPerSample=16, dataSize=pcmData.byteLength; 
    const buffer=new ArrayBuffer(44+dataSize), view=new DataView(buffer); 
    const writeString=(v,o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))}; 
    writeString(view,0,'RIFF');
    view.setUint32(4,36+dataSize,true);
    writeString(view,8,'WAVE');
    writeString(view,12,'fmt ');
    view.setUint32(16,16,true);
    view.setUint16(20,1,true);
    view.setUint16(22,numChannels,true);
    view.setUint32(24,sampleRate,true);
    view.setUint32(28,sampleRate*2,true);
    view.setUint16(32,2,true);
    view.setUint16(34,bitsPerSample,true);
    writeString(view,36,'data');
    view.setUint32(40,dataSize,true);
    new Uint8Array(buffer).set(new Uint8Array(pcmData),44);
    return buffer; 
}

// ========== 初始化 ==========

document.addEventListener('DOMContentLoaded', function() {
    // 检查API是否加载
    if (!window.API) {
        console.error('API客户端未加载，请确保api.js已加载');
        logTrade("API客户端加载失败", "alert");
        return;
    }
    
    logTrade("Alpha-Core V13.2 系统就绪（前后端分离版）", 'info'); 
    fetchRealStockData();
    fetchIntradayData(); 
    
    pollInterval = setInterval(() => { 
        if(simulationMode) { 
            runSimulationTick(); 
        } else { 
            fetchRealStockData(); 
        } 
    }, 3000); 
});
