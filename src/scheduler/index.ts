import { MessageProcessor } from '../processor';
import { MessageStorage } from '../storage';
import { DingBot } from '../bot';

export class TaskScheduler {
  private processor: MessageProcessor;
  private storage: MessageStorage;
  private bot: DingBot;
  private interval: NodeJS.Timeout | null = null;

  constructor(
    private config: {
      botToken: string;
      botSecret: string;
      intervalMs: number;
    }
  ) {
    this.processor = new MessageProcessor();
    this.storage = new MessageStorage();
    this.bot = new DingBot(
      `https://oapi.dingtalk.com/robot/send?access_token=${config.botToken}`,
      config.botSecret
    );
  }

  // 启动定时任务
  public startSchedule() {
    if (this.interval) {
      return;
    }

    // 立即执行一次
    this.analyze();

    // 设置定时任务
    this.interval = setInterval(() => {
      this.analyze();
    }, this.config.intervalMs);
  }

  // 停止定时任务
  public stopSchedule() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  // 手动触发分析
  public async analyze() {
    try {
      const messages = await this.storage.getAllMessages();
      let summary = '群消息分析报告：\n\n';
      
      // 按类型分组统计
      const typeStats: Record<string, number> = {};
      const priorityStats: Record<string, number> = {};
      
      for (const msg of messages) {
        if (msg.status === 'pending') {
          const processed = this.processor.process(msg.original);
          await this.storage.saveMessage(processed);
          
          // 统计消息类型
          typeStats[processed.type || '其他'] = (typeStats[processed.type || '其他'] || 0) + 1;
          // 统计优先级
          if (processed.content?.priority) {
            priorityStats[processed.content.priority] = (priorityStats[processed.content.priority] || 0) + 1;
          }
        }
      }

      // 生成统计报告
      summary += '【消息类型统计】\n';
      Object.entries(typeStats).forEach(([type, count]) => {
        summary += `${type}: ${count}条\n`;
      });
      
      summary += '\n【优先级分布】\n';
      Object.entries(priorityStats).forEach(([priority, count]) => {
        summary += `${priority}: ${count}条\n`;
      });

      // 发送报告
      await this.bot.sendMessage({
        original: {
          msgId: 'summary_' + Date.now(),
          content: summary,
          sender: {
            userId: 'system',
            name: '系统'
          },
          timestamp: Date.now(),
          groupId: 'system'
        },
        processed: summary,
        status: 'processed'
      });

      console.log('分析完成，报告已发送');
    } catch (error) {
      console.error('分析过程出错:', error);
    }
  }

  // 添加测试方法
  public async runTest() {
    // 模拟一些群消息
    const testMessages = [
      {
        msgId: 'test1',
        content: '@张三 系统很卡，影响了约50个用户的使用',
        sender: { userId: 'user1', name: '李四' },
        timestamp: Date.now(),
        groupId: 'test_group'
      },
      {
        msgId: 'test2',
        content: '建议增加批量导出功能，现在每次只能单个导出很麻烦',
        sender: { userId: 'user2', name: '王五' },
        timestamp: Date.now(),
        groupId: 'test_group'
      },
      {
        msgId: 'test3',
        content: '紧急！登录功能完全无法使用',
        sender: { userId: 'user3', name: '赵六' },
        timestamp: Date.now(),
        groupId: 'test_group'
      }
    ];

    // 存储测试消息
    for (const msg of testMessages) {
      await this.storage.saveMessage({
        original: msg,
        processed: msg.content,
        status: 'pending'
      });
    }

    // 触发分析
    await this.analyze();
  }
} 