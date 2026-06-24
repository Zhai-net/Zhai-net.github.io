# 翟志刚课题组网站

中国科学技术大学翟志刚课题组静态网站。网站用于展示课题组简介、研究方向、教学内容、实验平台、成员、论文、新闻与联系方式，可直接部署到 GitHub Pages。

网站不依赖前端框架和构建工具。HTML、CSS、JavaScript 与内容数据均保存在仓库中，更新后提交即可发布。

## 页面

| 文件                                         | 内容                                                                           |
| -------------------------------------------- | ------------------------------------------------------------------------------ |
| `index.html` / `index-en.html`               | 中英文首页：课题组简介、研究方向、教学、平台、成果、成员、新闻、招生与访问统计 |
| `people.html` / `people-en.html`             | 中英文成员与毕业生名录                                                         |
| `publications.html` / `publications-en.html` | 中英文论文列表、年份索引与检索                                                 |
| `news.html` / `news-en.html`                 | 中英文课题组新闻与时间轴                                                       |
| `preview_render.html`                        | 首页结构预览文件，保留用于检查基础布局                                         |

## 目录结构

```text
.
├── index.html
├── index-en.html
├── people.html
├── people-en.html
├── publications.html
├── publications-en.html
├── news.html
├── news-en.html
├── preview_render.html
├── assets
│   ├── css
│   │   ├── global.css          # 基础样式、布局、组件和响应式规则
│   │   └── refinement.css      # 视觉细节与页面级覆盖
│   ├── data
│   │   ├── site.js             # 网站名称、更新时间、外部链接等全局信息
│   │   ├── i18n.js             # 英文动态内容与交互文案
│   │   ├── people.js           # 成员与毕业生
│   │   ├── publications.js     # 论文
│   │   ├── news.js             # 新闻
│   │   └── gallery.js          # 首页图集
│   ├── js
│   │   ├── core.js             # 查询、文本处理等公共工具
│   │   ├── render.js           # 将 data 目录中的内容渲染到页面
│   │   ├── common.js           # 导航、主题、检索、图片预览等通用交互
│   │   ├── polish.js           # 页眉状态、入场节奏和图片加载状态
│   │   └── statistics.js       # 不蒜子与访问地图的延迟加载
│   ├── gallery                 # 图集图片
│   ├── results                 # 首页顶部实验结果图片（静态/动态 WebP）
│   ├── logos                   # 校徽与校名图片
│   └── portraits               # 成员照片
└── tools
    └── check_site.py           # 本地结构与 JavaScript 语法检查
```

## 本地预览

在项目根目录运行：

```bash
python3 -m http.server 8000
```

浏览器打开：

```text
http://localhost:8000/
```

不要直接双击 HTML 文件预览。使用本地 HTTP 服务可以避免浏览器对本地资源、剪贴板和第三方脚本的限制。

## 中英文页面维护

网站采用独立静态页面提供中英文版本，导航栏中的 `EN / 中文` 按钮负责切换，并保留当前页面的锚点位置。对应关系如下：

- `index.html` ↔ `index-en.html`；
- `people.html` ↔ `people-en.html`；
- `publications.html` ↔ `publications-en.html`；
- `news.html` ↔ `news-en.html`。

首页、页眉、页脚等固定文字分别维护在对应 HTML 文件中。成员、图库、新闻以及 JavaScript 交互产生的英文文字集中维护在 `assets/data/i18n.js`。新增成员或新闻时，应同时在原始数据文件和 `i18n.js` 中补充英文内容。论文题目和作者信息本身采用英文，不需要重复维护。

所有中英文页面均包含 `hreflang` 声明，新增页面时应同时建立中英文文件、语言切换按钮和对应的内部链接。

## 内容维护

日常更新优先修改 `assets/data/`，不要在多个 HTML 页面中重复录入同一内容。

### 更新成员

编辑 `assets/data/people.js`。每位成员是一个对象，常用字段如下：

```js
{
  id: "jiaxuan-li",
  name: "李佳轩",
  nameEn: "Jiaxuan Li",
  title: "博士研究生",
  role: "Ph.D. Student",
  category: "student",
  homepage: true,
  image: "assets/portraits/jiaxuan-li.webp",
  imageAlt: "李佳轩照片",
  bio: "研究方向说明。",
  shortBio: "首页使用的简短说明。",
  email: "name@ustc.edu.cn",
  website: "https://example.com"
}
```

维护规则：

- `id` 必须唯一，建议使用小写英文和连字符。
- `category` 使用 `pi`、`postdoc`、`student` 或 `alumni`。
- `homepage: false` 可将非毕业生成员从首页隐藏，但仍保留在成员页。
- 照片建议使用 WebP，文件名与 `id` 一致；没有照片时使用 `portrait-placeholder.jpg`。
- 毕业生可补充 `graduation` 和 `destination` 字段。
- 个人主页使用可选的 `website` 字段；不要把 HTML 链接直接写入 `name`。

### 更新论文

编辑 `assets/data/publications.js`，新论文通常添加在数组前部：

```js
{
  year: 2026,
  authors: "Author A, Author B",
  title: "Paper title",
  journal: "Journal Name",
  detail: "Volume, Article number",
  doi: "10.xxxx/xxxxx",
  doiUrl: "https://doi.org/10.xxxx/xxxxx",
  featured: false
}
```

论文页会自动完成以下工作：

- 按年份倒序分组；
- 生成年份索引；
- 生成连续编号；
- 将标题、作者、期刊、年份和 DOI 纳入检索；
- 统计当前检索结果数量。

将 `featured` 设为 `true` 可在首页代表论文区域显示。首页最多展示四篇；没有设置代表论文时，默认取列表前四篇。

### 更新新闻

编辑 `assets/data/news.js`：

```js
{
  date: "2026.06",
  title: "新闻标题",
  description: "补充说明",
  home: true
}
```

首页显示最新三条，新闻页显示全部条目。建议按时间倒序排列。

### 更新首页实验图像

首页顶部实验结果条使用 `assets/results/` 中的图片。展示区保持统一图像高度，每张卡片根据原始宽高比使用独立宽度，不对图片横向拉伸，也不在两侧添加留白。

静态图片建议保存为 WebP。GIF 建议转为动态 WebP，以保留循环动画并显著减小体积：

```bash
ffmpeg -i input.gif -an -c:v libwebp_anim -lossless 0 -quality 82 -compression_level 6 -loop 0 output.webp
```

替换图片后，应同步核对 `index.html` 中两组连续滚动图片的文件名、`alt`、`width`、`height` 与对应的 `result-size-*` 尺寸类。尺寸类集中定义在 `assets/css/refinement.css` 的首页实验图像区域。

### 更新图集

将图片放入 `assets/gallery/`，然后编辑 `assets/data/gallery.js`：

```js
{
  title: "Shock Tube",
  description: "激波管与界面实验平台",
  image: "assets/gallery/shock-tube.webp",
  alt: "激波管实验平台"
}
```

`alt` 用于无障碍访问和图片无法加载时的替代文字，应准确说明图片内容。

### 更新网站信息

编辑 `assets/data/site.js`。常用项目包括：

- `lastUpdated`：页脚更新时间，格式建议为 `YYYY-MM-DD`；
- `labName`、`labNameEn`：课题组中英文名称；
- `contactEmail`：统一联系邮箱；
- `links`：教师主页、Google Scholar、学校、院系及友情链接。带有 `data-site-link` 的页面链接会自动从这里读取 URL，避免在多个页面重复修改。

## 样式维护

`global.css` 保存基础设计系统和组件规则，`refinement.css` 保存后续视觉调整。修改时遵循以下约定：

1. 颜色、阴影、圆角和页面宽度优先使用已有 CSS 变量。
2. 通用组件写入 `global.css`；只针对当前版式的覆盖写入 `refinement.css`。
3. 不在 HTML 中添加行内样式。
4. 不随意修改数据渲染所依赖的类名和 `data-*` 属性。
5. 新增响应式规则时，先检查现有的 `1050px`、`860px`、`720px`、`640px` 和 `540px` 断点。
6. 修改后同时检查浅色模式、深色模式、桌面端和移动端。
7. 英文版按钮使用 `white-space: nowrap` 保持完整标签；新增较长英文按钮时优先调整内边距或容器断点，不要单独缩小字号。
8. 英文排版与主题检查集中在 `refinement.css` 的 “Bilingual typography” 区域，论文检索深色模式也在该区域统一维护。

## JavaScript 维护

各脚本职责已经分开：

- 公共工具放在 `core.js`；
- 数据到 HTML 的转换放在 `render.js`；
- 英文动态内容和交互文案放在 `assets/data/i18n.js`；
- 用户操作和页面交互放在 `common.js`；
- 非必要的展示增强放在 `polish.js`；
- 第三方统计加载放在 `statistics.js`。

`core.js` 必须先于 `render.js` 和 `common.js` 加载。新增脚本时继续使用 `defer`，避免阻塞页面解析。

内容字段应先经过 `escapeHTML` 再写入模板。不要把未经处理的外部文本直接赋给 `innerHTML`。

## 访问统计

首页访问统计包含两项外部服务：

- 不蒜子：页面访问量与访客数；
- MapMyVisitors：全球访问来源地图。

两项服务均由 `assets/js/statistics.js` 延迟加载，只有访问统计区域接近视口时才发起请求。外部服务不可用时不影响网站其他内容。

相关配置位置：

- 不蒜子脚本地址：`index.html` 中 `#site-statistics` 的 `data-busuanzi-src`；
- 地图包装页：`assets/mapmyvisitors.html`；包装页和 `statistics.js` 会根据地图实际内容自动调整高度，避免 iframe 裁切；
- 地图入口：`index.html` 中 `data-mapmyvisitors-frame-src`。

## 检查

提交前运行：

```bash
python3 tools/check_site.py
```

检查内容包括：

- HTML 中重复的 `id`；
- HTML 引用的本地文件是否存在；
- `core.js` 的加载顺序；
- JavaScript 语法。

建议再手动检查：

- 中英文首页及各子页面是否正常打开；
- 导航、深浅色切换、返回顶部和图片预览是否正常；
- 成员卡片正反面与复制邮箱按钮是否正常；
- 论文检索、年份跳转和重新编号是否正常；
- 390 px 左右宽度下是否出现横向滚动条。

## 部署

仓库用于 GitHub Pages 时，将发布来源设置为默认分支根目录即可，不需要构建步骤。提交并推送后，GitHub Pages 会直接发布仓库中的静态文件。

正式发布前建议更新 `assets/data/site.js` 中的 `lastUpdated`，并运行一次本地检查。

## 作者

李佳轩
