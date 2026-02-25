---
layout: ../../layouts/ToolsDocsLayout.astro
title: "::music 音乐卡片用法"
description: "在文章中使用 ::music 指令插入音乐卡片。"
subtitle: "支持网易云 / QQ / 酷狗简写写法，也兼容原始 meting 链接写法。"
badgeLabel: "Markdown 音乐卡片"
badgeIcon: "fa6-solid:music"
toolboxTags:
  - Docs
  - Music
  - Markdown
toolboxActionLabel: 打开文档
toolboxOrder: 20
---

## 快速开始（网易云单曲）

```md
::music{netease="1390882521"}
```

从网易云链接里取歌曲 `id` 即可，例如：`https://music.163.com/#/song?id=1390882521`。

## 支持的简写形式

```md
::music{netease="1390882521"}
::music{netease="playlist:123456789"}
::music{netease="album:123456"}
::music{netease="artist:123456"}

::music{qq="123456"}
::music{kugou="123456"}
```

## 原始 meting 链接写法（仍然支持）

```md
::music{meting="https://api.i-meto.com/meting/api?server=netease&type=song&id=1390882521"}
```

## 自定义 meting API（可选）

```md
::music{netease="1390882521" metingApi="https://your-meting-api.example.com/meting/api"}
```

如果默认公共 meting 服务不稳定、被限流或不可用，可以换成你自己的 meting 接口。

## 使用说明

- 把指令写在普通 Markdown 段落中（不要写在代码块里）。
- meting 接口无法访问时，卡片可能会显示加载中或错误状态。
- 这是文章内容卡片，和后续可能添加的悬浮播放器是独立功能。

## 实际示例

::music{netease="1390882521"}
