# JavaScript 源码分层

## `common/`

通用交互以独立初始化函数组织，并合并为 `assets/js/common.js`：

- `utils.js`：查询、文本标准化、低功耗判断和复制文本工具；
- `navigation.js`：移动端导航；
- `theme.js`：主题切换；
- `scroll-ui.js`：滚动进度与返回顶部；
- `cursor-particles.js`、`flow-background.js`：轻量背景动画；
- `lightbox.js`：图片预览；
- `person-cards.js`：成员卡片翻转；
- `reveal.js`：进入视口动画；
- `section-navigator.js`：首页分区导航；
- `publications.js`：论文搜索和年份高亮；
- `email-copy.js`：复制邮箱；
- `hash-links.js`：动态生成区块的锚点恢复；
- `main.js`：统一初始化入口。

交互尽量采用事件委托，并通过 `data-*` 标记避免重复初始化。

## `render/`

数据渲染模块合并为 `assets/js/render.js`：

- `utils.js`：数据读取、HTML 转义和安全 URL；
- `people.js`：负责人、成员、毕业生；
- `gallery.js`：图库；
- `news.js`：时间轴；
- `publications.js`：首页代表论文和论文目录；
- `site-meta.js`：站点级动态文本；
- `main.js`：统一渲染入口并派发 `zhai:content-rendered` 事件。

通用交互既会在首次加载时扫描页面，也会监听 `zhai:content-rendered`，因此渲染脚本与交互脚本之间没有脆弱的隐式时序依赖。
