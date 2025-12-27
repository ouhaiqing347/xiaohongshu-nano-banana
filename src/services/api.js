// src/services/api.js

const API_BASE = 'https://api.kie.ai/api/v1/jobs';

// --- 轮询状态 ---
const pollTaskStatus = async (taskId, apiKey) => {
  const maxRetries = 60; 
  let attempts = 0;
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      attempts++;
      try {
        const response = await fetch(`${API_BASE}/recordInfo?taskId=${taskId}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        const data = await response.json();
        if (data.code !== 200) { clearInterval(interval); reject(new Error(data.msg)); return; }
        
        const state = data.data.state;
        if (state === 'success') {
          clearInterval(interval);
          try { resolve(JSON.parse(data.data.resultJson).resultUrls[0]); } catch (e) { reject(new Error("解析失败")); }
        } else if (state === 'fail') {
          clearInterval(interval); reject(new Error(data.data.failMsg || '生成失败'));
        } else if (attempts >= maxRetries) {
          clearInterval(interval); reject(new Error('超时'));
        }
      } catch (error) { clearInterval(interval); reject(error); }
    }, 2000); 
  });
};

// --- 1. 生图 ---
export const generateImage = async (apiKey, prompt, resolution) => {
  try {
    const response = await fetch(`${API_BASE}/createTask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "nano-banana-pro",
        input: { prompt, aspect_ratio: "3:4", resolution, output_format: "jpg" }
      })
    });
    const data = await response.json();
    if (data.code !== 200) throw new Error(data.msg);
    return await pollTaskStatus(data.data.taskId, apiKey);
  } catch (error) { throw error; }
};

// --- 2. 链接提取 (强制限制 5 张) ---
export const extractImagesFromLink = async (xhsLink, tikhubKey) => {
  try {
    const proxyUrl = `http://localhost:3002/tikhub-proxy?url=${encodeURIComponent(xhsLink)}`;
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: { 'Authorization': tikhubKey.startsWith('Bearer') ? tikhubKey : `Bearer ${tikhubKey}` }
    });

    if (!response.ok) throw new Error("代理连接失败，请检查 node proxy.cjs 是否运行");

    const data = await response.json();
    let list = [];
    
    // 兼容各种格式
    if (data.data) {
        if (Array.isArray(data.data.image_list)) list = data.data.image_list;
        else if (Array.isArray(data.data.images)) list = data.data.images;
        else if (Array.isArray(data.data)) list = data.data;
    }
    
    if (list.length > 0) {
      // 🌟 核心修改：只取前 5 张！
      // 如果图片少于5张，就全取；如果多于5张，只取前5张
      const limitedList = list.slice(0, 5); 
      return limitedList.map(img => (typeof img === 'string' ? img : img.url));
    } else {
      throw new Error("未解析到图片");
    }
  } catch (error) {
    throw new Error("解析异常: " + error.message);
  }
};

// --- 3. 视觉分析 (强制 JSON 数组输出) ---
export const analyzeImage = async (visionConfig, inputSource, systemInstruction) => {
  const { apiKey, baseUrl, model } = visionConfig;
  
  // 🌟 强制 AI 返回数组格式，方便前端拆分输入框
  const jsonInstruction = `${systemInstruction}\n\n【强制格式要求】\n请直接返回一个 JSON 字符串数组，不要包含 markdown 标记。\n格式示例：["图1提示词", "图2提示词", "图3提示词"]\n请确保数组长度与图片数量一致。`;

  let userContent = [{ type: "text", text: "请为这些图片生成提示词。" }];

  if (Array.isArray(inputSource)) {
    inputSource.forEach(url => userContent.push({ type: "image_url", image_url: { url: url } }));
  } else {
    userContent.push({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${inputSource}` } });
  }

  const payload = {
    model: model || "qwen-vl-max",
    messages: [
      { role: "system", content: jsonInstruction },
      { role: "user", content: userContent }
    ],
    max_tokens: 4000 // 足够 5 张图使用
  };

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    
    let content = data.choices[0].message.content;
    // 清洗 markdown 符号，确保能 JSON.parse
    return content.replace(/```json/g, '').replace(/```/g, '').trim();
  } catch (error) {
    throw new Error("图片理解失败: " + error.message);
  }
};