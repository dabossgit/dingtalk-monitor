import { ProcessedMessage } from '../types';
import crypto from 'crypto';

export class DingBot {
  private webhook: string;
  private secret: string;
  
  constructor(webhook: string, secret: string) {
    this.webhook = webhook;
    this.secret = secret;
  }

  private getSignature(timestamp: number): string {
    const stringToSign = `${timestamp}\n${this.secret}`;
    const hmac = crypto.createHmac('sha256', this.secret);
    hmac.update(stringToSign);
    return encodeURIComponent(hmac.digest('base64'));
  }

  async sendMessage(message: ProcessedMessage) {
    const timestamp = Date.now();
    const sign = this.getSignature(timestamp);
    const url = `${this.webhook}&timestamp=${timestamp}&sign=${sign}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        msgtype: 'text',
        text: {
          content: message.processed
        }
      })
    });
    
    return response.ok;
  }
} 