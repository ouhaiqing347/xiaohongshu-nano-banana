const https = require('https');
const url = require('url');

// 🟢 Coze 配置
const COZE_API_URL = 'https://api.coze.cn/v1/workflow/run';
const COZE_AUTH_TOKEN = 'pat_sl1NXuJBKYa5Ulqgov1x0JTSHm3dIQthS0kTfravjVY8ekWVru4UuWnFkwsEhgDO';
const COZE_WORKFLOW_ID = '7565183537184653331';

export default async function handler(req, res) {
  // 设置 CORS 头，允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // 获取 URL 参数
  // Vercel 会自动解析 query 参数到 req.query
  const xhsLink = req.query.url;

  if (!xhsLink) {
    res.status(400).json({ code: 400, msg: "Missing url parameter" });
    return;
  }

  console.log(`\n[Vercel Function] 收到链接: ${xhsLink}，正在呼叫 Coze 工作流...`);

  const requestData = JSON.stringify({
    workflow_id: COZE_WORKFLOW_ID,
    parameters: {
      input: xhsLink // 您的工作流入口参数名是 input
    }
  });

  // 使用 Promise 封装 https.request 以便使用 await
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

  try {
    const body = await callCoze();
    const result = JSON.parse(body);
    
    console.log("🔍 Coze 原始返回数据:", JSON.stringify(result));

    if (result.code === 0) {
      let outputData = result.data;
      try {
          if (typeof outputData === 'string') outputData = JSON.parse(outputData);
      } catch (e) {
          console.log("⚠️ Data 不是 JSON 字符串，按对象处理");
      }

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

      const responseForFrontend = {
          code: 200,
          msg: "Success from Coze (via Vercel)",
          data: { image_list: finalImages }
      };

      res.status(200).json(responseForFrontend);

    } else {
      console.error(`❌ Coze 业务报错: ${result.msg}`);
      res.status(500).json({ code: 500, msg: result.msg });
    }
  } catch (error) {
    console.error(`❌ 处理错误:`, error);
    res.status(500).json({ code: 500, msg: "Internal Server Error: " + error.message });
  }
}