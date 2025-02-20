import { DingMessage, CollectorConfig } from '../types';
import { MessageStorage } from '../storage';

export class MessageCollector {
  private storage: MessageStorage;

  constructor() {
    this.storage = new MessageStorage();
  }

  // 接收新消息
  async handleNewMessage(message: any) {
    const dingMessage: DingMessage = {
      msgId: message.msgId,
      content: message.text.content,
      sender: {
        userId: message.senderId,
        name: message.senderNick
      },
      timestamp: Date.now(),
      groupId: message.conversationId
    };

    // 存储消息
    await this.storage.saveMessage({
      original: dingMessage,
      processed: dingMessage.content,
      status: 'pending'
    });

    return dingMessage;
  }

  // 获取最近的消息
  async getRecentMessages(count: number = 30) {
    return this.storage.getAllMessages().slice(0, count);
  }
} 