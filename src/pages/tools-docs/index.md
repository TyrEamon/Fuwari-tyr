---
layout: ../../layouts/ToolsDocsLayout.astro
title: 工具文档目录
description: 不进入首页文章流的工具文档页面入口。
subtitle: 这里的页面写在 /src/pages/tools-docs/ 下，适合放工具说明、部署笔记和内部文档。
badgeLabel: 文档目录
badgeIcon: "fa6-solid:book"
toolboxIcon: "fa6-solid:book-open"
toolboxTags:
  - Docs
  - Index
  - Toolbox
toolboxActionLabel: 打开文档中心
toolboxOrder: 0
---

## 这类页面适合放什么

- 单个工具的使用说明
- 部署步骤与环境变量记录
- 不希望出现在首页文章流里的功能文档

## 和首页文章的区别

- 首页会显示的博客文章：写在 `src/content/posts/*.md`
- 工具箱专用文档页面：写在 `src/pages/tools-docs/*.md`

## 当前文档

- [短链生成器文档](/tools-docs/shortlink/)
- [音乐卡片用法（::music）](/tools-docs/music-card/)
- [Markdown 语法速查（本博客版）](/tools-docs/markdown-guide/)

## 建议写法（Markdown）

```md
---
layout: ../../layouts/ToolsDocsLayout.astro
title: 文档标题
subtitle: 一句话说明这页写什么
badgeLabel: 工具文档
badgeIcon: fa6-solid:book
---

## 正文开始
```
