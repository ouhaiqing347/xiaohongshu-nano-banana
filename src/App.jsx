import React, { useState, useEffect, useRef } from 'react';
import { 
  Trash2, Download, History, Key, Loader2, XCircle, Sparkles, 
  Copy, Maximize2, X, Dice5, Check, Scissors, ScanEye, Settings, Link, Image as ImageIcon, Plus, BookOpen, HelpCircle, ChevronLeft, ChevronRight, Share2 
} from 'lucide-react';

// ==========================================
// 1. 集成 CSS 样式 (原 App.css)
// ==========================================
const APP_STYLES = `
:root {
  --primary: #0f172a;
  --primary-hover: #1e293b;
  --accent: #f43f5e;
  --accent-light: #fff1f2;
  --bg-page: #f8fafc;
  --bg-card: #ffffff;
  --text-main: #1e293b;
  --text-muted: #64748b;
  --border: #e2e8f0;
  --radius: 16px;
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

* { box-sizing: border-box; }
body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: var(--bg-page); color: var(--text-main); -webkit-tap-highlight-color: transparent; }

.app-container { min-height: 100vh; display: flex; flex-direction: column; overflow-x: hidden; }

/* Header */
.header { background: var(--bg-card); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 50; height: 64px; display: flex; align-items: center; justify-content: center; }
.header-content { width: 100%; max-width: 1280px; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; }
.logo { font-size: 20px; font-weight: 700; display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.logo span { color: var(--accent); }

.status-badge { background: #f1f5f9; padding: 4px 12px; border-radius: 999px; font-size: 13px; color: var(--text-muted); display: flex; align-items: center; gap: 8px; }
.status-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; }
.btn-clear-key { border: none; background: none; color: var(--accent); cursor: pointer; font-size: 11px; margin-left: 4px; }
/* 🌟 优化 Header 按钮样式，适应移动端 */
.btn-set-key { border: 1px solid var(--border); background: white; display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 8px; color: var(--text-main); font-size: 13px; cursor: pointer; transition: 0.2s; white-space: nowrap; }
.btn-set-key:hover { border-color: var(--accent); color: var(--accent); }

/* Modals */
.key-modal { background: var(--accent-light); border-bottom: 1px solid #ffe4e6; padding: 16px; text-align: center; animation: slideDown 0.3s ease; }
.input-key { width: 100%; max-width: 400px; padding: 10px 16px; border: 1px solid #fecdd3; border-radius: 8px; outline: none; }
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

/* 🌟 Main Layout */
.main-content { 
  flex: 1; 
  width: 100%; 
  max-width: 1280px; 
  margin: 0 auto; 
  padding: 32px 24px; 
  display: grid; 
  /* 桌面端布局：左侧宽 380px，右侧自适应 */
  grid-template-columns: 380px 1fr; 
  grid-template-areas: 
    "inputs preview"
    "history preview";
  gap: 32px; 
  align-items: start;
}

.section-inputs { grid-area: inputs; }
.section-history { grid-area: history; }
.section-preview { grid-area: preview; position: sticky; top: 80px; }

/* Cards */
.card { background: var(--bg-card); border-radius: var(--radius); border: 1px solid var(--border); padding: 24px; box-shadow: var(--shadow); }
.section-title { font-size: 16px; font-weight: 600; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px; }
.title-deco { width: 4px; height: 18px; background: var(--accent); border-radius: 4px; }

/* Analysis / Upload Tabs & Zone */
.analysis-tabs { display: flex; gap: 4px; margin-bottom: 0; }
.tab-btn { background: #f1f5f9; border: none; padding: 8px 16px; border-radius: 8px 8px 0 0; font-size: 12px; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s; }
.tab-btn.active { background: #f8fafc; color: var(--accent); font-weight: 500; border: 2px dashed #cbd5e1; border-bottom: none; position: relative; top: 2px; z-index: 2; }

.upload-analysis-zone { margin-bottom: 24px; } 
.analysis-box { border: 2px dashed #cbd5e1; border-radius: 0 12px 12px 12px; background: #f8fafc; min-height: 90px; height: auto; padding: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; color: var(--text-muted); font-size: 13px; gap: 6px; position: relative; z-index: 1; }
.analysis-box:hover { border-color: var(--accent); background: var(--accent-light); color: var(--accent); }
.analysis-box.pulse { border-style: solid; border-color: var(--accent); background: white; animation: pulseBg 1.5s infinite; cursor: wait; }
@keyframes pulseBg { 0% { background-color: #fff1f2; } 50% { background-color: white; } 100% { background-color: #fff1f2; } }

.link-input-wrapper { display: flex; width: 100%; gap: 8px; align-items: center; }

/* 🌟 修改：input-link 样式调整为兼容 textarea */
.input-link { 
  flex: 1; 
  border: 1px solid #e2e8f0; 
  border-radius: 8px; 
  padding: 10px 12px; 
  height: 46px; /* 桌面端默认高度 */
  font-size: 14px; 
  outline: none; 
  width: 100%; 
  resize: none; 
  font-family: inherit;
  line-height: 1.4;
}
.input-link:focus { border-color: var(--accent); }
.btn-extract { background: var(--primary); color: white; border: none; border-radius: 8px; padding: 0 20px; height: 46px; font-size: 14px; cursor: pointer; white-space: nowrap; flex-shrink: 0; }
.btn-extract:hover { background: var(--primary-hover); }

/* Prompts Scroll Container */
.prompts-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-right: 6px; }
.prompts-scroll-container { 
  display: flex; 
  flex-direction: column; 
  gap: 12px; 
  max-height: 480px; 
  overflow-y: auto; 
  padding-right: 4px;
  margin-bottom: 4px;
  padding-bottom: 4px;
}
.prompts-scroll-container::-webkit-scrollbar { width: 4px; }
.prompts-scroll-container::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
.prompts-scroll-container::-webkit-scrollbar-track { background: transparent; }

.prompt-item-box { display: flex; gap: 10px; background: var(--bg-page); padding: 10px; border-radius: 12px; border: 1px solid var(--border); transition: 0.2s; align-items: flex-start; flex-shrink: 0; }
.prompt-item-box:focus-within { border-color: var(--accent); background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }

.prompt-source-thumb { width: 48px; height: 48px; flex-shrink: 0; border-radius: 6px; overflow: hidden; position: relative; cursor: zoom-in; background: #e2e8f0; }
.prompt-source-thumb img { width: 100%; height: 100%; object-fit: cover; }
.thumb-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; opacity: 0; transition: 0.2s; }
.prompt-source-thumb:hover .thumb-overlay { opacity: 1; }

.textarea-prompt-small { flex: 1; height: 100px; min-height: 100px; padding: 6px; background: transparent; border: none; resize: vertical; font-family: inherit; font-size: 14px; line-height: 1.6; outline: none; }
.btn-remove-prompt { background: none; border: none; padding: 4px; color: #cbd5e1; cursor: pointer; transition: 0.2s; }
.btn-remove-prompt:hover { color: #ef4444; background: #fee2e2; border-radius: 4px; }
.btn-icon-small { background: #f1f5f9; border: none; border-radius: 4px; padding: 4px; color: var(--text-muted); cursor: pointer; }
.btn-icon-small:hover { background: #e2e8f0; color: var(--text-main); }

/* Settings Section */
.settings-section {
  margin-top: 16px;
  padding-top: 20px;
  border-top: 1px dashed #e2e8f0;
}

/* Controls */
.style-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 20px; }
.btn-style { padding: 8px; border: 1px solid var(--border); background: white; border-radius: 8px; cursor: pointer; font-size: 12px; transition: 0.2s; text-align: center; }
.btn-style.active { background: var(--primary); color: white; border-color: var(--primary); font-weight: 600; }

.options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
.btn-option { padding: 10px; border: 1px solid var(--border); background: white; border-radius: 8px; cursor: pointer; color: var(--text-muted); font-size: 13px; }
.btn-option.active { background: var(--accent-light); border-color: var(--accent); color: var(--accent); }

.btn-generate { width: 100%; padding: 14px; background: var(--primary); color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; }
.btn-generate:hover:not(:disabled) { background: var(--primary-hover); transform: translateY(-1px); }
.btn-generate:disabled { opacity: 0.7; cursor: not-allowed; }

/* History */
.history-list { display: flex; flex-direction: column; gap: 12px; min-height: 200px; }
.history-item { border: 1px solid var(--border); border-radius: 12px; padding: 12px; cursor: pointer; transition: 0.2s; display: flex; flex-direction: column; gap: 10px; }
.history-item:hover { border-color: var(--accent); background: var(--bg-page); }
.history-content-wrapper { display: flex; gap: 12px; }
.history-thumb { width: 48px; height: 64px; object-fit: cover; border-radius: 6px; background: #f1f5f9; }
.history-info { flex: 1; min-width: 0; }
.history-prompt { font-size: 12px; font-weight: 500; margin: 0 0 4px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.history-meta { font-size: 10px; color: var(--text-muted); }
.history-actions { display: flex; gap: 6px; padding-top: 8px; border-top: 1px solid #f1f5f9; }
.action-btn { flex: 1; background: #f8fafc; border: 1px solid var(--border); border-radius: 6px; padding: 4px 0; font-size: 11px; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; }
.action-btn:hover { background: var(--accent-light); color: var(--accent); border-color: #fecdd3; }
.action-btn.delete:hover { background: #fef2f2; color: #ef4444; border-color: #fee2e2; }

/* Pagination */
.pagination { display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 16px; padding-top: 12px; border-top: 1px solid #f1f5f9; }
.page-btn { background: white; border: 1px solid var(--border); border-radius: 6px; padding: 4px 8px; cursor: pointer; display: flex; align-items: center; color: var(--text-muted); transition: 0.2s; }
.page-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.page-info { font-size: 12px; color: var(--text-muted); }

/* Preview */
.preview-container { min-height: 500px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; background-image: radial-gradient(#e2e8f0 1px, transparent 1px); background-size: 20px 20px; }
.preview-image-wrapper { position: relative; display: flex; justify-content: center; max-width: 100%; border-radius: 8px; overflow: hidden; box-shadow: 0 15px 40px -5px rgba(0, 0, 0, 0.15); transition: 0.3s; }
.preview-image { width: auto; height: auto; max-width: 100%; max-height: 700px; object-fit: contain; display: block; }
.btn-download-main { background: white; color: var(--primary); border: none; padding: 10px 20px; border-radius: 99px; font-size: 13px; font-weight: 600; box-shadow: 0 4px 10px rgba(0,0,0,0.2); cursor: pointer; display: flex; align-items: center; gap: 6px; }

/* Hover Actions */
.hover-actions { opacity: 0; transition: opacity 0.3s; }
.preview-image-wrapper:hover .hover-actions { opacity: 1 !important; bottom: 30px !important; }

/* Lightbox & Toast */
.lightbox-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 999; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s; }
.lightbox-img { max-width: 95vw; max-height: 90vh; border-radius: 8px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); -webkit-user-select: none; user-select: none; }
.lightbox-close { position: absolute; top: 20px; right: 20px; color: white; background: rgba(255,255,255,0.2); border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 1001; }
/* 🌟 移动端长按提示区域 */
.mobile-press-hint { display: none; position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.6); color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; pointer-events: none; }

/* 🌟 Lightbox 底部操作栏样式 - 默认底部30px */
.lightbox-actions { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); display: flex; gap: 16px; z-index: 1002; }

.toast-msg { position: fixed; top: 80px; left: 50%; transform: translateX(-50%); background: #1e293b; color: white; padding: 8px 16px; border-radius: 99px; font-size: 13px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000; display: flex; align-items: center; gap: 8px; animation: slideDown 0.3s; }
.loading-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.85); backdrop-filter: blur(4px); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; }
.progress-bar { width: 240px; height: 6px; background: #eee; border-radius: 10px; overflow: hidden; margin-bottom: 12px; }
.progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), #fb7185); width: 0; animation: progressMove 12s ease-out forwards; }
@keyframes progressMove { 0% { width: 0; } 100% { width: 98%; } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
.error-msg { color: #ef4444; font-size: 12px; margin-top: 10px; display: flex; align-items: center; gap: 6px; justify-content: center; }

/* Mobile Navigation Bar */
.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid #e2e8f0;
  padding: 8px 0;
  padding-bottom: max(8px, env(safe-area-inset-bottom));
  z-index: 1000;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05);
}
.nav-item { display: flex; flex-direction: column; align-items: center; gap: 4px; background: none; border: none; font-size: 10px; color: #64748b; width: 100%; }
.nav-item:active { color: var(--accent); }

/* 🌟 Mobile Optimization */
@media (max-width: 640px) {
  .header { height: 56px; }
  .header-content { padding: 0 16px; }
  .logo { font-size: 16px; }
  .logo span { display: none; }
  
  .header-actions { gap: 8px !important; }
  .btn-set-key { padding: 6px 8px; font-size: 12px; }
  .btn-set-key svg { width: 14px; height: 14px; }
  .btn-set-key span.btn-text { display: none; }
  
  .main-content { 
    display: flex; 
    flex-direction: column; 
    padding: 16px 12px; /* 🌟 核心：减小左右内边距 */
    gap: 20px; 
    padding-bottom: 80px; 
    width: 100%; /* 🌟 核心：强制宽度 */
    max-width: 100vw;
    overflow-x: hidden;
  }
  
  /* 🌟 核心：强制所有板块占满宽度，防止缩窄 */
  .section-inputs, .section-preview, .section-history { 
    width: 100%; 
    min-width: 0; /* 修复 Flex 子项溢出问题 */
  }
  
  /* 🌟 核心：减小 Card 内边距 */
  .card { padding: 16px; width: 100%; }

  /* 🌟 核心：优化移动端预览区高度 */
  .preview-container { min-height: 320px; }
  .preview-image { max-height: 50vh; }

  /* 布局顺序：输入 -> 预览 -> 历史 */
  .section-inputs { order: 1; }
  .section-preview { 
    order: 2; 
    position: static; 
    margin-bottom: 0; 
  } 
  .section-history { order: 3; }
  
  .history-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .preview-image-wrapper:hover .hover-actions { opacity: 1 !important; bottom: 20px !important; width: 90%; }
  
  .mobile-press-hint { display: block; }
  
  /* 🌟 核心：移动端 Lightbox 按钮组大幅上移，避开底部操作区 */
  .lightbox-actions { bottom: 180px; } 

  .link-input-wrapper { flex-direction: column; align-items: stretch; }
  .btn-extract { width: 100%; margin-top: 4px; }
  /* 🌟 移动端：粘贴链接框增高至120px，并强制为 textarea 样式 */
  .input-link { height: 120px !important; white-space: normal; overflow-y: auto; }
  .tab-btn { flex: 1; justify-content: center; }
  .bottom-nav { display: flex; }
}
@media (min-width: 641px) {
  .btn-set-key span.btn-text { display: inline; }
}
`;

// ==========================================
// 2. 集成 API 逻辑 (原 api.js)
// ==========================================
const API_BASE = 'https://api.kie.ai/api/v1/jobs';

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

const generateImage = async (apiKey, prompt, resolution) => {
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

// 🌟 核心修改：将本地代理地址改为 Vercel 部署后的 API 相对路径
const extractImagesFromLink = async (xhsLink, tikhubKey) => {
  try {
    // 之前是: http://localhost:3002/tikhub-proxy...
    // 现在改为相对路径，这样 Vercel 部署后会自动指向当前域名的 /api/tikhub-proxy
    const proxyUrl = `/api/tikhub-proxy?url=${encodeURIComponent(xhsLink)}`;
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: { 'Authorization': tikhubKey.startsWith('Bearer') ? tikhubKey : `Bearer ${tikhubKey}` }
    });

    if (!response.ok) throw new Error("代理连接失败，请检查 Vercel 函数日志");

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
      const limitedList = list.slice(0, 5); 
      return limitedList.map(img => (typeof img === 'string' ? img : img.url));
    } else {
      throw new Error("未解析到图片");
    }
  } catch (error) {
    throw new Error("解析异常: " + error.message);
  }
};

const analyzeImage = async (visionConfig, inputSource, systemInstruction) => {
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

// ==========================================
// 3. 主程序逻辑 (App 组件)
// ==========================================

// --- 飞书神级指令 ---
const VISION_SYSTEM_PROMPT = `
识别要求：
1、链接或上传的有几张图，你就识别几张图，分别按“图片1+提示词”“图片2+提示词”，以此类推这样的方式；不可遗漏，也不可多张图识别到一起。
2、需要精准还原原图的视觉效果，核心在于精准复刻图片中的文字内容、字体形态、画面细节；
3、文字内容绝对精准描述，这是最高优化级，在描述中，将“文字内容”和“字体样式”放在最前面，确保生成的权重最高，你必须明确指出图片中出现了哪些具体的汉字。
4、描述文字的排版结构（如：文字作为视觉主体占据80%画面、文字蓝色文本框中等）。
5、输出的提示词必须完全使用中文，因为 Nana Banana Pro 在此场景下需要精准的中文语义控制。
`;

const STYLE_PRESETS = {
  default: { label: '标准', suffix: ', minimalist and high-end layout, trending Xiaohongshu aesthetic, professional studio lighting, clean background, 4K resolution, high fidelity.' },
  premium: { label: '高级感', suffix: ', luxury magazine cover style, elegant serif font placement, premium textures, gold and marble elements, extremely sharp typography, high legibility text, clear rendering, sophisticated color grading, 4K resolution, sharp focus.' },
  multi: { label: '多宫格', suffix: ', distinct 4-panel collage, infographic style, clear bold typography, high definition text, clean borders, professional poster layout, 4K resolution, no speech bubbles.' }
};

const RANDOM_PROMPTS = [
  "City Walk穿搭分享，都市街头背景，自然光感，松弛感，全身照",
  "极简书桌布置，MacBook和冰美式，温暖灯光，ins风氛围感",
  "健康减脂早餐打卡，俯拍视角，新鲜水果与酸奶，色彩鲜艳诱人",
  "职场高效工作法，商务简约背景，发光的笔记本，思维导图元素",
  "法式复古下午茶，精致甜点架，花园背景，油画质感"
];

const LOADING_TIPS = [
  "💡 爆款技巧：标题字号一定要大，占比画面 1/3 更吸睛",
  "💡 运营心得：发布时间选在晚上 6-9 点，流量最即时",
  "💡 视觉建议：多宫格图片适合展示教程，单图适合展示氛围",
  "💡 涨粉秘籍：真人出镜比纯风景更容易建立信任感"
];

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result.split(',')[1]);
  reader.onerror = error => reject(error);
});

// 🌟 常量：历史记录每页显示数量
const HISTORY_ITEMS_PER_PAGE = 3;

export default function App() {
  // 生图状态
  const [apiKey, setApiKey] = useState('');
  // 🌟 修改：prompt 改为 prompts 数组，支持多图
  const [prompts, setPrompts] = useState(['']); 
  // 🌟 新增：存储解析来源图的缩略图 (URL 或 Base64)
  const [sourceImages, setSourceImages] = useState([]); 

  const [resolution, setResolution] = useState('2K');
  const [currentStyle, setCurrentStyle] = useState('default');
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(null); // 预览区的当前图片
  const [history, setHistory] = useState([]);
  
  // 视觉/链接解析状态
  const [showVisionConfig, setShowVisionConfig] = useState(false);
  const [visionConfig, setVisionConfig] = useState({
    apiKey: '',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', 
    model: 'qwen-vl-max',
    tikhubKey: '' 
  });
  const [analysisMode, setAnalysisMode] = useState('link'); // link | file
  const [xhsLink, setXhsLink] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState('');

  // UI
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState(''); 
  const [errorMsg, setErrorMsg] = useState('');
  const [lightboxImg, setLightboxImg] = useState(null);
  const [toast, setToast] = useState('');
  const [loadingTip, setLoadingTip] = useState(LOADING_TIPS[0]);
  
  // 🌟 新增：控制指南弹窗的显示状态
  const [showGuide, setShowGuide] = useState(false);
  
  // 🌟 新增：历史记录分页状态
  const [historyPage, setHistoryPage] = useState(1);

  // 🌟 新增：滚动引用
  const generateSectionRef = useRef(null);
  const historySectionRef = useRef(null);

  // 🌟 滚动辅助函数
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // 初始化
  useEffect(() => {
    const storedKey = localStorage.getItem('xiaohongshu_api_key');
    const storedVision = localStorage.getItem('xhs_vision_config');
    const storedHistory = localStorage.getItem('xiaohongshu_history');
    if (storedKey) setApiKey(storedKey);
    if (storedVision) setVisionConfig(JSON.parse(storedVision));
    if (storedHistory) setHistory(JSON.parse(storedHistory));
  }, []);

  // 轮播 Tips
  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingTip(LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)]);
      interval = setInterval(() => {
        setLoadingTip(LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2000); };
  
  const handleSaveKey = (val) => { 
    const k = val.trim(); 
    if (k) { 
      setApiKey(k); 
      localStorage.setItem('xiaohongshu_api_key', k); 
      setShowKeyInput(false); 
      setTempKeyInput(''); 
      showToast('生图密钥已保存');
    }
  };

  const saveVisionConfig = () => { localStorage.setItem('xhs_vision_config', JSON.stringify(visionConfig)); setShowVisionConfig(false); showToast('配置已保存'); };
  
  // 🌟 修改：随机提示词只覆盖当前第一个，或者全部重置为单个
  const handleRandomPrompt = () => { 
    setPrompts([RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)]]); 
    setSourceImages([]); // 随机灵感清空原图引用
  };
  
  // 🌟 修复复制功能：兼容性处理
  const copyToClipboard = (e, text) => { e.stopPropagation(); navigator.clipboard.writeText(text); showToast('已复制'); };
  
  const copyImageToClipboard = async () => {
    if (!currentImage) return;
    try {
      // 尝试现代 API
      const response = await fetch(currentImage);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      showToast('图片已复制');
    } catch (err) {
      console.error("Clipboard API failed:", err);
      // 回退方案：如果环境不支持 Clipboard API (如非 HTTPS)
      // 提示用户长按
      showToast('请长按图片进行复制');
    }
  };
  const downloadImg = (url) => { const a = document.createElement('a'); a.href = url; a.download = `xhs-${Date.now()}.jpg`; a.click(); };

  // --- 🌟 核心解析流程 ---
  const startAnalysis = async (analysisFn, onSuccess) => {
    if (!visionConfig.apiKey) { setShowVisionConfig(true); setErrorMsg("请先配置视觉模型 API Key"); return; }
    setAnalyzing(true);
    setErrorMsg('');
    try {
      const result = await analysisFn();
      
      // 🌟 尝试解析 JSON 数组
      let parsedPrompts = [];
      try {
        parsedPrompts = JSON.parse(result);
        if (!Array.isArray(parsedPrompts)) {
            // 如果解析出来不是数组，强制转数组
            parsedPrompts = [result];
        }
      } catch (e) {
        // 解析失败，说明 AI 返回了纯文本，直接当做单条
        parsedPrompts = [result];
      }
      
      setPrompts(parsedPrompts);
      showToast(`提取成功，生成 ${parsedPrompts.length} 组提示词`);
      if (onSuccess) onSuccess();

    } catch (err) { setErrorMsg(err.message); } 
    finally { setAnalyzing(false); setAnalyzeProgress(''); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // 预览本地图片
    const reader = new FileReader();
    reader.onload = (evt) => setSourceImages([evt.target.result]);
    reader.readAsDataURL(file);

    startAnalysis(async () => {
      setAnalyzeProgress('读取图片...');
      const base64 = await fileToBase64(file);
      setAnalyzeProgress('AI 正在分析...');
      return await analyzeImage(visionConfig, base64, VISION_SYSTEM_PROMPT);
    });
    e.target.value = null;
  };

  const handleLinkAnalysis = async () => {
    const linkMatch = xhsLink.match(/(https?:\/\/[^\s]+)/);
    const cleanUrl = linkMatch ? linkMatch[0] : xhsLink.trim();

    if (!cleanUrl) { showToast('未识别到有效链接，请检查'); return; }

    startAnalysis(async () => {
      setAnalyzeProgress('提取图片...');
      const urls = await extractImagesFromLink(cleanUrl, visionConfig.tikhubKey);
      
      // 🌟 核心修改：提取到图片后，立即设置好对应数量的框，而不是等 AI
      setSourceImages(urls);
      setPrompts(new Array(urls.length).fill('')); // 立即占位

      setAnalyzeProgress(`分析 ${urls.length} 张图片...`);
      return await analyzeImage(visionConfig, urls, VISION_SYSTEM_PROMPT);
    });
  };

  // --- 🌟 批量生图流程 ---
  const handleGenerate = async () => {
    if (!apiKey) { setShowKeyInput(true); return; }
    
    // 过滤空提示词
    const validPrompts = prompts.filter(p => p.trim());
    if (validPrompts.length === 0) { setErrorMsg('请输入提示词'); return; }
    
    setLoading(true); 
    setErrorMsg(''); 
    
    // 这里我们做一个简单的串行或并行处理
    // 为了防止请求过于频繁被限制，我们使用 Promise.allSettled 并发（如果后端支持）或者串行
    // 考虑到体验，我们并发发起，但 UI 上需要处理
    
    try {
      const tasks = validPrompts.map((p, index) => {
          const optimizedPrompt = `${p.trim()}${STYLE_PRESETS[currentStyle].suffix}`;
          return generateImage(apiKey, optimizedPrompt, resolution).then(url => ({
              status: 'fulfilled', 
              url, 
              prompt: p,
              originalIndex: index
          })).catch(err => ({
              status: 'rejected',
              reason: err.message,
              prompt: p,
              originalIndex: index
          }));
      });

      const results = await Promise.all(tasks);
      
      const newHistoryItems = [];
      let successCount = 0;

      results.forEach(res => {
          if (res.status === 'fulfilled') {
              successCount++;
              newHistoryItems.push({
                  id: Date.now() + Math.random(), // 防止 ID 冲突
                  prompt: res.prompt,
                  styleLabel: STYLE_PRESETS[currentStyle].label,
                  resolution,
                  imageUrl: res.url,
                  timestamp: new Date().toLocaleString()
              });
          } else {
              console.error("生成失败:", res.reason);
          }
      });

      if (newHistoryItems.length > 0) {
          // 更新历史记录
          const updatedHistory = [...newHistoryItems, ...history];
          setHistory(updatedHistory);
          localStorage.setItem('xiaohongshu_history', JSON.stringify(updatedHistory));
          // 设置最后一张图为预览
          setCurrentImage(newHistoryItems[0].imageUrl);
          
          // 🌟 自动跳转到历史记录第一页
          setHistoryPage(1);
      }

      if (successCount === validPrompts.length) {
          showToast('批量生成完成！');
      } else if (successCount > 0) {
          showToast(`部分成功：${successCount}/${validPrompts.length}`);
      } else {
          setErrorMsg('所有任务均失败，请检查 Key 或网络');
      }

    } catch (err) { 
        setErrorMsg(err.message || '生成流程异常'); 
    } finally { 
        setLoading(false); 
    }
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { if (!loading) handleGenerate(); }
  };

  const deleteRecord = (e, id) => {
    e.stopPropagation();
    const newH = history.filter(h => h.id !== id);
    setHistory(newH);
    localStorage.setItem('xiaohongshu_history', JSON.stringify(newH));
    if (currentImage === history.find(i => i.id === id)?.imageUrl) setCurrentImage(null);
    
    // 如果当前页删完了且不是第一页，自动前一页
    const totalPages = Math.ceil(newH.length / HISTORY_ITEMS_PER_PAGE);
    if (historyPage > totalPages && historyPage > 1) {
        setHistoryPage(historyPage - 1);
    }
  };

  // 辅助函数：修改指定索引的提示词
  const updatePrompt = (index, newVal) => {
    const newPrompts = [...prompts];
    newPrompts[index] = newVal;
    setPrompts(newPrompts);
  };

  // 辅助函数：删除指定提示词框
  const removePromptBox = (index) => {
    const newPrompts = prompts.filter((_, i) => i !== index);
    const newSources = sourceImages.filter((_, i) => i !== index);
    setPrompts(newPrompts.length ? newPrompts : ['']); // 至少保留一个
    setSourceImages(newSources);
  };

  // 辅助函数：添加空提示词框
  const addPromptBox = () => {
    setPrompts([...prompts, '']);
  };

  // 🌟 分页计算逻辑
  const totalHistoryPages = Math.ceil(history.length / HISTORY_ITEMS_PER_PAGE);
  const currentHistoryItems = history.slice(
    (historyPage - 1) * HISTORY_ITEMS_PER_PAGE,
    historyPage * HISTORY_ITEMS_PER_PAGE
  );

  return (
    <div className="app-container">
      {/* 注入样式 */}
      <style>{APP_STYLES}</style>

      {toast && <div className="toast-msg"><Check size={14} /> {toast}</div>}

      {/* 🌟 新增：使用指南 Modal */}
      {showGuide && (
        <div className="lightbox-overlay" onClick={() => setShowGuide(false)}>
          <div className="card" style={{width:'500px', animation:'slideDown 0.3s', position: 'relative'}} onClick={e => e.stopPropagation()}>
             <button className="lightbox-close" style={{top:'12px', right:'12px', width:'28px', height:'28px', background:'#f1f5f9', color:'#64748b'}} onClick={() => setShowGuide(false)}><X size={16} /></button>
             <h2 className="section-title" style={{ fontSize:'18px', borderBottom:'1px solid #f1f5f9', paddingBottom:'12px', marginBottom:'16px' }}>
               <BookOpen size={20} className="text-accent" color="#f43f5e"/> 使用指南
             </h2>
             <div style={{ fontSize:'14px', color:'#334155', lineHeight:'1.7' }}>
               <p style={{marginBottom:'12px', fontWeight:'500'}}>本应用基于 Nano Banana Pro 生图模型，专为复刻爆款小红书笔记图片设计。</p>
               <div style={{background:'#f8fafc', padding:'16px', borderRadius:'12px'}}>
                 <p style={{marginBottom:'8px', fontWeight:'600', color:'#0f172a'}}>支持 3 种生图方式：</p>
                 <ul style={{margin:0, paddingLeft:'18px', display:'flex', flexDirection:'column', gap:'8px'}}>
                   <li><strong>方式 1 - 链接提取：</strong>复制小红书笔记链接，粘贴到输入框并点击提取，系统会自动解析多张图片并生成对应提示词，点击生成即可批量出图。</li>
                   <li><strong>方式 2 - 图片仿写：</strong>点击上传图片文件，AI 将分析图片内容生成提示词，再点击生成即可复刻原图风格。</li>
                   <li><strong>方式 3 - 自由创作：</strong>在提示词输入框中直接输入描述，点击生成即可创作新图片。</li>
                 </ul>
               </div>
             </div>
             <div style={{marginTop:'20px', textAlign:'right'}}>
               <button onClick={() => setShowGuide(false)} className="btn-generate" style={{width:'auto', padding:'8px 20px', marginLeft:'auto'}}>知道了</button>
             </div>
          </div>
        </div>
      )}
      
      {/* 视觉配置 Modal (保持不变) */}
      {showVisionConfig && (
        <div className="lightbox-overlay" style={{cursor:'default'}}>
          <div className="card" style={{width:'400px', animation:'slideDown 0.3s'}}>
            <h3 className="section-title"><ScanEye size={20} /> 仿图配置 (Vision)</h3>
            <p style={{fontSize:'12px', color:'#64748b', marginBottom:'16px'}}>需配置视觉模型(Vision)及解析服务(Tikhub)。</p>
            <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
              <div style={{borderBottom:'1px solid #f1f5f9', paddingBottom:'12px', marginBottom:'4px'}}>
                <label style={{fontSize:'12px', fontWeight:'600', display:'block', marginBottom:'4px'}}>AI 视觉模型 (必填)</label>
                <input placeholder="API Key (Qwen/OpenAI)" type="password" className="input-key" value={visionConfig.apiKey} onChange={e => setVisionConfig({...visionConfig, apiKey: e.target.value})} style={{marginBottom:'8px'}} />
                <input placeholder="Base URL" className="input-key" value={visionConfig.baseUrl} onChange={e => setVisionConfig({...visionConfig, baseUrl: e.target.value})} style={{marginBottom:'8px'}} />
                <input placeholder="Model Name (如 qwen-vl-max)" className="input-key" value={visionConfig.model} onChange={e => setVisionConfig({...visionConfig, model: e.target.value})} />
              </div>
              
              <div style={{marginBottom:'4px'}}>
                <label style={{fontSize:'12px', fontWeight:'600', display:'block', marginBottom:'4px'}}>链接解析服务 (Tikhub)</label>
                <input placeholder="Tikhub API Key (Bearer ...)" type="password" className="input-key" value={visionConfig.tikhubKey} onChange={e => setVisionConfig({...visionConfig, tikhubKey: e.target.value})} />
                <p style={{fontSize:'10px', color:'#94a3b8', marginTop:'4px'}}>若不填，链接解析将使用模拟数据。</p>
              </div>

              <div style={{display:'flex', gap:'8px', marginTop:'8px'}}>
                <button onClick={saveVisionConfig} className="btn-generate" style={{flex:1}}>保存配置</button>
                <button onClick={() => setShowVisionConfig(false)} className="btn-option" style={{flex:1}}>取消</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 优化后的 Lightbox - 支持长按/复制/下载 */}
      {lightboxImg && (
        <div className="lightbox-overlay" onClick={() => setLightboxImg(null)}>
          <button className="lightbox-close"><X size={20} /></button>
          
          <img src={lightboxImg} className="lightbox-img" onClick={(e) => e.stopPropagation()} alt="fullscreen" />
          
          {/* 移动端长按提示 */}
          <div className="mobile-press-hint">长按图片可保存或复制</div>
          
          {/* 底部操作栏 (PC/Mobile 通用，Mobile 下更显眼) */}
          <div className="lightbox-actions" onClick={e => e.stopPropagation()}>
             <button onClick={() => {
                 // 复制图片逻辑
                 try {
                    // 如果环境不支持 fetch blob (比如跨域), 直接提示
                    if (!navigator.clipboard) {
                        showToast("请长按图片保存或复制");
                        return;
                    }
                    
                    fetch(lightboxImg)
                        .then(res => res.blob())
                        .then(blob => {
                            navigator.clipboard.write([new ClipboardItem({[blob.type]: blob})])
                                .then(() => showToast("图片已复制"))
                                .catch(() => showToast("请长按图片保存"));
                        })
                        .catch(() => showToast("请长按图片保存"));
                 } catch (e) {
                     showToast("请长按图片保存");
                 }
             }} className="btn-download-main" style={{backgroundColor:'white', color:'#0f172a', padding:'10px 20px', borderRadius:'99px', display:'flex', alignItems:'center', gap:'6px'}}>
                 <Scissors size={16} /> <span className="btn-text">复制</span>
             </button>
             <button onClick={() => downloadImg(lightboxImg)} className="btn-download-main" style={{backgroundColor: '#f43f5e', color:'white', padding:'10px 20px', borderRadius:'99px', border:'none', display:'flex', alignItems:'center', gap:'6px'}}>
                 <Download size={16} /> <span className="btn-text">保存相册</span>
             </button>
          </div>
        </div>
      )}

      <header className="header">
        <div className="header-content">
          <div className="logo"><Sparkles color="#f43f5e" size={24} /> XHS Note <span>Creator</span></div>
          {/* 🌟 核心修改区域：顶部导航栏优化 */}
          <div className="header-actions" style={{display:'flex', gap:'8px', alignItems:'center'}}>
            <button onClick={() => setShowGuide(true)} className="btn-set-key" style={{border:'none', background:'transparent', color:'#64748b'}} title="使用指南">
                <BookOpen size={16} /> <span className="btn-text">使用指南</span>
            </button>
            <button onClick={() => setShowVisionConfig(true)} className="btn-set-key" style={{border:'1px dashed #cbd5e1', color:'#64748b'}} title="识图配置">
                <ScanEye size={16} /> <span className="btn-text">识图配置</span>
            </button>
            <button onClick={() => setShowKeyInput(true)} className="btn-set-key" style={apiKey ? {borderColor:'#22c55e', color:'#22c55e', background:'#f0fdf4'} : {}} title="API配置">
                <Key size={16} /> <span className="btn-text">API配置</span> {apiKey && <div className="status-dot" style={{background:'#22c55e', marginLeft:'4px'}}></div>}
            </button>
          </div>
        </div>
      </header>

      {showKeyInput && !apiKey && (
        <div className="key-modal">
          <div style={{display: 'flex', gap: '8px', maxWidth: '500px', margin: '0 auto'}}>
            <input 
              type="password" 
              placeholder="在此粘贴生图 API Key (sk-...)" 
              className="input-key" 
              value={tempKeyInput}
              onChange={(e) => setTempKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveKey(tempKeyInput)} 
            />
            <button 
              className="btn-extract" 
              style={{height:'auto', padding:'0 24px', fontSize:'14px', whiteSpace:'nowrap'}}
              onClick={() => handleSaveKey(tempKeyInput)}
            >
              保存 Key
            </button>
          </div>
        </div>
      )}

      {/* 🌟 Refactored Main Structure */}
      <main className="main-content">
        
        {/* 1. INPUTS SECTION */}
        <section className="section-inputs" ref={generateSectionRef}>
          <div className="card">
            <h2 className="section-title"><span className="title-deco"></span> 封面创作 <button onClick={handleRandomPrompt} className="action-btn" style={{marginLeft:'auto', width:'auto', padding:'4px 12px'}}><Dice5 size={14} /> 灵感</button></h2>
            
            <div className="analysis-tabs">
              <button className={`tab-btn ${analysisMode === 'link' ? 'active' : ''}`} onClick={() => setAnalysisMode('link')}><Link size={14} /> 粘贴链接提取</button>
              <button className={`tab-btn ${analysisMode === 'file' ? 'active' : ''}`} onClick={() => setAnalysisMode('file')}><ImageIcon size={14} /> 上传图片文件</button>
            </div>
            <div className="upload-analysis-zone">
               {analysisMode === 'link' ? (
                 <div className={`analysis-box ${analyzing ? 'pulse' : ''}`} style={{cursor: 'default'}}>
                   {analyzing ? <><Loader2 className="spin" size={24} color="#f43f5e" /><span>{analyzeProgress}</span></> : (
                     <div className="link-input-wrapper">
                       {/* 🌟 核心修改：将 input 改为 textarea，以支持多行显示 */}
                       <textarea 
                         className="input-link" 
                         placeholder="在此粘贴小红书链接..." 
                         value={xhsLink} 
                         onChange={(e) => setXhsLink(e.target.value)} 
                         onKeyDown={(e) => e.key === 'Enter' && handleLinkAnalysis()} 
                       />
                       <button className="btn-extract" onClick={handleLinkAnalysis}>提取并分析</button>
                     </div>
                   )}
                 </div>
               ) : (
                 <>
                   <input type="file" id="vision-upload" accept="image/*" style={{display:'none'}} onChange={handleFileUpload} disabled={analyzing} />
                   <label htmlFor="vision-upload" className={`analysis-box ${analyzing ? 'pulse' : ''}`}>
                     {analyzing ? <><Loader2 className="spin" size={24} color="#f43f5e" /><span>{analyzeProgress}</span></> : <><ScanEye size={24} color="#64748b" /><span>点击上传原图，AI 自动复刻</span></>}
                   </label>
                 </>
               )}
            </div>

            <div className="prompts-header">
                <label style={{fontSize:'14px', color:'#64748b', fontWeight:'500'}}>
                    提示词 ({prompts.length}) {sourceImages.length > 0 && <span style={{fontSize:'12px', color:'#94a3b8'}}>· 对应 {sourceImages.length} 张原图</span>}
                </label>
                <button onClick={addPromptBox} className="btn-icon-small" title="添加输入框"><Plus size={14} /></button>
            </div>
            
            <div className="prompts-scroll-container">
                {prompts.map((promptText, idx) => (
                    <div key={idx} className="prompt-item-box">
                        {sourceImages[idx] && (
                            <div className="prompt-source-thumb" onClick={() => setLightboxImg(sourceImages[idx])}>
                                <img src={sourceImages[idx]} alt={`source-${idx}`} />
                                <div className="thumb-overlay"><ScanEye size={12} /></div>
                            </div>
                        )}
                        <textarea 
                            value={promptText} 
                            onChange={(e) => updatePrompt(idx, e.target.value)} 
                            onKeyDown={handleKeyDown} 
                            placeholder={analyzing ? `正在分析第 ${idx + 1} 张图片...` : `提示词 ${idx + 1}...`} 
                            className="textarea-prompt-small" 
                        />
                        <button onClick={() => removePromptBox(idx)} className="btn-remove-prompt">
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="settings-section">
                <div style={{marginBottom: '20px'}}>
                  <label style={{display:'block', marginBottom:'8px', fontSize:'14px', color:'#64748b'}}>风格增强</label>
                  <div className="style-grid">
                    {Object.keys(STYLE_PRESETS).map(key => (<button key={key} onClick={() => setCurrentStyle(key)} className={`btn-style ${currentStyle === key ? 'active' : ''}`}>{STYLE_PRESETS[key].label}</button>))}
                  </div>
                </div>

                <div style={{marginBottom: '24px'}}>
                  <label style={{display:'block', marginBottom:'8px', fontSize:'14px', color:'#64748b'}}>画质选择</label>
                  <div className="options-grid">
                    <button onClick={() => setResolution('1K')} className={`btn-option ${resolution === '1K' ? 'active' : ''}`}>1K</button>
                    <button onClick={() => setResolution('2K')} className={`btn-option ${resolution === '2K' ? 'active' : ''}`}>2K (推荐)</button>
                  </div>
                </div>

                <button onClick={handleGenerate} disabled={loading} className="btn-generate">
                  {loading ? <><Loader2 className="spin" size={20} /> 正在批量生成中...</> : `立即生成 ${prompts.length} 张 (Ctrl+Enter)`}
                </button>
                {errorMsg && <div className="error-msg"><XCircle size={14} /> {errorMsg}</div>}
            </div>
          </div>
        </section>

        {/* 2. PREVIEW SECTION (Mobile Order: 2) */}
        <section className="section-preview">
          <div className="card preview-container">
            {loading && <div className="loading-overlay"><div className="progress-bar"><div className="progress-fill"></div></div><p style={{fontWeight:500, color:'#1e293b'}}>{loadingTip}</p></div>}
            {currentImage ? (
              <div className="preview-image-wrapper">
                 <img src={currentImage} className="preview-image" style={{ aspectRatio: '3/4', cursor: 'zoom-in' }} alt="result" onClick={() => setLightboxImg(currentImage)}/>
                 <div style={{position:'absolute', top:'10px', right:'10px', background:'rgba(0,0,0,0.5)', color:'white', padding:'4px', borderRadius:'4px', pointerEvents:'none'}}><Maximize2 size={16} /></div>
                 <div className="hover-actions" style={{display:'flex', gap:'10px', position:'absolute', bottom:'24px', left:'50%', transform:'translateX(-50%)', width:'90%', justifyContent:'center'}}>
                   <button onClick={copyImageToClipboard} className="btn-download-main" style={{backgroundColor:'white', color:'#0f172a', padding:'10px 16px'}}><Scissors size={16} /> 复制</button>
                   <button onClick={() => downloadImg(currentImage)} className="btn-download-main" style={{padding:'10px 16px'}}><Download size={16} /> 下载</button>
                 </div>
              </div>
            ) : <div style={{textAlign:'center', color:'#cbd5e1'}}>预览区域 (3:4)</div>}
          </div>
        </section>

        {/* 3. HISTORY SECTION (Mobile Order: 3) */}
        <section className="section-history" ref={historySectionRef}>
          <div className="card">
            <h3 className="section-title" style={{fontSize:'14px'}}><History size={16} color="#94a3b8" /> 历史记录</h3>
            <div className="history-list">
              {currentHistoryItems.map((h) => (
                <div key={h.id} className="history-item" onClick={() => {
                    // 点击历史记录时，我们将所有输入框重置为这一个，方便重绘
                    setPrompts([h.prompt]); 
                    setCurrentImage(h.imageUrl);
                    // 🌟 核心修改：点击历史记录条目，自动打开大图 Lightbox
                    setLightboxImg(h.imageUrl);
                    setSourceImages([]); // 清空来源图
                }}>
                  <div className="history-content-wrapper">
                    <img src={h.imageUrl} className="history-thumb" alt="thumb" />
                    <div className="history-info">
                      <p className="history-prompt">[{h.styleLabel}] {h.prompt}</p>
                      <p className="history-meta">{h.timestamp} · {h.resolution}</p>
                    </div>
                  </div>
                  <div className="history-actions">
                    <button className="action-btn" onClick={(e) => copyToClipboard(e, h.prompt)}><Copy size={12} /> 复制</button>
                    <button className="action-btn" onClick={() => {
                        e.stopPropagation(); // 阻止冒泡
                        setPrompts([h.prompt]); 
                        setCurrentImage(h.imageUrl);
                    }}><Sparkles size={12} /> 重新编辑</button>
                    <button className="action-btn" onClick={(e) => {e.stopPropagation(); downloadImg(h.imageUrl);}}><Download size={12} /> 下载</button>
                    <button className="action-btn delete" onClick={(e) => deleteRecord(e, h.id)}><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
              {history.length === 0 && <div style={{textAlign:'center', color:'#cbd5e1', padding:'20px'}}>暂无记录</div>}
            </div>
            
            {history.length > HISTORY_ITEMS_PER_PAGE && (
                <div className="pagination">
                    <button 
                        className="page-btn" 
                        disabled={historyPage === 1} 
                        onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                    >
                        <ChevronLeft size={16} /> 上一页
                    </button>
                    <span className="page-info">{historyPage} / {totalHistoryPages}</span>
                    <button 
                        className="page-btn" 
                        disabled={historyPage === totalHistoryPages} 
                        onClick={() => setHistoryPage(p => Math.min(totalHistoryPages, p + 1))}
                    >
                        下一页 <ChevronRight size={16} />
                    </button>
                </div>
            )}
          </div>
        </section>

      </main>

      <div className="bottom-nav">
        <button className="nav-item" onClick={() => scrollToSection(generateSectionRef)}>
          <ImageIcon size={20} />
          <span>生成图片</span>
        </button>
        <button className="nav-item" onClick={() => setShowGuide(true)}>
          <BookOpen size={20} />
          <span>使用指南</span>
        </button>
        <button className="nav-item" onClick={() => scrollToSection(historySectionRef)}>
          <History size={20} />
          <span>查看记录</span>
        </button>
      </div>
    </div>
  );
}