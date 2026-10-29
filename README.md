# 时空智能物联网系统

一个基于参考视频重建的行业知识管理与智能问答前端。项目使用 React、TypeScript 和 Ant Design，覆盖数据集管理、知识库导入、文档切片、智能体广场、知识检索问答、引用溯源、配置中心和问答记录。

当前版本是可在浏览器中独立运行的本地演示系统，不依赖后端服务，也不调用外部大模型 API。

## 功能

- 数据集管理：分类树、名称/格式/状态筛选、分页、启停和删除。
- 本地文本上传：支持 TXT、Markdown、CSV、JSON，单文件不超过 2 MB。
- 文档预览与下载：查看导入文本并下载当前实际内容。
- 知识库管理：知识库启停、文档列表、导入来源选择。
- 知识切片：自动切块、关键词提取、启停和编辑。
- 智能体广场：搜索、分类筛选、详情弹窗和快捷体验。
- 知识问答：基于当前启用的知识库和文档进行本地文本检索。
- 引用溯源：展示引用列表，并定位原文中的匹配片段；编辑后无法匹配原文时会明确标注为切片预览。
- 问答记录：搜索历史会话、查看消息并继续问答。
- 本地持久化：使用 `localStorage` 保存数据、会话和设置。
- 响应式与可访问性：支持窄屏、短屏、键盘焦点和减少动态效果偏好。

## 技术栈

| 类别 | 技术 |
| --- | --- |
| UI | React 19、Ant Design 6、Ant Design Icons |
| 路由 | React Router 7 |
| 构建 | Vite 8、TypeScript 6 |
| 单元测试 | Vitest、Testing Library、jsdom |
| 端到端测试 | Playwright、Chromium |
| 代码质量 | ESLint |

## 快速开始

建议使用 Node.js 22 或兼容的新版本。

```bash
npm install
npm run dev
```

默认访问地址：

```text
http://localhost:5173/
```

服务默认监听 `0.0.0.0`。如果局域网访问不需要，可将开发命令改为仅监听本机。

## 常用命令

```bash
npm run dev        # 启动开发服务器
npm run build      # 类型检查并生成生产构建
npm run lint       # 运行 ESLint
npm test           # 运行 Vitest 单元测试
npm run test:watch # 监听模式运行单元测试
npm run test:e2e   # 运行 Playwright 浏览器测试
```

首次运行 Playwright 时，如果本机没有对应浏览器内核，需要先安装：

```bash
npx playwright install chromium
```

## 页面与路由

| 路径 | 页面 |
| --- | --- |
| `/datasets` | 数据集管理 |
| `/datasets/:id` | 数据集正文预览 |
| `/knowledge` | 知识库管理 |
| `/knowledge/import` | 导入知识 |
| `/knowledge/:id` | 知识库文档列表 |
| `/knowledge/:id/chunks/:documentId` | 文档切片列表 |
| `/agents` | 智能体广场 |
| `/agents/:id/chat` | 智能体问答 |
| `/settings` | 配置中心 |
| `/records` | 问答记录 |

访问根路径会重定向到 `/datasets`。

## 推荐体验流程

1. 在「数据集管理」上传一个 TXT 或 Markdown 文件。
2. 打开「知识库管理」，选择目标知识库并导入已解析的数据集。
3. 进入知识库详情，查看文档和切片；可编辑或启停切片。
4. 进入「智能体广场」，体验「自然资源智能问答」。
5. 输入与国家自然资源政策相关的问题，查看回答和引用列表。
6. 点击引用查看原文高亮，随后在「问答记录」中继续历史会话。

## 数据与持久化

应用状态定义在 [`src/types.ts`](./src/types.ts)，初始化示例数据位于 [`src/data/fixtures.ts`](./src/data/fixtures.ts)。

持久化键：

```text
industry-llm-platform-state-v1
```

保存前会经过结构校验。损坏、不完整或带有非法树形字段的持久化数据会回退到初始状态，避免页面崩溃。浏览器存储失败时，应用会保留当前内存状态并显示错误提示，不会错误提示保存成功。

如需清除本地演示数据，可通过浏览器开发者工具删除对应站点数据，或执行：

```js
localStorage.removeItem('industry-llm-platform-state-v1');
```

## 目录结构

```text
.
├── e2e/                     # Playwright 端到端测试
├── src/
│   ├── components/          # 全局布局、上传弹窗、引用面板等
│   ├── context/             # 应用状态上下文与持久化调度
│   ├── data/                # 初始业务数据
│   ├── lib/                 # reducer、切块、检索、校验和存储
│   ├── pages/               # 路由页面
│   ├── App.tsx              # 路由与主题配置
│   ├── main.tsx             # 应用入口
│   ├── styles.css           # 全局布局和业务样式
│   └── types.ts             # 领域类型
├── AGENTS.md                # 后续开发代理的项目约束
├── DESIGN.md                # 架构与视觉设计说明
└── SECURITY.md              # 安全模型与漏洞报告说明
```

## 已知边界

- 没有后端、数据库、账号体系和权限控制。
- 不调用 DeepSeek、Qwen 或其他大模型；模型选项仅保存为界面配置。
- 文本上传会读取文件内容，但不会执行文件中的任何代码。
- PDF、DOCX 等文件只作为演示数据出现，当前不提供真实格式解析。
- 问答基于中文关键词和二字符重合度排序，不具备语义嵌入或生成式推理能力。
- 所有数据保存在当前浏览器；清理站点数据或更换浏览器后会丢失。
- 生产构建存在单个 Ant Design 主包较大的提示，不影响功能，但后续可通过路由懒加载拆分。

## 安全与设计文档

- 开发约束与验证要求：[AGENTS.md](./AGENTS.md)
- 安全模型与漏洞报告：[SECURITY.md](./SECURITY.md)
- 架构、视觉和交互设计：[DESIGN.md](./DESIGN.md)

## 许可证

仓库当前未声明开源许可证。在添加明确许可证前，不应推断其可被复制、修改或再分发。
