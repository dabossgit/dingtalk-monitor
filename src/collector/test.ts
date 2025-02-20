import { MessageCollector } from './index';

const config = {
  count: 30,
  groupId: '',  // 会自动获取
  accessToken: '', // 需要获取应用的 access_token，而不是机器人的 token
};

async function getAccessToken() {
  try {
    const response = await fetch(
      'https://oapi.dingtalk.com/gettoken',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        // 需要填写应用的 appKey 和 appSecret
        body: JSON.stringify({
          appkey: '你的应用的 AppKey',
          appsecret: '你的应用的 AppSecret'
        })
      }
    );

    const data = await response.json();
    if (!data.access_token) {
      throw new Error('获取 access_token 失败');
    }
    return data.access_token;
  } catch (error) {
    console.error('获取 access_token 失败:', error);
    throw error;
  }
}

async function testCollector() {
  const collector = new MessageCollector();
  
  // 模拟接收消息
  const testMessage = {
    msgId: 'test_' + Date.now(),
    text: {
      content: '这是一条测试消息'
    },
    senderId: 'test_user',
    senderNick: 'Test User',
    conversationId: 'test_group'
  };

  try {
    await collector.handleNewMessage(testMessage);
    
    // 获取最近消息
    const messages = await collector.getRecentMessages(3);
    console.log('最近的消息:', messages);
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testCollector(); 