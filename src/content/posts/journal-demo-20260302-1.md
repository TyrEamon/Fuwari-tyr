---
title: 日志测试一：展览馆日志联通
published: 2026-03-02T20:10:00
description: 测试 journal 页面是否会读取 category=日志 的帖子并跳转到详情页。
category: 日志
image: ../assets/blogimg/1769529932865.webp
tags:
  - 日志
  - 测试
draft: false
lang: ""
---

今天先做联通测试：

1. 在 `src/content/posts/` 新建日志 md。
2. 设置 frontmatter 的 `category: 日志`。
3. 访问 `/journal/` 检查是否出现列表项并可点击进入详情。

如果这篇能在日志页显示并能点开，就说明“日志按帖子模型走”已经打通。
