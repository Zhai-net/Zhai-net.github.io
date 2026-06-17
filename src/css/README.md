# CSS 源码分层

这些文件按顺序合并为 `assets/css/global.css`。发布页面只加载合并后的一个 CSS 文件。

- `00-foundation.css`：设计变量、基础重置、页面背景、页头和全局原子规则；
- `10-home-layout.css`：首页各主要区块、卡片和基础页脚；
- `20-subpages.css`：子页面结构、目录页和早期响应式规则；
- `30-publications-career.css`：论文分组和经历模块；
- `40-interactions.css`：灯箱、按钮、检索、导航辅助和交互状态；
- `50-people-footer.css`：成员、毕业生、友情链接和固定数量网格；
- `60-media-performance.css`：图片比例、第三方 iframe 隔离和性能规则；
- `70-polish-accessibility.css`：视觉精修、触屏适配、无障碍偏好和统计区域。

修改后运行：

```bash
npm run build
```

新增规则时优先放入职责最接近的文件，避免在文件末尾继续追加“临时覆盖”。确需覆盖时，应在注释中说明覆盖原因和对应组件。
