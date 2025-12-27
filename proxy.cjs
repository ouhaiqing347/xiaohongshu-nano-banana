const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3002;

// 🟢 Coze 配置
const COZE_API_URL = 'https://api.coze.cn/v1/workflow/run';
const COZE_AUTH_TOKEN = 'pat_sl1NXuJBKYa5Ulqgov1x0JTSHm3dIQthS0kTfravjVY8ekWVru4UuWnFkwsEhgDO';
const COZE_WORKFLOW_ID = '7565183537184653331';

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.url.startsWith('/tikhub-proxy')) {
    const myUrl = new url.URL(req.url, `http://localhost:${PORT}`);
    const xhsLink = myUrl.searchParams.get('url');

    if (!xhsLink) {
      res.writeHead(400); res.end(JSON.stringify({ code: 400, msg: "Missing url" })); return;
    }

    console.log(`\n[Coze] 收到链接，正在呼叫工作流...`);

    const requestData = JSON.stringify({
      workflow_id: COZE_WORKFLOW_ID,
      parameters: {
        input: xhsLink // 您的工作流入口参数名是 input
      }
    });

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
      cozeRes.on('end', () => {
        try {
          const result = JSON.parse(body);
          
          // 🛑 调试核心：把 Coze 返回的真实数据打印出来，不再猜！
          console.log("🔍 Coze 原始返回数据:", JSON.stringify(result));

          if (result.code === 0) {
            let outputData = result.data;
            try {
                if (typeof outputData === 'string') outputData = JSON.parse(outputData);
            } catch (e) {
                console.log("⚠️ Data 不是 JSON 字符串，按对象处理");
            }

            // 🌟 核心修复：加入了 'image' 这个字段名 (对应您的截图)
            // Coze 有时候会把数组转成字符串，所以这里做了多重兼容
            let rawList = outputData.image || outputData.image_list || outputData.images || outputData.data || [];
            
            // 如果 Coze 返回的是字符串 "['url1', 'url2']"，需要再 parse 一次
            if (typeof rawList === 'string') {
                try { rawList = JSON.parse(rawList); } catch(e) { rawList = [rawList]; }
            }

            let finalImages = [];
            if (Array.isArray(rawList)) {
                finalImages = rawList.map(item => (typeof item === 'string' ? { url: item } : item));
            } else if (rawList) {
                // 如果只是单个字符串链接
                finalImages = [{ url: rawList }];
            }

            const responseForFrontend = {
                code: 200,
                msg: "Success from Coze",
                data: { image_list: finalImages }
            };

            console.log(`✅ 解析成功！提取到 ${finalImages.length} 张图片`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(responseForFrontend));

          } else {
            console.error(`❌ Coze 业务报错: ${result.msg}`);
            res.writeHead(500);
            res.end(JSON.stringify({ code: 500, msg: result.msg }));
          }
        } catch (error) {
          console.error(`❌ 代码解析错误:`, error);
          res.writeHead(500);
          res.end(JSON.stringify({ code: 500, msg: "Parse Error" }));
        }
      });
    });

    cozeReq.on('error', (e) => {
      console.error(`❌ 网络错误:`, e);
      res.writeHead(500);
      res.end(JSON.stringify({ code: 500, msg: "Network error" }));
    });

    cozeReq.write(requestData);
    cozeReq.end();

  } else {
    res.writeHead(404); res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`\n============================================`);
  console.log(`🤖 Coze 智能代理 (字段修复版) 已启动: http://localhost:${PORT}`);
  console.log(`👉 重点监测字段: image`);
  console.log(`============================================\n`);
});