const https = require('https');
const url = require('url');

// 🟢 Coze 配置
const COZE_API_URL = 'https://api.coze.cn/v1/workflow/run';
const COZE_AUTH_TOKEN = 'pat_sl1NXuJBKYa5Ulqgov1x0JTSHm3dIQthS0kTfravjVY8ekWVru4UuWnFkwsEhgDO';
const COZE_WORKFLOW_ID = '7565183537184653331';

// 使用 module.exports 导出处理函数
module.exports = async function (req, res) {
  // 1. 设置 CORS 头 (至关重要，否则前端会报跨域错误)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 2. 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // 3. 获取参数
  const xhsLink = req.query.url;

  if (!xhsLink) {
    res.status(400).json({ code: 400, msg: "Missing url parameter" });
    return;
  }

  console.log(`\n[Vercel Function] 收到链接: ${xhsLink}，正在呼叫 Coze...`);

  const requestData = JSON.stringify({
    workflow_id: COZE_WORKFLOW_ID,
    parameters: {
      input: xhsLink 
    }
  });

  // 4. 定义发送请求的 Promise
  const callCoze = () => {
    return new Promise((resolve, reject) => {
      const cozeReq = https.request(COZE_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${COZE_AUTH_TOKEN}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestData)
        }
      }, (cozeRes) => {
        let body = '';
        cozeRes.on('data', chunk => body += chunk);
        cozeRes.on('end', () => resolve(body));
      });

      cozeReq.on('error', (e) => reject(e));
      cozeReq.write(requestData);
      cozeReq.end();
    });
  };

  // 5. 执行逻辑
  try {
    const body = await callCoze();
    // 尝试解析 JSON
    let result;
    try {
        result = JSON.parse(body);
    } catch (e) {
        // 如果 Coze 返回的不是 JSON，直接抛错
        console.error("Coze returned non-JSON:", body);
        throw new Error("Coze response is not valid JSON");
    }
    
    console.log("🔍 Coze 原始返回:", JSON.stringify(result));

    if (result.code === 0) {
      // --- 数据清洗逻辑 ---
      let outputData = result.data;
      try {
          if (typeof outputData === 'string') outputData = JSON.parse(outputData);
      } catch (e) { /* ignore */ }

      // 兼容各种可能的字段名
      let rawList = outputData.image || outputData.image_list || outputData.images || outputData.data || [];
      
      if (typeof rawList === 'string') {
          try { rawList = JSON.parse(rawList); } catch(e) { rawList = [rawList]; }
      }

      let finalImages = [];
      if (Array.isArray(rawList)) {
          finalImages = rawList.map(item => (typeof item === 'string' ? { url: item } : item));
      } else if (rawList) {
          finalImages = [{ url: rawList }];
      }
      // -------------------

      res.status(200).json({
          code: 200,
          msg: "Success",
          data: { image_list: finalImages }
      });

    } else {
      res.status(500).json({ code: 500, msg: result.msg || "Coze Workflow Error" });
    }
  } catch (error) {
    console.error(`❌ 处理错误:`, error);
    res.status(500).json({ code: 500, msg: "Internal Server Error: " + error.message });
  }
};
