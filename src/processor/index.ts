import { DingMessage, ProcessedMessage } from '../types';

export class MessageProcessor {
  public process(message: DingMessage): ProcessedMessage {
    const type = this.getMessageType(message.content);
    const content = {
      summary: this.getSummary(message.content),
      detail: message.content,
      priority: this.getPriority(message.content),
      impact: this.getImpact(message.content)
    };
    
    return {
      original: message,
      processed: this.formatMessage(type, content),
      status: 'processed',
      type,
      content,
      reporter: {
        name: message.sender.name,
        role: '群成员'
      }
    };
  }

  private getMessageType(content: string): string {
    if (content.includes('建议') || content.includes('功能')) return '功能需求';
    if (content.includes('卡') || content.includes('错误') || content.includes('bug')) return '技术问题';
    if (content.includes('用户') || content.includes('反馈')) return '用户反馈';
    return '其他';
  }

  private getSummary(content: string): string {
    return content.slice(0, 50) + (content.length > 50 ? '...' : '');
  }

  private getPriority(content: string): 'P0' | 'P1' | 'P2' | 'P3' {
    if (content.includes('严重') || content.includes('紧急')) return 'P0';
    if (content.includes('影响') || content.includes('问题')) return 'P1';
    if (content.includes('建议')) return 'P2';
    return 'P3';
  }

  private getImpact(content: string): { userCount?: number; percentage?: string } {
    const impact = {
      userCount: undefined as number | undefined,
      percentage: undefined as string | undefined
    };
    
    const userMatch = content.match(/影响[了]?(\d+)个用户/);
    if (userMatch) {
      impact.userCount = parseInt(userMatch[1]);
    }
    
    return impact;
  }

  private formatMessage(type: string, content: any): string {
    return `【${type}】\n问题：${content.summary}\n优先级：${content.priority}${content.impact.userCount ? `\n影响用户数：${content.impact.userCount}` : ''}`;
  }
} 