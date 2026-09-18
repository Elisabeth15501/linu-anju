# 狸奴安居 · 适猫化装修建议小工具 🐾

![version](https://img.shields.io/badge/version-v0.1.0-FF9E7D) ![platform](https://img.shields.io/badge/小红书小工具-规范合规-7BA87B) [![License: MIT](https://img.shields.io/badge/License-MIT-E05A5A.svg)](LICENSE)

> 「溪柴火软蛮毡暖，我与狸奴不出门」—— 陆游

面向养猫人群的小红书小工具：输入户型、居住情况、猫咪习性和当前痛点，60 秒生成针对性的适猫化装修建议 + 避坑指南，一键生成专属海报。北极星是「给养猫人家居建议」，而非给户型打分。

## 功能

- **首页**：水墨萌宠风 Landing（CSS/SVG 手绘小猫 + 陆游诗句）
- **输入页**：实用面积滑块（🐟滑块头）、楼层结构、居住情况三问（居住人数 / 12 岁以下儿童 / 猫毛过敏，选填）、6 种猫咪习性多选、4 类装修痛点单选
- **结果页**：按画像生成的定制建议卡（痛点优先 + 习性 + 居住情况派生 + 兜底，最多 5 条）、6 篇避坑指南弹窗
- **海报**：Canvas 2D 原生绘制专属建议海报，支持保存到相册 / 发布小红书笔记（容器内）

## 建议引擎（buildAdvice）

按四级严重度排序输出，不再打分：

| 优先级 | 来源 | 示例 |
| --- | --- | --- |
| 1 | 当前痛点（单选） | 封窗 → 金刚网纱窗红线标准 |
| 2 | 猫咪习性（多选） | 乱尿 → 猫砂盆柜体 N+1 布局 |
| 3 | 居住情况（选填） | 有小孩 → 儿童与猫共处防护；有过敏者 → 防过敏选材；独居/一家人/合租 → 各自的丰容/动线/免打孔方案 |
| 4 | 兜底 | 动线、水电、有毒绿植预警 |

建议内容依据：猫砂盆 N+1 原则（ISFM）、金刚网封窗领养硬门槛（和猫住/猫德学院）、Fel d 1 过敏原环境控制（J Feline Med Surg）、猫听觉约为人的 6 倍（噪音应激源）、百合/天南星科植物毒性。

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
- **v0.1.0 版本内迭代（2026-09-18 之后，未发版）** — 删除安心指数，北极星转向「画像 → 定制建议」；新增居住情况三问（居住人数 / 12 岁以下儿童 / 猫毛过敏），建议引擎改为四级严重度排序（痛点 → 习性 → 居住派生 → 兜底，最多 5 条），全站文案从「鉴定」改为「建议」。

## 目录

```
├── index.html   # 入口（样式内联 <style>）
├── app.js       # 全部逻辑（ES2017，经典脚本）
├── assets/      # 小工具图标
├── LICENSE
└── README.md
```

## License

MIT © 2026 Elisabeth15501
