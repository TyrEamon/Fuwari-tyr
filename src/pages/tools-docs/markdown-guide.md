---
layout: ../../layouts/ToolsDocsLayout.astro
title: Markdown 语法速查（本博客版）
description: 汇总这个博客当前可用的 Markdown、卡片指令、数学公式、HTML 嵌入等写法，附代码与预览示例。
subtitle: 适合日常写文时快速查阅。大部分代码块都自带复制按钮（由站点代码高亮组件提供）。
badgeLabel: 语法速查
badgeIcon: "fa6-solid:file-code"
toolboxTags:
  - Docs
  - Markdown
  - Cheatsheet
toolboxActionLabel: 打开语法速查
toolboxOrder: 30
---

## 使用说明

- 本页主要展示 **这个博客当前能用** 的写法（不追求所有 Markdown 方言）。
- 每节通常都包含两部分：
  - **代码（可复制）**
  - **预览（实际渲染效果）**
- `src/content/posts/*.md` 会进入首页文章流；`src/pages/tools-docs/*.md` 不会进入首页文章流。

---

## 1）Frontmatter（头部信息）

### 1.1 普通博客文章（会显示在首页）

**代码（可复制）**

```md
---
title: 示例文章标题
published: 2026-02-25
description: 一句话摘要
tags:
  - Markdown
  - 示例
category: 教程
image: /random/h
---

正文开始...
```

### 1.2 工具文档页（不进入首页文章流）

**代码（可复制）**

```md
---
layout: ../../layouts/ToolsDocsLayout.astro
title: 文档标题
description: 文档说明
subtitle: 这页主要写什么
badgeLabel: 工具文档
badgeIcon: "fa6-solid:book"
---

## 正文开始
```

---

## 2）标题、段落、换行、分隔线

**代码（可复制）**

```md
# 一级标题
## 二级标题
### 三级标题

这是第一段。

这是第二段（段落之间空一行）。

这一行末尾加两个空格会换行。  
这里是同一段内换行后的内容。

---
```

**预览**

# 一级标题（预览）
## 二级标题（预览）
### 三级标题（预览）

这是第一段。

这是第二段（段落之间空一行）。

这一行末尾加两个空格会换行。  
这里是同一段内换行后的内容。

---

## 3）文字样式（强调、删除线、行内代码）

**代码（可复制）**

```md
**粗体**
*斜体*
***粗斜体***
~~删除线~~
`行内代码`

你也可以组合：**这是 `重点代码` 示例**
```

**预览**

**粗体**  
*斜体*  
***粗斜体***  
~~删除线~~  
`行内代码`

你也可以组合：**这是 `重点代码` 示例**

---

## 4）链接、图片、外链

### 4.1 普通链接

**代码（可复制）**

```md
[打开首页](/)
[打开展览馆](/exhibition/)
[外部链接（图站）](https://rapi.kyr.us.ci/gallery.html)
```

**预览**

[打开首页](/)  
[打开展览馆](/exhibition/)  
[外部链接（图站）](https://rapi.kyr.us.ci/gallery.html)

### 4.2 图片（Markdown 语法）

**代码（可复制）**

```md
![示例图片](/wallpaper-sync-placeholder.svg)
```

**预览**

![示例图片](/wallpaper-sync-placeholder.svg)

---

## 5）列表（无序 / 有序 / 任务列表）

**代码（可复制）**

```md
- 无序列表 A
- 无序列表 B
  - 二级列表 B-1
  - 二级列表 B-2

1. 有序列表 1
2. 有序列表 2
3. 有序列表 3

- [x] 已完成事项
- [ ] 待办事项
```

**预览**

- 无序列表 A
- 无序列表 B
  - 二级列表 B-1
  - 二级列表 B-2

1. 有序列表 1
2. 有序列表 2
3. 有序列表 3

- [x] 已完成事项
- [ ] 待办事项

---

## 6）引用与提示块（Callout / Admonition）

### 6.1 普通引用

**代码（可复制）**

```md
> 这是一段普通引用。
> 第二行引用内容。
```

**预览**

> 这是一段普通引用。
> 第二行引用内容。

### 6.2 GitHub 风格提示块（已启用）

> 这是你这个博客当前可用的写法（`remark-github-admonitions`）。

**代码（可复制）**

```md
> [!NOTE]
> 这是一个 Note 提示块。
>
> 适合写补充说明。
```

**预览**

> [!NOTE]
> 这是一个 Note 提示块。
>
> 适合写补充说明。

### 6.3 指令式提示块（已启用）

> 这是另一套写法（directive + 自定义组件）。

**代码（可复制）**

````md
:::tip
这是一个 Tip 提示块。

- 可以写列表
- 可以写 **强调**
:::
````

**预览**

:::tip
这是一个 Tip 提示块。

- 可以写列表
- 可以写 **强调**
:::

也支持这些类型（示例名）：

```md
:::note ... :::
:::important ... :::
:::warning ... :::
:::caution ... :::
```

---

## 7）表格

**代码（可复制）**

```md
| 名称 | 类型 | 说明 |
| --- | --- | --- |
| 展览馆 | 页面 | 聚合展示入口 |
| 工具箱 | 页面 | 功能页与文档入口 |
| 画廊 | 页面 | 图片瀑布流展示 |
```

**预览**

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| 展览馆 | 页面 | 聚合展示入口 |
| 工具箱 | 页面 | 功能页与文档入口 |
| 画廊 | 页面 | 图片瀑布流展示 |

---

## 8）代码块（语法高亮 / 复制按钮）

这个博客的代码块由 Expressive Code 渲染，通常会带复制按钮。

### 8.1 JavaScript 示例

**代码（可复制）**

````md
```js
const msg = "Hello, Markdown";
console.log(msg);
```
````

**预览**

```js
const msg = "Hello, Markdown";
console.log(msg);
```

### 8.2 Bash / Shell 示例

**代码（可复制）**

````md
```bash
pnpm install
pnpm dev
```
````

**预览**

```bash
pnpm install
pnpm dev
```

> 提示：如果某些语言名不被高亮器识别，会降级成普通文本显示（例如你之前遇到过 `env`）。

---

## 9）数学公式（KaTeX）

你这个博客启用了 `remark-math + rehype-katex`。

### 9.1 行内公式

**代码（可复制）**

```md
这是一个行内公式：$E = mc^2$。
```

**预览**

这是一个行内公式：$E = mc^2$。

### 9.2 块级公式

**代码（可复制）**

```md
$$
\int_0^1 x^2 \, dx = \frac{1}{3}
$$
```

**预览**

$$
\int_0^1 x^2 \, dx = \frac{1}{3}
$$

---

## 10）自定义卡片指令（本博客已支持）

### 10.1 GitHub 仓库卡片 `::github`

**代码（可复制）**

```md
::github{repo="Spr-Aachen/Twilight"}
```

**预览**

::github{repo="Spr-Aachen/Twilight"}

### 10.2 音乐卡片 `::music`

#### 简写（推荐）

**代码（可复制）**

```md
::music{netease="1390882521"}
```

**预览**

::music{netease="1390882521"}

#### 原始 meting 链接（兼容）

**代码（可复制）**

```md
::music{meting="https://api.i-meto.com/meting/api?server=netease&type=song&id=1390882521"}
```

### 10.3 URL 卡片 `::url`

**代码（可复制）**

```md
::url{href="https://rapi.kyr.us.ci/gallery.html"}
```

**预览**

::url{href="https://rapi.kyr.us.ci/gallery.html"}

---

## 11）HTML 嵌入（可直接写）

> 一般 Astro Markdown 页面支持写原生 HTML。适合做折叠块、嵌入视频、iframe 等。

### 11.1 折叠块 `<details>`

**代码（可复制）**

````md
<details>
  <summary>点我展开</summary>
  <p>这里可以放补充说明、排查步骤、临时记录。</p>
</details>
````

**预览**

<details>
  <summary>点我展开</summary>
  <p>这里可以放补充说明、排查步骤、临时记录。</p>
</details>

### 11.2 iframe（例如视频嵌入）

**代码（可复制）**

````md
<iframe
  width="100%"
  height="420"
  src="https://www.youtube.com/embed/yrn7eInApnc"
  title="YouTube video player"
  frameborder="0"
  allowfullscreen
></iframe>
````

**预览（示例）**

<iframe
  width="100%"
  height="420"
  src="https://www.youtube.com/embed/yrn7eInApnc"
  title="YouTube video player"
  frameborder="0"
  allowfullscreen
></iframe>

> 如果嵌入失败，通常是目标站点禁止被 iframe 引用（不是 Markdown 语法问题）。

---

## 12）常见坑（你自己写文时很容易踩）

### 12.1 指令写在代码块里不会生效

```md
::music{netease="1390882521"}
```

如果放在代码块里，它只会显示文本，不会渲染卡片。

### 12.2 `::music` / `::github` 建议单独占一行

虽然有时写在段落里也能工作，但单独一行更稳定、更好看。

### 12.3 `tools-docs` 和 `posts` 的用途不要混

- 想进首页文章流：`src/content/posts/*.md`
- 只想放工具箱文档：`src/pages/tools-docs/*.md`（并使用 `ToolsDocsLayout`）

---

## 13）一份可直接复制的模板（tools-docs 文档）

**代码（可复制）**

````md
---
layout: ../../layouts/ToolsDocsLayout.astro
title: 文档标题
description: 一句话描述
subtitle: 这页主要讲什么
badgeLabel: 工具文档
badgeIcon: "fa6-solid:book"
---

## 概述

写你这页的用途。

## 用法

```bash
示例命令
```

## 示例

::github{repo="Spr-Aachen/Twilight"}
````

---

如果你后面给博客再加新的指令（比如 `::music` 简写扩展、更多卡片），建议顺手把这页也更新成你的“语法总表”。
