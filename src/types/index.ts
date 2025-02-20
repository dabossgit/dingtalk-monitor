export interface DingMessage {
  msgId: string;
  content: string;
  sender: {
    userId: string;
    name: string;
  };
  timestamp: number;
  groupId: string;
}

export interface AnalyzedMessage {
  type: '功能需求' | '技术问题' | '运营问题' | '用户反馈' | '其他';
  content: {
    summary: string;      // 问题概述
    detail: string;       // 详细内容
    priority: 'P0' | 'P1' | 'P2' | 'P3';  // 优先级
    impact: {
      userCount?: number;  // 影响用户数
      percentage?: string; // 影响用户占比
    }
  };
  reporter: {
    name: string;
    role: string;
  };
  status: '待处理' | '处理中' | '已解决';
  createTime: number;
  originalMessage: DingMessage;
}

export interface CollectorConfig {
  count: number;         // 获取消息数量
  groupId: string;       // 钉钉群ID
  accessToken: string;   // 访问令牌
}

export interface ProcessedMessage {
  original: DingMessage;
  processed: string;
  status: 'pending' | 'processed' | 'failed';
  type?: string;
  content?: {
    summary: string;
    detail: string;
    priority: 'P0' | 'P1' | 'P2' | 'P3';
    impact: {
      userCount?: number;
      percentage?: string;
    }
  };
  reporter?: {
    name: string;
    role: string;
  };
} 