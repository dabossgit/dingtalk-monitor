import { DingMessage, ProcessedMessage } from './types';
import { MessageStorage } from './storage';
import { MessageProcessor } from './processor';
import { DingBot } from './bot';
import { TaskScheduler } from './scheduler';
import dotenv from 'dotenv';

const storage = new MessageStorage();
const processor = new MessageProcessor();
const bot = new DingBot(
  'https://oapi.dingtalk.com/robot/send?access_token=b5850beaefe31d19000c3c136607c127c37b6f945a5ccb1712c254c5a38279af',
  'SECa60481680b6325834c87ea3cd4f125972e6d6f96bf1f64ae7b93457421888c00'
);

const SECRET = 'SECa60481680b6325834c87ea3cd4f125972e6d6f96bf1f64ae7b93457421888c00';
const PORT = 3000;

// 加载环境变量
dotenv.config();

// 创建调度器实例
const scheduler = new TaskScheduler({
  botToken: process.env.DINGTALK_BOT_TOKEN || 'b5850beaefe31d19000c3c136607c127c37b6f945a5ccb1712c254c5a38279af',
  botSecret: process.env.DINGTALK_BOT_SECRET || 'SECa60481680b6325834c87ea3cd4f125972e6d6f96bf1f64ae7b93457421888c00',
  intervalMs: parseInt(process.env.MESSAGE_FETCH_INTERVAL || '300000') // 5分钟
});

// 处理命令行参数
const args = process.argv.slice(2);
if (args.includes('--analyze')) {
  // 手动触发分析
  console.log('手动触发消息分析...');
  scheduler.analyze().then(() => {
    console.log('手动分析完成');
    process.exit(0);
  });
} else if (args.includes('--test')) {
  // 运行测试消息
  console.log('运行测试消息...');
  scheduler.runTest().then(() => {
    console.log('测试完成');
    process.exit(0);
  });
} else {
  // 启动定时任务
  scheduler.startSchedule();
  console.log('定时任务已启动，每隔', Math.floor(parseInt(process.env.MESSAGE_FETCH_INTERVAL || '300000') / 60000), '分钟执行一次分析');
}

// 定时处理
async function processMessages() {
  try {
    // 获取最近消息
    const messages: ProcessedMessage[] = storage.getAllMessages();
    
    // 处理每条消息
    for (const msg of messages) {
      if (msg.status === 'pending') {
        const processed = processor.process(msg.original);
        await storage.saveMessage(processed);
        
        if (processed.status === 'processed') {
          await bot.sendMessage(processed);
        }
      }
    }
  } catch (error) {
    console.error('处理消息失败:', error);
  }
}

// 每5分钟执行一次
setInterval(processMessages, 5 * 60 * 1000);

// 立即执行一次
processMessages();

// 测试消息处理和发送
async function testMessageProcess() {
  // 模拟一些群消息
  const testMessages: DingMessage[] = [
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
    }
  ];

  try {
    console.log('开始处理测试消息...');
    
    for (const msg of testMessages) {
      // 存储原始消息
      await storage.saveMessage({
        original: msg,
        processed: msg.content,
        status: 'pending'
      });
    }

    // 处理消息
    const messages: ProcessedMessage[] = storage.getAllMessages();
    let summary = '最近消息汇总：\n\n';

    for (const msg of messages) {
      if (msg.status === 'pending') {
        const processed = processor.process(msg.original);
        await storage.saveMessage(processed);
        
        summary += `【${processed.type}】\n`;
        summary += `问题：${processed.content?.summary}\n`;
        summary += `提出人：${processed.reporter?.name}\n`;
        summary += `优先级：${processed.content?.priority}\n`;
        if (processed.content?.impact.userCount) {
          summary += `影响用户数：${processed.content.impact.userCount}\n`;
        }
        summary += '-------------------\n';
      }
    }

    // 发送汇总消息
    await bot.sendMessage({
      original: testMessages[0], // 使用第一条消息作为原始消息
      processed: summary,
      status: 'processed'
    });

    console.log('消息处理完成，已发送汇总');
  } catch (error) {
    console.error('测试失败:', error);
  }
}

// 运行测试
testMessageProcess(); 