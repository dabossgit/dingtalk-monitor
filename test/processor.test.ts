import { MessageProcessor } from '../src/processor';
import { DingMessage } from '../src/types';

describe('MessageProcessor', () => {
  let processor: MessageProcessor;

  beforeEach(() => {
    processor = new MessageProcessor();
  });

  test('should correctly identify message type', () => {
    const message: DingMessage = {
      msgId: 'test1',
      content: '系统很卡，影响了约50个用户的使用',
      sender: { userId: 'user1', name: '测试用户' },
      timestamp: Date.now(),
      groupId: 'test_group'
    };

    const result = processor.process(message);
    expect(result.type).toBe('技术问题');
    expect(result.content?.priority).toBe('P1');
  });
}); 