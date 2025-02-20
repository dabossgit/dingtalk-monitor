# DingTalk Monitor

钉钉群消息监控助手 - 自动监控群消息并智能整理汇总。

## 功能特性

### 1. 消息监控
- 自动监控指定钉钉群的聊天记录
- 支持多群监控（可配置）
- 本地消息存储和管理

### 2. 智能整理
- 自动识别消息类型（功能需求/技术问题/运营问题/用户反馈）
- 智能提取关键信息（优先级/影响范围/提出人）
- 结构化整理群消息内容

### 3. 消息推送
- 通过钉钉机器人自动推送整理后的内容
- 支持自定义推送模板
- 支持多种消息格式（文本/Markdown）

### 4. 触发方式
- 定时任务：自动定期整理推送（默认每4小时）
- 手动触发：支持通过命令触发即时整理
- 自定义触发间隔

## 快速开始

### 1. 安装

```shell
git clone https://github.com/yourusername/dingtalk-monitor.git
cd dingtalk-monitor
npm install
```

### 2. 配置

```shell
cp .env.example .env
# 编辑 .env 文件，填入你的钉钉机器人配置
```

### 3. 运行

```shell
# 启动定时任务
npm start

# 手动触发分析
npm run analyze

# 运行测试消息
npm run test-messages
```

## 配置说明

### 环境变量
- `DINGTALK_BOT_TOKEN`: 钉钉机器人的 access_token
- `DINGTALK_BOT_SECRET`: 钉钉机器人的加签密钥
- `MESSAGE_FETCH_INTERVAL`: 消息获取间隔（毫秒）
- `MAX_MESSAGES_PER_FETCH`: 每次获取消息数量

## 开发

### 项目结构

```
src/
├── examiner/     # 消息监听模块
├── processor/    # 消息处理模块
├── storage/      # 本地存储模块
├── bot/         # 钉钉机器人模块
└── scheduler/   # 定时任务模块
```

## License

MIT
