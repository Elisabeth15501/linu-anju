# 狸奴安居 · 适猫化装修安全鉴定器 🐾

![version](https://img.shields.io/badge/version-v0.1.0-FF9E7D) ![platform](https://img.shields.io/badge/小红书小工具-规范合规-7BA87B) [![License: MIT](https://img.shields.io/badge/License-MIT-E05A5A.svg)](LICENSE)

> 「溪柴火软蛮毡暖，我与狸奴不出门」—— 陆游

面向「养猫 + 准备装修」人群的小红书小工具：60 秒鉴定你家装修方案对猫的友好程度，输出安心指数 + 核心建议 + 避坑指南，一键生成专属海报。

## 功能

- **首页**：水墨萌宠风 Landing（CSS/SVG 手绘小猫 + 陆游诗句）
- **输入页**：实用面积滑块（🐟滑块头）、楼层结构、6 种猫咪习性多选、4 类装修痛点单选
- **结果页**：猫咪安心指数 0-100（炸毛 ⚡ → 警惕 👀 → 打盹 😌 → 躺平 🍃 四档小猫）、3 条针对性建议卡、6 篇避坑指南弹窗
- **海报**：Canvas 2D 原生绘制专属报告海报，支持保存到相册 / 发布小红书笔记（容器内）

## 打分逻辑（calculateScore）

| 维度 | 影响 |
| --- | --- |
| 实用面积 8-80㎡ | 最多 +18 分 |
| Loft / 复式（垂直空间） | +10 / +14 分 |
| 习性：爱跑酷 -10 · 乱尿 -12 · 破坏王 -9 · 喜高处 -6 · 粘人 -2 | 习性越多扣越多 |
| 痛点：封窗 -12 · 家具/猫砂盆 -8 · 美学 -3 | 按紧急度扣分 |

## 小红书小工具规范合规（重点）

本仓库产物按《小工具容器能力清单》（2026-09-10 版）逐条校验：

- ✅ 纯本地离线运行，**零网络请求、零外部 CDN**（无 Tailwind / html2canvas）
- ✅ 脚本外置 `app.js`（经典脚本，非 module），全部事件 `addEventListener`，无内联 `<script>` / `onclick=`
- ✅ JS 为 **ES2017** 子集（无可选链 / 空值合并 / 对象展开），兼容 Android 8.1 Chrome 61 WebView 基线
- ✅ CSS 无 Flex `gap`（margin 基线）、Grid 间距用 `grid-gap`、`backdrop-filter` 包裹在 `@supports` 增强层并保留实色遮罩回退
- ✅ 海报用 **Canvas 2D 原生绘制**（替代 html2canvas），`toDataURL` 输出完整 `data:uri`
- ✅ 保存图片走 `window.xhs.miniTool.writeTempFile` → `saveImageToPhotosAlbum`；发布走 `postNote`；未注入 SDK 的环境自动降级为页内长按保存，不做 `a[download]`
- ✅ 资源全部为相对路径 / `data:` URI，无 `<base>`、iframe、自建 CSP

## 版本历史

- **v0.1.0（2026-09-18）· MVP 首发版** — 三页流程、安心指数打分 + 四档小猫状态、3 条核心建议 + 6 篇避坑指南、Canvas 2D 海报（存相册/发笔记）；通过小工具规范静态合规扫描。📝 [Release Notes](https://github.com/Elisabeth15501/linu-anju/releases/tag/v0.1.0) · 📎 [下载 zip](https://github.com/Elisabeth15501/linu-anju/releases/download/v0.1.0/linu-anju-minitool.zip)

## 目录

```
├── index.html   # 入口（样式内联 <style>）
├── app.js       # 全部逻辑（ES2017，经典脚本）
├── LICENSE
└── README.md
```

## License

MIT © 2026 Elisabeth15501
