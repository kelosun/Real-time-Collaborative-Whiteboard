# Real-time Collaborative Whiteboard

一个多人在线实时白板项目。当前版本先实现 **Phase 1 单人白板 MVP**：基础绘图、图形选择、拖拽、删除、撤销重做和本地保存。后续会逐步扩展到房间、实时同步、认证权限、数据库持久化和协同冲突处理。

完整阶段规划见 [docs/ROADMAP.md](docs/ROADMAP.md)。

## Frameworks

当前项目使用：

- **Next.js App Router**：负责应用路由、页面组织和构建流程
- **React**：负责白板界面和交互状态
- **TypeScript**：提供类型约束，降低图形数据和交互逻辑出错概率
- **SVG Canvas**：第一阶段用原生 SVG 实现绘图画布，便于理解图形模型和事件流
- **LocalStorage**：第一阶段用于浏览器本地自动保存，后续会替换为数据库持久化
- **lucide-react**：提供工具栏图标

暂未引入后端、数据库和实时协作服务。它们会在后续阶段加入。

## Architecture

当前架构是一个纯前端 MVP：

```txt
Browser
  |
  | Next.js App Router
  v
React Whiteboard UI
  |
  | pointer events
  v
SVG drawing surface
  |
  | shape state
  v
LocalStorage persistence
```

白板的核心数据是 `WhiteboardShape[]`。每个图形都有统一的 `id`，不同工具会生成不同类型的 shape：

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

## Project Structure

```txt
.
├── docs/
│   └── ROADMAP.md
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── components/
│       └── whiteboard/
│           ├── geometry.ts
│           ├── types.ts
│           ├── whiteboard.css
│           └── whiteboard.tsx
├── eslint.config.mjs
├── next.config.ts
├── package.json
└── tsconfig.json
```

目录说明：

- `docs/ROADMAP.md`：项目阶段目标和后续功能规划
- `src/app/layout.tsx`：Next.js 根布局和页面元信息
- `src/app/page.tsx`：首页入口，挂载白板组件
- `src/app/globals.css`：全局样式变量、背景和基础样式
- `src/components/whiteboard/whiteboard.tsx`：白板主组件，包含工具栏、画布事件、图形渲染和状态管理
- `src/components/whiteboard/whiteboard.css`：白板界面样式
- `src/components/whiteboard/types.ts`：白板工具、点位和图形类型定义
- `src/components/whiteboard/geometry.ts`：图形 ID、边界计算、移动和尺寸归一化等几何工具函数

## Getting Started

安装依赖：

```bash
npm install
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

## Current Usage

打开页面后可以直接使用白板：

- 点击左侧工具切换选择、画笔、矩形、圆形和直线
- 使用颜色按钮切换描边颜色
- 使用线宽滑杆调整画笔或图形线宽
- 绘制完成后会自动切换到选择工具
- 选择图形后可以拖拽移动或删除
- 使用撤销 / 重做恢复操作
- 浏览器刷新后会从 LocalStorage 恢复本地白板内容

## Current Limits

第一阶段聚焦单人白板体验，暂不包含：

- 登录认证
- 多人实时同步
- 后端 API
- 数据库存储
- 权限系统
- 图片上传
- 历史版本
