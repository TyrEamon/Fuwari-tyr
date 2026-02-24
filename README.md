# RuneByte Blog（TyrEamon）

这是我的个人博客源码仓库，基于 `Fuwari` 深度改造，当前主要用于记录折腾过程、教程笔记、项目展示与日常内容。

在线站点（示例）：
- `https://i.kyr.us.ci`

## 说明

- 这是**个人使用中的博客仓库**，不是纯净模板仓库。
- 仓库内包含了我的配置、页面改造、导航结构、画廊页、展览馆入口、随机背景方案等。
- 如果你要二次 fork，建议先通读 `src/config.ts` 和 `src/layouts/Layout.astro`。

## 基础栈

- Astro 5
- Svelte 5
- Tailwind CSS
- Swup（页面切换）
- Fancybox（图片预览）
- Masonry / imagesLoaded（画廊瀑布流）
- Umami（统计）

## 我当前做过的主要改造（相对上游）

- 壁纸模式切换：`banner / fullscreen / none`
- 顶栏交互与透明模式联动（参考 Twilight 思路做适配）
- 开场动画（splash）与主题风格统一
- 展览馆页（`/exhibition/`）与画廊页（`/gallery/`）
- 随机图 API 接入（`/random/h`）
- Umami 分享统计接入（侧栏/文章页）
- 移动端导航交互优化（含资源折叠）

## 本地开发

环境要求：
- Node.js 18+
- pnpm

安装依赖：

```bash
pnpm install
```

启动开发：

```bash
pnpm dev
```

构建：

```bash
pnpm build
```

预览构建结果：

```bash
pnpm preview
```

## 常用脚本

```bash
pnpm new-post <slug>   # 新建文章
pnpm clean             # 清理未引用图片
pnpm del-space         # 清理图片文件名特殊字符/空格
pnpm format            # 格式化（Biome）
pnpm lint              # 检查并尝试修复（Biome）
```

## 关键配置位置

- 站点主配置：`src/config.ts`
- 全局布局与首屏逻辑：`src/layouts/Layout.astro`
- 顶栏：`src/components/Navbar.astro`
- 壁纸切换组件：`src/components/widget/WallpaperSwitch.svelte`
- 展览馆：`src/pages/exhibition.astro`
- 画廊：`src/pages/gallery.astro`

## 内容目录

- 文章：`src/content/posts/`
- 关于页：`src/content/spec/about.md`
- 图片资源：`src/content/assets/`（按需）

## 随机图相关（当前方案）

博客背景与部分页面图片依赖外部随机图接口（我自用）：
- `https://rapi.0w0.us.ci`

当前博客使用：
- `random.js`（在 `Layout.astro` 中引入）
- 随机图路径（配置中）默认走 `/random/h`

如果你 fork 后不用这套随机图接口，请优先修改：
- `src/config.ts` 的 `banner.src` / `background.src`
- `src/layouts/Layout.astro` 中的随机图脚本引用

## 部署说明（简要）

这是静态站点，`pnpm build` 后产物在 `dist/`，可部署到任意静态托管平台（例如 EdgeOne / Cloudflare Pages / Vercel / Netlify 等）。

## 致谢

- 上游主题：`saicaca/fuwari`
- 灵感参考（部分交互/视觉思路）：Twilight 主题项目

---

如果你是 fork 这个仓库做自己的博客，建议先改这三处：
1. `src/config.ts`（站点信息/导航/背景/统计）
2. `src/content/spec/about.md`（关于页）
3. `src/content/posts/`（删除我的文章，换成你的内容）
