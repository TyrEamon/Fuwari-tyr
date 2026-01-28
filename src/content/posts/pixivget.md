---
title: Pixiv 收藏本地下载器（Python）随手记
published: 2026-01-27T21:10:00
description: 记录我用 Python 把 Pixiv 收藏下载到本地的过程，附上配置说明和一些个人踩坑感受。
image: ""
tags:
  - 工具
  - 折腾记录
  - Python
  - Pixiv
draft: false
lang: ""
---

> 说明：本文只是个人学习 + 本地备份记录，请遵守 Pixiv 使用条款，不要二次分发。

## 1) 这个小工具能做什么？

这是一个 **Pixiv 收藏本地下载器（Python 版）**，我拿来做本地备份。功能不花哨，但很实用：

- 按用户收藏下载（支持标签筛选）
- 自动分页抓取
- 失败重试 + 节流（避免过快）
- 已下载自动跳过（history 去重）
- 可按标签生成独立历史文件

> **配图建议**：
> 图1：运行命令截图  
> 图2：下载目录结果截图  
> 图3：config.json 配置截图  

---

## 2) 项目结构一览

`pixiv_local/` 里主要是这几样：

- `main.py`：主程序
- `config.json`：配置文件
- `history_*.json`：下载历史（去重）
- `run.bat`：一键运行脚本

---

## 3) 使用步骤（小白版）

### ① 安装依赖
```bash
pip install requests
```

### ② 填写配置文件 `config.json`
重点字段（别怕，填对这几个就能跑）：

```json
{
  "php_sessid": "你的PHPSESSID",
  "user_id": "你的Pixiv用户ID",
  "tag": "H",
  "limit": 40,
  "max_pages": 0,
  "download_dir": "D:/代转图片/h"
}
```

### ③ 运行
```bash
python main.py
```
或者直接双击 `run.bat`（更懒人友好）。

---

## 4) 配置项说明（精简版）

- **php_sessid**：Pixiv 登录后 cookie 里的 `PHPSESSID`
- **user_id**：你的 Pixiv 用户 ID
- **tag**：收藏标签，留空=全部收藏
- **limit**：每页抓取数量（默认 40）
- **max_pages**：抓取页数（0=一直翻页）
- **download_dir**：保存目录

### 频率与稳定性相关（别开太猛）
- `sleep_between_images_sec`：每张图间隔
- `sleep_between_pages_sec`：每页间隔
- `retry_times`：失败重试次数
- `retry_delay_sec`：重试等待
- `max_consecutive_skips`：连续跳过多少张后自动停止

---

## 5) 去重机制（重点）

- 下载文件名格式：`pixiv_{id}_p{n}.ext`
- 已下载的文件会写入 `history_*.json`
- 同一标签会独立生成历史文件：
  - 例如 `tag=H` → `history_H.json`
- 当 `tag` 为空时，会合并所有 `history_*.json` 作为全局去重池

---

## 6) 细节与限制（别踩坑）

- **动图（ugoira）会被跳过**
- 需要登录 Cookie（请勿泄露）
- Pixiv 可能会限速或断开，建议保留延迟

---

## 7) 我自己的小习惯

我一般这样跑，稳一点：
- 每轮抓 40 张
- 每页间隔 10 秒
- 遇到失败允许重试 3 次
- 连续跳过 200 张就停止

这样对 Pixiv 压力小，也不容易被断。

---

## 8) 小结

这个脚本对我来说就是个“本地收藏备份器”，
核心就三个词：**稳、能断、能去重**。

如果你也只是想把收藏图放到本地，
这套已经够用。

# —— 记录完毕 ——
