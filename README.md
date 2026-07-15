# Real-time Collaborative Whiteboard

一个多人在线实时白板项目。当前版本推进到 **Phase 2 房间和基础后端**：支持创建白板房间、房间列表、按房间打开白板，并通过 API 将白板数据保存到 PostgreSQL。后续会继续扩展实时同步、认证权限和协同冲突处理。

完整阶段规划见 [docs/ROADMAP.md](docs/ROADMAP.md)。

## Frameworks

当前项目使用：

- **Next.js App Router**：负责应用路由、页面组织和构建流程
- **React**：负责白板界面和交互状态
- **TypeScript**：提供类型约束，降低图形数据和交互逻辑出错概率
- **SVG Canvas**：第一阶段用原生 SVG 实现绘图画布，便于理解图形模型和事件流
- **Next.js Route Handlers**：提供房间列表、创建房间、读取白板和保存白板的 API
- **Prisma**：数据库 ORM 和类型安全的数据访问层
- **PostgreSQL**：保存白板房间和图形数据
- **LocalStorage**：仍保留给本地模式使用，房间模式已经使用数据库保存
- **lucide-react**：提供工具栏图标

暂未引入 WebSocket、认证和多人实时协作服务。它们会在后续阶段加入。

## Architecture

当前架构：

```txt
Browser
  |
  | Next.js App Router
  v
React pages and whiteboard UI
  |
  | fetch
  v
Next.js Route Handlers
  |
  | Prisma Client
  v
PostgreSQL
```

白板房间数据保存在 `WhiteboardRoom` 表中。白板画布的核心字段是 `shapes`，类型是 `WhiteboardShape[]`，在 PostgreSQL 中以 JSON 保存。每个图形都有统一的 `id`，不同工具会生成不同类型的 shape：

- `pen`：由多个点组成的自由绘制路径
- `rectangle`：矩形
- `ellipse`：圆形 / 椭圆
- `line`：直线

当前交互状态主要分为：

- 当前工具：选择、画笔、矩形、圆形、直线
- 图形列表：画布上已经提交的对象
- 草稿图形：正在绘制但尚未提交的对象
- 选中图形：用于拖拽和删除
- 历史栈：用于撤销 / 重做

当前主要路由：

- `/`：跳转到 `/boards`
- `/boards`：白板房间列表和创建入口
- `/boards/[boardId]`：指定房间的白板页面

当前 API：

- `GET /api/boards`：获取房间列表
- `POST /api/boards`：创建白板房间
- `GET /api/boards/[boardId]`：读取单个白板房间
- `PATCH /api/boards/[boardId]`：保存白板名称或图形数据

## Project Structure

```txt
.
├── docs/
│   └── ROADMAP.md
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── boards/
│   │   ├── boards/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── components/
│       ├── boards/
│       └── whiteboard/
│           ├── geometry.ts
│           ├── types.ts
│           ├── whiteboard.css
│           └── whiteboard.tsx
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── prisma.config.ts
└── tsconfig.json
```

目录说明：

- `docs/ROADMAP.md`：项目阶段目标和后续功能规划
- `prisma/schema.prisma`：Prisma 数据模型，当前包含 `WhiteboardRoom`
- `prisma.config.ts`：Prisma 7 配置，读取 `DATABASE_URL`
- `src/app/api/boards/route.ts`：房间列表和创建房间 API
- `src/app/api/boards/[boardId]/route.ts`：单个白板房间读取和保存 API
- `src/app/boards/page.tsx`：房间列表页面
- `src/app/boards/[boardId]/page.tsx`：房间白板页面
- `src/app/layout.tsx`：Next.js 根布局和页面元信息
- `src/app/page.tsx`：首页入口，跳转到 `/boards`
- `src/app/globals.css`：全局样式变量、背景和基础样式
- `src/components/boards/boards-dashboard.tsx`：房间列表、刷新和创建表单
- `src/components/boards/board-room.tsx`：房间白板数据加载和保存逻辑
- `src/components/boards/boards.css`：房间相关页面样式
- `src/components/whiteboard/whiteboard.tsx`：白板主组件，包含工具栏、画布事件、图形渲染和状态管理
- `src/components/whiteboard/whiteboard.css`：白板界面样式
- `src/components/whiteboard/types.ts`：白板工具、点位和图形类型定义
- `src/components/whiteboard/geometry.ts`：图形 ID、边界计算、移动和尺寸归一化等几何工具函数
- `src/lib/prisma.ts`：Prisma Client 单例
- `src/lib/whiteboard-shapes.ts`：白板图形数据校验和解析工具

## Getting Started

安装依赖：

```bash
npm install
```

启动 PostgreSQL：

```bash
docker compose up -d postgres
```

配置环境变量：

```bash
cp .env.example .env
```

然后根据你的 PostgreSQL 修改 `.env` 中的连接串：

```txt
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/realtime_whiteboard?schema=public"
```

生成 Prisma Client：

```bash
npm run db:generate
```

创建数据库表：

```bash
npm run db:migrate
```

启动开发服务器：

```bash
npm run dev
```

访问：

```txt
http://localhost:3000
```

生产构建检查：

```bash
npm run build
```

打开 Prisma Studio 查看数据：

```bash
npm run db:studio
```

然后根据终端输出的地址手动访问，例如：

```txt
http://localhost:5555
```

如果想固定使用 `5555` 端口：

```bash
npm run db:studio:5555
```

如果看到 `EADDRINUSE`，说明该端口已经有 Studio 或其他服务在运行，直接打开已有地址，或先停掉占用端口的进程。

## Deploying To Vercel

Vercel 不能访问你本机 Docker 里的 PostgreSQL。部署时需要准备一个云数据库，并在 Vercel 项目中配置环境变量：

```txt
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

推荐数据库：

- Neon
- Supabase
- Railway PostgreSQL
- Vercel Marketplace 里的 PostgreSQL 服务

第一次连接云数据库后，需要把 migration 应用到云数据库：

```bash
npm run db:deploy
```

如果要在本地对云数据库执行这一步，可以临时把 `.env` 中的 `DATABASE_URL` 改成云数据库连接串，然后运行上面的命令。

Vercel 默认构建命令保持：

```bash
npm run build
```

停止本地 PostgreSQL 容器：

```bash
docker compose stop postgres
```

如果要删除容器和数据库数据：

```bash
docker compose down -v
```

## Current Usage

打开页面后可以直接使用白板：

- 访问 `/boards` 创建白板房间
- 点击房间进入 `/boards/[boardId]`
- 点击左侧工具切换选择、画笔、矩形、圆形和直线
- 使用颜色按钮切换描边颜色
- 使用线宽滑杆调整画笔或图形线宽
- 绘制完成后会自动切换到选择工具
- 选择图形后可以拖拽移动或删除
- 使用撤销 / 重做恢复操作
- 房间模式会自动通过 API 保存到 PostgreSQL

## Current Limits

第二阶段聚焦房间和基础持久化，暂不包含：

- 登录认证
- 多人实时同步
- 权限系统
- 图片上传
- 历史版本
