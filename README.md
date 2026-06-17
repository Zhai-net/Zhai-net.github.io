# 翟志刚课题组网站

这是一个面向 GitHub Pages 的纯静态课题组网站。页面运行时不依赖前端框架、图标库或外部字体；内容、页面结构、样式和交互分别维护，并通过无第三方依赖的 Node.js 脚本生成最终发布文件。

## 维护原则

- **不要直接修改生成文件**：根目录的 `*.html`、`assets/css/global.css`、`assets/js/common.js`、`assets/js/render.js`、`assets/js/statistics.js` 和 `assets/data/site.js` 均由构建脚本生成。
- **内容与代码分离**：成员、论文、新闻和图库条目放在 `assets/data/`；站点级信息放在 `site.config.mjs`。
- **浏览器仍加载单文件资源**：CSS 和通用 JavaScript 虽然在源码中按职责拆分，但发布时分别合并为单个文件，不增加运行时请求数。
- **修改后先检查再提交**：运行 `npm run check`，可同时检查生成文件是否最新、JavaScript 语法、HTML 结构、本地资源路径和数据字段。

## 目录结构

```text
.
├── site.config.mjs          # 站点名称、邮箱、链接、页面元信息、构建清单
├── src/
│   ├── pages/               # 各页面独有的正文片段
│   ├── partials/            # 主题初始化和公共 UI
│   ├── templates/           # HTML 文档模板
│   ├── css/                 # 按职责拆分的 CSS 源码
│   └── js/
│       ├── common/          # 导航、主题、灯箱、动画、搜索等通用交互
│       ├── render/          # 人员、论文、新闻、图库的数据渲染
│       └── statistics.js    # 页底统计和访问地图延后加载
├── assets/data/             # 可直接编辑的内容数据
├── scripts/
│   ├── build.mjs            # 生成 HTML、CSS、JS 和 site.js
│   └── validate.mjs         # 静态质量检查
├── .github/workflows/       # GitHub Actions 自动检查
└── index.html 等            # 构建后发布文件
```

## 常见修改

### 修改站点名称、邮箱、页脚链接或更新时间

编辑：

```text
site.config.mjs
```

修改后执行：

```bash
npm run build
```

### 新增或修改成员

编辑：

```text
assets/data/people.js
```

要求：

- `id` 必须唯一；
- `category` 只能使用 `pi`、`postdoc`、`student`、`alumni`；
- 图片路径必须真实存在；
- 有邮箱时应使用完整邮箱地址；
- `homepage: false` 可阻止成员出现在首页，但仍保留在成员页。

### 新增论文

编辑：

```text
assets/data/publications.js
```

建议完整填写：

```text
year / authors / title / journal / detail / doi / doiUrl / featured
```

论文页的年份分组、编号、关键词检索和 DOI 按钮会自动更新。

### 修改新闻或图库

编辑：

```text
assets/data/news.js
assets/data/gallery.js
```

### 修改页面正文

编辑对应源码：

```text
src/pages/index.html
src/pages/people.html
src/pages/publications.html
src/pages/news.html
```

页头、页脚、主题按钮、返回顶部和图片灯箱不应复制进页面片段，它们由构建系统统一生成。

### 修改样式

编辑 `src/css/` 中对应文件，不要直接改 `assets/css/global.css`。职责说明见 `src/css/README.md`。

### 修改交互

- 通用交互：`src/js/common/`
- 数据渲染：`src/js/render/`
- 访问统计：`src/js/statistics.js`

职责说明见 `src/js/README.md`。

## 构建与检查

需要 Node.js 20 或更新版本，不需要执行 `npm install`，因为构建和检查脚本不依赖第三方 npm 包。

```bash
# 重新生成发布文件
npm run build

# 检查 HTML、JS、CSS、数据和资源路径
npm run validate

# 确认生成文件未被手工改动，并执行全部检查
npm run check
```

GitHub Actions 会在 push 和 pull request 时自动运行 `npm run check`。如果直接在 GitHub 网页中修改源码，也应同步提交构建后的发布文件，否则检查会提示生成文件过期。

## 图片与性能

- 成员照片优先使用 WebP；
- 建议人物照片控制在约 `400 × 500 px`、单张 `50–120 KB`；
- 正文实验照片建议宽度 `1200–1600 px`、单张 `150–350 KB`；
- 动态生成图片默认启用 `loading="lazy"`、`decoding="async"` 和低优先级加载；
- 首屏校徽和校名保持立即加载；
- 不蒜子与 MapMyVisitors 仅在页底统计区接近视口后加载。

## 全球访问地图

地图承载页为：

```text
assets/mapmyvisitors.html
```

MapMyVisitors 的脚本参数必须直接在该文件中修改。该脚本可能使用 `document.write()`，因此不要把它改成在主页中动态插入的普通脚本；当前同域 iframe 方案用于兼容其加载方式并避免阻塞首屏。

不蒜子地址和地图承载页路径集中在 `site.config.mjs` 的 `statistics` 字段中。

## 部署

网站仍可直接使用 GitHub Pages 从仓库根目录发布。`src/`、`scripts/` 和配置文件不会被页面主动加载，不影响访问速度；浏览器只请求构建后的 HTML、CSS、JavaScript、数据和图片资源。
