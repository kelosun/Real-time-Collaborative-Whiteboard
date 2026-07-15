# Whiteboard Roadmap

## Phase 1: 单人白板 MVP

目标：先把基础白板体验做出来，让项目有一个可以运行、可以演示的核心界面。

功能范围：

- 创建一个默认白板
- 支持画笔、矩形、圆形、直线
- 支持选择、拖拽移动、删除
- 支持撤销、重做、清空
- 支持颜色和线宽设置
- 支持本地自动保存和刷新恢复


## Phase 2: 房间和基础后端

目标：让白板从本地工具变成有房间概念的 Web 应用。

功能范围：

- [x] 创建白板房间
- [x] 房间列表
- [x] 白板数据保存到 PostgreSQL
- [x] Prisma 数据模型
- [x] 基础 API 路由
- [x] 游客昵称进入房间

技术栈：

- PostgreSQL
- Prisma
- Next.js Route Handlers 或独立 NestJS/Fastify 服务

## Phase 3: 实时协作

目标：支持多人同时进入同一个白板并看到彼此操作。

功能范围：

- Socket.IO 实时连接
- 加入 / 离开房间
- 在线用户列表
- 他人光标位置
- 图形创建、更新、删除同步
- 断线重连后的房间状态恢复

支持事件：

- `room:join`
- `cursor:move`
- `shape:create`
- `shape:update`
- `shape:delete`
- `board:sync`

## Phase 4: 认证和权限

目标：让白板真正属于用户或团队。

功能范围：

- 登录 / 注册
- GitHub 或邮箱登录
- 我的白板列表
- 白板所有者
- 查看 / 编辑权限
- 邀请链接
- 操作审计日志

技术栈：

- Auth.js / NextAuth.js
- PostgreSQL
- RBAC 权限模型

## Phase 5: 协同冲突优化

目标：解决多人同时操作、离线恢复和复杂同步问题。

功能范围：

- 引入 Yjs
- CRDT 文档模型
- Awareness 在线状态
- 增量 update 持久化
- 多端状态合并
- Redis Pub/Sub 支持多实例广播

技术栈：

- Yjs
- y-websocket 或自定义 Socket.IO provider
- Redis

## Phase 6: 产品化能力

目标：把项目从演示应用升级为可用产品。

功能范围：

- 导出 PNG / PDF
- 图片上传
- 模板
- 评论
- 历史版本
- 快捷键
- 缩放和平移
- 性能优化
- Docker 部署

技术栈：

- Cloudflare R2 / S3
- Redis
- Docker
- CI/CD
