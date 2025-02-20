import express from 'express';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import { MessageCollector } from '../collector';

export class WebhookServer {
  private app: express.Application;
  private collector: MessageCollector;
  private secret: string;

  constructor(port: number, secret: string) {
    this.app = express();
    this.collector = new MessageCollector();
    this.secret = secret;

    this.setupMiddleware();
    this.setupRoutes();
    this.startServer(port);
  }

  private setupMiddleware() {
    this.app.use(bodyParser.json());
  }

  private verifySignature(timestamp: string, sign: string): boolean {
    const stringToSign = `${timestamp}\n${this.secret}`;
    const hmac = crypto.createHmac('sha256', this.secret);
    hmac.update(stringToSign);
    const signature = hmac.digest('base64');
    return signature === sign;
  }

  private setupRoutes() {
    this.app.post('/webhook', async (req, res) => {
      const { timestamp, sign } = req.headers;
      
      // 验证签名
      if (!timestamp || !sign || !this.verifySignature(timestamp as string, sign as string)) {
        res.status(401).send('Unauthorized');
        return;
      }

      try {
        const message = await this.collector.handleNewMessage(req.body);
        console.log('收到新消息:', message);
        res.status(200).send('success');
      } catch (error) {
        console.error('处理消息失败:', error);
        res.status(500).send('处理消息失败');
      }
    });
  }

  private startServer(port: number) {
    this.app.listen(port, () => {
      console.log(`Webhook 服务器运行在端口 ${port}`);
    });
  }
} 