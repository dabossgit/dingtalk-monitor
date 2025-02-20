import Database from 'better-sqlite3';
import { DingMessage, ProcessedMessage } from '../types';

// 定义数据库行的接口
interface MessageRow {
  msgId: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  groupId: string;
  processed: string;
  status: string;
}

export class MessageStorage {
  private db: Database.Database;

  constructor() {
    this.db = new Database('messages.db');
    this.init();
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        msgId TEXT PRIMARY KEY,
        content TEXT,
        senderId TEXT,
        senderName TEXT,
        timestamp INTEGER,
        groupId TEXT,
        processed TEXT,
        status TEXT
      )
    `);
  }

  saveMessage(message: ProcessedMessage) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO messages 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      message.original.msgId,
      message.original.content,
      message.original.sender.userId,
      message.original.sender.name,
      message.original.timestamp,
      message.original.groupId,
      message.processed,
      message.status
    );
  }

  getAllMessages(): ProcessedMessage[] {
    const rows = this.db.prepare('SELECT * FROM messages').all() as MessageRow[];
    return rows.map(row => ({
      original: {
        msgId: row.msgId,
        content: row.content,
        sender: {
          userId: row.senderId,
          name: row.senderName
        },
        timestamp: row.timestamp,
        groupId: row.groupId
      },
      processed: row.processed,
      status: row.status as 'pending' | 'processed' | 'failed'
    }));
  }

  getMessagesByUser(userId: string): ProcessedMessage[] {
    const rows = this.db.prepare('SELECT * FROM messages WHERE senderId = ?').all(userId) as MessageRow[];
    return this.mapRowsToMessages(rows);
  }

  getMessagesByTimeRange(start: number, end: number): ProcessedMessage[] {
    const rows = this.db.prepare('SELECT * FROM messages WHERE timestamp BETWEEN ? AND ?').all(start, end) as MessageRow[];
    return this.mapRowsToMessages(rows);
  }

  private mapRowsToMessages(rows: MessageRow[]): ProcessedMessage[] {
    return rows.map(row => ({
      original: {
        msgId: row.msgId,
        content: row.content,
        sender: {
          userId: row.senderId,
          name: row.senderName
        },
        timestamp: row.timestamp,
        groupId: row.groupId
      },
      processed: row.processed,
      status: row.status as 'pending' | 'processed' | 'failed'
    }));
  }
} 