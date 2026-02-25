---
layout: ../../layouts/ToolsDocsLayout.astro
title: 短链生成器文档
description: /tools-docs/ 下的示例文档页面。
subtitle: 适合记录某个工具页的使用说明、部署步骤与注意事项，不进入首页文章流。
badgeLabel: 工具文档示例
badgeIcon: "fa6-solid:link"
toolboxTags:
  - Docs
  - Toolbox
  - Shortlink
toolboxActionLabel: 打开文档
toolboxOrder: 10
---

## 什么时候适合用这种路由

- 工具使用说明
- 单个工具页的部署笔记
- 不希望出现在首页文章列表里的内部文档

## 首页文章应该写到哪里

写在 `src/content/posts/*.md` 的文章会进入首页文章流。  
写在 `src/pages/tools-docs/*.md` 的文档页不会进入首页文章流。

## 示例入口

- [返回工具箱](/toolbox/)
- [首页文章示例（OpenList 美化教程）](/posts/openlist-theme/)
- [文档目录](/tools-docs/)

## 后续可扩展字段（建议）

你可以在文档里固定写这些内容，方便自己维护：

- 功能简介
- 使用步骤
- 部署环境（Node / Python / Docker 等）
- 配置项与变量说明
- 常见报错与排查
- 更新记录
